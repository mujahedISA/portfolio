import type { Block } from './types';

/** README window — how to drive the desktop. Wrap words in *asterisks* for bold. */
export const readme: Block[] = [
  {
    type: 'text',
    text: 'MUJAHED-DOS — a portfolio that runs on a 1996 CRT instead of scrolling like a webpage.',
  },
  { type: 'rule' },
  { type: 'heading', text: 'CONTROLS' },
  {
    type: 'list',
    items: [
      'Double-click a desktop icon to open a window. One tap on a phone.',
      'Drag a window by its title bar. Resize from the bottom-right grip.',
      'Minimize, maximize and close sit top right. Double-click the title bar to maximize.',
      'The taskbar restores minimized windows. *START* opens everything.',
      'Arrow keys move between icons, *Enter* opens one.',
      '*Esc* closes the top window. *Alt+Tab* cycles focus.',
    ],
  },
  { type: 'heading', text: 'MONITOR' },
  {
    type: 'list',
    items: [
      'Open *Monitor* to change scanlines, grille, bloom, flicker and phosphor colour — or turn the whole CRT effect off.',
      '*Display* changes the wallpaper. The power button on the bezel turns the tube off.',
      'Nothing plays audio until you press play in *Player*.',
    ],
  },
  { type: 'heading', text: 'BUILT WITH' },
  {
    type: 'text',
    text: 'Vanilla TypeScript on Vite. No UI framework, no runtime dependencies, no image files — every icon is a hand-authored 16×16 pixel map drawn as SVG at runtime.',
  },
];
