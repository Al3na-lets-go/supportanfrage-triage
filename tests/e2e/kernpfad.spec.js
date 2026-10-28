import { test, expect } from '@playwright/test';

// Kernpfad v1: ein gesperrtes Konto mit Rechnungsbezug wird eingeordnet.
const EINGABE = 'Mein Konto ist seit heute gesperrt. Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen.';
const BELEG = 'Mein Konto ist seit heute gesperrt.';

test.afterEach(async ({ page }) => {
  // Cleanup: Eingabe leeren. Es werden keine Daten gespeichert, daher genügt das Leeren des Feldes.
  await page.getByLabel('Supportanfrage').fill('');
});

test('Kernpfad: gesperrtes Konto wird als Zugang mit hoher Dringlichkeit eingeordnet', async ({ page }) => {
  // Relativ zur baseURL mit Projektpfad: '/' würde auf die Domain-Wurzel zeigen (404).
  await page.goto('./');

  // Start: leeres Feld, keine Ergebnis-Karte
  const eingabe = page.getByLabel('Supportanfrage');
  await expect(eingabe).toHaveValue('');
  const ergebnis = page.getByRole('region', { name: 'Ergebnis' });
  await expect(ergebnis).toBeHidden();

  // Aktionen
  await eingabe.fill(EINGABE);
  await page.getByRole('button', { name: 'Anfrage einordnen' }).click();

  // Auf Ergebnis warten (web-first, kein sleep)
  await expect(ergebnis).toBeVisible();

  // Bestanden: Kategorie
  // Bestanden: Kategorie „Zugang“ sichtbar
  await expect(ergebnis.getByText('Zugang', { exact: true })).toBeVisible();

  // Bestanden: Dringlichkeit „Hoch“ sichtbar
  await expect(ergebnis.getByText('Hoch', { exact: true })).toBeVisible();

  // Bestanden: konkreter nächster Schritt (nicht leer)
  const schritt = ergebnis.getByRole('heading', { name: 'Nächster Schritt' }).locator('xpath=following-sibling::p');
  await expect(schritt).not.toBeEmpty();

  // Bestanden: wörtliches Beleg-Zitat aus der Eingabe
  const beleg = ergebnis.getByRole('blockquote');
  await expect(beleg).toContainText(BELEG);
  const zitat = (await beleg.textContent()).replace(/^„|“$/g, '');
  expect(EINGABE).toContain(zitat);

  // Nicht bestanden: kein Fehlerzustand, keine erfundenen Konto- oder Vertragsdaten
  await expect(page.getByRole('status')).not.toHaveAttribute('data-state', 'fehler');
  await expect(ergebnis).not.toContainText(/Kundennummer|Kontonummer|Vertragsnummer|Bestellnummer|\d{4,}/);
});
