# Reproduction book

How to rebuild **TramTracker 2088 — Melbourne Yarra Trams 3D Simulator** from scratch, or
re-verify that a rebuild matches the published release. Read
[ARCHITECTURE.md](ARCHITECTURE.md) first for the loop, driving and passenger map.

> **The source is the truth.** `main` at HEAD is the release. There is no bundle, package
> manager or tagged version. Rebuild only when the files are unavailable or you
> deliberately want a variant.

## 1. What is being reproduced

A static, three-file 3D tram simulator:

- **World** — a 1,346 m Hoddle-Grid loop through Swanston, Flinders, St Kilda Road, the
  Domain, Spring/Exhibition, Collins, Victoria and La Trobe/Queensberry; embankment,
  two rail bridges, overhead catenary, street grid, footpaths, crossings and a painted
  hook-turn box.
- **Landmarks** — Flinders Street Station, Federation Square, Princes Bridge and the
  Yarra, Southbank, Melbourne University, Parliament House, RMIT, Collins Street, the
  Princess Theatre, Fitzroy and Carlton gardens, Old Treasury, Melbourne Museum, Queen
  Victoria Market, Melbourne Central, Town Hall, Hosier Lane, St Paul's and the Shrine of
  Remembrance.
- **Tram** — a green/cream/gold W-Class / Cyber-Tram 2088 with destination signs, lights,
  bogies, pantograph, bell, sliding doors and neon underglow.
- **Driving** — rail guidance, traction, brake, separate reverse, handbrake, curve drag,
  wheel screech, rail clatter, a Cannon.js 12,000 kg body and impact penalties.
- **Doors and passengers** — manual door release within 9.5 m of the next stop and below
  1.4 m/s (about 5 km/h), door/traction interlock, Myki beeps, destination manifests,
  pull-the-cord requests, alighting and boarding animations, perfect-stop bonus.
- **Auto driver** — a computer driver that serves every stop, works the doors, dwells and
  departs, with instant manual takeover.
- **Views** — chase orbit camera and a first-person cab with glass cockpit, speed FOV,
  head sway, curve lean and rain wipers.
- **Weather** — sunny, rain and twilight, interpolating sky, fog, sun, exposure, windows,
  lamps, water, puddles, rain, stars and thunder.
- **Audio** — synthesised bell, Myki, chimes, screech, clatter, city bed (traffic, crowd,
  birds, distant trams, horns, wind), rain, thunder, UI, success and fail; en-AU
  announcements via SpeechSynthesis.
- **Hook Turn Challenge** — a separate 60 s, three-attempt mini-game with trams, bikes,
  signals, collisions, violations and a result card.
- **Career** — nine badges, best score, passengers, trips, loops, distance, hook best,
  weather and mute, persisted in `localStorage` and exported as `tramtracker_save.json`.
- **Delivery** — `index.html` + `style.css` + `script.js`; Three.js r128, OrbitControls and
  Cannon 0.6.2 from CDNs; no build, backend, analytics or CI.

## 2. Requirements matrix

| # | Requirement | Implementation | Where |
| ---: | --- | --- | --- |
| 1 | 1.35 km closed Hoddle-Grid loop | `buildCurve`, `roundedLoopPoints` | `script.js` |
| 2 | 21 named Melbourne stops | `STOP_DEFS`, `STOP_ROUTE_ORDER`, `buildStops` | `script.js` |
| 3 | Rails, slab, sleepers and catenary | `buildTrackWork`, `bar`, `ribbonGeometry` | `script.js` |
| 4 | Procedural city and landmarks | `buildCity`, `buildStation`, `buildFederationSquare`, … | `script.js` |
| 5 | Tram mesh and lights | `buildTram` | `script.js` |
| 6 | Rail-guided traction/brake/reverse | `updateTram`, `tram.maxSpeed`/`maxReverse` | `script.js` |
| 7 | Cannon body and impact penalties | `initPhysics`, `onTramImpact` | `script.js` |
| 8 | Manual doors + interlock | `toggleDoors`, `openDoors`, `closeDoors`, `updateDoors` | `script.js` |
| 9 | Passenger manifests, requests, alighting | `assignDestination`, `alightPassengers`, `boardPassengers` | `script.js` |
| 10 | Myki scoring and perfect stop | `boardPassengers`, `serviceStop` | `script.js` |
| 11 | Announcements and subtitles | `announce`, `showAnnouncement`, `AudioEngine.speak` | `script.js` |
| 12 | Stop guide cards and Wikipedia links | `showStopGuide`, `STOP_DEFS.nearby/wiki` | `script.js` |
| 13 | Auto driver | `setAutoDrive`, `updateAutoDriver` | `script.js` |
| 14 | Chase and cab views | `setupCamera`, `setViewMode`, `updateDriverCamera` | `script.js` |
| 15 | Weather presets | `WEATHERS`, `applyWeather`, `updateWeather` | `script.js` |
| 16 | Synthesised audio | `AudioEngine` | `script.js` |
| 17 | Hook-turn mini-game | `HookTurnGame` | `script.js` |
| 18 | Career save/export/import | `defaultSave`, `sanitizeSave`, `exportSave`, `importSave` | `script.js` |
| 19 | HUD, minimap and mobile panels | `updateHud`, `drawMinimap`, CSS 2144–2312 | `script.js`, `style.css` |
| 20 | Built-in verification | `runSelfTests` (`?selftest=1`) | `script.js` |

## 3. Build order

1. **Shell** — head/meta/fonts, canvas, loading screen, top bar, weather switch, telemetry,
   stop guide, toolbar, touch pads, start screen, hook overlay.
2. **Theme** — Yarra green/gold + neon glass, HUD, toolbars, modals, start screen, cab,
   doors, stop guide, mobile panels and responsive breakpoints.
3. **Engine** — renderer, scene, camera, OrbitControls, lights, sky shader, fog.
4. **Loop** — Hoddle-Grid vertices, rounded corners, Catmull-Rom curve, measured length,
   stop arc lengths.
5. **Ground and track** — roads, footpaths, crossings, rails, slab, sleepers, catenary.
6. **Landmarks** — station, Federation Square, Yarra/bridge, university, Parliament, RMIT,
   gardens, markets, museum, Town Hall, lanes, cathedral, Shrine.
7. **City** — procedural buildings, street props, traffic, trees and lights.
8. **Stops and riders** — 21 platforms, signs, shelters, waiting passengers.
9. **Tram** — mesh, cab, doors, lights, pantograph, bell.
10. **Driving** — controls, speed model, rail following, Cannon body, impacts.
11. **Passengers** — manifests, requests, boarding/alighting, Myki, scoring, announcements.
12. **Weather/audio** — presets, rain FX, city bed, speech, chimes.
13. **Hook turn** — separate scene/session, signals, collisions, result.
14. **Persistence/UI** — save schema, badges, HUD, minimap, mobile panels, export/import.
15. **Verification and docs** — 33-check harness, screenshots, README, this set.

## 4. Acceptance checks

A rebuild is done when all of these pass:

1. `python3 -m http.server 8080` serves the page; the loader clears and the start screen
   appears.
2. `?selftest=1&autostart=1` reports **33 / 33 PASS** and writes
   `document.body.dataset.selftest = "pass"`.
3. The self-test details include **568 scene objects**, **1,346 m loop**, **21 stops,
   minimum 30 m spacing**, **100 waiting riders**, **55 tram parts**, **12,000 kg body**,
   **204 catenary pieces**, **9 badges** and **3 weather presets**.
4. Traction moves the tram (about 6 m in the scripted 150-step run); opening doors boards
   passengers (4 in the current run) and closing them restores traction.
5. Driver-cab view switches, FOV/handoff works, and the cab look returns to the road.
6. Weather cycles sunny → rain → twilight → sunny; the auto driver serves a stop.
7. The hook-turn scene opens with 60 s and three attempts; collisions/violations behave.
8. Save schema validates; export downloads `tramtracker_save.json`; import merges.
9. Desktop screenshots render at 1600 × 1000; mobile at 390 × 844 has
   `scrollWidth === innerWidth` and usable touch controls.
10. The live `index.html`, `style.css` and `script.js` hashes match the local files.
11. No uncaught errors during boot/self-test.

Record what you actually run in [TESTING.md](TESTING.md), including the CDN failure note.

## 5. Provenance

| Item | Value |
| --- | --- |
| Initial build | `f283717` "TramTracker 2088: complete Melbourne Yarra Trams 3D simulator" |
| Driver cab | `5153d88` "feat: add first-person driver cab view" |
| Stop guides / names | `6280d33` "feat: add stop guides, real stop names and richer city ambience" |
| Passenger requests / tourist stops | `751dbcd` "feat: add passenger stop requests, alighting and five tourist stops" |
| 21-stop Shrine extension | `852bb9e` "feat: extend loop to 21 stops with Shrine, mobile panels and door interlock" |
| Auto driver | `e5f97a2` "feat: add auto driver mode with platform servicing" |
| Latest source commit | `a25c9fd` "fix: auto driver yields to manual input with doors open" |
| Release docs | this commit (`AGENTS.md` + `docs/`) |
| Three.js | r128, MIT, cdnjs |
| OrbitControls | r128, MIT, jsDelivr |
| Cannon.js | 0.6.2, MIT, cdnjs |
| Fonts | Orbitron, Rajdhani, Google Fonts, SIL OFL 1.1 |
| Author | Somphol Boonjing, MIT |

There is no tagged release and no build artefact. `CHANGELOG.md` is the change record;
`STATE.md` / `state.json` are the 2026-11-01 build receipt and are not regenerated by
later commits.
