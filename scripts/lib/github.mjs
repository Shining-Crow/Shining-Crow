// Collects everything the dashboard needs from public GitHub endpoints.
// Works without a token (60 req/h is plenty); uses GITHUB_TOKEN when present.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const API = 'https://api.github.com';
const headers = {
  'User-Agent': 'shining-crow-profile-dashboard',
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function get(url, as = 'json') {
  const res = await fetch(url, { headers: as === 'json' ? headers : { 'User-Agent': headers['User-Agent'] } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  if (as === 'json') return res.json();
  if (as === 'text') return res.text();
  return Buffer.from(await res.arrayBuffer());
}

// Parses github.com/users/<u>/contributions (the public calendar fragment).
export function parseCalendar(html) {
  const days = [];
  const tips = new Map();
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) tips.set(m[1], m[2]);
  for (const m of html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const id = tag.match(/id="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    if (!date) continue;
    const tip = tips.get(id) || '';
    const count = /^No contributions/.test(tip) ? 0 : Number((tip.match(/^([\d,]+)/)?.[1] || '0').replace(/,/g, ''));
    days.push({ date, level, count });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

export function streaks(days) {
  let longest = 0, run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Current streak: today may still be empty without breaking the streak.
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { current, longest };
}

export async function collect(cfg, { offline = false, cachePath }) {
  if (offline) return JSON.parse(await readFile(cachePath, 'utf8'));

  const u = cfg.username;
  const user = await get(`${API}/users/${u}`);
  const repos = (await get(`${API}/users/${u}/repos?per_page=100&type=owner&sort=updated`)).filter((r) => !r.fork);

  const languages = {};
  for (const r of repos) {
    try {
      const langs = await get(r.languages_url);
      for (const [k, v] of Object.entries(langs)) languages[k] = (languages[k] || 0) + v;
    } catch (e) {
      console.warn('  ! languages:', r.name, e.message);
    }
  }

  let days = [];
  try {
    days = parseCalendar(await get(`https://github.com/users/${u}/contributions`, 'text'));
  } catch (e) {
    console.warn('  ! contributions calendar:', e.message);
  }

  let avatar = '';
  try {
    avatar = 'data:image/png;base64,' + (await get(`${user.avatar_url}&s=200`, 'buffer')).toString('base64');
  } catch (e) {
    console.warn('  ! avatar:', e.message);
  }

  const data = {
    fetchedAt: new Date().toISOString(),
    user: {
      login: user.login, name: user.name || user.login, followers: user.followers, following: user.following,
      publicRepos: user.public_repos, createdAt: user.created_at, avatar,
    },
    repos: repos.map((r) => ({
      name: r.name, description: r.description, language: r.language, stars: r.stargazers_count,
      forks: r.forks_count, url: r.html_url, homepage: r.homepage, updatedAt: r.pushed_at || r.updated_at, topics: r.topics || [],
    })),
    languages,
    days,
  };
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(data, null, 1));
  return data;
}
