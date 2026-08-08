import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { slides } from '../src/slides.js';

const qrDirectory = join(process.cwd(), 'public', 'qr');
const books = slides.flatMap((slide) => slide.media?.kind === 'collection' ? slide.media.items : []);
const uniqueBooks = [...new Map(books.map((book) => [book.isbn, book])).values()];
const checkOnly = process.argv.includes('--check');

if (!checkOnly) {
  await mkdir(qrDirectory, { recursive: true });
}

await Promise.all(uniqueBooks.map(async (book) => {
  if (!book.isbn || !book.shopUrl) {
    throw new Error(`QR code data is incomplete for ${book.title || 'an unknown book'}`);
  }

  const svg = await QRCode.toString(book.shopUrl, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#111111',
      light: '#ffffffff'
    }
  });

  const qrPath = join(qrDirectory, `${book.isbn}.svg`);

  if (checkOnly) {
    const existingSvg = await readFile(qrPath, 'utf8').catch(() => null);

    if (existingSvg !== svg) {
      throw new Error(`QR code for ${book.title} is stale or missing. Run npm run generate:qr.`);
    }

    return;
  }

  await writeFile(qrPath, svg);
}));

console.log(`${checkOnly ? 'Validated' : 'Generated'} ${uniqueBooks.length} QR codes in public/qr.`);
