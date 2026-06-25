# Schaufenster-Diashow

Ein bewusst reduzierter Prototyp für ein digitales Buchhandlungs-Schaufenster: automatisch laufend, per Pfeiltasten durchsehbar und immer auf genau einen Tipp fokussiert.

## Inhalt

- Zehn kuratierte Titel für ein jüngeres Publikum: vier Manga, drei Young-Adult- und drei Kinderbücher.
- Zwei Übersichtsseiten zeigen die Manga- und Young-Adult-Auswahl jeweils gemeinsam.
- Vier cremeweiße Diogenes-Spruchfolien und die Seite „Gruppen gesucht“ zwischen den Buchtipps.
- Die Einzeltipps zeigen klare Buchcover mit Klappentext-Fassung und ruhiger Lesedauer.
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

## Buchcover

Die Live-Website rendert Buchfolien direkt aus den Coverbildern unter `public/media/covers/`.

Ein neues Cover wird ergänzt, indem die Datei unter ihrer ISBN abgelegt und in `src/slides.js` referenziert wird, zum Beispiel:

```bash
public/media/covers/9780000000000.jpg
```
