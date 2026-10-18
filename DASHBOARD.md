# How this profile dashboard works

`README.md` is **generated**, so don't edit it by hand. Edit `profile.config.json` and rebuild.

| Command | What it does |
| --- | --- |
| `npm run build` | Fetches live GitHub data and regenerates every slide and `README.md` |
| `npm run build:offline` | Same, but reuses `data/github.json` (no network) |
| `npm install && npm run video` | Renders the 3D assets: hero crow portrait, `crow-realm.webp` (square loop), `crow-realm-wide.webp` (wide loop), `showreel.mp4` (1080p) and `showreel.jpg`. Run `npm run build` afterwards so the new crow lands in the slides |
| `npm run preview` | Writes 3D preview stills to `.preview/` |

## Design: "Iridescent"

Crow feathers aren't black: they shimmer violet, blue, green and gold. The whole dashboard uses that idea: a near-black canvas, one iridescent spectrum, and **one colour per specialty**:

| Specialty | Colour | Accent key |
| --- | --- | --- |
| AI | violet `#a78bfa` | `ai` |
| Web | cyan `#22d3ee` | `web` |
| Mobile | pink `#f472b6` | `mobile` |
| Games | amber `#fbbf24` | `game` |
| Availability / status | lime `#a3e635` | `lime` |

Anything in the config that takes an `accent` uses those keys. Headlines can colour individual words with `{ai:word}`, `{web:word}` and so on.

## The slides (`assets/slides/`)

The README is ordered like a pitch: who you are, then what you build, then how you work, then proof, then contact. Every slide is a 1664×936 animated SVG that plays directly on GitHub.

| Slide | Purpose | Data |
| --- | --- | --- |
| `hero.svg` | Value proposition, availability, CTAs, live stats, 3D iridescent crow | **live** |
| `services.svg` | What I Build: outcome, deliverables and stack per specialty | config |
| `process.svg` | How I Work: delivery timeline and working principles | config |
| `ai.svg` | AI Engineering: LLM apps and RAG systems | config |
| `game.svg` | Game Development: arcade viewport, systems and pipeline | config |
| `architecture.svg` | System Architecture: request flow and service layers | config |
| `projects.svg` | Selected Work and language wall | **live** |
| `activity.svg` | Contribution heatmap, streaks and current focus | **live** |
| `cta.svg` | "Let's build something remarkable" with contact cards | config |

The hero and CTA slides link to your first contact in `cta.contacts` (your email). The workflow in `.github/workflows/dashboard.yml` rebuilds the live slides every 6 hours.

## 3D (`scripts/3d/`)

`scripts/3d/scene.js` is a Three.js scene. It has a low-poly crow with physically based iridescent feathers (lit by a neon "studio" environment so the black plumage reflects every specialty colour) flying through a synthwave canyon under an aurora, past a striped sun, voxel invaders in the four colours, and a combat sequence ending on a chrome 3D title. Everything is a pure function of time. `scripts/render-3d.mjs` renders it frame by frame in headless Chrome and encodes with ffmpeg, so the 8-second loops are seamless. A transparent portrait of the crow is also rendered and embedded into the hero and CTA slides.

To get an **inline video player** on GitHub:

1. On github.com, open `README.md` → ✏️ Edit, and drag `assets/video/showreel.mp4` into the editor.
2. Copy the `https://github.com/user-attachments/assets/...` URL that GitHub inserts, then cancel the edit.
3. Paste that URL into `video.attachmentUrl` in `profile.config.json` and push.

## Customising

- **All copy**: `profile.config.json`. That covers hero headline, availability, services, process, principles, projects and contacts. Contacts with an empty `value` are hidden. The process and principles are sensible defaults; rewrite them in your own words.
- **Palette and shared components**: `scripts/lib/ui.mjs`.
- **3D scene, camera shots and colours**: `scripts/3d/scene.js` (`SHOTS` and `REEL`).
