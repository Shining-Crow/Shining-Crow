# How this profile dashboard works

`README.md` is **generated**, so don't edit it by hand. Edit `profile.config.json` and rebuild.

| Command | What it does |
| --- | --- |
| `npm run build` | Fetches live GitHub data and regenerates every slide and `README.md` |
| `npm run build:offline` | Same, but reuses `data/github.json` (no network) |
| `npm install && npm run video` | Renders `assets/video/showreel.mp4` (1080p) and its poster `showreel.jpg` |
| `npm run preview` | Writes still frames of every slide to `.preview/` for a quick look |

## The slides (`assets/slides/`)

Every slide is a 1664×936 animated SVG in an emerald HUD style. Because they're pure SVG with CSS and SMIL animation, they play directly on GitHub.

| Slide | Content | Data |
| --- | --- | --- |
| `hero.svg` | Crow emblem, title lockup, live code, GitHub activity, projects, mini-game | **live** |
| `core.svg` | Square animated "system core" with orbiting AI / Web / Mobile / Games | config |
| `universe.svg` | Technology Universe: 4 domain columns | config |
| `ai.svg` | AI Engineering: LLM apps and RAG systems | config |
| `game.svg` | Game Development: arcade viewport, systems, release pipeline | config |
| `architecture.svg` | System Architecture: request flow, service bus, domain cards | config |
| `activity.svg` | Contribution telemetry heatmap, streaks and focus | **live** |
| `projects.svg` | Featured projects and language wall | **live** |

The workflow in `.github/workflows/dashboard.yml` rebuilds the live slides every 6 hours.

## Showreel video

`npm run video` renders the slides into a 1080p MP4 frame by frame in headless Chrome. The README shows the poster image, which links to the MP4. To get an **inline video player** on GitHub:

1. On github.com, open `README.md` → ✏️ Edit, and drag `assets/video/showreel.mp4` into the editor.
2. Copy the `https://github.com/user-attachments/assets/...` URL that GitHub inserts, then cancel the edit.
3. Paste that URL into `video.attachmentUrl` in `profile.config.json` and push.

## Customising

- **Text on every slide**: change it in `profile.config.json`. That covers roles, nav, code panel, tech lists, AI/game/architecture copy, focus cards, featured projects and socials. Social buttons with an empty `url` are hidden.
- **Colours and shared components**: `scripts/lib/ui.mjs`.
- **Video scenes and durations**: `SCENES` in `scripts/render-video.mjs`.
