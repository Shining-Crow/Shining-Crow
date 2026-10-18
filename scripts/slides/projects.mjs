// Featured Projects (quest log) + real language wall — rebuilt from live repo data.
import { G, SANS, MONO, esc, frame, heading, panel, label, txt, icon } from '../lib/ui.mjs';
import { rng, wrap, fmt } from '../lib/theme.mjs';

const RAMP = ['#7dffae', '#3dff86', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];

const ago = (iso) => {
  const d = (Date.now() - new Date(iso)) / 86400000;
  if (d < 1) return 'today';
  if (d < 30) return `${Math.floor(d)}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

// Generative thumbnail so each project gets its own artwork.
function art(x, y, w, h, seed, ic) {
  const r = rng(seed * 131 + 7);
  const rings = Array.from({ length: 4 }, (_, i) => `<circle cx="${x + w * 0.62}" cy="${y + h * 0.42}" r="${30 + i * 26}" fill="none" stroke="${G.green}" stroke-opacity="${(0.4 - i * 0.08).toFixed(2)}" stroke-dasharray="${2 + i * 3} ${4 + i * 4}" style="animation:spin ${18 + i * 8}s linear infinite ${i % 2 ? 'reverse' : ''};transform-box:fill-box;transform-origin:center"/>`).join('');
  const bars = Array.from({ length: 9 }, (_, i) => {
    const bh = 10 + r() * 50;
    return `<rect x="${x + 16 + i * 14}" y="${y + h - 14 - bh}" width="8" height="${bh.toFixed(0)}" rx="2" fill="${G.green}" opacity="${(0.2 + r() * 0.5).toFixed(2)}"/>`;
  }).join('');
  return `<clipPath id="pa${seed}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/></clipPath>
    <g clip-path="url(#pa${seed})">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#04140b"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#grid)"/>
      ${rings}${bars}
      <circle cx="${x + w * 0.62}" cy="${y + h * 0.42}" r="30" fill="#04110a" stroke="${G.green}" stroke-width="1.5"/>
      ${icon(ic, x + w * 0.62, y + h * 0.42, 0.42, 'stroke-width="4.5"')}
      <rect x="${x}" y="${y}" width="50" height="${h}" fill="url(#sweepG)" style="animation:sweepX 6s linear ${-seed * 1.3}s infinite"/>
    </g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${G.green}" stroke-opacity=".3"/>`;
}

export function projectsSlide(cfg, data) {
  const items = cfg.projects.slice(0, 4).map((p) => ({ p, r: data.repos.find((r) => r.name.toLowerCase() === p.repo.toLowerCase()) }));
  // Two or fewer projects sit in one vertically-centred row; more fill a 2×2 grid.
  const cw = 716, ch = 252, xs = [100, 848], ys = items.length <= 2 ? [314] : [174, 448];

  const cards = items.map(({ p, r }, i) => {
    const x = xs[i % 2], y = ys[Math.floor(i / 2)];
    const desc = wrap(p.description || r?.description || 'Something new is being forged here.', 46).slice(0, 3);
    const lang = r?.language || 'Code';
    return `${panel(x, y, cw, ch, { delay: 0.1 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.2 + i * 0.1}s">
        ${art(x + 18, y + 20, 236, ch - 40, i + 1, p.icon || 'web')}
        ${label(x + 280, y + 44, `QUEST ${String(i + 1).padStart(2, '0')} · ${(p.kind || 'PROJECT').toUpperCase()}`, { size: 11.5, ls: 3 })}
        ${txt(x + 280, y + 84, r?.name || p.repo, { size: 30, weight: 800, fill: G.text, family: SANS })}
        ${desc.map((l, k) => txt(x + 280, y + 116 + k * 24, l, { size: 16, fill: G.soft })).join('')}
        <g font-family="${MONO}" font-size="13" fill="${G.soft}">
          <rect x="${x + 280}" y="${y + 196}" width="${lang.length * 8.4 + 34}" height="28" rx="14" fill="#04110a" stroke="${G.green}" stroke-opacity=".4"/>
          <circle cx="${x + 296}" cy="${y + 210}" r="4.5" fill="${G.green}"/>
          <text x="${x + 308}" y="${y + 215}" fill="${G.text}">${esc(lang)}</text>
          <text x="${x + 280 + lang.length * 8.4 + 52}" y="${y + 215}">★ ${fmt(r?.stars ?? 0)}   ⑂ ${fmt(r?.forks ?? 0)}</text>
          ${r?.updatedAt ? `<text x="${x + cw - 26}" y="${y + 215}" text-anchor="end" fill="${G.dim}">updated ${ago(r.updatedAt)}</text>` : ''}
        </g>
        <g transform="translate(${x + cw - 40} ${y + 42})"><circle r="15" fill="none" stroke="${G.green}" stroke-opacity=".5"/><path d="M-5 5L5 -5M-3 -5H5V3" stroke="${G.green}" stroke-width="2" fill="none"/></g>
      </g>`;
  }).join('');

  // Language wall
  const total = Object.values(data.languages).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(data.languages).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const lx = 100, ly = 726, lw = 1464, lh = 128;
  const barX = lx + 28, barW = lw - 56;
  let acc = 0;
  const segs = langs.map(([, v], i) => {
    const w = (v / total) * barW;
    const s = `<rect x="${(barX + acc).toFixed(1)}" y="${ly + 50}" width="${Math.max(2, w - 3).toFixed(1)}" height="16" rx="4" fill="${RAMP[i]}" class="grow" style="animation-delay:${(0.4 + i * 0.12).toFixed(2)}s"/>`;
    acc += w;
    return s;
  }).join('');
  const legendW = barW / Math.max(1, langs.length);
  const legend = langs.map(([name, v], i) => `<g transform="translate(${barX + i * legendW} ${ly + 100})">
      <rect y="-11" width="12" height="12" rx="3" fill="${RAMP[i]}"/>
      <text x="20" y="0" font-family="${SANS}" font-size="15" font-weight="600" fill="${G.text}">${esc(name)}</text>
      <text x="${legendW - 24}" y="0" text-anchor="end" font-family="${MONO}" font-size="13" fill="${G.dim}">${((v / total) * 100).toFixed(1)}%</text></g>`).join('');

  const body = `${heading('FEATURED PROJECTS', 'QUEST LOG / SHIPPED / IN PROGRESS', 84, 60)}
    ${cards}
    ${panel(lx, ly, lw, lh, { top: false, delay: 0.5 })}
    <g class="in" style="animation-delay:.6s">
      ${label(lx + 28, ly + 34, 'LANGUAGE WALL', { size: 12, ls: 4 })}
      ${label(lx + lw - 28, ly + 34, `${langs.length} LANGUAGES / ${data.repos.length} REPOS`, { size: 11, ls: 2, anchor: 'end', fill: G.soft, weight: 400 })}
      <rect x="${barX}" y="${ly + 50}" width="${barW}" height="16" rx="4" fill="#0a1f14"/>
      ${segs}
      ${legend}
    </g>`;

  return frame({ body, statusL: 'SHIP // ITERATE // SCALE', statusR: `@${data.user.login.toUpperCase()}`, seed: 14, dust: 14 });
}
