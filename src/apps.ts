/**
 * APP REGISTRY — the list of everything on the desktop.
 *
 * This array is the single place that decides what appears as an icon, what
 * appears in the Start menu, and what a window contains. Order here is the
 * order on the desktop.
 *
 * TO ADD A WINDOW
 *   1. Write your copy in a new file under src/content/ (copy about.ts).
 *   2. Import it here.
 *   3. Add one object to the array below.
 *   That is the whole job. The window manager, taskbar, Start menu and
 *   keyboard shortcuts all read from this list — nothing else to register.
 */

import type { Block } from './content/types';
import { about } from './content/about';
import { skills } from './content/skills';
import { projects } from './content/projects';
import { contact } from './content/contact';
import { readme } from './content/readme';
import { profile } from './content/profile';

export interface AppDef {
  /** Stable id. Used for the taskbar, focus and `openOnBoot` in content/boot.ts. */
  id: string;
  /** Shown on the icon, the title bar and the taskbar button. Keep it short. */
  title: string;
  /**
   * Either a picture — './icons/folder.png' from public/icons/ —
   * or the name of a hand-drawn 16x16 sprite from src/sprites.ts.
   * A path (it has a slash or a file extension) means a picture.
   */
  icon: string;
  /** Left-hand text in the window's status bar. Optional flavour. */
  status?: string;
  /** Opening size in pixels. Clamped to the screen, so generous is fine. */
  width: number;
  height: number;
  /** The <h2> at the top of the window body. */
  heading?: string;
  /** Content blocks. Use this for anything that is text. */
  content?: Block[];
  /** Or a built-in interactive panel instead of content blocks. */
  build?: 'player' | 'display' | 'monitor';
  /** Or open a URL in a new tab and never make a window at all. */
  openUrl?: string;
}

export const apps: AppDef[] = [
  {
    id: 'about',
    title: 'ABOUT',
    icon: './icons/notes.png',
    status: 'C:\\USER\\ABOUT.EXE',
    width: 760,
    height: 510,
    heading: 'I TURN MESSY DATA INTO DECISIONS.',
    content: about,
  },
  {
    id: 'skills',
    title: 'SKILLS',
    icon: './icons/computer.png',
    status: '8 GROUPS LOADED',
    width: 680,
    height: 600,
    heading: 'EVERYTHING I BUILD WITH.',
    content: skills,
  },
  {
    id: 'projects',
    title: 'PROJECTS',
    icon: './icons/folder.png',
    status: `${projects.length} OBJECTS`,
    width: 830,
    height: 640,
    heading: 'THREE QUESTIONS I WENT AND ANSWERED.',
    content: [{ type: 'projects', projects }],
  },
  {
    id: 'contact',
    title: 'CONTACT',
    icon: './icons/phone.png',
    status: '5 CHANNELS',
    width: 690,
    height: 250,
    heading: "LET'S TALK.",
    content: contact,
  },
  {
    id: 'player',
    title: 'PLAYER',
    icon: './icons/cd.png',
    status: 'SOUND BLASTER 16',
    width: 440,
    height: 300,
    build: 'player',
  },
  {
    id: 'monitor',
    title: 'MONITOR',
    icon: './icons/tv.png',
    status: 'CRT SETTINGS',
    width: 500,
    height: 645,
    build: 'monitor',
  },
  {
    id: 'display',
    title: 'DISPLAY',
    icon: './icons/frame.png',
    status: 'WALLPAPER',
    width: 560,
    height: 320,
    build: 'display',
  },
  {
    id: 'readme',
    title: 'README',
    icon: './icons/clippy.png',
    status: 'READ ONLY',
    width: 600,
    height: 500,
    heading: 'README.TXT',
    content: readme,
  },
  {
    id: 'resume',
    title: 'RESUME',
    icon: './icons/paper.png',
    width: 0,
    height: 0,
    openUrl: profile.resume,
  },
];

export function findApp(id: string): AppDef | undefined {
  return apps.find((app) => app.id === id);
}
