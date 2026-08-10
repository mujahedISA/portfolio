/**
 * MEDIA PLAYER PLAYLIST.
 *
 * The player reads whatever is in this array — one track or ten, it does not
 * care. To add a song: drop the .mp3 into `public/audio/` and add one object.
 *
 * Naming convention for the files: `NN-lowercase-with-dashes.mp3`
 *   public/audio/01-aquatic-ambience.mp3
 *   public/audio/02-your-next-track.mp3
 *
 * Nothing plays until the visitor presses play. There is no autoplay.
 */

export interface Track {
  /** Shown on the player's green screen. Keep it under ~22 characters. */
  title: string;
  /** Optional second line. Leave it out if you are not sure of the credit. */
  artist?: string;
  /** Path inside /public. */
  src: string;
}

export const tracks: Track[] = [
  { title: 'AQUATIC AMBIENCE', src: './audio/01-aquatic-ambience.mp3' },
  { title: 'FRUTIGER AERO', src: './audio/02-frutiger-aero.mp3' },
  { title: 'LEASE EXTENDED', src: './audio/03-lease-extended.mp3' },
];
