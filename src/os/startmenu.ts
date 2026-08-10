/** START MENU — every app, plus Close All. Built from the same registry. */

import { $ } from './dom';
import { beep } from './sound';
import { appIcon } from '../appicon';
import { el } from '../render';
import { apps } from '../apps';
import * as WindowManager from './windows';

function entry(label: string, iconName: string, onSelect: () => void): HTMLLIElement {
  const item = el('li');
  const button = el('button');
  button.type = 'button';
  button.appendChild(appIcon(iconName));
  button.appendChild(el('span', undefined, label));
  button.addEventListener('click', onSelect);
  item.appendChild(button);
  return item;
}

export function build(): void {
  const list = $('#startlist');

  for (const app of apps) {
    list.appendChild(
      entry(app.title, app.icon, () => {
        WindowManager.open(app.id, { focusWindow: true });
        close();
      })
    );
  }

  const separator = el('li');
  separator.setAttribute('aria-hidden', 'true');
  separator.appendChild(el('hr'));
  list.appendChild(separator);

  list.appendChild(
    entry('CLOSE ALL', 'monogram', () => {
      WindowManager.closeAll();
      close();
    })
  );
}

export function isOpen(): boolean {
  return !$('#startmenu').hasAttribute('hidden');
}

export function open(): void {
  $('#startmenu').removeAttribute('hidden');
  $('#start').setAttribute('aria-expanded', 'true');
  $<HTMLButtonElement>('#startlist button').focus();
}

export function close(): void {
  const menu = $('#startmenu');
  if (menu.hasAttribute('hidden')) return;
  menu.setAttribute('hidden', '');
  $('#start').setAttribute('aria-expanded', 'false');
}

export function toggle(): void {
  if (isOpen()) {
    close();
    $('#start').focus();
  } else {
    open();
  }
  beep(760, 20);
}
