/**
 * DISPLAY — wallpaper picker.
 *
 * CSS wallpapers always work. Picture wallpapers listed in content/wallpapers.ts
 * are probed at startup; if the file is not there yet the tile shows the exact
 * path to drop it at and cannot be chosen. No dead options, no invented assets.
 */

import { el } from '../render';
import { store } from './../os/state';
import { setWallpaper, isMissing } from './../os/wallpaper';
import { wallpapers } from '../content/wallpapers';

export function buildDisplay(): HTMLElement {
  const root = el('div');
  root.appendChild(el('p', 'hint', 'Pick a wallpaper. It applies straight away.'));

  const grid = el('div', 'bg-grid');

  for (const wallpaper of wallpapers) {
    const missing = wallpaper.kind === 'image' && isMissing(wallpaper.id);

    const option = el('button', missing ? 'bg-opt missing' : 'bg-opt');
    option.type = 'button';
    option.dataset.bg = wallpaper.id;
    option.setAttribute('aria-pressed', String(store.wallpaper === wallpaper.id));

    const swatch = el('div', wallpaper.kind === 'css' ? `sw ${wallpaper.swatch}` : 'sw');

    if (wallpaper.kind === 'image') {
      if (missing) {
        swatch.textContent = `MISSING ${wallpaper.src.replace('./', '/')}`;
      } else {
        swatch.style.backgroundImage = `url("${wallpaper.src}")`;
      }
    }

    option.append(swatch, el('b', undefined, wallpaper.name));

    if (missing) {
      option.disabled = true;
      option.title = `Drop the file at public${wallpaper.src.replace('./', '/')} to enable this wallpaper.`;
      option.setAttribute('aria-label', `${wallpaper.name} — file not added yet`);
    } else {
      option.addEventListener('click', () => setWallpaper(wallpaper.id, { animate: true }));
    }

    grid.appendChild(option);
  }

  // Always-present note so the picture-wallpaper route is discoverable from
  // inside the site, not only from CONTENT.md. Not a button — it does nothing,
  // and nothing on this desktop that looks clickable is fake.
  if (!wallpapers.some((w) => w.kind === 'image')) {
    const slot = el('div', 'bg-opt slot');
    const swatch = el('div', 'sw', 'DROP A PNG IN public/wallpapers/');
    slot.append(swatch, el('b', undefined, 'ADD YOUR OWN'));
    grid.appendChild(slot);
  }

  root.appendChild(grid);
  return root;
}
