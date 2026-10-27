import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
const source = path.dirname(fileURLToPath(import.meta.url));
const root = await mkdtemp(path.join(tmpdir(), 'schaufenster-server-test-'));
const sha = value => createHash('sha256').update(value).digest('hex');
function release(text) {
  const files = [{path:'index.html',size:Buffer.byteLength(text),sha256:sha(text)}];
  return {schema:1,version:sha(JSON.stringify(files)),files};
}
const oldHtml = '<html><body>Offline OK</body></html>', newHtml = '<html><body>Updated OK</body></html>';
const old = release(oldHtml), next = release(newHtml);
await mkdir(path.join(root,'releases',old.version),{recursive:true});
await writeFile(path.join(root,'releases',old.version,'index.html'),oldHtml);
await writeFile(path.join(root,'releases',old.version,'offline-manifest.json'),JSON.stringify(old));
await writeFile(path.join(root,'active.json'),'\uFEFF'+JSON.stringify({active:old.version,previous:[]}));
await copyFile(path.join(source,'client.js'),path.join(root,'client.js'));
let mode = 'corrupt';
const upstream = http.createServer((req,res)=> {
  if(mode==='offline') {res.writeHead(503);res.end();return;}
  if(req.url==='/offline-manifest.json') res.end(JSON.stringify(next));
  else res.end(mode==='corrupt'?'bad':newHtml);
});
await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
const origin = `http://127.0.0.1:${upstream.address().port}`;
const port = 4197;
let child;
async function start() {
  child = spawn(process.execPath,[path.join(source,'server.mjs')],{env:{...process.env,KIOSK_ROOT:root,KIOSK_ORIGIN:origin,KIOSK_PORT:String(port)},stdio:'pipe',windowsHide:true});
  for(let i=0;i<50;i++) {try {const r=await fetch(`http://127.0.0.1:${port}/__kiosk/health`); if(r.ok)return;}catch{} await new Promise(r=>setTimeout(r,100));}
  throw new Error('Local server did not start');
}
async function stop() {const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}
try {
  await start();
  await new Promise(r=>setTimeout(r,500));
  assert.match(await (await fetch(`http://127.0.0.1:${port}/`)).text(),/Offline OK/);
  assert.equal(JSON.parse((await readFile(path.join(root,'active.json'),'utf8')).replace(/^\uFEFF/, '')).active,old.version,'bad download replaced valid release');
  await stop(); mode='good'; await start();
  for(let i=0;i<50;i++) {if((await (await fetch(`http://127.0.0.1:${port}/__kiosk/health`)).json()).version===next.version)break;await new Promise(r=>setTimeout(r,100));}
  assert.match(await (await fetch(`http://127.0.0.1:${port}/`)).text(),/Updated OK/);
  await stop();
  // Damaged newest release must fall back to the last verified version, offline.
  await writeFile(path.join(root,'releases',next.version,'index.html'),'broken');
  mode='offline'; await start();
  assert.match(await (await fetch(`http://127.0.0.1:${port}/`)).text(),/Offline OK/);
  assert.equal((await fetch(`http://127.0.0.1:${port}/%2e%2e/active.json`)).status,404);
  console.log('PASS: offline start, corrupt update rejected, atomic verified update, corrupt release fallback, traversal rejected.');
} finally {
  if(child?.exitCode===null) await stop();
  await new Promise(r=>upstream.close(r));
  const resolved=path.resolve(root);
  if(path.dirname(resolved)!==path.resolve(tmpdir()) || !path.basename(resolved).startsWith('schaufenster-server-test-')) throw new Error('Unsafe cleanup path');
  await rm(resolved,{recursive:true,force:true});
}
