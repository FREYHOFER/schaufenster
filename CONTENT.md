# Redaktioneller Stand: 22. Oktober 2026

Die Themen Aktuelles, Politik & Weltordnung, Mobilität & Stadtentwicklung,
Litprom, Manga, Young Adult, Kinder & Familie und Backen bleiben erhalten.
25 gedruckte Titel, davon 22 neu gegenüber dem August-Stand. Urban Transformation
Playbook, Zerstörungslust (Taschenbuch) und Einfach geil Backen bleiben passend zu
ihren Themen im Programm. Das Backbuch von 2025 wird als solche Ausgabe bezeichnet.

## Kriterien

- Neue verfügbare Ausgaben aus August bis Oktober 2026 bevorzugen.
- Zeitnahe Vorschauen klar kennzeichnen: One Piece 113 und PandoraHearts Pearls 7
  am 27.10., The Lion and the Deathless Dark am 29.10.2026.
- Titel, Autor, gedruckte ISBN, Altersangabe und Erscheinungstermin anhand der in
  `src/catalog.js` verlinkten Verlags-, Katalog- oder Handelsquelle prüfen.
- Keine unbelegten Bestsellerplätze und keine Zusagen über Ladenbestand.
- Die drei Weltliteratur-Titel sind im Litprom-Katalog verzeichnet; sie werden
  nicht als aktuelle Weltempfänger-Bestenliste ausgegeben.
- Bei nur monatsgenau angekündigter Veröffentlichung keinen Tag erfinden.
  Morbide Mobilität bleibt deshalb mit dem Hinweis „Termin im Shop prüfen“ versehen.
- Bei Das Taiwan-Tagebuch die gedruckte ISBN 9783755800750 verwenden. Die separat
  verlinkte Handelsquelle unterscheidet diese Ausgabe von der im Litprom-Eintrag
  genannten ISBN. Cover und Shop-Link gehören zur gedruckten Ausgabe.
- Bücher im Hintergrund durch Themenwörter ersetzen, damit dort keine alten oder
  erfundenen Empfehlungen stehen.

## Aktualisierung

1. Einträge in `src/catalog.js` samt Quellen und Prüftermin aktualisieren.
2. Unveränderte Frontcover unter `public/media/covers/<ISBN>.jpg` ergänzen.
   Neue Cover stammen von den verlinkten Verlagen bzw. aus dem JPC-Coverdienst.
3. `node scripts/generate-qr-codes.mjs` ausführen.
4. `node scripts/validate-content.mjs` und `npm run build` prüfen.
5. Die gebaute Website mit `node scripts/verify-catalog.mjs <Basis-URL>` prüfen.
6. Über GitHub/Vercel veröffentlichen und dieselben Prüfungen an der Live-URL ausführen.

Vorbestellungen werden bei jedem Laden anhand des Berliner Datums bestimmt.
Am Erscheinungstag wird daraus ein normaler Shop-Hinweis; die Lieferbarkeit muss
weiter im Shop geprüft werden. Eine erneute Titelrecherche wird dadurch nicht ersetzt.
