/**
 * MONITOR — CRT control panel.
 *
 * The whole point: a visitor who finds the tube effect annoying can switch it
 * off completely, and a visitor who loves it can crank it up. SOFT is the
 * default; flicker and chromatic aberration start OFF and stay that way,
 * because they hurt to read.
 */

import { $all } from './../os/dom';
import { beep } from './../os/sound';
import { el } from '../render';
import * as Power from './../os/power';

/** Each toggle maps to a data attribute on <body> that the stylesheet reads. */
const TUBE_OPTIONS: { key: string; label: string }[] = [
  { key: 'scan', label: 'Scanlines' },
  { key: 'grille', label: 'Aperture grille (RGB mask)' },
  { key: 'vig', label: 'Curvature + vignette' },
  { key: 'bloom', label: 'Phosphor bloom' },
  { key: 'glare', label: 'Glass glare' },
  { key: 'roll', label: 'Rolling refresh band' },
  { key: 'flicker', label: 'Flicker' },
  { key: 'ca', label: 'Chromatic aberration' },
  { key: 'ghost', label: 'Outline drag (low-res mode)' },
  { key: 'beep', label: 'PC speaker beeps' },
];

const LEVELS: [string, string][] = [
  ['off', 'OFF'],
  ['soft', 'SOFT'],
  ['medium', 'MEDIUM'],
  ['heavy', 'HEAVY'],
];

const PHOSPHORS: [string, string][] = [
  ['color', 'COLOUR'],
  ['green', 'P1 GREEN'],
  ['amber', 'P3 AMBER'],
  ['mono', 'B/W'],
];

/** Which overlays a level turns on. Flicker and CA are never included. */
const LEVEL_LAYERS = ['scan', 'grille', 'vig', 'glare', 'roll', 'bloom'];

function panel(title: string): HTMLElement {
  const box = el('section', 'panel');
  box.appendChild(el('h3', undefined, title));
  return box;
}

export function buildMonitor(): HTMLElement {
  const root = el('div');

  /* ---- intensity ---- */
  const intensity = panel('CRT INTENSITY');
  const levelRow = el('div', 'row');
  const levelButtons: HTMLButtonElement[] = [];

  for (const [value, label] of LEVELS) {
    const button = el('button', 'btn', label);
    button.type = 'button';
    button.dataset.level = value;
    button.setAttribute('aria-pressed', String(document.body.dataset.crt === value));
    button.addEventListener('click', () => {
      document.body.dataset.crt = value;
      for (const layer of LEVEL_LAYERS) {
        document.body.dataset[layer] = value === 'off' ? 'off' : 'on';
      }
      if (value === 'off') {
        document.body.dataset.flicker = 'off';
        document.body.dataset.ca = 'off';
      }
      syncToggles();
      levelButtons.forEach((other) =>
        other.setAttribute('aria-pressed', String(other.dataset.level === value))
      );
      beep(1100, 18);
    });
    levelButtons.push(button);
    levelRow.appendChild(button);
  }

  intensity.appendChild(levelRow);
  intensity.appendChild(el('p', 'hint', 'Off = clean flat pixels, no tube effect at all.'));

  /* ---- individual layers ---- */
  const tube = panel('TUBE');
  const toggles = el('div');
  for (const option of TUBE_OPTIONS) {
    const label = el('label', 'opt');
    const input = el('input');
    input.type = 'checkbox';
    input.dataset.key = option.key;
    input.checked = document.body.dataset[option.key] === 'on';
    input.addEventListener('change', () => {
      document.body.dataset[option.key] = input.checked ? 'on' : 'off';
      beep(1000, 15);
    });
    label.append(input, el('span', undefined, option.label));
    toggles.appendChild(label);
  }
  tube.appendChild(toggles);

  /* ---- phosphor ---- */
  const phosphor = panel('PHOSPHOR');
  const phosphorRow = el('div', 'row');
  const phosphorButtons: HTMLButtonElement[] = [];
  for (const [value, label] of PHOSPHORS) {
    const button = el('button', 'btn', label);
    button.type = 'button';
    button.dataset.phos = value;
    button.setAttribute('aria-pressed', String(document.body.dataset.phos === value));
    button.addEventListener('click', () => {
      document.body.dataset.phos = value;
      phosphorButtons.forEach((other) =>
        other.setAttribute('aria-pressed', String(other.dataset.phos === value))
      );
      beep(1400, 18);
    });
    phosphorButtons.push(button);
    phosphorRow.appendChild(button);
  }
  phosphor.appendChild(phosphorRow);

  /* ---- power ---- */
  const power = panel('POWER');
  const powerRow = el('div', 'row');
  const powerButton = el('button', 'btn', 'TURN MONITOR OFF');
  powerButton.type = 'button';
  powerButton.addEventListener('click', (event) => {
    event.stopPropagation();
    Power.off();
  });
  powerRow.appendChild(powerButton);
  power.appendChild(powerRow);
  power.appendChild(el('p', 'hint', 'Click anywhere to turn it back on.'));

  function syncToggles(): void {
    $all<HTMLInputElement>('input[data-key]', root).forEach((input) => {
      const key = input.dataset.key;
      if (key) input.checked = document.body.dataset[key] === 'on';
    });
  }

  root.append(intensity, tube, phosphor, power);
  return root;
}
