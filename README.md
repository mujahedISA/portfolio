# MUJAHED-DOS

Portfolio of **Mujahed Issa**, junior data / BI analyst — built as a retro
desktop operating system rendered on a 1996 CRT.

Icons, windows you can drag, a taskbar, a Start menu. The content lives inside
the windows.

## Run it

```bash
npm install
npm run dev
```

## Editing the content

See **[CONTENT.md](CONTENT.md)**. Short version: every word on the site is in
`src/content/`. Adding a project is one object in one file.

## Stack

Vite + TypeScript. **Zero runtime dependencies** — no React, no UI library, no
icon font, no image files for the interface. Every icon is a hand-authored 16×16
pixel map drawn as SVG at runtime, and the fonts are self-hosted.

Production build: about 37 KB of JavaScript and 22 KB of CSS (13 KB + 6 KB
gzipped).

```
src/
  content/     every sentence on the site
  apps.ts      the list of windows — add one entry, get an icon + window
  sprites.ts   16x16 pixel maps
  render.ts    turns content data into DOM
  os/          window manager, taskbar, start menu, icons, boot, wallpaper
  apps/        media player, display and monitor panels
  styles/      tokens, CRT layers, shell, window, content, icon animations, responsive
tools/         asset generator for the favicon and link-preview image
```

## Deploy

Push to `main`; the GitHub Actions workflow builds and publishes to GitHub
Pages. Also works on Vercel or Netlify with build `npm run build`, output `dist`.
The build uses relative asset paths, so it runs from any subdirectory.

## Notes

- SOFT CRT is the default. Flicker and chromatic aberration are off by default.
  The Monitor window can turn the whole effect off.
- No autoplay. No `localStorage`. No tracking. No backend.
- Windows and desktop icons can both be dragged. Icon positions are not
  persisted — nothing here writes to storage.
- Respects `prefers-reduced-motion`: the boot reveal, the icon cascade and every
  hover animation are skipped, not merely paused.
