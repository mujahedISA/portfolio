import type { Block } from './types';
import { links, profile } from './profile';

/**
 * CONTACT window. Every tile is a real, working link — test them after any
 * change. There is no href="#" anywhere in this project and it stays that way.
 */
export const contact: Block[] = [
  {
    type: 'tiles',
    tiles: [
      {
        label: 'GITHUB',
        value: links.github.replace('https://', ''),
        href: links.github,
        newTab: true,
      },
      {
        label: 'LINKEDIN',
        value: 'linkedin.com/in/mujahed-issa',
        href: links.linkedin,
        newTab: true,
      },
      { label: 'EMAIL', value: links.email, href: `mailto:${links.email}` },
      { label: 'PHONE', value: links.phoneDisplay, href: `tel:${links.phone}` },
      { label: 'DOWNLOAD CV', value: 'PDF · 2026', href: profile.resume, download: true },
    ],
  },
];
