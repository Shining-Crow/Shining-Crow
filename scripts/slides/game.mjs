// Game Development — a playable-looking arcade viewport, engine chips,
// capability cards and a release pipeline with a travelling signal.
import { W, G, SANS, MONO, esc, frame, heading, panel, chip, label, txt, icon } from '../lib/ui.mjs';
import { rng, showBetween } from '../lib/theme.mjs';

const pix = (px, py, rows, s, fill) =>
  rows.map((row, j) => [...row].map((c, k) => (c === '1' ? `<rect x="${(px + k * s).toFixed(1)}" y="${(py + j * s).toFixed(1)}" width="${s}" height="${s}" fill="${fill}"/>` : '')).join('')).join('');

const INVADER = ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'];
const CRAB = ['0011111100', '0111111110', '1101101011', '1111111111', '0010110100', '0101001010', '1010000101'];

function viewport(x, y, w, h) {
  const r = rng(31);
  const layer = (n, size, op) => Array.from({ length: n }, () => `<rect x="${(x + r() * w * 2).toFixed(0)}" y="${(y + r() * h).toFixed(0)}" width="${size}" height="${size}" fill="${G.mint}" opacity="${op}"/>`).join('');
  const shipY = y + h / 2;

  const enemies = [];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 4; col++) {
      const ex = x + w - 330 + col * 70, ey = y + 70 + row * 74;
      const sprite = row === 1 ? CRAB : INVADER;
      enemies.push(`<g style="animation:pulse 1s steps(2) ${(-(row + col) * 0.25).toFixed(2)}s infinite">${pix(ex, ey, sprite, 4, row === 0 ? G.mint : G.green)}</g>`);
    }

  const bursts = [0, 1, 2].map((i) => {
    const bx = x + w - 300 + i * 90, by = y + 100 + i * 70;
    return `<g transform="translate(${bx} ${by})"><g style="animation:boom 3s ease-out ${-i}s infinite;transform-box:fill-box;transform-origin:center">
      ${Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return `<rect x="${(Math.cos(a) * 16).toFixed(1)}" y="${(Math.sin(a) * 16).toFixed(1)}" width="5" height="5" fill="${k % 2 ? G.bright : '#fff'}"/>`; }).join('')}</g></g>`;
  }).join('');

  const shots = [0, 1, 2, 3, 4].map((i) => `<rect x="${x + 150}" y="${shipY - 2}" width="24" height="4" rx="2" fill="${G.mint}" filter="url(#glow)" style="animation:shot 1.5s linear ${(-i * 0.3).toFixed(1)}s infinite"/>`).join('');

  const scores = ['012450', '012900', '013350', '014200', '015050', '016400'];
  const score = scores.map((s, i) => `<tspan>${s}${showBetween(i * 2 + 0.001, (i + 1) * 2, 12)}</tspan>`).join('');

  return `<clipPath id="gv"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath>
  <g clip-path="url(#gv)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#010804"/>
    <g style="animation:par 14s linear infinite">${layer(60, 2, 0.4)}</g>
    <g style="animation:par 7s linear infinite">${layer(30, 3, 0.7)}</g>
    <circle cx="${x + w - 120}" cy="${y + h + 140}" r="240" fill="#0a2a17" stroke="${G.green}" stroke-opacity=".5" stroke-width="2"/>
    <ellipse cx="${x + w - 120}" cy="${y + h + 140}" rx="330" ry="60" fill="none" stroke="${G.green}" stroke-opacity=".3" transform="rotate(-12 ${x + w - 120} ${y + h + 140})"/>
    <g style="animation:march 4s ease-in-out infinite">${enemies.join('')}</g>
    ${bursts}
    <g style="animation:float 2.6s ease-in-out infinite">
      ${shots}
      <path d="M${x + 70} ${shipY - 26}L${x + 150} ${shipY}L${x + 70} ${shipY + 26}L${x + 88} ${shipY}Z" fill="${G.green}" filter="url(#glow)"/>
      <path d="M${x + 96} ${shipY - 8}L${x + 128} ${shipY}L${x + 96} ${shipY + 8}Z" fill="#02140a"/>
      <path d="M${x + 70} ${shipY - 10}L${x + 40} ${shipY}L${x + 70} ${shipY + 10}Z" fill="${G.mint}" style="animation:blink .16s steps(1) infinite"/>
    </g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#crt)"/>
    <g font-family="${MONO}" font-size="16" font-weight="700" fill="${G.green}">
      <text x="${x + 22}" y="${y + 34}">SCORE ${score}</text>
      <text x="${x + w / 2}" y="${y + 34}" text-anchor="middle">STAGE 07</text>
      <text x="${x + w - 22}" y="${y + 34}" text-anchor="end">HP</text>
    </g>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + w - 160 + i * 22}" y="${y + 20}" width="16" height="16" rx="3" fill="${i < 4 ? G.green : '#0b2216'}"/>`).join('')}
    <text x="${x + w / 2}" y="${y + h - 22}" text-anchor="middle" font-family="${MONO}" font-size="15" letter-spacing="6" fill="${G.mint}" class="blink" style="animation-duration:1.4s">PRESS ▶ TO PLAY</text>
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="none" stroke="${G.green}" stroke-opacity=".4" stroke-width="1.5"/>`;
}

export function gameSlide(cfg) {
  const g = cfg.game;
  const lx = 96, ly = 186, lw = 920, lh = 548;
  const engines = g.engines;
  const ew = (lw - 60 - (engines.length - 1) * 16) / engines.length;

  const cards = g.cards.map((c, i) => {
    const x = 1046, y = 186 + i * 190, w = 522, h = 168;
    return `${panel(x, y, w, h, { delay: 0.2 + i * 0.12 })}
      <g class="in" style="animation-delay:${0.3 + i * 0.12}s">
        <circle cx="${x + 64}" cy="${y + 88}" r="42" fill="#04110a" stroke="${G.green}" stroke-opacity=".3" stroke-dasharray="3 5"/>
        ${icon(c.icon, x + 64, y + 88, 0.6, 'stroke-width="3.2"')}
        ${label(x + 126, y + 46, c.index, { size: 11.5, ls: 3 })}
        ${txt(x + 126, y + 84, c.title, { size: 27, weight: 800, fill: G.text, family: SANS })}
        ${txt(x + 126, y + 112, c.subtitle, { size: 15, fill: G.soft })}
        ${label(x + w - 28, y + 46, c.stat, { size: 13, anchor: 'end', ls: 2, fill: G.bright })}
        ${Array.from({ length: 16 }, (_, k) => {
          const hgt = 6 + Math.abs(Math.sin(k * 1.7 + i)) * 22;
          return `<rect x="${x + 126 + k * 22}" y="${y + 148 - hgt}" width="14" height="${hgt.toFixed(1)}" rx="2" fill="${G.green}" opacity="${(0.25 + (k / 16) * 0.6).toFixed(2)}" style="animation:eq ${(0.8 + (k % 5) * 0.15).toFixed(2)}s ease-in-out ${(-k * 0.11).toFixed(2)}s infinite alternate;transform-box:fill-box;transform-origin:bottom"/>`;
        }).join('')}
      </g>`;
  }).join('');

  const steps = g.pipeline;
  const sx0 = 220, sx1 = W - 220, sy = 812;
  const stepX = (i) => sx0 + (i * (sx1 - sx0)) / (steps.length - 1);
  const T = 6;
  const pipeline = `
    <line x1="${sx0}" y1="${sy}" x2="${sx1}" y2="${sy}" stroke="${G.green}" stroke-opacity=".3" stroke-width="2" stroke-dasharray="4 6"/>
    <circle r="7" fill="#fff" filter="url(#glow)"><animateMotion dur="${T}s" repeatCount="indefinite" path="M${sx0},${sy} H${sx1}"/></circle>
    ${steps.map((s, i) => {
      const x = stepX(i), t = (i / (steps.length - 1)) * T;
      return `<circle cx="${x}" cy="${sy}" r="15" fill="#04110a" stroke="${G.green}" stroke-width="2"/>
        <circle cx="${x}" cy="${sy}" r="7" fill="${G.green}" opacity=".3"><animate attributeName="opacity" values=".3;.3;1;.3" keyTimes="0;${Math.max(0.001, t / T - 0.001).toFixed(3)};${Math.min(0.999, t / T + 0.02).toFixed(3)};1" dur="${T}s" repeatCount="indefinite"/></circle>
        ${label(x, sy + 44, s, { size: 13, anchor: 'middle', ls: 3, fill: G.text })}`;
    }).join('')}`;

  const body = `${heading(g.title, g.subtitle)}
    ${panel(lx, ly, lw, lh)}
    <g class="in" style="animation-delay:.15s">
      ${label(lx + 30, ly + 40, '01 / LIVE BUILD', { size: 12, ls: 4 })}
      ${label(lx + lw - 30, ly + 40, 'RUNNING · 60 FPS', { size: 12, ls: 3, anchor: 'end', fill: G.soft, weight: 400 })}
      ${viewport(lx + 30, ly + 60, lw - 60, 390)}
      ${engines.map((e, i) => chip(lx + 30 + i * (ew + 16), ly + 474, ew, 48, e, { i, size: 14 })).join('')}
    </g>
    ${cards}
    ${pipeline}`;

  return frame({ body, footer: '', statusL: g.statusL, statusR: g.statusR, seed: 8 }).replace(
    '</style>',
    `@keyframes shot{0%{transform:translateX(0);opacity:1}80%{opacity:1}100%{transform:translateX(560px);opacity:0}}
     @keyframes par{to{transform:translateX(-860px)}}
     @keyframes march{0%,100%{transform:translate(0,0)}25%{transform:translate(-20px,8px)}50%{transform:translate(0,16px)}75%{transform:translate(20px,8px)}}
     @keyframes boom{0%,70%{transform:scale(.2);opacity:0}75%{opacity:1}100%{transform:scale(1.8);opacity:0}}
     @keyframes eq{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
    </style>`
  ).replace(
    '</defs>',
    `<pattern id="crt" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.5" fill="#000" fill-opacity=".25"/></pattern></defs>`
  );
}
