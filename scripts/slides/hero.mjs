// Premium hero: crow emblem under a green moon, title lockup, nav bar and
// floating glass panels (live code, real GitHub activity, projects, mini game).
import { W, H, G, SANS, DISPLAY, MONO, esc, CSS, DEFS, brackets, particles, crow, icon, label, txt } from '../lib/ui.mjs';
import { rng, fmt, showBetween } from '../lib/theme.mjs';

const glass = (x, y, w, h, title, glyph = '') => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#glass)" stroke="${G.green}" stroke-opacity=".38" stroke-width="1.5"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#panelShine)"/>
  ${glyph}<text x="${x + 52}" y="${y + 36}" font-family="${SANS}" font-size="18" font-weight="600" fill="${G.text}">${esc(title)}</text>
  <circle cx="${x + w - 24}" cy="${y + 30}" r="4" fill="${G.green}" class="pulse"/>`;

function codePanel(cfg) {
  const x = 1150, y = 96, w = 466, h = 250;
  const lines = cfg.hero.code;
  const tree = ['▾ src', '  ai/', '  web/', '  mobile/', '  games/', '  crow.ts', '  main.tsx'];
  const color = (s) =>
    esc(s)
      .replace(/(&#39;|')([^']*?)(\1)/g, `<tspan fill="${G.bright}">'$2'</tspan>`)
      .replace(/\b(const|new|return)\b/g, `<tspan fill="${G.green}" font-weight="700">$1</tspan>`)
      .replace(/(\/\/.*)$/, `<tspan fill="${G.dim}">$1</tspan>`);
  const T = 12;
  return `<g class="float" style="animation-duration:7s">
    ${glass(x, y, w, h, 'Code', `<text x="${x + 20}" y="${y + 36}" font-family="${MONO}" font-size="17" font-weight="700" fill="${G.green}">&lt;/&gt;</text>`)}
    <line x1="${x + 16}" y1="${y + 52}" x2="${x + w - 16}" y2="${y + 52}" stroke="${G.green}" stroke-opacity=".2"/>
    <g font-family="${MONO}" font-size="12.5" fill="${G.soft}">${tree.map((t, i) => `<text x="${x + 22}" y="${y + 78 + i * 22}" xml:space="preserve">${t.startsWith('  ') ? '  ' : ''}<tspan fill="${i ? G.soft : G.green}">${esc(t.trim())}</tspan></text>`).join('')}</g>
    <line x1="${x + 132}" y1="${y + 62}" x2="${x + 132}" y2="${y + h - 16}" stroke="${G.green}" stroke-opacity=".18"/>
    <g font-family="${MONO}" font-size="12.5">
      ${lines.map((l, i) => {
        const yy = y + 78 + i * 23;
        return `<g>${showBetween(0.6 + i * 0.55, T - 0.3, T)}<text x="${x + 144}" y="${yy}" fill="${G.dim}">${i + 1}</text><text x="${x + 166}" y="${yy}" fill="${G.text}" xml:space="preserve">${color(l)}</text></g>`;
      }).join('')}
      <rect x="${x + 166}" y="${y + 66 + lines.length * 23}" width="8" height="15" fill="${G.green}" class="blink"/>
    </g>
  </g>`;
}

function githubPanel(data) {
  const x = 1206, y = 372, w = 410, h = 206;
  const weeks = 18, cell = 11, gap = 3;
  const days = data.days.slice(-weeks * 7);
  const pad = weeks * 7 - days.length;
  const shades = ['#0b2216', '#14532d', '#1f8a4c', '#2fd06b', G.bright];
  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = days[i - pad];
    const lv = d ? (d.count ? Math.max(1, d.level) : 0) : 0;
    const cx = x + 64 + Math.floor(i / 7) * (cell + gap), cy = y + 82 + (i % 7) * (cell + gap);
    cells += `<rect x="${cx}" y="${cy}" width="${cell}" height="${cell}" rx="2" fill="${shades[lv]}"${lv >= 3 ? ` style="animation:pulse 2.5s ease-in-out ${(-(i % 9) * 0.3).toFixed(1)}s infinite"` : ''}/>`;
  }
  const stars = data.repos.reduce((s, r) => s + r.stars, 0);
  const total = data.days.reduce((s, d) => s + d.count, 0);
  const stat = (yy, k, v) => `${txt(x + 318, yy, k, { size: 12, fill: G.soft })}${txt(x + 318, yy + 24, v, { size: 21, weight: 700, fill: G.text })}`;
  return `<g class="float" style="animation-duration:8s;animation-delay:-2s">
    ${glass(x, y, w, h, 'GitHub Activity', `<g transform="translate(${x + 30} ${y + 30})"><circle r="13" fill="${G.text}"/><path d="M-6 6Q-6 -1 0 -1Q6 -1 6 6M-5 -3L-6 -9L-2 -6M5 -3L6 -9L2 -6" stroke="#04110a" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`)}
    ${txt(x + 20, y + 68, `${fmt(total)} contributions in the last year`, { size: 12.5, fill: G.soft })}
    <g font-family="${SANS}" font-size="10" fill="${G.dim}"><text x="${x + 22}" y="${y + 104}">Mon</text><text x="${x + 22}" y="${y + 132}">Wed</text><text x="${x + 22}" y="${y + 160}">Fri</text></g>
    ${cells}
    <line x1="${x + 304}" y1="${y + 64}" x2="${x + 304}" y2="${y + h - 14}" stroke="${G.green}" stroke-opacity=".2"/>
    ${stat(y + 76, 'Repositories', fmt(data.repos.length))}${stat(y + 120, 'Stars', fmt(stars))}${stat(y + 164, 'Followers', fmt(data.user.followers))}
  </g>`;
}

function thumb(x, y, w, h, seed) {
  const r = rng(seed * 97 + 3);
  let shapes = '';
  for (let i = 0; i < 7; i++) {
    const cx = x + r() * w, cy = y + r() * h, rad = 8 + r() * 26;
    shapes += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="${[G.green, G.mint, G.mid][i % 3]}" opacity="${(0.12 + r() * 0.3).toFixed(2)}"/>`;
  }
  const lines = Array.from({ length: 4 }, (_, i) => `<path d="M${x} ${y + h - 10 - i * 10}Q${x + w / 2} ${y + h - 40 - i * 14 - r() * 20} ${x + w} ${y + h - 18 - i * 8}" stroke="${G.green}" stroke-opacity=".5" fill="none"/>`).join('');
  return `<clipPath id="th${seed}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>
    <g clip-path="url(#th${seed})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#071a10"/>${shapes}${lines}
    <rect x="${x}" y="${y}" width="40" height="${h}" fill="url(#sweepG)" style="animation:sweepX 5s linear ${-seed}s infinite"/></g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${G.green}" stroke-opacity=".25"/>`;
}

function projectsPanel(cfg, data) {
  const x = 628, y = 650, w = 552, h = 236;
  const items = cfg.projects.slice(0, 3).map((p) => ({ p, r: data.repos.find((r) => r.name.toLowerCase() === p.repo.toLowerCase()) }));
  const cw = 160;
  const cards = items.map(({ p, r }, i) => {
    const cx = x + 20 + i * (cw + 14), cy = y + 58;
    const name = (r?.name || p.repo);
    return `<g>
      <rect x="${cx}" y="${cy}" width="${cw}" height="160" rx="12" fill="#04110a" stroke="${G.green}" stroke-opacity=".25"/>
      ${thumb(cx + 8, cy + 8, cw - 16, 70, i + 1)}
      ${txt(cx + 12, cy + 100, name.length > 15 ? name.slice(0, 14) + '…' : name, { size: 14.5, weight: 700, fill: G.text })}
      ${txt(cx + 12, cy + 118, p.kind || 'Project', { size: 11.5, fill: G.dim })}
      <circle cx="${cx + cw - 20}" cy="${cy + 105}" r="9" fill="none" stroke="${G.green}" stroke-opacity=".5"/><path d="M${cx + cw - 22} ${cy + 101}l4 4l-4 4" stroke="${G.green}" fill="none"/>
      <rect x="${cx + 12}" y="${cy + 130}" width="${(r?.language || 'Code').length * 7 + 16}" height="20" rx="10" fill="none" stroke="${G.green}" stroke-opacity=".35"/>
      ${txt(cx + 20, cy + 144, r?.language || 'Code', { size: 11, fill: G.soft, family: MONO })}
    </g>`;
  }).join('');
  return `<g class="float" style="animation-duration:9s;animation-delay:-4s">
    ${glass(x, y, w, h, 'Featured Projects', `<g transform="translate(${x + 30} ${y + 30})"><rect x="-10" y="-9" width="20" height="18" rx="4" fill="none" stroke="${G.green}" stroke-width="2"/><circle r="3" fill="${G.green}"/></g>`)}
    ${txt(x + w - 44, y + 36, 'View all →', { size: 13, fill: G.soft, anchor: 'end' })}
    ${cards}
  </g>`;
}

function gamePanel() {
  const x = 1206, y = 604, w = 410, h = 262;
  const vx = x + 18, vy = y + 54, vw = w - 36, vh = 150;
  const r = rng(77);
  const stars = Array.from({ length: 30 }, () => `<circle cx="${(vx + r() * vw * 2).toFixed(1)}" cy="${(vy + r() * vh).toFixed(1)}" r="${(r() * 1.2 + 0.4).toFixed(1)}" fill="${G.mint}" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`).join('');
  const pix = (px, py, rows, size, fill) =>
    rows.map((row, j) => [...row].map((c, k) => (c === '1' ? `<rect x="${px + k * size}" y="${py + j * size}" width="${size}" height="${size}" fill="${fill}"/>` : '')).join('')).join('');
  const invader = ['00100100', '00011000', '00111100', '01011010', '11111111', '10111101', '10100101', '00011000'];
  const enemies = [0, 1, 2].map((i) => `<g style="animation:float ${2 + i * 0.4}s ease-in-out ${-i}s infinite">
      <g style="animation:pulse .9s steps(2) ${-i * 0.3}s infinite">${pix(vx + vw - 120 + (i % 2) * 40, vy + 22 + i * 42, invader, 3.2, G.bright)}</g></g>`).join('');
  const bullets = [0, 1, 2, 3].map((i) => `<rect x="${vx + 70}" y="${vy + 73}" width="14" height="3" rx="1.5" fill="${G.mint}" style="animation:shot 1.2s linear ${-i * 0.3}s infinite"/>`).join('');
  const scores = ['004210', '004380', '004650', '005120', '005400', '006080'];
  const score = scores.map((s, i) => `<tspan>${s}${showBetween(i * 2 + 0.001, (i + 1) * 2, 12)}</tspan>`).join('');
  return `<g class="float" style="animation-duration:7.5s;animation-delay:-1s">
    ${glass(x, y, w, h, 'Game Preview', `<g transform="translate(${x + 22} ${y + 30})"><circle cx="-6" r="4" fill="#ff5f57"/><circle cx="6" r="4" fill="#febc2e"/><circle cx="18" r="4" fill="${G.green}"/></g>`)}
    <clipPath id="vp"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="10"/></clipPath>
    <g clip-path="url(#vp)">
      <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#020905"/>
      <g style="animation:par 8s linear infinite">${stars}</g>
      <circle cx="${vx + vw - 30}" cy="${vy + vh + 40}" r="90" fill="#0b2a18" stroke="${G.green}" stroke-opacity=".4"/>
      ${enemies}
      <g style="animation:float 2.4s ease-in-out infinite">
        ${bullets}
        <path d="M${vx + 30} ${vy + 64}L${vx + 64} ${vy + 75}L${vx + 30} ${vy + 86}L${vx + 38} ${vy + 75}Z" fill="${G.green}" filter="url(#glow)"/>
        <path d="M${vx + 30} ${vy + 70}L${vx + 18} ${vy + 75}L${vx + 30} ${vy + 80}Z" fill="${G.mint}" class="blink" style="animation-duration:.2s"/>
      </g>
      <text x="${vx + 10}" y="${vy + 18}" font-family="${MONO}" font-size="11" fill="${G.green}">SCORE ${score}</text>
      <text x="${vx + vw - 10}" y="${vy + 18}" text-anchor="end" font-family="${MONO}" font-size="11" fill="${G.green}">LVL 07 ♥♥♥</text>
    </g>
    <rect x="${x + 18}" y="${y + 218}" width="130" height="30" rx="15" fill="${G.green}"/>
    <text x="${x + 83}" y="${y + 238}" text-anchor="middle" font-family="${SANS}" font-size="13" font-weight="800" fill="#03140a">▶  PLAY</text>
    ${txt(x + w - 20, y + 238, 'Unity · Unreal · Godot · WebGL', { size: 12, anchor: 'end', fill: G.dim, family: MONO })}
  </g>`;
}

function backdrop() {
  const r = rng(11);
  // falling data rain
  const rain = Array.from({ length: 22 }, (_, i) => {
    const x = (i / 22) * W + r() * 40;
    const d = 4 + r() * 5;
    return `<rect x="${x.toFixed(0)}" y="-200" width="1.5" height="${(120 + r() * 160).toFixed(0)}" fill="url(#rain)" style="animation:fall ${d.toFixed(1)}s linear ${(-r() * d).toFixed(1)}s infinite"/>`;
  }).join('');
  const ridge = (pts, fill, op) => `<path d="M0 ${H}L${pts}L${W} ${H}Z" fill="${fill}" opacity="${op}"/>`;
  return `
    <circle cx="860" cy="410" r="330" fill="url(#moon)"/>
    <circle cx="860" cy="410" r="250" fill="none" stroke="${G.green}" stroke-opacity=".18"/>
    <g transform="translate(860 410)">
      <g class="spin" style="animation-duration:60s"><circle r="300" fill="none" stroke="${G.green}" stroke-opacity=".22" stroke-dasharray="2 10"/></g>
      <g class="spinr" style="animation-duration:40s"><circle r="272" fill="none" stroke="${G.green}" stroke-opacity=".3" stroke-dasharray="80 30 6 30"/></g>
    </g>
    <text x="860" y="640" text-anchor="middle" font-family="'Yu Gothic','Meiryo','Noto Sans JP',sans-serif" font-size="420" font-weight="900" fill="${G.green}" opacity=".045">烏</text>
    <g>${rain}</g>
    ${ridge('0 760L140 690L260 735L380 660L520 720L640 680L760 740L900 700L1040 760L1180 700L1320 745L1460 690L1600 735L1664 700', '#04140b', 0.9)}
    ${ridge('0 830L180 780L320 820L470 770L640 830L820 790L1000 840L1160 800L1340 845L1500 800L1664 830', '#020a06', 1)}
    <path d="M0 760L140 690L260 735L380 660L520 720L640 680L760 740L900 700L1040 760L1180 700L1320 745L1460 690L1600 735L1664 700" fill="none" stroke="${G.green}" stroke-opacity=".25"/>`;
}

function energy() {
  const paths = [
    'M520 700C640 560 700 300 900 250S1180 330 1140 520',
    'M600 820C760 700 1040 720 1120 600S1160 380 1060 300',
    'M380 520C520 480 640 600 760 560S980 420 1060 460',
  ];
  return paths.map((d, i) => `<path d="${d}" fill="none" stroke="${G.green}" stroke-width="${3 - i * 0.6}" stroke-linecap="round" stroke-dasharray="${160 + i * 40} 900" filter="url(#glow)" style="animation:dash ${6 + i * 2}s linear ${-i * 2}s infinite;opacity:.85"/>
    <path d="${d}" fill="none" stroke="${G.green}" stroke-opacity=".12" stroke-width="1"/>`).join('');
}

function feathers() {
  const r = rng(5);
  return Array.from({ length: 14 }, (_, i) => {
    const x = 300 + r() * 1200, y = 100 + r() * 500, d = 7 + r() * 6;
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g style="animation:drift ${d.toFixed(1)}s ease-in-out ${(-r() * d).toFixed(1)}s infinite">
      <path d="M0 -10Q5 0 0 12Q-5 0 0 -10Z" fill="${i % 3 ? '#0d2b1a' : G.green}" stroke="${G.green}" stroke-opacity=".6" stroke-width=".8" transform="rotate(${(r() * 360).toFixed(0)})"/></g></g>`;
  }).join('');
}

export function heroSlide(cfg, data) {
  const navs = cfg.hero.nav;
  const nav = navs.map((n, i) => {
    const x = 440 + i * 98;
    return `<text x="${x}" y="58" text-anchor="middle" font-family="${SANS}" font-size="14" letter-spacing="2" fill="${i ? G.soft : G.text}">${esc(n)}</text>${i ? '' : `<rect x="${x - 22}" y="68" width="44" height="2" fill="${G.green}" filter="url(#glow)"/>`}`;
  }).join('');

  const links = [['web', 'AI'], ['web', 'WEB'], ['mobile', 'MOBILE'], ['game', 'GAMES']].map(([ic, l], i) => {
    const x = 92 + i * 128;
    return `${icon(ic === 'web' && i === 0 ? 'brain' : ic, x + 10, 668, 0.26, 'stroke-width="5"')}${label(x + 30, 673, l, { size: 13, fill: G.soft })}${i < 3 ? `<line x1="${x + 112}" y1="656" x2="${x + 112}" y2="680" stroke="${G.green}" stroke-opacity=".25"/>` : ''}`;
  }).join('');

  const body = `
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  ${backdrop()}
  <g>${particles(3, 40)}</g>
  ${feathers()}
  ${energy()}

  <!-- crow -->
  <g transform="translate(870 400)"><g class="float" style="animation-duration:8s">${crow(2.55)}</g></g>

  <!-- nav -->
  <g class="in">
    <g transform="translate(100 52)">${icon('sparkle', 0, 0, 0.5, 'stroke-width="3"')}</g>
    <text x="132" y="60" font-family="${SANS}" font-size="22" font-weight="600" letter-spacing="7" fill="${G.mint}">${esc(cfg.name.toUpperCase())}</text>
    ${nav}
    ${label(1496, 58, cfg.hero.motto, { size: 11.5, anchor: 'end', fill: G.dim, ls: 3, weight: 400 })}
    <rect x="1508" y="54" width="40" height="1.5" fill="${G.green}" opacity=".6"/>
    <circle cx="1566" cy="55" r="8" fill="${G.green}" filter="url(#glow)" class="pulse"/><circle cx="1574" cy="55" r="11" fill="none" stroke="${G.green}" stroke-width="2"/>
  </g>

  <!-- title lockup -->
  <g class="in" style="animation-delay:.2s">
    <path d="M60 170V110H116" fill="none" stroke="${G.green}" stroke-opacity=".6" stroke-width="2"/>
    ${label(92, 182, `[</>]  ${cfg.hero.kicker}`, { size: 16, ls: 5 })}
    <text x="88" y="300" font-family="${DISPLAY}" font-size="112" font-weight="900" fill="#000" opacity=".5" transform="translate(4 6)">SHINING</text>
    <text x="88" y="300" font-family="${DISPLAY}" font-size="112" font-weight="900" fill="url(#metal)">SHINING</text>
    <text x="88" y="300" font-family="${DISPLAY}" font-size="112" font-weight="900" fill="url(#shine)" opacity=".6">SHINING</text>
    <g transform="translate(96 430) skewX(-14)">
      <text x="0" y="0" font-family="${DISPLAY}" font-size="150" font-weight="900" fill="${G.green}" opacity=".45" filter="url(#softGlow)">CROW</text>
      <text x="0" y="0" font-family="${DISPLAY}" font-size="150" font-weight="900" fill="url(#brush)">CROW</text>
      <text x="0" y="0" font-family="${DISPLAY}" font-size="150" font-weight="900" fill="none" stroke="${G.mint}" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="40 400" class="dash" style="animation-duration:9s">CROW</text>
    </g>
    <path d="M90 452L470 446" stroke="${G.green}" stroke-width="3" stroke-linecap="round" opacity=".7" filter="url(#glow)"/>
    <text x="96" y="512" font-family="${SANS}" font-size="34" font-weight="300" letter-spacing="19" fill="${G.mint}">PORTFOLIO</text>
    ${label(96, 568, cfg.hero.tagline[0], { size: 15, ls: 5, fill: G.soft, weight: 400 })}
    ${label(96, 594, cfg.hero.tagline[1], { size: 15, ls: 5, fill: G.soft, weight: 400 })}
    <rect x="96" y="618" width="52" height="2" fill="${G.green}"/>
    ${links}
  </g>

  <!-- quote -->
  <g class="in" style="animation-delay:.5s">
    <line x1="78" y1="752" x2="78" y2="840" stroke="${G.green}" stroke-opacity=".6"/>
    ${cfg.hero.quote.map((q, i) => txt(96, 772 + i * 24, q, { size: 16, fill: G.soft, extra: 'font-style="italic"' })).join('')}
    <text x="96" y="870" font-family="'Yu Gothic','Meiryo','Noto Sans JP',sans-serif" font-size="18" letter-spacing="4" fill="${G.dim}">光る烏</text>
  </g>

  ${codePanel(cfg)}
  ${githubPanel(data)}
  ${gamePanel()}
  ${projectsPanel(cfg, data)}

  <rect class="scan" y="0" width="${W}" height="60" fill="url(#scanG)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  ${brackets(24, 36)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>${esc(cfg.name)} — ${esc(cfg.roles.join(' · '))}</title>
  <style>${CSS}
    @keyframes fall{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(${H + 300}px);opacity:0}}
    @keyframes drift{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(30px,40px) rotate(40deg)}}
    @keyframes shot{0%{transform:translateX(0);opacity:1}85%{opacity:1}100%{transform:translateX(250px);opacity:0}}
    @keyframes par{to{transform:translateX(-374px)}}
  </style>
  <defs>${DEFS}
    <radialGradient id="moon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${G.green}" stop-opacity=".2"/><stop offset=".55" stop-color="${G.green}" stop-opacity=".07"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#c9d6cf"/><stop offset=".55" stop-color="#7d8f86"/><stop offset="1" stop-color="#eef6f1"/></linearGradient>
    <linearGradient id="brush" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${G.bright}"/><stop offset=".5" stop-color="${G.green}"/><stop offset="1" stop-color="${G.mid}"/></linearGradient>
    <linearGradient id="rain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.green}" stop-opacity="0"/><stop offset="1" stop-color="${G.green}" stop-opacity=".35"/></linearGradient>
    <linearGradient id="panelShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  ${body}
</svg>\n`;
}
