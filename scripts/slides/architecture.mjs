// System Architecture — request flow stack, service bus, five domain cards.
import { W, G, SANS, MONO, esc, frame, heading, panel, chip, label, txt, icon } from '../lib/ui.mjs';

export function architectureSlide(cfg) {
  const a = cfg.architecture;
  const cx = W / 2;
  const stack = a.flow.map((s, i) => {
    const y = 176 + i * 66, w = 310 - (i % 2) * 24;
    return `<g class="in" style="animation-delay:${0.1 + i * 0.1}s">
      <rect x="${cx - w / 2}" y="${y}" width="${w}" height="50" rx="12" fill="#04110a" stroke="${G.green}" stroke-opacity=".45" stroke-width="1.5"/>
      ${i === 0 ? `<rect x="${cx - w / 2}" y="${y}" width="5" height="50" rx="2" fill="${G.green}" filter="url(#glow)"/>` : ''}
      <circle cx="${cx - w / 2 + 34}" cy="${y + 25}" r="15" fill="none" stroke="${G.green}" stroke-opacity=".6" stroke-width="1.5"/>
      ${icon(s.icon, cx - w / 2 + 34, y + 25, 0.2, 'stroke-width="7"')}
      <text x="${cx + 14}" y="${y + 31}" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="800" letter-spacing="2.5" fill="${G.text}">${esc(s.label)}</text>
      ${i < a.flow.length - 1 ? `<line x1="${cx}" y1="${y + 50}" x2="${cx}" y2="${y + 66}" stroke="${G.green}" stroke-opacity=".5"/><circle cx="${cx}" cy="${y + 58}" r="4" fill="${G.green}" filter="url(#glow)" class="pulse"/>` : ''}
    </g>`;
  }).join('');

  const cards = a.cards;
  const cw = 284, gap = 14, x0 = (W - (cards.length * cw + (cards.length - 1) * gap)) / 2, cy = 504, ch = 338;
  const busY = 458;
  const lastY = 176 + (a.flow.length - 1) * 66 + 50;

  const bus = `
    ${label(42, busY + 4, 'SVC_BUS', { size: 10.5, ls: 1, weight: 400 })}${label(42, busY + 20, 'ONLINE', { size: 10, ls: 1, fill: G.dim, weight: 400 })}
    ${label(W - 42, busY + 4, 'FLOW_05', { size: 10.5, ls: 1, anchor: 'end', weight: 400 })}${label(W - 42, busY + 20, 'SYNCED', { size: 10, ls: 1, fill: G.dim, anchor: 'end', weight: 400 })}
    <line x1="${cx}" y1="${lastY}" x2="${cx}" y2="${busY}" stroke="${G.green}" stroke-opacity=".5" stroke-dasharray="3 4"/>
    <path d="M${x0 + cw / 2} ${busY}H${x0 + (cards.length - 1) * (cw + gap) + cw / 2}" stroke="${G.green}" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="4 6"/>
    <circle cx="${cx}" cy="${busY}" r="8" fill="${G.mint}" filter="url(#glow)" class="beat"/>
    ${cards.map((_, i) => {
      const x = x0 + i * (cw + gap) + cw / 2;
      return `<line x1="${x}" y1="${busY}" x2="${x}" y2="${cy}" stroke="${G.green}" stroke-opacity=".4" stroke-dasharray="3 4"/>
        <circle r="4.5" fill="#fff" filter="url(#glow)"><animateMotion dur="2.4s" begin="${(Math.abs(i - 2) * 0.35).toFixed(2)}s" repeatCount="indefinite" path="M${cx},${busY} H${x} V${cy}"/></circle>`;
    }).join('')}
    <circle r="4" fill="#fff" filter="url(#glow)"><animateMotion dur="1.6s" repeatCount="indefinite" path="M${cx},176 V${busY}"/></circle>`;

  const cardSvg = cards.map((c, i) => {
    const x = x0 + i * (cw + gap), y = cy;
    const chW = (cw - 40 - 2 * 10) / 3;
    return `${panel(x, y, cw, ch, { delay: 0.2 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.3 + i * 0.1}s">
        ${label(x + 22, y + 32, c.index, { size: 11, ls: 3 })}
        <circle cx="${x + cw / 2}" cy="${y + 88}" r="40" fill="none" stroke="${G.green}" stroke-opacity=".18" stroke-dasharray="3 5"/>
        ${icon(c.icon, x + cw / 2, y + 88, 0.72, 'stroke-width="2.8"')}
        ${txt(x + 22, y + 164, c.title, { size: 27, weight: 800, fill: G.text, family: SANS })}
        ${txt(x + 22, y + 188, c.tags, { size: 11, fill: G.soft, family: MONO, ls: 0.5 })}
        ${c.chips.map((t, k) => chip(x + 20 + k * (chW + 10), y + 204, chW, 40, t, { size: t.length > 6 ? 10.5 : 12, dot: false })).join('')}
        ${c.list.map((t, k) => txt(x + 22, y + 276 + k * 24, t, { size: 15, fill: G.soft })).join('')}
        <circle cx="${x + cw - 30}" cy="${y + ch - 34}" r="5" fill="${G.green}" filter="url(#glow)" class="pulse"/>
      </g>`;
  }).join('');

  const body = `${heading(a.title, a.subtitle, 84, 60)}
    <circle cx="${cx}" cy="300" r="260" fill="url(#midGlow)"/>
    ${stack}${bus}${cardSvg}`;
  return frame({ body, footer: a.footer, seed: 10 });
}
