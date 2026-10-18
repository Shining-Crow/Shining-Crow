// "Iridescent" design system — every 1664×936 slide is built from these parts.
// Concept: crow feathers aren't black, they shimmer violet→blue→green→gold.
// Near-black canvas, one spectrum, one colour per specialty.
// Slides render on GitHub through <img>: no JS, no web fonts — system fonts,
// CSS keyframes and SMIL only.
import { esc, rng, MONO } from './theme.mjs';

export const W = 1664;
export const H = 936;

export const T = {
  bg0: '#05040b', bg1: '#0b0a1a', bg2: '#110a1e',
  panel0: '#15132b', panel1: '#0b0a17', line: '#2a2650',
  text: '#f5f3ff', soft: '#b8b3d9', dim: '#6f6a93', ink: '#07060d',
};
// Accent per domain (+ two utility accents).
export const A = { ai: '#a78bfa', web: '#22d3ee', mobile: '#f472b6', game: '#fbbf24', lime: '#a3e635', white: '#ffffff' };
const LIGHT = { ai: '#ddd6fe', web: '#a5f3fc', mobile: '#fbcfe8', game: '#fde68a', lime: '#d9f99d', white: '#ffffff' };
export const IRI = ['#22d3ee', '#818cf8', '#c084fc', '#f472b6', '#fbbf24'];
export const c = (k) => A[k] || k;

export const SANS = "'Segoe UI', Inter, 'Helvetica Neue', Arial, sans-serif";
export const DISPLAY = "'Segoe UI Black', 'Arial Black', 'Segoe UI', Arial, sans-serif";
export { MONO, esc };

export const CSS = `
  @keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
  @keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
  @keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes spinr{to{transform:rotate(-360deg)}}
  @keyframes float{0%,100%{transform:translateY(-6px)}50%{transform:translateY(6px)}}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes dash{to{stroke-dashoffset:-1000}}
  @keyframes sweepX{0%{transform:translateX(-400px)}100%{transform:translateX(${W + 400}px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes orbA{0%,100%{transform:translate(0,0)}50%{transform:translate(120px,60px)}}
  @keyframes orbB{0%,100%{transform:translate(0,0)}50%{transform:translate(-140px,-50px)}}
  @keyframes orbC{0%,100%{transform:translate(0,0)}50%{transform:translate(80px,-90px)}}
  @keyframes hue{0%{stop-color:#22d3ee}25%{stop-color:#a78bfa}50%{stop-color:#f472b6}75%{stop-color:#fbbf24}100%{stop-color:#22d3ee}}
  .tw{animation:tw 3s ease-in-out infinite}
  .pulse{animation:pulse 2.4s ease-in-out infinite}
  .beat{animation:beat 2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
  .blink{animation:blink 1.1s steps(1) infinite}
  .spin{animation:spin 30s linear infinite}
  .spinr{animation:spinr 20s linear infinite}
  .float{animation:float 6s ease-in-out infinite}
  .grow{animation:grow 1.6s cubic-bezier(.2,.8,.2,1) both;transform-box:fill-box;transform-origin:left center}
  .dash{animation:dash 14s linear infinite}
  .sweep{animation:sweepX 8s linear infinite}
  .in{animation:fadeUp .9s ease-out both}
`;

const grad = (id, a, b, x2 = 1, y2 = 0) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const iriStops = (op = 1) => IRI.map((s, i) => `<stop offset="${(i / (IRI.length - 1)).toFixed(2)}" stop-color="${s}" stop-opacity="${op}"/>`).join('');

export const DEFS = `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.bg0}"/><stop offset=".55" stop-color="${T.bg1}"/><stop offset="1" stop-color="${T.bg2}"/></linearGradient>
  <radialGradient id="vignette" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
  <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.panel0}" stop-opacity=".88"/><stop offset="1" stop-color="${T.panel1}" stop-opacity=".88"/></linearGradient>
  <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="iri" x1="0" y1="0" x2="1" y2="0">${iriStops()}</linearGradient>
  <linearGradient id="iriFade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22d3ee" stop-opacity="0"/><stop offset=".25" stop-color="#818cf8"/><stop offset=".5" stop-color="#c084fc"/><stop offset=".75" stop-color="#f472b6"/><stop offset="1" stop-color="#fbbf24" stop-opacity="0"/></linearGradient>
  <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${W + 300} 0;${W + 300} 0" keyTimes="0;.45;1" dur="7s" repeatCount="indefinite"/>
  </linearGradient>
  ${Object.keys(A).map((k) => grad(`g-${k}`, A[k], LIGHT[k])).join('')}
  ${Object.keys(A).map((k) => `<radialGradient id="rg-${k}" cx="0" cy="0" r="1"><stop offset="0" stop-color="${A[k]}" stop-opacity=".22"/><stop offset="1" stop-color="${A[k]}" stop-opacity="0"/></radialGradient>`).join('')}
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".035"/></pattern>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#fff" fill-opacity=".06"/></pattern>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="orb" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="70"/></filter>
`;

// Slow drifting colour orbs — the living background.
export function orbs(list = [['ai', 300, 220, 260], ['web', 1350, 260, 240], ['mobile', 900, 820, 260]]) {
  const anim = ['orbA 18s', 'orbB 22s', 'orbC 26s', 'orbA 30s'];
  return list.map(([k, x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c(k)}" opacity=".26" filter="url(#orb)" style="animation:${anim[i % 4]} ease-in-out infinite"/>`).join('');
}

export function particles(seed, n, box = [40, 40, W - 80, H - 80]) {
  const r = rng(seed);
  const cols = [A.ai, A.web, A.mobile, A.game, '#fff'];
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * box[2], y = box[1] + r() * box[3], d = [3, 4, 6][i % 3];
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r() * 1.6 + 0.5).toFixed(2)}" fill="${cols[i % 5]}" style="animation:tw ${d}s ease-in-out ${(-r() * d).toFixed(2)}s infinite"/>`;
  }
  return out;
}

export function heading(title, subtitle, y = 96, size = 62) {
  const t = esc(title);
  return `<g class="in">
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${DISPLAY}" font-size="${size}" font-weight="900" letter-spacing="-1" fill="url(#iri)" opacity=".35" filter="url(#softGlow)">${t}</text>
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${DISPLAY}" font-size="${size}" font-weight="900" letter-spacing="-1" fill="url(#iri)">${t}</text>
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${DISPLAY}" font-size="${size}" font-weight="900" letter-spacing="-1" fill="url(#shine)" opacity=".55">${t}</text>
    <text x="${W / 2}" y="${y + 40}" text-anchor="middle" font-family="${MONO}" font-size="15" letter-spacing="6" fill="${T.soft}">${esc(subtitle)}</text>
    <rect x="${W / 2 - 260}" y="${y + 60}" width="520" height="2" rx="1" fill="url(#iriFade)"/>
  </g>`;
}

export function frame({ body, footer = '', statusL = '', statusR = '', seed = 1, dust = 30, orbList, extraCss = '', extraDefs = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>${CSS}${extraCss}</style>
  <defs>${DEFS}${extraDefs}<clipPath id="frameClip"><rect width="${W}" height="${H}" rx="28"/></clipPath></defs>
  <g clip-path="url(#frameClip)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${orbs(orbList)}
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <g>${particles(seed, dust)}</g>
  ${body}
  ${footer ? `<text x="${W / 2}" y="${H - 40}" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="5" fill="${T.dim}">${esc(footer)}</text>` : ''}
  ${statusL ? `<text x="56" y="${H - 40}" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${T.dim}">${esc(statusL)}</text>` : ''}
  ${statusR ? `<text x="${W - 56}" y="${H - 40}" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${T.dim}">${esc(statusR)}<tspan fill="${A.lime}" class="blink"> ●</tspan></text>` : ''}
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" fill="none" stroke="url(#iri)" stroke-opacity=".35" stroke-width="2"/>
</svg>\n`;
}

// Glass card; `accent` tints the top edge and corner glow.
export function panel(x, y, w, h, { accent = 'ai', top = true, r = 20, delay = 0, glow = true } = {}) {
  return `<g class="in" style="animation-delay:${delay}s">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#panel)" stroke="${c(accent)}" stroke-opacity=".22" stroke-width="1.5"/>
    ${glow ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#rg-${accent})"/>` : ''}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#glassSheen)"/>
    ${top ? `<rect x="${x + r}" y="${y - 1.5}" width="${w - 2 * r}" height="3" rx="1.5" fill="url(#g-${accent})" filter="url(#glow)"/>` : ''}
  </g>`;
}

export function badge(cx, cy, text, { accent = 'ai', size = 60, i = 0 } = {}) {
  const s = size / 2, fs = text.length > 4 ? 11 : text.length > 2 ? 14 : 17;
  return `<g>
    <rect x="${cx - s}" y="${cy - s}" width="${size}" height="${size}" rx="16" fill="${T.ink}" fill-opacity=".7" stroke="${c(accent)}" stroke-opacity=".45" stroke-width="1.5"/>
    <text x="${cx}" y="${cy + fs * 0.36}" text-anchor="middle" font-family="${SANS}" font-size="${fs}" font-weight="800" fill="${c(accent)}" style="animation:pulse 3s ease-in-out ${(-i * 0.4).toFixed(1)}s infinite">${esc(text)}</text>
  </g>`;
}

export function chip(x, y, w, h, text, { accent = 'ai', size = 13, dot = false, i = 0, filled = false } = {}) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${filled ? `url(#g-${accent})` : T.ink}" fill-opacity="${filled ? 1 : 0.6}" stroke="${c(accent)}" stroke-opacity="${filled ? 0 : 0.5}" stroke-width="1.3"/>
    ${dot ? `<circle cx="${x + h / 2}" cy="${y + h / 2}" r="3.5" fill="${c(accent)}" style="animation:pulse 2s ease-in-out ${(-i * 0.5).toFixed(1)}s infinite"/>` : ''}
    <text x="${x + w / 2 + (dot ? 6 : 0)}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="${SANS}" font-size="${size}" font-weight="700" letter-spacing=".5" fill="${filled ? T.ink : T.text}">${esc(text)}</text>
  </g>`;
}

export function progress(x, y, w, pct, { accent = 'ai', delay = 0 } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="#ffffff" fill-opacity=".07"/>
    <rect x="${x}" y="${y}" width="${(w * pct).toFixed(1)}" height="6" rx="3" fill="url(#g-${accent})" filter="url(#glow)" class="grow" style="animation-delay:${delay}s"/>`;
}

export const label = (x, y, text, { size = 12.5, anchor = 'start', fill = T.soft, ls = 3, weight = 700 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}" font-weight="${weight}" letter-spacing="${ls}" fill="${fill}">${esc(text)}</text>`;

export const txt = (x, y, text, { size = 16, anchor = 'start', fill = T.soft, weight = 400, family = SANS, ls = 0, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${ls}" fill="${fill}" ${extra}>${esc(text)}</text>`;

// Line icons centred on (0,0) at ~80px; they draw in `currentColor`.
const ICONS = {
  brain: `<g stroke-width="2"><circle r="38" stroke-dasharray="4 6" class="spin"/>
    <path d="M-22 -14L0 -26L22 -14M-22 -14L-26 10L0 24L26 10L22 -14M-22 -14L0 0L22 -14M-26 10L0 0L26 10M0 0L0 24M0 -26L0 0"/>
    ${[[-22, -14], [0, -26], [22, -14], [-26, 10], [0, 24], [26, 10]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="currentColor" style="animation:pulse 1.8s ease-in-out ${-i * 0.3}s infinite"/>`).join('')}
    <circle r="9" fill="${T.ink}"/><text y="4" text-anchor="middle" font-family="${MONO}" font-size="10" font-weight="700" fill="#fff" stroke="none">AI</text></g>`,
  web: `<g stroke-width="2.2"><rect x="-40" y="-30" width="80" height="60" rx="8"/><path d="M-40 -16H40"/>
    <circle cx="-31" cy="-23" r="2.2" fill="currentColor"/><circle cx="-24" cy="-23" r="2.2" fill="currentColor"/>
    <path d="M-26 -4H18M-26 6H8M-26 16H22" stroke-width="3.5" stroke-linecap="round" opacity=".8"/></g>`,
  mobile: `<g stroke-width="2.2"><rect x="-22" y="-38" width="44" height="76" rx="9"/><path d="M-6 -31H6" stroke-linecap="round"/>
    <circle cy="30" r="3"/><rect x="-14" y="-22" width="28" height="42" rx="3" opacity=".5"/>
    <path d="M-8 -6L0 -14L8 -6M0 -14V10" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  game: `<g stroke-width="2.2"><path d="M-36 -8Q-36 -22 -22 -22H22Q36 -22 36 -8L42 14Q44 28 31 28Q23 28 18 16H-18Q-23 28 -31 28Q-44 28 -42 14Z" stroke-linejoin="round"/>
    <path d="M-22 -6V10M-30 2H-14" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="18" cy="-4" r="4" fill="currentColor"/><circle cx="27" cy="5" r="4"/></g>`,
  db: `<g stroke-width="2.2"><ellipse cy="-24" rx="34" ry="10"/><path d="M-34 -24V24Q0 40 34 24V-24"/><path d="M-34 -8Q0 8 34 -8M-34 8Q0 24 34 8"/></g>`,
  cloud: `<g stroke-width="2.2"><path d="M-30 20Q-46 20 -46 6Q-46 -8 -32 -10Q-30 -30 -8 -30Q8 -30 14 -16Q20 -22 30 -18Q42 -12 38 2Q48 6 46 14Q44 20 36 20Z" stroke-linejoin="round"/><circle cy="0" r="4" fill="currentColor" class="pulse"/></g>`,
  api: `<g stroke-width="2.2"><circle r="38" stroke-dasharray="3 6" class="spinr"/><polygon points="0,-26 23,-13 23,13 0,26 -23,13 -23,-13"/>
    <text y="5" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" fill="#fff" stroke="none">API</text></g>`,
  cpu: `<g stroke-width="2.2"><rect x="-24" y="-24" width="48" height="48" rx="6"/><rect x="-12" y="-12" width="24" height="24" rx="3" fill="currentColor" fill-opacity=".3"/>
    <path d="M-12 -24V-34M0 -24V-34M12 -24V-34M-12 24V34M0 24V34M12 24V34M-24 -12H-34M-24 0H-34M-24 12H-34M24 -12H34M24 0H34M24 12H34"/></g>`,
  docs: `<g stroke-width="2.2"><rect x="-36" y="-30" width="34" height="46" rx="4"/><rect x="-14" y="-38" width="34" height="46" rx="4" fill="${T.ink}"/>
    <path d="M-30 -18H-10M-30 -8H-10M-8 -26H12M-8 -16H12M-8 -6H12" opacity=".8"/>
    <circle cx="14" cy="18" r="16" fill="${T.ink}"/><circle cx="14" cy="18" r="6" fill="currentColor" class="pulse"/></g>`,
  sparkle: `<g stroke-width="2"><path d="M0 -34L7 -7L34 0L7 7L0 34L-7 7L-34 0L-7 -7Z" fill="currentColor" fill-opacity=".18" stroke-linejoin="round"/><circle r="5" fill="currentColor"/></g>`,
  net: `<g stroke-width="2.2"><circle r="30"/><ellipse rx="13" ry="30"/><path d="M-30 0H30M-26 -14H26M-26 14H26"/></g>`,
  target: `<g stroke-width="1.6"><circle r="26"/><circle r="14"/><circle r="4" fill="currentColor"/><path d="M0 -42V42M-42 0H42"/></g>`,
  rocket: `<g stroke-width="2.2" stroke-linejoin="round"><path d="M0 -38Q20 -20 16 14H-16Q-20 -20 0 -38Z"/><circle cy="-10" r="7"/><path d="M-16 0L-28 18L-16 14M16 0L28 18L16 14"/>
    <path d="M-8 20L0 36L8 20" fill="currentColor" fill-opacity=".5" class="pulse"/></g>`,
  chat: `<g stroke-width="2.2" stroke-linejoin="round"><path d="M-36 -26H36V14H-6L-22 28V14H-36Z"/><circle cx="-14" cy="-6" r="3.5" fill="currentColor"/><circle cy="-6" r="3.5" fill="currentColor"/><circle cx="14" cy="-6" r="3.5" fill="currentColor"/></g>`,
  shield: `<g stroke-width="2.2" stroke-linejoin="round"><path d="M0 -36L30 -24V0Q30 24 0 36Q-30 24 -30 0V-24Z"/><path d="M-12 0L-3 9L14 -10" stroke-width="3.5" stroke-linecap="round"/></g>`,
  bolt: `<g stroke-width="2.2" stroke-linejoin="round"><path d="M6 -38L-22 6H0L-6 38L22 -6H0Z" fill="currentColor" fill-opacity=".2"/></g>`,
  search: `<g stroke-width="2.4"><circle cx="-6" cy="-6" r="22"/><path d="M10 10L30 30" stroke-width="4" stroke-linecap="round"/></g>`,
  pen: `<g stroke-width="2.2" stroke-linejoin="round"><path d="M-26 26L-20 4L14 -30L30 -14L-4 20Z"/><path d="M6 -22L22 -6"/></g>`,
};

export function icon(name, x, y, scale = 1, accent = 'ai', extra = '') {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="currentColor" color="${c(accent)}" ${extra}>${ICONS[name] || ''}</g>`;
}

// Iridescent multi-colour text helper (domain words coloured individually).
export function domainLine(x, y, items, { size = 15, anchor = 'start' } = {}) {
  const parts = items.map(([word, k], i) => `<tspan fill="${c(k)}">${esc(word)}</tspan>${i < items.length - 1 ? `<tspan fill="${T.dim}"> · </tspan>` : ''}`).join('');
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}" font-weight="700" letter-spacing="3" xml:space="preserve">${parts}</text>`;
}
