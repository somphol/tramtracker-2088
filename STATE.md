# Build State

| Field | Value |
| --- | --- |
| Project | TramTracker 2088 — Melbourne Yarra Trams 3D Simulator (`tramtracker-2088`) |
| Started | 2026-11-01 16:59:53 UTC |
| Packaged | 2026-11-01 19:39:26 UTC |
| Duration | **2h 39m 33s** (9,573 seconds) |
| Harness | OpenCode 2.2.5 |
| Model | DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`) |
| Session | `ses_e67f25924ffeV87ZCfDRsei45y` |
| Repository | <https://github.com/somphol/tramtracker-2088> |
| Live demo | <https://somphol.github.io/tramtracker-2088/> |

## Token usage

| Metric | Tokens |
| --- | ---: |
| Input | 728,905 |
| Output | 182,998 |
| Reasoning | 251,269 |
| **Total (input + output + reasoning)** | **1,163,172** |
| Cache read | 82,859,904 |
| Cache write | 1,190 |
| Total including cache | 84,024,266 |

> Snapshot taken from the OpenCode session record when the project was packaged at 2026-11-01 19:39:26 UTC. It includes the original build, the track-spin fix, the first-person driver's cab view, manual doors/announcements and the extended CBD loop. The final state-file commit, push, Pages re-verification and closing response happen outside this snapshot, so the live session totals will be marginally higher. Total cost reported by the session: **$0.00**.

## Revisions after the first package

1. **Track-spin fix** — the loop had duplicate control points at straight/arc junctions, which caused ~180° tangent flips and a 360° spin at corners. Duplicates were removed (131 → 123 control points), heading now uses a 2.4 m chord, and a per-frame angular cap prevents snaps. Maximum tangent change dropped from 167–180° to 1.82°.
2. **Driver's cab view** — added a first-person cab (`V`) with a cockpit overlay, drag-to-look, speed-reactive FOV, head sway, curve lean and animated rain wipers.
3. **Manual doors and announcements** — added `O` / **Doors** control, sliding door geometry, opening and closing chimes, a door/traction interlock, and en-AU spoken next-stop, arrival and door-closing announcements with subtitles.
4. **CBD extension** — rebuilt the loop as a 518 m Hoddle Grid route through Swanston, Flinders, Spring/Exhibition, Collins, Spring North and La Trobe/Queensberry, adding Collins Street, Parliament and RMIT stops plus Parliament House, RMIT and Collins Street landmarks. Self-tests increased to 28 checks.

## What was built

A complete, self-contained 3D tram simulator in three modular source files plus documentation, screenshots and community files.

### Core requirements

- **Melbourne street grid** — an extended Hoddle Grid loop through Swanston, Flinders, Spring/Exhibition, Collins, La Trobe/Queensberry and the surrounding blocks, with footpaths, crossings, tram stop platforms and a painted hook-turn box.
- **Flinders Street Station** — textured arched façade, cream hall, green copper dome, clock tower, side elevations and corner entrance.
- **Federation Square** — panelled deconstructivist shards with neon edges, a public screen facing Swanston Street, plaza paving, amphitheatre and shard sculpture.
- **Yarra River** — animated water, Princes Bridge, promenade, Southbank skyline and the Melbourne University portico.
- **Rails and catenary** — 518 m closed CBD loop, two embedded steel rails, sleepers, contact and messenger wires, droppers and poles.
- **W-Class / Cyber-Tram 2088** — green hull, cream roof, gold waistline, window band, destination signs, headlights, bogies, pantograph, neon underglow and a bell.
- **Cannon.js physics** — 12,000 kg dynamic tram body, static collision volumes, contact events, rail-following velocity, acceleration, braking, curve drag and impact penalties.
- **Keyboard/touch controls** — `W`/`↑` traction, `S`/`↓` brake and reverse; rail guidance is automatic; mouse/touch orbit camera; `C` recentre.
- **First-person driver's cab** — `V` toggles between chase and cab views, with a cockpit dashboard, drag-to-look, speed FOV, head sway, curve lean and rain wipers.
- **Manual doors and announcements** — `O` or **Doors** opens/closes the sliding doors at a platform, with chimes, hiss, a safety interlock and spoken Melbourne-style stop/arrival/door announcements and subtitles.
- **Tram bell** — `B` synthesises the double-ding bell.
- **Passenger pickup** — seven named stops with shelters, waiting commuters, umbrellas in rain, animated boarding, Myki beeps and scoring.
- **Hook Turn Challenge** — a separate 60-second top-down intersection with active trams, bikes, traffic signals, a hook-turn box, three attempts, collision detection, violations and a result card.
- **Weather presets** — instant sunny, sudden-rain and twilight transitions across sky shader, fog, sun, exposure, windows, lamps, water, rain, stars, thunder and lightning.
- **Web Audio synthesis** — bell, Myki, wheel screech, rail clatter, city hum, rain, thunder, UI clicks, success and failure stings.
- **Persistence** — automatic `localStorage` career save, `tramtracker_save.json` export, validated merge import, nine badges and best-score tracking.
- **UI/UX** — Yarra green and gold with cyberpunk neon glass HUD, conic speedometer, live minimap, next-stop prompts, toasts, modals, touch controls and responsive desktop/mobile layouts.

### Extras

- 17 screenshots: hero, start, rain, twilight, station, Federation Square, university, Yarra, hook turn, mobile, doors, driver/cab, CBD overview, Collins, Parliament and RMIT.
- `README.md`, MIT `LICENSE`, `THIRD_PARTY_NOTICES.md`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `.nojekyll` and `.gitignore`.
- GitHub Pages deployment and repository topics.
- Built-in `?selftest=1` harness.

## Verification

- **28/28** self-tests pass in headless Chrome against the live GitHub Pages build.
- Checks include Three.js/Cannon.js runtimes, renderer, 400+ object scene, 518 m loop, seven stops, 28 riders, tram mesh, 12,000 kg physics body, landmarks, catenary, audio voices, three weather presets, save schema, badge count, minimap/HUD wiring, traction simulation, live Myki boarding, weather switching, driver-cab switching/FOV/handoff, manual door open/close with live Myki boarding, stop/door announcement wiring, CBD extension landmarks, hook-turn readiness and zero uncaught errors.
- Screenshots verified at **1600×1000** desktop and **390×844** mobile with no layout overflow (`scrollWidth === innerWidth`).
- Live URLs return HTTP 200 for HTML, CSS, JS, screenshots and favicon.

## Files

| File | Size |
| --- | ---: |
| `index.html` | 17,501 bytes · 345 lines |
| `style.css` | 48,340 bytes · 1,810 lines |
| `script.js` | 230,067 bytes · 5,489 lines |
| `README.md` | 17,564 bytes · 372 lines |
| `screenshot.png` | 1.16 MB |
| `screenshot-rain.png` | 1.16 MB |
| `screenshot-twilight.png` | 1.09 MB |
| `screenshot-station.png` | 982 KB |
| `screenshot-fedsquare.png` | 1.15 MB |
| `screenshot-university.png` | 779 KB |
| `screenshot-yarra.png` | 737 KB |
| `screenshot-hook.png` | 244 KB |
| `screenshot-mobile.png` | 258 KB |
| `screenshot-start.png` | 698 KB |
| `screenshot-driver.png` | 784 KB |
| `screenshot-driver-rain.png` | 805 KB |
| `screenshot-doors.png` | 910 KB |
| `screenshot-cbd.png` | 1.31 MB |
| `screenshot-collins.png` | 842 KB |
| `screenshot-parliament.png` | 988 KB |
| `screenshot-rmit.png` | 1.05 MB |

## How to run

```bash
cd tramtracker-2088
python3 -m http.server 8080
# open http://localhost:8080
```

Or use the live demo: <https://somphol.github.io/tramtracker-2088/>

## Credits

Built with **OpenCode 2.2.5** and **DeepSeek V4.1 Flash** (`opencode-go/deepseek-v4.1-flash`) in a single agent session. The game code, procedural city, landmarks, tram mesh, physics tuning, HUD, audio synthesis, save system, documentation and verification harness were generated for this project.

Runtime libraries: [Three.js](https://threejs.org/) r128 (MIT), [OrbitControls](https://threejs.org/) (MIT) and [Cannon.js](https://schteppe.github.io/cannon.js/) 0.6.2 (MIT). Typefaces: **Orbitron** and **Rajdhani** from Google Fonts (SIL OFL 1.1). No image, texture, audio or 3D-model assets were used. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
