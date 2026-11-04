# Architecture

`tramtracker-2088` is a static Three.js + Cannon.js tram simulator in three source files.
This map covers the parts that control behaviour: the loop and stops, driving and
physics, doors/passengers, weather/audio, the hook-turn mini-game and persistence.

## 1. File map

| File | Lines | Contents |
| --- | ---: | --- |
| `index.html` | 379 | head/meta/fonts (1–30), canvas/cab/loading (31–64), top bar and weather switch (65–92), telemetry/minimap (93–171), stop guide (172–194), toolbar/touch pads (195–235), start screen (236–314), hook-turn overlay (315–370), self-test/scripts (371–377) |
| `style.css` | 2,312 | base (1–124), glass (125–177), top bar (178–326), telemetry (327–523), minimap (524–565), stop prompt (566–617), toolbar (618–665), toasts (666–720), touch (721–769), start (770–940), modals (941–1096), hook turn (1097–1246), loading (1247–1276), flash (1277–1313), responsive (1314–1436), cab (1437–1692), doors/announcements (1693–1812), stop guide (1813–2008), manifest/requests (2009–2143), mobile panels/interlock (2144–2312) |
| `script.js` | 6,976 | constants/utilities/save/audio (1–1013), `TramApp` (1024–6190), `HookTurnGame` (6193–6976) |

`script.js` sections:

| Section | Lines | Subject |
| --- | --- | --- |
| Constants | 10–227 | version, save keys, weather, badges, 21 stops, palette, params |
| Utilities | 228–334 | geometry/math/format helpers |
| Save data | 335–395 | default/sanitise/load |
| Web Audio | 396–1013 | `AudioEngine` |
| Main application | 1020–6190 | `TramApp` |
| Hook Turn Challenge | 6193–6976 | `HookTurnGame` |

## 2. Runtime state

`TramApp` (constructor at `script.js:1025`) owns the session:

| Value | Purpose | Persisted? |
| --- | --- | --- |
| `career` | saved stats, badges, settings | yes, `tramtracker_2088_v1` |
| `trip` | {score, passengers, loops, distance, rainDistance, doors, doorState, doorStop, doorAnim, served, combo} | no |
| `tram` | {s, speed, maxSpeed 13.4, maxReverse −3.4, heading, curve, length} | no |
| `stops[]` | 21 resolved stops with platform, riders, guides | no |
| `onboard[]`, `alighting[]`, `stopRequest` | passenger manifests and animations | no |
| `autoDrive`, `autoPhase`, `autoTimer` | computer driver | no |
| `viewMode`, driver yaw/pitch/last | chase vs cab | no |
| `currentWeather`, `weatherTarget`, `weatherCurrent` | preset interpolation | weather only |
| `hook` | `HookTurnGame` instance | no |

Saved shape (`defaultSave`, 335; `sanitizeSave`, 359):

```json
{
  "app": "TramTracker 2088",
  "version": 1,
  "stats": { "bestScore": 0, "totalPassengers": 0, "trips": 0, "loops": 0,
             "totalDistance": 0, "hookBest": 0, "hookWins": 0, "rainDistance": 0 },
  "badges": [],
  "settings": { "weather": "sunny", "muted": false },
  "updatedAt": "…"
}
```

`sanitizeSave()` rejects non-objects, clamps every number, keeps only known badge ids,
validates the weather key and booleans. Import (`importSave`, 1543) merges career values
with `max()` rather than replacing them.

## 3. The loop and stops

`buildCurve()` (`script.js:1930`) rounds ten Hoddle-Grid vertices with a 12 m radius and
3 m spacing, then builds a closed `CatmullRomCurve3` (tension 0.2). The measured loop is
**1,346 m**. The tram starts at `distanceAt(0, 30)`.

`STOP_DEFS` (57) defines 21 real stop names, points, speech names, blurbs, nearby places,
Wikipedia links, compact-platform flags and hues. `STOP_ROUTE_ORDER` (207) is the
display/route order. Each stop is resolved to an arc length (`distanceAt`), with a
platform 4.2 m outward from the track and `s` used by the HUD, minimap, announcements and
badge checks.

The self-test reports **21 stops, minimum 30 m spacing on a 1,346 m loop**. The harness
only fails below **24 m**, so keep the prose and the threshold in mind when editing.

Track work (`buildTrackWork`, 2344) creates the rails, sleepers, slab, catenary poles and
wires; `buildRoads` (2195) adds lanes, crossings and the painted hook-turn box. Landmarks
are split into reusable builders (`buildStation` 2487, `buildFederationSquare` 2691,
`buildMelbourneUni` 2859, `buildYarra` 2990, `buildCBDLandmarks` 3220, the tourist
landmarks 3240–3897, `buildShrine` 3898). `buildCity` (3080) fills the grid with
procedural buildings, and `addBuilding` (3992) supplies window textures.

## 4. Driving and physics

`updateTram()` (5052) is the driving core:

- traction `+1.95 m/s²` while `W`/`↑`;
- brake `−4.6 m/s²` toward zero, then hold; it never pushes into reverse;
- reverse is `R`, capped at `−3.4 m/s`, and brake wins;
- handbrake is `Space`; coasting applies `0.55^dt`;
- speed clamps to `[−3.4, 13.4] m/s`; the HUD converts to km/h;
- doors not `closed` force speed to 0 and raise the interlock warning;
- rail guidance is automatic: `s` advances by `speed·dt` and wraps around the loop.

The auto driver (`setAutoDrive` 4961, `updateAutoDriver` 5001) targets a platform speed,
brakes into the stop, opens doors, dwells, closes and departs. Any manual throttle, brake,
reverse or handbrake input calls `setAutoDrive(false)` immediately.

`initPhysics()` (4639) creates a Cannon world with gravity −9.82, SAP broadphase, **10
solver iterations**, a ground plane, static obstacle boxes and a **12,000 kg** tram body
(1.32 × 1.5 × 5.0 m box, fixed rotation, no sleep). The body is visual/impact only; the
tram's motion comes from the rail curve. A collision with a car or prop cuts speed by 55%
and plays a crash sting, with a 2.5 s cooldown.

## 5. Doors, passengers and announcements

Door state machine: `closed → opening → open → closing → closed` (`toggleDoors` 5308,
`openDoors` 5319, `closeDoors` 5353, `updateDoors` 5483). Opening requires the next stop
within 9.5 m and `|speed| < 1.4 m/s` (about 5 km/h), not the 2 km/h the README claims;
otherwise the HUD says to stop. The door panels animate, the chime and hiss play, and the
announcement subtitle appears.

Passengers:

- `buildPassengers` (4378) spawns waiting riders, with umbrellas in rain;
- `assignDestination` (5373) gives every boarding rider a later stop;
- `updateTram` raises stop requests when a rider's destination approaches;
- `alightPassengers` (5398) and `updateAlighting` (5422) walk riders off;
- `boardPassengers` (5444) taps them on with Myki beeps and scores 15 each;
- `serviceStop` (5380) awards the perfect-stop bonus and records the stop.

`announce()` (5202) writes the subtitle then calls `AudioEngine.speak()` after a chime.
`speak()` sets `utterance.lang = 'en-AU'` and prefers an Australian voice.

The stop guide (`showStopGuide` 5218, `hideStopGuide` 5246) is a background card with
history, three nearby places and a Wikipedia link; `toggleStopInfo` (5255) reopens it.

## 6. Weather, audio and the city bed

`WEATHERS` (21) defines sunny, rain and twilight: sky stops, horizon, fog near/far, sun
colour/intensity, hemisphere/ambient, window and lamp levels, rain, water colour, stars
and exposure. `setWeather` (4735) starts a transition; `updateWeather` (4786) interpolates
the colours/lights and calls `commitWeatherVisuals` (4810). Rain adds streaks, puddles,
lightning (`triggerLightning`, 4878) and thunder scheduling.

`AudioEngine` (400) synthesises everything:

- `ensure()` creates the context on the CLOCK ON gesture;
- `bell()` double-ding, `myki()` two-tone beep, `chime(kind)` stop/door/request cues;
- `buildScreech`/`setScreech` and `clack` for wheels and rails;
- `buildAmbient`/`updateAmbience` mix city rumble, traffic, crowd, birds, distant bells,
  horns and wind; `setWeatherMood` shifts the bed;
- `speak()` uses SpeechSynthesis, `setMuted` gates all output.

## 7. Hook Turn Challenge

`HookTurnGame` (`script.js:6193`) is a separate renderer/scene/session:

- `init` (6206) builds the intersection, signals, trams, bikes, car and HUD;
- `open`/`resetSession` (6640/6608) start a 60 s, three-attempt run;
- `update` (6691) handles steering, the hook box, the tram-clearing window, signals,
  collisions, violations and the target ring;
- `failAttempt` (6836) and `finish`/`showResult` (6861/6886) score and award the badge.

It is opened from the toolbar/`G` (`openHookGame` 5963) and closed back to the main app.

## 8. UI, camera and loop

`updateHud` (1582) writes speed, next stop, distance, score, passengers, loops, requests
and badges. `drawMinimap` (5770) draws the route, stops, tram dot and heading. The camera
is chase (OrbitControls) or cab (`setViewMode` 5609, `updateDriverCamera` 5645); `V`
toggles, drag looks, `C` recentres.

`animate()` (5907) clamps `dt`, updates the tram, doors, passengers, traffic, weather,
camera, HUD, minimap and audio, then renders. `runSelfTests()` (5985) runs 33 checks and
writes `#selftestOut` plus `document.body.dataset.selftest`.

## 9. Data flow

```text
STOP_DEFS + loop vertices
        ↓
buildCurve() → stop arc lengths → HUD / minimap / announcements / badges
        ↓
keys/touch → updateTram() → speed, s, doors, requests, boarding
        ↓
trip + career → updateHud() → saveLocal()/persist() → localStorage
        ↓
weather/audio/camera/loop
```

The hook-turn game is a separate loop with its own scene and session; only its result
touches `career.hookBest`, `hookWins` and the badge list.

## 10. Change guide

| To change… | Touch | Watch out for |
| --- | --- | --- |
| Route shape | `buildCurve` vertices/radius/spacing | re-run stop spacing, minimap and landmarks |
| Stop list/order | `STOP_DEFS`, `STOP_ROUTE_ORDER` | HUD, announcements, badges, self-test 21 |
| Driving feel | `updateTram` rates, `maxSpeed`/`maxReverse` | keep metres/second and door interlock |
| Physics | `initPhysics`, `onTramImpact` | rail motion is separate; 12,000 kg body |
| Doors/boarding | `openDoors`, `closeDoors`, `updateDoors`, `boardPassengers` | state machine + announcements + score |
| Auto driver | `setAutoDrive`, `updateAutoDriver` | manual input must always take over |
| Weather | `WEATHERS`, `applyWeather`, `updateWeather` | sky/fog/lights/rain/water/stars together |
| Audio | `AudioEngine` | context only after CLOCK ON; mute gates speech |
| Hook turn | `HookTurnGame` | separate renderer/session; only result persists |
| Save | `defaultSave`, `sanitizeSave`, `exportSave`, `importSave` | version, clamps, max-merge |
| Mobile | CSS 1314–1436 and 2144–2312 | no horizontal overflow at 390 px |
| Self-test | `runSelfTests` | 33 checks; update README counts together |

Keep the app static: three files, CDN libraries, no build server, no backend, no
analytics. A change that needs any of those is a product decision, not a refactor.
