/**
 * Content block types.
 *
 * Everything you can put inside a window is one of these. The renderer
 * (src/render.ts) turns them into DOM. If you want a shape that does not exist
 * here yet, add it to `Block` and add one `case` to the renderer.
 *
 * Inline emphasis: wrap words in *asterisks* to make them bold, in any `text`
 * field. That is the only markup — everything else is plain text, so you never
 * have to escape a quote, an ampersand or an angle bracket.
 */

/** A grey bevelled box with a heading, holding either a bullet list or chips. */
export interface Panel {
  title: string;
  /** Bullet lines. */
  list?: string[];
  /** Flat pills. No levels, no percentages, no bars — ever. */
  chips?: string[];
  /** Navy chips instead of grey. Used for certifications. */
  invert?: boolean;
}

export interface Project {
  name: string;
  year: string;
  /** The question the project answers. Rendered in green, quoted. */
  question: string;
  /**
   * Who did the work, when it was not only you. Shown as a badge under the
   * year. Leave it out for solo projects — an absent badge reads as solo, so
   * only ever add it, never remove it to make something look bigger.
   */
  credit?: string;
  /** One paragraph. Plain text. */
  body: string;
  /** Short black-on-green readouts. Keep them to a few words each. */
  metrics: string[];
  /** Tech tags, rendered as chips. */
  tags: string[];
  /** Full URL to the repo. Never "#", never empty. */
  repo: string;
  /** Button label. Defaults to "VIEW ON GITHUB". */
  repoLabel?: string;
}

export interface Tile {
  label: string;
  value: string;
  href: string;
  /** Opens in a new tab with rel="noopener noreferrer". */
  newTab?: boolean;
  /** Triggers a file download instead of navigating. */
  download?: boolean;
}

export type Block =
  | { type: 'text'; text: string; lead?: boolean }
  | { type: 'quote'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'rule' }
  | { type: 'list'; items: string[] }
  /** Several panels side by side in an asymmetric grid. */
  | { type: 'panelRow'; panels: Panel[] }
  /** One panel across the full width. */
  | ({ type: 'panel' } & Panel)
  | { type: 'projects'; projects: Project[] }
  | { type: 'tiles'; tiles: Tile[] };
