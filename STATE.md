# Build State

| Field | Value |
| --- | --- |
| Project | TramTracker 2088 — Melbourne Yarra Trams 3D Simulator (`tramtracker-2088`) |
| Started | 2026-11-01 16:59:53 UTC |
| Packaged | 2026-11-01 22:44:30 UTC |
| Duration | **5h 44m 25s** (20,665 seconds) |
| Harness | OpenCode 2.2.5 |
| Model | DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`) |
| Session | `ses_e67f25924ffeV87ZCfDRsei45y` |
| Repository | <https://github.com/somphol/tramtracker-2088> |
| Live demo | <https://somphol.github.io/tramtracker-2088/> |

## Token usage

| Metric | Tokens |
| --- | ---: |
| Input | 1,321,705 |
| Output | 316,059 |
| Reasoning | 456,698 |
| **Total (input + output + reasoning)** | **2,094,462** |
| Cache read | 227,545,472 |
| Cache write | 1,190 |
| Total including cache | 229,639,934 |

> Snapshot taken from the OpenCode session record when the project was packaged at 2026-11-01 22:44:30 UTC. It includes the original build, track/cab/doors/announcement/CBD work, stop guides, city ambience, passenger manifests, stop requests, tourist stops, the 1.35 km St Kilda Road/Shrine extension with 21 respaced stops, mobile panel controls and the door interlock. The final state-file commit, push, Pages re-verification and closing response happen outside this snapshot, so the live session totals will be marginally higher. Total cost reported by the session: **$0.00**.

## Revisions after the first package

1. **Track-spin fix** — the loop had duplicate control points at straight/arc junctions, which caused ~180° tangent flips and a 360° spin at corners. Duplicates were removed (131 → 123 control points), heading now uses a 2.4 m chord, and a per-frame angular cap prevents snaps. Maximum tangent change dropped from 167–180° to 1.82°.
2. **Driver's cab view** — added a first-person cab (`V`) with a cockpit overlay, drag-to-look, speed-reactive FOV, head sway, curve lean and animated rain wipers.
3. **Manual doors and announcements** — added `O` / **Doors** control, sliding door geometry, opening and closing chimes, a door/traction interlock, and en-AU spoken next-stop, arrival and door-closing announcements with subtitles.
4. **CBD extension** — rebuilt the loop as a Hoddle Grid route through Swanston, Flinders, Spring/Exhibition, Collins, Spring North and La Trobe/Queensberry, adding Collins Street, Parliament and RMIT stops plus Parliament House, RMIT and Collins Street landmarks.
5. **Stop guides, soundscape and names** — added nearby-place/Wikipedia stop cards, richer layered city ambience, actual Melbourne stop names and double-faced stop signs.
6. **Passengers and tourist stops** — added destination manifests, pull-the-cord stop requests, alighting animations and more tourist stops.
7. **1.35 km Shrine extension** — rebuilt the loop around St Kilda Road, Kings Domain and the Shrine of Remembrance, respaced all 21 stops to at least 30 m, added two tram bridges and kept buildings clear of the track.
8. **Mobile panels and door interlock** — added minimizable telemetry/stop-guide panels and a persistent door warning that blocks traction until the doors close.
9. **Separate brake and reverse** — braking now stops and holds at zero; reverse is its own `R`/REVERSE control, and the brake always takes priority over reverse. Self-tests remain at 32 checks.

## What was built

A complete, self-contained 3D tram simulator in three modular source files plus documentation, screenshots and community files.

### Core requirements

- **Melbourne street grid** — an extended Hoddle Grid loop through St Kilda Road, the Domain, Swanston, Flinders, Spring/Exhibition, Victoria, Collins, La Trobe/Queensberry and the surrounding blocks, with footpaths, crossings, tram stop platforms and a painted hook-turn box.
- **Flinders Street Station** — textured arched façade, cream hall, green copper dome, clock tower, side elevations and corner entrance.
- **Federation Square** — panelled deconstructivist shards with neon edges, a public screen facing Swanston Street, plaza paving, amphitheatre and shard sculpture.
- **Yarra River** — animated water, Princes Bridge, a second Domain tram bridge, promenade, Southbank skyline and the Melbourne University portico.
- **Shrine of Remembrance** — stepped stone memorial with colonnade, sanctuary, eternal flame and Domain landscaping.
- **Rails and catenary** — 1.35 km closed CBD and Shrine loop, two embedded steel rails, sleepers, contact and messenger wires, droppers and poles.
- **W-Class / Cyber-Tram 2088** — green hull, cream roof, gold waistline, window band, destination signs, headlights, bogies, pantograph, neon underglow and a bell.
- **Cannon.js physics** — 12,000 kg dynamic tram body, static collision volumes, contact events, rail-following velocity, acceleration, braking, curve drag and impact penalties.
- **Keyboard/touch controls** — `W`/`↑` traction, `S`/`↓` brake to a stop, and a separate `R`/REVERSE control; the brake overrides reverse. Rail guidance is automatic; mouse/touch orbit camera; `C` recentre.
- **First-person driver's cab** — `V` toggles between chase and cab views, with a cockpit dashboard, drag-to-look, speed FOV, head sway, curve lean and rain wipers.
- **Manual doors and announcements** — `O` or **Doors** opens/closes the sliding doors at a platform, with chimes, hiss, a persistent door interlock warning and spoken Melbourne-style stop/arrival/door announcements and subtitles.
- **Tram bell** — `B` synthesises the double-ding bell.
- **Passenger pickup** — twenty-one named stops with shelters, waiting commuters, destination manifests, stop requests, alighting animations, Myki beeps and scoring.
- **Hook Turn Challenge** — a separate 60-second top-down intersection with active trams, bikes, traffic signals, a hook-turn box, three attempts, collision detection, violations and a result card.
- **Weather presets** — instant sunny, sudden-rain and twilight transitions across sky shader, fog, sun, exposure, windows, lamps, water, rain, stars, thunder and lightning.
- **Web Audio synthesis** — bell, Myki, wheel screech, rail clatter, city hum, rain, thunder, UI clicks, success and failure stings.
- **Persistence** — automatic `localStorage` career save, `tramtracker_save.json` export, validated merge import, nine badges and best-score tracking.
- **UI/UX** — Yarra green and gold with cyberpunk neon glass HUD, conic speedometer, live minimap, next-stop prompts, toasts, modals, touch controls and responsive desktop/mobile layouts with minimizable telemetry and stop-guide panels.

### Extras

- 28 screenshots: hero, start, rain, twilight, station, Federation Square, university, Yarra, hook turn, mobile panels, doors, door interlock, driver/cab, CBD overview, Shrine, Southbank, Queen Victoria Market and the tourist stops.
- `README.md`, MIT `LICENSE`, `THIRD_PARTY_NOTICES.md`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `.nojekyll` and `.gitignore`.
- GitHub Pages deployment and repository topics.
- Built-in `?selftest=1` harness.

## Verification

- **32/32** self-tests pass in headless Chrome against the live GitHub Pages build.
- Checks include Three.js/Cannon.js runtimes, renderer, 600+ object scene, the 1.35 km loop, 21 stops with a minimum 30 m spacing check, tram mesh, 12,000 kg physics body, landmarks, catenary, audio voices, three weather presets, save schema, badge count, minimap/HUD wiring, traction simulation, live Myki boarding, weather switching, driver-cab switching/FOV/handoff, manual door open/close, door interlock, stop/door announcement wiring, stop-guide/Wikipedia cards, CBD and Shrine landmarks, destination manifests, stop requests, alighting animations, minimizable panels, hook-turn readiness and zero uncaught errors.
- Screenshots verified at **1600×1000** desktop and **390×844** mobile with no layout overflow (`scrollWidth === innerWidth`).
- Live URLs return HTTP 200 for HTML, CSS, JS, screenshots and favicon.

## Files

| File | Size |
| --- | ---: |
| `index.html` | 19,398 bytes · 374 lines |
| `style.css` | 59,026 bytes · 2,287 lines |
| `script.js` | 295,685 bytes · 6,819 lines |
| `README.md` | 25,963 bytes · 476 lines |
| `screenshot.png` | 893 KB |
| `screenshot-rain.png` | 1.16 MB |
| `screenshot-twilight.png` | 1.09 MB |
| `screenshot-station.png` | 982 KB |
| `screenshot-fedsquare.png` | 1.15 MB |
| `screenshot-university.png` | 779 KB |
| `screenshot-yarra.png` | 737 KB |
| `screenshot-hook.png` | 244 KB |
| `screenshot-mobile.png` | 238 KB |
| `screenshot-mobile-guide.png` | 257 KB |
| `screenshot-door-warning.png` | 786 KB |
| `screenshot-shrine.png` | 525 KB |
| `screenshot-qvm.png` | 893 KB |
| `screenshot-southbank.png` | 736 KB |
| `screenshot-start.png` | 698 KB |
| `screenshot-driver.png` | 784 KB |
| `screenshot-driver-rain.png` | 805 KB |
| `screenshot-doors.png` | 910 KB |
| `screenshot-cbd.png` | 1.1 MB |
| `screenshot-stop-guide.png` | 1.0 MB |
| `screenshot-stop-request.png` | 1.0 MB |
| `screenshot-bourke.png` | 732 KB |
| `screenshot-chinatown.png` | 704 KB |
| `screenshot-princess.png` | 935 KB |
| `screenshot-tour.png` | 1.2 MB |
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
