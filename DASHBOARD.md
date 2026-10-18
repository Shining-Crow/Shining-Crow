# How this profile dashboard works

`README.md` is **generated**, so don't edit it by hand. Edit `profile.config.json` and rebuild.

| Command | What it does |
| --- | --- |
| `npm run build` | Fetches live GitHub data and regenerates every slide and `README.md` |
| `npm run build:offline` | Same, but reuses `data/github.json` (no network) |
| `npm install && npm run video` | Renders the real-time 3D scene: `crow-realm.webp` (square loop), `crow-realm-wide.webp` (wide loop), `showreel.mp4` (1080p cinematic) and `showreel.jpg` |
| `npm run preview` | Writes 3D preview stills to `.preview/` |

## The slides (`assets/slides/`)

Every slide is a 1664×936 animated SVG in an emerald HUD style. Because they're pure SVG with CSS and SMIL animation, they play directly on GitHub.

| Slide | Content | Data |
| --- | --- | --- |
| `hero.svg` | Crow emblem, title lockup, live code, GitHub activity, projects, mini-game | **live** |
| `universe.svg` | Technology Universe: 4 domain columns | config |
| `ai.svg` | AI Engineering: LLM apps and RAG systems | config |
| `game.svg` | Game Development: arcade viewport, systems, release pipeline | config |
| `architecture.svg` | System Architecture: request flow, service bus, domain cards | config |
| `activity.svg` | Contribution telemetry heatmap, streaks and focus | **live** |
| `projects.svg` | Featured projects and language wall | **live** |

The workflow in `.github/workflows/dashboard.yml` rebuilds the live slides every 6 hours.

## 3D video (`scripts/3d/`)

`scripts/3d/scene.js` is a Three.js scene, "Crow's Realm". It has a procedural low-poly crow with flapping wings and light trails, an endless neon canyon under an aurora, a moon and a hex portal, voxel space invaders, a combat sequence with laser bolts and explosions, and an extruded 3D title, all rendered with bloom. Every element is a pure function of time. `scripts/render-3d.mjs` drives headless Chrome (WebGL) frame by frame and encodes with ffmpeg, so the 8-second loop is seamless.

The square loop sits in the intro, next to your bio. The wide loop animates in the Showreel section and links to the full MP4. To get an **inline video player** on GitHub:

1. On github.com, open `README.md` → ✏️ Edit, and drag `assets/video/showreel.mp4` into the editor.
2. Copy the `https://github.com/user-attachments/assets/...` URL that GitHub inserts, then cancel the edit.
3. Paste that URL into `video.attachmentUrl` in `profile.config.json` and push.

## Customising

- **Text on every slide**: change it in `profile.config.json`. That covers roles, nav, code panel, tech lists, AI/game/architecture copy, focus cards, featured projects and socials. Social buttons with an empty `url` are hidden.
- **Colours and shared components**: `scripts/lib/ui.mjs`.
- **Video scenes and durations**: `SCENES` in `scripts/render-video.mjs`.
