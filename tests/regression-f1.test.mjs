// Regressionstest für Befund F1 (M5.3.4).
// Beobachtet in den Läufen M5.3.2 (Browser + Regeltest) und Playwright (Kernpfad):
// Die Anfrage „gesperrt … nicht anmelden … dringend“ wurde als Dringlichkeit „Niedrig“ eingeordnet.
// Erwartet nach dem Playwright-Kernpfad: „Hoch“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { einordnen } from '../v2/triage.js';

const NORMALFALL = 'Mein Konto ist seit heute gesperrt. Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen.';

test('F1: Normalfall (Konto gesperrt, nicht anmelden) ergibt Dringlichkeit Hoch', () => {
  const r = einordnen(NORMALFALL);
  assert.equal(r.ok, true);
  assert.equal(r.kategorie.key, 'zugang');
  assert.equal(r.dringlichkeit, 'hoch');
});
