// Aktualisiert am 08.08.2026: veraltete Bestsellerplatzierungen durch belegte Erscheinungsdaten ersetzt.
export const slideDurationMs = 42000;

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const SHOP_BASE_URL = 'https://schnelsener-buechereck.buchhandlung.de/shop';

const pickupAvailability = {
  label: 'Ladenabholung möglich',
  detail: 'Lieferbarkeit und Abholtermin im Shop prüfen'
};

function orderDetails(isbn, availability = pickupAvailability) {
  return {
    isbn,
    shopUrl: `${SHOP_BASE_URL}/articleByEan/${isbn}`,
    availability
  };
}

const instagramVideos = [
  ['DXKQgubDRUv', ['#405de6', '#fdc468']],
  ['DXpCJ0dDOGM', ['#f77737', '#c13584']],
  ['DXue7IDDYYr', ['#0fb6b8', '#274690']],
  ['DX2xGasMNje', ['#f9d976', '#f39f86']],
  ['DYNOTEJtbae', ['#34e89e', '#0f3443']],
  ['DYYa_gRILUz', ['#ffecd2', '#f18f7b']],
  ['DYZuBN-N_JB', ['#1d2b64', '#f8cdda']],
  ['DYm62eJNoRg', ['#232526', '#cf6f4e']],
  ['DY7O4HlNi0B', ['#405de6', '#fdc468']]
];

function bookSlide({
  month,
  title,
  author,
  focus,
  palette,
  symbol,
  isbn,
  availability,
  durationMs = 40000
}) {
  const coverSrc = `${BASE}media/covers/${isbn}.jpg`;

  return {
    type: 'book',
    eyebrow: month,
    kicker: '',
    title,
    author,
    audience: '',
    focus: `${focus.trim().replace(/[.!?…]+$/, '')} …`,
    note: '',
    palette,
    symbol,
    ...orderDetails(isbn, availability),
    durationMs,
    media: {
      kind: 'image',
      src: coverSrc,
      coverSrc,
      alt: `Cover von ${title}`
    }
  };
}

function posterSlide({
  title,
  author = 'Schnelsener Büchereck',
  audience = '',
  note = 'Schnelsener Büchereck, die Eckbuchhandlung um die Ecke.',
  palette = ['#7cc7c2', '#ef9f8f'],
  durationMs = 26000
}) {
  return {
    type: 'poster',
    theme: 'poster',
    eyebrow: 'Schaufenster-Spruch',
    kicker: '',
    title,
    author,
    audience,
    focus: '',
    note,
    palette,
    symbol: 'D',
    durationMs
  };
}

function collectionSlide({
  eyebrow,
  title,
  author,
  palette,
  symbol,
  books,
  backgroundTitles = [],
  durationMs = 40000
}) {
  return {
    type: 'collection',
    eyebrow,
    kicker: '',
    title,
    author,
    audience: '',
    focus: '',
    note: '',
    palette,
    symbol,
    durationMs,
    media: {
      kind: 'collection',
      backgroundItems: backgroundTitles.map((item) => ({
        label: item.label,
        title: item.title,
        author: item.author
      })),
      items: books.map((book) => ({
        title: book.title,
        author: book.author,
        label: book.eyebrow.split('·').slice(1).join('·').trim(),
        isbn: book.isbn,
        shopUrl: book.shopUrl,
        availability: book.availability,
        src: book.media.coverSrc,
        alt: book.media.alt
      }))
    }
  };
}

function topicBook({ eyebrow, title, author, isbn, availability }) {
  const coverSrc = `${BASE}media/covers/${isbn}.jpg`;

  return {
    eyebrow,
    title,
    author,
    ...orderDetails(isbn, availability),
    media: {
      kind: 'image',
      src: coverSrc,
      coverSrc,
      alt: `Buchcover von ${title}`
    }
  };
}

function instagramMoment([shortcode, palette], index) {
  return {
    type: 'instagram',
    eyebrow: 'Instagram',
    kicker: '',
    title: 'Folgt uns auf Instagram',
    author: '@schnelsener_buechereck',
    focus: '',
    note: '',
    source: 'Instagram / @schnelsener_buechereck',
    palette,
    symbol: 'IG',
    durationMs: 22000,
    media: {
      kind: 'video',
      src: `${BASE}media/instagram/${shortcode}.mp4`,
      alt: `Instagram-Video ${index + 1} vom Schnelsener Büchereck`,
      sourceUrl: `https://www.instagram.com/p/${shortcode}/`,
      loop: true
    }
  };
}

const bookSlides = [
  bookSlide({
    month: 'Manga · ab 10 · Neu seit 26. Mai 2026',
    title: 'One Piece 112',
    author: 'Eiichiro Oda',
    audience: 'Für Manga-Fans ab 10',
    focus:
      'Die Strohhutbande erreicht endlich Elban, die sagenumwobene Insel der Riesen. Robin erlebt ein lang ersehntes Wiedersehen, während eine mysteriöse Box und Ruffys nächste Herausforderung schon neues Chaos ankündigen.',
    note:
      'Der Start des Elban-Arcs: große Abenteuer, viel Witz und echte Gefühle für Fans ab 10 Jahren.',
    palette: ['#f3d459', '#317d9c'],
    symbol: '☠',
    isbn: '9783551804976',
    durationMs: 42000
  }),
  bookSlide({
    month: 'Manga · ab 14 · Neu seit 30. Juni 2026',
    title: 'Sakamoto Days 22',
    author: 'Yuto Suzuki',
    audience: 'Für Anime- und Actionfans ab 14',
    focus:
      'Tenkyu hat es auf die Wahrsagerin Atari abgesehen. Als Shin sieht, wie brutal sie verletzt wird, gerät das Familiencredo der Sakamotos ins Wanken: Kann er diejenigen schützen, die ihm wichtig sind, ohne zu töten?',
    note:
      'Rasante Actionkomödie um einen Auftragskiller im Fast-Ruhestand – passend zum Anime-Hype.',
    palette: ['#f4c94c', '#333948'],
    symbol: '⚡',
    isbn: '9783551808165',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Manga · ab 12 · Neu seit 28. Juli 2026',
    title: 'PandoraHearts Pearls 6',
    author: 'Jun Mochizuki',
    focus:
      'Als Spross einer Adelsfamilie verbringt Oz seine Zeit damit, seinem Freund und Diener Gilbert Schwierigkeiten zu machen. Dann wird er von drei schwarzen Gestalten in die Unterwelt namens Abyss gestoßen.',
    palette: ['#d8c0b6', '#49313d'],
    symbol: '♜',
    isbn: '9783551028891',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Manga · ab 12 · Neu seit 30. Juni 2026',
    title: 'Shinobi Undercover 1',
    author: 'Ippon Takegushi & Santa Mitarashi',
    audience: 'Für Comedy- und Ninja-Fans ab 12',
    focus:
      'Der junge Ninja Yodaka soll die schüchterne Aoi beschützen. Dafür muss er undercover an ihre Highschool – eine Mission, bei der Schulalltag, soziale Ängste und Ninja-Pflichten herrlich kollidieren.',
    note:
      'Ein frischer Serienstart zwischen Action, Comedy und Slice of Life für Leser*innen ab 12.',
    palette: ['#f4df68', '#552f5b'],
    symbol: '忍',
    isbn: '9783551808240',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Romantasy · ab 16 · Neu seit 1. April 2026',
    title: 'The Wolf King',
    author: 'Lauren Palphreyman',
    audience: 'Für Romantasy-Leser*innen ab 16',
    focus:
      'Prinzessin Aurora soll einen grausamen Lord heiraten. Nachdem sie einem jungen Wolf das Leben rettet, entführt Alpha Callum sie in das wilde Land jenseits der Grenze – und mitten in einen Krieg zwischen Menschen und Werwolf-Clans.',
    note:
      'Knistern, Gefahr und verfeindete Welten: ein zugänglicher Romantasy-Auftakt ab 16 Jahren.',
    palette: ['#23364b', '#d39b67'],
    symbol: '🐺',
    isbn: '9783551586759',
    durationMs: 42000
  }),
  bookSlide({
    month: 'Graphic Novel · ab 12 · Neu seit 23. Juli 2026',
    title: 'Heartstopper Volume 6',
    author: 'Alice Oseman',
    focus:
      'Jeder in der Schule kennt Nick und Charlie. Aber es ist Nicks letztes Jahr an der Truham Highschool und so langsam gewöhnt er sich an den Gedanken, ab dem Sommer in Leeds zu studieren. Charlie geht derweil ganz in seiner neuen Aufgabe als Schülersprecher auf.',
    palette: ['#f3d3df', '#d67a93'],
    symbol: '♡',
    isbn: '9783732022779',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Romantasy · ab 14 · Erscheint 31. August 2026',
    title: 'Embrace the Serpent',
    author: 'Sunya Mara',
    audience: 'Für Fantasy-Fans ab 14',
    focus:
      'Saphira kann die Magie aus Edelsteinen wecken und lebt damit im Verborgenen. Als der gefürchtete Schlangenkönig nach ihr suchen lässt, gerät sie zwischen ein gnadenloses Kaiserreich, einen rätselhaften Herrscher und dessen charmanten Jäger.',
    note:
      'Magie, Verrat und verbotene Gefühle in einer Standalone-Romantasy ab 14 Jahren.',
    palette: ['#1d4b46', '#d9aa6a'],
    symbol: '🐍',
    isbn: '9783551587251',
    availability: {
      label: 'Vorbestellung',
      detail: 'Abholung nach Erscheinen – Termin im Shop prüfen'
    },
    durationMs: 42000
  }),
  bookSlide({
    month: 'Kinderbuch · ab 8 · Neu seit 23. Juli 2026',
    title: 'Sieben Mal Anders (Band 1) – Adele möchte die Welt umarmen',
    author: 'Sabine Bohlmann',
    focus:
      'Adele und ihre fünf Geschwister wohnen in der Hummelgasse. Ihr Alltag ist ein einziges Abenteuer, doch zum ganz großen Glück fehlt Familie Anders noch ein siebtes Kind. Kurzerhand machen sie sich auf die Suche nach einem neuen Geschwisterchen.',
    palette: ['#e9d8b4', '#d85f72'],
    symbol: '7',
    isbn: '9783743219823',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Kinderbuch · ab 10 · Neu seit 15. Juni 2026',
    title: 'Windwalkers (3). Giftige Gefahr',
    author: 'Katja Brandis',
    focus:
      'Sierra will sich auf die Projektwoche an der Redcliff High konzentrieren. Doch die gefährliche Quallenfrau Thanada ist noch immer auf freiem Fuß, und Unbekannte verbreiten immer bedrohlichere Gerüchte über die Schule.',
    palette: ['#d8e9ef', '#244d6b'],
    symbol: '🪶',
    isbn: '9783401607979',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Kinderbuch · ab 6 · Erscheint 13. August 2026',
    title: 'Die Perlschweinchen – Ein glitzerndes Geheimnis',
    author: 'Kira Gembri',
    focus:
      'Flo sammelt gern besondere Steine, Federn und bunte Knöpfe. Dann kullert ihm ein winziges schimmerndes Wesen mit Rüsselnase vor die Füße: Knurps, ein Perlschweinchen, das am liebsten funkelndes Futter frisst.',
    palette: ['#f2d7e6', '#b54f8c'],
    symbol: '✦',
    isbn: '9783743223417',
    availability: {
      label: 'Vorbestellung',
      detail: 'Abholung nach Erscheinen – Termin im Shop prüfen'
    },
    durationMs: 39000
  })
];

const everyDaySlide = posterSlide({
  title: 'Jeder Tag hat eine Geschichte.',
  palette: ['#69b9c5', '#f19b76']
});

const readAgainSlide = posterSlide({
  title: 'Lies mal wieder.',
  palette: ['#e4a85d', '#748ab8']
});

const canYouReadSlide = posterSlide({
  title: 'Kannst du überhaupt noch lesen?',
  author: 'Schnelsener Büchereck',
  palette: ['#b99bd5', '#e7c95c']
});

const currentAffairsSlide = collectionSlide({
  eyebrow: 'Aktuelles',
  title: 'Aktuelles',
  author: 'Neu im August · Bestseller · Vorschau',
  palette: ['#efc654', '#d85f72'],
  symbol: '!',
  backgroundTitles: [
    { label: 'Bestseller', title: 'Die Träume, die wir hatten', author: 'Christiane Hoffmann' },
    { label: 'Politik', title: 'Der amerikanische Albtraum', author: 'Klaus Brinkbäumer' },
    { label: 'Vorschau', title: 'Die Perlschweinchen', author: 'Kira Gembri' },
    { label: 'Manga', title: 'Sakamoto Days 22', author: 'Yuto Suzuki' },
    { label: 'Vorschau', title: 'Embrace the Serpent', author: 'Sunya Mara' }
  ],
  books: [
    topicBook({
      eyebrow: 'Neu seit 15. Juli 2026',
      title: 'Odyssee',
      author: 'Homer · übersetzt von Roland Hampe',
      isbn: '9783150208151'
    }),
    bookSlides[2],
    bookSlides[7],
    bookSlides[8]
  ],
  durationMs: 43000
});

const mangaCollectionSlide = collectionSlide({
  eyebrow: 'Manga',
  title: 'Manga',
  author: 'Vier neue Bände',
  palette: ['#f4c94c', '#4e7fac'],
  symbol: '漫',
  backgroundTitles: [
    { label: 'Manga', title: 'Dandadan', author: 'Yukinobu Tatsu' },
    { label: 'Manga', title: 'Spy x Family', author: 'Tatsuya Endo' },
    { label: 'Manga', title: 'Kaiju No. 8', author: 'Naoya Matsumoto' },
    { label: 'Manga', title: 'Jujutsu Kaisen', author: 'Gege Akutami' },
    { label: 'Manga', title: 'Witch Watch', author: 'Kenta Shinohara' }
  ],
  books: bookSlides.slice(0, 4),
  durationMs: 43000
});

const youngAdultCollectionSlide = collectionSlide({
  eyebrow: 'Young Adult',
  title: 'Young Adult',
  author: 'Drei neue Titel',
  palette: ['#b88fc6', '#31403c'],
  symbol: 'YA',
  backgroundTitles: [
    { label: 'Romantasy', title: 'Lightlark', author: 'Alex Aster' },
    { label: 'Romantasy', title: 'Divine Rivals', author: 'Rebecca Ross' },
    { label: 'Fantasy', title: 'A Study in Drowning', author: 'Ava Reid' },
    { label: 'Graphic Novel', title: 'Heartstopper', author: 'Alice Oseman' },
    { label: 'Fantasy', title: 'Once Upon a Broken Heart', author: 'Stephanie Garber' }
  ],
  books: bookSlides.slice(4, 7),
  durationMs: 41000
});

const childrenCollectionSlide = collectionSlide({
  eyebrow: 'Kinder & Familie',
  title: 'Kinder & Familie',
  author: 'Vorlesen · ab 3 · ab 8 · ab 10',
  palette: ['#82c5b5', '#e58572'],
  symbol: '♡',
  backgroundTitles: [
    { label: 'Bilderbuch', title: 'Der Löwe in dir', author: 'Rachel Bright' },
    { label: 'Kinderbuch', title: 'Die Schule der magischen Tiere', author: 'Margit Auer' },
    { label: 'Vorlesen', title: 'Das NEINhorn', author: 'Marc-Uwe Kling' },
    { label: 'Abenteuer', title: 'Woodwalkers', author: 'Katja Brandis' },
    { label: 'Familie', title: 'Adele', author: 'Sabine Bohlmann' }
  ],
  books: bookSlides.slice(7, 10),
  durationMs: 41000
});

const politicsSlide = collectionSlide({
  eyebrow: 'Politik & Weltordnung',
  title: 'Politik & Weltordnung',
  author: 'USA · Deutschland · Ukraine · China',
  palette: ['#d9bc6f', '#294b5c'],
  symbol: 'P',
  backgroundTitles: [
    { label: 'USA', title: 'Demokratie unter Druck', author: 'Macht und Institutionen' },
    { label: 'Vorschau', title: 'Zerstörungslust', author: 'Carolin Amlinger & Oliver Nachtwey' },
    { label: 'Europa', title: 'Wenn Russland gewinnt', author: 'Carlo Masala' },
    { label: 'China', title: 'China und die Neuordnung der Welt', author: 'Susanne Weigelin-Schwiedrzik' },
    { label: 'Geopolitik', title: 'Machtverschiebungen', author: 'Westen und neue Weltordnung' }
  ],
  books: [
    topicBook({
      eyebrow: 'Sachbuch · 2026',
      title: 'Der amerikanische Albtraum',
      author: 'Klaus Brinkbäumer',
      isbn: '9783103977332'
    }),
    topicBook({
      eyebrow: 'Neu seit 13. Januar 2026',
      title: 'Reichensteuer',
      author: 'Gabriel Zucman',
      isbn: '9783518001387'
    }),
    topicBook({
      eyebrow: 'Sachbücher des Monats · Platz 1',
      title: 'Die Träume, die wir hatten',
      author: 'Christiane Hoffmann',
      isbn: '9783406840050'
    }),
    topicBook({
      eyebrow: 'Neu seit 1. April 2026',
      title: 'Die Welt nach dem Westen',
      author: 'Daniel Marwecki',
      isbn: '9783962892395'
    })
  ],
  durationMs: 44000
});

const citySlide = collectionSlide({
  eyebrow: 'Stadt & Zusammenleben',
  title: 'Mobilität & Stadtentwicklung',
  author: 'Quartiere · Verkehrswende · öffentlicher Raum',
  palette: ['#64b7aa', '#e69a64'],
  symbol: '⌂',
  backgroundTitles: [
    { label: 'Stadt', title: 'Die Stadt für alle', author: 'Osamu Okamura' },
    { label: 'Hamburg', title: 'Quartiere im Wandel', author: 'Stadtentwicklung vor Ort' },
    { label: 'Verkehr', title: 'Straßen neu denken', author: 'öffentlicher Raum' },
    { label: 'Klima', title: 'Schwammstadt', author: 'Planen mit Wasser und Grün' },
    { label: 'Nachbarschaft', title: 'Zusammenleben', author: 'Orte für Begegnung' }
  ],
  books: [
    topicBook({
      eyebrow: 'Neu seit 28. April 2026',
      title: 'Urban Transformation Playbook',
      author: 'Urban Lab',
      isbn: '9783867748841'
    }),
    topicBook({
      eyebrow: 'Bestseller · Taschenbuch 2023',
      title: 'Autokorrektur',
      author: 'Katja Diehl',
      isbn: '9783596709465'
    }),
    topicBook({
      eyebrow: 'Sachbuch · 2024',
      title: 'Raus aus der AUTOkratie',
      author: 'Katja Diehl',
      isbn: '9783103975772'
    })
  ],
  durationMs: 43000
});

const bakingSlide = collectionSlide({
  eyebrow: 'Backen',
  title: 'Backen',
  author: 'Kuchen, Brot und Familienküche',
  palette: ['#f1d4b1', '#8a4f45'],
  symbol: '♨',
  backgroundTitles: [
    { label: 'Klassiker', title: 'Backen macht Freude', author: 'Dr. Oetker' },
    { label: 'Brot', title: 'Brot backen in Perfektion', author: 'Lutz Geißler' },
    { label: 'Kuchen', title: 'Kuchen aus der Pfanne', author: 'GU Küchenratgeber' },
    { label: 'Familie', title: 'Kinderleichte Familienrezepte', author: 'gemeinsam kochen' },
    { label: 'Handwerk', title: 'Sauerteig', author: 'Zeit, Mehl und Wasser' }
  ],
  books: [
    topicBook({
      eyebrow: 'Backbuch',
      title: 'Teigliebe',
      author: 'Anna Röpfl',
      isbn: '9783710605703'
    }),
    topicBook({
      eyebrow: 'Familienbackbuch · 2025',
      title: 'Sallys Backen mit Kindern',
      author: 'Saliha Özcan',
      isbn: '9783833898563'
    }),
    topicBook({
      eyebrow: 'Neu seit 21. Oktober 2025',
      title: 'Einfach geil Backen',
      author: 'Axel Schmitt',
      isbn: '9783833899256'
    })
  ],
  durationMs: 41000
});

const litpromSlide = collectionSlide({
  eyebrow: 'Weltliteratur',
  title: 'Litprom',
  author: 'Drei Titel aus dem Litprom-Katalog 2026',
  palette: ['#d47aa8', '#62b6aa'],
  symbol: 'W',
  backgroundTitles: [
    { label: 'Übersetzung', title: 'Globale Literaturen', author: 'in deutscher Sprache' },
    { label: 'Afrika', title: 'Neue Stimmen', author: 'Romane und Erzählungen' },
    { label: 'Asien', title: 'Gegenwartsliteratur', author: 'aus vielen Sprachen' },
    { label: 'Lateinamerika', title: 'Literarische Entdeckungen', author: 'übersetzt ins Deutsche' },
    { label: 'Indigen', title: 'Geschichten und Erinnerung', author: 'Perspektiven weltweit' }
  ],
  books: [
    topicBook({
      eyebrow: 'China · Neu seit 28. Mai 2026',
      title: 'Der große Kanal',
      author: 'Xu Zechen',
      isbn: '9783751810715'
    }),
    topicBook({
      eyebrow: 'Japan · Neu seit 20. April 2026',
      title: 'Heimkehr nach Morioka',
      author: 'Yuki Ibuki',
      isbn: '9783458645726'
    }),
    topicBook({
      eyebrow: 'Japan · Neu seit 10. Februar 2026',
      title: 'Richtig gutes Essen',
      author: 'Junko Takase',
      isbn: '9783755800859'
    })
  ],
  durationMs: 42000
});

const groupsSlide = {
  type: 'community',
  eyebrow: 'Raum für Ideen',
  kicker: '',
  title: 'Gruppen gesucht',
  author: 'Unser Keller möchte genutzt werden',
  audience: '',
  focus:
    'Lesezirkel, Spielrunde, Schreibtreff, Manga-Club oder Nachbarschaftsgruppe: Wir suchen Menschen, die unten etwas Gutes anfangen wollen.',
  note: 'Sprecht uns im Laden an, wenn ihr einen regelmäßigen Treff sucht.',
  palette: ['#17140e', '#05070b'],
  symbol: '↘',
  durationMs: 34000,
  media: {
    kind: 'image',
    src: `${BASE}media/community/groups-reference.png`,
    alt: 'Eine musizierende Gruppe im Keller des Schnelsener Bücherecks'
  }
};

export const slides = [
  everyDaySlide,
  currentAffairsSlide,
  politicsSlide,
  citySlide,
  litpromSlide,
  mangaCollectionSlide,
  youngAdultCollectionSlide,
  childrenCollectionSlide,
  bakingSlide,
  groupsSlide,
  readAgainSlide,
  canYouReadSlide
];
