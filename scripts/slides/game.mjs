// Game Development — an arcade viewport that looks playable, engine chips,
// capability cards and a release pipeline with a travelling signal.
import { W, T, A, c, SANS, MONO, frame, heading, panel, chip, label, txt, icon } from '../lib/ui.mjs';
import { rng, showBetween } from '../lib/theme.mjs';

const pix = (px, py, rows, s, fill) =>
  rows.map((row, j) => [...row].map((ch, k) => (ch === '1' ? `<rect x="${(px + k * s).toFixed(1)}" y="${(py + j * s).toFixed(1)}" width="${s}" height="${s}" fill="${fill}"/>` : '')).join('')).join('');

const INVADER = ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'];
const CRAB = ['0011111100', '0111111110', '1101101011', '1111111111', '0010110100', '0101001010', '1010000101'];
const SQUID = ['000111000', '011111110', '110111011', '111111111', '011000110', '110000011'];

function viewport(x, y, w, h) {
  const r = rng(31);
  const layer = (n, size, op) => Array.from({ length: n }, () => `<rect x="${(x + r() * w * 2).toFixed(0)}" y="${(y + r() * h).toFixed(0)}" width="${size}" height="${size}" fill="#fff" opacity="${op}"/>`).join('');
  const shipY = y + h / 2;
  const rows = [[SQUID, A.mobile], [CRAB, A.web], [INVADER, A.ai]];
  const enemies = [];
  rows.forEach(([sprite, col], row) => {
    for (let k = 0; k < 4; k++) {
      enemies.push(`<g style="animation:pulse 1s steps(2) ${(-(row + k) * 0.25).toFixed(2)}s infinite">${pix(x + w - 330 + k * 70, y + 72 + row * 74, sprite, 4, col)}</g>`);
    }
  });
  const bursts = [0, 1, 2].map((i) => {
    const bx = x + w - 300 + i * 90, by = y + 100 + i * 70;
    return `<g transform="translate(${bx} ${by})"><g style="animation:boom 3s ease-out ${-i}s infinite;transform-box:fill-box;transform-origin:center">
      ${Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return `<rect x="${(Math.cos(a) * 16).toFixed(1)}" y="${(Math.sin(a) * 16).toFixed(1)}" width="5" height="5" fill="${[A.game, '#fff', A.mobile][k % 3]}"/>`; }).join('')}</g></g>`;
  }).join('');
  const shots = [0, 1, 2, 3, 4].map((i) => `<rect x="${x + 150}" y="${shipY - 2}" width="24" height="4" rx="2" fill="${A.game}" filter="url(#glow)" style="animation:shot 1.5s linear ${(-i * 0.3).toFixed(1)}s infinite"/>`).join('');
  const scores = ['012450', '012900', '013350', '014200', '015050', '016400'];
  const score = scores.map((s, i) => `<tspan>${s}${showBetween(i * 2 + 0.001, (i + 1) * 2, 12)}</tspan>`).join('');

  return `<clipPath id="gv"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath>
  <g clip-path="url(#gv)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#space)"/>
    <g style="animation:par 14s linear infinite">${layer(60, 2, 0.4)}</g>
    <g style="animation:par 7s linear infinite">${layer(30, 3, 0.7)}</g>
    <circle cx="${x + w - 120}" cy="${y + h + 140}" r="240" fill="url(#planet)"/>
    <ellipse cx="${x + w - 120}" cy="${y + h + 140}" rx="330" ry="60" fill="none" stroke="${A.game}" stroke-opacity=".45" transform="rotate(-12 ${x + w - 120} ${y + h + 140})"/>
    <g style="animation:march 4s ease-in-out infinite">${enemies.join('')}</g>
    ${bursts}
    <g style="animation:float 2.6s ease-in-out infinite">
      ${shots}
      <path d="M${x + 70} ${shipY - 26}L${x + 150} ${shipY}L${x + 70} ${shipY + 26}L${x + 88} ${shipY}Z" fill="url(#ship)" filter="url(#glow)"/>
      <path d="M${x + 96} ${shipY - 8}L${x + 128} ${shipY}L${x + 96} ${shipY + 8}Z" fill="${T.ink}"/>
      <path d="M${x + 70} ${shipY - 10}L${x + 40} ${shipY}L${x + 70} ${shipY + 10}Z" fill="${A.game}" style="animation:blink .16s steps(1) infinite"/>
    </g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#crt)"/>
    <g font-family="${MONO}" font-size="16" font-weight="700">
      <text x="${x + 22}" y="${y + 34}" fill="${A.game}">SCORE ${score}</text>
      <text x="${x + w / 2}" y="${y + 34}" text-anchor="middle" fill="${A.web}">STAGE 07</text>
      <text x="${x + w - 22}" y="${y + 34}" text-anchor="end" fill="${A.mobile}">HP</text>
    </g>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + w - 160 + i * 22}" y="${y + 20}" width="16" height="16" rx="3" fill="${i < 4 ? A.mobile : '#ffffff22'}"/>`).join('')}
    <text x="${x + w / 2}" y="${y + h - 22}" text-anchor="middle" font-family="${MONO}" font-size="15" letter-spacing="6" fill="#fff" class="blink" style="animation-duration:1.4s">PRESS ▶ TO PLAY</text>
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="none" stroke="${A.game}" stroke-opacity=".4" stroke-width="1.5"/>`;
}

export function gameSlide(cfg) {
  const g = cfg.game;
  const lx = 96, ly = 186, lw = 920, lh = 548;
  const engines = g.engines, ek = ['web', 'ai', 'mobile', 'game'];
  const ew = (lw - 60 - (engines.length - 1) * 16) / engines.length;

  const cards = g.cards.map((cd, i) => {
    const x = 1046, y = 186 + i * 190, w = 522, h = 168, a = cd.accent;
    return `${panel(x, y, w, h, { accent: a, delay: 0.2 + i * 0.12 })}
      <g class="in" style="animation-delay:${0.3 + i * 0.12}s">
        <circle cx="${x + 64}" cy="${y + 88}" r="42" fill="${c(a)}" fill-opacity=".1" stroke="${c(a)}" stroke-opacity=".35" stroke-dasharray="3 5"/>
        ${icon(cd.icon, x + 64, y + 88, 0.6, a, 'stroke-width="3.2"')}
        ${label(x + 126, y + 46, cd.index, { size: 11.5, ls: 3, fill: c(a) })}
        ${txt(x + 126, y + 84, cd.title, { size: 27, weight: 800, fill: T.text, family: SANS })}
        ${txt(x + 126, y + 112, cd.subtitle, { size: 15, fill: T.soft })}
        ${label(x + w - 28, y + 46, cd.stat, { size: 13, anchor: 'end', ls: 2, fill: c(a) })}
        ${Array.from({ length: 16 }, (_, k) => {
          const hgt = 6 + Math.abs(Math.sin(k * 1.7 + i)) * 22;
          return `<rect x="${x + 126 + k * 22}" y="${y + 148 - hgt}" width="14" height="${hgt.toFixed(1)}" rx="2" fill="${c(a)}" opacity="${(0.25 + (k / 16) * 0.6).toFixed(2)}" style="animation:eq ${(0.8 + (k % 5) * 0.15).toFixed(2)}s ease-in-out ${(-k * 0.11).toFixed(2)}s infinite alternate;transform-box:fill-box;transform-origin:bottom"/>`;
        }).join('')}
      </g>`;
  }).join('');

  const steps = g.pipeline, sx0 = 220, sx1 = W - 220, sy = 812, D = 6;
  const stepX = (i) => sx0 + (i * (sx1 - sx0)) / (steps.length - 1);
  const pk = ['web', 'ai', 'mobile', 'game', 'lime'];
  const pipeline = `
    <rect x="${sx0}" y="${sy - 1.5}" width="${sx1 - sx0}" height="3" rx="1.5" fill="url(#iri)" opacity=".5"/>
    <circle r="7" fill="#fff" filter="url(#glow)"><animateMotion dur="${D}s" repeatCount="indefinite" path="M${sx0},${sy} H${sx1}"/></circle>
    ${steps.map((s, i) => {
      const x = stepX(i), t = (i / (steps.length - 1)) * D, a = pk[i % 5];
      return `<circle cx="${x}" cy="${sy}" r="15" fill="${T.bg1}" stroke="${c(a)}" stroke-width="2.5"/>
        <circle cx="${x}" cy="${sy}" r="7" fill="${c(a)}" opacity=".3"><animate attributeName="opacity" values=".3;.3;1;.3" keyTimes="0;${Math.max(0.001, t / D - 0.001).toFixed(3)};${Math.min(0.999, t / D + 0.02).toFixed(3)};1" dur="${D}s" repeatCount="indefinite"/></circle>
        ${label(x, sy + 44, s, { size: 13, anchor: 'middle', ls: 3, fill: T.text })}`;
    }).join('')}`;

  const body = `${heading(g.title, g.subtitle)}
    ${panel(lx, ly, lw, lh, { accent: 'game' })}
    <g class="in" style="animation-delay:.15s">
      ${label(lx + 30, ly + 40, '01 / LIVE BUILD', { size: 12, ls: 4, fill: A.game })}
      ${label(lx + lw - 30, ly + 40, 'RUNNING · 60 FPS', { size: 12, ls: 3, anchor: 'end', fill: T.soft, weight: 400 })}
      ${viewport(lx + 30, ly + 60, lw - 60, 390)}
      ${engines.map((e, i) => chip(lx + 30 + i * (ew + 16), ly + 474, ew, 48, e, { accent: ek[i % 4], i, size: 14, dot: true })).join('')}
    </g>
    ${cards}
    ${pipeline}`;

  return frame({
    body, statusL: g.statusL, statusR: g.statusR, seed: 8,
    orbList: [['game', 500, 460, 300], ['mobile', 1350, 300, 220], ['web', 1300, 820, 200]],
    extraCss: `@keyframes shot{0%{transform:translateX(0);opacity:1}80%{opacity:1}100%{transform:translateX(560px);opacity:0}}
      @keyframes par{to{transform:translateX(-860px)}}
      @keyframes march{0%,100%{transform:translate(0,0)}25%{transform:translate(-20px,8px)}50%{transform:translate(0,16px)}75%{transform:translate(20px,8px)}}
      @keyframes boom{0%,70%{transform:scale(.2);opacity:0}75%{opacity:1}100%{transform:scale(1.8);opacity:0}}
      @keyframes eq{from{transform:scaleY(.35)}to{transform:scaleY(1)}}`,
    extraDefs: `<pattern id="crt" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.5" fill="#000" fill-opacity=".25"/></pattern>
      <linearGradient id="space" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05030f"/><stop offset="1" stop-color="#1a0b2e"/></linearGradient>
      <radialGradient id="planet" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="${A.mobile}" stop-opacity=".55"/><stop offset=".5" stop-color="#3b1d73"/><stop offset="1" stop-color="#120a24"/></radialGradient>
      <linearGradient id="ship" x1="0" x2="1"><stop offset="0" stop-color="${A.web}"/><stop offset="1" stop-color="${A.ai}"/></linearGradient>`,
  });
}
