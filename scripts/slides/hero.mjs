// Hero: value proposition + CTA on the left, the 3D iridescent crow on the right
// framed by live glass cards (now-building, code, real GitHub activity).
import { W, H, T, A, c, SANS, DISPLAY, MONO, esc, CSS, DEFS, orbs, particles, chip, label, txt, icon } from '../lib/ui.mjs';
import { fmt, wrap } from '../lib/theme.mjs';
import { streaks } from '../lib/github.mjs';

const glass = (x, y, w, h, accent) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${T.panel0}" fill-opacity=".72" stroke="${c(accent)}" stroke-opacity=".35" stroke-width="1.5"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="url(#rg-${accent})"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="url(#glassSheen)"/>`;

// Coloured headline: segments written as {key:word} take that domain's colour.
export function richLine(x, y, s, size, anchor = 'start') {
  const parts = s.split(/(\{\w+:[^}]+\})/).filter(Boolean).map((p) => {
    const m = p.match(/^\{(\w+):([^}]+)\}$/);
    return m ? `<tspan fill="${c(m[1])}">${esc(m[2])}</tspan>` : esc(p);
  });
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${SANS}" font-size="${size}" font-weight="700" letter-spacing="-.5" fill="${T.text}">${parts.join('')}</text>`;
}

export function heroSlide(cfg, data, crowImg) {
  const h = cfg.hero;
  const total = data.days.reduce((s, d) => s + d.count, 0);
  const { longest } = streaks(data.days);
  const langs = Object.keys(data.languages).length;

  const nav = h.nav.map((n, i) => `<text x="${1000 + i * 108}" y="62" text-anchor="middle" font-family="${SANS}" font-size="14" font-weight="600" letter-spacing="2" fill="${T.soft}">${esc(n)}</text>`).join('');
  const sub = wrap(h.sub, 58);

  // live stats row
  const stats = [[fmt(total), 'contributions / yr', 'web'], [`${longest}d`, 'best streak', 'mobile'], [String(langs), 'languages shipped', 'game']];
  const statSvg = stats.map(([v, k, a], i) => {
    const x = 98 + i * 205;
    return `${i ? `<line x1="${x - 26}" y1="670" x2="${x - 26}" y2="724" stroke="#fff" stroke-opacity=".12"/>` : ''}
      <text x="${x}" y="702" font-family="${DISPLAY}" font-size="38" font-weight="900" fill="${c(a)}">${esc(v)}</text>
      ${txt(x, 727, k, { size: 14, fill: T.dim })}`;
  }).join('');

  // mini heat strip — last 12 weeks, intensity mapped across the spectrum
  const days = data.days.slice(-84);
  const shade = ['#ffffff', A.web, A.ai, A.mobile, A.game];
  const cells = days.map((d, i) => {
    const lv = d.count ? Math.max(1, d.level) : 0;
    return `<rect x="${1332 + Math.floor(i / 7) * 22}" y="${716 + (i % 7) * 14}" width="17" height="10" rx="3" fill="${shade[lv]}" opacity="${lv ? 0.6 + lv * 0.1 : 0.07}"/>`;
  }).join('');

  const code = h.code.map((l, i) => {
    const colored = esc(l)
      .replace(/(&#39;|')([^']*?)(\1)/g, `<tspan fill="${A.game}">'$2'</tspan>`)
      .replace(/\b(const|await|new|return)\b/g, `<tspan fill="${A.mobile}">$1</tspan>`)
      .replace(/(\.\w+)\(/g, `<tspan fill="${A.web}">$1</tspan>(`);
    return `<text x="840" y="${730 + i * 24}" font-family="${MONO}" font-size="13.5" fill="${T.text}" xml:space="preserve">${colored}</text>`;
  }).join('');

  const crow = crowImg ? `<image href="${crowImg}" x="660" y="40" width="960" height="960" preserveAspectRatio="xMidYMid meet"/>` : '';

  const body = `
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${orbs([['ai', 1150, 430, 300], ['web', 1500, 180, 200], ['mobile', 900, 780, 220], ['game', 240, 840, 170]])}
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <g>${particles(3, 46)}</g>

  <circle cx="1140" cy="500" r="270" fill="url(#halo)"/>
  <g transform="translate(1140 500)">
    <g class="spin" style="animation-duration:40s"><circle r="310" fill="none" stroke="url(#iri)" stroke-width="2" stroke-dasharray="2 12" opacity=".7"/></g>
    <g class="spinr" style="animation-duration:28s"><circle r="270" fill="none" stroke="url(#iri)" stroke-width="3" stroke-dasharray="140 60 10 60" opacity=".5"/></g>
    <g class="spin" style="animation-duration:18s"><circle r="232" fill="none" stroke="#fff" stroke-opacity=".14" stroke-dasharray="1 8"/></g>
  </g>
  <g class="float" style="animation-duration:7s">${crow}</g>

  <g class="in">
    <g transform="translate(112 58)">${icon('sparkle', 0, 0, 0.5, 'ai', 'stroke-width="3"')}</g>
    <text x="144" y="66" font-family="${SANS}" font-size="20" font-weight="800" letter-spacing="6" fill="${T.text}">${esc(cfg.name.toUpperCase())}</text>
    ${nav}
    <rect x="1458" y="38" width="152" height="42" rx="21" fill="url(#iri)"/>
    <text x="1534" y="65" text-anchor="middle" font-family="${SANS}" font-size="15" font-weight="800" fill="${T.ink}">Hire me →</text>
  </g>

  <g class="in" style="animation-delay:.15s">
    <rect x="96" y="128" width="${h.availability.length * 9.6 + 60}" height="38" rx="19" fill="${A.lime}" fill-opacity=".08" stroke="${A.lime}" stroke-opacity=".55"/>
    <circle cx="120" cy="147" r="5" fill="${A.lime}" class="pulse"/>
    ${label(138, 152, h.availability, { size: 13.5, fill: A.lime, ls: 2 })}

    <text x="88" y="272" font-family="${DISPLAY}" font-size="104" font-weight="900" letter-spacing="-3" fill="url(#iri)" opacity=".35" filter="url(#softGlow)">${esc(cfg.name)}</text>
    <text x="88" y="272" font-family="${DISPLAY}" font-size="104" font-weight="900" letter-spacing="-3" fill="url(#iri)">${esc(cfg.name)}</text>
    <text x="88" y="272" font-family="${DISPLAY}" font-size="104" font-weight="900" letter-spacing="-3" fill="url(#shine)" opacity=".5">${esc(cfg.name)}</text>

    ${h.headline.map((l, i) => richLine(96, 352 + i * 50, l, 40)).join('')}
    ${sub.map((l, i) => txt(98, 470 + i * 30, l, { size: 20, fill: T.soft })).join('')}

    <rect x="96" y="566" width="300" height="64" rx="32" fill="url(#iri)" filter="url(#softGlow)" opacity=".5" class="pulse"/>
    <rect x="96" y="566" width="300" height="64" rx="32" fill="url(#iri)"/>
    <text x="246" y="606" text-anchor="middle" font-family="${SANS}" font-size="20" font-weight="800" fill="${T.ink}">${esc(h.ctaPrimary)} →</text>
    <rect x="416" y="566" width="230" height="64" rx="32" fill="#fff" fill-opacity=".04" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/>
    <text x="531" y="606" text-anchor="middle" font-family="${SANS}" font-size="20" font-weight="700" fill="${T.text}">${esc(h.ctaSecondary)}</text>
    ${statSvg}
    <g transform="translate(98 790)">
      ${[['AI', 'ai'], ['WEB', 'web'], ['MOBILE', 'mobile'], ['GAMES', 'game']].map(([t, k], i) => chip(i * 128, 0, 116, 36, t, { accent: k, dot: true, i, size: 13 })).join('')}
    </g>
  </g>

  <g class="float" style="animation-duration:8s;animation-delay:-2s">
    ${glass(1330, 126, 280, 116, 'lime')}
    ${label(1352, 160, 'NOW BUILDING', { size: 12, fill: A.lime })}
    <circle cx="1586" cy="155" r="5" fill="${A.lime}" class="pulse"/>
    ${wrap(h.nowBuilding, 26).slice(0, 2).map((l, i) => txt(1352, 194 + i * 24, l, { size: 17, weight: 600, fill: T.text })).join('')}
  </g>
  <g class="float" style="animation-duration:9s;animation-delay:-4s">
    ${glass(816, 684, 440, 152, 'ai')}
    <circle cx="840" cy="708" r="5" fill="#ff5f57"/><circle cx="858" cy="708" r="5" fill="#febc2e"/><circle cx="876" cy="708" r="5" fill="#28c840"/>
    ${label(1234, 713, 'crow.ts', { size: 11, anchor: 'end', fill: T.dim, ls: 1, weight: 400 })}
    ${code}
    <rect x="${840 + h.code[h.code.length - 1].length * 8.1}" y="${717 + (h.code.length - 1) * 24}" width="8" height="16" fill="${A.ai}" class="blink"/>
  </g>
  <g class="float" style="animation-duration:7.5s;animation-delay:-1s">
    ${glass(1300, 666, 310, 170, 'web')}
    ${label(1322, 700, 'GITHUB · LIVE', { size: 12, fill: A.web })}
    ${txt(1588, 700, `${fmt(total)} contribs`, { size: 14, weight: 700, fill: T.text, anchor: 'end' })}
    ${cells}
  </g>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>${esc(cfg.name)} — ${esc(cfg.roles.join(' · '))}</title>
  <style>${CSS}</style>
  <defs>${DEFS}
    <radialGradient id="halo"><stop offset="0" stop-color="${A.ai}" stop-opacity=".38"/><stop offset=".5" stop-color="${A.mobile}" stop-opacity=".1"/><stop offset="1" stop-color="${A.web}" stop-opacity="0"/></radialGradient>
    <clipPath id="frameClip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#frameClip)">${body}</g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" fill="none" stroke="url(#iri)" stroke-opacity=".4" stroke-width="2"/>
</svg>\n`;
}
