import type { Project } from './types';

/**
 * PROJECTS.
 *
 * To add a project: copy one object, change the fields, done. Nothing else in
 * the codebase needs touching — the window renders whatever is in this array.
 *
 * `repo` must be a real, working URL. Never "#". If a repo is not public yet,
 * point it at `https://github.com/mujahedISA` and swap in the direct URL the
 * moment you have it — never leave a link that goes nowhere.
 *
 * `credit` is optional and only for work that was not yours alone. No badge
 * means solo. Add one when it applies; never drop one to make a project look
 * bigger than it was.
 */
export const projects: Project[] = [
  {
    name: 'Istanbul Real Estate Analysis',
    year: '2026',
    question:
      'Which districts are genuinely expensive, and which are just priced in a falling currency?',
    body: 'Built from my own broker archive: 367 heterogeneous files — price-sheet PDFs, phone photos of printed tables, WhatsApp screenshots, Sheets exports — pulled through the Google Drive API and turned into 780 structured price quotes using the Claude API. Found that Istanbul new-build prices are up 3,187% nominally since 2013 but only 82% in real terms, and have been falling in real terms for the last year. Measured a 16.9% average cash discount across 59 matched units and showed it tracks the developer, not the district. My first pass reported 24.8% — down payments had been mislabelled as cash prices. I caught it, corrected it, and documented the failure in the repo alongside the fix.',
    metrics: ['367 FILES > 780 QUOTES', '26 DISTRICTS', '59 MATCHED UNITS'],
    tags: ['Python', 'pandas', 'Claude API', 'Google Drive API', 'TCMB / TÜİK macro data', 'Jupyter'],
    repo: 'https://github.com/mujahedISA/istanbul-real-estate-analysis',
  },
  {
    name: 'What Tamheer Participants Actually Complain About',
    year: '2026',
    question:
      'Tamheer is sold as a bridge into employment. What are participants actually complaining about?',
    body: "Arabic-language analysis of Saudi Arabia's national graduate training programme. Scraped 4,927 tweets spanning 2017–2026 for $1.64 total, hand-verified all 281 extracted money figures, and built a two-coder labelled taxonomy reaching Cohen's kappa 0.77. The headline result reverses the assumption: the stipend is paid correctly in 91% of verified reports, and pay is only 6.6% of complaints — 55.7% are about employers cycling trainees instead of hiring. Trained a classifier to separate real participant voice from job adverts, lifting ad recall from 40.9% to 81.8% and accuracy from 81.7% to 93.5%. Four extraction bugs had produced the exact opposite finding before I found them; every one is written up in the methodology log.",
    metrics: ['4,927 TWEETS', '93.5% ACCURACY', 'KAPPA 0.77', '$1.64 COST'],
    tags: [
      'Python',
      'text classification',
      'Apify',
      'Arabic NLP',
      'statistical validation',
      'matplotlib',
    ],
    repo: 'https://github.com/mujahedISA/tamheer-feedback-analysis',
  },
  {
    name: 'Malaria Cell Image Classification Benchmark',
    year: '2026',
    question: 'Which CNN architecture should actually be deployed for malaria diagnosis — and where?',
    credit: 'TEAM PROJECT · BUILT WITH OTHERS',
    body: 'We benchmarked six CNN architectures on 27,558 NIH blood-smear cell images under identical splits, preprocessing and evaluation, then matched each model to a deployment role instead of just ranking them. DenseNet121 took top accuracy at 97.02% with 0.9948 ROC-AUC; a custom 3-block CNN trained from scratch reached 96.52% with the best recall at 97.73% and the fastest inference at 1.17 ms; MobileNetV2 held 95.84% in an 8.94 MB footprint for point-of-care mobile microscopes. Grad-CAM heatmaps confirmed the top models were reading the parasite ring structures themselves, not background artefacts.',
    metrics: ['27,558 IMAGES', '6 ARCHITECTURES', '97.02% BEST ACC', '0.9948 ROC-AUC'],
    tags: ['Python', 'TensorFlow', 'Keras', 'transfer learning', 'Grad-CAM', 'Adam optimiser'],
    repo: 'https://github.com/aabo5/Malaria-Detection',
  },
];
