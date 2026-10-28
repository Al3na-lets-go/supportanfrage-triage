# Supportanfrage – Triage (v1)

Kleine, responsive Web-App: Eine Supportanfrage einfügen, auf „Anfrage einordnen“ klicken. Die App zeigt Kategorie, Dringlichkeit, einen nächsten Schritt und ein wörtliches Beleg-Zitat.

- **Regelbasiert und lokal:** Die Einordnung läuft komplett im Browser (`triage.js`). Keine externe API, keine Datenbank, kein Login.
- **Nachvollziehbar:** Das Ergebnis zeigt, welche Wörter gegriffen haben („Warum dieses Ergebnis?“).
- **Unklare Fälle sind sichtbar:** Kein erkennbares Thema, Gleichstand zwischen Kategorien oder sehr kurze Anfragen werden als „unklar“ markiert.
- **Grenzen:** Leere Eingaben und Eingaben über 5.000 Zeichen werden abgelehnt und erzeugen kein Ergebnis.
- **Anweisungen im Text** (z. B. „Ignoriere alle Regeln“) werden nur als Inhalt behandelt und gemeldet.

## Dateien

- `index.html`, `styles.css`, `app.js`: Oberfläche und Zustände (bereit, Verarbeitung, Erfolg, unklare Anfrage, Fehler)
- `triage.js`: Regeln und Einordnung (Wortlisten sind dort offen einsehbar)
- `tests/triage.test.mjs`: Regeltests

## Lokal starten

Ohne Build-Schritt. Die Seite muss über einen HTTP-Server laufen, weil `triage.js` als ES-Modul geladen wird:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## Tests

```bash
npm test
```
