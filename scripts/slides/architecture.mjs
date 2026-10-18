// System Architecture — request flow, service bus and five colour-coded layers.
import { W, T, A, c, SANS, MONO, esc, frame, heading, panel, chip, label, txt, icon } from '../lib/ui.mjs';

export function architectureSlide(cfg) {
  const a = cfg.architecture;
  const cx = W / 2;
  const flowK = ['web', 'lime', 'ai', 'game'];
  const stack = a.flow.map((s, i) => {
    const y = 176 + i * 66, w = 320 - (i % 2) * 24, k = flowK[i % 4];
    return `<g class="in" style="animation-delay:${0.1 + i * 0.1}s">
      <rect x="${cx - w / 2}" y="${y}" width="${w}" height="50" rx="25" fill="${T.panel0}" fill-opacity=".85" stroke="${c(k)}" stroke-opacity=".55" stroke-width="1.5"/>
      <circle cx="${cx - w / 2 + 28}" cy="${y + 25}" r="14" fill="${c(k)}" fill-opacity=".15"/>
      ${icon(s.icon, cx - w / 2 + 28, y + 25, 0.19, k, 'stroke-width="8"')}
      <text x="${cx + 12}" y="${y + 31}" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="800" letter-spacing="2.5" fill="${T.text}">${esc(s.label)}</text>
      ${i < a.flow.length - 1 ? `<line x1="${cx}" y1="${y + 50}" x2="${cx}" y2="${y + 66}" stroke="#fff" stroke-opacity=".3"/><circle cx="${cx}" cy="${y + 58}" r="4" fill="${c(flowK[(i + 1) % 4])}" filter="url(#glow)" class="pulse"/>` : ''}
    </g>`;
  }).join('');

  const cards = a.cards;
  const cw = 284, gap = 14, x0 = (W - (cards.length * cw + (cards.length - 1) * gap)) / 2, cy = 504, ch = 338;
  const busY = 458;
  const lastY = 176 + (a.flow.length - 1) * 66 + 50;

  const bus = `
    ${label(56, busY + 4, 'SVC_BUS', { size: 10.5, ls: 1, weight: 400, fill: A.web })}${label(56, busY + 20, 'ONLINE', { size: 10, ls: 1, fill: T.dim, weight: 400 })}
    ${label(W - 56, busY + 4, 'FLOW_05', { size: 10.5, ls: 1, anchor: 'end', weight: 400, fill: A.mobile })}${label(W - 56, busY + 20, 'SYNCED', { size: 10, ls: 1, fill: T.dim, anchor: 'end', weight: 400 })}
    <line x1="${cx}" y1="${lastY}" x2="${cx}" y2="${busY}" stroke="#fff" stroke-opacity=".35" stroke-dasharray="3 4"/>
    <rect x="${x0 + cw / 2}" y="${busY - 1.5}" width="${(cards.length - 1) * (cw + gap)}" height="3" rx="1.5" fill="url(#iri)" opacity=".6"/>
    <circle cx="${cx}" cy="${busY}" r="9" fill="#fff" filter="url(#glow)" class="beat"/>
    ${cards.map((cd, i) => {
      const x = x0 + i * (cw + gap) + cw / 2;
      return `<line x1="${x}" y1="${busY}" x2="${x}" y2="${cy}" stroke="${c(cd.accent)}" stroke-opacity=".5" stroke-dasharray="3 4"/>
        <circle r="4.5" fill="${c(cd.accent)}" filter="url(#glow)"><animateMotion dur="2.4s" begin="${(Math.abs(i - 2) * 0.35).toFixed(2)}s" repeatCount="indefinite" path="M${cx},${busY} H${x} V${cy}"/></circle>`;
    }).join('')}
    <circle r="4" fill="#fff" filter="url(#glow)"><animateMotion dur="1.6s" repeatCount="indefinite" path="M${cx},176 V${busY}"/></circle>`;

  const cardSvg = cards.map((cd, i) => {
    const x = x0 + i * (cw + gap), y = cy, k = cd.accent;
    const chW = (cw - 40 - 2 * 8) / 3;
    return `${panel(x, y, cw, ch, { accent: k, delay: 0.2 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.3 + i * 0.1}s">
        ${label(x + 22, y + 34, cd.index, { size: 11, ls: 3, fill: c(k) })}
        <circle cx="${x + cw / 2}" cy="${y + 90}" r="40" fill="${c(k)}" fill-opacity=".08" stroke="${c(k)}" stroke-opacity=".3" stroke-dasharray="3 5"/>
        ${icon(cd.icon, x + cw / 2, y + 90, 0.72, k, 'stroke-width="2.8"')}
        ${txt(x + 22, y + 166, cd.title, { size: 26, weight: 800, fill: T.text, family: SANS })}
        ${txt(x + 22, y + 190, cd.tags, { size: 11, fill: T.soft, family: MONO, ls: 0.5 })}
        ${cd.chips.map((t, j) => chip(x + 20 + j * (chW + 8), y + 206, chW, 34, t, { accent: k, size: t.length > 6 ? 10.5 : 12 })).join('')}
        ${cd.list.map((t, j) => txt(x + 22, y + 274 + j * 24, t, { size: 15, fill: T.soft })).join('')}
      </g>`;
  }).join('');

  const body = `${heading(a.title, a.subtitle, 86, 60)}
    ${stack}${bus}${cardSvg}`;
  return frame({ body, footer: a.footer, seed: 10, orbList: [['web', 220, 700, 220], ['ai', 830, 330, 250], ['game', 1450, 700, 220]] });
}
