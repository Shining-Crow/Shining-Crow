// Square animated "system core": crow emblem in a hex reactor with orbiting
// domain nodes (AI / WEB / MOBILE / GAMES), satellites and pulse waves.
import { G, SANS, MONO, esc, CSS, DEFS, crow, particles, icon } from '../lib/ui.mjs';

const S = 960;
const C = S / 2;

export function coreSlide(cfg) {
  const hex = (r) => Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

  const domains = cfg.core.domains; // [{label, icon}]
  const R1 = 238;
  const nodes = domains.map((d, i) => {
    const a = (Math.PI * 2 * i) / domains.length - Math.PI / 2;
    const x = R1 * Math.cos(a), y = R1 * Math.sin(a);
    return `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${G.green}" stroke-opacity=".18" stroke-dasharray="3 6"/>
      <circle r="4" fill="${G.mint}" filter="url(#glow)"><animateMotion dur="${2.4 + i * 0.3}s" repeatCount="indefinite" path="M0,0 L${x.toFixed(1)},${y.toFixed(1)}"/></circle>
      <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g style="animation:spin 40s linear infinite reverse">
        <circle r="56" fill="#04110a" stroke="${G.green}" stroke-opacity=".55" stroke-width="2"/>
        <circle r="56" fill="none" stroke="${G.bright}" stroke-width="2.5" stroke-dasharray="40 312" class="dash" style="animation-duration:4s"/>
        ${icon(d.icon, 0, -10, 0.42, 'stroke-width="4.5"')}
        <text y="34" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" letter-spacing="2" fill="${G.mint}">${esc(d.label)}</text>
      </g></g>`;
  }).join('');

  const sats = cfg.core.satellites;
  const R2 = 372;
  const satNodes = sats.map((s, i) => {
    const a = (Math.PI * 2 * i) / sats.length;
    const x = R2 * Math.cos(a), y = R2 * Math.sin(a);
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g style="animation:spinr 70s linear infinite reverse">
      <rect x="-26" y="-15" width="52" height="30" rx="9" fill="#04110a" stroke="${G.green}" stroke-opacity=".45"/>
      <text y="5" text-anchor="middle" font-family="${SANS}" font-size="12.5" font-weight="800" fill="${G.bright}">${esc(s)}</text></g></g>`;
  }).join('');

  const waves = [0, 1, 2].map((i) => `<circle r="420" fill="none" stroke="${G.green}" stroke-width="2" style="animation:wave 4.5s ease-out ${-i * 1.5}s infinite;transform-box:view-box;transform-origin:${C}px ${C}px" cx="${C}" cy="${C}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <title>${esc(cfg.name)} — system core</title>
  <style>${CSS}</style>
  <defs>${DEFS}
    <radialGradient id="core" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${G.green}" stop-opacity=".35"/><stop offset=".4" stop-color="${G.green}" stop-opacity=".1"/><stop offset="1" stop-color="${G.green}" stop-opacity="0"/></radialGradient>
    <clipPath id="sq"><rect width="${S}" height="${S}" rx="36"/></clipPath>
  </defs>
  <g clip-path="url(#sq)">
    <rect width="${S}" height="${S}" fill="url(#bg)"/>
    <rect width="${S}" height="${S}" fill="url(#grid)"/>
    <circle cx="${C}" cy="${C}" r="460" fill="url(#midGlow)"/>
    <g>${particles(21, 40, [20, 20, S - 40, S - 40])}</g>
    ${waves}
    <g transform="translate(${C} ${C})">
      <circle r="${R2}" fill="none" stroke="${G.green}" stroke-opacity=".14"/>
      <g style="animation:spinr 70s linear infinite">
        <circle r="${R2}" fill="none" stroke="${G.green}" stroke-opacity=".5" stroke-width="2" stroke-dasharray="2 14"/>
        ${satNodes}
      </g>
      <g style="animation:spin 40s linear infinite">
        <circle r="${R1}" fill="none" stroke="${G.green}" stroke-opacity=".35" stroke-width="1.5"/>
        <circle r="${R1}" fill="none" stroke="${G.bright}" stroke-width="3" stroke-dasharray="120 1375" filter="url(#glow)"/>
        ${nodes}
      </g>
      <circle r="160" fill="url(#core)"/>
      <g class="spin" style="animation-duration:18s"><polygon points="${hex(150)}" fill="none" stroke="${G.green}" stroke-width="2" stroke-opacity=".6" stroke-dasharray="20 8 4 8"/></g>
      <g class="spinr" style="animation-duration:12s"><polygon points="${hex(132)}" fill="#03100a" fill-opacity=".85" stroke="${G.green}" stroke-opacity=".4"/></g>
      <g transform="translate(-18 -8)"><g class="float">${crow(1.05, { id: 'core' })}</g></g>
    </g>
    <text x="${C}" y="62" text-anchor="middle" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="7" fill="${G.green}">SYSTEM CORE <tspan fill="${G.dim}">·</tspan> ONLINE<tspan class="blink"> ●</tspan></text>
    <text x="${C}" y="${S - 46}" text-anchor="middle" font-family="${MONO}" font-size="13" letter-spacing="5" fill="${G.dim}">${esc(cfg.core.caption)}</text>
    <rect class="scan" width="${S}" height="60" fill="url(#scanG)"/>
    <rect width="${S}" height="${S}" fill="url(#vignette)"/>
  </g>
  <rect x="1" y="1" width="${S - 2}" height="${S - 2}" rx="36" fill="none" stroke="${G.green}" stroke-opacity=".3" stroke-width="2"/>
</svg>\n`;
}
