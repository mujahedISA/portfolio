/**
 * BOOT SEQUENCE — the BIOS/POST screen that types out on load.
 *
 * This is the first thing anyone sees. Keep it short. An empty string is a
 * blank line. Editing this array is the whole job; timings are below.
 */

export const bootLines: string[] = [
  'MUJAHED BIOS v2.6  (C) 1996 M.ISSA SYSTEMS',
  '',
  'Main Processor  : Pentium 133MHz',
  'Memory Test     : 16384K OK',
  'Detecting IDE Primary Master  ... ANALYST-HDD 540MB',
  'Detecting Display Adapter     ... TRINITRON CRT 14"',
  'Detecting Sound Device        ... SOUND BLASTER 16',
  '',
  'Booting from C: ...',
  'Loading MUJAHED-DOS ......',
  '',
];

/** Milliseconds between lines. The first few lines go faster, like a real POST. */
export const bootTiming = {
  fastLines: 3,
  fastDelay: 90,
  slowDelay: 150,
  /** How long the C:\> prompt sits there before the desktop appears. */
  holdPrompt: 650,
};

/** Which window opens once the boot finishes. Must be an id from src/apps.ts. */
export const openOnBoot = 'about';
