// Builds every dashboard slide + README.md.
//   node scripts/build.mjs            fetch fresh GitHub data
//   node scripts/build.mjs --offline  reuse data/github.json
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { collect } from './lib/github.mjs';
import { heroSlide } from './slides/hero.mjs';
import { servicesSlide } from './slides/services.mjs';
import { processSlide } from './slides/process.mjs';
import { aiSlide } from './slides/ai.mjs';
import { gameSlide } from './slides/game.mjs';
import { architectureSlide } from './slides/architecture.mjs';
import { activitySlide } from './slides/activity.mjs';
import { projectsSlide } from './slides/projects.mjs';
import { ctaSlide } from './slides/cta.mjs';
import { readme } from './lib/readme.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (...p) => join(ROOT, ...p);
const offline = process.argv.includes('--offline');

const cfg = JSON.parse(await readFile(out('profile.config.json'), 'utf8'));
await mkdir(out('assets', 'slides'), { recursive: true });

const write = async (rel, content) => {
  await writeFile(out(rel), content);
  console.log(`  ✓ ${rel.padEnd(32)} ${(Buffer.byteLength(content) / 1024).toFixed(1)} KB`);
};

console.log(offline ? '» using cached GitHub data' : `» fetching GitHub data for @${cfg.username}`);
let data;
try {
  data = await collect(cfg, { offline, cachePath: out('data', 'github.json') });
} catch (e) {
  console.warn(`  ! fetch failed (${e.message}) — falling back to cache`);
  data = await collect(cfg, { offline: true, cachePath: out('data', 'github.json') });
}

// The 3D crow portrait (rendered by `npm run video`) is embedded so each SVG stays self-contained.
const crowPath = out('assets', '3d', 'crow-hero.webp');
const crowImg = existsSync(crowPath) ? `data:image/webp;base64,${(await readFile(crowPath)).toString('base64')}` : '';
if (!crowImg) console.warn('  ! assets/3d/crow-hero.webp missing — run `npm run video` for the 3D crow');

console.log('» generating slides');
await write('assets/slides/hero.svg', heroSlide(cfg, data, crowImg));
await write('assets/slides/services.svg', servicesSlide(cfg));
await write('assets/slides/process.svg', processSlide(cfg));
await write('assets/slides/ai.svg', aiSlide(cfg));
await write('assets/slides/game.svg', gameSlide(cfg));
await write('assets/slides/architecture.svg', architectureSlide(cfg));
await write('assets/slides/activity.svg', activitySlide(cfg, data));
await write('assets/slides/projects.svg', projectsSlide(cfg, data));
await write('assets/slides/cta.svg', ctaSlide(cfg, crowImg));
await write('README.md', readme(cfg, data));

const total = data.days.reduce((s, d) => s + d.count, 0);
console.log(`» done — ${total} contributions · ${data.repos.length} repos · ${Object.keys(data.languages).length} languages`);
