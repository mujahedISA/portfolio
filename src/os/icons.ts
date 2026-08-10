/**
 * DESKTOP ICONS.
 *
 * Roving tabindex: the group is one tab stop, arrow keys move between icons,
 * Enter or Space opens one. Mouse behaviour stays authentic — single click
 * selects, double click opens — except on touch, where one tap opens.
 *
 * Icons can also be dragged anywhere on the desktop. The list starts as a
 * normal flowing column; the moment you actually drag one, the current layout
 * is frozen into absolute coordinates so nothing jumps, and from then on every
 * icon keeps whatever position it is given.
 *
 * Positions are not saved. Nothing in this project writes to storage, so a
 * reload puts the desktop back the way every visitor first sees it.
 */

import { $, $all } from './dom';
import { store } from './state';
import { beep } from './sound';
import { appIcon } from '../appicon';
import { el } from '../render';
import { apps } from '../apps';
import * as WindowManager from './windows';

/** How far the pointer must travel before it counts as a drag, not a click. */
const DRAG_THRESHOLD = 5;

/** True once the flowing layout has been converted to free coordinates. */
let freed = false;

/** Set for one tick after a drag, so the click it generates is ignored. */
let swallowClick = false;

function buttons(): HTMLButtonElement[] {
  return $all<HTMLButtonElement>('#icons .icon');
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function select(target: HTMLButtonElement | null): void {
  buttons().forEach((button) => {
    const isTarget = button === target;
    button.dataset.selected = String(isTarget);
    button.tabIndex = isTarget ? 0 : -1;
  });
  if (!target) {
    const first = buttons()[0];
    if (first) first.tabIndex = 0;
  }
}

export function clearSelection(): void {
  select(null);
}

function move(from: HTMLButtonElement, delta: number): void {
  const all = buttons();
  const index = all.indexOf(from);
  const next = all[clamp(index + delta, 0, all.length - 1)];
  if (!next) return;
  select(next);
  next.focus();
}

/**
 * Convert the flowing column into absolute positions, keeping every icon
 * exactly where it already is. Every offset is read before anything is
 * written, so the browser lays out once rather than once per icon.
 */
function freezeLayout(): void {
  if (freed) return;
  const host = $('#icons');
  const placed = buttons().map((button) => ({
    button,
    x: button.offsetLeft,
    y: button.offsetTop,
  }));

  host.classList.add('free');
  for (const { button, x, y } of placed) {
    button.classList.add('settled');
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
  }
  freed = true;
}

function startDrag(event: PointerEvent, button: HTMLButtonElement): void {
  if (store.mobile || event.button !== 0) return;

  const startX = event.clientX;
  const startY = event.clientY;
  let dragging = false;
  let dx = 0;
  let dy = 0;
  let originLeft = 0;
  let originTop = 0;
  let frame = 0;

  const onMove = (moveEvent: PointerEvent) => {
    const mx = moveEvent.clientX - startX;
    const my = moveEvent.clientY - startY;

    if (!dragging) {
      if (Math.hypot(mx, my) < DRAG_THRESHOLD) return;
      dragging = true;
      freezeLayout();
      originLeft = button.offsetLeft;
      originTop = button.offsetTop;
      document.body.classList.add('icon-dragging');
      button.classList.add('dragging');
      select(button);
    }

    dx = mx;
    dy = my;
    // Coalesce to one write per frame — pointermove can fire far more often.
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        button.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
    }
  };

  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (!dragging) return;

    const host = $('#icons').getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    button.style.transform = '';
    button.style.left = `${clamp(originLeft + dx, 0, host.width - rect.width)}px`;
    button.style.top = `${clamp(originTop + dy, 0, host.height - rect.height)}px`;

    document.body.classList.remove('icon-dragging');
    button.classList.remove('dragging');
    beep(420, 14);

    // The browser fires a click after the pointer goes up. Ignore that one,
    // or dropping an icon would also select or open it.
    swallowClick = true;
    window.setTimeout(() => {
      swallowClick = false;
    }, 0);
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}

/** Keep freely-placed icons on screen when the window gets smaller. */
export function reflow(): void {
  if (!freed || store.mobile) return;
  const host = $('#icons').getBoundingClientRect();
  const placed = buttons().map((button) => ({
    button,
    rect: button.getBoundingClientRect(),
    left: button.offsetLeft,
    top: button.offsetTop,
  }));
  for (const { button, rect, left, top } of placed) {
    button.style.left = `${clamp(left, 0, Math.max(0, host.width - rect.width))}px`;
    button.style.top = `${clamp(top, 0, Math.max(0, host.height - rect.height))}px`;
  }
}

export function build(): void {
  const host = $('#icons');

  apps.forEach((app, index) => {
    const button = el('button', 'icon');
    button.type = 'button';
    button.dataset.id = app.id;
    button.tabIndex = index === 0 ? 0 : -1;
    button.style.setProperty('--i', String(index));
    button.appendChild(appIcon(app.icon));
    button.appendChild(el('span', undefined, app.title));

    const openIt = () => WindowManager.open(app.id, { focusWindow: true });

    // Take the entry animation off once it has played, so its filled
    // `transform: none` cannot outrank the transform used while dragging.
    button.addEventListener('animationend', () => button.classList.add('settled'), {
      once: true,
    });

    button.addEventListener('pointerdown', (event) => startDrag(event, button));

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (swallowClick) return;
      select(button);
      // A touch screen has no double click, and neither do phones.
      if (store.mobile || (event as PointerEvent).pointerType === 'touch') openIt();
      else beep(1500, 10);
    });

    button.addEventListener('dblclick', (event) => {
      event.preventDefault();
      if (!store.mobile) openIt();
    });

    button.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          openIt();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          move(button, 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          move(button, -1);
          break;
        case 'Home':
          event.preventDefault();
          move(button, -apps.length);
          break;
        case 'End':
          event.preventDefault();
          move(button, apps.length);
          break;
        default:
          break;
      }
    });

    host.appendChild(button);
  });
}
