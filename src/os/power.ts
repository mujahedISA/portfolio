/** The bezel power button. Turning the tube off is a joke you can undo by clicking. */

import { announce } from './dom';

export function isOff(): boolean {
  return document.body.dataset.power === 'off';
}

export function off(): void {
  if (isOff()) return;
  document.body.dataset.power = 'off';
  announce('Monitor off. Click anywhere to turn it back on.');
}

export function on(): void {
  if (!isOff()) return;
  document.body.dataset.power = 'on';
  announce('Monitor on.');
}

export function toggle(): void {
  if (isOff()) on();
  else off();
}
