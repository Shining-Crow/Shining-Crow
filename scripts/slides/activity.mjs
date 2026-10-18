// Contribution Activity — real 12-month telemetry heatmap, live stat cards
// with sparklines, and the current-focus domains.
import { G, SANS, DISPLAY, MONO, esc, frame, heading, panel, label, txt, icon } from '../lib/ui.mjs';
import { fmt } from '../lib/theme.mjs';
import { streaks } from '../lib/github.mjs';

const SHADES = ['#0a1f14', '#14532d', '#1f8a4c', '#2fd06b', '#7dffae'];

function spark(points, x, y, w, h) {
  const max = Math.max(1, ...points);
  const pts = points.map((v, i) => [x + (i * w) / (points.length - 1), y + h - (v / max) * h]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const last = pts[pts.length - 1];
  return `<path d="${d}" fill="none" stroke="${G.green}" stroke-width="2.5" stroke-linejoin="round" filter="url(#glow)" stroke-dasharray="1200" style="animation:draw 2.4s ease-out both"/>
    <path d="${d}L${x + w} ${y + h}L${x} ${y + h}Z" fill="${G.green}" opacity=".08"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="5" fill="#fff" filter="url(#glow)" class="beat"/>`;
}

export function activitySlide(cfg, data) {
  const days = data.days;
  const total = days.reduce((s, d) => s + d.count, 0);
  const { current, longest } = streaks(days);
  const active = days.filter((d) => d.count).length;
  const stars = data.repos.reduce((s, r) => s + r.stars, 0);

  // Heatmap grid
  const px = 100, py = 140, pw = 1464, ph = 262;
  const cell = 18, gap = 4.6;
  const offset = days.length ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0;
  const weeks = Math.ceil((days.length + offset) / 7);
  const gx = px + (pw - weeks * (cell + gap)) / 2 + 20, gy = py + 64;
  let cells = '', months = '';
  let lastMonth = -1;
  days.forEach((d, i) => {
    const idx = i + offset, w = Math.floor(idx / 7), r = idx % 7;
    const lv = d.count ? Math.max(1, d.level) : 0;
    const x = gx + w * (cell + gap), y = gy + r * (cell + gap);
    cells += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell}" height="${cell}" rx="4" fill="${SHADES[lv]}" style="animation:pop .5s ease-out ${(0.2 + w * 0.025).toFixed(2)}s both${lv >= 3 ? `, pulse 2.6s ease-in-out ${(1 + (i % 7) * 0.3).toFixed(1)}s infinite` : ''}"/>`;
    const m = new Date(d.date + 'T00:00:00Z').getUTCMonth();
    if (r === 0 && m !== lastMonth) {
      lastMonth = m;
      months += `<text x="${x.toFixed(1)}" y="${gy - 10}" font-family="${MONO}" font-size="11" fill="${G.dim}">${new Date(d.date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()}</text>`;
    }
  });
  const legend = SHADES.map((c, i) => `<rect x="${px + pw - 196 + i * 22}" y="${py + ph - 32}" width="16" height="16" rx="3" fill="${c}"/>`).join('');

  // Monthly + weekly series for sparklines
  const monthly = [];
  for (const d of days) {
    const k = d.date.slice(0, 7);
    if (!monthly.length || monthly[monthly.length - 1].k !== k) monthly.push({ k, v: 0 });
    monthly[monthly.length - 1].v += d.count;
  }
  const weekly = [];
  for (let i = 0; i < days.length; i += 7) weekly.push(days.slice(i, i + 7).reduce((s, d) => s + d.count, 0));

  const sy = 424, sh = 96, sw = 468, sgap = 30;
  const stat = (i, k, v, sub, art) => {
    const x = px + i * (sw + sgap);
    return `${panel(x, sy, sw, sh, { top: false, delay: 0.3 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.4 + i * 0.1}s">
        ${label(x + 24, sy + 30, k, { size: 11, ls: 2 })}
        <text x="${x + 22}" y="${sy + 74}" font-family="${DISPLAY}" font-size="34" font-weight="900" fill="${G.text}">${esc(v)}</text>
        ${sub ? txt(x + 24, sy + 90, sub, { size: 11, fill: G.dim, family: MONO }) : ''}
        ${art(x, sy)}
      </g>`;
  };

  const focus = cfg.focus;
  const fw = 344, fg = 26, fx0 = (1664 - (focus.length * fw + (focus.length - 1) * fg)) / 2, fy = 640, fh = 230;
  const focusCards = focus.map((f, i) => {
    const x = fx0 + i * (fw + fg);
    return `${panel(x, fy, fw, fh, { delay: 0.5 + i * 0.1 })}
      <g class="in" style="animation-delay:${0.6 + i * 0.1}s">
        <circle cx="${x + fw - 30}" cy="${fy + 30}" r="7" fill="${G.green}" filter="url(#glow)" class="pulse"/>
        <circle cx="${x + fw / 2}" cy="${fy + 58}" r="36" fill="#04110a" stroke="${G.green}" stroke-opacity=".5" stroke-width="1.5"/>
        ${icon(f.icon, x + fw / 2, fy + 58, 0.52, 'stroke-width="3.6"')}
        <text x="${x + fw / 2}" y="${fy + 130}" text-anchor="middle" font-family="${SANS}" font-size="25" font-weight="800" fill="${G.text}">${esc(f.title)}</text>
        <rect x="${x + 70}" y="${fy + 146}" width="${fw - 140}" height="1" fill="${G.green}" opacity=".3"/>
        ${f.items.map((t, k) => `<text x="${x + fw / 2}" y="${fy + 174 + k * 22}" text-anchor="middle" font-family="${SANS}" font-size="15" fill="${G.soft}">${esc(t)}</text>`).join('')}
      </g>`;
  }).join('');

  const body = `${heading('CONTRIBUTION ACTIVITY', 'BUILD / CONTRIBUTE / SHIP / REPEAT', 84, 60)}
    ${panel(px, py, pw, ph, { top: false })}
    <g class="in" style="animation-delay:.15s">
      ${label(px + 28, py + 34, 'CONTRIBUTION TELEMETRY', { size: 12, ls: 4 })}
      ${label(px + pw - 28, py + 34, `LIVE STREAM / ${days.length} DAYS`, { size: 11, ls: 2, anchor: 'end', fill: G.soft, weight: 400 })}
      ${months}${cells}
      <rect x="${gx - 10}" y="${gy - 4}" width="60" height="${7 * (cell + gap) + 2}" fill="url(#sweepG)" style="animation:sweepGrid 6s linear infinite"/>
      ${txt(px + 28, py + ph - 20, `${fmt(total)} contributions in the last year`, { size: 14, fill: G.soft })}
      ${label(px + pw - 206, py + ph - 20, 'LOW', { size: 10.5, ls: 1, anchor: 'end', fill: G.dim, weight: 400 })}
      ${legend}
      ${label(px + pw - 82, py + ph - 20, 'HIGH', { size: 10.5, ls: 1, fill: G.dim, weight: 400 })}
    </g>
    ${stat(0, 'CONTRIBUTIONS / 12 MONTHS', fmt(total), `${fmt(active)} active days`, (x, y) => spark(monthly.map((m) => m.v), x + 220, y + 22, 220, 54))}
    ${stat(1, 'STREAK / CURRENT · BEST', `${current}d · ${longest}d`, 'consecutive days', (x, y) => `<g transform="translate(${x + 380} ${y + 48})"><g class="spin" style="animation-duration:10s">${icon('target', 0, 0, 0.9)}</g></g>`)}
    ${stat(2, 'REPOS / STARS / FOLLOWERS', `${data.repos.length} · ${stars} · ${data.user.followers}`, 'public signal', (x, y) => spark(weekly.slice(-16), x + 240, y + 22, 200, 54))}
    <text x="832" y="590" text-anchor="middle" font-family="${DISPLAY}" font-size="46" font-weight="900" fill="url(#title)">CURRENT FOCUS</text>
    ${label(832, 618, 'ACTIVE ENGINEERING DOMAINS', { size: 12, anchor: 'middle', ls: 6, fill: G.soft, weight: 400 })}
    ${focusCards}`;

  return frame({ body, statusL: 'TELEMETRY // CONTRIBUTIONS // STREAKS', statusR: `SYNCED ${data.fetchedAt.slice(0, 10)}`, seed: 12, dust: 14 }).replace(
    '</style>',
    `@keyframes pop{from{opacity:0}to{opacity:1}}
     @keyframes draw{from{stroke-dashoffset:1200}to{stroke-dashoffset:0}}
     @keyframes sweepGrid{0%{transform:translateX(0)}100%{transform:translateX(${weeks * (cell + gap) - 40}px)}}
    </style>`
  );
}
