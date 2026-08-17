/**
 * DESKTOP ICONS.
 *
 * Four behaviours, in the order they matter:
 *
 * OPENING     Single click selects, double click opens — except on touch, where
 *             one tap opens. Keyboard: arrows move, Enter or Space opens. The
 *             group is one tab stop with a roving tabindex.
 *
 * SELECTING   Drag on empty desktop to draw a rubber band; every icon it
 *             touches gets selected. Ctrl (or Cmd) adds to the selection
 *             instead of replacing it, and Ctrl-clicking an icon toggles it.
 *
 * MOVING      Drag any icon to move it. If it is part of a selection, the whole
 *             selection moves with it.
 *
 * SNAPPING    Icons live on a grid and never overlap. On drop each one snaps to
 *             its nearest cell, and if that cell is taken it spirals outward to
 *             the nearest free one.
 *
 * The list starts as a normal flowing column. The first time something is
 * actually dragged, the current layout is frozen into grid coordinates so
 * nothing jumps. Positions are not saved — nothing in this project writes to
 * storage, so a reload restores the layout every visitor sees first.
 */

import { $, $all, announce } from './dom';
import { store } from './state';
import { beep } from './sound';
import { appIcon } from '../appicon';
import { el } from '../render';
import { apps } from '../apps';
import * as WindowManager from './windows';

/** How far the pointer must travel before it counts as a drag, not a click. */
const DRAG_THRESHOLD = 5;

/** Gap between icons in the flowing layout; part of the cell height. */
const GRID_GAP = 2;

/** Give up looking for a free cell after this many rings. */
const MAX_SEARCH_RINGS = 24;

/** True once the flowing layout has been converted to free coordinates. */
let freed = false;

/** Set for one tick after a drag or a marquee, so the click it fires is ignored. */
let swallowClick = false;

interface Cell {
  col: number;
  row: number;
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function buttons(): HTMLButtonElement[] {
  return $all<HTMLButtonElement>('#icons .icon');
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Cell size, measured from a real icon rather than hard-coded, so changing the
 * icon size in CSS moves the grid with it instead of silently desyncing.
 */
function grid(): { w: number; h: number; cols: number; rows: number } {
  const host = $('#icons').getBoundingClientRect();
  const first = buttons()[0];
  const w = first?.offsetWidth || 96;
  const h = (first?.offsetHeight || 81) + GRID_GAP;
  return {
    w,
    h,
    cols: Math.max(1, Math.floor(host.width / w)),
    rows: Math.max(1, Math.floor(host.height / h)),
  };
}

function cellAt(left: number, top: number): Cell {
  const g = grid();
  return {
    col: clamp(Math.round(left / g.w), 0, g.cols - 1),
    row: clamp(Math.round(top / g.h), 0, g.rows - 1),
  };
}

const key = (cell: Cell) => `${cell.col},${cell.row}`;

/** Which cell each icon currently sits in, skipping the ones being moved. */
function occupancy(ignore: Set<HTMLButtonElement>): Set<string> {
  const taken = new Set<string>();
  for (const button of buttons()) {
    if (ignore.has(button)) continue;
    taken.add(key(cellAt(button.offsetLeft, button.offsetTop)));
  }
  return taken;
}

/**
 * The wanted cell if it is free, otherwise the closest free one.
 * Searches in rings, so an icon dropped on a busy spot lands beside it rather
 * than jumping across the screen.
 */
function nearestFreeCell(wanted: Cell, taken: Set<string>): Cell {
  const g = grid();
  const fits = (c: Cell) =>
    c.col >= 0 && c.row >= 0 && c.col < g.cols && c.row < g.rows && !taken.has(key(c));

  if (fits(wanted)) return wanted;

  for (let ring = 1; ring <= MAX_SEARCH_RINGS; ring++) {
    const candidates: Cell[] = [];
    for (let d = -ring; d <= ring; d++) {
      candidates.push(
        { col: wanted.col + d, row: wanted.row - ring },
        { col: wanted.col + d, row: wanted.row + ring },
        { col: wanted.col - ring, row: wanted.row + d },
        { col: wanted.col + ring, row: wanted.row + d }
      );
    }
    // Prefer the candidate closest in real distance, so it feels like the
    // nearest slot rather than whichever the loop happened to reach first.
    candidates.sort(
      (a, b) =>
        (a.col - wanted.col) ** 2 + (a.row - wanted.row) ** 2 -
        ((b.col - wanted.col) ** 2 + (b.row - wanted.row) ** 2)
    );
    const free = candidates.find(fits);
    if (free) return free;
  }
  return wanted;
}

function placeAt(button: HTMLButtonElement, cell: Cell): void {
  const g = grid();
  button.style.left = `${cell.col * g.w}px`;
  button.style.top = `${cell.row * g.h}px`;
}

/* ------------------------------------------------------------------ */
/* selection                                                           */
/* ------------------------------------------------------------------ */

function selected(): HTMLButtonElement[] {
  return buttons().filter((b) => b.dataset.selected === 'true');
}

function mark(button: HTMLButtonElement, on: boolean): void {
  button.dataset.selected = String(on);
}

function announceSelection(): void {
  const count = selected().length;
  if (count > 1) announce(`${count} icons selected.`);
}

/** Replace the selection with exactly these icons. */
function setSelection(items: HTMLButtonElement[]): void {
  const wanted = new Set(items);
  for (const button of buttons()) mark(button, wanted.has(button));
  const focusTarget = items[items.length - 1];
  for (const button of buttons()) button.tabIndex = button === focusTarget ? 0 : -1;
  if (!focusTarget) {
    const first = buttons()[0];
    if (first) first.tabIndex = 0;
  }
}

export function clearSelection(): void {
  if (swallowClick) return;
  setSelection([]);
}

/* ------------------------------------------------------------------ */
/* freezing the flow layout into the grid                              */
/* ------------------------------------------------------------------ */

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

  // Snap the starting column onto the grid so everything shares one coordinate
  // system from the very first drag.
  const taken = new Set<string>();
  for (const { button } of placed) {
    const cell = nearestFreeCell(cellAt(button.offsetLeft, button.offsetTop), taken);
    taken.add(key(cell));
    placeAt(button, cell);
  }
}

/* ------------------------------------------------------------------ */
/* dragging — one icon, or the whole selection                         */
/* ------------------------------------------------------------------ */

function startDrag(event: PointerEvent, button: HTMLButtonElement): void {
  if (store.mobile || event.button !== 0) return;

  const startX = event.clientX;
  const startY = event.clientY;
  let dragging = false;
  let dx = 0;
  let dy = 0;
  let frame = 0;
  let moving: { button: HTMLButtonElement; left: number; top: number }[] = [];

  const onMove = (moveEvent: PointerEvent) => {
    const mx = moveEvent.clientX - startX;
    const my = moveEvent.clientY - startY;

    if (!dragging) {
      if (Math.hypot(mx, my) < DRAG_THRESHOLD) return;
      dragging = true;
      freezeLayout();

      // Dragging an unselected icon drops the old selection and takes just this
      // one — the same rule every file manager uses.
      if (button.dataset.selected !== 'true') setSelection([button]);

      moving = selected().map((b) => ({ button: b, left: b.offsetLeft, top: b.offsetTop }));
      document.body.classList.add('icon-dragging');
      for (const m of moving) m.button.classList.add('dragging');
    }

    dx = mx;
    dy = my;
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        const shift = `translate3d(${dx}px, ${dy}px, 0)`;
        for (const m of moving) m.button.style.transform = shift;
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

    const held = new Set(moving.map((m) => m.button));
    const taken = occupancy(held);

    // Settle the icons nearest their drop point first, so the one under the
    // pointer gets the cell it was aimed at and the rest fill in around it.
    const order = [...moving].sort(
      (a, b) => (a.button === button ? -1 : 0) - (b.button === button ? -1 : 0)
    );

    for (const m of order) {
      m.button.style.transform = '';
      m.button.classList.remove('dragging');
      const cell = nearestFreeCell(cellAt(m.left + dx, m.top + dy), taken);
      taken.add(key(cell));
      placeAt(m.button, cell);
    }

    document.body.classList.remove('icon-dragging');
    beep(420, 14);

    swallowClick = true;
    window.setTimeout(() => {
      swallowClick = false;
    }, 0);
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}

/* ------------------------------------------------------------------ */
/* marquee — rubber-band selection on empty desktop                    */
/* ------------------------------------------------------------------ */

let marquee: HTMLElement | null = null;

function marqueeBox(): HTMLElement {
  if (!marquee) {
    marquee = el('div');
    marquee.id = 'marquee';
    marquee.setAttribute('aria-hidden', 'true');
    $('#desktop').appendChild(marquee);
  }
  return marquee;
}

function startMarquee(event: PointerEvent): void {
  if (store.mobile || event.button !== 0) return;
  const target = event.target as Element | null;
  // Only on genuinely empty desktop.
  if (
    target?.closest('.icon') ||
    target?.closest('.win') ||
    target?.closest('#taskbar') ||
    target?.closest('#startmenu')
  ) {
    return;
  }

  const host = $('#desktop').getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const additive = event.ctrlKey || event.metaKey;
  const alreadyOn = new Set(selected());

  let active = false;
  let frame = 0;
  let box = { left: 0, top: 0, width: 0, height: 0 };

  const onMove = (moveEvent: PointerEvent) => {
    const mx = moveEvent.clientX - startX;
    const my = moveEvent.clientY - startY;
    if (!active) {
      if (Math.hypot(mx, my) < DRAG_THRESHOLD) return;
      active = true;
      marqueeBox().style.display = 'block';
      document.body.classList.add('icon-dragging');
    }

    box = {
      left: Math.min(startX, moveEvent.clientX) - host.left,
      top: Math.min(startY, moveEvent.clientY) - host.top,
      width: Math.abs(mx),
      height: Math.abs(my),
    };

    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        const node = marqueeBox();
        node.style.left = `${box.left}px`;
        node.style.top = `${box.top}px`;
        node.style.width = `${box.width}px`;
        node.style.height = `${box.height}px`;

        // Live feedback: highlight as the band passes over things.
        const rect = {
          left: box.left + host.left,
          top: box.top + host.top,
          right: box.left + host.left + box.width,
          bottom: box.top + host.top + box.height,
        };
        for (const icon of buttons()) {
          const r = icon.getBoundingClientRect();
          const hit =
            r.left < rect.right && r.right > rect.left && r.top < rect.bottom && r.bottom > rect.top;
          mark(icon, hit || (additive && alreadyOn.has(icon)));
        }
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
    if (!active) return;

    marqueeBox().style.display = 'none';
    document.body.classList.remove('icon-dragging');
    setSelection(selected());
    announceSelection();

    // The click that follows must not wipe what was just selected.
    swallowClick = true;
    window.setTimeout(() => {
      swallowClick = false;
    }, 0);
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}

/* ------------------------------------------------------------------ */
/* keyboard + resize                                                   */
/* ------------------------------------------------------------------ */

function moveFocus(from: HTMLButtonElement, delta: number): void {
  const all = buttons();
  const next = all[clamp(all.indexOf(from) + delta, 0, all.length - 1)];
  if (!next) return;
  setSelection([next]);
  next.focus();
}

/** Keep freely-placed icons on the grid and on screen when the window resizes. */
export function reflow(): void {
  if (!freed || store.mobile) return;
  const placed = buttons().map((button) => ({
    button,
    left: button.offsetLeft,
    top: button.offsetTop,
  }));
  const taken = new Set<string>();
  for (const { button, left, top } of placed) {
    const cell = nearestFreeCell(cellAt(left, top), taken);
    taken.add(key(cell));
    placeAt(button, cell);
  }
}

/* ------------------------------------------------------------------ */
/* build                                                               */
/* ------------------------------------------------------------------ */

export function build(): void {
  const host = $('#icons');

  apps.forEach((app, index) => {
    const button = el('button', 'icon');
    button.type = 'button';
    button.dataset.id = app.id;
    button.dataset.selected = 'false';
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

      if (event.ctrlKey || event.metaKey) {
        mark(button, button.dataset.selected !== 'true');
        announceSelection();
        return;
      }

      setSelection([button]);
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
          moveFocus(button, 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          moveFocus(button, -1);
          break;
        case 'Home':
          event.preventDefault();
          moveFocus(button, -apps.length);
          break;
        case 'End':
          event.preventDefault();
          moveFocus(button, apps.length);
          break;
        default:
          break;
      }
    });

    host.appendChild(button);
  });

  $('#desktop').addEventListener('pointerdown', startMarquee);
}
