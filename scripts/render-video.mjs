// Renders the animated slides into a cinematic 1080p showreel.
//
// How: each slide SVG is inlined into a 1920×1080 stage page in headless
// Chrome. For every frame we pause all CSS + SMIL animations and seek them to
// the exact timestamp, screenshot, and pipe the frame into ffmpeg — so the
// output is frame-perfect regardless of machine speed.
//
//   node scripts/render-video.mjs            → assets/video/showreel.mp4 + .jpg poster
//   node scripts/render-video.mjs --gif      → also a lightweight showreel.gif
//   node scripts/render-video.mjs --preview  → stills of every scene in .preview/
//   node scripts/render-video.mjs --fps 60   → smoother MP4 (default 30)
//
// Needs Chrome/Edge/Chromium installed (or CHROME_PATH set). Run `npm install` first.
import { readFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const PREVIEW = process.argv.includes('--preview');
const GIF = process.argv.includes('--gif');
const FPS = Number(arg('fps', 30));
const W = 1920, H = 1080;
const FADE = 0.4;

// Inline SVGs share one document, so give each one private ids.
let uid = 0;
function scoped(src) {
  const p = `s${++uid}-`;
  return src
    .replace(/<\?xml[^>]*>/, '')
    .replace(/\bid="([^"]+)"/g, `id="${p}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${p}$1"`);
}

const SCENES = [
  { key: 'hero', dur: 9, file: 'hero.svg' },
  { key: 'core', dur: 7, file: 'core.svg', square: true },
  { key: 'universe', dur: 6, file: 'universe.svg' },
  { key: 'ai', dur: 6, file: 'ai.svg' },
  { key: 'game', dur: 7, file: 'game.svg' },
  { key: 'architecture', dur: 6, file: 'architecture.svg' },
  { key: 'activity', dur: 6, file: 'activity.svg' },
  { key: 'projects', dur: 6, file: 'projects.svg' },
];

async function sceneHtml(scene, overlay = '') {
  const svg = scoped(await readFile(join(ROOT, 'assets', 'slides', scene.file), 'utf8'));
  const content = scene.square
    ? `<div class="sq">${svg}</div><div class="side l">AI<br>WEB</div><div class="side r">MOBILE<br>GAMES</div>`
    : `<div class="full">${svg}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#020a06}
    #bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(61,255,134,.14),transparent 55%),#020a06}
    #grid{position:absolute;inset:0;background-image:linear-gradient(rgba(61,255,134,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(61,255,134,.06) 1px,transparent 1px);background-size:40px 40px}
    .full svg{position:absolute;inset:0;width:${W}px;height:${H}px;display:block}
    .sq{position:absolute;left:${(W - 980) / 2}px;top:50px;width:980px;height:980px;filter:drop-shadow(0 0 60px rgba(61,255,134,.25))}
    .sq svg{width:100%;height:100%;display:block}
    .side{position:absolute;top:470px;font:900 64px/1.15 'Arial Black',Arial,sans-serif;letter-spacing:4px;color:transparent;-webkit-text-stroke:1.5px rgba(61,255,134,.45)}
    .side.l{left:110px}.side.r{right:110px;text-align:right}
    #bar{position:absolute;left:0;bottom:0;height:4px;background:linear-gradient(90deg,#22c55e,#7dffae);box-shadow:0 0 12px #3dff86}
    #fade{position:absolute;inset:0;background:#000}
    .play{position:absolute;left:50%;top:50%;width:180px;height:180px;margin:-90px 0 0 -90px;border-radius:50%;background:rgba(2,10,6,.55);border:3px solid #3dff86;box-shadow:0 0 60px rgba(61,255,134,.6),inset 0 0 30px rgba(61,255,134,.3)}
    .play:after{content:'';position:absolute;left:68px;top:52px;border-left:62px solid #3dff86;border-top:38px solid transparent;border-bottom:38px solid transparent}
    .tag{position:absolute;left:50%;top:calc(50% + 120px);transform:translateX(-50%);font:700 26px 'Cascadia Code',Consolas,monospace;letter-spacing:10px;color:#d5ffe2;text-shadow:0 0 18px #3dff86}
  </style></head><body>
    <div id="bg"></div><div id="grid"></div>
    ${content}
    <div id="bar"></div><div id="fade"></div>${overlay}
  </body></html>`;
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error('No Chrome/Edge found — set CHROME_PATH to a Chromium-based browser.');
  return found;
}

// Seek every animation on the page (CSS + SMIL) to scene-local time t.
async function seek(page, t, progress, fade) {
  await page.evaluate(
    (t, progress, fade) => {
      for (const s of document.querySelectorAll('svg')) {
        if (s.ownerSVGElement) continue;
        s.pauseAnimations();
        s.setCurrentTime(t);
      }
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = t * 1000;
      }
      document.getElementById('bar').style.width = `${(progress * 100).toFixed(3)}%`;
      document.getElementById('fade').style.opacity = String(fade);
      return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    },
    t, progress, fade
  );
}

// Returns { proc, done } so callers can stream frames into stdin.
function ffmpeg(args) {
  const proc = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
  return { proc, done };
}

const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: true,
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

if (PREVIEW) {
  const dir = join(ROOT, '.preview');
  await mkdir(dir, { recursive: true });
  const only = arg('scene');
  for (const scene of SCENES.filter((s) => !only || s.key === only)) {
    await page.setContent(await sceneHtml(scene), { waitUntil: 'load' });
    for (const t of [scene.dur * 0.3, scene.dur * 0.85]) {
      await seek(page, t, 0, 0);
      const file = join(dir, `${scene.key}-${t.toFixed(1)}s.png`);
      await page.screenshot({ path: file });
      console.log('  ✓', file);
    }
  }
  await browser.close();
  process.exit(0);
}

const outDir = join(ROOT, 'assets', 'video');
await mkdir(outDir, { recursive: true });
const mp4 = join(outDir, 'showreel.mp4');
const gif = join(outDir, 'showreel.gif');
const poster = join(outDir, 'showreel.jpg');

const total = SCENES.reduce((s, x) => s + x.dur, 0);
const frames = Math.round(total * FPS);
console.log(`» rendering ${SCENES.length} scenes · ${total}s · ${frames} frames @ ${FPS}fps · ${W}×${H}`);

const { proc: enc, done: encoded } = ffmpeg([
  '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4,
]);

let done = 0, elapsed = 0;
const started = Date.now();
for (const scene of SCENES) {
  await page.setContent(await sceneHtml(scene), { waitUntil: 'load' });
  const n = Math.round(scene.dur * FPS);
  for (let f = 0; f < n; f++) {
    const t = f / FPS;
    const fade = Math.max(0, 1 - Math.min(t, scene.dur - t) / FADE);
    await seek(page, t, (elapsed + t) / total, Math.min(1, fade));
    const buf = await page.screenshot({ type: 'png', optimizeForSpeed: true });
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
    if (++done % FPS === 0) {
      const rate = done / ((Date.now() - started) / 1000);
      process.stdout.write(`\r  ${scene.key.padEnd(13)} ${done}/${frames} frames · ${rate.toFixed(1)} fps · ETA ${Math.round((frames - done) / rate)}s   `);
    }
  }
  elapsed += scene.dur;
}
enc.stdin.end();
await encoded;

// Poster: hero frame with a glowing play button, used as the README thumbnail.
await page.setContent(await sceneHtml(SCENES[0], '<div class="play"></div><div class="tag">WATCH SHOWREEL</div>'), { waitUntil: 'load' });
await seek(page, 5, 0, 0);
await page.evaluate(() => { document.getElementById('bar').style.width = '0'; });
await page.screenshot({ path: poster, type: 'jpeg', quality: 88 });
await browser.close();

if (GIF) {
  console.log('\n» encoding GIF');
  await ffmpeg([
    '-i', mp4, '-vf',
    'setpts=PTS/1.5,fps=10,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
    '-loop', '0', gif,
  ]).done;
}

console.log('');
for (const f of [mp4, poster, ...(GIF ? [gif] : [])]) console.log(`  ✓ ${f.replace(ROOT, '.')}  ${((await stat(f)).size / 1048576).toFixed(2)} MB`);
