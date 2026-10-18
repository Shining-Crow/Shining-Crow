// What I Build — one colour-coded card per specialty: outcome, deliverables, stack.
import { T, c, SANS, frame, heading, panel, chip, label, txt, icon } from '../lib/ui.mjs';
import { wrap } from '../lib/theme.mjs';

export function servicesSlide(cfg) {
  const list = cfg.services;
  const pw = 350, gap = 24, x0 = (1664 - (list.length * pw + (list.length - 1) * gap)) / 2, y0 = 196, ph = 652;

  const cards = list.map((s, i) => {
    const x = x0 + i * (pw + gap), y = y0, a = s.accent;
    const outcome = wrap(s.outcome, 33).slice(0, 3);
    const deliver = s.deliverables.map((d, k) => `
      <circle cx="${x + 36}" cy="${y + 352 + k * 36}" r="10" fill="${c(a)}" fill-opacity=".15"/>
      <path d="M${x + 31} ${y + 352 + k * 36}l3.5 3.5l6.5-7" stroke="${c(a)}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${txt(x + 56, y + 358 + k * 36, d, { size: 16, fill: T.text })}`).join('');
    // stack chips flow into rows
    let cx = x + 26, cy = y + 540;
    const chips = s.stack.map((t, k) => {
      const w = t.length * 8 + 26;
      if (cx + w > x + pw - 20) { cx = x + 26; cy += 42; }
      const out = chip(cx, cy, w, 32, t, { accent: a, size: 12.5, i: k });
      cx += w + 8;
      return out;
    }).join('');
    return `${panel(x, y, pw, ph, { accent: a, delay: i * 0.12 })}
      <g class="in" style="animation-delay:${0.15 + i * 0.12}s">
        <circle cx="${x + 64}" cy="${y + 74}" r="40" fill="${c(a)}" fill-opacity=".1" stroke="${c(a)}" stroke-opacity=".35"/>
        <circle cx="${x + 64}" cy="${y + 74}" r="48" fill="none" stroke="${c(a)}" stroke-opacity=".25" stroke-dasharray="3 6" class="spin" style="transform-box:fill-box;transform-origin:center"/>
        ${icon(s.icon, x + 64, y + 74, 0.58, a, 'stroke-width="3.4"')}
        ${label(x + pw - 26, y + 50, String(i + 1).padStart(2, '0'), { size: 34, anchor: 'end', fill: c(a), ls: 0, weight: 800 })}
        ${txt(x + 26, y + 160, s.title, { size: 30, weight: 800, fill: T.text, family: SANS, ls: -0.5 })}
        ${outcome.map((l, k) => txt(x + 26, y + 196 + k * 24, l, { size: 16.5, fill: T.soft })).join('')}
        <rect x="${x + 26}" y="${y + 290}" width="${pw - 52}" height="1" fill="${c(a)}" opacity=".3"/>
        ${label(x + 26, y + 322, 'YOU GET', { size: 12, fill: c(a) })}
        ${deliver}
        ${label(x + 26, y + 522, 'STACK', { size: 12, fill: c(a) })}
        ${chips}
      </g>`;
  }).join('');

  const body = `${heading(cfg.servicesTitle, cfg.servicesSubtitle)}${cards}`;
  return frame({ body, footer: cfg.servicesFooter, seed: 4, orbList: [['ai', 250, 300, 240], ['web', 700, 860, 220], ['mobile', 1150, 200, 220], ['game', 1500, 820, 220]] });
}
