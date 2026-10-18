// Closing call-to-action — the slide that turns a visitor into a conversation.
import { W, H, T, A, c, SANS, DISPLAY, MONO, esc, CSS, DEFS, orbs, particles, label, txt, icon } from '../lib/ui.mjs';
import { richLine } from './hero.mjs';

export function ctaSlide(cfg, crowImg) {
  const k = cfg.cta;
  const contacts = k.contacts.filter((x) => x.value);
  const cw = 330, cg = 22, cx0 = 96;
  const top = 70;                                            // pushes the block to the vertical centre
  const hy = 226 + top, hs = 88;                                   // headline baseline + line step
  const subY = hy + hs * (k.headline.length - 1) + 66;
  const cardY = subY + 32 * (k.sub.length - 1) + 50;
  const btnY = cardY + Math.ceil(contacts.length / 2) * 104 + 4;

  const cards = contacts.map((ct, i) => {
    const x = cx0 + (i % 2) * (cw + cg), y = cardY + Math.floor(i / 2) * 104, a = ct.accent;
    return `<g class="in" style="animation-delay:${0.4 + i * 0.1}s">
      <rect x="${x}" y="${y}" width="${cw}" height="86" rx="20" fill="${T.panel0}" fill-opacity=".8" stroke="${c(a)}" stroke-opacity=".45" stroke-width="1.5"/>
      <rect x="${x}" y="${y}" width="${cw}" height="86" rx="20" fill="url(#rg-${a})"/>
      <circle cx="${x + 44}" cy="${y + 43}" r="24" fill="${c(a)}" fill-opacity=".14"/>
      ${icon(ct.icon, x + 44, y + 43, 0.32, a, 'stroke-width="5"')}
      ${label(x + 82, y + 36, ct.label, { size: 11.5, fill: c(a), ls: 3 })}
      ${txt(x + 82, y + 62, ct.value, { size: ct.value.length > 24 ? 15 : 17, weight: 700, fill: T.text })}
    </g>`;
  }).join('');

  const crow = crowImg ? `<image href="${crowImg}" x="830" y="70" width="860" height="860" preserveAspectRatio="xMidYMid meet" transform="scale(-1 1) translate(${-2 * 1260} 0)"/>` : '';

  const body = `
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${orbs([['mobile', 1250, 420, 320], ['ai', 300, 300, 260], ['web', 900, 860, 220], ['game', 1550, 820, 180]])}
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <g>${particles(9, 50)}</g>
  <g transform="translate(1260 480)">
    ${[360, 300, 240, 180].map((r, i) => `<g style="animation:${i % 2 ? 'spinr' : 'spin'} ${30 + i * 8}s linear infinite"><circle r="${r}" fill="none" stroke="url(#iri)" stroke-width="${2 - i * 0.3}" stroke-dasharray="${i % 2 ? '2 10' : '120 40 6 40'}" opacity="${0.6 - i * 0.1}"/></g>`).join('')}
    <circle r="160" fill="url(#halo)"/>
  </g>
  <g class="float" style="animation-duration:7s">${crow}</g>

  <g class="in">
    <rect x="96" y="${112 + top}" width="${k.badge.length * 9.6 + 60}" height="38" rx="19" fill="${A.lime}" fill-opacity=".08" stroke="${A.lime}" stroke-opacity=".55"/>
    <circle cx="120" cy="${131 + top}" r="5" fill="${A.lime}" class="pulse"/>
    ${label(138, 136 + top, k.badge, { size: 13.5, fill: A.lime, ls: 2 })}
    ${k.headline.map((l, i) => `<text x="90" y="${hy + i * hs}" font-family="${DISPLAY}" font-size="86" font-weight="900" letter-spacing="-3" fill="${i === k.headline.length - 1 ? 'url(#iri)' : T.text}">${esc(l)}</text>`).join('')}
    <text x="90" y="${hy + (k.headline.length - 1) * hs}" font-family="${DISPLAY}" font-size="86" font-weight="900" letter-spacing="-3" fill="url(#shine)" opacity=".5">${esc(k.headline[k.headline.length - 1])}</text>
    ${k.sub.map((l, i) => richLine(96, subY + i * 32, l, 24)).join('')}
  </g>
  ${cards}
  <g class="in" style="animation-delay:.8s">
    <rect x="96" y="${btnY}" width="682" height="70" rx="35" fill="url(#iri)" filter="url(#softGlow)" opacity=".5" class="pulse"/>
    <rect x="96" y="${btnY}" width="682" height="70" rx="35" fill="url(#iri)"/>
    <text x="437" y="${btnY + 44}" text-anchor="middle" font-family="${SANS}" font-size="23" font-weight="800" letter-spacing=".5" fill="${T.ink}">${esc(k.button)} →</text>
  </g>
  ${label(W - 60, H - 40, k.footer, { size: 11, anchor: 'end', fill: T.dim, ls: 3, weight: 400 })}
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>Work with ${esc(cfg.name)}</title>
  <style>${CSS}</style>
  <defs>${DEFS}
    <radialGradient id="halo"><stop offset="0" stop-color="${A.mobile}" stop-opacity=".35"/><stop offset=".6" stop-color="${A.ai}" stop-opacity=".1"/><stop offset="1" stop-color="${A.ai}" stop-opacity="0"/></radialGradient>
    <clipPath id="frameClip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#frameClip)">${body}</g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" fill="none" stroke="url(#iri)" stroke-opacity=".4" stroke-width="2"/>
</svg>\n`;
}
