<div align="center">

<img src="screenshot.png" alt="TramTracker 2088 — a green and gold cyber tram on Swanston Street with Flinders Street Station behind it" width="100%" />

# TRAMTRACKER 2088

**Melbourne Yarra Trams · 3D Simulator**

Drive a retro-futuristic W-Class cyber tram around the Swanston Loop, collect Myki passengers, survive four seasons in one day, and master the famous Melbourne hook turn — from the chase camera or the driver's cab.

[![Live demo](https://img.shields.io/badge/live_demo-online-46ffd3?style=flat-square)](https://somphol.github.io/tramtracker-2088/)
[![Self-tests](https://img.shields.io/badge/self--tests-26%2F26-00b85c?style=flat-square)](#verification)
[![License: MIT](https://img.shields.io/badge/license-MIT-f6c800?style=flat-square)](LICENSE)

**[Play it live →](https://somphol.github.io/tramtracker-2088/)**

</div>

---

TramTracker 2088 is a complete, self-contained 3D browser game built with **vanilla HTML5, CSS3 and ES6**, rendered with **Three.js r128** and simulated with **Cannon.js 0.6.2**. There is no build step, no framework and no generated asset bundle: every building, tram, passenger, texture and sound is created in the browser.

The whole thing runs from three files — `index.html`, `style.css` and `script.js`.

<div align="center">
<img src="screenshot-driver.png" alt="First-person driver's cab view looking down Swanston Street towards Flinders Street Station" width="100%" />
<sub><b>Driver's cab view</b> — press <kbd>V</kbd>, drag to look around, and watch the wipers in the rain.</sub>
</div>

---

## Contents

- [The sim](#the-sim)
- [Features](#features)
- [Controls](#controls)
- [The Swanston Loop](#the-swanston-loop)
- [Hook Turn Challenge](#hook-turn-challenge)
- [Weather](#weather)
- [Scoring and badges](#scoring-and-badges)
- [Save data](#save-data)
- [Run it locally](#run-it-locally)
- [Project structure](#project-structure)
- [Verification](#verification)
- [Browser support](#browser-support)
- [Credits](#credits)
- [License](#license)

---

## The sim

You clock on at the north end of Swanston Street in a green-and-gold cyber tram. The tram is rail-guided — the computer handles steering, you handle traction and braking. Roll into a platform below 2 km/h and the doors open, Myki validators beep, and passengers board.

The loop is roughly 377 metres and takes you past:

- the cream façade, copper dome and clock tower of **Flinders Street Station**;
- the angular zinc-and-glass shards, plaza screen and amphitheatre of **Federation Square**;
- the **Yarra River**, Princes Bridge and the Southbank skyline;
- the classical portico of **Melbourne University**;
- a full cast of low-poly commuters, bikes, taxis, trams, street trees, traffic lights and overhead catenary.

A Cannon.js rigid body follows the rails and collides with street furniture, while the Three.js scene supplies the follow camera, orbit controls and a live HUD.

---

## Features

### 3D world and tram

- **Swanston Street, Flinders Street and the city grid** built procedurally, with lane markings, zebra crossings, footpaths, street lamps, neon shopfronts and a hook-turn box painted on the asphalt.
- **Two embedded steel rails**, concrete sleepers, a track slab and a full **overhead catenary** with poles, droppers, contact and messenger wires.
- **Flinders Street Station** with a textured arched façade, green copper dome, clock tower, corner entrance and side elevations.
- **Federation Square** with panelled deconstructivist shards, edge neon, a public screen facing Swanston Street, plaza paving, amphitheatre steps and a shard sculpture.
- **Princes Bridge, the Yarra River, Southbank skyline and Melbourne University**, plus around eighty procedurally generated city buildings with lit window textures.
- **W-Class / Cyber-Tram 2088**: green hull, cream roof, gold waistline, window band, destination signs, headlights, tail lights, bogies, pantograph, bell and neon underglow.
- **Rail physics** with acceleration, braking, rolling resistance, curve drag, wheel screech, rail clatter and a Cannon.js tram body for impacts.
- **First-person driver's cab view** with a glass cockpit, dashboard, speed-reactive FOV, head sway and curve lean; drag to look around and let go to ease back to the road. Rain triggers animated wipers and droplets on the glass.
- Follow camera with **mouse orbit and zoom**, plus a recentre key.

### Passengers and Myki

- Four named stops with shelters, benches, Myki validators, platform markers and waiting passengers (complete with umbrellas when it rains).
- Automatic door release when you stop inside the platform zone below 2 km/h.
- A **synthesised Myki tap-on beep** for each boarding passenger, a staggered boarding animation and a perfect-stop bonus.
- Passenger counts, best score, loops, shift score and career totals update live.

### Hook Turn Challenge

- A separate top-down 3D intersection with Flinders Street tram tracks, live trams, traffic signals, bikes, crosswalks and a painted hook-turn box.
- Drive the car into the box, hold position while the tram clears, then complete the turn across the tracks when the signal goes green.
- Three attempts, a 60-second clock, collision detection for trams and bikes, violations, scoring and a result card.
- Winning awards the **Hook Turn Graduate** badge and adds to your career best.

### Weather

Three instant presets, each changing sky shader, fog, sun colour and intensity, exposure, window glow, street lamps, water colour, rain and stars:

- **☀️ Classic Melbourne Sun**
- **🌧️ Four Seasons in One Day** — rain streaks, wet puddles, thunder and lightning flashes
- **🌆 Twilight Yarra River Glow** — orange horizon, purple fog, stars and brighter neon

### Audio

100% synthesised with the Web Audio API:

- the iconic **double-ding tram bell**;
- **Myki** two-tone validator beeps;
- wheel screech driven by speed and track curvature;
- rail clatter, city hum, rain noise and thunder;
- UI clicks, success arpeggio and collision/fail stings.

Audio starts on the **CLOCK ON** gesture, as required by browser autoplay policies.

### UI

Yarra Trams green and gold meets a cyberpunk neon HUD: glassmorphic telemetry, conic-gradient speedometer, live route minimap, next-stop guidance, toasts, a driver's manual, route badges, and responsive layouts for desktop, tablet and phone. Touch power/brake/bell/hook controls appear on small screens.

### Persistence

- Automatic `localStorage` save of best score, total passengers, shifts, loops, distance, hook-turn best, badges, weather and mute state.
- **💾 Save** downloads `tramtracker_save.json`.
- **📂 Load** validates and merges a save file from any device.

---

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Apply traction | `W` / `↑` | **POWER** pad |
| Brake / reverse | `S` / `↓` | **BRAKE** pad |
| Ring bell | `B` | 🔔 |
| Hook Turn Challenge | `G` | ↱ |
| Driver / chase view | `V` | **VIEW** toolbar button |
| Recentre camera | `C` | — |
| Mute sound | `M` | speaker button |
| Help | `H` | `?` button |
| Fullscreen | `F` | ⛶ button |
| Orbit / zoom camera | drag / wheel | drag / pinch |
| Look around the cab | drag | drag |

In the Hook Turn Challenge: `W`/`↑` throttle, `S`/`↓` brake, `A`/`D` or `←`/`→` steer.

---

## The Swanston Loop

| # | Stop | Where it is | Platform detail |
| --- | --- | --- | --- |
| 1 | **Flinders St Station** | Swanston St, in front of the station | Shelter, bench, Myki validator |
| 2 | **Yarra Promenade** | South edge of the loop | River-facing shelter |
| 3 | **Federation Square** | East edge of the loop | Plaza-side shelter |
| 4 | **Melbourne Uni** | North end of Swanston St | University-side shelter |

Stops are placed by arc length on the closed Catmull-Rom loop, so the next-stop HUD and minimap always agree with the rails.

---

## Hook Turn Challenge

Melbourne's hook turn lets a right-turning car wait on the far side of the intersection instead of blocking the tram tracks. The mini-game distils that into a 60-second challenge:

1. **Enter the box** — drive east and stop inside the yellow hook-turn box.
2. **Wait for the tram** — hold position. The signal stays red while a tram is crossing.
3. **Turn on green** — once the tram clears, the signal turns green for a short window. Cross the tracks and reach the cyan target ring.

Hitting a tram or bike costs an attempt. Crossing early is a violation. Three attempts, one badge, and a score based on time remaining.

---

## Weather

The three presets are selected from the top bar. Each one is applied instantly by interpolating the sky shader, fog, sun, hemisphere light, ambient light, exposure, window emissive maps, street lamps, puddles, rain opacity, water colour and star opacity.

Rain also schedules thunder and a subtle lightning flash every 8–18 seconds.

---

## Scoring and badges

| Action | Score |
| --- | ---: |
| Passenger tapped on | 15 each |
| Perfect stop (within 4.2 m of the marker) | +40 |
| Complete a full loop | +250 |
| Win the Hook Turn Challenge | 120–1,400 (time and violations) |

Nine route badges are stored in your career:

🚋 First Shift · 💳 Myki Rookie · 🎫 Commuter Legend · 🔁 City Loop · 🛤️ Swanston Regular · ↱ Hook Turn Graduate · 🌧️ Four Seasons Driver · 🌆 Yarra Glow · 🏆 2088 Legend

---

## Save data

`localStorage` key: `tramtracker_2088_v1`

Exported file: **`tramtracker_save.json`**

```json
{
  "app": "TramTracker 2088",
  "version": 1,
  "stats": {
    "bestScore": 0,
    "totalPassengers": 0,
    "trips": 0,
    "loops": 0,
    "totalDistance": 0,
    "hookBest": 0,
    "hookWins": 0,
    "rainDistance": 0
  },
  "badges": [],
  "settings": { "weather": "sunny", "muted": false },
  "exportedAt": "2026-11-01T00:00:00.000Z",
  "credits": "Built with OpenCode + DeepSeek V4.1 Flash"
}
```

Imports are schema-validated: unknown badges are discarded, numbers are clamped, and career values are merged with `max()` rather than overwritten. Invalid JSON is rejected with a toast.

---

## Run it locally

No install and no build step:

```bash
# from the project folder
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` directly also works, but a small local server is recommended for consistent module/network behaviour.

Internet access is required for the Three.js and Cannon.js CDNs and the Google Fonts. The app falls back gracefully with a clear error message if Three.js or Cannon.js cannot load.

### Self-test surface

Append `?selftest=1` (optionally with `&autostart=1`) to run the built-in 26-check harness. Results are written to `#selftestOut`, `document.body.dataset.selftest` and the console.

Useful development params:

- `?autostart=1` — skip the start card
- `?weather=rain|twilight|sunny` — start in a weather preset
- `?fresh=1` — clear the local save on load
- `?shot=1` — hide loading/start overlays for screenshots
- `?view=station|fed|tram|yarra|uni` — fixed screenshot views

---

## Project structure

```text
tramtracker-2088/
├── index.html                    # HUD, overlays, dialogs, CDN scripts
├── style.css                     # Yarra green/gold + neon glass design system
├── script.js                     # world, physics, gameplay, audio, hook turn
├── screenshot.png                # hero screenshot
├── screenshot-rain.png
├── screenshot-twilight.png
├── screenshot-station.png
├── screenshot-fedsquare.png
├── screenshot-university.png
├── screenshot-yarra.png
├── screenshot-hook.png
├── screenshot-mobile.png
├── screenshot-start.png
├── screenshot-driver.png
├── screenshot-driver-rain.png
├── STATE.md / state.json         # build duration, token usage, credits
├── THIRD_PARTY_NOTICES.md
├── LICENSE
└── .nojekyll                     # GitHub Pages
```

Build duration, token usage and full credits are recorded in [STATE.md](STATE.md) and [state.json](state.json).

`script.js` is organised into small classes and sections:

- `TramApp` — scene bootstrap, world construction, driving, boarding, weather, HUD and persistence;
- `HookTurnGame` — the separate mini-game renderer and state machine;
- `AudioEngine` — every synthesised sound;
- save/sanitise helpers and the badge/route/weather data tables.

---

## Verification

The built-in harness reports **26/26 PASS**, covering:

- Three.js r128 and Cannon.js 0.6.2 runtime availability;
- WebGL renderer, scene population (300+ objects), 377 m loop;
- four named stops and 20 waiting passengers;
- tram mesh, 12,000 kg Cannon body, catenary, station, Federation Square and Yarra geometry;
- Web Audio voices and three weather presets;
- save schema validation and the export/import path;
- nine badges, minimap, HUD and save/load UI wiring;
- a live traction simulation that moves the tram;
- a live Myki boarding simulation that adds passengers and score;
- weather switching;
- hook-turn scene readiness;
- driver's cab view switching, FOV and orbit-control handoff;
- zero uncaught errors.

Headless Chrome (SwiftShader WebGL) screenshots were used to verify desktop 1600×1000 and mobile 390×844 layouts, all three weather presets, the hook-turn challenge, and the start/result overlays.

---

## Browser support

Built and tested in current Chrome/Chromium with WebGL 1/2. It uses standard ES6, Canvas 2D, Web Audio and `localStorage`. For best results use a recent desktop browser with hardware acceleration; mobile works with the on-screen touch controls.

---

## Credits

Created in a single agent session with **[OpenCode](https://opencode.ai) v2.2.5** and **DeepSeek V4.1 Flash** (`opencode-go/deepseek-v4.1-flash`).

Runtime libraries:

- [Three.js](https://threejs.org/) r128 — MIT
- [Cannon.js](https://schteppe.github.io/cannon.js/) 0.6.2 — MIT
- **Orbitron** and **Rajdhani** via Google Fonts — SIL Open Font License 1.1

No external image, texture, audio or 3D-model assets are used. The city, station, Federation Square, university, river, tram, passengers, textures and every sound are generated procedurally.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for full notices.

---

## License

[MIT](LICENSE) © 2026 Somphol Boonjing
