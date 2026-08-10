/**
 * PIXEL SPRITE ENGINE.
 *
 * Every icon is a hand-authored 16×16 character map. No image files, no icon
 * font, nothing to download. At runtime each map is compressed into horizontal
 * runs and drawn as <rect> elements in an SVG, so icons stay crisp at any size.
 *
 * TO ADD AN ICON
 *   1. Copy one of the blocks below.
 *   2. Give it a name and write 16 rows of exactly 16 characters.
 *   3. Use the letters from PALETTE. A dot "." means transparent.
 *   4. Reference the name from `icon:` in src/apps.ts.
 *
 * Rows shorter or longer than 16 characters are caught by `assertSprites()` in
 * development, so a miscounted row shows up immediately instead of rendering
 * a slightly wrong picture.
 */

export const PALETTE: Record<string, string | null> = {
  '.': null, // transparent
  k: '#000000', // black
  w: '#ffffff', // white
  g: '#c0c0c0', // face grey
  s: '#808080', // shadow grey
  d: '#3f3f3f', // dark grey
  b: '#000080', // navy
  u: '#0060c0', // blue
  c: '#00c0ff', // cyan
  y: '#ffd000', // yellow
  o: '#e08000', // orange
  r: '#c00000', // red
  n: '#008000', // green
  l: '#40e040', // light green
  t: '#008080', // teal
  p: '#ff70b0', // pink
  m: '#c08050', // skin / wood
  e: '#e8e8e8', // near white
};

export const SPRITES: Record<string, string[]> = {
  about: [
    '................',
    '.....kkkkkk.....',
    '....kmmmmmmk....',
    '...kmmmmmmmmk...',
    '...kmwwmmwwmk...',
    '...kmkwmmkwmk...',
    '...kmmmmmmmmk...',
    '...kmmmkkmmmk...',
    '....kmmmmmmk....',
    '.....kmmmmk.....',
    '...kkkkuukkkk...',
    '..kuuuuuuuuuuk..',
    '.kuuuwuuuuwuuuk.',
    '.kuuuuuuuuuuuuk.',
    '.kuuuuuuuuuuuuk.',
    '.kkkkkkkkkkkkkk.',
  ],
  skills: [
    '................',
    '...........kkk..',
    '..........kssk..',
    '.........kskkk..',
    '.........kssk...',
    '........ksskk...',
    '.......kssk.....',
    '......kssk......',
    '.....kssk.......',
    '....kssk........',
    '..kkssk.........',
    '.ksssk..........',
    '.kssk...........',
    '.kkk............',
    '................',
    '................',
  ],
  projects: [
    '................',
    '..kkkk..........',
    '.kyyyykkkkkkk...',
    '.kyyyyyyyyyyyk..',
    '.kyyyyyyyyyyyyk.',
    '.kooooooooooook.',
    '.koyyyyyyyyyyok.',
    '.koyyyyyyyyyyok.',
    '.koyyyyyyyyyyok.',
    '.koyyyyyyyyyyok.',
    '.koyyyyyyyyyyok.',
    '.koyyyyyyyyyyok.',
    '.kooooooooooook.',
    '..kkkkkkkkkkkk..',
    '................',
    '................',
  ],
  contact: [
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kwwwwwwwwwwwwk.',
    '.kwkwwwwwwwwkwk.',
    '.kwwkwwwwwwkwwk.',
    '.kwwwkwwwwkwwwk.',
    '.kwwwwkwwkwwwwk.',
    '.kwwwwwkkwwwwwk.',
    '.kwwwwkwwkwwwwk.',
    '.kwwwkwwwwkwwwk.',
    '.kwwkwwwwwwkwwk.',
    '.kwkwwwwwwwwkwk.',
    '.kwwwwwwwwwwwwk.',
    '.kkkkkkkkkkkkkk.',
    '................',
  ],
  music: [
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kuuuuuuuuuuuuk.',
    '.kukkkkkkkkkkuk.',
    '.kukwwwwwwwwkuk.',
    '.kukwkkwwkkwkuk.',
    '.kukwkkwwkkwkuk.',
    '.kukwwwwwwwwkuk.',
    '.kukkkkkkkkkkuk.',
    '.kuuuuuuuuuuuuk.',
    '.kukuukuukuukuk.',
    '.kuuuuuuuuuuuuk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................',
  ],
  monitor: [
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kwggggggggggsk.',
    '.kgkkkkkkkkkkgk.',
    '.kgkuuuuuuuukgk.',
    '.kgkuccccccukgk.',
    '.kgkucllllcukgk.',
    '.kgkucllllcukgk.',
    '.kgkuccccccukgk.',
    '.kgkuuuuuuuukgk.',
    '.kgkkkkkkkkkkgk.',
    '.kggggggggggggk.',
    '.kkkkkkkkkkkkkk.',
    '....kssssssk....',
    '..kkkkkkkkkkkk..',
    '................',
  ],
  display: [
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kcccccccccccck.',
    '.kcccccccyyccck.',
    '.kcccccccyyccck.',
    '.kcccccccccccck.',
    '.kccccccnncccck.',
    '.kcccccnnnnccck.',
    '.kccccnnnnnncck.',
    '.kccnnnnnnnnnck.',
    '.knnnnnnnnnnnnk.',
    '.knnnnnnnnnnnnk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................',
    '................',
  ],
  readme: [
    '................',
    '..kkkkkkkkkk....',
    '..kwwwwwwwkkk...',
    '..kwwwwwwwkwk...',
    '..kwwwwwwwkkkk..',
    '..kwwwwwwwwwwk..',
    '..kwkkkkkkkwwk..',
    '..kwwwwwwwwwwk..',
    '..kwkkkkkkkwwk..',
    '..kwwwwwwwwwwk..',
    '..kwkkkkkkkwwk..',
    '..kwwwwwwwwwwk..',
    '..kwkkkkkwwwwk..',
    '..kwwwwwwwwwwk..',
    '..kkkkkkkkkkkk..',
    '................',
  ],
  cv: [
    '................',
    '..kkkkkkkkkk....',
    '..kwwwwwwwkkk...',
    '..kwwwwwwwkwk...',
    '..kwwwwwwwkkkk..',
    '..kwwwwwwwwwwk..',
    '..kwkkkkkkkwwk..',
    '..kwwwwwwwwwwk..',
    '..kwkkkkkkkwwk..',
    '..kwwwwwwwwwwk..',
    '.kkkkkkkkkkkkk..',
    '.krrrrrrrrrrrk..',
    '.krwrwrwwrwrrk..',
    '.krrrrrrrrrrrk..',
    '..kkkkkkkkkkkk..',
    '................',
  ],
  /**
   * The system mark: an M monogram on a navy plate. Used on the Start button,
   * in the Start menu, and as the favicon.
   *
   * It deliberately is NOT a four-square flag. This site is not Windows and
   * must not borrow anyone's logo.
   */
  monogram: [
    '................',
    '.bbbbbbbbbbbbbb.',
    '.bbbbbbbbbbbbbb.',
    '.bbwwbbbbbbwwbb.',
    '.bbwwwbbbbwwwbb.',
    '.bbwwwwbbwwwwbb.',
    '.bbwwbwwwwbwwbb.',
    '.bbwwbbwwbbwwbb.',
    '.bbwwbbbbbbwwbb.',
    '.bbwwbbbbbbwwbb.',
    '.bbwwbbbbbbwwbb.',
    '.bbwwbbbbbbwwbb.',
    '.bbbbbbbbbbbbbb.',
    '.bbbbbbbbbbbbbb.',
    '................',
    '................',
  ],
  note: [
    '................',
    '..........kkkk..',
    '..........kbbk..',
    '.......kkkkbbk..',
    '.......kbbbbbk..',
    '.......kbkkkkk..',
    '.......kbk......',
    '.......kbk......',
    '.......kbk......',
    '....kkkkbk......',
    '...kbbbbbk..kk..',
    '..kbbbbbbk.kbbk.',
    '..kbbbbbk..kbbk.',
    '...kbbbk...kbk..',
    '....kkk.....k...',
    '................',
  ],
  mute: [
    '................',
    '..........kkkk..',
    '..........kssk..',
    '.......kkkkssk..',
    '..k....ksssssk..',
    '...k...kskkkkk..',
    '....k..ksk......',
    '.....k.ksk......',
    '......kksk......',
    '....kkkksk......',
    '...kssskkk..kk..',
    '..ksssssk.kkssk.',
    '..kssssk.k.kssk.',
    '...ksssk...ksk..',
    '....kkk.....k...',
    '................',
  ],
  power: [
    '................',
    '.......ee.......',
    '....e..ee..e....',
    '...ee..ee..ee...',
    '..ee...ee...ee..',
    '..ee........ee..',
    '.ee..........ee.',
    '.ee..........ee.',
    '.ee..........ee.',
    '..ee........ee..',
    '..ee........ee..',
    '...ee......ee...',
    '....eeeeeeee....',
    '................',
    '................',
    '................',
  ],
};

export type SpriteName = keyof typeof SPRITES;

const SVG_NS = 'http://www.w3.org/2000/svg';

interface Run {
  x: number;
  y: number;
  w: number;
  fill: string;
}

/** Compress a character map into horizontal runs once, then reuse forever. */
function compress(map: string[]): Run[] {
  const runs: Run[] = [];
  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const fill = PALETTE[ch];
      if (!fill) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w++;
      runs.push({ x, y, w, fill });
      x += w;
    }
  }
  return runs;
}

const RUNS = new Map<string, Run[]>();
for (const [name, map] of Object.entries(SPRITES)) RUNS.set(name, compress(map));

/**
 * Build a fresh <svg> for the named sprite. Decorative by default — icons sit
 * next to a real text label, so screen readers should skip them.
 */
export function icon(name: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  for (const run of RUNS.get(name) ?? []) {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', String(run.x));
    rect.setAttribute('y', String(run.y));
    rect.setAttribute('width', String(run.w));
    rect.setAttribute('height', '1');
    rect.setAttribute('fill', run.fill);
    svg.appendChild(rect);
  }
  return svg;
}

/** Dev-only guard: shouts if a sprite is not 16 rows of 16 characters. */
export function assertSprites(): void {
  if (!import.meta.env.DEV) return;
  for (const [name, map] of Object.entries(SPRITES)) {
    if (map.length !== 16) {
      console.warn(`[sprites] "${name}" has ${map.length} rows, expected 16.`);
    }
    map.forEach((row, i) => {
      if (row.length !== 16) {
        console.warn(`[sprites] "${name}" row ${i} has ${row.length} characters, expected 16.`);
      }
      for (const ch of row) {
        if (!(ch in PALETTE)) {
          console.warn(`[sprites] "${name}" row ${i} uses unknown character "${ch}".`);
        }
      }
    });
  }
}
