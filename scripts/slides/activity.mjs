// Contribution Activity — real 12-month heatmap painted across the spectrum,
// live stat cards with sparklines, and the current-focus domains.
import { T, A, c, SANS, DISPLAY, MONO, esc, frame, heading, panel, label, txt, icon } from '../lib/ui.mjs';
import { fmt } from '../lib/theme.mjs';
import { streaks } from '../lib/github.mjs';

const SHADES = ['#ffffff', A.web, A.ai, A.mobile, A.game];

function spark(points, x, y, w, h, accent) {
  const max = Math.max(1, ...points);
  const pts = points.map((v, i) => [x + (i * w) / (points.length - 1), y + h - (v / max) * h]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const last = pts[pts.length - 1];
  return `<path d="${d}L${x + w} ${y + h}L${x} ${y + h}Z" fill="${c(accent)}" opacity=".1"/>
    <path d="${d}" fill="none" stroke="${c(accent)}" stroke-width="2.5" stroke-linejoin="round" filter="url(#glow)" stroke-dasharray="1200" style="animation:draw 2.4s ease-out both"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="5" fill="#fff" filter="url(#glow)" class="beat"/>`;
}

export function activitySlide(cfg, data) {
  const days = data.days;
  const total = days.reduce((s, d) => s + d.count, 0);
  const { current, longest } = streaks(days);
  const active = days.filter((d) => d.count).length;
  const stars = data.repos.reduce((s, r) => s + r.stars, 0);

  const px = 100, py = 140, pw = 1464, ph = 262;
  const cell = 18, gap = 4.6;
  const offset = days.length ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0;
  const weeks = Math.ceil((days.length + offset) / 7);
  const gx = px + (pw - weeks * (cell + gap)) / 2 + 20, gy = py + 64;
  let cells = '', months = '', lastMonth = -1;
  days.forEach((d, i) => {
    const idx = i + offset, w = Math.floor(idx / 7), r = idx % 7;
    const lv = d.count ? Math.max(1, d.level) : 0;
    const x = gx + w * (cell + gap), y = gy + r * (cell + gap);
    cells += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell}" height="${cell}" rx="4.5" fill="${SHADES[lv]}" fill-opacity="${lv ? 0.55 + lv * 0.11 : 0.06}" style="animation:pop .5s ease-out ${(0.2 + w * 0.025).toFixed(2)}s both"/>`;
    const m = new Date(d.date + 'T00:00:00Z').getUTCMonth();
    if (r === 0 && m !== lastMonth) {
      lastMonth = m;
      months += `<text x="${x.toFixed(1)}" y="${gy - 10}" font-family="${MONO}" font-size="11" fill="${T.dim}">${new Date(d.date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()}</text>`;
    }
  });
  const legend = SHADES.map((col, i) => `<rect x="${px + pw - 196 + i * 22}" y="${py + ph - 32}" width="16" height="16" rx="4" fill="${col}" fill-opacity="${i ? 0.55 + i * 0.11 : 0.06}"/>`).join('');

  const monthly = [];
  for (const d of days) {
    const k = d.date.slice(0, 7);
    if (!monthly.length || monthly[monthly.length - 1].k !== k) monthly.push({ k, v: 0 });
    monthly[monthly.length - 1].v += d.count;
  }
  const weekly = [];
  for (let i = 0; i < days.length; i += 7) weekly.push(days.slice(i, i + 7).reduce((s, d) => s + d.count, 0));

  const sy = 424, sh = 96, sw = 468, sgap = 30;
  const stat = (i, k, v, sub, accent, art) => {
    const x = px + i * (sw + sgap);
    return `${panel(x, sy, sw, sh, { accent, top: false, delay: 0.3 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.4 + i * 0.1}s">
        ${label(x + 24, sy + 30, k, { size: 11, ls: 2, fill: c(accent) })}
        <text x="${x + 22}" y="${sy + 74}" font-family="${DISPLAY}" font-size="34" font-weight="900" fill="${T.text}">${esc(v)}</text>
        ${sub ? txt(x + 24, sy + 90, sub, { size: 11, fill: T.dim, family: MONO }) : ''}
        ${art(x, sy)}
      </g>`;
  };

  const focus = cfg.focus;
  const fw = 344, fg = 26, fx0 = (1664 - (focus.length * fw + (focus.length - 1) * fg)) / 2, fy = 640, fh = 230;
  const focusCards = focus.map((f, i) => {
    const x = fx0 + i * (fw + fg), a = f.accent;
    return `${panel(x, fy, fw, fh, { accent: a, delay: 0.5 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.6 + i * 0.1}s">
        <circle cx="${x + fw - 30}" cy="${fy + 30}" r="6" fill="${c(a)}" filter="url(#glow)" class="pulse"/>
        <circle cx="${x + fw / 2}" cy="${fy + 58}" r="36" fill="${c(a)}" fill-opacity=".1" stroke="${c(a)}" stroke-opacity=".5" stroke-width="1.5"/>
        ${icon(f.icon, x + fw / 2, fy + 58, 0.52, a, 'stroke-width="3.6"')}
        <text x="${x + fw / 2}" y="${fy + 130}" text-anchor="middle" font-family="${SANS}" font-size="24" font-weight="800" fill="${T.text}">${esc(f.title)}</text>
        <rect x="${x + 80}" y="${fy + 146}" width="${fw - 160}" height="2" rx="1" fill="${c(a)}" opacity=".5"/>
        ${f.items.map((t, k) => `<text x="${x + fw / 2}" y="${fy + 176 + k * 22}" text-anchor="middle" font-family="${SANS}" font-size="15" fill="${T.soft}">${esc(t)}</text>`).join('')}
      </g>`;
  }).join('');

  const body = `${heading('CONTRIBUTION ACTIVITY', 'BUILD / CONTRIBUTE / SHIP / REPEAT', 84, 60)}
    ${panel(px, py, pw, ph, { accent: 'web', top: false })}
    <g class="in" style="animation-delay:.15s">
      ${label(px + 28, py + 34, 'CONTRIBUTION TELEMETRY', { size: 12, ls: 4, fill: A.web })}
      ${label(px + pw - 28, py + 34, `LIVE / ${days.length} DAYS`, { size: 11, ls: 2, anchor: 'end', fill: T.soft, weight: 400 })}
      ${months}${cells}
      <rect x="${gx - 10}" y="${gy - 4}" width="70" height="${7 * (cell + gap) + 2}" fill="url(#sweepIri)" style="animation:sweepGrid 6s linear infinite"/>
      ${txt(px + 28, py + ph - 20, `${fmt(total)} contributions in the last year`, { size: 14, fill: T.soft })}
      ${label(px + pw - 206, py + ph - 20, 'LESS', { size: 10.5, ls: 1, anchor: 'end', fill: T.dim, weight: 400 })}
      ${legend}
      ${label(px + pw - 82, py + ph - 20, 'MORE', { size: 10.5, ls: 1, fill: T.dim, weight: 400 })}
    </g>
    ${stat(0, 'CONTRIBUTIONS / 12 MONTHS', fmt(total), `${fmt(active)} active days`, 'web', (x, y) => spark(monthly.map((m) => m.v), x + 220, y + 22, 220, 54, 'web'))}
    ${stat(1, 'STREAK / CURRENT · BEST', `${current}d · ${longest}d`, 'consecutive days', 'mobile', (x, y) => `<g transform="translate(${x + 390} ${y + 48})"><g class="spin" style="animation-duration:10s">${icon('target', 0, 0, 0.9, 'mobile')}</g></g>`)}
    ${stat(2, 'REPOS / STARS / FOLLOWERS', `${data.repos.length} · ${stars} · ${data.user.followers}`, 'public signal', 'game', (x, y) => spark(weekly.slice(-16), x + 240, y + 22, 200, 54, 'game'))}
    <text x="832" y="590" text-anchor="middle" font-family="${DISPLAY}" font-size="46" font-weight="900" letter-spacing="-1" fill="url(#iri)">CURRENT FOCUS</text>
    ${label(832, 618, 'ACTIVE ENGINEERING DOMAINS', { size: 12, anchor: 'middle', ls: 6, fill: T.soft, weight: 400 })}
    ${focusCards}`;

  return frame({
    body, statusL: 'TELEMETRY // CONTRIBUTIONS // STREAKS', statusR: `SYNCED ${data.fetchedAt.slice(0, 10)}`, seed: 12, dust: 16,
    orbList: [['web', 300, 260, 240], ['mobile', 1350, 300, 220], ['game', 830, 860, 240]],
    extraCss: `@keyframes pop{from{opacity:0}to{opacity:1}}
      @keyframes draw{from{stroke-dashoffset:1200}to{stroke-dashoffset:0}}
      @keyframes sweepGrid{0%{transform:translateX(0)}100%{transform:translateX(${weeks * (cell + gap) - 50}px)}}`,
    extraDefs: `<linearGradient id="sweepIri" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
  });
}
