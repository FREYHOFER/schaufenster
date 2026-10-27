import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.env.KIOSK_ROOT || path.join(homedir(), 'SchaufensterKiosk');
const base = 'http://127.0.0.1:4186';
const health = await (await fetch(`${base}/__kiosk/health`)).json();
assert.equal(health.ready, true);
const directory = path.join(root, 'releases', health.version);
const manifest = JSON.parse(await readFile(path.join(directory, 'offline-manifest.json'), 'utf8'));
for (const item of manifest.files) {
  const response = await fetch(`${base}/${item.path}`, { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, item.path);
  let bytes = Buffer.from(await response.arrayBuffer());
  if (item.path === 'index.html') {
    const injection = `<script>window.__kioskVersion=${JSON.stringify(health.version)}</script><script src="/__kiosk/client.js"></script>`;
    assert.ok(bytes.toString().includes(injection));
    bytes = Buffer.from(bytes.toString().replace(injection, ''));
    for (const reference of bytes.toString().matchAll(/(?:src|href)="([^"]+)"/g)) {
      assert.ok(!/^https?:\/\//.test(reference[1]), `External HTML dependency: ${reference[1]}`);
    }
  }
  assert.equal(bytes.length, item.size, item.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
}
console.log(`PASS: all ${manifest.files.length} display assets served locally with correct hashes; HTML has no external dependencies.`);
