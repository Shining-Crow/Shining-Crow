// Renders the Three.js "Crow's Realm" scene frame-by-frame in headless Chrome.
//
//   node scripts/render-3d.mjs              → assets/video/crow-realm.webp (960² seamless loop)
//                                              assets/video/crow-realm-wide.webp (1280×720 loop)
//                                              assets/video/showreel.mp4 + showreel.jpg (1080p cinematic)
//   node scripts/render-3d.mjs --only loop  → just the square WebP loop
//   node scripts/render-3d.mjs --only wide  → just the 1280×720 WebP loop
//   node scripts/render-3d.mjs --only reel  → just the showreel
//   node scripts/render-3d.mjs --preview    → a few stills in .preview/
//
// Needs Chrome/Edge (or CHROME_PATH) and `npm install`.
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const ONLY = arg('only');
const PREVIEW = process.argv.includes('--preview');

// ── static server (ES modules can't load from file://) ──
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const p = normalize(join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (!p.startsWith(ROOT)) return res.writeHead(403).end();
  let body;
  try { body = await readFile(p); } catch { return res.writeHead(404).end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }).end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/scripts/3d/stage.html`;

function findBrowser() {
  return [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].find((p) => p && existsSync(p));
}

function ffmpeg(args) {
  const proc = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, bad) => { proc.on('error', bad); proc.on('close', (c) => (c === 0 ? ok() : bad(new Error(`ffmpeg exited ${c}`)))); });
  return { proc, done };
}

const browser = await puppeteer.launch({
  executablePath: findBrowser(),
  headless: true,
  args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=default', '--enable-webgl', '--hide-scrollbars'],
});

async function open(w, h) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('  page error:', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('  console:', m.text()));
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(`${BASE}?w=${w}&h=${h}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.STAGE, { timeout: 60000 });
  await page.evaluate(() => window.STAGE.ready);
  return page;
}

async function capture(page, fn, t) {
  await page.evaluate((fn, t) => window.STAGE[fn](t), fn, t);
  return page.screenshot({ type: 'png', optimizeForSpeed: true });
}

async function renderSeq({ w, h, fps, dur, fn, out, encode }) {
  const page = await open(w, h);
  const frames = Math.round(dur * fps);
  const { proc, done } = ffmpeg(['-f', 'image2pipe', '-framerate', String(fps), '-i', '-', ...encode, out]);
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    const buf = await capture(page, fn, f / fps);
    if (!proc.stdin.write(buf)) await new Promise((r) => proc.stdin.once('drain', r));
    if ((f + 1) % fps === 0) {
      const rate = (f + 1) / ((Date.now() - t0) / 1000);
      process.stdout.write(`\r  ${fn.padEnd(5)} ${f + 1}/${frames} · ${rate.toFixed(1)} fps · ETA ${Math.round((frames - f - 1) / rate)}s   `);
    }
  }
  proc.stdin.end();
  await done;
  await page.close();
  console.log(`\n  ✓ ${out.replace(ROOT, '.')}  ${((await stat(out)).size / 1048576).toFixed(2)} MB`);
}

const outDir = join(ROOT, 'assets', 'video');
await mkdir(outDir, { recursive: true });

if (PREVIEW) {
  const dir = join(ROOT, '.preview');
  await mkdir(dir, { recursive: true });
  const sq = await open(960, 960);
  for (const t of [0, 2.7, 5.3]) { await sq.evaluate((t) => window.STAGE.loop(t), t); await sq.screenshot({ path: join(dir, `3d-loop-${t}.png`) }); }
  const wide = await open(1920, 1080);
  for (const t of [3, 8, 13, 19, 21.5, 27]) { await wide.evaluate((t) => window.STAGE.reel(t), t); await wide.screenshot({ path: join(dir, `3d-reel-${t}.png`) }); }
  console.log('  ✓ previews in .preview/');
} else {
  if (!ONLY || ONLY === 'loop') {
    console.log('» seamless loop → animated WebP (640×640)');
    const LOOP = 8;
    await renderSeq({
      w: 640, h: 640, fps: 15, dur: LOOP, fn: 'loop', out: join(outDir, 'crow-realm.webp'),
      encode: ['-c:v', 'libwebp_anim', '-loop', '0', '-quality', '80', '-compression_level', '6', '-preset', 'picture'],
    });
  }
  if (!ONLY || ONLY === 'wide') {
    console.log('» seamless loop → wide animated WebP (896×504)');
    await renderSeq({
      w: 896, h: 504, fps: 15, dur: 8, fn: 'loop', out: join(outDir, 'crow-realm-wide.webp'),
      encode: ['-c:v', 'libwebp_anim', '-loop', '0', '-quality', '80', '-compression_level', '6', '-preset', 'picture'],
    });
  }
  if (!ONLY || ONLY === 'reel') {
    console.log('» cinematic showreel → MP4 (1920×1080)');
    const page = await open(1920, 1080);
    const len = await page.evaluate(() => window.STAGE.REEL_LEN);
    await page.close();
    const mp4 = join(outDir, 'showreel.mp4');
    await renderSeq({
      w: 1920, h: 1080, fps: 30, dur: len, fn: 'reel', out: mp4,
      encode: ['-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-tune', 'film', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'],
    });
    // poster with a play button
    const poster = join(outDir, 'showreel.jpg');
    const pp = await open(1920, 1080);
    await pp.evaluate(() => window.STAGE.reel(25.5));
    await pp.evaluate(() => {
      const d = document.createElement('div');
      d.innerHTML = `<div style="position:fixed;left:50%;top:58%;width:150px;height:150px;margin:-75px;border-radius:50%;background:rgba(2,10,6,.55);border:3px solid #3dff86;box-shadow:0 0 50px rgba(61,255,134,.7),inset 0 0 26px rgba(61,255,134,.35)"><div style="position:absolute;left:56px;top:42px;border-left:52px solid #3dff86;border-top:33px solid transparent;border-bottom:33px solid transparent"></div></div>`;
      document.body.appendChild(d);
    });
    await pp.screenshot({ path: poster, type: 'jpeg', quality: 88 });
    console.log(`  ✓ ${poster.replace(ROOT, '.')}`);
  }
}

await browser.close();
server.close();
