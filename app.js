import { einordnen, pruefeEingabe, MAX_ZEICHEN } from './triage.js';

const els = {
  formular: document.getElementById('formular'),
  eingabe: document.getElementById('eingabe'),
  zaehler: document.getElementById('zaehler'),
  senden: document.getElementById('senden'),
  leeren: document.getElementById('leeren'),
  beispiele: document.getElementById('beispiele'),
  status: document.getElementById('status'),
  statusTitel: document.getElementById('status-titel'),
  statusText: document.getElementById('status-text'),
  ergebnis: document.getElementById('ergebnis'),
  kategorie: document.getElementById('r-kategorie'),
  dringlichkeit: document.getElementById('r-dringlichkeit'),
  einordnung: document.getElementById('r-status'),
  schritt: document.getElementById('r-schritt'),
  beleg: document.getElementById('r-beleg'),
  hinweise: document.getElementById('r-hinweise'),
  begruendung: document.getElementById('r-begruendung'),
  unklar: document.getElementById('r-unklar'),
  neu: document.getElementById('neu'),
};

const ZUSTAENDE = {
  bereit: { titel: 'Bereit', text: 'Füge eine Anfrage ein, um zu starten.' },
  verarbeitung: { titel: 'Verarbeitung läuft …', text: 'Die Anfrage wird nach festen Regeln eingeordnet.' },
  erfolg: { titel: 'Erfolg', text: 'Die Anfrage ist eindeutig eingeordnet.' },
  unklar: { titel: 'Unklare Anfrage', text: 'Es gibt ein Ergebnis, aber es fehlen Angaben. Die Einordnung ist als „unklar“ markiert.' },
  fehler: { titel: 'Fehler', text: '' },
};

const DRINGLICHKEIT = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' };

const BEISPIELE = [
  { label: 'Gesperrtes Konto', text: 'Mein Konto ist gesperrt. Ich kann seit heute Morgen nicht arbeiten.' },
  { label: 'Doppelte Abbuchung', text: 'Ich wurde für meine Rechnung doppelt abgebucht.' },
  { label: 'Technischer Fehler', text: 'Die Seite lädt nicht und es kommt immer wieder ein Fehler.' },
  { label: 'Unklare Anfrage', text: 'Hallo, ich brauche Hilfe.' },
];

function setzeZustand(name, text) {
  const zustand = ZUSTAENDE[name];
  els.status.dataset.state = name;
  els.statusTitel.textContent = zustand.titel;
  els.statusText.textContent = text ?? zustand.text;
}

function zeigeErgebnis(erg) {
  els.kategorie.textContent = erg.kategorie.label;
  els.dringlichkeit.textContent = DRINGLICHKEIT[erg.dringlichkeit];
  els.dringlichkeit.dataset.level = erg.dringlichkeit;
  els.einordnung.textContent = erg.status === 'klar' ? 'Klar' : 'Unklar';
  els.einordnung.dataset.status = erg.status;
  els.schritt.textContent = erg.naechsterSchritt;
  els.beleg.textContent = `„${erg.beleg}“`;

  els.begruendung.replaceChildren(...listenpunkte(erg.begruendung));
  els.unklar.replaceChildren(...listenpunkte(erg.unklarGruende));
  els.unklar.hidden = erg.unklarGruende.length === 0;

  els.hinweise.replaceChildren(...listenpunkte(erg.hinweise));
  els.hinweise.hidden = erg.hinweise.length === 0;

  els.ergebnis.hidden = false;
}

// Text als textContent einsetzen, nie als HTML: der Inhalt der Anfrage bleibt reiner Text.
function listenpunkte(texte) {
  return texte.map((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  });
}

function verbergeErgebnis() {
  els.ergebnis.hidden = true;
}

function zaehleZeichen() {
  const laenge = [...els.eingabe.value].length;
  els.zaehler.textContent = `${laenge} / ${MAX_ZEICHEN.toLocaleString('de-DE')} Zeichen`;
  els.zaehler.classList.toggle('zu-viel', laenge > MAX_ZEICHEN);
}

function setzeBeschaeftigt(aktiv) {
  els.senden.disabled = aktiv;
  els.leeren.disabled = aktiv;
  els.senden.setAttribute('aria-busy', String(aktiv));
}

function zeigeFehler(nachricht) {
  verbergeErgebnis();
  setzeZustand('fehler', nachricht);
}

els.formular.addEventListener('submit', async (ereignis) => {
  ereignis.preventDefault();
  const text = els.eingabe.value;

  const pruefung = pruefeEingabe(text);
  if (!pruefung.ok) {
    zeigeFehler(pruefung.nachricht);
    els.eingabe.focus();
    return;
  }

  setzeBeschaeftigt(true);
  verbergeErgebnis();
  setzeZustand('verarbeitung');

  // Kurze Pause, damit der Verarbeitungszustand sichtbar ist.
  await new Promise((weiter) => setTimeout(weiter, 350));

  try {
    const erg = einordnen(text);
    if (!erg.ok) {
      zeigeFehler(erg.nachricht);
      return;
    }
    zeigeErgebnis(erg);
    setzeZustand(erg.status === 'klar' ? 'erfolg' : 'unklar');
  } catch (fehler) {
    console.error(fehler);
    zeigeFehler('Die Einordnung ist unerwartet fehlgeschlagen. Bitte versuche es erneut.');
  } finally {
    setzeBeschaeftigt(false);
  }
});

// Strg/Cmd + Enter sendet ebenfalls.
els.eingabe.addEventListener('keydown', (ereignis) => {
  if (ereignis.key === 'Enter' && (ereignis.metaKey || ereignis.ctrlKey)) {
    els.formular.requestSubmit();
  }
});

els.eingabe.addEventListener('input', zaehleZeichen);

els.leeren.addEventListener('click', () => {
  els.eingabe.value = '';
  zaehleZeichen();
  verbergeErgebnis();
  setzeZustand('bereit');
  els.eingabe.focus();
});

els.neu.addEventListener('click', () => {
  els.eingabe.value = '';
  zaehleZeichen();
  verbergeErgebnis();
  setzeZustand('bereit');
  els.eingabe.focus();
});

for (const beispiel of BEISPIELE) {
  const knopf = document.createElement('button');
  knopf.type = 'button';
  knopf.className = 'chip';
  knopf.textContent = beispiel.label;
  knopf.addEventListener('click', () => {
    els.eingabe.value = beispiel.text;
    zaehleZeichen();
    verbergeErgebnis();
    setzeZustand('bereit');
    els.eingabe.focus();
  });
  els.beispiele.append(knopf);
}

zaehleZeichen();
