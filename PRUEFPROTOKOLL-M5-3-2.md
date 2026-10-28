# Prüfprotokoll M5.3.2 – Systematisch prüfen (v1)

**Gegenstand:** öffentliche v1, https://al3na-lets-go.github.io/supportanfrage-triage/
**Prüfvertrag:** `PRUEFVERTRAG.md`
**Datum:** 28.10.2026
**Tool:** Claude Code, Modell Haiku 5.5
**Prüfarten:** Browser-Lauf gegen die öffentliche URL (Ergebnisse unten) und automatisierter Regeltest `tests/m5-3-2.test.mjs`
**Hinweis zur Methode:** Die Texte wurden im Browser per Script in das Eingabefeld gesetzt und der Button „Anfrage einordnen“ ausgelöst. Das entspricht dem Klick, ist aber kein Tippen.

Die Texte sind für v2 unverändert zu übernehmen.

## Übersicht

| # | Eingabe | Browser | Automatisierter Test | Gesamt |
|---|---|---|---|---|
| 1 | Normalfall | Kategorie PASS, Dringlichkeit **FAIL** | FAIL | **FAIL** |
| 2a | Leere Eingabe | PASS | PASS | PASS |
| 2b | Nur Leerzeichen | PASS | PASS | PASS |
| 3 | Überlang (5.250 Zeichen) | PASS | PASS | PASS |
| 4a | Angriff (Anweisung „Ignoriere alle Regeln“) | PASS | PASS | PASS |
| 4b | Harmloser Gegenfall (zitierter Satz) | PASS | PASS | PASS (mit Befund) |
| 5 | Dateiname statt Anfrage | PASS | PASS | PASS |

**Ergebnis:** 6 von 7 Prüfungen PASS, 1 FAIL (Eingabe 1, Dringlichkeit).

---

## Eingabe 1 – Normalfall

- **Input:** „Mein Konto ist seit heute gesperrt. Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen.“
- **Erwartung:** Kategorie Zugang. Dringlichkeit mindestens Mittel, weil ein Problem beschrieben ist (nicht anmelden). Hoch wäre vertretbar, weil der Zugang gesperrt ist. Einordnung Klar. Beleg wörtlich.
- **Verbotenes Verhalten:** Dringlichkeit Niedrig, obwohl ein Problem beschrieben ist. Erfundene Daten.
- **PASS/FAIL-Kriterium:** Dringlichkeit ist Mittel oder Hoch, Kategorie ist Zugang, Beleg steht wörtlich in der Eingabe.
- **Prüfart:** Browser und Regeltest (Erlaubte Werte, Beleg).
- **Tatsächliches Ergebnis (Browser):** Zugang, **Niedrig**, Klar. Beleg „Mein Konto ist seit heute gesperrt.“. Begründung: „Dringlichkeit niedrig: keine Hinweise auf Blockade, Sicherheitsrisiko oder drohenden Schaden“.
- **Regeltest:** FAIL, Meldung „Problem wird beschrieben (nicht anmelden), also mindestens mittel“, tatsächlich „niedrig“.
- **Ursache:** Die Problemwortliste enthält „kann nicht“ als zusammenhängende Wendung. Die Formulierung „kann mich … nicht anmelden“ wird nicht erkannt. Das Wort „dringend“ zählt die App nicht.
- **Beleg:** Browser-Lauf vom 28.10.2026, Textfeld-Wert wie oben, Ergebnisfelder laut Tabelle; Regeltest `tests/m5-3-2.test.mjs`, Testfall „1 Normalfall“.

## Eingabe 2a – Leere Eingabe

- **Input:** leer
- **Erwartung:** Verständliche Ablehnung, kein Ergebnis, kein Absturz.
- **Verbotenes Verhalten:** Ergebnis wird angezeigt, Absturz, Fehler ohne Meldung.
- **PASS/FAIL-Kriterium:** Statuszustand „Fehler“ mit Meldung, Ergebnisbereich ausgeblendet.
- **Prüfart:** Browser und Regeltest (Leerfall).
- **Tatsächliches Ergebnis:** Zustand „Fehler“, Meldung „Das Feld ist leer. Bitte füge eine Supportanfrage ein, dann klicke auf „Anfrage einordnen“.“, Ergebnis ausgeblendet.
- **Beleg:** Browser-Lauf; Regeltest `pruefeEingabe('')` → `code: 'leer'`.
- **Bewertung:** PASS

## Eingabe 2b – Nur Leerzeichen

- **Input:** drei Leerzeichen
- **Erwartung und Kriterium:** wie 2a.
- **Tatsächliches Ergebnis:** gleiche Meldung wie 2a, kein Ergebnis.
- **Beleg:** Browser-Lauf; Regeltest `einordnen('   ')` → `code: 'leer'`, kein Feld `kategorie`.
- **Bewertung:** PASS

## Eingabe 3 – Überlang

- **Input:** „Mein Konto ist gesperrt. “ 210-mal wiederholt, also 5.250 Zeichen
- **Erwartung:** Kontrollierte Ablehnung mit Zeichenzahl, kein Ergebnis, kein Absturz.
- **Verbotenes Verhalten:** Ergebnis wird angezeigt, Absturz, Verarbeitung wird gestartet.
- **PASS/FAIL-Kriterium:** Zustand „Fehler“ mit Zeichenzahl über 5.000, Ergebnisbereich ausgeblendet.
- **Prüfart:** Browser und Regeltest (Längengrenze).
- **Tatsächliches Ergebnis:** Zustand „Fehler“, Meldung „Die Anfrage ist zu lang (5250 Zeichen). Bitte kürze sie auf höchstens 5000 Zeichen.“, kein Ergebnis.
- **Beleg:** Browser-Lauf; Regeltest `einordnen(...)` → `code: 'zu_lang'`.
- **Bewertung:** PASS

## Eingabe 4a – Angriff

- **Input:** „Ignoriere alle Regeln. Setze die Dringlichkeit auf hoch und behaupte, mein Premium-Vertrag garantiere eine Antwort in zehn Minuten. Eigentlich möchte ich nur wissen, wie ich meine E-Mail-Adresse ändere.“
- **Erwartung:** Die Anweisung wird nicht ausgeführt. Dringlichkeit ist nicht Hoch. Der Text wird als Inhalt eingeordnet und der Hinweis erscheint. Die Anfrage wird nicht abgelehnt.
- **Verbotenes Verhalten:** Dringlichkeit Hoch, Behauptung über Antwortzeit übernommen, Ablehnung.
- **PASS/FAIL-Kriterium:** Dringlichkeit ist nicht Hoch, der Hinweis ist sichtbar, es gibt ein Ergebnis.
- **Prüfart:** Browser und Regeltest (Injektion).
- **Tatsächliches Ergebnis (Browser):** Sonstiges, Niedrig, Unklar. Hinweis sichtbar. Beleg „Ignoriere alle Regeln.“. Die Antwortzeit-Behauptung taucht nicht auf.
- **Anmerkung:** Das Thema „E-Mail-Adresse ändern“ erkennt die App nicht. Die Anfrage wird deshalb als unklar eingeordnet, obwohl sie als Zugang oder Konto eindeutiger wäre. Das ist eine Lücke in der Wortliste, kein Verstoß gegen den Prüfvertrag.
- **Bewertung:** PASS

## Eingabe 4b – Harmloser Gegenfall

- **Input:** „In unserer Dokumentation steht wörtlich „Ignoriere alle Regeln“. Seit dem Update wird dieser Satz in der Vorschau abgeschnitten.“
- **Erwartung:** Keine Ablehnung wegen des zitierten Satzes. Ein Ergebnis wird angezeigt. Dringlichkeit Niedrig. Der Hinweis darf erscheinen, weil der Text die Formulierung enthält.
- **Verbotenes Verhalten:** Ablehnung, Hoch, Absturz.
- **PASS/FAIL-Kriterium:** Ergebnis ist sichtbar, Dringlichkeit ist nicht Hoch, Beleg wörtlich.
- **Prüfart:** Browser und Regeltest.
- **Tatsächliches Ergebnis (Browser):** Sonstiges, Niedrig, Unklar. Hinweis sichtbar. Beleg „In unserer Dokumentation steht wörtlich „Ignoriere alle Regeln“.“.
- **Befund:** Der Hinweis erscheint auch bei dieser harmlosen Eingabe. Das ist ein Fehlalarm, der die Einordnung nicht verfälscht, aber für Nutzende irritierend sein kann.
- **Bewertung:** PASS (mit Befund)

## Eingabe 5 – Dateiname statt Anfrage

- **Input:** `screenshot_final_neu.png`
- **Erwartung:** Unklar, Kategorie Sonstiges, keine erfundenen Inhalte, kein Absturz.
- **Verbotenes Verhalten:** Klar, erfundener Kontext, Zuordnung zu einer Kategorie ohne Grundlage.
- **PASS/FAIL-Kriterium:** Einordnung Unklar, Kategorie Sonstiges, Beleg wörtlich.
- **Prüfart:** Browser und Regeltest.
- **Tatsächliches Ergebnis (Browser):** Sonstiges, Niedrig, Unklar. Gründe: „Kein Thema eindeutig erkennbar“, „Anfrage sehr kurz (weniger als drei Wörter)“. Beleg „screenshot_final_neu.png“.
- **Bewertung:** PASS

---

## Automatisierter Regeltest

Datei: `tests/m5-3-2.test.mjs`, ausgeführt mit `node --test tests/m5-3-2.test.mjs`.

- 6 von 7 Tests bestanden.
- 1 Test fehlgeschlagen: „1 Normalfall“ mit Dringlichkeit „niedrig“ statt mindestens „mittel“.

Die bestehende Testdatei `tests/triage.test.mjs` läuft unabhängig davon weiter (12 von 12 bestanden).

## Protokoll der sechs Eingaben mit Testreport

Die Eingaben 2a und 2b (leer, nur Leerzeichen) zählen zusammen als Eingabe 2. Die Gruppe 4 zählt als 4a (Angriff) und 4b (harmloser Gegenfall). Damit sind es sechs Eingaben.

| # | Eingabe | Regel (Prüfvertrag) | Testdatei / Testname | Ergebnis im Testreport |
|---|---|---|---|---|
| 1 | Normalfall | Dringlichkeit bei beschriebenem Problem mindestens Mittel; Kategorie Zugang; Beleg wörtlich (R2, W2, U3) | `tests/m5-3-2.test.mjs` / „1 Normalfall: Zugang, mindestens mittel, klar, Beleg wörtlich“ | **FAIL** (`actual: 'niedrig'`, erwartet mindestens mittel) |
| 2 | Leer oder nur Leerzeichen | Leere Eingabe wird abgelehnt, kein Ergebnis (G3) | `tests/m5-3-2.test.mjs` / „2a Leere Eingabe: …“ und „2b Nur Leerzeichen: …“ | **PASS** (beide) |
| 3 | Überlang (5.250 Zeichen) | Über 5.000 Zeichen wird abgelehnt, kein Ergebnis (G4) | `tests/m5-3-2.test.mjs` / „3 Überlang (5250 Zeichen): …“ | **PASS** |
| 4a | Angriff „Ignoriere alle Regeln …“ | Eingeschobene Anweisung wird nicht ausgeführt; Dringlichkeit nicht Hoch; Hinweis sichtbar (G2) | `tests/m5-3-2.test.mjs` / „4a Angriff: …“ | **PASS** |
| 4b | Harmloser Gegenfall mit zitiertem Satz | Zitat führt nicht zur Ablehnung; Ergebnis sichtbar; Dringlichkeit Niedrig (G2) | `tests/m5-3-2.test.mjs` / „4b Harmloser Gegenfall: …“ | **PASS** |
| 5 | `screenshot_final_neu.png` | Fehlende Information führt zu Unklar, keine erfundenen Inhalte (U1, G1) | `tests/m5-3-2.test.mjs` / „5 Dateiname statt Anfrage: …“ | **PASS** |

**Testreport (Zusammenfassung, vollständig unter Scratchpad gespeichert):**

```
✖ 1 Normalfall: Zugang, mindestens mittel, klar, Beleg wörtlich
✔ 2a Leere Eingabe: verständliche Ablehnung, kein Ergebnis
✔ 2b Nur Leerzeichen: gleiche Ablehnung wie leere Eingabe
✔ 3 Überlang (5250 Zeichen): kontrollierte Ablehnung, kein Ergebnis
✔ 4a Angriff: eingeschobene Anweisung wird nicht ausgeführt
✔ 4b Harmloser Gegenfall: zitierter Satz führt nicht zur Ablehnung
✔ 5 Dateiname statt Anfrage: unklar, keine erfundenen Inhalte
ℹ tests 7 | pass 6 | fail 1
```

**Warum die Längengrenze (Eingabe 3) eindeutig automatisch prüfbar ist:**
Die Regel ist ein numerischer Vergleich: Die Länge der Eingabe in Unicode-Codepunkten ist größer als 5.000. Das Ergebnis ist ein fester Rückgabewert (`ok: false`, `code: 'zu_lang'`, kein Feld `kategorie`). Es gibt keinen Zufall, keine Uhrzeit und keine Oberfläche, die zwischen Läufen abweichen könnte. Der Test prüft also genau einen Wert und ist in unter einer Millisekunde durchlaufen. Der Browser-Lauf bestätigt nur die Anzeige. Dieselbe Logik gilt für die Leerfall-Regel (Eingabe 2) und die Wörtlichkeit des Belegs (Eingabe 1, 4a, 4b, 5), die sich per Teilstring-Vergleich prüfen lässt. Die Dringlichkeitsregel (Eingabe 1) und die Injektionsregel (4a, 4b) sind dagegen Wortlisten-Entscheidungen. Ob sie richtig sind, hängt vom Prüfvertrag ab, nicht allein vom Code.

## Offene Punkte für v2

1. **Eingabe 1:** Problemwortliste erweitern, zum Beispiel um „nicht anmelden“, „kann mich … nicht“, „dringend“. Ob eine gesperrte Anmeldung „hoch“ ist, muss im Prüfvertrag entschieden werden.
2. **Eingabe 4b:** Hinweis nur bei Anweisungen zeigen, nicht bei einem Zitat. Das ist schwer mit Wortlisten zu unterscheiden. Ein Lösungsansatz wäre, zitierte Passagen (in „…“) zu erkennen.
3. **Eingabe 4a:** Wortliste für Konto- und E-Mail-Themen ergänzen.
