# Weihnachtsauswahl · 16. November 2026

Die Weihnachtsrotation zeigt pro Buchfolie genau ein Buch mit großem Cover,
Titel, Autor, Kurzbeschreibung und einem dauerhaft zugeordneten Produkt-QR-Code.
Sechs Weihnachtsbücher und sechs Geschenkideen werden durch vier weihnachtliche
Botschaften und die bestehende Gruppenfolie ergänzt. Eine Runde dauert 9 Minuten.

Die Weihnachtsauswahl samt Quellen steht in src/christmas.js. Gedruckte ISBNs,
Autorennamen und Inhaltsangaben wurden an Verlagsseiten und für die Penguin-Ausgabe
von Dickens zusätzlich bei JPC geprüft. Die Buchcover bleiben unverändert.
Die sechs ergänzenden Geschenkideen stammen aus dem bestehenden Oktober-Katalog.
Es werden keine Preise, Ladenbestände oder Liefertermine versprochen.

## Prüfung und Veröffentlichung

- node scripts/generate-qr-codes.mjs
- node scripts/validate-content.mjs
- npm run build (auf Vercel mit Basis /)
- node scripts/verify-christmas.mjs <Basis-URL>
- Offline-Manifest und Übernahme durch den lokalen Kiosk prüfen.

Der Offline-Build enthält nur tatsächlich angezeigte Bücher. Der lokale Kiosk
prüft alle fünf Minuten auf neue vollständige Versionen und lädt anschließend neu.
