// Aktualisiert am 08.06.2026: 10 neuere Titel aus den Ladenfotos.
export const slideDurationMs = 42000;

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
  note,
  palette,
  symbol,
  isbn,
  coverExt = 'jpg',
  durationMs = 40000
}) {
  return {
    type: 'book',
    eyebrow: month,
    kicker: '',
    title,
    author,
    focus,
    note,
    palette,
    symbol,
    isbn,
    durationMs,
    media: {
      kind: 'image',
      src: `/media/covers/${isbn}.${coverExt}`,
      alt: `Cover von ${title}`
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
      src: `/media/instagram/${shortcode}.mp4`,
      alt: `Instagram-Video ${index + 1} vom Schnelsener Büchereck`,
      sourceUrl: `https://www.instagram.com/p/${shortcode}/`,
      loop: true
    }
  };
}

const bookSlides = [
  bookSlide({
    month: 'Neu seit 28. Mai 2026',
    title: 'Im Morgengrauen',
    author: 'Marc Raabe',
    focus:
      'Virale Videos erschüttern die Politik: Eine Frau behauptet, eine Affäre mit dem Kanzler gehabt zu haben. Kurz darauf verschwindet Henrik Westphal, und Art Mayer findet im Berliner U-Bahn-Tunnel eine entstellte Leiche.',
    note:
      'Ein Art-Mayer-Thriller mit politischem Druck, alten Verletzungen und der Frage, wem man noch trauen kann.',
    palette: ['#f0df58', '#26301c'],
    symbol: 'MR',
    isbn: '9783864933653',
    durationMs: 42000
  }),
  bookSlide({
    month: 'Neu seit 20. Mai 2026',
    title: 'Déjà-vu',
    author: 'Martin Walker',
    focus:
      'Bruno entdeckt bei einem verfallenen Schloss ein Grab mit drei Skeletten aus Kriegszeiten. Während er alten Verbrechen nachgeht, droht in Saint-Denis neues Chaos durch Hochwasser und politische Gäste.',
    note:
      'Südfrankreich, Geschichte und Dorfpolizei: ein ruhiger Krimi mit dunklem Kern.',
    palette: ['#d8e6d3', '#53765b'],
    symbol: 'MW',
    isbn: '9783257248432',
    durationMs: 39000
  }),
  bookSlide({
    month: 'Neu seit 13. Mai 2026',
    title: 'Das kalte Herz von Oxford',
    author: 'Simon Mason',
    focus:
      'An einem Sommertag verschwindet die vierjährige Poppy in Oxford. DI Ray Wilkins ermittelt offiziell, während sein suspendierter Ex-Partner Ryan auf eigene Faust in die Unterwelt abtaucht.',
    note:
      'Britischer Ermittlerkrimi mit einem ungleichen Duo und einer Suche gegen die Zeit.',
    palette: ['#202623', '#64b47b'],
    symbol: 'OX',
    isbn: '9783442495658',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Neu im Mai 2026',
    title: 'Die Summe aller Dinge',
    author: 'Oliver Bottini',
    focus:
      'Eine Polizistin sucht nach Antworten zum Tod ihres Mannes, eine Staatsanwältin verfolgt Cum-Ex-Spuren, und drei alte Freunde geraten mit riskanten Aktiengeschäften immer tiefer in die Grauzone.',
    note:
      'Politisch brisanter Kriminalroman über Gier, Schuld und die Rechnung, die irgendwann fällig wird.',
    palette: ['#1d2228', '#f0f3f5'],
    symbol: 'OB',
    isbn: '9783832181482',
    coverExt: 'png',
    durationMs: 42000
  }),
  bookSlide({
    month: 'Neu seit 07. Mai 2026',
    title: 'Die Therapeutin und ihre Mörder',
    author: 'Philippa Perry',
    focus:
      'Als Henry Clayton an den Seven Sisters stirbt, glaubt die Polizei an Selbstmord. Seine Therapeutin Pat Philipps ist sicher: Henry wurde gestoßen. Also stellt sie selbst die Fragen, die andere meiden.',
    note:
      'Ein Cosy-Krimi mit psychologischem Blick, britischer Küste und einer Ermittlerin, die Menschen lesen kann.',
    palette: ['#f2f1df', '#d85a54'],
    symbol: 'PP',
    isbn: '9783864933905',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Neu seit 04. Mai 2026',
    title: 'Madame le Commissaire und die tödliche Rallye',
    author: 'Pierre Martin',
    focus:
      'Isabelle Bonnet liebt schnelle Autos, doch bei einer Rallye in der Provence bleibt es nicht beim Adrenalin. Zwischen Motoren, Rivalitäten und Urlaubsidylle muss sie einen tödlichen Fall entwirren.',
    note:
      'Sommerlicher Provence-Krimi für alle, die Spannung gern mit Sonne, Tempo und französischem Flair lesen.',
    palette: ['#a66b45', '#426f82'],
    symbol: 'PM',
    isbn: '9783426529966',
    durationMs: 38000
  }),
  bookSlide({
    month: 'Neu seit 22. April 2026',
    title: 'Bredouille',
    author: 'Martin Walker',
    focus:
      'Bruno findet ein verlassenes Auto und darin eine tote Frau. Was wie Selbstmord aussehen soll, führt ihn zu alten Beziehungen, einem schwarzen Schaf in der Gendarmerie und Gefahr für den eigenen Ruf.',
    note:
      'Der achtzehnte Bruno-Fall verbindet Périgord-Atmosphäre, leise Komik und klassische Ermittlungsarbeit.',
    palette: ['#e9ead8', '#3c6a40'],
    symbol: 'BR',
    isbn: '9783257073843',
    durationMs: 39000
  }),
  bookSlide({
    month: 'Neu seit 22. April 2026',
    title: 'Mord ist die beste Beseitigung',
    author: 'Volker Klüpfel',
    focus:
      'Tommi und Svetlana hören im Radio einen Reiseruf, kurz darauf sehen sie den gesuchten Wagen. Die Fahrerin ist verschwunden, und aus einer Rastplatzspur wird ein abgründig komischer Kriminalfall.',
    note:
      'Schräger Humor, Caravan-Ermittlungen und zwei Figuren, die sich hartnäckig in jedes Chaos hineinziehen.',
    palette: ['#e89a5b', '#24394a'],
    symbol: 'VK',
    isbn: '9783328603580',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Neu seit 16. April 2026',
    title: 'Portugiesisches Fieber',
    author: 'Luis Sellano',
    focus:
      'Kurz vor dem großen Fado-Festival verschwindet die gefeierte Sängerin Dária Vale. Henrik Falkner und Helena Gomes folgen Spuren durch Lissabons Gassen, bis Musik, Macht und Politik gefährlich nah rücken.',
    note:
      'Lissabon-Krimi mit Fado, Tempo und einer Verschwörung, die mehr bedroht als nur ein Festival.',
    palette: ['#2f3f47', '#d7a06d'],
    symbol: 'LS',
    isbn: '9783453442498',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Neu seit 16. April 2026',
    title: 'Tatort Trelleborg',
    author: 'Mattias Edvardsson',
    focus:
      'In Schonen wird Gunni Hilding 1989 zu den Gewaltverbrechen geholt. Ein neuer Fall legt alte Spuren frei und wirft die Frage auf, ob ein Serientäter viel zu lange unentdeckt geblieben ist.',
    note:
      'Skandinavische Spannung mit klassischer Ermittlungsarbeit, Familiengeheimnissen und langsam wachsendem Druck.',
    palette: ['#ece6d3', '#b7aa31'],
    symbol: 'TE',
    isbn: '9783764510152',
    durationMs: 39000
  })
];

export const slides = [...bookSlides];
