# Lokale Schaufenster-Anzeige

Installiert am 27.10.2026 für den angemeldeten Benutzer, ohne Administratorrechte.

- Laufzeit, Starter und Inhalte liegen in `%USERPROFILE%\SchaufensterKiosk`.
  Der Ordner liegt bewusst außerhalb des von MSIX-Apps virtualisierten AppData-
  Verzeichnisses, damit Aufgabenplanung und Windows-Verknüpfungen ihn erreichen.
- Der bereits installierte Chrome öffnet `http://127.0.0.1:4186` im Vollbild mit
  eigenem Browserprofil; ohne Chrome dient Edge als Ersatz.
- Nur der zweite, nicht primäre Monitor wird verwendet. Seine aktuellen Koordinaten
  und seine Größe werden alle fünf Sekunden neu ermittelt.
- Der Wächter hält Windows während der Anzeige wach. Sperr- oder Sicherheitsregeln
  werden nicht geändert. Ohne zweiten Monitor wartet der Wächter.
- Die Aufgabe `Schaufenster - Offline Kiosk` startet nach der Anmeldung und prüft
  zusätzlich jede Minute, ob der Wächter läuft. Fehler werden erneut gestartet.
- Die vorhandenen Desktop- und Autostart-Verknüpfungen funktionieren weiterhin.
- Browserabsturz, Minimieren und ausbleibende Fortschritts-/Lebenszeichen werden
  erkannt. Der lokale Server wird bei Prozessende neu gestartet.

## Inhalte und Updates

`npm run build` schreibt `dist/offline-manifest.json`. Es enthält nur die tatsächlich
verwendeten Dateien: HTML, gebaute Skripte/Stile, 25 Cover, 25 QR-Codes und Gruppenbild.
Jede Datei hat Größe und SHA-256-Prüfsumme. Die Website wird weiterhin über GitHub
und Vercel veröffentlicht.

Der lokale Server prüft alle fünf Minuten auf eine neue Version. Er lädt diese in
ein eigenes Versionsverzeichnis, prüft alle Dateien und schaltet erst danach den
Versionszeiger um. Der Browser lädt anschließend neu. Bei fehlendem Internet,
Downloadfehlern oder unpassenden Prüfsummen bleibt die letzte Version aktiv.
Bei lokal beschädigter neuester Version wird eine vorhandene vorherige geprüfte
Version verwendet. Versionen bleiben zur Wiederherstellung gespeichert.

QR-Ziele bleiben die Internet-Shopseiten. Die Diashow selbst benötigt kein Internet;
zum Aufrufen des Shops braucht das scannende Telefon weiterhin eine Verbindung.

## Diagnose

- `watcher.log`: Monitorerkennung, Browserstarts und Wiederherstellungen.
- `server.log`: lokale Version, Downloadprüfung und Aktivierung.
- `server.stderr.log`: Startfehler des lokalen Servers.
- `supervisor.log`: Wiederherstellung des Wächters.
- `http://127.0.0.1:4186/__kiosk/health`: aktuelle Version und Lebenszeichen.

Backups des vorherigen Startskripts liegen unter `backup-<Datum-Uhrzeit>`.
Zum vollständigen Beenden zuerst die geplante Aufgabe beenden/deaktivieren und
den Wächter stoppen; ein bloßes Schließen des Browsers startet ihn absichtlich neu.

## Prüfung und erneute Installation

```powershell
node kiosk/test-server.mjs
node kiosk/test-offline-assets.mjs
npm run build
.\kiosk\Install-Kiosk.ps1 -NodeExecutable <node.exe> -BuiltSite <dist-Verzeichnis>
Start-ScheduledTask -TaskName 'Schaufenster - Offline Kiosk'
```

Nach Änderungen an Wächter, Server oder Client diese Dateien lokal neu installieren.
Automatische Web-Updates übertragen Inhalte, keine ausführbaren Windows-Starter.
