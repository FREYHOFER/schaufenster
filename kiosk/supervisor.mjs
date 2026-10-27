import { spawn } from 'node:child_process';
import { appendFile, stat, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.join(root, 'supervisor.log');
async function log(text) {
  try {
    if ((await stat(logFile).catch(()=>({size:0}))).size > 2e6) await rename(logFile,`${logFile}.old`).catch(()=>{});
    await appendFile(logFile,`${new Date().toISOString()} ${text}\n`);
  } catch {}
}
const executable = path.join(process.env.WINDIR || 'C:/Windows','System32/WindowsPowerShell/v1.0/powershell.exe');
await log('Supervisor started.');
while (true) {
  const exitCode = await new Promise(resolve => {
    const child = spawn(executable,['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(root,'Watch-Kiosk.ps1')],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',data=>void log(`Watcher output: ${data.toString().trim()}`));
    child.stderr.on('data',data=>void log(`Watcher error: ${data.toString().trim()}`));
    child.once('error',error=>{void log(`Watcher start failed: ${error.message}`);resolve(1);});
    child.once('exit',code=>{void log(`Watcher exited (${code}).`);resolve(code);});
  });
  // A clean exit means the named mutex is already held by another watcher.
  if (exitCode === 0) { await log('Existing watcher retained; duplicate starter exiting.'); break; }
  await new Promise(resolve=>setTimeout(resolve,10000));
}
