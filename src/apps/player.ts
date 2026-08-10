/**
 * MEDIA PLAYER.
 *
 * Reads whatever is in src/content/tracks.ts — one track or ten. Nothing plays
 * until someone presses play; the <audio> element is preload="none" and no
 * AudioContext exists until a click.
 *
 * The visualiser is a decoration, not an analyser: it costs one rAF-free
 * interval and animates transform only.
 */

import { $, $all, announce } from './../os/dom';
import { store } from './../os/state';
import { beep } from './../os/sound';
import { icon } from '../sprites';
import { el } from '../render';
import { tracks } from '../content/tracks';

const BAR_COUNT = 18;

let audio: HTMLAudioElement | null = null;
let panel: HTMLElement | null = null;

function media(): HTMLAudioElement {
  audio ??= $<HTMLAudioElement>('#audio');
  return audio;
}

function trayIcon(): void {
  const tray = document.getElementById('trayMusic');
  if (!tray) return;
  tray.replaceChildren(icon(store.playing && !store.muted ? 'note' : 'mute'));
  tray.setAttribute(
    'aria-label',
    store.playing ? 'Media player — playing. Open player.' : 'Open media player'
  );
}

function current() {
  return tracks[store.track];
}

function refresh(): void {
  trayIcon();
  if (!panel) return;

  const track = current();
  const now = $('[data-now]', panel);
  const sub = $('[data-sub]', panel);
  const play = $<HTMLButtonElement>('[data-action="play"]', panel);
  const mute = $<HTMLButtonElement>('[data-action="mute"]', panel);

  if (!track) {
    now.textContent = '> NO TRACKS';
    sub.textContent = 'PLAYLIST IS EMPTY';
  } else {
    now.textContent = `${store.playing ? '>' : '[]'} ${track.title}`;
    const parts = [track.artist ?? '', store.muted ? 'MUTED' : ''].filter(Boolean);
    sub.textContent = parts.length ? parts.join('  ').toUpperCase() : 'READY';
  }

  play.textContent = store.playing ? '|| PAUSE' : '> PLAY';
  play.setAttribute('aria-pressed', String(store.playing));
  mute.textContent = store.muted ? 'UNMUTE' : 'MUTE';
  mute.setAttribute('aria-pressed', String(store.muted));

  $all<HTMLButtonElement>('[data-list] button', panel).forEach((button, index) => {
    button.setAttribute('aria-current', String(index === store.track));
  });
}

function play(): void {
  const track = current();
  if (!track) return;
  const element = media();
  if (!element.src.endsWith(track.src.replace('./', ''))) element.src = track.src;
  element.volume = store.volume;
  element.muted = store.muted;
  void element
    .play()
    .then(() => {
      store.playing = true;
      announce(`Playing ${track.title}.`);
      refresh();
    })
    .catch(() => {
      // Autoplay policy, a missing file, or an unsupported codec. Say so
      // instead of leaving a play button that silently does nothing.
      store.playing = false;
      if (panel) $('[data-sub]', panel).textContent = 'CANNOT PLAY THIS FILE';
      refresh();
    });
}

function pause(): void {
  media().pause();
  store.playing = false;
  refresh();
}

function selectTrack(index: number, autoPlay: boolean): void {
  if (!tracks.length) return;
  store.track = (index + tracks.length) % tracks.length;
  const element = media();
  element.pause();
  element.src = current().src;
  element.volume = store.volume;
  element.muted = store.muted;
  store.playing = false;
  if (autoPlay) play();
  else refresh();
}

export function step(delta: number): void {
  selectTrack(store.track + delta, store.playing || delta !== 0);
}

export function setVolume(value: number): void {
  store.volume = value;
  media().volume = value;
  if (panel) $<HTMLInputElement>('[data-action="volume"]', panel).value = String(Math.round(value * 100));
  const tray = document.getElementById('vol') as HTMLInputElement | null;
  if (tray) tray.value = String(Math.round(value * 100));
}

function controlButton(action: string, label: string, ariaLabel: string): HTMLButtonElement {
  const button = el('button', 'btn', label);
  button.type = 'button';
  button.dataset.action = action;
  button.setAttribute('aria-label', ariaLabel);
  return button;
}

export function buildPlayer(): HTMLElement {
  const root = el('div', 'mp');

  /* ---- green screen ---- */
  const screen = el('div', 'mp-screen');
  const now = el('div');
  now.setAttribute('data-now', '');
  const sub = el('div');
  sub.setAttribute('data-sub', '');
  const viz = el('div', 'mp-viz');
  viz.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < BAR_COUNT; i++) viz.appendChild(el('i'));
  screen.append(now, sub, viz);

  /* ---- transport ---- */
  const controls = el('div', 'mp-ctrl');
  const prev = controlButton('prev', '|<<', 'Previous track');
  const playBtn = controlButton('play', '> PLAY', 'Play or pause');
  const next = controlButton('next', '>>|', 'Next track');
  const mute = controlButton('mute', 'MUTE', 'Mute or unmute');
  const stop = controlButton('stop', '[] STOP', 'Stop playback');
  controls.append(prev, playBtn, next, mute, stop);

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  playBtn.addEventListener('click', () => (store.playing ? pause() : play()));
  mute.addEventListener('click', () => {
    store.muted = !store.muted;
    media().muted = store.muted;
    refresh();
  });
  stop.addEventListener('click', () => {
    const element = media();
    element.pause();
    element.currentTime = 0;
    store.playing = false;
    announce('Playback stopped.');
    refresh();
  });
  controls.addEventListener('click', () => beep(700, 15));

  /* ---- volume ---- */
  const volumeRow = el('div', 'mp-ctrl');
  const volumeId = 'mp-volume';
  const volumeLabel = el('label', 'mp-label', 'VOL');
  volumeLabel.htmlFor = volumeId;
  const volume = el('input');
  volume.id = volumeId;
  volume.type = 'range';
  volume.min = '0';
  volume.max = '100';
  volume.value = String(Math.round(store.volume * 100));
  volume.dataset.action = 'volume';
  volume.addEventListener('input', () => setVolume(Number(volume.value) / 100));
  volumeRow.append(volumeLabel, volume);

  /* ---- playlist ---- */
  const list = el('div', 'mp-list');
  list.setAttribute('data-list', '');
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', 'Playlist');

  if (!tracks.length) {
    // Empty state: says exactly what to do, instead of showing fake rows.
    list.appendChild(
      el(
        'p',
        'mp-empty',
        'No tracks yet. Drop an .mp3 into public/audio/ and add one line to src/content/tracks.ts.'
      )
    );
  } else {
    tracks.forEach((track, index) => {
      const button = el('button');
      button.type = 'button';
      button.appendChild(el('span', undefined, `${String(index + 1).padStart(2, '0')}. ${track.title}`));
      if (track.artist) button.appendChild(el('em', undefined, track.artist));
      button.addEventListener('click', () => selectTrack(index, true));
      list.appendChild(button);
    });
  }

  root.append(screen, controls, volumeRow, list);
  panel = root;
  refresh();
  return root;
}

/** Called once from main.ts. */
export function initPlayer(): void {
  const element = media();
  element.volume = store.volume;
  element.addEventListener('ended', () => step(1));
  element.addEventListener('error', () => {
    store.playing = false;
    refresh();
  });
  trayIcon();

  window.setInterval(() => {
    if (!panel || !panel.isConnected) return;
    const active = store.playing && !store.muted;
    $all<HTMLElement>('.mp-viz i', panel).forEach((bar) => {
      bar.style.transform = `scaleY(${active ? 1.5 + Math.random() * 10 : 1})`;
    });
  }, 110);
}
