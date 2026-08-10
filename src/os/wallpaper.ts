/**
 * WALLPAPER.
 *
 * CSS wallpapers switch a data attribute on <body>. Image wallpapers paint a
 * dedicated layer. Image files are probed once at startup; any that are missing
 * are reported so the Display panel can show a labelled placeholder instead of
 * offering a broken option.
 */

import { $, announce, prefersReducedMotion } from './dom';
import { store } from './state';
import { beep } from './sound';
import { wallpapers, type Wallpaper } from '../content/wallpapers';
import { el } from '../render';
import { cssUrl } from '../safeurl';

const missing = new Set<string>();
let imageLayer: HTMLElement | null = null;

export function isMissing(id: string): boolean {
  return missing.has(id);
}

/**
 * Check which image wallpapers actually exist, so the Display panel can show a
 * labelled placeholder instead of a broken option.
 *
 * Deliberately `fetch` rather than `new Image()`: a 404 on an <img> prints
 * "Failed to load resource" in the browser console, and this site holds itself
 * to a clean console. A fetch that 404s resolves quietly.
 */
export async function probeImages(): Promise<void> {
  const images = wallpapers.filter(
    (w): w is Extract<Wallpaper, { kind: 'image' }> => w.kind === 'image'
  );

  await Promise.all(
    images.map(async (wallpaper) => {
      try {
        const response = await fetch(wallpaper.src, { method: 'HEAD', cache: 'no-store' });
        // `response.ok` alone is not enough: Vite's dev server answers a missing
        // path with 200 and the index page, so a typo'd filename would look fine
        // in `npm run dev` and break only once deployed. An HTML answer to an
        // image request means the file is not there.
        const type = response.headers.get('content-type') ?? '';
        if (!response.ok || type.startsWith('text/html')) missing.add(wallpaper.id);
      } catch {
        missing.add(wallpaper.id);
      }
    })
  );
}

/** Milliseconds the old wallpaper takes to fade away. */
const CROSSFADE_MS = 620;

/**
 * An even, symmetric curve — deliberately not the site's usual `--ease`, which
 * front-loads its motion. That is right for a panel flying in and wrong for a
 * crossfade: it would dump most of the change into the first 150ms and read as
 * a snap rather than a fade.
 */
const CROSSFADE_EASE = 'cubic-bezier(0.45, 0, 0.55, 1)';

/**
 * Paint a copy of whatever is on screen right now into the crossfade layer and
 * start it fading out. Called just before the new wallpaper is applied, so the
 * new one is revealed underneath the old one rather than replacing it in one
 * frame.
 */
function crossfadeFrom(): void {
  const layer = document.getElementById('wallpaperPrev');
  const base = document.getElementById('wallpaper');
  if (!layer || !base || prefersReducedMotion()) return;

  const baseStyle = getComputedStyle(base);
  const usingImage = imageLayer?.classList.contains('on') ?? false;
  const source = usingImage && imageLayer ? getComputedStyle(imageLayer) : baseStyle;

  layer.style.backgroundColor = baseStyle.backgroundColor;
  layer.style.backgroundImage = source.backgroundImage;
  layer.style.backgroundSize = source.backgroundSize;
  layer.style.backgroundPosition = source.backgroundPosition;
  layer.style.backgroundRepeat = source.backgroundRepeat;

  // Jump to fully opaque with no transition, then fade. The reflow read in
  // between is what stops the browser collapsing both changes into one frame.
  layer.style.transition = 'none';
  layer.style.opacity = '1';
  void layer.offsetWidth;
  layer.style.transition = `opacity ${CROSSFADE_MS}ms ${CROSSFADE_EASE}`;
  layer.style.opacity = '0';
}

/**
 * Decode a picture before it is put on screen.
 *
 * Without this the crossfade visibly stalls: assigning the background starts a
 * ~500KB PNG decoding on the main thread, which delays the start of the
 * transition by a few hundred milliseconds, so the old wallpaper sits there and
 * then lurches. Decoding first costs nothing on a repeat switch — the browser
 * cache makes it resolve immediately.
 */
const decoded = new Set<string>();

async function decode(src: string): Promise<void> {
  if (decoded.has(src)) return;
  try {
    const image = new Image();
    image.src = src;
    await image.decode();
  } catch {
    /* A picture that will not decode still gets painted; the browser copes. */
  }
  decoded.add(src);
}

export function setWallpaper(id: string, options: { animate?: boolean } = {}): void {
  const wallpaper = wallpapers.find((w) => w.id === id);
  if (!wallpaper || missing.has(id)) return;

  imageLayer ??= document.getElementById('wallpaperImage');
  const changed = id !== store.wallpaper;
  store.wallpaper = id;

  // Mark the choice straight away, so the panel responds on the click even if
  // the picture takes a moment to decode.
  document.querySelectorAll<HTMLElement>('.bg-opt').forEach((option) => {
    option.setAttribute('aria-pressed', String(option.dataset.bg === id));
  });
  announce(`Wallpaper set to ${wallpaper.name}.`);
  beep(1200, 18);

  if (wallpaper.kind === 'image') {
    void decode(wallpaper.src).then(() => {
      if (store.wallpaper !== id) return; // someone clicked again while decoding
      if (options.animate && changed) crossfadeFrom();
      paint(wallpaper);
    });
    return;
  }

  if (options.animate && changed) crossfadeFrom();
  paint(wallpaper);
}

function paint(wallpaper: Wallpaper): void {
  if (wallpaper.kind === 'image') {
    // Keep the desk colour underneath so the screen is never blank.
    document.body.dataset.bg = 'teal';
    if (imageLayer) {
      imageLayer.style.transition = 'none';
      imageLayer.style.backgroundImage = cssUrl(wallpaper.src) ?? '';
      imageLayer.dataset.fit = wallpaper.fit ?? 'cover';
      imageLayer.classList.add('on');
    }
  } else {
    document.body.dataset.bg = wallpaper.id;
    if (imageLayer) {
      imageLayer.classList.remove('on');
      imageLayer.style.backgroundImage = '';
    }
  }
}

/** Build the decorative sprites some CSS wallpapers use (stars, clouds, etc). */
export function decorate(): void {
  const host = $('#wallpaper');

  const layer = el('div');
  layer.id = 'wallpaperImage';
  host.appendChild(layer);
  imageLayer = layer;

  for (let i = 0; i < 90; i++) {
    const star = el('div', 'star');
    const big = Math.random() < 0.15;
    Object.assign(star.style, {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${-Math.random() * 3}s`,
      opacity: String(0.4 + Math.random() * 0.6),
      width: big ? '4px' : '2px',
      height: big ? '4px' : '2px',
    });
    host.appendChild(star);
  }

  for (let i = 0; i < 6; i++) {
    const cloud = el('div', 'cloud');
    Object.assign(cloud.style, {
      top: `${6 + Math.random() * 36}%`,
      animationDuration: `${48 + Math.random() * 50}s`,
      animationDelay: `${-Math.random() * 70}s`,
      scale: String(1 + Math.random() * 1.4),
    });
    host.appendChild(cloud);
  }

  host.appendChild(el('div', 'sun'));
  host.appendChild(el('div', 'mtn'));
}
