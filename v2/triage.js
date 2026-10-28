// Regelbasierte Einordnung von Supportanfragen (v1).
// Rein lokal: keine externe API, keine Datenbank. Jede Regel ist eine sichtbare
// Wortliste; die Treffer werden im Ergebnis offengelegt, damit die Einordnung nachvollziehbar bleibt.

export const MAX_ZEICHEN = 5000;

// Reihenfolge = Priorität bei Gleichstand (es entsteht trotzdem ein "unklar"-Hinweis).
const KATEGORIEN = [
  {
    key: 'zugang',
    label: 'Zugang',
    woerter: ['passwort', 'login', 'einlogg', 'eingelogg', 'anmeld', 'zugang', 'zugriff', 'gesperrt', 'zwei-faktor', '2fa', 'verifizier', 'benutzername', 'account'],
  },
  {
    key: 'abrechnung',
    label: 'Abrechnung',
    woerter: ['rechnung', 'abrechnung', 'zahlung', 'abgebucht', 'abbuchung', 'lastschrift', 'erstattung', 'rückerstattung', 'betrag', 'gebühr', 'kreditkarte', 'billing', 'invoice', 'refund'],
  },
  {
    key: 'technisch',
    label: 'Technisches Problem',
    woerter: ['fehler', 'error', 'absturz', 'stürzt', 'funktioniert nicht', 'geht nicht', 'bug', 'lädt nicht', 'timeout', 'hängt', 'crash', 'nicht erreichbar', 'offline', 'langsam', 'exception'],
  },
];

// Hoch nur bei: komplette Blockade, Sicherheitsrisiko, unmittelbar drohender finanzieller Schaden.
const HOCH = [
  {
    grund: 'komplette Blockade',
    woerter: ['ausgesperrt', 'konto ist gesperrt', 'konto gesperrt', 'kann nicht arbeiten', 'nicht mehr arbeiten', 'komplett blockiert', 'komplett ausgefallen', 'produktion steht', 'nichts geht', 'arbeitsunfähig', 'kein zugriff mehr', 'nicht anmelden'],
  },
  {
    grund: 'Sicherheitsrisiko',
    woerter: ['gehackt', 'hacker', 'phishing', 'datenleck', 'unbefugt', 'unberechtigt', 'sicherheitslücke', 'sicherheitsrisiko', 'missbrauch', 'verdächtig', 'fremde person', 'fremder zugriff'],
  },
  {
    grund: 'drohender finanzieller Schaden',
    woerter: ['doppelt abgebucht', 'doppelt berechnet', 'unbefugte abbuchung', 'unberechtigte abbuchung', 'abbuchung droht', 'zahlung droht', 'heute fällig', 'frist heute', 'letzte mahnung'],
  },
];

// Problemhinweise: ergeben "mittel", wenn nichts davon auf "hoch" zutrifft.
const PROBLEM = ['funktioniert nicht', 'geht nicht', 'kann nicht', 'fehler', 'lädt nicht', 'langsam', 'falsch', 'nicht möglich', 'immer wieder', 'wiederholt', 'problem', 'absturz', 'stürzt', 'timeout', 'abgelehnt', 'nicht erreichbar', 'error', 'bug'];

const SCHRITTE = {
  zugang: 'Identität über den Standardprozess prüfen, dann Passwort-Zurücksetzung oder Kontoentsperrung anbieten.',
  abrechnung: 'Zahlungs- bzw. Rechnungsdaten im Abrechnungssystem prüfen und Rechnungsnummer sowie Zeitraum bestätigen lassen.',
  technisch: 'Fehlermeldung, Zeitpunkt und Gerät bzw. Browser erfragen und den Fehler nachstellen.',
  sonstiges: 'Anliegen an die zuständige Stelle weiterleiten oder eine Rückfrage zum Anliegen stellen.',
};

// Hinweise darauf, dass der Text die App steuern will. Sie werden nur gemeldet, nie befolgt.
const INJEKTION = /ignorier|vergiss (alle|die) regeln|ignore (all|previous|the)|du bist jetzt|system ?prompt/i;

const norm = (text) => text.toLowerCase().replace(/\s+/g, ' ');
const escapeRe = (wort) => wort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Treffer = Wort beginnt an einer Wortgrenze (Präfix), damit z. B. "anmeld" auch "Anmeldung" findet.
function finde(normalisiert, woerter) {
  return woerter.filter((wort) => new RegExp(`(?<!\\p{L})${escapeRe(wort)}`, 'u').test(normalisiert));
}

export function pruefeEingabe(eingabe) {
  const text = typeof eingabe === 'string' ? eingabe : '';
  if (text.trim() === '') {
    return { ok: false, code: 'leer', nachricht: 'Das Feld ist leer. Bitte füge eine Supportanfrage ein, dann klicke auf „Anfrage einordnen“.' };
  }
  const laenge = [...text].length;
  if (laenge > MAX_ZEICHEN) {
    return { ok: false, code: 'zu_lang', nachricht: `Die Anfrage ist zu lang (${laenge} Zeichen). Bitte kürze sie auf höchstens ${MAX_ZEICHEN} Zeichen.` };
  }
  return { ok: true };
}

// Wählt einen wörtlichen Satz aus der Anfrage: zuerst einen mit Kategorie-Treffer, dann mit Dringlichkeits-Treffer.
function waehleBeleg(text, trefferGruppen) {
  const saetze = text.split(/(?<=[.!?])\s+|\n+/).map((satz) => satz.trim()).filter(Boolean);
  for (const woerter of trefferGruppen) {
    if (woerter.length === 0) continue;
    const satz = saetze.find((s) => finde(norm(s), woerter).length > 0);
    if (satz) return satz;
  }
  return saetze[0];
}

export function einordnen(eingabe) {
  const pruefung = pruefeEingabe(eingabe);
  if (!pruefung.ok) return pruefung;

  const text = eingabe.trim();
  const n = norm(text);
  const begruendung = [];
  const unklarGruende = [];

  // 1. Kategorie: meiste Treffer gewinnt, bei Gleichstand die Reihenfolge der Liste.
  const kandidaten = KATEGORIEN.map((k) => ({ k, treffer: finde(n, k.woerter) }));
  const hoechst = Math.max(...kandidaten.map((c) => c.treffer.length));
  let kategorie = { key: 'sonstiges', label: 'Sonstiges' };
  let kategorieTreffer = [];
  if (hoechst === 0) {
    unklarGruende.push('Kein Thema eindeutig erkennbar');
  } else {
    const gleich = kandidaten.filter((c) => c.treffer.length === hoechst);
    kategorie = { key: gleich[0].k.key, label: gleich[0].k.label };
    kategorieTreffer = gleich[0].treffer;
    begruendung.push(`Kategorie „${kategorie.label}“: Treffer „${kategorieTreffer.join('“, „')}“`);
    if (gleich.length > 1) {
      unklarGruende.push(`Mehrere Themen gleich stark erkannt: ${gleich.map((c) => c.k.label).join(', ')}`);
    }
  }

  // 2. Dringlichkeit: hoch > mittel > niedrig.
  const hoch = HOCH.map((g) => ({ grund: g.grund, treffer: finde(n, g.woerter) })).filter((g) => g.treffer.length > 0);
  const problem = finde(n, PROBLEM);
  let dringlichkeit = 'niedrig';
  if (hoch.length > 0) {
    dringlichkeit = 'hoch';
    begruendung.push(`Dringlichkeit hoch: ${hoch.map((g) => `${g.grund} („${g.treffer.join('“, „')}“)`).join('; ')}`);
  } else if (problem.length > 0) {
    dringlichkeit = 'mittel';
    begruendung.push(`Dringlichkeit mittel: Problemhinweis („${problem.join('“, „')}“)`);
  } else {
    begruendung.push('Dringlichkeit niedrig: keine Hinweise auf Blockade, Sicherheitsrisiko oder drohenden Schaden');
  }

  // 3. Vollständigkeit: sehr kurze Anfragen sind nicht eindeutig.
  if (n.split(' ').length < 3) {
    unklarGruende.push('Anfrage sehr kurz (weniger als drei Wörter)');
  }

  const status = unklarGruende.length > 0 ? 'unklar' : 'klar';

  let naechsterSchritt = SCHRITTE[kategorie.key];
  if (status === 'unklar') {
    naechsterSchritt = `Zuerst eine Rückfrage stellen, um fehlende Angaben zu klären. Danach: ${naechsterSchritt}`;
  }
  if (dringlichkeit === 'hoch') {
    naechsterSchritt = `Sofort bearbeiten. ${naechsterSchritt}`;
  }

  const beleg = waehleBeleg(text, [kategorieTreffer, hoch.flatMap((g) => g.treffer), problem]);
  const hinweise = INJEKTION.test(text)
    ? ['Der Text enthält Formulierungen, die wie Anweisungen an die App klingen. Sie wurden nur als Inhalt behandelt und haben die Einordnung nicht verändert.']
    : [];

  return { ok: true, status, kategorie, dringlichkeit, naechsterSchritt, beleg, begruendung, unklarGruende, hinweise };
}
