/**
 * WINDOW MANAGER.
 *
 * Open, close, focus, minimize, maximize, drag, resize.
 *
 * Dragging moves the window with a GPU transform and only writes `left`/`top`
 * once on drop, so a drag never triggers layout. On mobile the whole thing is
 * skipped: windows fill the screen and the taskbar becomes an app switcher.
 */

import { $, $all, announce } from './dom';
import { store, type WindowRecord } from './state';
import { beep } from './sound';
import { appIcon } from '../appicon';
import { el, renderBlocks } from '../render';
import { findApp, type AppDef } from '../apps';
import { profile } from '../content/profile';
import { safeUrl } from '../safeurl';
import * as Taskbar from './taskbar';
import * as StartMenu from './startmenu';
import { buildPlayer } from '../apps/player';
import { buildDisplay } from '../apps/display';
import { buildMonitor } from '../apps/monitor';

const MIN_WIDTH = 270;
const MIN_HEIGHT = 160;
/** How far each new window steps down and right from the last one. */
const CASCADE = 26;

/**
 * Opening geometry. Windows start near the middle of the screen and cascade
 * from there, so a 1440px desktop does not end up with everything huddled in
 * the top-left corner. Sizes are clamped, so a small laptop still fits.
 */
function geometry(app: AppDef, index: number): Record<string, string> {
  const host = $('#desktop').getBoundingClientRect();
  const width = Math.min(app.width, host.width - 24);
  const height = Math.min(app.height, host.height - 24);
  const step = index * CASCADE;

  const clamp = (value: number, max: number) => Math.max(8, Math.min(max, value));

  return {
    left: `${clamp((host.width - width) / 2 - 90 + step, host.width - width - 8)}px`,
    top: `${clamp((host.height - height) / 2 - 40 + step, host.height - height - 8)}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
}

function buildBody(app: AppDef): Node {
  if (app.content) return renderBlocks(app.content, app.heading);
  if (app.build === 'player') return buildPlayer();
  if (app.build === 'display') return buildDisplay();
  if (app.build === 'monitor') return buildMonitor();
  return document.createDocumentFragment();
}

function titleBar(app: AppDef, id: string): HTMLElement {
  const bar = el('div', 'titlebar');
  bar.appendChild(appIcon(app.icon));

  const label = el('span', 't-txt', app.title);
  label.id = `win-title-${id}`;
  bar.appendChild(label);

  const buttons = el('div', 'tbtns');
  const make = (action: string, glyph: string, ariaLabel: string) => {
    const button = el('button', 'tbtn', glyph);
    button.type = 'button';
    button.dataset.action = action;
    button.setAttribute('aria-label', `${ariaLabel} ${app.title}`);
    return button;
  };
  buttons.append(
    make('minimize', '_', 'Minimize'),
    make('maximize', '[]', 'Maximize'),
    make('close', 'X', 'Close')
  );
  bar.appendChild(buttons);
  return bar;
}

export function open(id: string, options: { focusWindow?: boolean } = {}): void {
  const app = findApp(id);
  if (!app) return;

  // Some entries are not windows at all — they just open a file.
  if (app.openUrl) {
    const url = safeUrl(app.openUrl);
    if (!url) {
      console.error(`[safeUrl] refused to open an unsafe URL for ${app.title}: ${app.openUrl}`);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    announce(`Opening ${app.title}.`);
    beep(660);
    return;
  }

  if (store.windows.has(id)) {
    focus(id, options);
    return;
  }

  const win = el('section', 'win');
  win.dataset.id = id;
  win.tabIndex = -1;
  win.setAttribute('aria-labelledby', `win-title-${id}`);
  win.style.zIndex = String(++store.z);

  if (!store.mobile) Object.assign(win.style, geometry(app, store.windows.size));

  const body = el('div', 'win-body');
  body.appendChild(buildBody(app));

  const status = el('div', 'statusbar');
  status.setAttribute('aria-hidden', 'true');
  status.appendChild(el('i', undefined, app.status ?? ''));
  status.appendChild(el('i', undefined, profile.system));

  const grip = el('div', 'grip');
  grip.setAttribute('aria-hidden', 'true');

  const bar = titleBar(app, id);
  win.append(bar, body, status, grip);
  $('#windows').appendChild(win);

  store.windows.set(id, { app, el: win, minimized: false, maximized: false, restore: null });

  // Take the open animation off once it has played, so its filled
  // `transform: none` cannot outrank the transform used to drag the window.
  win.addEventListener('animationend', () => win.classList.add('settled'), { once: true });

  win.addEventListener('pointerdown', () => focus(id));
  bar.addEventListener('pointerdown', (event) => startDrag(event, id));
  bar.addEventListener('dblclick', () => toggleMaximize(id));
  grip.addEventListener('pointerdown', (event) => startResize(event, id));

  $all<HTMLButtonElement>('.tbtn', win).forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      beep(520, 18);
      const action = button.dataset.action;
      if (action === 'close') close(id);
      else if (action === 'minimize') minimize(id);
      else toggleMaximize(id);
    });
  });

  Taskbar.add(id);
  focus(id, options);
  announce(`${app.title} window opened.`);
  beep(900, 22);
}

export function close(id: string): void {
  const record = store.windows.get(id);
  if (!record) return;

  record.el.remove();
  store.windows.delete(id);
  Taskbar.remove(id);
  announce(`${record.app.title} window closed.`);

  if (store.active === id) {
    store.active = null;
    const next = [...store.windows.keys()].pop();
    if (next) focus(next, { focusWindow: true });
    else {
      Taskbar.sync();
      // Send focus somewhere sensible instead of dropping it on <body>.
      document.querySelector<HTMLElement>(`.icon[data-id="${id}"]`)?.focus();
    }
  }
}

export function minimize(id: string): void {
  const record = store.windows.get(id);
  if (!record) return;
  record.minimized = true;
  record.el.hidden = true;
  if (store.active === id) store.active = null;
  Taskbar.sync();
  Taskbar.focusButton(id);
  announce(`${record.app.title} minimized.`);
}

export function toggleMaximize(id: string): void {
  const record = store.windows.get(id);
  if (!record || store.mobile) return;
  const style = record.el.style;

  if (record.maximized) {
    if (record.restore) Object.assign(style, record.restore);
    record.maximized = false;
    record.el.classList.remove('max');
  } else {
    record.restore = {
      left: style.left,
      top: style.top,
      width: style.width,
      height: style.height,
    };
    Object.assign(style, { left: '0px', top: '0px', width: '100%', height: '100%' });
    record.maximized = true;
    record.el.classList.add('max');
  }
  focus(id);
}

export function focus(id: string, options: { focusWindow?: boolean } = {}): void {
  const record = store.windows.get(id);
  if (!record) return;

  if (record.minimized) {
    record.minimized = false;
    record.el.hidden = false;
  }

  store.active = id;
  record.el.style.zIndex = String(++store.z);
  store.windows.forEach((value, key) => value.el.classList.toggle('active', key === id));

  Taskbar.sync();
  StartMenu.close();

  if (options.focusWindow) record.el.focus({ preventScroll: true });
}

/** Alt+Tab. */
export function cycle(): void {
  const ids = [...store.windows.keys()].filter((key) => !store.windows.get(key)?.minimized);
  if (!ids.length) return;
  const next = ids[(ids.indexOf(store.active ?? '') + 1) % ids.length];
  focus(next, { focusWindow: true });
  beep(700, 15);
}

export function closeAll(): void {
  [...store.windows.keys()].forEach(close);
}

export function topMost(): string | null {
  return store.active;
}

/* -------------------------------------------------------------------------
   Drag — transform while moving, commit to left/top on drop.
   ------------------------------------------------------------------------- */
function startDrag(event: PointerEvent, id: string): void {
  const record = store.windows.get(id);
  if (!record || record.maximized || store.mobile) return;
  if ((event.target as Element).closest('.tbtn')) return;

  const host = $('#desktop').getBoundingClientRect();
  const rect = record.el.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const originLeft = rect.left - host.left;
  const originTop = rect.top - host.top;

  const useGhost = document.body.dataset.ghost === 'on';
  const ghost = $('#dragghost');
  const target = useGhost ? ghost : record.el;

  if (useGhost) {
    Object.assign(ghost.style, {
      display: 'block',
      left: `${originLeft}px`,
      top: `${originTop}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transform: '',
    });
  }

  const minLeft = -rect.width + 70;
  const maxLeft = host.width - 60;
  const maxTop = host.height - 40;

  let dx = 0;
  let dy = 0;
  let frame = 0;

  // Two things make a drag stutter, and both are switched off for its duration:
  // the full-screen backdrop-filter bloom, which re-blurs everything underneath
  // on every frame, and text selection inside the window being dragged over.
  document.body.classList.add('dragging');
  record.el.classList.add('settled');
  target.style.willChange = 'transform';

  const move = (moveEvent: PointerEvent) => {
    const nextLeft = Math.min(Math.max(originLeft + moveEvent.clientX - startX, minLeft), maxLeft);
    const nextTop = Math.min(Math.max(originTop + moveEvent.clientY - startY, 0), maxTop);
    dx = nextLeft - originLeft;
    dy = nextTop - originTop;
    // pointermove can fire several times per frame on a high-rate mouse.
    // Coalescing to one write per frame keeps the motion even.
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        target.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
    }
  };

  const up = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    target.style.transform = '';
    target.style.willChange = '';
    record.el.style.left = `${originLeft + dx}px`;
    record.el.style.top = `${originTop + dy}px`;
    if (useGhost) ghost.style.display = 'none';
    document.body.classList.remove('dragging');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  event.preventDefault();
}

function startResize(event: PointerEvent, id: string): void {
  const record = store.windows.get(id);
  if (!record || store.mobile) return;

  const rect = record.el.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = rect.width;
  const startHeight = rect.height;

  const move = (moveEvent: PointerEvent) => {
    record.el.style.width = `${Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX)}px`;
    record.el.style.height = `${Math.max(MIN_HEIGHT, startHeight + moveEvent.clientY - startY)}px`;
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  event.preventDefault();
  event.stopPropagation();
}

/** Called when the viewport crosses the mobile breakpoint. */
export function reflow(): void {
  store.windows.forEach((record: WindowRecord) => {
    if (store.mobile) {
      record.el.classList.remove('max');
      record.maximized = false;
      record.el.style.transform = '';
    } else if (!record.el.style.width) {
      // Opened while the phone layout was active — give it real geometry now.
      Object.assign(record.el.style, geometry(record.app, 0));
    }
  });
  if (store.mobile && !store.active) {
    const last = [...store.windows.keys()].pop();
    if (last) focus(last);
  }
}
