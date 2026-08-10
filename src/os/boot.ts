/**
 * BOOT — the BIOS/POST screen that types out on load.
 *
 * The first thing anyone sees and the best part of the site, so it always runs.
 * Clicking or pressing a key skips to the end of the log; it does not skip the
 * boot itself. Under prefers-reduced-motion it types faster and the cursor
 * stops blinking, because the point is the text, not the animation.
 */

import { $, prefersReducedMotion } from './dom';
import { el } from '../render';
import { bootLines, bootTiming } from '../content/boot';

export function runBoot(done: () => void): void {
  const screen = $('#boot');
  const reduced = prefersReducedMotion();
  const speed = reduced ? 0.35 : 1;

  let index = 0;
  let timer = 0;
  let finished = false;

  const showPrompt = () => {
    screen.textContent = `${bootLines.join('\n')}\n`;
    const prompt = document.createTextNode('C:\\> ');
    const cursor = el('span');
    cursor.id = 'cursor';
    screen.append(prompt, cursor);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    document.removeEventListener('keydown', skip);
    screen.removeEventListener('pointerdown', skip);
    showPrompt();
    timer = window.setTimeout(() => {
      screen.hidden = true;
      done();
    }, bootTiming.holdPrompt * speed);
  };

  function skip(event: Event): void {
    // Let people tab into the page without nuking the boot sequence.
    if (event instanceof KeyboardEvent && (event.key === 'Tab' || event.key === 'Shift')) return;
    finish();
  }

  const tick = () => {
    if (index < bootLines.length) {
      screen.textContent += `${bootLines[index]}\n`;
      index += 1;
      const delay = index < bootTiming.fastLines ? bootTiming.fastDelay : bootTiming.slowDelay;
      timer = window.setTimeout(tick, delay * speed);
    } else {
      finish();
    }
  };

  document.addEventListener('keydown', skip);
  screen.addEventListener('pointerdown', skip);
  tick();
}
