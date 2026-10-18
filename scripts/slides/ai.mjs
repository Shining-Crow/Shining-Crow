// AI Engineering — live constellation header, twin capability panels joined
// by a glowing core beam, and the AI toolchain.
import { W, T, A, c, SANS, DISPLAY, MONO, esc, frame, panel, chip, progress, label, txt, icon } from '../lib/ui.mjs';
import { rng } from '../lib/theme.mjs';

function constellation(seed, x0, y0, w, h, n = 12) {
  const r = rng(seed);
  const pts = Array.from({ length: n }, () => [x0 + r() * w, y0 + r() * h]);
  const cols = [A.ai, A.web, A.mobile];
  let lines = '';
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % n], s = pts[(i + 3) % n];
    lines += `<path d="M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${q[0].toFixed(0)} ${q[1].toFixed(0)}"/>`;
    if (i % 2) lines += `<path d="M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${s[0].toFixed(0)} ${s[1].toFixed(0)}" opacity=".5"/>`;
  });
  const dots = pts.map((p, i) => `<circle cx="${p[0].toFixed(0)}" cy="${p[1].toFixed(0)}" r="${i % 3 ? 3.5 : 5.5}" fill="${cols[i % 3]}" style="animation:pulse ${2 + (i % 3)}s ease-in-out ${-i * 0.4}s infinite"/>`).join('');
  return `<g stroke="url(#iri)" stroke-opacity=".35" stroke-width="1.3" fill="none">${lines}</g>${dots}`;
}

function neural(cx, cy) {
  const layers = [[-66, 3], [-22, 5], [22, 5], [66, 3]];
  const cols = [A.web, A.ai, A.ai, A.mobile];
  const nodes = layers.map(([x, n]) => Array.from({ length: n }, (_, i) => [cx + x, cy + (i - (n - 1) / 2) * 24]));
  let edges = '';
  for (let l = 0; l < nodes.length - 1; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) edges += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
  const dots = nodes.map((layer, l) => layer.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${cols[l]}" filter="url(#glow)" style="animation:pulse 1.6s ease-in-out ${(-(i + l) * 0.25).toFixed(2)}s infinite"/>`).join('')).join('');
  return `<circle cx="${cx}" cy="${cy}" r="86" fill="${A.ai}" fill-opacity=".06" stroke="${A.ai}" stroke-opacity=".25" stroke-dasharray="3 6"/>
    <path d="${edges}" stroke="${A.ai}" stroke-opacity=".25" fill="none"/>
    <path d="${edges}" stroke="url(#iri)" fill="none" stroke-width="1.5" stroke-dasharray="14 260" class="dash" style="animation-duration:5s"/>${dots}`;
}

function rag(cx, cy) {
  return `<circle cx="${cx}" cy="${cy}" r="86" fill="${A.web}" fill-opacity=".06" stroke="${A.web}" stroke-opacity=".25" stroke-dasharray="3 6"/>
    ${icon('docs', cx, cy, 1.35, 'web', 'stroke-width="1.8"')}
    <path d="M${cx - 190} ${cy + 58}H${cx - 120}" stroke="${A.web}" stroke-width="2.5"/><circle r="5" fill="#fff" filter="url(#glow)"><animateMotion dur="2s" repeatCount="indefinite" path="M${cx - 190},${cy + 58} H${cx - 120}"/></circle>
    <path d="M${cx + 120} ${cy + 58}H${cx + 190}" stroke="${A.mobile}" stroke-width="2.5"/><circle r="5" fill="#fff" filter="url(#glow)"><animateMotion dur="2s" begin="1s" repeatCount="indefinite" path="M${cx + 120},${cy + 58} H${cx + 190}"/></circle>
    ${label(cx - 190, cy + 46, 'QUERY', { size: 10.5, fill: A.web, ls: 2 })}${label(cx + 190, cy + 46, 'ANSWER', { size: 10.5, fill: A.mobile, ls: 2, anchor: 'end' })}`;
}

export function aiSlide(cfg) {
  const a = cfg.ai;
  const px = [176, 864], py = 300, pw = 624, ph = 432;
  const accents = ['ai', 'web'];

  const panels = a.panels.map((p, i) => {
    const x = px[i], y = py, k = accents[i];
    const bullets = p.bullets.map((b, j) => `<circle cx="${x + 36 + (j > 2 ? 296 : 0)}" cy="${y + 284 + (j % 3) * 34}" r="4" fill="${c(k)}"/>${txt(x + 50 + (j > 2 ? 296 : 0), y + 290 + (j % 3) * 34, b, { size: 16.5, fill: T.text })}`).join('');
    return `${panel(x, y, pw, ph, { accent: k, delay: i * 0.15 })}
      <g class="in" style="animation-delay:${0.2 + i * 0.15}s">
        ${label(x + 30, y + 40, p.index, { size: 12, ls: 4, fill: c(k) })}
        ${i === 0 ? neural(x + pw / 2, y + 118) : rag(x + pw / 2, y + 112)}
        ${txt(x + 30, y + 228, p.title, { size: 36, weight: 800, fill: T.text, family: SANS, ls: -0.5 })}
        ${label(x + 30, y + 256, p.tags, { size: 11.5, ls: 3, fill: T.soft, weight: 400 })}
        ${bullets}
        ${label(x + 30, y + 394, p.meter, { size: 11, ls: 3, fill: c(k) })}
        ${progress(x + 30, y + 406, pw - 60, p.pct, { accent: k, delay: 0.6 + i * 0.2 })}
      </g>`;
  }).join('');

  const tools = a.tools, tc = ['ai', 'web', 'mobile', 'game', 'lime', 'ai'];
  const cw = 176, cg = 26, cx0 = (W - (tools.length * cw + (tools.length - 1) * cg)) / 2;
  const chips = tools.map((t, i) => chip(cx0 + i * (cw + cg), 790, cw, 50, t, { accent: tc[i % tc.length], dot: true, i, size: 14 })).join('');

  const body = `
    <rect x="30" y="30" width="${W - 60}" height="180" rx="24" fill="#fff" fill-opacity=".025" stroke="url(#iri)" stroke-opacity=".3"/>
    ${constellation(9, 1180, 52, 420, 130)}
    ${constellation(19, 64, 60, 300, 110, 8)}
    <g class="in">
      <text x="${W / 2}" y="130" text-anchor="middle" font-family="${DISPLAY}" font-size="74" font-weight="900" letter-spacing="-1" fill="url(#iri)" opacity=".35" filter="url(#softGlow)">${esc(a.title)}</text>
      <text x="${W / 2}" y="130" text-anchor="middle" font-family="${DISPLAY}" font-size="74" font-weight="900" letter-spacing="-1" fill="url(#iri)">${esc(a.title)}</text>
      <text x="${W / 2}" y="130" text-anchor="middle" font-family="${DISPLAY}" font-size="74" font-weight="900" letter-spacing="-1" fill="url(#shine)" opacity=".55">${esc(a.title)}</text>
      <text x="${W / 2}" y="170" text-anchor="middle" font-family="${MONO}" font-size="13" letter-spacing="8" fill="${T.soft}">${esc(a.subtitle)}</text>
    </g>
    ${label(W / 2, 252, 'AI SYSTEM CORE', { size: 12, anchor: 'middle', ls: 5, fill: A.ai })}
    <path d="M652 276H1012" stroke="url(#iri)" stroke-opacity=".6" stroke-dasharray="2 6"/>
    <circle cx="652" cy="276" r="7" fill="${A.ai}" filter="url(#glow)"/><circle cx="1012" cy="276" r="9" fill="${A.web}" filter="url(#glow)" class="pulse"/>
    <circle r="4" fill="#fff" filter="url(#glow)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M652,276 H1012"/></circle>
    <rect x="804" y="292" width="56" height="452" fill="url(#beam)" class="pulse" style="animation-duration:3s"/>
    <rect x="828" y="292" width="8" height="452" fill="url(#beamCore)" opacity=".7" filter="url(#glow)"/>
    ${panels}
    ${label(W / 2, 776, 'AI TOOLCHAIN', { size: 12, anchor: 'middle', ls: 5, fill: T.soft })}
    ${chips}`;

  return frame({
    body, statusL: a.statusL, statusR: a.statusR, seed: 6,
    orbList: [['ai', 300, 520, 260], ['web', 1400, 520, 260], ['mobile', 830, 900, 200]],
    extraDefs: `<linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="${A.ai}" stop-opacity="0"/><stop offset=".5" stop-color="${A.ai}" stop-opacity=".5"/><stop offset="1" stop-color="${A.ai}" stop-opacity="0"/></linearGradient>
      <linearGradient id="beamCore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${A.web}"/><stop offset=".5" stop-color="${A.ai}"/><stop offset="1" stop-color="${A.mobile}"/></linearGradient>`,
  });
}
