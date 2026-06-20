// Aktualisiert am 19.06.2026: Manga, Young Adult und Kinderbuch im Fokus.
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
    month: 'Manga · Neu seit 26. Mai 2026',
    title: 'One Piece 112',
    author: 'Eiichiro Oda',
    focus:
      'Die Strohhutbande erreicht endlich Elban, die sagenumwobene Insel der Riesen. Robin erlebt ein lang ersehntes Wiedersehen, während eine mysteriöse Box und Ruffys nächste Herausforderung schon neues Chaos ankündigen.',
    note:
      'Der Start des Elban-Arcs: große Abenteuer, viel Witz und echte Gefühle für Fans ab 10 Jahren.',
    palette: ['#f3d459', '#317d9c'],
    symbol: 'OP',
    isbn: '9783551804976',
    durationMs: 42000
  }),
  bookSlide({
    month: 'Manga · Neu ab 30. Juni 2026',
    title: 'Sakamoto Days 22',
    author: 'Yuto Suzuki',
    focus:
      'Tenkyu hat es auf die Wahrsagerin Atari abgesehen. Als Shin sieht, wie brutal sie verletzt wird, gerät das Familiencredo der Sakamotos ins Wanken: Kann er diejenigen schützen, die ihm wichtig sind, ohne zu töten?',
    note:
      'Rasante Actionkomödie um einen Auftragskiller im Fast-Ruhestand – passend zum Anime-Hype.',
    palette: ['#f4c94c', '#333948'],
    symbol: 'SD',
    isbn: '9783551808165',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Manga · Neu seit 26. Mai 2026',
    title: 'Blue Box 18',
    author: 'Kouji Miura',
    focus:
      'Nach dem Inter High fährt Taikis Badminton-Team ans Meer. Doch Chinatsus Basketballclub trainiert ganz in der Nähe, und aus der erhofften Auszeit wird ein sommerlicher Bewährungstest für Sport und Gefühle.',
    note:
      'Warmherzige Mischung aus Romance, Schulalltag, Basketball und Badminton – ab 12 Jahren.',
    palette: ['#d7edf4', '#4e7fac'],
    symbol: 'BB',
    isbn: '9783551807076',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Manga · Neustart am 30. Juni 2026',
    title: 'Shinobi Undercover 1',
    author: 'Ippon Takegushi & Santa Mitarashi',
    focus:
      'Der junge Ninja Yodaka soll die schüchterne Aoi beschützen. Dafür muss er undercover an ihre Highschool – eine Mission, bei der Schulalltag, soziale Ängste und Ninja-Pflichten herrlich kollidieren.',
    note:
      'Ein frischer Serienstart zwischen Action, Comedy und Slice of Life für Leser*innen ab 12.',
    palette: ['#f4df68', '#552f5b'],
    symbol: 'SU',
    isbn: '9783551808240',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Young Adult · Neu seit 1. April 2026',
    title: 'The Wolf King',
    author: 'Lauren Palphreyman',
    focus:
      'Prinzessin Aurora soll einen grausamen Lord heiraten. Nachdem sie einem jungen Wolf das Leben rettet, entführt Alpha Callum sie in das wilde Land jenseits der Grenze – und mitten in einen Krieg zwischen Menschen und Werwolf-Clans.',
    note:
      'Knistern, Gefahr und verfeindete Welten: ein zugänglicher Romantasy-Auftakt ab 16 Jahren.',
    palette: ['#23364b', '#d39b67'],
    symbol: 'WK',
    isbn: '9783551586759',
    durationMs: 42000
  }),
  bookSlide({
    month: 'Young Adult · BookTok-Favorit',
    title: 'Powerless – Das Spiel',
    author: 'Lauren Roberts',
    focus:
      'Im Königreich Ilya zählen nur magische Kräfte. Paedyn hat keine – und gibt sich dennoch als Hellseherin aus. Als sie Prinz Kai rettet, landet sie ausgerechnet in den tödlichen Auswahlspielen des Königs.',
    note:
      'Enemies-to-Lovers, Wettkampf und Rebellion: der bewährte Einstieg in die Powerless-Trilogie.',
    palette: ['#ece7df', '#31403c'],
    symbol: 'PW',
    isbn: '9783764533182',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Young Adult · Vorschau 31. August 2026',
    title: 'Embrace the Serpent',
    author: 'Sunya Mara',
    focus:
      'Saphira kann die Magie aus Edelsteinen wecken und lebt damit im Verborgenen. Als der gefürchtete Schlangenkönig nach ihr suchen lässt, gerät sie zwischen ein gnadenloses Kaiserreich, einen rätselhaften Herrscher und dessen charmanten Jäger.',
    note:
      'Magie, Verrat und verbotene Gefühle in einer Standalone-Romantasy ab 14 Jahren.',
    palette: ['#1d4b46', '#d9aa6a'],
    symbol: 'ES',
    isbn: '9783551587251',
    durationMs: 42000
  }),
  bookSlide({
    month: 'Kinderbuch · Abenteuer ab 10',
    title: 'Die Jagd nach den magischen Münzen',
    author: 'Jessie Burton',
    focus:
      'Bo findet im Schlamm der Themse eine schimmernde Münze und hört plötzlich den Fluss sprechen. Gemeinsam mit Billy sucht sie nach einer zweiten Münze – bevor der geheimnisvolle Muncaster sie ihnen wegschnappt.',
    note:
      'Poetische Spannung, Londoner Flussmagie und zwei Kinder auf der Suche nach einem unbezahlbaren Schatz.',
    palette: ['#123d49', '#d7b85f'],
    symbol: 'JM',
    isbn: '9783551559609',
    durationMs: 41000
  }),
  bookSlide({
    month: 'Kinderbuch · Vorlesen ab 6',
    title: 'Neon und Bor',
    author: 'Marc-Uwe Kling & Jan Cronauer',
    focus:
      'Neon und ihr hochbegabter Babybruder Bor lösen jedes Problem mit einer Erfindung: Aufräumroboter, Vergrößerungsblasenwerfer oder Zeitschleifenröhre. Dumm nur, dass jede Lösung meist ein noch größeres Problem baut.',
    note:
      'Schlaue, wilde Vorlesegeschichten mit MINT-Ideen und dem typischen Kling-Humor.',
    palette: ['#efe6c8', '#ef6c4d'],
    symbol: 'NB',
    isbn: '9783551522801',
    durationMs: 40000
  }),
  bookSlide({
    month: 'Kinderbuch · Vorlesen ab 3',
    title: 'Das große Buch vom kleinen WIR',
    author: 'Daniela Kunkel',
    focus:
      'Das kleine WIR entsteht, wenn Menschen zusammenhalten – in Freundschaften, Familien, Kindergarten und Schule. Der Sammelband bringt drei vollständige Bilderbuchgeschichten rund um das grüne Wuscheltier zusammen.',
    note:
      'Gefühle und Gemeinschaft werden sichtbar, besprechbar und wunderbar vorlesbar.',
    palette: ['#e8f0d3', '#6cae5c'],
    symbol: 'WIR',
    isbn: '9783551523860',
    durationMs: 39000
  })
];

export const slides = [...bookSlides];
