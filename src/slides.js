import { catalog, catalogCheckedAt } from './catalog.js';

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

function collection(topic) {
  return {
    type: 'collection', eyebrow: topic.title === 'Litprom' ? 'Weltliteratur' : topic.title,
    kicker: '', title: topic.title, author: topic.subtitle, audience: '', focus: '', note: '',
    palette: topic.palette, symbol: topic.symbol, durationMs: 43000,
    media: {
      kind: 'collection',
      // Themenwörter, keine zusätzlichen oder erfundenen Buchtipps.
      backgroundItems: topic.keywords.map(title => ({ label: topic.title, title, author: 'Lesen · entdecken · weiterdenken' })),
      items: topic.books.map(book => ({
        ...book, checkedAt: catalogCheckedAt, ...publicationDetails(book),
        shopUrl: `${SHOP}${book.isbn}`, src: `${BASE}media/covers/${book.isbn}.jpg`,
        alt: `Cover von ${book.title}`
      }))
    }
  };
}

function poster(title, palette) {
  return {
    type: 'poster', theme: 'poster', eyebrow: 'Schaufenster-Spruch', kicker: '', title,
    author: 'Schnelsener Büchereck', audience: '', focus: '',
    note: 'Schnelsener Büchereck, die Eckbuchhandlung um die Ecke.',
    palette, symbol: 'D', durationMs: 26000
  };
}

const groups = {
  type: 'community', eyebrow: 'Raum für Ideen', kicker: '', title: 'Gruppen gesucht',
  author: 'Unser Keller möchte genutzt werden', audience: '',
  focus: 'Lesezirkel, Spielrunde, Schreibtreff, Manga-Club oder Nachbarschaftsgruppe: Wir suchen Menschen, die unten etwas Gutes anfangen wollen.',
  note: 'Sprecht uns im Laden an, wenn ihr einen regelmäßigen Treff sucht.',
  palette: ['#17140e', '#05070b'], symbol: '↘', durationMs: 34000,
  media: { kind: 'image', src: `${BASE}media/community/groups-reference.png`, alt: 'Eine musizierende Gruppe im Keller des Schnelsener Bücherecks' }
};

export const slides = [
  poster('Jeder Tag hat eine Geschichte.', ['#69b9c5', '#f19b76']),
  ...catalog.map(collection), groups,
  poster('Lies mal wieder.', ['#e4a85d', '#748ab8']),
  poster('Kannst du überhaupt noch lesen?', ['#b99bd5', '#e7c95c'])
];
