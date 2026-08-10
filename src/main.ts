/**
 * MUJAHED-DOS — bootstrap.
 *
 * Wires the shell together and hands control to the boot sequence. Everything
 * this file touches is defined elsewhere: content in src/content, the app list
 * in src/apps.ts, behaviour in src/os and src/apps.
 */

import './styles/tokens.css';
import './styles/base.css';
import './styles/crt.css';
import './styles/shell.css';
import './styles/icon-animations.css';
import './styles/window.css';
import './styles/content.css';
import './styles/apps.css';
import './styles/responsive.css';

import { $ } from './os/dom';
import { store } from './os/state';
import { icon, assertSprites } from './sprites';
import { appIcon } from './appicon';
import { el } from './render';
import { openOnBoot } from './content/boot';
import { decorate, probeImages, setWallpaper } from './os/wallpaper';
import { runBoot } from './os/boot';
import * as Icons from './os/icons';
import * as StartMenu from './os/startmenu';
import * as Taskbar from './os/taskbar';
import * as WindowManager from './os/windows';
import * as Power from './os/power';
import { initPlayer, setVolume } from './apps/player';

const MOBILE_QUERY = '(max-width: 820px)';

function syncMobile(matches: boolean): void {
  store.mobile = matches;
  document.body.classList.toggle('is-mobile', matches);
  WindowManager.reflow();
}

function wireShell(): void {
  /* Start button */
  const start = $<HTMLButtonElement>('#start');
  start.append(appIcon('monogram'), el('span', undefined, 'START'));
  start.addEventListener('click', (event) => {
    event.stopPropagation();
    StartMenu.toggle();
  });

  /* Power button on the bezel */
  const power = $<HTMLButtonElement>('#powerBtn');
  power.appendChild(icon('power'));
  power.addEventListener('click', (event) => {
    event.stopPropagation();
    Power.toggle();
  });

  /* Tray */
  $('#trayMusic').addEventListener('click', () =>
    WindowManager.open('player', { focusWindow: true })
  );

  const volume = $<HTMLInputElement>('#vol');
  volume.value = String(Math.round(store.volume * 100));
  volume.addEventListener('input', () => setVolume(Number(volume.value) / 100));
}

function wireGlobalEvents(): void {
  document.addEventListener('click', (event) => {
    // A dead screen comes back on with a click anywhere.
    if (Power.isOff()) {
      Power.on();
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest('#startmenu') && !target?.closest('#start')) StartMenu.close();
    if (!target?.closest('.icon')) Icons.clearSelection();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (StartMenu.isOpen()) {
        StartMenu.close();
        $('#start').focus();
        return;
      }
      const active = WindowManager.topMost();
      if (active) WindowManager.close(active);
      return;
    }

    if (event.key === 'Tab' && event.altKey) {
      event.preventDefault();
      WindowManager.cycle();
    }
  });
}

function init(): void {
  assertSprites();

  decorate();
  void probeImages();
  setWallpaper(store.wallpaper);

  Icons.build();
  StartMenu.build();
  wireShell();
  wireGlobalEvents();

  Taskbar.startClock();
  initPlayer();

  const query = window.matchMedia(MOBILE_QUERY);
  syncMobile(query.matches);
  query.addEventListener('change', (event) => syncMobile(event.matches));

  window.addEventListener('resize', () => Icons.reflow());

  runBoot(() => {
    // `booted` starts the screen-reveal animation and lets the icons cascade in.
    document.body.classList.add('booted');
    WindowManager.open(openOnBoot);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
