# Deployment

Hosted on **GitHub Pages**, served straight from `main` as a static site. There is no
build artifact, package manager, backend or CI workflow: the committed files are what is
served.

- Live URL: <https://somphol.github.io/tramtracker-2088/>
- Repository: <https://github.com/somphol/tramtracker-2088>
- Source branch: `main`, folder `/` (repository root)
- Entry file: `index.html`
- Runtime network calls: **Three.js r128, OrbitControls r128, Cannon.js 0.6.2 and Google
  Fonts** (see §3)

## 1. Deploy a change

```bash
cd ~/Projects/tramtracker-2088

# 1. verify locally
python3 -m http.server 8080          # http://localhost:8080/
#    run the selftest and the matrix in docs/TESTING.md

# 2. commit and push
git add -A
git commit -m "…"
git push origin main
```

Pages rebuilds on push, usually within a minute. Confirm:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://somphol.github.io/tramtracker-2088/
```

Re-check that the served files are the committed ones:

```bash
shasum index.html style.css script.js
for f in index.html style.css script.js; do
  curl -sL "https://raw.githubusercontent.com/somphol/tramtracker-2088/main/$f" | shasum
done
```

At the documentation release the hashes were:

```text
index.html  0b9ffd166b9adfb02502530663a7fe41ab7352d0
style.css   dd46da7a9593c35c9af2bd0f77d4d9359eda5a85
script.js   cc09d5a9c507245d168e94073cf37bc6d98690b7
```

All three matched the live/raw copies.

## 2. Repository settings that matter

| Setting | Value | Why |
| --- | --- | --- |
| Pages source | Deploy from a branch → `main` → `/ (root)` | the app lives at the root |
| Custom domain | none | default `*.github.io` host |
| Enforce HTTPS | on | default certificate |
| Actions | none required | no workflow exists in `.github/workflows/` |

`.nojekyll` is committed. Keep it: it stops Jekyll from processing the site and keeps the
publish path a plain static copy. The app uses classic `<script>` tags, so MIME handling is
simple; `script.js?v=1.2.1` is cache-busted by query string.

## 3. Files that are published

Everything in the repository root is public, including documentation and screenshots:

- `index.html` — HUD, overlays, dialogs, loader, CDN tags
- `style.css` — Yarra green/gold and neon glass design system, responsive layout
- `script.js` — world, physics, gameplay, audio, hook turn, save
- `favicon.svg` — tram mark
- 29 `screenshot*.png` files — README images, about **23 MB** total
- `README.md`, `CHANGELOG.md`, `AGENTS.md`, `docs/*.md`
- `STATE.md`, `state.json` — historical build receipt
- `THIRD_PARTY_NOTICES.md`, `LICENSE`
- `robots.txt`, `sitemap.xml`, `.nojekyll`

There is no secrets file, no environment variable and no runtime configuration.

**Runtime network dependencies.** These are real requests on every cold load:

| Request | Host | Purpose |
| --- | --- | --- |
| `three.min.js` r128 | `cdnjs.cloudflare.com` | Three.js core |
| `OrbitControls.js` r128 | `cdn.jsdelivr.net` | chase camera |
| `cannon.min.js` 0.6.2 | `cdnjs.cloudflare.com` | rigid-body tram/obstacles |
| Google Fonts stylesheet | `fonts.googleapis.com` | Orbitron, Rajdhani |
| Font files | `fonts.gstatic.com` | the same two families |

The script tags have no `integrity`. **Failure behaviour is not graceful for Three.js**:
the script uses `new THREE.Vector3` at top level, so blocking the Three CDN leaves the
loader at “Wiring the overhead…” instead of showing an error card. With Cannon blocked but
Three present, `TramApp.init()` calls `fatal()` with a readable message. Do not describe
the app as offline-capable.

## 4. Rollback

Pages serves the current `main`, so rolling back is a normal history operation:

```bash
git revert <bad-commit>          # preferred: keeps history
git push origin main
```

or, for an immediate local reset:

```bash
git reset --hard <good-commit>
git push --force-with-lease origin main
```

Force-pushing rewrites published history; prefer `git revert` unless the bad commit
contains something that must not remain public.

## 5. Caching

At the time of writing the live document returned:

```text
cache-control: max-age=600
etag: "6ae7c596-4db9"
last-modified: Sun, 01 Nov 2026 23:04:54 GMT
```

A browser may keep an old `index.html` for up to ten minutes. `style.css` and `script.js`
are requested with `?v=1.2.1`, so bump that query string when changing either file to
avoid a mixed old/new cache. There is no service worker.

## 6. Local preview versus production

A local server is recommended for `localStorage` and consistent asset URLs:

```bash
python3 -m http.server 8080
open http://localhost:8080/
```

`file://` usually runs the scene, but storage, speech and CDN behaviour vary.

## 7. Platform requirements

- A browser with **WebGL**, Canvas 2D, ES6, Web Audio and `localStorage`. Chrome/Chromium
  was verified; Safari, Firefox, Edge and real mobile devices are unverified.
- A network connection on first load for the three script CDNs and Google Fonts. The
  Three.js failure path is currently the loader stall described above.
- Headless Chrome needs **SwiftShader**: `--use-gl=angle --use-angle=swiftshader
  --enable-unsafe-swiftshader`. The Metal path used by other Three.js projects is not the
  supported capture recipe here.
- Real touch controls, HiDPI scaling and screen-reader output are unverified.
- No install, service worker or manifest; there is nothing to add to a home screen.
