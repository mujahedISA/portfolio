/**
 * PC SPEAKER.
 *
 * Off by default (see `data-beep` on <body>) and switched on from the Monitor
 * panel. The AudioContext is only created after a real click, so no browser
 * ever warns about autoplay and nothing makes a sound uninvited.
 */

let ctx: AudioContext | null = null;

export function beep(frequency = 880, ms = 28): void {
  if (document.body.dataset.beep !== 'on') return;
  try {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    ctx ??= new AudioCtor();
    if (ctx.state === 'suspended') void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = frequency;
    gain.gain.value = 0.03;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
  } catch {
    /* An unavailable AudioContext is not worth breaking the desktop over. */
  }
}
