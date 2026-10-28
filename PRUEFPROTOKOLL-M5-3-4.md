# Protokoll M5.3.4 – Einen Fix bis zur v2 prüfen

**v1 (Root):** https://al3na-lets-go.github.io/supportanfrage-triage/
**v2 (`/v2/`):** https://al3na-lets-go.github.io/supportanfrage-triage/v2/
**Stand:** 28.10.2026

## 1. Befunde aus den Läufen

Schweregrade: 1 kosmetisch · 2 Umweg oder falsches Ergebnis · 3 Blockade oder unsicheres Verhalten.
Score = Schweregrad × Häufigkeit (Anzahl betroffener Läufe).

| Rang | Befund | Beobachtung | Betroffene Läufe | Schweregrad | Score |
|---|---|---|---|---|---|
| 1 | F1 | Normalfall „Mein Konto ist seit heute gesperrt. Ich kann mich trotz Passwort-Reset nicht anmelden …“ ergibt Dringlichkeit **Niedrig** statt mindestens Mittel | 4 von 4 (M5.3.2 Browser, M5.3.2 Regeltest, Playwright-Lauf 6, Playwright-Lauf 7) | 2 | **8** |
| 2 | F3 | „Ich möchte meine E-Mail-Adresse ändern“ (Teil von 4a) ergibt Sonstiges/Unklar, weil das Thema Konto nicht in den Wortlisten steht | 1 von 1 (M5.3.2 Browser) | 2 | 2 |
| 3 | F2 | Harmloser Satz mit zitiertem „Ignoriere alle Regeln“ (4b) zeigt den Injektionshinweis, obwohl die Anfrage harmlos ist | 1 von 1 (M5.3.2 Browser) | 1 | 1 |

**Warum F1 zuerst kommt:** Es hat den höchsten Score (8) und trifft den Kernpfad aus dem Prüfvertrag. Die Eingabe ist die Vorlage für den Playwright-Test, dessen Dringlichkeits-Assertion sie als einziges Problem bislang blockiert. Ein Sicherheitsproblem oder Schweregrad 3 wurde nicht beobachtet, deshalb gibt es keinen kritischen Befund. Bei 4b wurde die Anweisung nicht ausgeführt, die Dringlichkeit blieb Niedrig.

## 2. Bearbeitung von F1

| Feld | Eintrag |
|---|---|
| Symptom | Dringlichkeit „Niedrig“ bei einem gesperrten Konto, bei dem der Nutzer sich nicht anmelden kann |
| Vermutete Ursache | Die Blockade-Wortliste enthält die Wendung „nicht anmelden“ nicht. Die Problemliste erkennt sie ebenfalls nicht als zusammenhängende Wendung (`kann nicht` greift nicht). Deshalb wird der Text nicht als Blockade erkannt. |
| Genau eine umgesetzte Änderung | In `v2/triage.js` wurde `'nicht anmelden'` der Blockade-Wortliste hinzugefügt. Nichts anderes wurde geändert (Oberfläche, Texte und übrige Regeln unverändert, per `diff` geprüft). |
| Regression vor Fix | **FAIL**: `tests/regression-f1.test.mjs`, `actual: 'niedrig'`, `expected: 'hoch'` |
| Nach Fix | **PASS**: derselbe Test, 1 von 1 bestanden |

Hinweis zur Entscheidung: Die Einordnung „Hoch“ beruht auf der Annahme, dass eine Anmeldung, die nicht möglich ist, eine komplette Blockade ist. Diese Annahme steht im Prüfvertrag noch nicht ausdrücklich. Der Test für den Fall „Ich kann mich nicht anmelden“ wurde nicht separat geprüft.

## 3. Gesamte Suite

| Prüfung | Version | Ergebnis |
|---|---|---|
| Regeltests (`tests/triage.test.mjs`, 12 Tests) | v2 | 12 von 12 PASS |
| M5.3.2, sechs Eingaben, Gruppe 4 getrennt (`tests/m5-3-2.test.mjs`, 7 Tests) | v2 | 7 von 7 PASS |
| Regressionstest F1 (`tests/regression-f1.test.mjs`) | v2 | 1 von 1 PASS |
| Gesamt Node (`TRIAGE_MODULE=../v2/triage.js`) | v2 | **20 von 20 PASS** |
| Browser-Kernpfad (`tests/e2e/kernpfad.spec.js`, Chromium) | v2 öffentlich | **PASS** (1 von 1, 2,0 s) |
| Vergleich: gleiche Node-Tests auf v1 | v1 | 18 von 19 PASS, 1 FAIL (Normalfall, Dringlichkeit „Niedrig“) |

Der Kernpfad-Test prüft Kategorie „Zugang“, Dringlichkeit „Hoch“, nicht leeren nächsten Schritt, das Beleg-Zitat aus der Eingabe und das Fehlen erfundener Nummern. Alle Assertions laufen auf v2 durch.

## 4. Öffentliche v2

- URL: https://al3na-lets-go.github.io/supportanfrage-triage/v2/
- Kernpfad dort erneut geprüft: PASS (siehe oben).
- v1 bleibt unter der Root-URL unverändert erreichbar.

## 5. Nachweislich besser

- F1 ist behoben: Der Normalfall ergibt auf v2 „Hoch“, auf v1 „Niedrig“. Der Playwright-Kernpfad, der vorher bei der Dringlichkeit abbrach, besteht jetzt vollständig.

## 6. Verbleibende Befunde

1. **F3 (Score 2):** Das Thema „E-Mail-Adresse ändern“ wird nicht erkannt und als Sonstiges/Unklar eingeordnet. Nicht bearbeitet, weil nur der wichtigste Befund geändert wurde.
2. **F2 (Score 1):** Der Injektionshinweis erscheint auch bei einem harmlosen Zitat. Kosmetisch, Ergebnis korrekt. Nicht bearbeitet.

Offene Entscheidung: Ob „nicht anmelden“ dauerhaft als Blockade „Hoch“ gilt, muss im Prüfvertrag festgelegt werden.

Offen bleibt auch der Fünf-Minuten-Test mit einer fremden Person (optional, nicht durchgeführt).
