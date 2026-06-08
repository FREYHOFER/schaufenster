// Aktualisiert am 05.06.2026 mit EANs und Coverbildern aus Mein Libri.
// Größere Cover stammen, wo verfügbar, zusätzlich aus den jeweiligen Verlags-/Buchhandels-CDNs.
export const slideDurationMs = 7600;

function instagramMoment({ title, focus, url, video, palette, accent = 'warm' }) {
  return {
    type: 'instagram',
    eyebrow: 'Aus unserem Instagram',
    kicker: '@schnelsener_buechereck',
    title,
    author: 'Instagram-Video',
    focus,
    note: 'Direkt aus dem Feed des Schnelsener Bücherecks.',
    source: 'Instagram / @schnelsener_buechereck',
    palette,
    symbol: 'IG',
    media: video
      ? {
          kind: 'video',
          src: video,
          alt: title,
          sourceUrl: url,
          title,
          accent
        }
      : {
          kind: 'instagram',
          src: url,
          title,
          accent
        }
  };
}

export const slides = [
  {
    type: 'book',
    eyebrow: 'Neu im Juni 2026',
    kicker: 'Ein Titel. Ein Gefühl.',
    title: 'Kissed by the Gods - Die ewigen Kriege',
    author: 'Caty Rogan',
    focus: 'Düstere Romantasy mit Götterwelt, Action und Slow-Burn-Spannung.',
    note: 'Für Kund*innen, die Fantasy nicht kuschelig, sondern intensiv mögen.',
    source: 'Mein Libri / Penguin',
    palette: ['#f9d976', '#f39f86'],
    symbol: 'KG',
    isbn: '9783453276222',
    media: {
      kind: 'image',
      src: '/media/covers/9783453276222.jpg',
      alt: 'Cover von Kissed by the Gods - Die ewigen Kriege'
    }
  },
  {
    type: 'book',
    eyebrow: 'Schaufenster-Tipp',
    kicker: 'Thrillermoment',
    title: 'Secret - Du sollst mich fürchten',
    author: 'S.T. Abby',
    focus: 'Eine Serienkillerin mit perfekter Fassade - jetzt auf Deutsch.',
    note: 'Kurz erklären: charmant, gefährlich, sehr suchterzeugend.',
    source: 'Mein Libri / Penguin',
    palette: ['#16161d', '#b91346'],
    symbol: 'S',
    isbn: '9783442498000',
    media: {
      kind: 'image',
      src: '/media/covers/9783442498000.jpg',
      alt: 'Cover von Secret - Du sollst mich fürchten'
    }
  },
  {
    type: 'book',
    eyebrow: 'Roman des Monats',
    kicker: 'Historischer Sog',
    title: 'Träume aus Feuer',
    author: 'Florian Illies',
    focus: 'Alchemie auf der Pfaueninsel: aus Magie wird rubinrotes Glas.',
    note: 'Für Leser*innen, die Geschichte atmosphärisch und pointiert mögen.',
    source: 'Mein Libri / Bastei Lübbe',
    palette: ['#2f1b0c', '#d97135'],
    symbol: 'TF',
    isbn: '9783691310054',
    media: {
      kind: 'image',
      src: '/media/covers/9783691310054.jpg',
      alt: 'Cover von Träume aus Feuer'
    }
  },
  instagramMoment({
    title: 'Aus dem Büchereck',
    focus: 'Ein echter Social-Moment aus dem Laden zwischen den aktuellen Buchtipps.',
    url: 'https://www.instagram.com/p/DXKQgubDRUv/',
    video: '/media/instagram/DXKQgubDRUv.mp4',
    palette: ['#405de6', '#fdc468'],
    accent: 'warm'
  }),
  {
    type: 'book',
    eyebrow: 'Aktuelle Spannung',
    kicker: 'Inselkrimi',
    title: 'Sturm über Christiansø',
    author: 'Michael Kobr',
    focus: 'Eine kleine Ostseeinsel, ein Sturm und Menschen mit Geheimnissen.',
    note: 'Als knapper mündlicher Pitch: geschlossenes Setting, viel Atmosphäre.',
    source: 'Mein Libri / Penguin',
    palette: ['#0f3443', '#34e89e'],
    symbol: '~',
    isbn: '9783442302390',
    media: {
      kind: 'image',
      src: '/media/covers/9783442302390.jpg',
      alt: 'Cover von Sturm über Christiansø'
    }
  },
  {
    type: 'book',
    eyebrow: 'Lesetipp Juni 2026',
    kicker: 'Familie & zweite Chancen',
    title: 'Fünf, sechs, sieben, acht',
    author: 'Ewald Arenz',
    focus: 'Ein Stepptänzer blickt auf Alter, Familie und die verschwundene große Liebe.',
    note: 'Für Menschen, die warm erzählte Figurenromane suchen.',
    source: 'Mein Libri / DuMont',
    palette: ['#1d2b64', '#f8cdda'],
    symbol: '5',
    isbn: '9783755800576',
    media: {
      kind: 'image',
      src: '/media/covers/9783755800576.png',
      alt: 'Cover von Fünf, sechs, sieben, acht'
    }
  },
  instagramMoment({
    title: 'Neu im Feed',
    focus: 'Ein kurzer Blick auf das, was im Schnelsener Büchereck gerade sichtbar wird.',
    url: 'https://www.instagram.com/p/DXpCJ0dDOGM/',
    video: '/media/instagram/DXpCJ0dDOGM.mp4',
    palette: ['#fcb045', '#833ab4'],
    accent: 'violet'
  }),
  {
    type: 'book',
    eyebrow: 'Psychothriller',
    kicker: 'Neu ab 1. Juni',
    title: 'Weil sie lügt',
    author: 'Caroline Seibt',
    focus: 'Eine verschwundene Schwester, ein verdächtigter Vater und ein Albtraum, der erst beginnt.',
    note: 'Für Kund*innen, die Tempo und Wendungen bis zur letzten Seite wollen.',
    source: 'Mein Libri / Droemer Knaur',
    palette: ['#232526', '#cf6f4e'],
    symbol: '!',
    isbn: '9783426567005',
    media: {
      kind: 'image',
      src: '/media/covers/9783426567005.jpg',
      alt: 'Cover von Weil sie lügt'
    }
  },
  instagramMoment({
    title: 'Video aus dem Laden',
    focus: 'Bewegung statt nur Cover: ein Moment direkt aus dem Instagram-Feed.',
    url: 'https://www.instagram.com/p/DXue7IDDYYr/',
    video: '/media/instagram/DXue7IDDYYr.mp4',
    palette: ['#0fb6b8', '#274690'],
    accent: 'warm'
  }),
  {
    type: 'book',
    eyebrow: 'Moderner Roman',
    kicker: 'Internetkultur',
    title: 'Just Watch Me',
    author: 'Lior Torenberg',
    focus: 'Ein siebentägiger Livestream kippt von Spendenaktion zu Kontrollverlust.',
    note: 'Guter Fokus für jüngere Kund*innen: Sichtbarkeit, Schuld und Online-Druck.',
    source: 'Mein Libri / Lesejury',
    palette: ['#0fb6b8', '#274690'],
    symbol: 'JW',
    isbn: '9783759600615',
    media: {
      kind: 'image',
      src: '/media/covers/9783759600615.jpg',
      alt: 'Cover von Just Watch Me'
    }
  },
  instagramMoment({
    title: 'Schnelsener Moment',
    focus: 'Ein Social-Slide als kleine Pause zwischen Spannung, Romanen und Neuheiten.',
    url: 'https://www.instagram.com/p/DX2xGasMNje/',
    video: '/media/instagram/DX2xGasMNje.mp4',
    palette: ['#f9d976', '#f39f86'],
    accent: 'warm'
  }),
  instagramMoment({
    title: 'Buchtipp im Feed',
    focus: 'Ein weiterer Instagram-Ausschnitt aus dem Alltag eurer Buchhandlung.',
    url: 'https://www.instagram.com/p/DYNOTEJtbae/',
    video: '/media/instagram/DYNOTEJtbae.mp4',
    palette: ['#34e89e', '#0f3443'],
    accent: 'violet'
  }),
  instagramMoment({
    title: 'Aus dem Regal',
    focus: 'Kurzer Ladenblick im Hochformat, passend als lebendiger Schaufenster-Moment.',
    url: 'https://www.instagram.com/p/DYYa_gRILUz/',
    video: '/media/instagram/DYYa_gRILUz.mp4',
    palette: ['#ffecd2', '#f18f7b'],
    accent: 'warm'
  }),
  instagramMoment({
    title: 'Ladenmoment',
    focus: 'Noch ein bewegter Social-Beitrag aus dem Schnelsener Büchereck.',
    url: 'https://www.instagram.com/p/DYZuBN-N_JB/',
    video: '/media/instagram/DYZuBN-N_JB.mp4',
    palette: ['#1d2b64', '#f8cdda'],
    accent: 'violet'
  }),
  instagramMoment({
    title: 'Im Feed entdeckt',
    focus: 'Ein Instagram-Video als Abschlussmoment vor dem nächsten Buchtipp.',
    url: 'https://www.instagram.com/p/DYm62eJNoRg/',
    video: '/media/instagram/DYm62eJNoRg.mp4',
    palette: ['#232526', '#cf6f4e'],
    accent: 'warm'
  }),
  instagramMoment({
    title: 'Noch ein Fund',
    focus: 'Ein weiterer Post aus dem Schnelsener Feed für mehr Bewegung im Schaufenster.',
    url: 'https://www.instagram.com/p/DY7O4HlNi0B/',
    video: '/media/instagram/DY7O4HlNi0B.mp4',
    palette: ['#405de6', '#fdc468'],
    accent: 'violet'
  }),
  {
    type: 'book',
    eyebrow: 'Sommerroman',
    kicker: 'Südfrankreich',
    title: 'Au revoir und tschüss',
    author: 'Gudrun Lochte',
    focus: 'Lavendel, warme Gassen und ein Neuanfang, der erst nach Abschied möglich wird.',
    note: 'Als ruhiger Slide zwischen den Spannungstiteln.',
    source: 'Mein Libri / Reuffel',
    palette: ['#ffecd2', '#f18f7b'],
    symbol: 'AR',
    isbn: '9783691690033',
    media: {
      kind: 'image',
      src: '/media/covers/9783691690033.jpg',
      alt: 'Cover von Au revoir und tschüss'
    }
  }
];
