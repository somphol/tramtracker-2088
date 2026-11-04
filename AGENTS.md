# AGENTS.md — TRAMTRACKER 2088

> Handoff for the next maintainer or agent. The rebuild book is
> [docs/REPRODUCTION.md](docs/REPRODUCTION.md); the technical map is
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); evidence is
> [docs/TESTING.md](docs/TESTING.md).

## 1. What this is

A static, three-file **3D Melbourne tram simulator**: `index.html`, `style.css` and a
6,976-line IIFE in `script.js`, with **Three.js r128**, OrbitControls and **Cannon.js
0.6.2** from CDNs. A W-Class / Cyber-Tram 2088 runs a 1,346 m Hoddle Grid loop through
21 named Melbourne stops, from Flinders Street and the Shrine extension to Queen Victoria
Market and Town Hall. The tram is rail-guided; the player controls traction, brake,
reverse, bell, doors and camera. Passengers tap on with Myki beeps, request stops and
alight; doors interlock with traction; a computer auto-driver can serve the route; three
weather presets change sky, fog, rain, lamps and city sound; a separate hook-turn
mini-game and a persistent career/badge save complete the package. Everything is
procedural — no models, textures or audio files.

It is **not** an official Yarra Trams product, not a professional driver-training
simulator, not multiplayer, not native, and **not offline-capable**: the first load needs
Three.js, OrbitControls, Cannon.js and Google Fonts. It is **not** a walking simulator;
the tram is rail-guided except in the hook-turn mini-game.

Live copy: <https://somphol.github.io/tramtracker-2088/>. Local master:
`~/Projects/tramtracker-2088`. App version **1.2.1** (`script.js:14`); there is no git tag.
Latest source commit at the time of writing: `a25c9fd`.

## 2. Commands

```bash
cd ~/Projects/tramtracker-2088

# run
python3 -m http.server 8080
open http://localhost:8080/

# built-in self-test: 33 checks
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-gl=angle --use-angle=swiftshader \
  --enable-unsafe-swiftshader --mute-audio \
  --virtual-time-budget=30000 --timeout=45000 \
  --dump-dom "http://localhost:8080/?selftest=1&autostart=1" > /tmp/tram-dom.html
grep -o 'data-selftest="[^"]*"' /tmp/tram-dom.html
grep -o '33/33' /tmp/tram-dom.html

# one frame
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-gl=angle --use-angle=swiftshader \
  --enable-unsafe-swiftshader --mute-audio \
  --virtual-time-budget=25000 --timeout=40000 --window-size=1600,1000 \
  --screenshot=/tmp/tram.png "http://localhost:8080/?shot=1&autostart=1"

# live probe
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/tramtracker-2088/

# deploy — Pages serves the repository root of main; no workflow
git push origin main
```

Useful query parameters: `?selftest=1`, `?autostart=1`, `?weather=rain|twilight|sunny`,
`?fresh=1`, `?shot=1`, `?view=station|fed|tram|yarra|uni`. Headless WebGL needs the
SwiftShader flags above; do not assume `--use-angle=metal` works for this project. There is
no build step, no package manager and no CI.

## 3. Architecture

| File | Lines | Role |
| --- | ---: | --- |
| `index.html` | 379 | head/meta/fonts (1–30), canvas/cab/loading (31–64), top bar (65–92), telemetry (93–171), stop guide (172–194), toolbar (195–235), start screen (236–314), hook overlay (315–370), self-test/scripts (371–377) |
| `style.css` | 2,312 | base (1–124), glass (125–177), top bar (178–326), telemetry (327–523), minimap (524–565), stop prompt (566–617), toolbar (618–665), toasts (666–720), touch (721–769), start (770–940), modals (941–1096), hook turn (1097–1246), loading (1247–1276), flash (1277–1313), responsive (1314–1436), cab (1437–1692), doors/announcements (1693–1812), stop guide (1813–2008), manifest/requests (2009–2143), mobile panels/interlock (2144–2312) |
| `script.js` | 6,976 | constants/save/audio/TramApp/HookTurnGame, sections below |
| `state.json`, `STATE.md` | — | build receipt and token snapshot |
| 29 `screenshot*.png` | — | README images (about 23 MB total) |

`script.js` top-level sections:

| Section | Lines | Subject |
| --- | --- | --- |
| Constants | 10–227 | `VERSION`, save keys, `WEATHERS`, `BADGES`, `STOP_DEFS`, palette, query params |
| Utilities | 228–334 | geometry, math, DOM and formatting helpers |
| Save data | 335–395 | `defaultSave`, `sanitizeSave`, `loadSaveFromStorage` |
| Web Audio | 396–1013 | `AudioEngine` |
| Main application | 1020–6190 | `TramApp` |
| Hook Turn Challenge | 6193–6976 | `HookTurnGame` |

Key paths:

- **Save/identity** — `VERSION = '1.2.1'`, `SAVE_KEY = 'tramtracker_2088_v1'`,
  `SAVE_FILE = 'tramtracker_save.json'` (`script.js:14–17`); weather table 21, badges
  45, twenty-one stop definitions 57, route order 207.
- **TramApp** — constructor 1025, DOM cache 1192, UI bindings 1321, keyboard 1412,
  serialise/persist 1492/1510, export/import 1523/1543, HUD 1582, badge logic 1684–1740,
  start 1750, next stop 1787, Three bootstrap 1817, curve 1930, sky 2022, lighting 2108,
  ground/roads 2146/2195, track 2344, landmarks 2480–3990, city 3080, stops 4228,
  passengers 4378, tram mesh 4429, physics 4639, weather 4735, auto driver 4961,
  `updateTram` 5052, announcements 5202, stop guide 5218, doors 5308–5516, views
  5605–5684, minimap 5770, loop 5907, self-test 5985.
- **Rail loop** — `buildCurve()` (`script.js:1930`) rounds ten Hoddle-Grid vertices into
  a closed Catmull-Rom loop, measures it (**1,346 m**), resolves each stop to an arc
  length, and places its platform 4.2 m outward. `distanceAt()` and `headingAtDistance()`
  keep the HUD, minimap and tram aligned.
- **Driving** — `updateTram()` (5052) applies traction `+1.95 m/s²`, brake
  `−4.6 m/s²`, reverse, handbrake and rolling drag, clamps to `maxSpeed 13.4` /
  `maxReverse −3.4 m/s`, and blocks all traction while doors are not `closed`. The
  auto driver (`setAutoDrive`, `updateAutoDriver`, 4961–5051) targets platform speed,
  opens/closes doors, dwells and departs; any manual input returns control.
- **Physics** — `initPhysics()` (4639) uses Cannon with gravity −9.82, SAP broadphase,
  10 solver iterations, a ground plane, static obstacle boxes and a 12,000 kg tram body
  (1.32 × 1.5 × 5.0 m box, fixed rotation, no sleep). Impacts above a 2.5 s cooldown cut
  speed by 55% and play a crash sting.
- **Passengers/doors** — `toggleDoors`/`openDoors`/`closeDoors` (5308–5362) drive
  `closed → opening → open → closing`; only a platform stop below 2 km/h opens. Onboard
  manifests (`assignDestination`), stop requests (`updateTram`), alighting
  (`alightPassengers`), boarding (`boardPassengers`) and Myki beeps are in 5363–5515.
- **Weather/audio** — `WEATHERS` (21), `applyWeather`/`updateWeather` (4757/4786),
  `AudioEngine` (400) synthesises bell, Myki, screech, clatter, city bed, rain, thunder,
  horn, chimes and speech (en-AU via SpeechSynthesis).
- **Hook turn** — `HookTurnGame` (`script.js:6193`) builds its own scene, session, 60 s
  timer, signals, trams/bikes, collision/violations and result card.
- **Verification** — `runSelfTests()` (5985) runs 33 checks and writes
  `#selftestOut`, `document.body.dataset.selftest` and the console.

## 4. Decisions and constraints

- **Three static files, no build.** Keep `index.html` + `style.css` + `script.js` as the
  delivery format. Do not add npm, modules or a bundler without a product decision.
- **The app is procedural.** No image, texture, audio or model assets are loaded. Keep
  canvas textures and Web Audio synthesis; adding assets changes the load contract.
- **The tram is rail-guided by design.** Steering belongs to the curve; the player owns
  traction/brake/reverse and the camera. The hook-turn car is the only steered vehicle.
- **Speed is metres per second.** `maxSpeed = 13.4`, `maxReverse = −3.4`; the HUD
  converts to km/h. Do not mix units in new physics code.
- **The loop and stop order are a shared contract.** `STOP_DEFS` (21), `STOP_ROUTE_ORDER`
  and arc-length placement drive the HUD, announcements, minimap, badge checks and
  self-tests. Changing one means re-running the spacing check.
- **Doors interlock with traction.** `updateTram()` zeroes speed while `doorState` is not
  `closed`; keep the warning and cab message in sync.
- **The save schema is versioned.** Key `tramtracker_2088_v1`, `version: 1`, stats,
  badges, settings. `sanitizeSave()` clamps numbers, drops unknown badges and validates
  weather. Import merges career values with `max()`, not overwrite.
- **Audio starts on the CLOCK ON gesture.** Do not autoplay; browsers block it.
- **The hook-turn game is separate.** It has its own renderer/scene/session and must not
  leak state into the main loop.
- **The query parameters are test surfaces.** `?selftest`, `?autostart`, `?weather`,
  `?fresh`, `?shot`, `?view` are intentionally supported; keep them working for
  screenshots and regression checks.
- **Docs-only changes should not touch the three source files.** Pages serves `main`
  directly; there is no staging build.

## 5. Known issues

- **CDN failure does not show the claimed graceful message.** With `cdnjs.cloudflare.com`
  and `cdn.jsdelivr.net` blocked, `script.js` throws at top-level `new THREE.Vector3`
  before `TramApp` can call `fatal()`. The page stays on the loader at
  “Wiring the overhead…”. The README claims a clear fallback; that is **not** what the
  current code does. Verified 2026-11-03.
- **The README contradicts the harness count.** The self-test section calls it a
  **29-check** harness; the run reports **33/33**, the badge says 33/33 and `STATE.md`
  says 33. Trust the run/`STATE.md`.
- **The stop-spacing test is looser than the prose.** The README says the closest pair is
  about 30 m; `runSelfTests()` only fails below **24 m**. The current build reports 30 m,
  but a 24–29 m regression would pass.
- **A verification bullet says “Thai-style stop announcements.”** The code uses
  `utterance.lang = 'en-AU'` and prefers an Australian voice. This is a README typo.
- **Door release is faster than documented.** `getPlatformStop()` accepts the next stop
  within 9.5 m and `|speed| < 1.4 m/s` (about **5 km/h**). The README says “below
  2 km/h”; the code does not enforce that.
- **Runtime CDN dependency.** Three.js, OrbitControls, Cannon.js and Google Fonts are
  remote; the script tags have no `integrity`. The app is not offline-capable.
- **Only Chromium headless was verified.** Safari, Firefox, Edge, real iOS/Android,
  touch, HiDPI and screen-reader output are unverified.
- **Accessibility is partial.** Most buttons and live regions are labelled; the 3D canvas
  has no `aria-label`, modals set `aria-modal` without a focus trap, and the visual sim
  has no text alternative. No screen-reader pass was run.
- **No CI.** The 33-check harness is manual; there is no workflow and no package manager.
- **The hook-turn game is tested for scene readiness, not played to completion** in the
  current harness; collisions, violations and the result card are code-verified only.
- **`state.json` is a snapshot.** It is current for the 1.2.1 source at the time of
  writing but is not regenerated by later docs commits.
- **The docs set was missing before this release.** There was no `AGENTS.md` and no
  `docs/`; this commit adds the full set and the README index. The application source is
  unchanged.

## 6. Continuity

- Live: <https://somphol.github.io/tramtracker-2088/> (HTTP 200 at the time of writing).
- Pages: `main` branch, repository root, `.nojekyll` present, no Actions workflow.
- Repository: <https://github.com/somphol/tramtracker-2088>.
- Local master copy: `~/Projects/tramtracker-2088`.
- Initial build: commit `f283717` "TramTracker 2088: complete Melbourne Yarra Trams 3D
  simulator".
- Latest source commit before the documentation release: `a25c9fd` "fix: auto driver
  yields to manual input with doors open".
- Documentation release: the commit adding this file and `docs/`.
- Author: Somphol Boonjing, MIT. Three.js, OrbitControls and Cannon.js are MIT; Orbitron
  and Rajdhani are SIL OFL. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
