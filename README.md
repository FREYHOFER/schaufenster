# Schaufenster-Diashow

Ein bewusst reduzierter Prototyp für ein digitales Buchhandlungs-Schaufenster: automatisch laufend, per Pfeiltasten durchsehbar und immer auf genau einen Tipp fokussiert.

## Inhalt

Aktuelle Auswahl: **22. Oktober 2026**, 25 Titel in acht Themenbereichen.
Die bibliografischen Daten und Quellen stehen in [`src/catalog.js`](src/catalog.js).
[`CONTENT.md`](CONTENT.md) dokumentiert Auswahl und Pflege.

- Acht Themenübersichten mit 25 Büchern: Aktuelles, Politik, Stadt, Litprom,
  Manga, Young Adult, Kinder und Backen.
- Drei Spruchfolien und die Seite „Gruppen gesucht“ ergänzen die Buchauswahl.
- Buchcover mit bibliografischen Angaben und zugehörigem Shop-QR-Code.
- Instagram- und Videofolien bleiben deaktiviert.
- Dezente Pfeilnavigation und Tastatursteuerung: Die Präsentation läuft trotzdem wie eine ruhige Diashow.

## Entwicklung

```bash
npm install
npm run start
```

## Checks

```bash
npm test
npm run build
```

## Buchcover

Die Live-Website rendert Buchfolien direkt aus den Coverbildern unter `public/media/covers/`.

Ein neues Cover wird ergänzt, indem die Datei unter ihrer ISBN abgelegt und in `src/slides.js` referenziert wird, zum Beispiel:

```bash
public/media/covers/9780000000000.jpg
```

## QR-Codes für Bestellungen

Jeder sichtbare Titel hat einen QR-Code zur direkten Produktseite im Onlineshop. Nach Änderungen an ISBNs oder Titeln bitte die QR-Codes neu erzeugen:

```bash
npm run generate:qr
```

`npm test` prüft außerdem, ob jeder QR-Code noch genau zum hinterlegten Shop-Link passt.
