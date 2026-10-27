import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { catalog } from '../src/catalog.js';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const files = new Set(['index.html', 'media/community/groups-reference.png']);
for (const name of await readdir('dist/assets')) files.add(`assets/${name}`);
for (const book of catalog.flatMap(topic => topic.books)) {
  files.add(`media/covers/${book.isbn}.jpg`);
  files.add(`qr/${book.isbn}.svg`);
}
const entries = await Promise.all([...files].sort().map(async path => {
  const bytes = await readFile(`dist/${path}`);
  return { path, size: bytes.length, sha256: digest(bytes) };
}));
const version = digest(JSON.stringify(entries));
await writeFile('dist/offline-manifest.json', JSON.stringify({ schema: 1, version, files: entries }, null, 2));
console.log(`Offline release ${version.slice(0, 12)}: ${entries.length} verified files.`);
