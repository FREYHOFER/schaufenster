# Schaufenster-Diashow

Ein bewusst reduzierter Prototyp für ein digitales Buchhandlungs-Schaufenster: automatisch laufend, per Pfeiltasten durchsehbar und immer auf genau einen Tipp fokussiert.

## Inhalt

- Zehn kuratierte Titel für ein jüngeres Publikum: vier Manga, drei Young-Adult- und drei Kinderbücher.
- Zwei Übersichtsseiten zeigen die Manga- und Young-Adult-Auswahl jeweils gemeinsam.
- Vier cremeweiße Diogenes-Spruchfolien und die Seite „Gruppen gesucht“ zwischen den Buchtipps.
- Die Einzeltipps zeigen ein animiertes 3D-Buch mit Klappentext-Fassung und ruhiger Lesedauer.
- Instagram-Momente aus lokalen Feed-Videos mit reduziertem Follow-Hinweis.
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

## Buch-Rendering

Die Buchfolien verwenden die aus `tiktokshop` übernommene Three.js-Pipeline live im Browser. Die Projektdateien und flachen Frontcover liegen unter `public/book-projects/`; fällt WebGL aus, zeigt die Website automatisch das bisherige Cover.

Ein neues Projekt wird aus einem lokalen Cover erzeugt mit:

```bash
python -m pip install -r requirements.txt
npm run book:project -- "Buchtitel" --isbn 9780000000000 --author "Autor Name" --cover public/media/covers/9780000000000.jpg --pages 320
```

Mit `--render` erzeugt dasselbe Skript zusätzlich MP4, Standbilder und Hero-PNG. Dafür werden Chrome, `playwright-core` und ffmpeg beziehungsweise `imageio-ffmpeg` verwendet.
