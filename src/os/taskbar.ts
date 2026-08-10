/**
 * TASKBAR — one button per open window, plus the clock.
 * On mobile this is the app switcher.
 */

import { $, $all } from './dom';
import { store } from './state';
import { beep } from './sound';
import { appIcon } from '../appicon';
import { el } from '../render';
import { findApp } from '../apps';
import * as WindowManager from './windows';

export function add(id: string): void {
  const app = findApp(id);
  if (!app) return;

  const button = el('button', 'tk');
  button.type = 'button';
  button.dataset.id = id;
  button.title = app.title;
  button.appendChild(appIcon(app.icon));
  button.appendChild(el('span', undefined, app.title));

  button.addEventListener('click', () => {
    const record = store.windows.get(id);
    if (!record) return;
    // Clicking the active window's button minimizes it, like every real taskbar.
    if (store.active === id && !record.minimized) WindowManager.minimize(id);
    else WindowManager.focus(id, { focusWindow: true });
    beep(600, 15);
  });

  $('#tasks').appendChild(button);
  sync();
}

export function remove(id: string): void {
  document.querySelector(`#tasks .tk[data-id="${id}"]`)?.remove();
}

export function sync(): void {
  $all<HTMLButtonElement>('#tasks .tk').forEach((button) => {
    const isActive = button.dataset.id === store.active;
    button.setAttribute('aria-current', String(isActive));
    const record = button.dataset.id ? store.windows.get(button.dataset.id) : undefined;
    button.setAttribute('aria-label', record?.minimized ? `${button.title} (minimized)` : button.title);
  });
}

export function focusButton(id: string): void {
  document.querySelector<HTMLButtonElement>(`#tasks .tk[data-id="${id}"]`)?.focus();
}

export function startClock(): void {
  const clock = $('#clock');
  const tick = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = `${hours}:${minutes}`;
    clock.setAttribute('aria-label', `Clock, ${hours}:${minutes}`);
  };
  tick();
  window.setInterval(tick, 10_000);
}
