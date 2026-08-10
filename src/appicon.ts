/**
 * APP ICONS.
 *
 * An app's `icon` field in src/apps.ts is either:
 *   - a path, e.g. './icons/folder.png'  -> a picture from public/icons/
 *   - a name, e.g. 'display'             -> a hand-drawn 16x16 sprite
 *
 * One field, and which kind it is is obvious from reading it. Everything that
 * draws an icon (desktop, title bar, taskbar, Start menu) goes through here, so
 * changing a single line in the registry changes it in all four places.
 */

import { icon as sprite } from './sprites';

function isPicture(name: string): boolean {
  return name.includes('/') || /\.(png|gif|webp|svg)$/i.test(name);
}

/**
 * Turn './icons/clippy.png' or 'monogram' into 'ico-clippy' / 'ico-monogram'.
 * That class is what src/styles/icon-animations.css hangs each hover animation
 * on, so giving an icon its own movement is a CSS rule and nothing else.
 */
function iconClass(name: string): string {
  const base = name.split('/').pop() ?? name;
  return `ico-${base.replace(/\.[^.]+$/, '')}`;
}

/** Build a fresh icon element. Always decorative — a text label sits next to it. */
export function appIcon(name: string): Element {
  const className = `ico ${iconClass(name)}`;

  if (!isPicture(name)) {
    const svg = sprite(name);
    svg.setAttribute('class', className);
    return svg;
  }

  const img = document.createElement('img');
  img.src = name;
  img.alt = '';
  img.decoding = 'async';
  img.className = className;
  img.setAttribute('aria-hidden', 'true');
  // An <img> is draggable by default. Grabbing one starts the browser's own
  // drag-and-drop, which fires pointercancel and kills our drag a few pixels in.
  img.draggable = false;
  return img;
}
