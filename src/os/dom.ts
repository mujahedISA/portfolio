/** Tiny DOM helpers. No library, no jQuery nostalgia. */

export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Expected element "${selector}" to exist.`);
  return node;
}

export function $all<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

let liveRegion: HTMLElement | null = null;

/** Speak a short status update to screen readers. */
export function announce(message: string): void {
  liveRegion ??= document.getElementById('live');
  if (liveRegion) liveRegion.textContent = message;
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
