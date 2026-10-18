// Shared palette, fonts and SVG helpers for every generated asset.
// SVGs are shown on GitHub through <img>, so: no JS, no web fonts — only
// system font stacks, CSS keyframes and SMIL animations.

export const C = {
  bg0: '#05060f',
  bg1: '#0b1028',
  panel: '#0b1124',
  panelHi: '#111a36',
  line: '#1e2a4a',
  cyan: '#22d3ee',
  violet: '#a855f7',
  magenta: '#ec4899',
  gold: '#fbbf24',
  green: '#34d399',
  text: '#e2e8f0',
  muted: '#8b9bb8',
};

export const SANS = "'Segoe UI', 'Inter', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'JetBrains Mono', 'Cascadia Code', 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace";

export const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399',
  SCSS: '#c6538c', Python: '#3572A5', 'C#': '#178600', 'C++': '#f34b7d', C: '#555555',
  Dart: '#00B4AB', Kotlin: '#A97BFF', Swift: '#F05138', Go: '#00ADD8', Rust: '#dea584',
  Java: '#b07219', GDScript: '#355570', ShaderLab: '#222c37', HLSL: '#aace60', GLSL: '#5686a5',
  Vue: '#41b883', Svelte: '#ff3e00', PHP: '#4F5D95', Ruby: '#701516', Shell: '#89e051',
  'Jupyter Notebook': '#DA5B0B', Dockerfile: '#384d54', Lua: '#000080',
};
export const langColor = (l) => LANG_COLORS[l] || C.violet;

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const fmt = (n) => Number(n).toLocaleString('en-US');

// Deterministic PRNG so rebuilds don't churn git diffs.
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// SMIL helper: toggles `display` so hidden glyphs take no layout space.
// That lets a trailing cursor follow typed text exactly, whatever font renders.
export function showBetween(start, end, T) {
  const a = Math.max(0.001, start / T).toFixed(4);
  const b = Math.min(0.999, end / T).toFixed(4);
  return `<animate attributeName="display" values="none;inline;none" keyTimes="0;${a};${b}" dur="${T}s" calcMode="discrete" repeatCount="indefinite"/>`;
}

// Word-wrap by character budget (approximate — fine for short descriptions).
export function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

export const svg = (w, h, body, title = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"${
    title ? ` aria-label="${esc(title)}"` : ''
  }>${title ? `<title>${esc(title)}</title>` : ''}${body}</svg>\n`;
