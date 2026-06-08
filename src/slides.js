// Aktualisiert am 08.06.2026: 10 neuere Titel aus den Ladenfotos, plus lokale Instagram-Videos.
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
  source,
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
    source,
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
      alt: `Instagram-Video ${index + 1} vom Schnelsener Buechereck`,
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
      'Virale Videos erschuettern die Politik: Eine Frau behauptet, eine Affaere mit dem Kanzler gehabt zu haben. Kurz darauf verschwindet Henrik Westphal, und Art Mayer findet im Berliner U-Bahn-Tunnel eine entstellte Leiche.',
    note:
      'Ein Art-Mayer-Thriller mit politischem Druck, alten Verletzungen und der Frage, wem man noch trauen kann.',
    source: 'Ullstein / Fotoauswahl',
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
      'Bruno entdeckt bei einem verfallenen Schloss ein Grab mit drei Skeletten aus Kriegszeiten. Waehrend er alten Verbrechen nachgeht, droht in Saint-Denis neues Chaos durch Hochwasser und politische Gaeste.',
    note:
      'Suedfrankreich, Geschichte und Dorfpolizei: ein ruhiger Krimi mit dunklem Kern.',
    source: 'Diogenes / Fotoauswahl',
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
      'An einem Sommertag verschwindet die vierjaehrige Poppy in Oxford. DI Ray Wilkins ermittelt offiziell, waehrend sein suspendierter Ex-Partner Ryan auf eigene Faust in die Unterwelt abtaucht.',
    note:
      'Britischer Ermittlerkrimi mit einem ungleichen Duo und einer Suche gegen die Zeit.',
    source: 'Penguin / Goldmann',
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
      'Eine Polizistin sucht nach Antworten zum Tod ihres Mannes, eine Staatsanwaeltin verfolgt Cum-Ex-Spuren, und drei alte Freunde geraten mit riskanten Aktiengeschaeften immer tiefer in die Grauzone.',
    note:
      'Politisch brisanter Kriminalroman ueber Gier, Schuld und die Rechnung, die irgendwann faellig wird.',
    source: 'DuMont / Fotoauswahl',
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
      'Als Henry Clayton an den Seven Sisters stirbt, glaubt die Polizei an Selbstmord. Seine Therapeutin Pat Philipps ist sicher: Henry wurde gestossen. Also stellt sie selbst die Fragen, die andere meiden.',
    note:
      'Ein Cosy-Krimi mit psychologischem Blick, britischer Kueste und einer Ermittlerin, die Menschen lesen kann.',
    source: 'Ullstein / Fotoauswahl',
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
      'Isabelle Bonnet liebt schnelle Autos, doch bei einer Rallye in der Provence bleibt es nicht beim Adrenalin. Zwischen Motoren, Rivalitaeten und Urlaubsidylle muss sie einen toedlichen Fall entwirren.',
    note:
      'Sommerlicher Provence-Krimi fuer alle, die Spannung gern mit Sonne, Tempo und franzoesischem Flair lesen.',
    source: 'Droemer Knaur / Fotoauswahl',
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
      'Bruno findet ein verlassenes Auto und darin eine tote Frau. Was wie Selbstmord aussehen soll, fuehrt ihn zu alten Beziehungen, einem schwarzen Schaf in der Gendarmerie und Gefahr fuer den eigenen Ruf.',
    note:
      'Der achtzehnte Bruno-Fall verbindet Périgord-Atmosphaere, leise Komik und klassische Ermittlungsarbeit.',
    source: 'Diogenes / Fotoauswahl',
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
      'Tommi und Svetlana hoeren im Radio einen Reiseruf, kurz darauf sehen sie den gesuchten Wagen. Die Fahrerin ist verschwunden, und aus einer Rastplatzspur wird ein abgruendig komischer Kriminalfall.',
    note:
      'Schraeger Humor, Caravan-Ermittlungen und zwei Figuren, die sich hartnaeckig in jedes Chaos hineinziehen.',
    source: 'Penguin / Fotoauswahl',
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
      'Kurz vor dem grossen Fado-Festival verschwindet die gefeierte Saengerin Dária Vale. Henrik Falkner und Helena Gomes folgen Spuren durch Lissabons Gassen, bis Musik, Macht und Politik gefaehrlich nah ruecken.',
    note:
      'Lissabon-Krimi mit Fado, Tempo und einer Verschwoerung, die mehr bedroht als nur ein Festival.',
    source: 'Penguin / Heyne',
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
      'In Schonen wird Gunni Hilding 1989 zu den Gewaltverbrechen geholt. Ein neuer Fall legt alte Spuren frei und wirft die Frage auf, ob ein Serientaeter viel zu lange unentdeckt geblieben ist.',
    note:
      'Skandinavische Spannung mit klassischer Ermittlungsarbeit, Familiengeheimnissen und langsam wachsendem Druck.',
    source: 'Penguin / Blanvalet',
    palette: ['#ece6d3', '#b7aa31'],
    symbol: 'TE',
    isbn: '9783764510152',
    durationMs: 39000
  })
];

const instagramSlides = instagramVideos.map(instagramMoment);

export const slides = [
  bookSlides[0],
  bookSlides[1],
  instagramSlides[0],
  bookSlides[2],
  bookSlides[3],
  instagramSlides[1],
  bookSlides[4],
  instagramSlides[2],
  bookSlides[5],
  bookSlides[6],
  instagramSlides[3],
  bookSlides[7],
  instagramSlides[4],
  bookSlides[8],
  instagramSlides[5],
  bookSlides[9],
  instagramSlides[6],
  instagramSlides[7],
  instagramSlides[8]
];
