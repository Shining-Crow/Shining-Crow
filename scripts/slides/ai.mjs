// AI Engineering — header band with a live constellation, twin capability
// panels joined by a glowing core pillar, and the AI toolchain.
import { W, G, SANS, DISPLAY, MONO, esc, frame, panel, chip, progress, label, txt, icon } from '../lib/ui.mjs';
import { rng } from '../lib/theme.mjs';

function constellation(seed, x0, y0, w, h, n = 12) {
  const r = rng(seed);
  const pts = Array.from({ length: n }, () => [x0 + r() * w, y0 + r() * h]);
  let lines = '';
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % n], s = pts[(i + 3) % n];
    lines += `<path d="M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${q[0].toFixed(0)} ${q[1].toFixed(0)}" />`;
    if (i % 2) lines += `<path d="M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${s[0].toFixed(0)} ${s[1].toFixed(0)}" opacity=".5"/>`;
  });
  const dots = pts.map((p, i) => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="${i % 3 ? 4 : 6}" fill="${G.green}" style="animation:pulse ${2 + (i % 3)}s ease-in-out ${-i * 0.4}s infinite"/>`).join('');
  return `<g stroke="${G.green}" stroke-opacity=".35" stroke-width="1.5" fill="none">${lines}</g>${dots}`;
}

function neural(cx, cy) {
  const layers = [[-60, 3], [-20, 5], [20, 5], [60, 3]];
  const nodes = layers.map(([x, n]) => Array.from({ length: n }, (_, i) => [cx + x, cy + (i - (n - 1) / 2) * 22]));
  let edges = '';
  for (let l = 0; l < nodes.length - 1; l++)
    for (const a of nodes[l]) for (const b of nodes[l + 1]) edges += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
  const dots = nodes.flat().map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" fill="${G.green}" filter="url(#glow)" style="animation:pulse 1.6s ease-in-out ${(-(i % 7) * 0.25).toFixed(2)}s infinite"/>`).join('');
  return `<circle cx="${cx}" cy="${cy}" r="78" fill="none" stroke="${G.green}" stroke-opacity=".18" stroke-dasharray="3 6"/>
    <path d="${edges}" stroke="${G.green}" stroke-opacity=".28" fill="none"/>
    <path d="${edges}" stroke="${G.bright}" stroke-opacity=".9" fill="none" stroke-dasharray="14 260" class="dash" style="animation-duration:5s"/>${dots}`;
}

export function aiSlide(cfg) {
  const a = cfg.ai;
  const px = [176, 864], py = 300, pw = 624, ph = 432;

  const panels = a.panels.map((p, i) => {
    const x = px[i], y = py;
    const bullets = p.bullets.map((b, k) => `<circle cx="${x + 36 + (k > 2 ? 296 : 0)}" cy="${y + 284 + (k % 3) * 34}" r="3.5" fill="${G.green}"/>${txt(x + 50 + (k > 2 ? 296 : 0), y + 290 + (k % 3) * 34, b, { size: 16.5, fill: G.text })}`).join('');
    const art = i === 0 ? neural(x + pw / 2, y + 112) : `<circle cx="${x + pw / 2}" cy="${y + 112}" r="78" fill="none" stroke="${G.green}" stroke-opacity=".18" stroke-dasharray="3 6"/>${icon('docs', x + pw / 2, y + 112, 1.3, 'stroke-width="1.8"')}
      <path d="M${x + pw / 2 - 170} ${y + 170}H${x + pw / 2 - 110}" stroke="${G.green}" stroke-width="2.5"/><circle r="5" fill="${G.mint}" filter="url(#glow)"><animateMotion dur="2s" repeatCount="indefinite" path="M${x + pw / 2 - 170},${y + 170} H${x + pw / 2 - 110}"/></circle>
      <path d="M${x + pw / 2 + 110} ${y + 170}H${x + pw / 2 + 170}" stroke="${G.green}" stroke-width="2.5"/><circle r="5" fill="${G.mint}" filter="url(#glow)"><animateMotion dur="2s" begin="1s" repeatCount="indefinite" path="M${x + pw / 2 + 110},${y + 170} H${x + pw / 2 + 170}"/></circle>`;
    return `${panel(x, y, pw, ph, { delay: i * 0.15 })}
      <g class="in" style="animation-delay:${0.2 + i * 0.15}s">
        ${label(x + 30, y + 40, p.index, { size: 12, ls: 4 })}
        ${art}
        ${txt(x + 30, y + 222, p.title, { size: 36, weight: 800, fill: G.text, family: SANS })}
        <rect x="${x + 30 + p.title.length * 22}" y="${y + 210}" width="${pw - 60 - p.title.length * 22}" height="1.5" fill="url(#hline)" opacity=".6"/>
        ${label(x + 30, y + 250, p.tags, { size: 11.5, ls: 3, fill: G.soft, weight: 400 })}
        ${bullets}
        ${label(x + 30, y + 392, p.meter, { size: 11, ls: 3 })}
        ${progress(x + 30, y + 406, pw - 60, p.pct, 0.6 + i * 0.2)}
      </g>`;
  }).join('');

  const tools = a.tools;
  const cw = 176, cg = 30, cx0 = (W - (tools.length * cw + (tools.length - 1) * cg)) / 2;
  const chips = tools.map((t, i) => chip(cx0 + i * (cw + cg), 786, cw, 52, t, { i })).join('');

  const body = `
    <rect x="30" y="30" width="${W - 60}" height="180" rx="22" fill="#08200f" fill-opacity=".55" stroke="${G.green}" stroke-opacity=".3"/>
    <g opacity=".7">${Array.from({ length: 9 }, (_, i) => `<path d="M${-200 + i * 220} 210L${80 + i * 220} 30" stroke="${G.green}" stroke-opacity=".06" stroke-width="1.5"/>`).join('')}</g>
    ${constellation(9, 1170, 50, 430, 130)}
    ${constellation(19, 60, 60, 300, 110, 8)}
    <g class="in">
      <text x="${W / 2}" y="128" text-anchor="middle" font-family="${DISPLAY}" font-size="74" font-weight="900" fill="${G.green}" opacity=".4" filter="url(#softGlow)">${esc(a.title)}</text>
      <text x="${W / 2}" y="128" text-anchor="middle" font-family="${DISPLAY}" font-size="74" font-weight="900" fill="url(#title)">${esc(a.title)}</text>
      <text x="${W / 2}" y="128" text-anchor="middle" font-family="${DISPLAY}" font-size="74" font-weight="900" fill="url(#shine)" opacity=".7">${esc(a.title)}</text>
      <text x="${W / 2}" y="166" text-anchor="middle" font-family="${MONO}" font-size="13" letter-spacing="8" fill="${G.green}">${esc(a.subtitle)}</text>
      <rect x="${W / 2 - 240}" y="184" width="480" height="2" fill="url(#hline)"/>
    </g>

    ${label(W / 2, 248, 'AI SYSTEM CORE', { size: 12, anchor: 'middle', ls: 5 })}
    <path d="M652 272H1012" stroke="${G.green}" stroke-opacity=".5" stroke-dasharray="2 6"/>
    <path d="M300 300Q470 250 652 272M1364 300Q1194 250 1012 272" fill="none" stroke="${G.green}" stroke-opacity=".25" stroke-dasharray="2 6"/>
    <circle cx="652" cy="272" r="7" fill="${G.mint}" filter="url(#glow)"/><circle cx="1012" cy="272" r="10" fill="${G.mint}" filter="url(#glow)" class="pulse"/>
    <circle r="4" fill="#fff" filter="url(#glow)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M652,272 H1012"/></circle>

    <rect x="806" y="290" width="52" height="452" fill="url(#pillar)" class="pulse" style="animation-duration:3s"/>
    <rect x="828" y="290" width="8" height="452" fill="${G.mint}" opacity=".5" filter="url(#glow)"/>
    ${panels}
    ${label(W / 2, 774, 'AI TOOLCHAIN', { size: 12, anchor: 'middle', ls: 5 })}
    ${chips}
    ${label(44, 270, 'MODEL_STATUS', { size: 10.5, ls: 1, fill: G.green, weight: 400 })}${label(44, 286, 'READY / ONLINE', { size: 10, ls: 1, fill: G.dim, weight: 400 })}
    <circle cx="52" cy="304" r="5" fill="${G.green}" class="pulse"/>
    ${label(W - 44, 270, 'VECTOR_DB', { size: 10.5, ls: 1, anchor: 'end', weight: 400 })}${label(W - 44, 286, 'SYNCED / LIVE', { size: 10, ls: 1, fill: G.dim, anchor: 'end', weight: 400 })}`;

  return frame({ body, statusL: a.statusL, statusR: a.statusR, seed: 6 }).replace(
    '</defs>',
    `<linearGradient id="pillar" x1="0" x2="1"><stop offset="0" stop-color="${G.green}" stop-opacity="0"/><stop offset=".5" stop-color="${G.green}" stop-opacity=".55"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></linearGradient></defs>`
  );
}
