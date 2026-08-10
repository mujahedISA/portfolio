import type { Block } from './types';

/** ABOUT window. Heading lives in src/apps.ts. */
export const about: Block[] = [
  {
    type: 'text',
    text: 'Software Engineering graduate from Üsküdar University, GPA 3.45 / 4.00, with a second degree in Business Administration from Anadolu University. IBM-certified Data Analyst.',
  },
  {
    type: 'text',
    text: "I work on questions, not datasets. Whether the source is 367 unsorted broker files, five thousand Arabic tweets, or 27,558 microscope images, the job is the same: get it clean, find what's actually true, and say it in one sentence a manager can act on. Twice I've found my own first answer was wrong and published the correction — that's the part I'd want you to check.",
  },
  { type: 'rule' },
  {
    type: 'panelRow',
    panels: [
      {
        title: 'EDUCATION',
        list: [
          'B.S. Software Engineering — Üsküdar University, 2026 — GPA 3.45 / 4.00',
          'B.A. Business Administration — Anadolu University, 2026',
        ],
      },
      {
        // Most recent first.
        title: 'EXPERIENCE',
        list: [
          'Data Analysis Intern — Manar Foundation, from 1 August 2026 — *current*',
          'Cloud / IT Intern — Eartech, 2025',
          'Azure infrastructure and deployment work with the engineering team',
        ],
      },
      {
        title: 'LANGUAGES',
        list: ['Arabic — native', 'English — professional', 'Turkish — professional'],
      },
    ],
  },
];
