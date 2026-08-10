# How to change this site

Written for you, later, when you have forgotten how the code works.

**One rule:** all your words live in `src/content/`. You never need to open
anything else to change text. If you find yourself editing a `.css` file to fix
wording, you are in the wrong place.

---

## First: get it running

```bash
cd portfolio-v2
npm install
npm run dev
```

Open http://localhost:5173. Leave it running. Every time you save a file, the
browser updates by itself.

To stop it: press `Ctrl+C` in the terminal.

---

## Where every piece of text lives

| I want to change... | Open this file |
|---|---|
| The About paragraphs, education, experience, languages | `src/content/about.ts` |
| Tools, skills, certifications | `src/content/skills.ts` |
| Projects | `src/content/projects.ts` |
| Email, phone, GitHub, LinkedIn, CV link | `src/content/profile.ts` |
| The contact tiles | `src/content/contact.ts` |
| The README window text | `src/content/readme.ts` |
| The boot / BIOS lines | `src/content/boot.ts` |
| The music playlist | `src/content/tracks.ts` |
| The wallpaper list | `src/content/wallpapers.ts` |
| Window titles, sizes, which icon | `src/apps.ts` |

Two things live outside `src/content/` on purpose:

- **`index.html`** — the page title, the description Google shows, and the
  no-JavaScript fallback links near the bottom. If you change your email in
  `profile.ts`, change it in that fallback block too. It is 6 lines.
- **`src/apps.ts`** — the list of windows.

---

## Add a project

Open `src/content/projects.ts`. Copy one whole block and change the words:

```ts
{
  name: 'My New Project',
  year: '2026',
  question: 'The question this project answers.',
  body: 'One paragraph. Plain text. Quotes and & signs are fine.',
  metrics: ['1,234 ROWS', '96.1% ACCURACY'],
  tags: ['Python', 'pandas'],
  repo: 'https://github.com/mujahedISA/the-real-repo',
},
```

**If it was teamwork, say so.** Add a `credit` line and a navy badge appears
under the year:

```ts
credit: 'TEAM PROJECT · BUILT WITH OTHERS',
```

No badge means you did it alone, so only ever add one — never delete one to make
a project look bigger. The Malaria benchmark carries this badge, and its
paragraph says "we" rather than "I" for the same reason.

Save. That is the whole job.

The Projects window renders whatever is in the array, and the "3 OBJECTS"
counter in the status bar counts itself. You do not touch anything else.

**Rules for `repo`:** it must be a real URL. Never `#`, never empty. All three
projects now point at their real repositories. If a future one is not public
yet, point it at `https://github.com/mujahedISA` and swap in the direct link the
moment it exists — never leave a link that goes nowhere.

**Never** change a number unless it is true. This is a job-search site.

**Never** describe shared work as if it were solo. That is the one mistake a
recruiter can check and will not forgive.

---

## Add a whole new window

Three steps.

**1. Write the content.** Make a new file, for example `src/content/writing.ts`:

```ts
import type { Block } from './types';

export const writing: Block[] = [
  { type: 'text', text: 'Things I have written.' },
  { type: 'rule' },
  { type: 'list', items: ['First piece', 'Second piece'] },
];
```

**2. Register it.** In `src/apps.ts`, import it at the top and add one object:

```ts
import { writing } from './content/writing';
// ...
{
  id: 'writing',
  title: 'WRITING',
  icon: 'readme',
  status: 'DRAFTS',
  width: 600,
  height: 480,
  heading: 'THINGS I HAVE WRITTEN.',
  content: writing,
},
```

**3. Save.** The desktop icon, the Start menu entry, the taskbar button and the
keyboard shortcuts all appear on their own. There is no fourth step and no
second place to register it.

Order in that array is the order of the icons down the left side.

### The content blocks you can use

| Block | What it makes |
|---|---|
| `{ type: 'text', text: '...' }` | A paragraph |
| `{ type: 'text', text: '...', lead: true }` | A slightly bigger paragraph |
| `{ type: 'quote', text: '...' }` | Green quoted line with a bar down the left |
| `{ type: 'heading', text: '...' }` | A small dark-red section heading |
| `{ type: 'rule' }` | A dotted divider |
| `{ type: 'list', items: ['a', 'b'] }` | A bullet list |
| `{ type: 'panel', title: 'TOOLS', chips: ['Python'] }` | One grey box of pills |
| `{ type: 'panel', title: 'X', list: ['a'] }` | One grey box with bullets |
| `{ type: 'panelRow', panels: [...] }` | Several grey boxes side by side |
| `{ type: 'projects', projects }` | Project cards |
| `{ type: 'tiles', tiles: [...] }` | Contact tiles |

Add `invert: true` to a panel to make its pills navy instead of grey.

To make words **bold** inside any text, wrap them in asterisks: `*like this*`.
That is the only formatting. Everything else is plain text, so you never have to
escape a quote or an ampersand.

---

## Change or add an icon

Every window's icon is set by one line in `src/apps.ts`:

```ts
icon: './icons/folder.png',   // a picture from public/icons/
icon: 'monogram',             // a hand-drawn 16x16 sprite
```

If the value looks like a path it is a picture; otherwise it is a sprite name.
That is the only rule.

Pictures currently in `public/icons/`: `notes` `computer` `folder` `phone` `cd`
`tv` `clippy` `frame` `paper`. `book.png` is in there too and spare — nothing
uses it, so it is free if you add a window.

### Swapping in a new picture

Save a PNG with a transparent background into `public/icons/` at **48x48**, then
point the `icon:` line at it.

48 is exactly the size the desktop draws them, and that is deliberate: at 1:1 the
browser keeps the hard pixel edges, where shrinking a bigger picture would throw
away every fourth pixel and make it mushy.

If your source picture has a solid background behind it, or a text label baked
into it, run it through the helper instead of editing it by hand:

```bash
python tools/process-assets.py <folder-with-your-pictures>
```

That flood-fills the background away, crops off the label, trims the edges and
writes a square 48px PNG.

### Hover animations

Each icon does something of its own when the mouse is over it — the CD spins,
the phone rings, the TV loses signal, Clippy wiggles. They live in
`src/styles/icon-animations.css`, one clearly-labelled block per icon, keyed off
the picture's filename: `clippy.png` is styled by `.ico-clippy`.

To change what an icon does, edit its block. To give a new icon a movement, copy
a block and rename the class to match your file.

They run only on the desktop (not in title bars or the taskbar), only with a
real mouse, and never under "reduce motion".

### Drawing a sprite instead

Sprites are not image files. Each one is 16 rows of 16 characters in
`src/sprites.ts`. Adding one is 16 lines of typing.

```ts
myicon: [
  '................',
  '....kkkkkkkk....',
  '....kwwwwwwk....',
  // ...16 rows in total, each exactly 16 characters
],
```

Each letter is a colour, listed at the top of that file:

```
. transparent    k black      w white       g face grey
s shadow grey    d dark grey  b navy        u blue
c cyan           y yellow     o orange      r red
n green          l light green t teal       p pink
m skin/wood      e near white
```

Then use the name in `src/apps.ts`: `icon: 'myicon'`.

The `monogram` sprite is the system mark — the M on the Start button, in the
Start menu and in the favicon. It is deliberately not a four-square flag: this
site is not Windows and must not borrow anyone else's logo. If you change it,
re-run `python tools/make-assets.py` so the favicon matches.

If you miscount a row, the browser console tells you exactly which sprite and
which row while you are running `npm run dev`. It will not fail silently.

---

## Moving icons around

Drag any desktop icon and drop it wherever you like. The column stays a tidy
column until the first time you actually drag something; after that every icon
keeps the position you give it.

Positions are **not saved**. Nothing in this project writes to storage, so a
reload puts the desktop back to the layout every visitor sees first. If you want
a different default order, reorder the array in `src/apps.ts` instead.

Dragging is a mouse thing. On a phone a tap opens the app, which is what a tap
should do.

---

## Swap a wallpaper

You wanted real pixel-art wallpapers rather than CSS gradients, so the code
supports both.

1. Put the picture in `public/wallpapers/`, for example `04.png`. Run it through
   `python tools/process-assets.py <folder>` first if it is a big photo — that
   crops it to 16:9, resizes to 1600x900 and cuts it to 128 colours, which is
   what gives the three existing ones their crisp pixel-art banding.
2. Add a line to `src/content/wallpapers.ts`:

```ts
{ id: 'pix01', name: 'CITY AT NIGHT', kind: 'image', src: './wallpapers/01.png', fit: 'cover' },
```

`fit` can be `'cover'` (fill the screen), `'tile'` (repeat) or `'center'`
(actual size — use this for a real 640×480 retro wallpaper).

Only list a file that is actually there: a wallpaper listed but missing makes
the browser log a 404, and this site keeps its console clean.

If you do list one early, nothing breaks. The Display window shows a striped
**MISSING** tile naming the exact path, and it cannot be selected — so the site
never offers a broken option.

Changing wallpaper crossfades. The old one is copied into a layer on top and
faded out over 620ms, so both the picture wallpapers and the CSS ones blend
instead of snapping. The timing is `CROSSFADE_MS` in `src/os/wallpaper.ts`.

To change which wallpaper the desktop starts on, edit `defaultWallpaper` at the
bottom of the same file.

---

## Add a music track

1. Put the `.mp3` in `public/audio/`, named `NN-lowercase-with-dashes.mp3`
   (for example `02-title-theme.mp3`).
2. Add one line to `src/content/tracks.ts`:

```ts
{ title: 'TITLE THEME', src: './audio/02-title-theme.mp3' },
```

The player reads however many tracks are in the list — one, three, or ten. You
never have to change a count anywhere. `artist` is optional; leave it out if you
are not sure of the credit.

Nothing ever plays until a visitor presses play.

---

## Swap the CV

Replace `public/Mujahed_Issa_Resume_2026.pdf` with the new file.

If the **filename** changes, update `resume:` in `src/content/profile.ts`, and
the fallback link near the bottom of `index.html`.

---

## Change the favicon or the link preview image

Both are generated from the same pixel palette by a script:

```bash
python tools/make-assets.py
```

It writes `public/favicon.svg`, `public/favicon.png`,
`public/apple-touch-icon.png` and `public/og.png` (1200×630, the picture that
shows when you paste your link into LinkedIn or WhatsApp). Only re-run it if you
change the colours or the wording inside that script.

---

## Deploy

The site is static. Any host works. It is already set up for GitHub Pages.

**First time only:** push the project to a GitHub repo, then go to
Settings → Pages → Source → choose **GitHub Actions**.

**If you name the repo anything other than `portfolio`**, change one line at the
top of `vite.config.ts`:

```ts
const SITE_URL = 'https://mujahedisa.github.io/your-repo-name/';
```

That single line fills in the canonical link and the `og:image` used by LinkedIn
and WhatsApp link previews. Those must be absolute URLs — get it wrong and your
link shows up as a blank card. The build fails loudly if it cannot set it, so it
cannot break quietly.

**Every time after that:**

```bash
git add . && git commit -m "update projects" && git push
```

That is it. The workflow in `.github/workflows/deploy.yml` builds and publishes
it, usually within about a minute.

**Vercel instead:** import the repo, framework preset "Vite", build command
`npm run build`, output directory `dist`. Nothing else to configure.

**Check before you push:**

```bash
npm run build
```

If that command fails, the deploy would have failed too. It checks your types,
so a typo like `metric:` instead of `metrics:` is caught here rather than
appearing as a blank space on the live site.

---

## Rules that keep the site honest

These are from your own brief. Worth keeping.

- Never invent or round a number, tool, employer or date.
- No `href="#"`. Every link goes somewhere real.
- No skill bars, percentages, star ratings or years-of-experience counts. Flat
  chips only.
- If it looks clickable, it does something. No decorative menus.
- No CV filler: "passionate", "results-driven", "detail-oriented", "team player".
- Nothing makes a sound until someone clicks.
- No Windows logo, or anyone else's logo, anywhere on the site.

---

## If something breaks

| What you see | What to do |
|---|---|
| `npm run dev` fails | Run `npm install` again |
| Red text about a type | You mistyped a field name. The message names the file and line |
| An icon is blank | Check the console — it names the sprite and the bad row |
| A wallpaper shows MISSING | The file is not in `public/wallpapers/` yet |
| The page is blank | Open the browser console (F12) and read the first red line |

Nothing here needs a server, a database or a login. If it renders on your
machine, it renders on the live site.
