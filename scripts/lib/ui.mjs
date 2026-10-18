// Emerald "HUD slide" design system shared by every 1664×936 slide.
// Slides render on GitHub through <img>: no JS, no web fonts — system fonts,
// CSS keyframes and SMIL only.
import { esc, rng, MONO } from './theme.mjs';

export const W = 1664;
export const H = 936;

export const G = {
  bg0: '#020a06', bg1: '#071b10', bg2: '#020d08',
  green: '#3dff86', bright: '#7dffae', mint: '#d5ffe2', mid: '#22c55e', deep: '#14532d',
  panel0: '#0f2a1b', panel1: '#06150d', line: '#1d4d31', text: '#eafff1', soft: '#a7d9b9', dim: '#5f9c78',
};
export const SANS = "'Segoe UI', Inter, Arial, Helvetica, sans-serif";
export const DISPLAY = "'Arial Black', 'Segoe UI Black', 'Segoe UI', Arial, sans-serif";
export { MONO, esc };

export const CSS = `
  @keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
  @keyframes rise{0%{transform:translateY(0);opacity:0}20%{opacity:.9}100%{transform:translateY(-160px);opacity:0}}
  @keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
  @keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes spinr{to{transform:rotate(-360deg)}}
  @keyframes float{0%,100%{transform:translateY(-5px)}50%{transform:translateY(5px)}}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @keyframes dash{to{stroke-dashoffset:-1000}}
  @keyframes sweepX{0%{transform:translateX(-400px)}100%{transform:translateX(${W + 400}px)}}
  @keyframes scanY{0%{transform:translateY(-60px)}100%{transform:translateY(${H + 60}px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes wave{0%{transform:scale(.3);opacity:.8}100%{transform:scale(1);opacity:0}}
  .tw{animation:tw 3s ease-in-out infinite}
  .pulse{animation:pulse 2.4s ease-in-out infinite}
  .beat{animation:beat 2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
  .blink{animation:blink 1.1s steps(1) infinite}
  .spin{animation:spin 30s linear infinite}
  .spinr{animation:spinr 20s linear infinite}
  .float{animation:float 6s ease-in-out infinite}
  .grow{animation:grow 1.6s cubic-bezier(.2,.8,.2,1) both;transform-box:fill-box;transform-origin:left center}
  .dash{animation:dash 14s linear infinite}
  .sweep{animation:sweepX 7s linear infinite}
  .scan{animation:scanY 9s linear infinite}
  .in{animation:fadeUp .9s ease-out both}
`;

export const DEFS = `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${G.bg0}"/><stop offset=".48" stop-color="${G.bg1}"/><stop offset="1" stop-color="${G.bg2}"/></linearGradient>
  <radialGradient id="topGlow" cx=".5" cy=".1" r=".6"><stop offset="0" stop-color="${G.green}" stop-opacity=".16"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></radialGradient>
  <radialGradient id="midGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${G.green}" stop-opacity=".12"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></radialGradient>
  <radialGradient id="vignette" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.panel0}" stop-opacity=".92"/><stop offset="1" stop-color="${G.panel1}" stop-opacity=".92"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c2418" stop-opacity=".9"/><stop offset="1" stop-color="#030d08" stop-opacity=".88"/></linearGradient>
  <linearGradient id="title" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${G.green}"/><stop offset=".5" stop-color="${G.mint}"/><stop offset="1" stop-color="${G.green}"/></linearGradient>
  <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${W + 300} 0;${W + 300} 0" keyTimes="0;.5;1" dur="7s" repeatCount="indefinite"/>
  </linearGradient>
  <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="${G.mid}"/><stop offset="1" stop-color="${G.bright}"/></linearGradient>
  <linearGradient id="hline" x1="0" x2="1"><stop offset="0" stop-color="${G.green}" stop-opacity="0"/><stop offset=".5" stop-color="${G.green}" stop-opacity=".9"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></linearGradient>
  <linearGradient id="sweepG" x1="0" x2="1"><stop offset="0" stop-color="${G.green}" stop-opacity="0"/><stop offset=".5" stop-color="${G.green}" stop-opacity=".07"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></linearGradient>
  <linearGradient id="scanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.green}" stop-opacity="0"/><stop offset=".5" stop-color="${G.green}" stop-opacity=".06"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></linearGradient>
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${G.green}" stroke-opacity=".05"/></pattern>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
`;

// Deterministic twinkling dust.
export function particles(seed, n, box = [40, 40, W - 80, H - 80]) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * box[2], y = box[1] + r() * box[3];
    const rad = (r() * 1.8 + 0.6).toFixed(2);
    const d = [3, 4, 6][i % 3];
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" fill="${i % 4 ? G.green : G.mint}" style="animation:tw ${d}s ease-in-out ${(-r() * d).toFixed(2)}s infinite"/>`;
  }
  return out;
}

export const brackets = (inset = 36, len = 40, w = W, h = H) => `
  <g fill="none" stroke="${G.green}" stroke-opacity=".55" stroke-width="2">
    <path d="M${inset} ${inset + len}V${inset}H${inset + len}"/><path d="M${w - inset - len} ${inset}H${w - inset}V${inset + len}"/>
    <path d="M${inset} ${h - inset - len}V${h - inset}H${inset + len}"/><path d="M${w - inset - len} ${h - inset}H${w - inset}V${h - inset - len}"/>
  </g>`;

// Big gradient headline with glow + moving shine, then spaced subtitle and a divider.
export function heading(title, subtitle, y = 92, size = 64) {
  const t = esc(title);
  return `<g class="in">
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${DISPLAY}" font-size="${size}" font-weight="900" fill="${G.green}" opacity=".35" filter="url(#softGlow)">${t}</text>
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${DISPLAY}" font-size="${size}" font-weight="900" fill="url(#title)">${t}</text>
    <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${DISPLAY}" font-size="${size}" font-weight="900" fill="url(#shine)" opacity=".7">${t}</text>
    <text x="${W / 2}" y="${y + 38}" text-anchor="middle" font-family="${MONO}" font-size="15" letter-spacing="6" fill="${G.green}" opacity=".85">${esc(subtitle)}</text>
    <rect x="${W / 2 - 300}" y="${y + 56}" width="600" height="1.5" fill="url(#hline)"/>
  </g>`;
}

export function frame({ body, footer = '', statusL = '', statusR = '', seed = 1, dust = 26 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <style>${CSS}</style>
  <defs>${DEFS}<clipPath id="frameClip"><rect width="${W}" height="${H}"/></clipPath></defs>
  <g clip-path="url(#frameClip)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#topGlow)"/>
  <g>${particles(seed, dust)}</g>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="26" fill="none" stroke="${G.green}" stroke-opacity=".16" stroke-width="1.5"/>
  ${brackets()}
  ${body}
  ${footer ? `<text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="4" fill="${G.green}" opacity=".6">${esc(footer)}</text>` : ''}
  ${statusL ? `<text x="92" y="${H - 34}" font-family="${MONO}" font-size="10.5" letter-spacing="1" fill="${G.dim}">${esc(statusL)}</text>` : ''}
  ${statusR ? `<text x="${W - 92}" y="${H - 34}" text-anchor="end" font-family="${MONO}" font-size="10.5" letter-spacing="1" fill="${G.dim}">${esc(statusR)}<tspan fill="${G.green}" class="blink"> ●</tspan></text>` : ''}
  <rect class="scan" y="0" width="${W}" height="60" fill="url(#scanG)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  </g>
</svg>\n`;
}

// Card with the signature glowing top bar.
export function panel(x, y, w, h, { top = true, r = 18, fill = 'url(#panel)', delay = 0 } = {}) {
  return `<g class="in" style="animation-delay:${delay}s">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${G.green}" stroke-opacity=".28" stroke-width="1.5"/>
    ${top ? `<rect x="${x + 6}" y="${y - 2}" width="${w - 12}" height="5" rx="2.5" fill="${G.green}" filter="url(#glow)" opacity=".9"/>` : ''}
  </g>`;
}

// Rounded-square tech badge with an abbreviation.
export function badge(cx, cy, label, size = 62, i = 0) {
  const s = size / 2;
  const fs = label.length > 4 ? 11 : label.length > 2 ? 14 : 17;
  return `<g>
    <rect x="${cx - s}" y="${cy - s}" width="${size}" height="${size}" rx="16" fill="#071a10" stroke="${G.green}" stroke-opacity=".35" stroke-width="1.5"/>
    <rect x="${cx - s + 5}" y="${cy - s + 5}" width="${size - 10}" height="${size - 10}" rx="12" fill="none" stroke="${G.green}" stroke-opacity=".15"/>
    <text x="${cx}" y="${cy + fs * 0.36}" text-anchor="middle" font-family="${SANS}" font-size="${fs}" font-weight="800" fill="${G.bright}" style="animation:pulse 3s ease-in-out ${(-i * 0.4).toFixed(1)}s infinite">${esc(label)}</text>
  </g>`;
}

// Pill / button chip.
export function chip(x, y, w, h, label, { size = 14, dot = true, i = 0 } = {}) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#04110a" stroke="${G.green}" stroke-opacity=".4" stroke-width="1.5"/>
    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="9" fill="none" stroke="${G.green}" stroke-opacity=".12"/>
    <text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="${SANS}" font-size="${size}" font-weight="800" letter-spacing="1.5" fill="${G.text}">${esc(label)}</text>
    ${dot ? `<circle cx="${x + w - 14}" cy="${y + 11}" r="3" fill="${G.green}" style="animation:pulse 2s ease-in-out ${(-i * 0.5).toFixed(1)}s infinite"/>` : ''}
  </g>`;
}

export function progress(x, y, w, pct, delay = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="#0b2216"/>
    <rect x="${x}" y="${y}" width="${(w * pct).toFixed(1)}" height="6" rx="3" fill="url(#bar)" filter="url(#glow)" class="grow" style="animation-delay:${delay}s"/>`;
}

export const label = (x, y, text, { size = 13, anchor = 'start', fill = G.green, ls = 3, weight = 700 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}" font-weight="${weight}" letter-spacing="${ls}" fill="${fill}">${esc(text)}</text>`;

export const txt = (x, y, text, { size = 16, anchor = 'start', fill = G.soft, weight = 400, family = SANS, ls = 0, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${ls}" fill="${fill}" ${extra}>${esc(text)}</text>`;

// Line-art icons, centred on (0,0), roughly 80px.
const ICONS = {
  brain: `<g stroke-width="2"><circle r="38" stroke-dasharray="4 6" class="spin"/>
    <path d="M-22 -14L0 -26L22 -14M-22 -14L-26 10L0 24L26 10L22 -14M-22 -14L0 0L22 -14M-26 10L0 0L26 10M0 0L0 24M0 -26L0 0"/>
    ${[[-22, -14], [0, -26], [22, -14], [-26, 10], [0, 24], [26, 10]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4" fill="${G.green}" style="animation:pulse 1.8s ease-in-out ${-i * 0.3}s infinite"/>`).join('')}
    <circle r="9" fill="#04110a"/><text y="4" text-anchor="middle" font-family="${MONO}" font-size="10" font-weight="700" fill="${G.mint}" stroke="none">AI</text></g>`,
  web: `<g stroke-width="2.2"><rect x="-40" y="-30" width="80" height="60" rx="8"/><path d="M-40 -16H40"/>
    <circle cx="-31" cy="-23" r="2.2" fill="${G.green}"/><circle cx="-24" cy="-23" r="2.2" fill="${G.green}"/>
    <path d="M-26 -4H18M-26 6H8M-26 16H22" stroke-width="3.5" stroke-linecap="round" opacity=".8"/></g>`,
  mobile: `<g stroke-width="2.2"><rect x="-22" y="-38" width="44" height="76" rx="9"/><path d="M-6 -31H6" stroke-linecap="round"/>
    <circle cy="30" r="3"/><rect x="-14" y="-22" width="28" height="42" rx="3" opacity=".5"/>
    <path d="M-8 -6L0 -14L8 -6M0 -14V10" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  game: `<g stroke-width="2.2"><path d="M-36 -8Q-36 -22 -22 -22H22Q36 -22 36 -8L42 14Q44 28 31 28Q23 28 18 16H-18Q-23 28 -31 28Q-44 28 -42 14Z" stroke-linejoin="round"/>
    <path d="M-22 -6V10M-30 2H-14" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="18" cy="-4" r="4" fill="${G.green}"/><circle cx="27" cy="5" r="4"/></g>`,
  db: `<g stroke-width="2.2"><ellipse cy="-24" rx="34" ry="10"/><path d="M-34 -24V24Q0 40 34 24V-24"/><path d="M-34 -8Q0 8 34 -8M-34 8Q0 24 34 8"/></g>`,
  cloud: `<g stroke-width="2.2"><path d="M-30 20Q-46 20 -46 6Q-46 -8 -32 -10Q-30 -30 -8 -30Q8 -30 14 -16Q20 -22 30 -18Q42 -12 38 2Q48 6 46 14Q44 20 36 20Z" stroke-linejoin="round"/><circle cy="0" r="4" fill="${G.green}" class="pulse"/></g>`,
  api: `<g stroke-width="2.2"><circle r="38" stroke-dasharray="3 6" class="spinr"/><polygon points="0,-26 23,-13 23,13 0,26 -23,13 -23,-13"/>
    <text y="5" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" fill="${G.mint}" stroke="none">API</text></g>`,
  cpu: `<g stroke-width="2.2"><rect x="-24" y="-24" width="48" height="48" rx="6"/><rect x="-12" y="-12" width="24" height="24" rx="3" fill="${G.green}" fill-opacity=".25"/>
    <path d="M-12 -24V-34M0 -24V-34M12 -24V-34M-12 24V34M0 24V34M12 24V34M-24 -12H-34M-24 0H-34M-24 12H-34M24 -12H34M24 0H34M24 12H34"/></g>`,
  docs: `<g stroke-width="2.2"><rect x="-36" y="-30" width="34" height="46" rx="4"/><rect x="-14" y="-38" width="34" height="46" rx="4" fill="#04110a"/>
    <path d="M-30 -18H-10M-30 -8H-10M-8 -26H12M-8 -16H12M-8 -6H12" opacity=".8"/>
    <circle cx="14" cy="18" r="16" fill="#04110a"/><circle cx="14" cy="18" r="6" fill="${G.green}" class="pulse"/></g>`,
  sparkle: `<g stroke-width="2"><path d="M0 -34L7 -7L34 0L7 7L0 34L-7 7L-34 0L-7 -7Z" fill="${G.green}" fill-opacity=".15" stroke-linejoin="round"/><circle r="5" fill="${G.green}"/></g>`,
  net: `<g stroke-width="2.2"><circle r="30"/><ellipse rx="13" ry="30"/><path d="M-30 0H30M-26 -14H26M-26 14H26"/></g>`,
  target: `<g stroke-width="1.6"><circle r="26"/><circle r="14"/><circle r="4" fill="${G.green}"/><path d="M0 -42V42M-42 0H42"/></g>`,
};

export function icon(name, x, y, scale = 1, extra = '') {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${G.green}" ${extra}>${ICONS[name] || ''}</g>`;
}

// Crow emblem — low-poly head facing right. Facets fan from two inner points.
const CP = {
  p0: [-60, 72], p1: [-58, -18], p2: [-22, -62], p3: [26, -52], p4: [48, -24],
  p5: [116, -4], p6: [48, 12], p7: [32, 42], p8: [8, 72], c1: [-12, -6], c2: [20, -16],
  f1: [-84, 104], f2: [-40, 84], f3: [-44, 118], f4: [-10, 86], f5: [-6, 112],
};
const FACETS = [
  ['p0', 'p1', 'c1', '#0b2416'], ['p1', 'p2', 'c1', '#12301f'], ['p2', 'c2', 'c1', '#1a4029'],
  ['p2', 'p3', 'c2', '#215034'], ['p3', 'p4', 'c2', '#2a5f3e'], ['p4', 'p6', 'c2', '#1a4229'],
  ['c1', 'c2', 'p7', '#14361f'], ['c2', 'p6', 'p7', '#183b25'], ['c1', 'p7', 'p8', '#0e2818'],
  ['c1', 'p8', 'p0', '#051009'], ['p0', 'f1', 'f2', '#06140c'], ['f2', 'f3', 'f4', '#081a10'], ['f4', 'f5', 'p8', '#06140c'],
  ['p0', 'f2', 'p8', '#05100a'], ['f2', 'f4', 'p8', '#071810'],
];
export function crow(scale = 1, { eye = true, id = 'cr' } = {}) {
  const pt = (k) => CP[k].join(',');
  const facets = FACETS.map(([a, b, c, f]) => `<polygon points="${pt(a)} ${pt(b)} ${pt(c)}" fill="${f}" stroke="${G.green}" stroke-opacity=".55" stroke-width="${(1 / scale).toFixed(2)}" stroke-linejoin="round"/>`).join('');
  const outline = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].map(pt).join(' ');
  return `<g transform="scale(${scale})">
    <polyline points="${outline}" fill="none" stroke="${G.green}" stroke-width="${(5 / scale).toFixed(2)}" opacity=".35" filter="url(#softGlow)"/>
    ${facets}
    <polygon points="${pt('p4')} ${pt('p5')} ${pt('p6')}" fill="#0b1f14" stroke="${G.bright}" stroke-width="${(1.4 / scale).toFixed(2)}"/>
    <polyline points="${outline}" fill="none" stroke="${G.bright}" stroke-width="${(1.8 / scale).toFixed(2)}" stroke-dasharray="60 500" class="dash" style="animation-duration:6s" id="${id}-rim"/>
    ${eye ? `<circle cx="14" cy="-27" r="9" fill="${G.green}" opacity=".5" filter="url(#softGlow)" class="pulse"/>
    <circle cx="14" cy="-27" r="6" fill="${G.green}"/><circle cx="15.5" cy="-28.5" r="2.4" fill="#fff"/>` : ''}
  </g>`;
}
