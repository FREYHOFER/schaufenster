import { catalog, catalogCheckedAt } from './catalog.js';
import { christmasBooks, christmasCheckedAt } from './christmas.js';

export const slideDurationMs = 42000;
const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const SHOP = 'https://schnelsener-buechereck.buchhandlung.de/shop/articleByEan/';
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
const dateLabel = value => value.split('-').reverse().join('.');

export function publicationDetails(book, date = today) {
  const upcoming = book.releaseDate ? book.releaseDate > date : book.releaseMonth > date.slice(0, 7);
  const uncertain = !book.releaseDate && book.releaseMonth === date.slice(0, 7);
  const when = book.releaseDate ? dateLabel(book.releaseDate) : new Intl.DateTimeFormat('de-DE', {
    month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${book.releaseMonth}-01T12:00:00Z`));
  return {
    label: `${book.category} · ${upcoming ? 'Vorschau' : uncertain ? 'Angekündigt' : 'Erschienen'} ${when}`,
    availability: upcoming ? {
      label: 'Vorbestellung', detail: 'Abholung nach Erscheinen – Termin im Shop prüfen'
    } : uncertain ? {
      label: 'Termin im Shop prüfen', detail: 'Der Verlag nennt bisher nur den Erscheinungsmonat'
    } : {
      label: 'Ladenabholung möglich', detail: 'Lieferbarkeit und Abholtermin im Shop prüfen'
    }
  };
}


const festivePalette = ['#cba764', '#1c5746'];
const availability = { label: 'Ladenabholung möglich', detail: 'Lieferbarkeit und Abholtermin im Shop prüfen' };
function singleBook(book, christmas = false) {
  const item = {
    ...book, checkedAt: christmas ? christmasCheckedAt : catalogCheckedAt,
    ...(christmas ? { label: book.category, availability } : publicationDetails(book)),
    shopUrl: SHOP + book.isbn, src: BASE + 'media/covers/' + book.isbn + '.jpg',
    alt: 'Cover von ' + book.title
  };
  return {
    type: 'collection', theme: 'christmas',
    eyebrow: christmas ? 'Weihnachtsfreude zum Aufschlagen' : 'Ein Buch unter dem Weihnachtsbaum',
    kicker: item.label, title: book.title, author: book.author, audience: '',
    focus: book.description || 'Ein Geschenk für ' + book.category.toLowerCase() + '-Fans. Entdeckt diesen Titel und weitere Geschenkideen bei uns im Schnelsener Büchereck.',
    note: '', palette: festivePalette, symbol: '✦', durationMs: 32000,
    media: { kind: 'collection', backgroundItems: [], items: [item] }
  };
}
function poster(title, audience, warm = false) {
  return {
    type: 'poster', theme: 'christmas-poster', eyebrow: 'Weihnachten im Schnelsener Büchereck',
    kicker: 'Geschichten schenken', title, author: 'Schnelsener Büchereck', audience,
    focus: '', note: 'Eure Buchhandlung um die Ecke.',
    palette: warm ? ['#d7b879', '#8a343c'] : festivePalette, symbol: '✦', durationMs: 26000
  };
}
const giftIsbns = ['9783426281765', '9783630878652', '9783755800750', '9783551805225', '9783551587046', '9783743225640'];
const giftCopy = [
  'Spannung verschenken: Ein Psychothriller für alle, die sich an den Feiertagen gern in einem Buch verlieren.',
  'Ein Roman als Weihnachtsgeschenk: Für Menschen, die neue literarische Stimmen und Geschichten entdecken möchten.',
  'Eine literarische Reise als Geschenk: Lesestoff aus Taiwan für neugierige Leserinnen und Leser.',
  'Ein neuer Band unter dem Weihnachtsbaum: Eine Geschenkidee für Fans der Strohhutbande.',
  'Magie unter dem Weihnachtsbaum: Eine Geschenkidee für Romantasy-Fans ab 16 Jahren.',
  'Lesefreude unter dem Weihnachtsbaum: Ein Drachenabenteuer für Kinder ab 7 Jahren.'
];
const gifts = giftIsbns.map((isbn, index) => {
  const book = catalog.flatMap(topic => topic.books).find(book => book.isbn === isbn);
  if (!book) throw new Error('Missing gift ISBN ' + isbn);
  return singleBook({ ...book, description: giftCopy[index] });
});
const festive = christmasBooks.map(book => singleBook(book, true));
export const slides = [
  poster('Weihnachten beginnt mit einer Geschichte.', 'Bücher entdecken. Vorfreude verschenken.'),
  festive[0], festive[1], gifts[0],
  poster('Kleine Päckchen. Große Geschichten.', 'Geschenkideen für eure Lieblingsmenschen.', true),
  festive[2], gifts[1], gifts[2],
  poster('Zeit für Plätzchen. Zeit für Geschichten.', 'Macht es euch im Advent gemütlich.'),
  festive[3], festive[4], gifts[3],
  poster('Das schönste Geschenk? Gemeinsam lesen.', 'Wir helfen euch, das passende Buch zu finden.', true),
  festive[5], gifts[4], gifts[5],
  {
    type: 'community', eyebrow: 'Raum für Ideen', kicker: '', title: 'Gruppen gesucht',
    author: 'Unser Keller möchte genutzt werden', audience: '',
    focus: 'Lesezirkel, Spielrunde, Schreibtreff oder Nachbarschaftsgruppe: Wir suchen Menschen, die unten etwas Gutes anfangen wollen.',
    note: 'Sprecht uns im Laden an, wenn ihr einen regelmäßigen Treff sucht.',
    palette: festivePalette, symbol: '✦', durationMs: 26000,
    media: { kind: 'image', src: BASE + 'media/community/groups-reference.png', alt: 'Eine musizierende Gruppe im Keller des Schnelsener Bücherecks' }
  }
];
