/**
 * WALLPAPERS.
 *
 * Two kinds:
 *   kind: 'css'    — drawn with CSS, no file needed. Styles live in
 *                    src/styles/shell.css under `body[data-bg='<id>']`.
 *   kind: 'image'  — a real picture from `public/wallpapers/`.
 *
 * An 'image' entry whose file is not on disk shows a striped "MISSING" tile in
 * the Display window naming the exact path to drop the file at, and cannot be
 * selected. So the list below is honest about what exists — nothing is faked
 * and nothing is a dead link.
 *
 * To add a picture wallpaper: save the file into public/wallpapers/ and add an
 * object here. Nothing else.
 */

export type Wallpaper =
  | { id: string; name: string; kind: 'css'; swatch: string }
  | {
      id: string;
      name: string;
      kind: 'image';
      src: string;
      /** cover = fill the screen, tile = repeat, center = actual size. */
      fit?: 'cover' | 'tile' | 'center';
    };

export const wallpapers: Wallpaper[] = [
  { id: 'teal', name: 'SYSTEM TEAL', kind: 'css', swatch: 'sw-teal' },
  { id: 'dither', name: 'DITHER 3.1', kind: 'css', swatch: 'sw-dither' },
  { id: 'stars', name: 'STARFIELD', kind: 'css', swatch: 'sw-stars' },
  { id: 'mtn', name: 'SUNSET 8BIT', kind: 'css', swatch: 'sw-mtn' },
  { id: 'grass', name: 'OVERWORLD', kind: 'css', swatch: 'sw-grass' },

  /* --- PICTURE WALLPAPERS ---
   * Real files in public/wallpapers/. To add one: save the picture there and
   * add a line here. Source pictures go through tools/process-assets.py, which
   * crops to 16:9, resizes to 1600x900 and cuts the palette to 128 colours —
   * that is what gives them the crisp banded pixel-art look.
   *
   * `fit`: 'cover' fills the screen · 'center' shows it at actual size (best
   * for a true 640x480 retro wallpaper) · 'tile' repeats it.
   *
   * Only list a file that is actually on disk. A listed-but-absent file makes
   * the browser log a 404, and this site keeps a clean console. If you do list
   * one early nothing breaks — the Display window shows a striped MISSING tile
   * naming the path, and the option cannot be picked.
   */
  { id: 'cave', name: 'SEA CAVE', kind: 'image', src: './wallpapers/01.png', fit: 'cover' },
  { id: 'meadow', name: 'MEADOW', kind: 'image', src: './wallpapers/02.png', fit: 'cover' },
  { id: 'dune', name: 'RED DUNE', kind: 'image', src: './wallpapers/03.png', fit: 'cover' },
];

/** Which wallpaper the desktop starts on. Must match an id above. */
export const defaultWallpaper = 'cave';
