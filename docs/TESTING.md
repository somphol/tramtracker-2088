# Testing

## Status of this release

| Evidence | When | Result |
| --- | --- | --- |
| Local self-test (`?selftest=1&autostart=1`) | 2026-11-03 | **33 / 33 PASS**, `data-selftest="pass"` |
| Live Pages self-test | 2026-11-03 | **33 / 33 PASS** |
| Scene / loop / stop audit | 2026-11-03 | **568 objects · 1,346 m · 21 stops · min 30 m · 100 riders** |
| Vehicle / infrastructure audit | 2026-11-03 | **55 tram parts · 12,000 kg body · 204 catenary pieces** |
| Simulated driving / boarding | 2026-11-03 | **6.1 m traction movement · 4 passengers tapped on** |
| Weather / badges / save | 2026-11-03 | **3 presets · 9 badges · schema valid** |
| Console errors | 2026-11-03 | **0 uncaught** (selftest check 33) |
| Desktop screenshot, 1600 × 1000 | 2026-11-03 | **981,519-byte PNG** |
| Phone emulation, 390 × 844 | 2026-11-03 | **279,439-byte PNG**, scrollWidth 390, no overflow |
| Live Pages probe (`curl`) | 2026-11-03 | **200** |
| Local vs live `index.html`/`style.css`/`script.js` (SHA-1) | 2026-11-03 | **all match** (`0b9ffd16…` / `dd46da7a…` / `cc09d5a9…`) |
| CDN probes (Three, Orbit, Cannon, fonts) | 2026-11-03 | **200 / 200 / 200 / 200** |
| Blocked script CDNs | 2026-11-03 | **loader stalls at “Wiring the overhead…”** — not graceful |
| Hook-turn full playthrough / real save round-trip | — | **Not re-run** this release |
| Safari / Firefox / Edge / real touch / screen reader | — | **Not verified** |
| CI | — | **No workflow**; the selftest is manual |

The documentation commit changes Markdown only; `index.html`, `style.css` and `script.js`
are untouched.

## 1. Commands

```bash
cd ~/Projects/tramtracker-2088

# run
python3 -m http.server 8080          # http://localhost:8080/
open index.html                      # server preferred for localStorage

# self-test (SwiftShader required)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-gl=angle --use-angle=swiftshader \
  --enable-unsafe-swiftshader --mute-audio \
  --virtual-time-budget=30000 --timeout=45000 \
  --dump-dom "http://localhost:8080/?selftest=1&autostart=1" > /tmp/tram-dom.html
grep -o 'data-selftest="[^"]*"' /tmp/tram-dom.html

# one frame
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --use-gl=angle --use-angle=swiftshader \
  --enable-unsafe-swiftshader --mute-audio \
  --virtual-time-budget=25000 --timeout=40000 --window-size=1600,1000 \
  --screenshot=/tmp/tram.png "http://localhost:8080/?shot=1&autostart=1"

# live probe and hashes
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/tramtracker-2088/
shasum index.html style.css script.js
for f in index.html style.css script.js; do
  curl -sL "https://raw.githubusercontent.com/somphol/tramtracker-2088/main/$f" | shasum
done
```

### Self-test surface

`?selftest=1` (optional `&autostart=1`) writes the full list into `#selftestOut`, the
console and `document.body.dataset.selftest`. It is the only automated harness.

### Browser-console audit

Start Chrome with `--remote-debugging-port=9260 --user-data-dir=/tmp/tram-profile`, attach
with the DevTools Protocol (Node's built-in `WebSocket` is enough), set
`Emulation.setDeviceMetricsOverride` to 390 × 844, then read:

```js
({
  innerWidth, innerHeight,
  scrollWidth: document.documentElement.scrollWidth,
  overflow: document.documentElement.scrollWidth > innerWidth,
  topbar: document.querySelector('.topbar').getBoundingClientRect().toJSON(),
  telemetry: document.querySelector('.telemetry').getBoundingClientRect().toJSON(),
  toolbar: document.querySelector('.toolbar').getBoundingClientRect().toJSON()
})
```

The observed result was `innerWidth 390`, `scrollWidth 390`, `overflow false`, with the
top bar, telemetry and toolbar each 366 px wide inside 12 px margins.

## 2. Results (2026-11-03)

### Self-test

```text
33 / 33 PASS
```

Selected details:

```text
Scene populated — 568 objects
CBD loop built — 1346 m
Twenty-one named tram stops — Flinders St … Town Hall
Stops spaced along the loop — min 30 m between 21 stops on 1346 m
Waiting passengers spawned — 100 riders
Tram mesh assembled — 55 parts
Cannon tram body — 12000 kg
Overhead catenary — 204 pieces
Flinders Street Station — 29 parts
Federation Square — 37 parts
Yarra River & bridge — 77 parts
Web Audio synth voices — bell, myki, screech, traffic, crowd, birds, distant trams
Three weather presets — sunny, rain, twilight
Nine route badges — 9 badges
Save schema validates — tramtracker_save.json
Traction moves the tram — 6.1 m
Manual doors open, board and close — 4 tapped on
Passenger destinations & stop requests — onboard manifest + cord request + alighting
Stop & door announcements — en-AU speech + chime + subtitle
Stop guide with Wikipedia links — nearby places · background · external link
Auto driver serves a platform — approach · brake · doors · dwell · depart
Weather presets switch — sunny → rain → twilight → sunny
Driver cab view — first-person cab, drag-to-look and rain wipers
CBD extension landmarks — Parliament · RMIT · Collins Street
Nine more tourist landmarks — 21-stop tourist loop including the Shrine
Hook turn scene ready — 60 s challenge
Minimap canvas — 440 × 320
Save/load UI — export + import
HUD wired — telemetry live
No uncaught errors — clean
```

The live URL produced the same 33/33 and `data-selftest="pass"`.

### Source match and live probe

```text
GET https://somphol.github.io/tramtracker-2088/     200
local index.html SHA-1                             0b9ffd166b9adfb02502530663a7fe41ab7352d0
local style.css SHA-1                              dd46da7a9593c35c9af2bd0f77d4d9359eda5a85
local script.js SHA-1                              cc09d5a9c507245d168e94073cf37bc6d98690b7
```

All three matched the raw `main` copies.

### Screenshots

| View | Size | Observed |
| --- | --- | --- |
| Desktop 1600 × 1000 | 981,519 bytes | tram at St Paul's, telemetry, next stop, minimap, toolbar |
| Phone 390 × 844 (CDP) | 279,439 bytes | telemetry, stop guide, touch pads, toolbar; no overflow |

The repository screenshots are the original 1600 × 1000 / 390 × 844 captures from the
1.2.1 build.

### CDN failure

With `cdnjs.cloudflare.com` and `cdn.jsdelivr.net` blocked, the DOM was 19,866 bytes and
the loader still said **“Wiring the overhead…”**. The top-level `new THREE.Vector3` throws
before `TramApp.init()` can run its `fatal()` fallback, so the README's claim of a clear
3D-load error is **not** true for Three.js. This is recorded in
[AGENTS.md §5](../AGENTS.md#5-known-issues).

## 3. Manual matrix

| Area | Check | Status |
| --- | --- | --- |
| Boot | Loader clears; start screen appears | Verified headless |
| Clock on | Start begins the shift and unlocks audio | Start screen rendered; audio gesture not measured |
| Driving | W/↑ traction, S/↓ brake, R reverse, Space handbrake | Simulated traction verified; feel not measured |
| Doors | Open/close at a platform, interlock blocks traction | Verified by selftest |
| Passengers | Boarding, Myki beep, manifests, requests, alighting | Boarding/manifests/requests verified by selftest |
| Auto driver | Serves a platform, doors, dwell, depart, manual takeover | Verified by selftest |
| Views | Chase orbit and driver cab, drag look, wipers | Cab view verified; gestures not measured |
| Weather | Sunny/rain/twilight transitions | Verified by selftest |
| Stop guide | Card, nearby places, Wikipedia link, minimize | Content verified; pointer interaction by code |
| Minimap | Route, stops, tram dot, heading | Canvas verified; live motion not measured |
| Hook turn | 60 s, 3 attempts, signals, collisions, result | Scene readiness verified; not played to completion |
| Save | localStorage, export/import, badges | Schema and UI verified; file round-trip not re-run |
| Mobile | 390 × 844, no overflow, touch pads | Verified in emulation |
| Accessibility | Labels, live regions, canvas alternative | Partial; not screen-reader tested |

## 4. Failure triage

- **Loader never clears** — the most likely cause is a blocked Three.js CDN; the current
  code stalls rather than showing an error. Check the console and network.
- **“Cannon.js failed to load”** — the Cannon CDN is blocked; the app shows `fatal()`.
- **WebGL/black canvas** — use a hardware-accelerated browser; headless needs SwiftShader.
- **Doors will not open** — the next stop must be within 9.5 m and `|speed| < 1.4 m/s`
  (about 5 km/h; the README's 2 km/h is stricter than the code).
- **Tram will not move** — doors are not fully closed; the interlock warning shows.
- **No passengers** — the stop may have no waiting riders, or the manifest is already
  served; wait for the next stop.
- **No audio or speech** — the AudioContext needs the CLOCK ON gesture; speech needs a
  voice and unmuted state.
- **Save does not persist** — private mode or a blocked origin; the HUD will report it.
- **Import rejected** — must be valid JSON with a `stats`/`settings` object; unknown
  badges are dropped and numbers clamped.

## 5. Not verified

- A full lap with manual driving, every stop service, all nine badges and a complete loop.
- The auto driver over a full loop (the selftest serves one platform).
- Hook-turn play to completion, collisions, violations and the result card.
- A real `tramtracker_save.json` download/import round-trip and career merge.
- Audio quality, speech voice selection, thunder/rain mix and the city bed.
- Safari, Firefox, Edge, real iOS/Android, touch gestures, HiDPI and screen readers.
- Long-session stability, FPS and memory.
- The Three.js CDN failure path remains a loader stall; no graceful error was observed.
