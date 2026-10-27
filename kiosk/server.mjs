import http from 'node:http';
import { readFile, writeFile, mkdir, rename, stat, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = process.env.KIOSK_ROOT || path.dirname(fileURLToPath(import.meta.url));
const origin = process.env.KIOSK_ORIGIN || 'https://schaufenster.vercel.app';
const port = Number(process.env.KIOSK_PORT || 4186);
const releases = path.join(root, 'releases');
const statePath = path.join(root, 'active.json');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
let active, previous = [], heartbeat = 0, browserStarted = Date.now(), lastProgress = '', progressChanged = 0, updating = false;
const log = async text => {
  const target = path.join(root, 'server.log');
  try {
    if ((await stat(target).catch(() => ({ size: 0 }))).size > 2e6) await rename(target, `${target}.old`).catch(() => {});
    await appendFile(target, `${new Date().toISOString()} ${text}\n`);
  } catch {}
};

export function validateManifest(manifest) {
  if (manifest?.schema !== 1 || !/^[a-f0-9]{64}$/.test(manifest.version) || !Array.isArray(manifest.files) || manifest.files.length > 200) throw new Error('Invalid manifest');
  const seen = new Set();
  let total = 0;
  for (const item of manifest.files) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(item.path) || item.path.startsWith('/') || item.path.split('/').some(part => !part || part === '.' || part === '..') || seen.has(item.path)) throw new Error('Invalid release path');
    if (!/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isInteger(item.size) || item.size < 1 || item.size > 20e6) throw new Error('Invalid file metadata');
    seen.add(item.path); total += item.size;
  }
  if (!seen.has('index.html') || total > 100e6 || sha(JSON.stringify(manifest.files)) !== manifest.version) throw new Error('Incomplete release');
  return manifest;
}

async function verifyRelease(manifest) {
  for (const item of manifest.files) {
    const bytes = await readFile(path.join(releases, manifest.version, item.path));
    if (bytes.length !== item.size || sha(bytes) !== item.sha256) throw new Error(`Corrupt file: ${item.path}`);
  }
}

async function saveState(next) {
  const temp = `${statePath}.tmp`;
  await writeFile(temp, JSON.stringify(next));
  await rename(temp, statePath);
}

async function loadState() {
  const saved = JSON.parse((await readFile(statePath, 'utf8')).replace(/^\uFEFF/, ''));
  for (const version of [saved.active, ...(saved.previous || [])]) {
    try {
      if (!/^[a-f0-9]{64}$/.test(version)) continue;
      const manifest = validateManifest(JSON.parse(await readFile(path.join(releases, version, 'offline-manifest.json'), 'utf8')));
      await verifyRelease(manifest);
      active = manifest;
      previous = [saved.active, ...(saved.previous || [])].filter(v => v !== version && /^[a-f0-9]{64}$/.test(v)).slice(0, 2);
      await log(`Serving verified local release ${version}`);
      return;
    } catch (error) { await log(`Local release rejected: ${error.message}`); }
  }
  throw new Error('No verified local release');
}

async function download(url, maximum) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000), cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  let length = 0; const chunks = [];
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > maximum) throw new Error('Download too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function syncRelease() {
  if (updating) return;
  updating = true;
  try {
    const manifest = validateManifest(JSON.parse((await download(`${origin}/offline-manifest.json`, 100000)).toString()));
    if (manifest.version === active?.version) return;
    const directory = path.join(releases, manifest.version);
    await mkdir(directory, { recursive: true });
    for (const item of manifest.files) {
      const bytes = await download(new URL(item.path, `${origin}/`), item.size);
      if (bytes.length !== item.size || sha(bytes) !== item.sha256) throw new Error(`Download verification failed: ${item.path}`);
      const target = path.join(directory, item.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, bytes);
    }
    await writeFile(path.join(directory, 'offline-manifest.json'), JSON.stringify(manifest));
    await verifyRelease(manifest);
    previous = [active?.version, ...previous].filter(Boolean).slice(0, 2);
    await saveState({ active: manifest.version, previous });
    active = manifest;
    await log(`Activated complete release ${manifest.version}`);
  } catch (error) { await log(`Update deferred; local release retained: ${error.message}`); }
  finally { updating = false; }
}

await mkdir(releases, { recursive: true });
await loadState().catch(async error => { await log(error.message); });
const client = await readFile(path.join(root, 'client.js'));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    response.setHeader('Cache-Control', 'no-store');
    if (url.pathname === '/__kiosk/client.js') {
      response.setHeader('Content-Type', mime['.js']); response.end(client); return;
    }
    if (url.pathname === '/__kiosk/heartbeat' && request.method === 'POST') {
      if (request.headers.origin !== `http://127.0.0.1:${port}`) { response.writeHead(403); response.end(); return; }
      let body = '';
      for await (const chunk of request) { body += chunk; if (body.length > 4096) throw new Error('Heartbeat too large'); }
      const data = JSON.parse(body);
      heartbeat = Date.now();
      if (data.progress !== lastProgress) { lastProgress = data.progress; progressChanged = heartbeat; }
      response.setHeader('Content-Type', mime['.json']); response.end(JSON.stringify({ version: active?.version })); return;
    }
    if (url.pathname === '/__kiosk/health') {
      response.setHeader('Content-Type', mime['.json']);
      response.end(JSON.stringify({ ready: Boolean(active), version: active?.version, heartbeatAge: heartbeat ? Date.now() - heartbeat : Date.now() - browserStarted, progressAge: progressChanged ? Date.now() - progressChanged : Date.now() - browserStarted, updating })); return;
    }
    if (url.pathname === '/__kiosk/reset' && request.method === 'POST') {
      browserStarted = Date.now(); heartbeat = 0; progressChanged = 0; lastProgress = ''; response.end('ok'); return;
    }
    if (!active) { response.writeHead(503); response.end('Lokale Diashow wird vorbereitet.'); return; }
    const filename = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    for (const version of [active.version, ...previous]) {
      try {
        const manifest = version === active.version ? active : validateManifest(JSON.parse(await readFile(path.join(releases, version, 'offline-manifest.json'), 'utf8')));
        if (!manifest.files.some(item => item.path === filename)) continue;
        let bytes = await readFile(path.join(releases, version, filename));
        if (filename === 'index.html') bytes = Buffer.from(bytes.toString().replace('</body>', `<script>window.__kioskVersion=${JSON.stringify(active.version)}</script><script src="/__kiosk/client.js"></script></body>`));
        response.setHeader('Content-Type', mime[path.extname(filename)] || 'application/octet-stream'); response.end(bytes); return;
      } catch {}
    }
    response.writeHead(404); response.end('Not found');
  } catch { response.writeHead(500); response.end('Local request failed'); }
});
server.listen(port, '127.0.0.1', () => log(`Local server listening on ${port}`));
if (process.env.KIOSK_NO_SYNC !== '1') {
  void syncRelease();
  setInterval(() => void syncRelease(), 5 * 60 * 1000);
}
