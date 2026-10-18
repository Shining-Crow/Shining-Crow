// Technology Universe — four domain columns with badges, toolchain and status.
import { G, SANS, frame, heading, panel, badge, progress, label, txt, icon } from '../lib/ui.mjs';

export function universeSlide(cfg) {
  const cols = cfg.universe;
  const pw = 344, gap = 26, x0 = (1664 - (cols.length * pw + (cols.length - 1) * gap)) / 2, y0 = 196, ph = 640;

  const columns = cols.map((c, i) => {
    const x = x0 + i * (pw + gap), y = y0;
    const row1 = c.badges.slice(0, 4), row2 = c.badges.slice(4, 7);
    const b1 = row1.map((b, j) => badge(x + 54 + j * 79, y + 186, b, 62, j + i)).join('');
    const b2 = row2.map((b, j) => badge(x + 54 + 39.5 + j * 79, y + 262, b, 62, j + i + 4)).join('');
    const list = c.list.map((t, k) => txt(x + 26 + (k % 2) * 160, y + 376 + Math.floor(k / 2) * 34, t, { size: 15.5, fill: G.soft })).join('');
    return `${panel(x, y, pw, ph, { delay: i * 0.12 })}
      <g class="in" style="animation-delay:${0.2 + i * 0.12}s">
        ${label(x + 26, y + 42, c.index, { size: 13 })}
        ${txt(x + 26, y + 84, c.title, { size: 32, weight: 800, fill: G.text, family: SANS })}
        ${txt(x + 26, y + 112, c.subtitle, { size: 13.5, fill: G.soft })}
        <circle cx="${x + pw - 62}" cy="${y + 74}" r="40" fill="#04110a" stroke="${G.green}" stroke-opacity=".2" stroke-dasharray="3 5"/>
        ${icon(c.icon, x + pw - 62, y + 74, 0.62, 'stroke-width="3"')}
        ${b1}${b2}
        ${txt(x + 26, y + 338, c.toolchainTitle || 'CORE TOOLCHAIN', { size: 14.5, weight: 600, fill: G.text, ls: 1.5 })}
        ${list}
        <line x1="${x + 26}" y1="${y + 520}" x2="${x + pw - 26}" y2="${y + 520}" stroke="${G.green}" stroke-opacity=".2"/>
        ${label(x + 26, y + 552, c.statusLabel, { size: 11.5 })}
        ${txt(x + 26, y + 582, c.status, { size: 17, weight: 600, fill: G.text })}
        <circle cx="${x + pw - 44}" cy="${y + 576}" r="5" fill="${G.green}" filter="url(#glow)" class="pulse"/>
        ${progress(x + 26, y + 600, pw - 52, c.pct, 0.5 + i * 0.15)}
      </g>`;
  }).join('');

  const body = `${heading('TECHNOLOGY UNIVERSE', cfg.universeSubtitle)}
    <rect x="${x0}" y="${y0 + 270}" width="${cols.length * pw + (cols.length - 1) * gap}" height="1.5" fill="url(#hline)" opacity=".5"/>
    ${columns}`;
  return frame({ body, footer: cfg.universeFooter, seed: 4 });
}
