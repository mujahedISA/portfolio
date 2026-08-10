import type { AppDef } from '../apps';
import { defaultWallpaper } from '../content/wallpapers';

export interface WindowRecord {
  app: AppDef;
  el: HTMLElement;
  minimized: boolean;
  maximized: boolean;
  /** Geometry to restore when un-maximizing. */
  restore: { left: string; top: string; width: string; height: string } | null;
}

/**
 * Runtime state. Deliberately not persisted — no localStorage, no cookies,
 * nothing to consent to. Reload gives everyone the same first impression.
 */
export const store = {
  windows: new Map<string, WindowRecord>(),
  active: null as string | null,
  z: 100,
  wallpaper: defaultWallpaper,
  track: 0,
  playing: false,
  muted: false,
  volume: 0.7,
  /** True below 820px. Kept in sync with the stylesheet by main.ts. */
  mobile: false,
};
