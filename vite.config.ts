import { defineConfig, type Plugin } from 'vite';

/**
 * Content Security Policy, injected into the built page only.
 *
 * This site loads nothing from anywhere else — no CDN, no analytics, no
 * embedded fonts from Google, no third-party anything. So it can afford the
 * strictest useful policy: if an attacker ever managed to inject a <script>,
 * the browser would refuse to run it.
 *
 * It is added at build time rather than written into index.html because Vite's
 * dev server serves inline scripts for hot reloading, which `script-src 'self'`
 * would block — the policy would break `npm run dev`.
 *
 * `style-src` has to allow inline styles: the window manager positions windows
 * by setting element.style, and those count as inline styles. Scripts stay
 * locked down, which is the part that stops cross-site scripting.
 *
 * Two things a <meta> policy cannot do, because browsers only honour them in a
 * real HTTP header: `frame-ancestors` (clickjacking) and HSTS. GitHub Pages
 * does not let you set headers. Both are low risk for a static page with no
 * login and no forms — there is nothing to hijack a click into.
 */
/**
 * Where this site will actually live.
 *
 * The page itself uses relative paths and runs from anywhere, but link previews
 * do not: LinkedIn, WhatsApp and Facebook all require `og:image` to be an
 * ABSOLUTE url. A relative one gives you a link with no picture, which on a
 * job-search site is the one place you cannot afford it.
 *
 * Set this to your real address once and the build fills in og:image, og:url
 * and the canonical link. If you rename the repo, change this line.
 */
const SITE_URL = 'https://mujahedisa.github.io/portfolio/';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function hardenIndexHtml(): Plugin {
  return {
    name: 'harden-index-html',
    apply: 'build',
    transformIndexHtml(html) {
      const base = SITE_URL.endsWith('/') ? SITE_URL : `${SITE_URL}/`;

      const withCsp = html.replace(
        '<meta charset="utf-8" />',
        `<meta charset="utf-8" />\n<meta http-equiv="Content-Security-Policy" content="${CSP}" />`
      );

      const withImage = withCsp.replace(
        '<meta property="og:image" content="./og.png" />',
        `<meta property="og:image" content="${base}og.png" />`
      );

      const withCanonical = withImage.replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${base}" />\n<meta property="og:url" content="${base}" />`
      );

      // Fail the build rather than ship a link that previews as a blank card.
      if (!withCanonical.includes(`${base}og.png`)) {
        throw new Error('harden-index-html: could not set an absolute og:image — check index.html');
      }
      return withCanonical;
    },
  };
}

export default defineConfig({
  // Relative base so the same build works on GitHub Pages (any repo name),
  // Vercel, Netlify, or opened from a plain static file server.
  base: './',
  plugins: [hardenIndexHtml()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    open: false,
  },
});
