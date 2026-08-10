/**
 * BLOCK RENDERER.
 *
 * Turns the data in src/content/* into DOM. This file knows about shapes
 * (panels, chips, projects, tiles) and nothing about their contents — there is
 * not one sentence of biography in here, and there should never be.
 *
 * Everything is built with createElement/textContent, never innerHTML, so an
 * ampersand or an angle bracket in your copy just works.
 */

import type { Block, Panel, Project, Tile } from './content/types';
import { setHref } from './safeurl';

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/** Turns *asterisks* into <b>. The only inline markup in the project. */
export function inline(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const parts = text.split(/\*([^*]+)\*/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (i % 2 === 1) frag.appendChild(el('b', undefined, part));
    else frag.appendChild(document.createTextNode(part));
  });
  return frag;
}

function paragraph(text: string, className?: string): HTMLParagraphElement {
  const p = el('p', className);
  p.appendChild(inline(text));
  return p;
}

function renderPanel(panel: Panel): HTMLElement {
  const box = el('section', 'panel');
  box.appendChild(el('h3', undefined, panel.title));

  if (panel.list) {
    const ul = el('ul');
    for (const item of panel.list) {
      const li = el('li');
      li.appendChild(inline(item));
      ul.appendChild(li);
    }
    box.appendChild(ul);
  }

  if (panel.chips) {
    const wrap = el('div', 'chips');
    for (const chip of panel.chips) {
      wrap.appendChild(el('span', panel.invert ? 'chip invert' : 'chip', chip));
    }
    box.appendChild(wrap);
  }
  return box;
}

function renderProject(project: Project): HTMLElement {
  const card = el('article', 'proj');
  card.appendChild(el('h3', undefined, project.name));
  card.appendChild(el('div', 'yr', project.year));
  if (project.credit) card.appendChild(el('div', 'credit', project.credit));
  card.appendChild(paragraph(`"${project.question}"`, 'quote'));
  card.appendChild(paragraph(project.body, 'body'));

  if (project.metrics.length) {
    const metrics = el('div', 'metrics');
    for (const metric of project.metrics) metrics.appendChild(el('span', 'metric', metric));
    card.appendChild(metrics);
  }

  if (project.tags.length) {
    const tags = el('div', 'chips');
    for (const tag of project.tags) tags.appendChild(el('span', 'chip', tag));
    card.appendChild(tags);
  }

  const actions = el('p', 'actions');
  const link = el('a', 'btn', project.repoLabel ?? 'VIEW ON GITHUB');
  setHref(link, project.repo, `project "${project.name}"`);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${project.repoLabel ?? 'View on GitHub'} — ${project.name}`);
  actions.appendChild(link);
  card.appendChild(actions);

  return card;
}

function renderTile(tile: Tile): HTMLAnchorElement {
  const link = el('a', 'tile');
  setHref(link, tile.href, `contact tile "${tile.label}"`);
  if (tile.newTab) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  if (tile.download) link.setAttribute('download', '');
  link.appendChild(el('b', undefined, tile.label));
  link.appendChild(el('span', undefined, tile.value));
  return link;
}

function renderBlock(block: Block): HTMLElement {
  switch (block.type) {
    case 'text':
      return paragraph(block.text, block.lead ? 'lead' : undefined);

    case 'quote':
      return paragraph(`"${block.text}"`, 'quote');

    case 'heading':
      return el('h3', undefined, block.text);

    case 'rule':
      return el('hr', 'pix');

    case 'list': {
      const ul = el('ul');
      for (const item of block.items) {
        const li = el('li');
        li.appendChild(inline(item));
        ul.appendChild(li);
      }
      return ul;
    }

    case 'panelRow': {
      const row = el('div', 'cols');
      for (const panel of block.panels) row.appendChild(renderPanel(panel));
      return row;
    }

    case 'panel':
      return renderPanel(block);

    case 'projects': {
      const wrap = el('div', 'projlist');
      for (const project of block.projects) wrap.appendChild(renderProject(project));
      return wrap;
    }

    case 'tiles': {
      const wrap = el('div', 'tiles');
      for (const tile of block.tiles) wrap.appendChild(renderTile(tile));
      return wrap;
    }
  }
}

/**
 * Render a whole window body. `--i` drives the staggered reveal in CSS; it is
 * set here rather than in the stylesheet because only this loop knows the order.
 */
export function renderBlocks(blocks: Block[], heading?: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  let index = 0;

  const stagger = (node: HTMLElement) => {
    node.style.setProperty('--i', String(Math.min(index++, 12)));
    frag.appendChild(node);
  };

  if (heading) stagger(el('h2', undefined, heading));
  for (const block of blocks) stagger(renderBlock(block));

  return frag;
}
