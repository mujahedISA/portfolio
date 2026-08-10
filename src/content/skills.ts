import type { Block } from './types';

/**
 * SKILLS window.
 * Flat chips only. No bars, no percentages, no star ratings, no
 * "years of experience" numbers. Adding a tool = adding a string.
 */
export const skills: Block[] = [
  {
    type: 'panel',
    title: 'LANGUAGES',
    chips: ['Python', 'SQL', 'Java', 'JavaScript', 'HTML / CSS'],
  },
  {
    type: 'panel',
    title: 'DATA & ANALYSIS',
    chips: ['pandas', 'NumPy', 'matplotlib', 'scikit-learn', 'Excel', 'Power BI', 'Tableau', 'Cognos'],
  },
  {
    type: 'panel',
    title: 'MACHINE LEARNING',
    chips: ['TensorFlow', 'Keras', 'transfer learning', 'Grad-CAM', 'text classification'],
  },
  {
    type: 'panel',
    title: 'DATABASES',
    chips: ['MySQL', 'SQL Server', 'SSMS'],
  },
  {
    type: 'panel',
    title: 'SCRAPING & APIS',
    chips: [
      'BeautifulSoup',
      'requests',
      'REST APIs',
      'Google Drive API',
      'YouTube Data API',
      'Claude API',
      'Apify',
    ],
  },
  {
    type: 'panel',
    title: 'WEB & CLOUD',
    chips: ['Django', 'Microsoft Azure'],
  },
  {
    type: 'panel',
    title: 'TOOLING',
    chips: ['Git', 'GitHub', 'VS Code', 'Jupyter'],
  },
  {
    type: 'panel',
    title: 'CERTIFICATIONS',
    invert: true,
    chips: [
      'IBM Data Analyst Professional Certificate',
      'Introduction to Data Analytics',
      'Python for Data Science, AI & Development',
      'Data Visualization and Dashboards with Excel and Cognos',
      'Python Project for Data Science',
      'Excel Basics for Data Analysis',
    ],
  },
];
