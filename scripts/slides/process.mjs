// How I Work — a five-step delivery timeline and four working principles.
import { W, T, A, c, SANS, DISPLAY, frame, heading, panel, label, txt, icon } from '../lib/ui.mjs';
import { wrap } from '../lib/theme.mjs';

const STEP_ACCENTS = ['web', 'ai', 'mobile', 'game', 'lime'];

export function processSlide(cfg) {
  const steps = cfg.process.steps;
  const sx0 = 180, sx1 = W - 180, sy = 268;
  const xAt = (i) => sx0 + (i * (sx1 - sx0)) / (steps.length - 1);
  const D = 7.5;

  const timeline = `
    <rect x="${sx0}" y="${sy - 2}" width="${sx1 - sx0}" height="4" rx="2" fill="#fff" fill-opacity=".08"/>
    <rect x="${sx0}" y="${sy - 2}" width="${sx1 - sx0}" height="4" rx="2" fill="url(#iri)" class="grow" style="animation-duration:2.4s"/>
    <circle r="9" fill="#fff" filter="url(#glow)"><animateMotion dur="${D}s" repeatCount="indefinite" path="M${sx0},${sy} H${sx1}"/></circle>
    ${steps.map((s, i) => {
      const x = xAt(i), a = STEP_ACCENTS[i % 5], t = (i / (steps.length - 1)) * D;
      const k1 = Math.max(0.001, t / D - 0.002).toFixed(3), k2 = Math.min(0.998, t / D + 0.04).toFixed(3);
      return `<g class="in" style="animation-delay:${0.2 + i * 0.12}s">
        <circle cx="${x}" cy="${sy}" r="34" fill="${T.bg1}" stroke="${c(a)}" stroke-width="2.5"/>
        <circle cx="${x}" cy="${sy}" r="34" fill="${c(a)}" opacity=".12"><animate attributeName="opacity" values=".12;.12;.55;.12" keyTimes="0;${k1};${k2};1" dur="${D}s" repeatCount="indefinite"/></circle>
        <text x="${x}" y="${sy + 9}" text-anchor="middle" font-family="${DISPLAY}" font-size="24" font-weight="900" fill="${c(a)}">${i + 1}</text>
        ${txt(x, sy + 78, s.title, { size: 24, weight: 800, fill: T.text, anchor: 'middle', family: SANS })}
        ${wrap(s.text, 26).slice(0, 3).map((l, k) => txt(x, sy + 108 + k * 23, l, { size: 15.5, fill: T.soft, anchor: 'middle' })).join('')}
      </g>`;
    }).join('')}`;

  const pr = cfg.process.principles;
  const pw = 350, gap = 24, x0 = (W - (pr.length * pw + (pr.length - 1) * gap)) / 2, py = 560, ph = 270;
  const cards = pr.map((p, i) => {
    const x = x0 + i * (pw + gap), a = p.accent;
    return `${panel(x, py, pw, ph, { accent: a, delay: 0.5 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.6 + i * 0.1}s">
        <circle cx="${x + 58}" cy="${py + 64}" r="32" fill="${c(a)}" fill-opacity=".12" stroke="${c(a)}" stroke-opacity=".4"/>
        ${icon(p.icon, x + 58, py + 64, 0.46, a, 'stroke-width="4"')}
        ${txt(x + 28, py + 140, p.title, { size: 25, weight: 800, fill: T.text, family: SANS })}
        ${wrap(p.text, 32).slice(0, 3).map((l, k) => txt(x + 28, py + 174 + k * 25, l, { size: 16.5, fill: T.soft })).join('')}
      </g>`;
  }).join('');

  const body = `${heading(cfg.process.title, cfg.process.subtitle, 92)}
    ${timeline}
    ${label(W / 2, 528, 'PRINCIPLES', { size: 13, anchor: 'middle', ls: 8, fill: A.ai })}
    ${cards}`;
  return frame({ body, footer: cfg.process.footer, seed: 5, orbList: [['web', 200, 260, 230], ['mobile', 1450, 300, 240], ['ai', 830, 860, 260]] });
}
