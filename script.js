/* =============================================================================
   TramTracker 2088 — Melbourne Yarra Trams 3D Simulator
   Vanilla ES6 · Three.js r128 · Cannon.js 0.6.2
   Built with OpenCode + DeepSeek V4.1 Flash
   ============================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     Constants
     ------------------------------------------------------------------------ */

  const VERSION = '1.0.7';
  const SAVE_KEY = 'tramtracker_2088_v1';
  const SAVE_FILE = 'tramtracker_save.json';
  const APP_NAME = 'TramTracker 2088';
  const LOOP_CENTER = { x: 30, z: 30 };
  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  const WEATHERS = {
    sunny: {
      label: 'Classic Melbourne Sun',
      skyTop: 0x2f7fd0, skyBottom: 0xbfe4ff, horizon: 0xdff2ff,
      fog: 0xcfe6ef, fogNear: 140, fogFar: 560,
      sun: 0xfff0c4, sunIntensity: 1.32, hemi: 0.6, ambient: 0.26,
      window: 0.35, lamp: 0.18, rain: 0, water: 0x7fd4d8, star: 0, exposure: 1.02
    },
    rain: {
      label: 'Four Seasons in One Day',
      skyTop: 0x1b2c39, skyBottom: 0x6d7f86, horizon: 0x93a3a8,
      fog: 0x71858b, fogNear: 45, fogFar: 250,
      sun: 0xb9c6cc, sunIntensity: 0.5, hemi: 0.44, ambient: 0.34,
      window: 0.9, lamp: 1.1, rain: 1, water: 0x5d9aa4, star: 0, exposure: 0.9
    },
    twilight: {
      label: 'Twilight Yarra River Glow',
      skyTop: 0x0a0f2e, skyBottom: 0xff7a4d, horizon: 0xffb56b,
      fog: 0x2b1f3a, fogNear: 45, fogFar: 300,
      sun: 0xff6a3d, sunIntensity: 0.4, hemi: 0.2, ambient: 0.16,
      window: 1.35, lamp: 1.7, rain: 0, water: 0x3d7a92, star: 0.9, exposure: 0.7
    }
  };

  const BADGES = [
    { id: 'first_shift', icon: '🚋', name: 'First Shift', desc: 'Complete your first passenger pickup.' },
    { id: 'myki_10', icon: '💳', name: 'Myki Rookie', desc: 'Tap on 10 passengers.' },
    { id: 'myki_50', icon: '🎫', name: 'Commuter Legend', desc: 'Tap on 50 passengers.' },
    { id: 'loop_1', icon: '🔁', name: 'City Loop', desc: 'Complete one full Swanston Loop.' },
    { id: 'loop_3', icon: '🛤️', name: 'Swanston Regular', desc: 'Complete three full loops.' },
    { id: 'hook_turn', icon: '↱', name: 'Hook Turn Graduate', desc: 'Win the Hook Turn Challenge.' },
    { id: 'rain_runner', icon: '🌧️', name: 'Four Seasons Driver', desc: 'Drive 500 m in sudden rain.' },
    { id: 'twilight_glow', icon: '🌆', name: 'Yarra Glow', desc: 'Drive the loop at twilight.' },
    { id: 'score_5000', icon: '🏆', name: '2088 Legend', desc: 'Score 5,000 in a single shift.' }
  ];

  const STOP_DEFS = [
    {
      id: 'flinders', name: 'Flinders Street Station', speechName: 'Flinders Street Station', short: 'Flinders St',
      point: { x: 0, z: -8 }, hue: 0xf6c800,
      wiki: 'https://en.wikipedia.org/wiki/Flinders_Street_railway_station',
      blurb: "Melbourne's grand 1854 railway station and one of the city's best-loved landmarks, with its green copper dome, clock tower and long cream façade.",
      nearby: ['Federation Square', "St Paul's Cathedral", 'the Yarra River']
    },
    {
      id: 'arts', name: 'Arts Precinct', speechName: 'Arts Precinct', short: 'Arts Precinct',
      point: { x: 30, z: -40 }, hue: 0x46ffd3,
      wiki: 'https://en.wikipedia.org/wiki/Melbourne_Arts_Precinct',
      blurb: 'The riverside cultural heart of Melbourne, home to the National Gallery of Victoria, Arts Centre Melbourne and Hamer Hall.',
      nearby: ['the National Gallery of Victoria', 'Arts Centre Melbourne', 'Southbank Promenade']
    },
    {
      id: 'fed', name: 'Federation Square', speechName: 'Federation Square', short: 'Fed Square',
      point: { x: 60, z: 25 }, hue: 0xff7a4d,
      wiki: 'https://en.wikipedia.org/wiki/Federation_Square',
      blurb: 'A deconstructivist civic square opened in 2002, hosting ACMI, the Ian Potter Centre and a packed calendar of events.',
      nearby: ['NGV Australia', 'ACMI', 'Flinders Street Station']
    },
    {
      id: 'collins', name: 'Collins Street', speechName: 'Collins Street', short: 'Collins St',
      point: { x: 80, z: 25 }, hue: 0xffb340,
      wiki: 'https://en.wikipedia.org/wiki/Collins_Street,_Melbourne',
      blurb: "Melbourne's historic Paris End, lined with Victorian-era arcades, luxury boutiques, theatres and the Town Hall.",
      nearby: ['the Block Arcade', 'Melbourne Town Hall', 'Parliament House']
    },
    {
      id: 'parliament', name: 'Parliament', speechName: 'Parliament Station', short: 'Parliament',
      point: { x: 100, z: 65 }, hue: 0x9d7bff,
      wiki: 'https://en.wikipedia.org/wiki/Parliament_House,_Melbourne',
      blurb: "The seat of Victoria's Parliament since 1856, with a grand colonnade, dome and formal gardens on Spring Street.",
      nearby: ['Parliament Station', 'the Old Treasury Building', 'Fitzroy Gardens']
    },
    {
      id: 'rmit', name: 'RMIT University', speechName: 'RMIT University', short: 'RMIT',
      point: { x: 60, z: 120 }, hue: 0xff5577,
      wiki: 'https://en.wikipedia.org/wiki/RMIT_University',
      blurb: 'A globally ranked design and technology university founded in 1887, whose city campus spills into the surrounding laneways.',
      nearby: ['State Library Victoria', 'Melbourne Central', 'the Old Melbourne Gaol']
    },
    {
      id: 'uni', name: 'Melbourne University', speechName: 'Melbourne University', short: 'Melbourne Uni',
      point: { x: 0, z: 80 }, hue: 0x68a8ff,
      wiki: 'https://en.wikipedia.org/wiki/University_of_Melbourne',
      blurb: "Australia's second-oldest university, founded in 1853, with a historic Parkville campus and cultural collections.",
      nearby: ['the Grainger Museum', 'the Royal Melbourne Hospital', 'Carlton Gardens']
    }
  ];

  const PALETTE = {
    green: 0x00853e,
    greenDark: 0x004a25,
    greenLight: 0x00b85c,
    gold: 0xf6c800,
    cream: 0xefe4c4,
    neon: 0x46ffd3,
    zinc: 0x6f7d86,
    stone: 0xcbbf9f,
    asphalt: 0x242a27
  };

  const params = new URLSearchParams(location.search);
  const IS_SELFTEST = params.has('selftest');
  const AUTOSTART = params.has('autostart') || IS_SELFTEST;
  const SHOT_MODE = params.has('shot');
  const START_WEATHER = WEATHERS[params.get('weather')] ? params.get('weather') : null;

  /* ---------------------------------------------------------------------------
     Small utilities
     ------------------------------------------------------------------------ */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
  const mod = (n, m) => ((n % m) + m) % m;
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const num = (v, fallback) => (isNum(Number(v)) ? Number(v) : fallback);
  const fmt = (n) => Math.round(n).toLocaleString('en-AU');

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function makeCanvasTexture(w, h, draw, opts) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    tex.encoding = THREE.sRGBEncoding;
    if (opts && opts.repeat) tex.repeat.set(opts.repeat[0], opts.repeat[1]);
    return tex;
  }

  function makeWindowTexture(seed, tint) {
    const rng = mulberry32(seed);
    return makeCanvasTexture(256, 512, (ctx, w, h) => {
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, tint || '#1b2a2c');
      grd.addColorStop(1, '#0d1618');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      for (let y = 14; y < h - 16; y += 26) {
        for (let x = 12; x < w - 12; x += 26) {
          const lit = rng() > 0.32;
          if (lit) {
            const warm = rng() > 0.3;
            ctx.fillStyle = warm ? 'rgba(255, 214, 140, ' + (0.45 + rng() * 0.55) + ')' : 'rgba(120, 240, 235, ' + (0.35 + rng() * 0.5) + ')';
          } else {
            ctx.fillStyle = 'rgba(38, 66, 72, 0.75)';
          }
          ctx.fillRect(x, y, 13, 11);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(x, y + 11, 13, 2);
        }
      }
      ctx.fillStyle = 'rgba(0,0,0,0.24)';
      for (let x = 0; x < w; x += 52) ctx.fillRect(x, 0, 2, h);
    }, { repeat: [1, 1] });
  }

  function makeSignTexture(text, sub, opts) {
    const o = Object.assign({ bg: '#031a12', fg: '#f6c800', accent: '#46ffd3', border: true, align: 'center' }, opts || {});
    return makeCanvasTexture(512, 160, (ctx, w, h) => {
      ctx.fillStyle = o.bg;
      ctx.fillRect(0, 0, w, h);
      if (o.border) {
        ctx.strokeStyle = o.fg;
        ctx.lineWidth = 5;
        ctx.strokeRect(10, 10, w - 20, h - 20);
      }
      ctx.textAlign = o.align;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = o.fg;
      let fontSize = o.fontSize || 56;
      const fontFamily = 'Orbitron, Arial Black, sans-serif';
      ctx.font = '900 ' + fontSize + 'px ' + fontFamily;
      const maxWidth = w - (o.align === 'left' ? 70 : 56);
      const measured = ctx.measureText(text).width;
      if (measured > maxWidth) {
        fontSize = Math.max(14, Math.floor(fontSize * maxWidth / measured));
        ctx.font = '900 ' + fontSize + 'px ' + fontFamily;
      }
      const x = o.align === 'left' ? 30 : w / 2;
      ctx.fillText(text, x, h * 0.43);
      if (sub) {
        ctx.fillStyle = o.accent;
        ctx.font = '700 24px Rajdhani, Arial, sans-serif';
        ctx.fillText(sub, x, h * 0.76);
      }
    });
  }

  /* ---------------------------------------------------------------------------
     Save data
     ------------------------------------------------------------------------ */

  function defaultSave() {
    return {
      app: APP_NAME,
      version: 1,
      stats: {
        bestScore: 0,
        totalPassengers: 0,
        trips: 0,
        loops: 0,
        totalDistance: 0,
        hookBest: 0,
        hookWins: 0,
        rainDistance: 0
      },
      badges: [],
      settings: { weather: 'sunny', muted: false },
      updatedAt: null
    };
  }

  function sanitizeSave(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const out = defaultSave();
    const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
    out.stats.bestScore = clamp(num(stats.bestScore, 0), 0, 99999999);
    out.stats.totalPassengers = clamp(num(stats.totalPassengers, 0), 0, 99999999);
    out.stats.trips = clamp(num(stats.trips, 0), 0, 9999999);
    out.stats.loops = clamp(num(stats.loops, 0), 0, 9999999);
    out.stats.totalDistance = clamp(num(stats.totalDistance, 0), 0, 999999999);
    out.stats.hookBest = clamp(num(stats.hookBest, 0), 0, 9999999);
    out.stats.hookWins = clamp(num(stats.hookWins, 0), 0, 9999999);
    out.stats.rainDistance = clamp(num(stats.rainDistance, 0), 0, 999999999);
    const known = new Set(BADGES.map((b) => b.id));
    if (Array.isArray(raw.badges)) {
      out.badges = Array.from(new Set(raw.badges.filter((id) => typeof id === 'string' && known.has(id))));
    }
    if (raw.settings && typeof raw.settings === 'object') {
      out.settings.weather = WEATHERS[raw.settings.weather] ? raw.settings.weather : 'sunny';
      out.settings.muted = Boolean(raw.settings.muted);
    }
    out.updatedAt = new Date().toISOString();
    return out;
  }

  function loadSaveFromStorage() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { save: defaultSave(), restored: false };
      const parsed = JSON.parse(raw);
      const clean = sanitizeSave(parsed);
      return clean ? { save: clean, restored: true } : { save: defaultSave(), restored: false };
    } catch (err) {
      console.warn('[TramTracker] save load failed', err);
      return { save: defaultSave(), restored: false };
    }
  }

  /* ---------------------------------------------------------------------------
     Web Audio synthesizer
     ------------------------------------------------------------------------ */

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.noiseBuffer = null;
      this.muted = false;
      this.screechGain = null;
      this.screechFilter = null;
      this.ambientGain = null;
      this.rainGain = null;
      this.screechOsc = null;
      this.ready = false;
      this.lastClack = 0;
      this.voice = null;
      this.voicesBound = false;
      this.ambienceActive = false;
      this.ambientLayers = null;
      this.cityMood = 'sunny';
      this.ambienceClock = 0;
      this.nextTraffic = 2.4;
      this.nextHorn = 9;
      this.nextBird = 3.5;
      this.nextDistantTram = 15;
      this.nextCrowd = 7;
    }

    loadVoices() {
      if (!('speechSynthesis' in window)) return;
      try {
        const pick = () => {
          const voices = window.speechSynthesis.getVoices() || [];
          if (!voices.length) return;
          this.voice = voices.find((v) => /en[-_]?AU/i.test(v.lang))
            || voices.find((v) => /en[-_]?GB/i.test(v.lang))
            || voices.find((v) => /^en/i.test(v.lang))
            || voices[0];
        };
        pick();
        if (!this.voicesBound && window.speechSynthesis.addEventListener) {
          window.speechSynthesis.addEventListener('voiceschanged', pick);
          this.voicesBound = true;
        }
      } catch (err) { /* speech is optional */ }
    }

    speak(text) {
      if (this.muted || !text || !('speechSynthesis' in window)) return false;
      try {
        this.loadVoices();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-AU';
        utterance.rate = 0.93;
        utterance.pitch = 1.02;
        utterance.volume = 0.95;
        if (this.voice) utterance.voice = this.voice;
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (err) {
        return false;
      }
    }

    stopSpeech() {
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (err) { /* ignore */ }
      }
    }

    chime(kind) {
      if (!this.ensure()) return;
      const t = this.ctx.currentTime;
      let notes = [659.25, 987.77];
      let gap = 0.17;
      let dur = 0.55;
      let vol = 0.065;
      if (kind === 'close') { notes = [880, 880, 880]; gap = 0.18; dur = 0.17; vol = 0.055; }
      else if (kind === 'open') { notes = [783.99, 1174.66]; gap = 0.16; dur = 0.6; }
      else if (kind === 'welcome') { notes = [523.25, 659.25, 783.99]; gap = 0.14; dur = 0.5; }
      notes.forEach((freq, i) => {
        const at = t + i * gap;
        [1, 2.01].forEach((mult, k) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * mult, at);
          g.gain.setValueAtTime(0, at);
          g.gain.linearRampToValueAtTime(vol * (k === 0 ? 1 : 0.3), at + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
          osc.connect(g).connect(this.master);
          osc.start(at);
          osc.stop(at + dur + 0.05);
        });
      });
    }

    doorHiss(opening) {
      if (!this.ensure()) return;
      const t = this.ctx.currentTime;
      const src = this.noiseSource(false);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(opening ? 1300 : 900, t);
      bp.frequency.exponentialRampToValueAtTime(opening ? 700 : 500, t + 0.45);
      bp.Q.value = 1.1;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      src.connect(bp).connect(g).connect(this.master);
      src.start(t);
      src.stop(t + 0.55);

      const thunk = this.ctx.createOscillator();
      const tg = this.ctx.createGain();
      thunk.type = 'sine';
      thunk.frequency.setValueAtTime(96, t + 0.38);
      thunk.frequency.exponentialRampToValueAtTime(52, t + 0.55);
      tg.gain.setValueAtTime(0.0001, t + 0.38);
      tg.gain.linearRampToValueAtTime(0.08, t + 0.4);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      thunk.connect(tg).connect(this.master);
      thunk.start(t + 0.38);
      thunk.stop(t + 0.62);
    }

    ensure() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        return true;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.8;
        this.master.connect(this.ctx.destination);
        this.noiseBuffer = this.makeNoise(2.2);
        this.buildScreech();
        this.buildAmbient();
        this.loadVoices();
        this.ready = true;
        return true;
      } catch (err) {
        console.warn('[TramTracker] audio unavailable', err);
        return false;
      }
    }

    makeNoise(seconds) {
      const rate = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, rate * seconds, rate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2 + white * 0.18;
      }
      return buffer;
    }

    noiseSource(loop) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = Boolean(loop);
      return src;
    }

    setMuted(muted) {
      this.muted = muted;
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.03);
      }
      if (muted) this.stopSpeech();
    }

    buildScreech() {
      const src = this.noiseSource(true);
      this.screechFilter = this.ctx.createBiquadFilter();
      this.screechFilter.type = 'bandpass';
      this.screechFilter.frequency.value = 2300;
      this.screechFilter.Q.value = 7;
      this.screechGain = this.ctx.createGain();
      this.screechGain.gain.value = 0;
      src.connect(this.screechFilter).connect(this.screechGain).connect(this.master);
      src.start();

      this.screechOsc = this.ctx.createOscillator();
      this.screechOsc.type = 'triangle';
      this.screechOsc.frequency.value = 2800;
      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.0;
      this.screechOsc.connect(oscGain).connect(this.master);
      this.screechOsc.start();
      this.screechOscGain = oscGain;
    }

    buildAmbient() {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0;
      this.ambientGain.connect(this.master);

      const layer = (filterType, frequency, q, gain) => {
        const src = this.noiseSource(true);
        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = frequency;
        if (q) filter.Q.value = q;
        const g = this.ctx.createGain();
        g.gain.value = gain;
        const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        if (pan) {
          src.connect(filter).connect(g).connect(pan).connect(this.ambientGain);
        } else {
          src.connect(filter).connect(g).connect(this.ambientGain);
        }
        src.start();
        return { src, filter, gain: g, pan };
      };

      const rumble = layer('lowpass', 230, 0.6, 0.10);
      const traffic = layer('bandpass', 460, 0.7, 0.045);
      const crowd = layer('bandpass', 880, 0.8, 0.032);
      const wind = layer('highpass', 1500, 0.5, 0.018);

      if (traffic.pan) traffic.pan.pan.value = 0.14;
      if (crowd.pan) crowd.pan.pan.value = -0.2;

      // Slow swells keep the street bed alive.
      const lfo = (rate, depth, target) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = rate;
        g.gain.value = depth;
        osc.connect(g).connect(target);
        osc.start();
      };
      lfo(0.055, 0.014, traffic.gain.gain);
      lfo(0.083, 0.01, crowd.gain.gain);
      lfo(0.037, 0.018, rumble.gain.gain);

      [58, 92, 132].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = this.ctx.createGain();
        g.gain.value = i === 0 ? 0.014 : i === 1 ? 0.007 : 0.004;
        osc.connect(g).connect(this.ambientGain);
        osc.start();
      });

      const rainSrc = this.noiseSource(true);
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 900;
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = 0;
      rainSrc.connect(hp).connect(this.rainGain).connect(this.master);
      rainSrc.start();

      this.ambientLayers = { rumble, traffic, crowd, wind };
    }

    setWeatherMood(name) {
      this.cityMood = name || 'sunny';
      if (!this.ctx || !this.ambientLayers) return;
      const t = this.ctx.currentTime;
      const settings = {
        sunny: { rumble: 0.1, traffic: 0.05, crowd: 0.035, wind: 0.018 },
        rain: { rumble: 0.13, traffic: 0.024, crowd: 0.02, wind: 0.05 },
        twilight: { rumble: 0.12, traffic: 0.055, crowd: 0.05, wind: 0.024 }
      }[this.cityMood] || { rumble: 0.1, traffic: 0.05, crowd: 0.035, wind: 0.018 };
      Object.keys(settings).forEach((key) => {
        if (this.ambientLayers[key]) {
          this.ambientLayers[key].gain.gain.setTargetAtTime(settings[key], t, 1.2);
        }
      });
    }

    trafficPass() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const duration = 2.4 + Math.random() * 1.4;
      const src = this.noiseSource(true);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 0.75;
      bp.frequency.setValueAtTime(280 + Math.random() * 180, t);
      bp.frequency.exponentialRampToValueAtTime(900 + Math.random() * 600, t + duration * 0.45);
      bp.frequency.exponentialRampToValueAtTime(260, t + duration);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.055 + Math.random() * 0.025, t + 0.45);
      g.gain.setValueAtTime(0.055, t + duration * 0.62);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        pan.pan.setValueAtTime(-0.75 * dir, t);
        pan.pan.linearRampToValueAtTime(0.75 * dir, t + duration);
        src.connect(bp).connect(g).connect(pan).connect(this.ambientGain);
      } else {
        src.connect(bp).connect(g).connect(this.ambientGain);
      }
      src.start(t);
      src.stop(t + duration + 0.05);
    }

    carHorn() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime + Math.random() * 0.4;
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        pan.pan.value = (Math.random() - 0.5) * 1.4;
        pan.connect(this.ambientGain);
      }
      [392, 494].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1200;
        osc.type = 'square';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.008, t + 0.015);
        g.gain.setValueAtTime(0.008, t + 0.22);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
        osc.connect(lp).connect(g);
        if (pan) g.connect(pan); else g.connect(this.ambientGain);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    }

    birdChirp() {
      if (!this.ctx || this.muted || this.cityMood === 'rain') return;
      const t = this.ctx.currentTime + 0.1;
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        pan.pan.value = (Math.random() - 0.5) * 1.6;
        pan.connect(this.ambientGain);
      }
      const base = 2200 + Math.random() * 1200;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const at = t + i * 0.13;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(base, at);
        osc.frequency.exponentialRampToValueAtTime(base + 700, at + 0.06);
        osc.frequency.exponentialRampToValueAtTime(base + 200, at + 0.1);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(0.008, at + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
        osc.connect(g);
        if (pan) g.connect(pan); else g.connect(this.ambientGain);
        osc.start(at);
        osc.stop(at + 0.14);
      }
    }

    distantTramBell() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime + 0.2;
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (pan) {
        pan.pan.value = (Math.random() - 0.5) * 1.2;
        pan.connect(this.ambientGain);
      }
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1800;
      if (pan) lp.connect(pan); else lp.connect(this.ambientGain);
      [1046.5, 1568].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.008, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
        osc.connect(g).connect(lp);
        osc.start(t);
        osc.stop(t + 0.75);
      });
    }

    crowdSwell() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime;
      const duration = 4 + Math.random() * 3;
      const src = this.noiseSource(true);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(650, t);
      bp.frequency.linearRampToValueAtTime(1150, t + duration * 0.5);
      bp.frequency.linearRampToValueAtTime(720, t + duration);
      bp.Q.value = 0.7;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.024, t + duration * 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      src.connect(bp).connect(g).connect(this.ambientGain);
      src.start(t);
      src.stop(t + duration + 0.05);
    }

    updateAmbience(dt) {
      if (!this.ctx || !this.ambienceActive || this.muted) return;
      this.ambienceClock += dt;
      this.nextTraffic -= dt;
      this.nextHorn -= dt;
      this.nextBird -= dt;
      this.nextDistantTram -= dt;
      this.nextCrowd -= dt;
      if (this.nextTraffic <= 0) {
        this.trafficPass();
        this.nextTraffic = 4.5 + Math.random() * 6;
      }
      if (this.nextHorn <= 0) {
        if (Math.random() > 0.35) this.carHorn();
        this.nextHorn = 16 + Math.random() * 24;
      }
      if (this.nextBird <= 0) {
        if (this.cityMood !== 'rain' && Math.random() > 0.25) this.birdChirp();
        this.nextBird = 7 + Math.random() * 10;
      }
      if (this.nextDistantTram <= 0) {
        if (Math.random() > 0.3) this.distantTramBell();
        this.nextDistantTram = 18 + Math.random() * 24;
      }
      if (this.nextCrowd <= 0) {
        this.crowdSwell();
        this.nextCrowd = 9 + Math.random() * 14;
      }
    }

    startAmbience() {
      if (!this.ensure()) return;
      this.ambienceActive = true;
      this.setWeatherMood(this.cityMood);
      this.ambientGain.gain.setTargetAtTime(0.18, this.ctx.currentTime, 0.9);
    }

    setRain(active) {
      if (!this.ctx || !this.rainGain) return;
      this.rainGain.gain.setTargetAtTime(active ? 0.085 : 0, this.ctx.currentTime, 0.7);
    }

    setScreech(intensity) {
      if (!this.ctx || !this.screechGain) return;
      const v = clamp(intensity, 0, 1);
      this.screechGain.gain.setTargetAtTime(v * 0.085, this.ctx.currentTime, 0.08);
      this.screechFilter.frequency.setTargetAtTime(1800 + v * 1500, this.ctx.currentTime, 0.1);
      if (this.screechOscGain) this.screechOscGain.gain.setTargetAtTime(v * 0.012, this.ctx.currentTime, 0.08);
      if (this.screechOsc) this.screechOsc.frequency.setTargetAtTime(2600 + v * 900, this.ctx.currentTime, 0.1);
    }

    ding(at, base, gain) {
      const t = this.ctx.currentTime + at;
      const partials = [
        { m: 1, g: 1, d: 1.15 },
        { m: 1.51, g: 0.5, d: 0.8 },
        { m: 2.03, g: 0.28, d: 0.58 },
        { m: 2.74, g: 0.12, d: 0.38 }
      ];
      partials.forEach((p) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base * p.m, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime((gain || 0.2) * p.g, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + p.d);
        osc.connect(g).connect(this.master);
        osc.start(t);
        osc.stop(t + p.d + 0.05);
      });
      const thud = this.ctx.createOscillator();
      const tg = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(176, t);
      tg.gain.setValueAtTime(0.12, t);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      thud.connect(tg).connect(this.master);
      thud.start(t); thud.stop(t + 0.2);
    }

    bell() {
      if (!this.ensure()) return;
      this.ding(0, 1046.5, 0.22);
      this.ding(0.19, 1046.5, 0.2);
    }

    myki() {
      if (!this.ensure()) return;
      const t = this.ctx.currentTime;
      const play = (freq, start, dur, vol, type) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t + start);
        g.gain.setValueAtTime(0, t + start);
        g.gain.linearRampToValueAtTime(vol, t + start + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
        osc.connect(g).connect(this.master);
        osc.start(t + start);
        osc.stop(t + start + dur + 0.03);
      };
      play(1175, 0, 0.075, 0.11, 'square');
      play(1760, 0.095, 0.12, 0.1, 'square');
    }

    click() {
      if (!this.ensure()) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      osc.connect(g).connect(this.master);
      osc.start(t); osc.stop(t + 0.08);
    }

    clack() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 2.4;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.018, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
      src.connect(bp).connect(g).connect(this.master);
      src.start(t); src.stop(t + 0.07);
    }

    thunder() {
      if (!this.ensure()) return;
      const t = this.ctx.currentTime;
      const src = this.noiseSource(false);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t);
      lp.frequency.exponentialRampToValueAtTime(90, t + 1.8);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
      src.connect(lp).connect(g).connect(this.master);
      src.start(t); src.stop(t + 2.2);
    }

    crash() {
      if (!this.ensure()) return;
      const t = this.ctx.currentTime;
      const src = this.noiseSource(false);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.7;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      src.connect(bp).connect(g).connect(this.master);
      src.start(t); src.stop(t + 0.55);
      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);
      og.gain.setValueAtTime(0.16, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      osc.connect(og).connect(this.master);
      osc.start(t); osc.stop(t + 0.45);
    }

    success() {
      if (!this.ensure()) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => {
        const t = this.ctx.currentTime + i * 0.09;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = n;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.11, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        osc.connect(g).connect(this.master);
        osc.start(t); osc.stop(t + 0.42);
      });
    }

    fail() {
      if (!this.ensure()) return;
      const t = this.ctx.currentTime;
      [220, 174.6].forEach((n, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n, t + i * 0.2);
        g.gain.setValueAtTime(0.09, t + i * 0.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.2 + 0.3);
        osc.connect(g).connect(this.master);
        osc.start(t + i * 0.2); osc.stop(t + i * 0.2 + 0.34);
      });
    }
  }

  /* ---------------------------------------------------------------------------
     Hook turn mini-game
     ------------------------------------------------------------------------ */

  // HookTurnGame is defined after TramApp so it can share helpers.

  /* ---------------------------------------------------------------------------
     Main application
     ------------------------------------------------------------------------ */

  class TramApp {
    constructor() {
      this.audio = new AudioEngine();
      if (params.has('fresh')) {
        try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* private mode */ }
      }
      this.storage = loadSaveFromStorage();
      this.career = this.storage.save;
      this.keys = Object.create(null);
      this.started = false;
      this.hookActive = false;
      this.paused = false;
      this.lastTime = performance.now();
      this.time = 0;
      this.hudTimer = 0;
      this.mapTimer = 0;
      this.saveTimer = 0;
      this.weatherMix = 0.35;
      this.currentWeather = START_WEATHER || this.career.settings.weather || 'sunny';
      this.weatherTarget = WEATHERS[this.currentWeather];
      this.weatherCurrent = JSON.parse(JSON.stringify(this.weatherTarget));
      this.weatherCurrent.skyTop = new THREE.Color(this.weatherTarget.skyTop);
      this.weatherCurrent.skyBottom = new THREE.Color(this.weatherTarget.skyBottom);
      this.weatherCurrent.horizon = new THREE.Color(this.weatherTarget.horizon);
      this.weatherCurrent.fog = new THREE.Color(this.weatherTarget.fog);
      this.weatherCurrent.sun = new THREE.Color(this.weatherTarget.sun);
      this.weatherCurrent.water = new THREE.Color(this.weatherTarget.water);
      this.trip = {
        score: 0,
        passengers: 0,
        loops: 0,
        distance: 0,
        rainDistance: 0,
        doors: false,
        doorTimer: 0,
        doorState: 'closed',
        doorStop: null,
        doorAnim: 0,
        served: new Set(),
        combo: 1
      };
      this.tram = {
        s: 0,
        speed: 0,
        maxSpeed: 13.4,
        maxReverse: -3.4,
        heading: 0,
        curve: null,
        length: 0,
        lastClack: 0,
        screech: 0,
        bellCooldown: 0
      };
      this.hookBest = this.career.stats.hookBest || 0;
      this.viewMode = 'chase';
      this.driverYaw = 0;
      this.driverPitch = 0;
      this.driverDragging = false;
      this.driverLookIdle = 0;
      this.driverLast = null;
      this.announceTimer = null;
      this.announceHideTimer = null;
      this.announcedStopId = null;
      this.lastAnnouncementAt = 0;
      this.lastDoorHint = 0;
      this.guideStopId = null;
      this.guideTimer = null;
      this.tramDoors = [];
      this.expectedErrors = [];
      this.jsErrors = [];
      this.lastCameraPos = new THREE.Vector3();
      this.cameraInitialised = false;
      this.recenterRequested = false;
      this.stops = [];
      this.passengers = [];
      this.traffic = [];
      this.rainDrops = null;
      this.stars = null;
      this.lampLights = [];
      this.emissiveMats = [];
      this.windowMats = [];
      this.puddles = [];
      this.hook = null;
    }

    /* ---- bootstrap ------------------------------------------------------- */

    async init() {
      this.cacheDom();
      if (SHOT_MODE) document.body.classList.add('shot');
      this.bindUI();
      this.applyStoredSettings();

      if (!window.THREE) {
        this.fatal('Three.js failed to load. Check the CDN connection and reload.');
        return;
      }
      if (!window.CANNON) {
        this.fatal('Cannon.js failed to load. Check the CDN connection and reload.');
        return;
      }

      try {
        this.setLoading(12, 'Surveying Swanston Street…');
        this.initThree();
        await this.frameBreak();
        this.setLoading(26, 'Laying rails and overhead…');
        this.buildCurve();
        this.buildSky();
        this.buildLighting();
        this.buildGround();
        await this.frameBreak();
        this.setLoading(46, 'Pouring asphalt and track slab…');
        this.buildTrackWork();
        this.buildRoads();
        this.buildLandmarks();
        await this.frameBreak();
        this.setLoading(64, 'Raising Flinders Street Station…');
        this.buildCity();
        this.buildCBDLandmarks();
        this.buildStreetProps();
        this.buildStops();
        this.buildPassengers();
        await this.frameBreak();
        this.setLoading(80, 'Rolling out W-Class 2088…');
        this.buildTram();
        this.initPhysics();
        this.buildWeatherFX();
        this.applyWeather(this.currentWeather, true);
        this.setupCamera();
        if (params.get('view') === 'driver') this.setViewMode('driver', true);
        this.buildHookGame();
        await this.frameBreak();
        this.setLoading(94, 'Syncing Myki validators…');
        this.bindGameplay();
        this.updateHud(true);
        this.drawMinimap();
        this.setLoading(100, 'Ready to clock on.');
        this.hideLoading();
        this.animate();

        if (AUTOSTART) {
          this.startGame(true);
          if (SHOT_MODE) {
            this.camera.position.set(22, 15, 52);
            this.controls.target.set(0, 2, 20);
          }
        }

        if (IS_SELFTEST) setTimeout(() => this.runSelfTests(), 900);
      } catch (err) {
        console.error(err);
        this.fatal('Simulator failed to initialise: ' + (err && err.message ? err.message : err));
      }
    }

    frameBreak() {
      return new Promise((resolve) => setTimeout(resolve, 24));
    }

    cacheDom() {
      this.dom = {
        body: document.body,
        loading: $('#loadingScreen'),
        loadingBar: $('#loadingBar'),
        loadingCopy: $('#loadingCopy'),
        startScreen: $('#startScreen'),
        startBtn: $('#startBtn'),
        helpModal: $('#helpModal'),
        badgesModal: $('#badgesModal'),
        badgeGrid: $('#badgeGrid'),
        badgeSummary: $('#badgeSummary'),
        careerStats: $('#careerStats'),
        speedRing: $('#speedRing'),
        speedValue: $('#speedValue'),
        gearValue: $('#gearValue'),
        tractionBars: $('#tractionBars'),
        doorState: $('#doorState'),
        scoreValue: $('#scoreValue'),
        bestValue: $('#bestValue'),
        passengerValue: $('#passengerValue'),
        loopValue: $('#loopValue'),
        nextStopName: $('#nextStopName'),
        nextStopDistance: $('#nextStopDistance'),
        stopProgress: $('#stopProgress'),
        stopHint: $('#stopHint'),
        stopPrompt: $('#stopPrompt'),
        promptTitle: $('#promptTitle'),
        promptText: $('#promptText'),
        promptDist: $('#promptDist'),
        announcementBar: $('#announcementBar'),
        announcementText: $('#announcementText'),
        stopInfo: $('#stopInfo'),
        stopInfoName: $('#stopInfoName'),
        stopInfoBlurb: $('#stopInfoBlurb'),
        stopInfoNearby: $('#stopInfoNearby'),
        stopInfoLink: $('#stopInfoLink'),
        stopInfoBtn: $('#stopInfoBtn'),
        stopInfoClose: $('#stopInfoClose'),
        minimap: $('#minimap'),
        toasts: $('#toasts'),
        muteBtn: $('#muteBtn'),
        helpBtn: $('#helpBtn'),
        fullscreenBtn: $('#fullscreenBtn'),
        bellBtn: $('#bellBtn'),
        doorBtn: $('#doorBtn'),
        viewBtn: $('#viewBtn'),
        hookBtn: $('#hookBtn'),
        badgesBtn: $('#badgesBtn'),
        saveBtn: $('#saveBtn'),
        loadBtn: $('#loadBtn'),
        badgeCount: $('#badgeCount'),
        importFile: $('#importFile'),
        hookOverlay: $('#hookOverlay'),
        hookCanvas: $('#hookCanvas'),
        hookTime: $('#hookTime'),
        hookLives: $('#hookLives'),
        hookBest: $('#hookBest'),
        hookStep: $('#hookStep'),
        hookPhaseTitle: $('#hookPhaseTitle'),
        hookPhaseText: $('#hookPhaseText'),
        hookPhase: $('#hookPhase'),
        hookSignal: $('#hookSignal'),
        hookSignalText: $('#hookSignalText'),
        hookSignalBar: $('#hookSignalBar'),
        hookResult: $('#hookResult'),
        hookResultKicker: $('#hookResultKicker'),
        hookResultTitle: $('#hookResultTitle'),
        hookResultText: $('#hookResultText'),
        hookResultScore: $('#hookResultScore'),
        hookRetry: $('#hookRetry'),
        hookExit: $('#hookExit'),
        hookClose: $('#hookClose'),
        screenFlash: $('#screenFlash'),
        selftestOut: $('#selftestOut'),
        touchControls: $('#touchControls')
      };
    }

    setLoading(pct, copy) {
      if (this.dom.loadingBar) this.dom.loadingBar.style.width = pct + '%';
      if (this.dom.loadingCopy && copy) this.dom.loadingCopy.textContent = copy;
    }

    hideLoading() {
      if (!this.dom.loading) return;
      this.setLoading(100, 'Ready to clock on.');
      setTimeout(() => this.dom.loading.classList.add('hide'), 260);
    }

    fatal(message) {
      if (this.dom.loading) {
        this.dom.loading.classList.remove('hide');
        const copy = this.dom.loadingCopy;
        if (copy) {
          copy.textContent = message;
          copy.style.color = '#ff7d95';
          copy.style.letterSpacing = '0.02em';
          copy.style.maxWidth = '440px';
          copy.style.textAlign = 'center';
          copy.style.textTransform = 'none';
          copy.style.fontSize = '12px';
        }
        const bar = this.dom.loadingBar;
        if (bar) bar.style.background = '#ff5577';
      }
      this.expectedErrors.push(message);
    }

    applyStoredSettings() {
      this.audio.muted = Boolean(this.career.settings.muted);
      if (this.dom.muteBtn) {
        this.dom.muteBtn.textContent = this.audio.muted ? '🔇' : '🔊';
        this.dom.muteBtn.classList.toggle('is-off', this.audio.muted);
      }
    }

    /* ---- UI wiring ------------------------------------------------------- */

    bindUI() {
      const d = this.dom;

      if (d.startBtn) d.startBtn.addEventListener('click', () => { this.audio.ensure(); this.startGame(false); });
      if (d.muteBtn) d.muteBtn.addEventListener('click', () => this.toggleMute());
      if (d.helpBtn) d.helpBtn.addEventListener('click', () => this.openModal('helpModal'));
      if (d.fullscreenBtn) d.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
      if (d.bellBtn) d.bellBtn.addEventListener('click', () => this.ringBell());
      if (d.doorBtn) d.doorBtn.addEventListener('click', () => this.toggleDoors());
      if (d.viewBtn) d.viewBtn.addEventListener('click', () => this.toggleView());
      if (d.stopInfoBtn) d.stopInfoBtn.addEventListener('click', () => this.showStopGuide(this.getNextStop(), true));
      if (d.stopInfoClose) d.stopInfoClose.addEventListener('click', () => this.hideStopGuide());
      if (d.hookBtn) d.hookBtn.addEventListener('click', () => this.openHookGame());
      if (d.badgesBtn) d.badgesBtn.addEventListener('click', () => this.openBadges());
      if (d.saveBtn) d.saveBtn.addEventListener('click', () => this.exportSave());
      if (d.loadBtn) d.loadBtn.addEventListener('click', () => d.importFile && d.importFile.click());
      if (d.importFile) d.importFile.addEventListener('change', (e) => this.importSave(e));
      if (d.hookClose) d.hookClose.addEventListener('click', () => this.closeHookGame());
      if (d.hookExit) d.hookExit.addEventListener('click', () => this.closeHookGame());
      if (d.hookRetry) d.hookRetry.addEventListener('click', () => this.hook && this.hook.restart());

      $$('.weather-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const name = btn.dataset.weather;
          this.applyWeather(name, true);
          this.audio.click();
          this.toast('Weather set · ' + WEATHERS[name].label, 2600);
        });
      });

      $$('[data-close]').forEach((btn) => {
        btn.addEventListener('click', () => this.closeModal(btn.dataset.close));
      });

      $$('.modal').forEach((modal) => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeModal(modal.id);
        });
      });

      $$('[data-key]').forEach((btn) => {
        const key = btn.dataset.key;
        const on = (e) => { e.preventDefault(); this.keys[key] = true; btn.classList.add('is-pressed'); };
        const off = (e) => { e.preventDefault(); this.keys[key] = false; btn.classList.remove('is-pressed'); };
        btn.addEventListener('pointerdown', on);
        btn.addEventListener('pointerup', off);
        btn.addEventListener('pointercancel', off);
        btn.addEventListener('pointerleave', off);
      });

      $$('[data-action]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (btn.dataset.action === 'bell') this.ringBell();
          if (btn.dataset.action === 'hook') this.openHookGame();
        });
      });

      $$('[data-hook-key]').forEach((btn) => {
        const key = btn.dataset.hookKey;
        const on = (e) => { e.preventDefault(); if (this.hook) this.hook.keys[key] = true; btn.classList.add('is-pressed'); };
        const off = (e) => { e.preventDefault(); if (this.hook) this.hook.keys[key] = false; btn.classList.remove('is-pressed'); };
        btn.addEventListener('pointerdown', on);
        btn.addEventListener('pointerup', off);
        btn.addEventListener('pointercancel', off);
        btn.addEventListener('pointerleave', off);
      });

      window.addEventListener('keydown', (e) => this.onKeyDown(e));
      window.addEventListener('keyup', (e) => this.onKeyUp(e));
      window.addEventListener('resize', () => this.onResize());
      window.addEventListener('orientationchange', () => setTimeout(() => this.onResize(), 220));
      window.addEventListener('beforeunload', () => this.persist());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.persist();
        this.lastTime = performance.now();
      });

      window.addEventListener('error', (e) => {
        if (e && e.message) this.jsErrors.push(e.message);
        if (this.started) console.warn('[TramTracker] runtime error', e.message);
      });
      window.addEventListener('unhandledrejection', (e) => {
        const msg = e.reason && e.reason.message ? e.reason.message : String(e.reason);
        this.jsErrors.push(msg);
      });
    }

    onKeyDown(e) {
      const tag = e.target && e.target.tagName ? e.target.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key;
      const drivingKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
      if (drivingKeys.includes(key)) e.preventDefault();

      if (this.hookActive) {
        if (this.hook) this.hook.keys[key] = true;
        if (key === 'Escape') this.closeHookGame();
        return;
      }
      if (this.modalOpen()) {
        if (key === 'Escape') this.closeAllModals();
        return;
      }

      this.keys[key] = true;
      if (key === 'b' || key === 'B') this.ringBell();
      if (key === 'o' || key === 'O') this.toggleDoors();
      if (key === 'v' || key === 'V') this.toggleView();
      if (key === 'g' || key === 'G') this.openHookGame();
      if (key === 'm' || key === 'M') this.toggleMute();
      if (key === 'h' || key === 'H') this.openModal('helpModal');
      if (key === 'c' || key === 'C') this.recenterRequested = true;
      if (key === 'f' || key === 'F') this.toggleFullscreen();
    }

    onKeyUp(e) {
      if (this.hookActive && this.hook) {
        this.hook.keys[e.key] = false;
        return;
      }
      this.keys[e.key] = false;
    }

    modalOpen() {
      return $$('.modal.show').length > 0;
    }

    openModal(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('show');
      this.audio.click();
    }

    closeModal(id) {
      const modal = document.getElementById(id);
      if (modal) modal.classList.remove('show');
    }

    closeAllModals() {
      $$('.modal.show').forEach((m) => m.classList.remove('show'));
    }

    toggleMute() {
      const muted = !this.audio.muted;
      this.audio.setMuted(muted);
      this.career.settings.muted = muted;
      if (this.dom.muteBtn) {
        this.dom.muteBtn.textContent = muted ? '🔇' : '🔊';
        this.dom.muteBtn.classList.toggle('is-off', muted);
      }
      this.toast(muted ? 'Sound muted' : 'Sound on');
      this.persist();
      if (!muted) this.audio.click();
    }

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }

    serializeSave() {
      const payload = JSON.parse(JSON.stringify(this.career));
      payload.app = APP_NAME;
      payload.version = 1;
      payload.stats.bestScore = Math.max(this.career.stats.bestScore, Math.floor(this.trip.score));
      payload.stats.totalPassengers = this.career.stats.totalPassengers;
      payload.stats.loops = Math.max(this.career.stats.loops, this.trip.loops);
      payload.stats.totalDistance = Math.round(this.career.stats.totalDistance + this.trip.distance);
      payload.stats.rainDistance = Math.round(this.career.stats.rainDistance + this.trip.rainDistance);
      payload.stats.hookBest = Math.max(this.career.stats.hookBest, this.hookBest);
      payload.badges = Array.from(new Set(this.career.badges));
      payload.settings = { weather: this.currentWeather, muted: this.audio.muted };
      payload.exportedAt = new Date().toISOString();
      payload.updatedAt = new Date().toISOString();
      payload.credits = 'Built with OpenCode + DeepSeek V4.1 Flash';
      return payload;
    }

    persist() {
      try {
        this.career.stats.totalDistance = Math.round(this.career.stats.totalDistance + this.trip.distance);
        this.career.stats.rainDistance = Math.round(this.career.stats.rainDistance + this.trip.rainDistance);
        this.trip.distance = 0;
        this.trip.rainDistance = 0;
        const payload = this.serializeSave();
        localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('[TramTracker] persist failed', err);
      }
    }

    exportSave() {
      try {
        this.persist();
        const payload = this.serializeSave();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = SAVE_FILE;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        this.audio.success();
        this.toast('💾 <b>tramtracker_save.json</b> exported', 4200);
      } catch (err) {
        this.toast('Could not export save', 3200, 'danger');
      }
    }

    importSave(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = JSON.parse(String(reader.result));
          const clean = sanitizeSave(raw);
          if (!clean) throw new Error('invalid save schema');
          const career = this.career;
          career.stats.bestScore = Math.max(career.stats.bestScore, clean.stats.bestScore);
          career.stats.totalPassengers = Math.max(career.stats.totalPassengers, clean.stats.totalPassengers);
          career.stats.trips = Math.max(career.stats.trips, clean.stats.trips);
          career.stats.loops = Math.max(career.stats.loops, clean.stats.loops);
          career.stats.totalDistance = Math.max(career.stats.totalDistance, clean.stats.totalDistance);
          career.stats.hookBest = Math.max(career.stats.hookBest, clean.stats.hookBest);
          career.stats.hookWins = Math.max(career.stats.hookWins, clean.stats.hookWins);
          career.stats.rainDistance = Math.max(career.stats.rainDistance, clean.stats.rainDistance);
          career.badges = Array.from(new Set(career.badges.concat(clean.badges)));
          this.hookBest = Math.max(this.hookBest, clean.stats.hookBest);
          this.persist();
          this.refreshBadges();
          this.updateHud(true);
          this.audio.success();
          this.toast('📂 Progress restored · ' + fmt(career.stats.totalPassengers) + ' passengers on record', 4600);
        } catch (err) {
          this.audio.fail();
          this.toast('Invalid save file — expected tramtracker_save.json', 4200, 'danger');
        } finally {
          event.target.value = '';
        }
      };
      reader.onerror = () => {
        this.toast('Could not read that file', 3200, 'danger');
        event.target.value = '';
      };
      reader.readAsText(file);
    }

    updateHud(force) {
      const d = this.dom;
      const speedKmh = Math.abs(this.tram.speed) * 3.6;
      if (d.speedValue) d.speedValue.textContent = Math.round(speedKmh);
      if (d.speedRing) d.speedRing.style.setProperty('--pct', clamp(speedKmh / 50, 0, 1).toFixed(3));
      if (d.gearValue) d.gearValue.textContent = this.tram.speed > 0.2 ? 'D' : this.tram.speed < -0.2 ? 'R' : 'N';
      if (d.scoreValue) d.scoreValue.textContent = fmt(this.trip.score);
      if (d.bestValue) d.bestValue.textContent = fmt(Math.max(this.career.stats.bestScore, this.trip.score));
      if (d.passengerValue) d.passengerValue.textContent = fmt(this.career.stats.totalPassengers);
      if (d.loopValue) d.loopValue.textContent = fmt(this.trip.loops);

      const speedRatio = clamp(Math.abs(this.tram.speed) / this.tram.maxSpeed, 0, 1);
      if (d.tractionBars) {
        Array.from(d.tractionBars.children).forEach((bar, i) => {
          const active = speedRatio > i / 5;
          bar.classList.toggle('on', active && this.tram.speed >= 0);
          bar.classList.toggle('brake', this.keys.ArrowDown || this.keys.s || this.keys.S);
        });
      }
      const doorLabels = { closed: 'DOORS CLOSED', opening: 'DOORS OPENING', open: 'DOORS OPEN', closing: 'DOORS CLOSING' };
      if (d.doorState) {
        d.doorState.textContent = doorLabels[this.trip.doorState] || 'DOORS CLOSED';
        d.doorState.classList.toggle('open', this.trip.doorState !== 'closed');
      }

      const next = this.getNextStop();
      const platform = this.getPlatformStop();
      if (next) {
        const ahead = this.distanceAhead(next);
        if (d.nextStopName) d.nextStopName.textContent = next.name;
        if (d.nextStopDistance) d.nextStopDistance.textContent = Math.round(ahead) + ' m';
        if (d.stopProgress) d.stopProgress.style.width = clamp(100 - (ahead / 70) * 100, 0, 100).toFixed(1) + '%';
        if (d.stopHint) d.stopHint.textContent = platform ? 'Press O or DOORS to open' : 'Roll up to the platform';
        if (ahead > 2 && ahead < 26 && this.trip.doorState === 'closed' && next.blurb && this.guideStopId !== next.id) {
          this.showStopGuide(next);
        }
        if (d.stopPrompt) {
          const show = ahead < 42 && this.trip.doorState === 'closed';
          d.stopPrompt.classList.toggle('show', show);
          d.stopPrompt.classList.toggle('ready', !!platform);
          if (d.promptTitle) d.promptTitle.textContent = next.name.toUpperCase();
          if (d.promptText) d.promptText.textContent = platform
            ? 'Stopped at platform — press O or DOORS to open'
            : 'Stop within the platform zone to open the doors';
          if (d.promptDist) d.promptDist.textContent = platform ? 'READY' : Math.round(ahead) + ' m';
        }
      } else if (d.stopPrompt) {
        d.stopPrompt.classList.remove('show');
      }
      this.updateDoorButtonUI();

      if (d.badgeCount) d.badgeCount.textContent = this.career.badges.length;
      if (force) this.refreshBadges();
    }

    updateDoorButtonUI() {
      const btn = this.dom.doorBtn;
      if (!btn) return;
      const state = this.trip.doorState;
      const ready = !!this.getPlatformStop();
      btn.classList.toggle('is-ready', ready);
      btn.classList.toggle('is-open', state === 'open');
      btn.classList.toggle('is-busy', state === 'opening' || state === 'closing');
      btn.setAttribute('aria-pressed', state === 'open' ? 'true' : 'false');
      btn.setAttribute('aria-label', state === 'open' ? 'Close doors' : state === 'closed' ? 'Open doors' : 'Doors moving');
      btn.title = state === 'open' ? 'Close doors (O)' : state === 'closed' ? 'Open doors (O)' : 'Doors moving';
      const word = btn.querySelector('.tool-word');
      if (word) word.textContent = state === 'open' ? 'Close' : ready ? 'Open' : 'Doors';
    }

    toast(html, ms, tone) {
      if (!this.dom.toasts) return;
      if (this.dom.toasts.children.length > 3) this.dom.toasts.removeChild(this.dom.toasts.firstChild);
      const el = document.createElement('div');
      el.className = 'toast' + (tone === 'danger' ? ' danger' : '');
      const icon = document.createElement('span');
      icon.className = 'toast-badge';
      icon.textContent = tone === 'danger' ? '⚠️' : '🚋';
      const copy = document.createElement('span');
      copy.innerHTML = html;
      el.appendChild(icon);
      el.appendChild(copy);
      this.dom.toasts.appendChild(el);
      setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 320);
      }, ms || 3200);
    }

    refreshBadges() {
      if (!this.dom.badgeGrid) return;
      const earned = new Set(this.career.badges);
      this.dom.badgeGrid.innerHTML = BADGES.map((b) => (
        '<div class="badge-card ' + (earned.has(b.id) ? 'earned' : '') + '">' +
        '<div class="badge-icon">' + b.icon + '</div>' +
        '<div class="badge-copy"><strong>' + b.name + '</strong><span>' + b.desc + '</span></div>' +
        '</div>'
      )).join('');
      if (this.dom.badgeSummary) this.dom.badgeSummary.textContent = earned.size + ' of ' + BADGES.length + ' badges earned';
      if (this.dom.careerStats) {
        const s = this.career.stats;
        this.dom.careerStats.innerHTML = [
          ['BEST SCORE', fmt(Math.max(s.bestScore, this.trip.score))],
          ['TOTAL PASSENGERS', fmt(s.totalPassengers)],
          ['SHIFTS', fmt(s.trips)],
          ['LOOPS', fmt(Math.max(s.loops, this.trip.loops))],
          ['HOOK TURN BEST', fmt(Math.max(s.hookBest, this.hookBest))],
          ['DISTANCE', fmt(s.totalDistance + this.trip.distance) + ' m']
        ].map(([label, value]) => '<div><span>' + label + '</span><b>' + value + '</b></div>').join('');
      }
    }

    openBadges() {
      this.refreshBadges();
      this.openModal('badgesModal');
    }

    /* ---- badges / scoring ------------------------------------------------ */

    awardBadge(id, quiet) {
      if (this.career.badges.includes(id)) return false;
      const badge = BADGES.find((b) => b.id === id);
      if (!badge) return false;
      this.career.badges.push(id);
      this.persist();
      if (!quiet) {
        this.audio.success();
        this.toast('<b>Badge earned</b> · ' + badge.icon + ' ' + badge.name, 4800);
      }
      if (this.dom.badgeCount) this.dom.badgeCount.textContent = this.career.badges.length;
      return true;
    }

    checkBadges() {
      const total = this.career.stats.totalPassengers;
      if (total >= 1) this.awardBadge('first_shift');
      if (total >= 10) this.awardBadge('myki_10');
      if (total >= 50) this.awardBadge('myki_50');
      if (this.trip.loops >= 1) this.awardBadge('loop_1');
      if (this.trip.loops >= 3) this.awardBadge('loop_3');
      if (this.currentWeather === 'rain' && this.trip.rainDistance >= 500) this.awardBadge('rain_runner');
      if (this.currentWeather === 'twilight' && this.trip.distance >= 120) this.awardBadge('twilight_glow');
      if (this.trip.score >= 5000) this.awardBadge('score_5000');
      this.career.stats.bestScore = Math.max(this.career.stats.bestScore, Math.floor(this.trip.score));
    }

    addScore(amount, reason) {
      this.trip.score += amount;
      this.career.stats.bestScore = Math.max(this.career.stats.bestScore, Math.floor(this.trip.score));
      this.checkBadges();
      if (reason) this.toast('+' + fmt(amount) + ' · ' + reason, 1600);
    }

    /* ---- driving --------------------------------------------------------- */

    startGame(silent) {
      if (this.started) return;
      this.started = true;
      if (this.dom.startScreen) this.dom.startScreen.classList.remove('show');
      if (!silent) {
        this.audio.ensure();
        this.audio.startAmbience();
        this.audio.bell();
        setTimeout(() => this.toast('Route <b>2088</b> — welcome aboard. Next stop: Flinders Street Station.', 4200), 450);
      }
      this.career.stats.trips += 1;
      this.persist();
      this.recenterRequested = true;
    }

    ringBell() {
      if (this.tram.bellCooldown > 0) return;
      this.tram.bellCooldown = 0.4;
      this.audio.bell();
      this.toast('🔔 Ding ding — tram coming through', 1600);
    }

    onResize() {
      if (!this.renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      if (this.hook) this.hook.resize();
    }

    getNextStop() {
      if (!this.stops.length) return null;
      const L = this.tram.length;
      let best = null;
      let bestAhead = Infinity;
      this.stops.forEach((stop) => {
        const ahead = mod(stop.s - this.tram.s, L);
        const recentlyServed = this.time - stop.servedAt < 13 && ahead < 16;
        if (!recentlyServed && ahead < bestAhead) { best = stop; bestAhead = ahead; }
      });
      return best;
    }

    distanceAhead(stop) {
      return mod(stop.s - this.tram.s, this.tram.length);
    }

    getPlatformStop() {
      const next = this.getNextStop();
      if (!next) return null;
      if (this.trip.doorState !== 'closed') return null;
      const ahead = this.distanceAhead(next);
      if (ahead < 9.5 && Math.abs(this.tram.speed) < 1.4) return next;
      return null;
    }

    /* =======================================================================
       THREE.JS WORLD
       ===================================================================== */

    initThree() {
      const canvas = $('#scene');
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.weatherTarget.horizon);
      this.scene.fog = new THREE.Fog(this.weatherTarget.fog, this.weatherTarget.fogNear, this.weatherTarget.fogFar);

      this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1600);
      this.camera.position.set(12, 12, 78);

      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.enablePan = false;
        this.controls.minDistance = 7;
        this.controls.maxDistance = 72;
        this.controls.minPolarAngle = 0.18;
        this.controls.maxPolarAngle = Math.PI * 0.475;
        this.controls.rotateSpeed = 0.55;
        this.controls.zoomSpeed = 0.8;
        this.controls.target.set(0, 2, 40);
      } else {
        // Minimal fallback so the simulator still works if the controls CDN is blocked.
        this.controls = {
          target: new THREE.Vector3(0, 2, 40),
          update: function () {},
          addEventListener: function () {}
        };
      }

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    }

    roundedLoopPoints(vertices, radius, spacing) {
      const n = vertices.length;
      const corners = [];
      for (let i = 0; i < n; i++) {
        const prev = vertices[(i - 1 + n) % n];
        const v = vertices[i];
        const next = vertices[(i + 1) % n];
        let ix = v.x - prev.x;
        let iz = v.z - prev.z;
        const inLen = Math.hypot(ix, iz);
        ix /= inLen; iz /= inLen;
        let ox = next.x - v.x;
        let oz = next.z - v.z;
        const outLen = Math.hypot(ox, oz);
        ox /= outLen; oz /= outLen;
        const dot = clamp(ix * ox + iz * oz, -1, 1);
        const cross = ix * oz - iz * ox;
        const theta = Math.acos(dot);
        const t = radius * Math.tan(theta / 2);
        const sx = v.x - ix * t;
        const sz = v.z - iz * t;
        const ex = v.x + ox * t;
        const ez = v.z + oz * t;
        const sign = cross > 0 ? 1 : -1;
        const cx = sx + (-iz) * sign * radius;
        const cz = sz + ix * sign * radius;
        let a0 = Math.atan2(sz - cz, sx - cx);
        let a1 = Math.atan2(ez - cz, ex - cx);
        let delta = a1 - a0;
        if (sign > 0) {
          while (delta <= 0) delta += Math.PI * 2;
          while (delta > Math.PI * 2) delta -= Math.PI * 2;
        } else {
          while (delta >= 0) delta -= Math.PI * 2;
          while (delta < -Math.PI * 2) delta += Math.PI * 2;
        }
        corners.push({ sx, sz, ex, ez, cx, cz, a0, delta });
      }

      const pts = [];
      const pushPoint = (x, z) => {
        if (pts.length) {
          const last = pts[pts.length - 1];
          if ((last.x - x) * (last.x - x) + (last.z - z) * (last.z - z) < 1e-6) return;
        }
        pts.push(new THREE.Vector3(x, 0.12, z));
      };

      for (let i = 0; i < n; i++) {
        const corner = corners[i];
        const arcSteps = Math.max(3, Math.ceil(Math.abs(corner.delta) * radius / spacing));
        for (let k = 0; k <= arcSteps; k++) {
          const a = corner.a0 + (corner.delta * k) / arcSteps;
          pushPoint(corner.cx + Math.cos(a) * radius, corner.cz + Math.sin(a) * radius);
        }
        const nextCorner = corners[(i + 1) % n];
        const segLen = Math.hypot(nextCorner.sx - corner.ex, nextCorner.sz - corner.ez);
        const lineSteps = Math.max(1, Math.round(segLen / spacing));
        for (let k = 1; k < lineSteps; k++) {
          const f = k / lineSteps;
          pushPoint(lerp(corner.ex, nextCorner.sx, f), lerp(corner.ez, nextCorner.sz, f));
        }
      }
      return pts;
    }

    buildCurve() {
      // Hoddle Grid-inspired CBD loop:
      // Swanston St → Flinders St → Exhibition/Spring North → Collins St →
      // La Trobe/Queensberry → RMIT → Swanston St.
      const vertices = [
        { x: 0, z: -40 },     // Flinders / river corner
        { x: 60, z: -40 },    // east river corner
        { x: 60, z: 25 },     // Federation Square / Collins corner
        { x: 100, z: 25 },    // Collins Street east
        { x: 100, z: 140 },   // Spring / Parliament north
        { x: 60, z: 140 },    // RMIT north-west
        { x: 60, z: 100 },    // RMIT / La Trobe corner
        { x: 0, z: 100 }      // Swanston / La Trobe
      ];
      const pts = this.roundedLoopPoints(vertices, 12, 3);
      this.tram.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.2);
      this.tram.length = this.tram.curve.getLength();

      const startS = this.distanceAt(0, 30);
      this.tram.s = startS;
      this.tram.heading = this.headingAtDistance(startS);

      // Resolve each named stop onto the arc-length of the loop.
      this.stops = STOP_DEFS.map((def) => {
        const s = this.distanceAt(def.point.x, def.point.z);
        const u = s / this.tram.length;
        const p = this.tram.curve.getPointAt(u);
        const tan = this.tram.curve.getTangentAt(u).normalize();
        const toCentre = new THREE.Vector3(p.x - LOOP_CENTER.x, 0, p.z - LOOP_CENTER.z);
        const normalA = new THREE.Vector3(-tan.z, 0, tan.x);
        const normalB = new THREE.Vector3(tan.z, 0, -tan.x);
        const outward = normalA.dot(toCentre) >= 0 ? normalA : normalB;
        if (outward.lengthSq() < 0.001) outward.set(-tan.z, 0, tan.x);
        outward.normalize();
        return {
          id: def.id,
          name: def.name,
          speechName: def.speechName || def.name,
          short: def.short,
          hue: def.hue,
          blurb: def.blurb || '',
          nearby: def.nearby || [],
          wiki: def.wiki || '',
          s: s,
          point: new THREE.Vector3(p.x, 0.16, p.z),
          tangent: tan,
          outward: outward,
          platform: new THREE.Vector3(p.x + outward.x * 4.2, 0.18, p.z + outward.z * 4.2),
          riders: [],
          servedAt: -999
        };
      });

      this.loopLength = this.tram.length;
    }

    distanceAt(x, z) {
      if (!this.tram.curve) return 0;
      let bestU = 0;
      let bestD = Infinity;
      const samples = 1600;
      const v = new THREE.Vector3();
      for (let i = 0; i < samples; i++) {
        const u = i / samples;
        this.tram.curve.getPointAt(u, v);
        const d = (v.x - x) * (v.x - x) + (v.z - z) * (v.z - z);
        if (d < bestD) { bestD = d; bestU = u; }
      }
      // refine
      const step = 1 / samples;
      for (let i = -4; i <= 4; i++) {
        const u = mod(bestU + i * step * 0.25, 1);
        this.tram.curve.getPointAt(u, v);
        const d = (v.x - x) * (v.x - x) + (v.z - z) * (v.z - z);
        if (d < bestD) { bestD = d; bestU = u; }
      }
      return bestU * this.tram.length;
    }

    headingAtDistance(s) {
      const L = this.tram.length;
      const delta = Math.min(1.2, L * 0.004);
      const u1 = mod((s - delta) / L, 1);
      const u2 = mod((s + delta) / L, 1);
      const a = this.tram.curve.getPointAt(u1);
      const b = this.tram.curve.getPointAt(u2);
      return Math.atan2(b.x - a.x, b.z - a.z);
    }

    buildSky() {
      const uniforms = {
        topColor: { value: new THREE.Color(this.weatherTarget.skyTop) },
        bottomColor: { value: new THREE.Color(this.weatherTarget.skyBottom) },
        horizonColor: { value: new THREE.Color(this.weatherTarget.horizon) },
        offset: { value: 30 },
        exponent: { value: 0.72 }
      };
      const skyGeo = new THREE.SphereGeometry(720, 32, 20);
      const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: [
          'varying vec3 vWorldPosition;',
          'void main() {',
          '  vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
          '  vWorldPosition = worldPosition.xyz;',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform vec3 topColor;',
          'uniform vec3 bottomColor;',
          'uniform vec3 horizonColor;',
          'uniform float offset;',
          'uniform float exponent;',
          'varying vec3 vWorldPosition;',
          'void main() {',
          '  float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;',
          '  vec3 lower = mix(horizonColor, bottomColor, smoothstep(-0.15, 0.28, h));',
          '  vec3 col = mix(lower, topColor, pow(max(h, 0.0), exponent));',
          '  gl_FragColor = vec4(col, 1.0);',
          '}'
        ].join('\n')
      });
      this.sky = new THREE.Mesh(skyGeo, skyMat);
      this.sky.frustumCulled = false;
      this.scene.add(this.sky);
      this.skyUniforms = uniforms;

      // Sun / moon billboard.
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff2c4, transparent: true, opacity: 0.95, fog: false });
      this.sunDisc = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 16), sunMat);
      this.sunDisc.position.set(-180, 150, -260);
      this.scene.add(this.sunDisc);

      // Stars for twilight.
      const starGeo = new THREE.BufferGeometry();
      const starCount = 900;
      const starPositions = new Float32Array(starCount * 3);
      const rng = mulberry32(99);
      for (let i = 0; i < starCount; i++) {
        const theta = rng() * Math.PI * 2;
        const phi = Math.acos(clamp(rng() * 0.92 + 0.06, 0.06, 1));
        const r = 600;
        starPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
        starPositions[i * 3 + 1] = Math.cos(phi) * r * 0.8 + 60;
        starPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xdff7ff, size: 1.9, transparent: true, opacity: 0, depthWrite: false, fog: false });
      this.stars = new THREE.Points(starGeo, starMat);
      this.stars.frustumCulled = false;
      this.scene.add(this.stars);

      // Soft clouds.
      this.clouds = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, roughness: 1, metalness: 0, depthWrite: false });
      for (let i = 0; i < 11; i++) {
        const c = new THREE.Group();
        const puffs = 3 + Math.floor(rng() * 4);
        for (let j = 0; j < puffs; j++) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(8 + rng() * 9, 10, 8), cloudMat);
          puff.position.set((rng() - 0.5) * 30, (rng() - 0.5) * 5, (rng() - 0.5) * 18);
          puff.scale.y = 0.45;
          c.add(puff);
        }
        c.position.set((rng() - 0.5) * 520, 105 + rng() * 55, (rng() - 0.5) * 520);
        this.clouds.add(c);
      }
      this.scene.add(this.clouds);
      this.cloudMat = cloudMat;
    }

    buildLighting() {
      this.lights = {};
      this.lights.hemi = new THREE.HemisphereLight(0xcfeaff, 0x1c2a20, this.weatherTarget.hemi);
      this.scene.add(this.lights.hemi);

      this.lights.ambient = new THREE.AmbientLight(0xffffff, this.weatherTarget.ambient);
      this.scene.add(this.lights.ambient);

      const sun = new THREE.DirectionalLight(this.weatherTarget.sun, this.weatherTarget.sunIntensity);
      sun.position.set(-60, 110, 70);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -125;
      sun.shadow.camera.right = 155;
      sun.shadow.camera.top = 175;
      sun.shadow.camera.bottom = -125;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 420;
      sun.shadow.bias = -0.0005;
      sun.shadow.normalBias = 0.03;
      this.scene.add(sun);
      this.scene.add(sun.target);
      this.lights.sun = sun;

      // Warm landmark accents (cheap; no shadows).
      const accents = [
        { x: -28, y: 12, z: -28, color: 0xffc46b },
        { x: 35, y: 10, z: 30, color: 0x7de8ff },
        { x: 0, y: 8, z: 0, color: 0x46ffd3 }
      ];
      this.accentLights = accents.map((a) => {
        const light = new THREE.PointLight(a.color, 0.7, 70, 2);
        light.position.set(a.x, a.y, a.z);
        this.scene.add(light);
        return light;
      });
    }

    buildGround() {
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x11201a, roughness: 0.96, metalness: 0.05 });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.14;
      ground.receiveShadow = true;
      this.scene.add(ground);

      this.asphaltTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
        ctx.fillStyle = '#252a28';
        ctx.fillRect(0, 0, w, h);
        const rng = mulberry32(777);
        for (let i = 0; i < 2600; i++) {
          const v = 30 + Math.floor(rng() * 34);
          ctx.fillStyle = 'rgba(' + v + ',' + (v + 3) + ',' + (v + 1) + ',0.55)';
          const s = rng() * 2.2 + 0.4;
          ctx.fillRect(rng() * w, rng() * h, s, s);
        }
        ctx.strokeStyle = 'rgba(10,12,11,0.32)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          const x = rng() * w;
          ctx.moveTo(x, 0);
          ctx.bezierCurveTo(x + 30, h * 0.3, x - 30, h * 0.7, x + 10, h);
          ctx.stroke();
        }
      }, { repeat: [10, 10] });
      this.asphaltMat = new THREE.MeshStandardMaterial({ map: this.asphaltTex, color: 0xffffff, roughness: 0.92, metalness: 0.06 });

      this.sidewalkTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#7b8079';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(40,44,41,0.55)';
        ctx.lineWidth = 3;
        for (let x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i < 60; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
      }, { repeat: [4, 20] });
      this.sidewalkMat = new THREE.MeshStandardMaterial({ map: this.sidewalkTex, color: 0x9aa096, roughness: 0.94, metalness: 0.02 });

      this.whiteLineMat = new THREE.MeshStandardMaterial({ color: 0xddebd8, roughness: 0.7, emissive: 0x2a352c, emissiveIntensity: 0.3 });
      this.goldLineMat = new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.55, emissive: PALETTE.gold, emissiveIntensity: 0.35 });
      this.railMat = new THREE.MeshStandardMaterial({ color: 0xc7d2cd, roughness: 0.26, metalness: 0.95 });
      this.sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3a403b, roughness: 0.88, metalness: 0.12 });
      this.trackBedMat = new THREE.MeshStandardMaterial({ color: 0x353b37, roughness: 0.9, metalness: 0.1 });
    }

    buildRoads() {
      const road = (w, d, x, z) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.asphaltMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.01, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
      };

      road(22, 190, 0, 30);        // Swanston Street
      road(280, 22, 0, 0);         // Flinders Street
      road(18, 210, 60, 55);       // Spring / Exhibition Street (extended north)
      road(86, 18, 30, -40);       // Yarra Street
      road(86, 18, 30, 100);       // La Trobe / University Street
      road(20, 170, -72, 30);      // West street
      road(280, 18, 0, 72);        // Collins-like street
      road(90, 18, 105, 25);       // Collins Street east
      road(18, 150, 100, 80);      // Spring Street north / Parliament
      road(100, 18, 80, 140);      // La Trobe / Queensberry north

      const walk = (w, d, x, z, h) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h || 0.22, d), this.sidewalkMat);
        mesh.position.set(x, (h || 0.22) / 2, z);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        this.scene.add(mesh);
        return mesh;
      };

      // Swanston sidewalks
      walk(3.4, 92, -12.7, 28);
      walk(3.4, 92, 12.7, 28);
      walk(3.4, 44, -12.7, -60);
      walk(3.4, 44, 12.7, -60);
      // Flinders sidewalks
      walk(150, 3.4, -96, -12.7);
      walk(150, 3.4, 96, -12.7);
      walk(64, 3.4, 35, 12.7);
      // East / Spring street sidewalks
      walk(3, 92, 50.5, 28);
      walk(3, 92, 70.5, 28);
      walk(3, 66, 50.5, 120);
      walk(3, 66, 70.5, 120);
      // Collins Street sidewalks
      walk(92, 3, 105, 15.5);
      walk(92, 3, 105, 34.5);
      // Spring / Parliament sidewalks
      walk(3, 140, 90.5, 82);
      walk(3, 140, 109.5, 82);
      // Northern La Trobe sidewalks
      walk(100, 3, 80, 129.5);
      walk(100, 3, 80, 150.5);
      // Plaza edges
      walk(60, 3, 40, -50.5);
      walk(60, 3, 40, 109);
      // Yarra bank promenade
      walk(280, 8, 0, -58, 0.3);

      this.addLaneMarking(0, -50, 0, -14, 5, 3);
      this.addLaneMarking(0, 9, 0, 120, 12, 3);
      this.addLaneMarking(-130, 0, -14, 0, 14, 3);
      this.addLaneMarking(14, 0, 130, 0, 14, 3);
      this.addLaneMarking(62, 25, 142, 25, 8, 9);
      this.addLaneMarking(100, 30, 100, 140, 10, 9);
      this.addLaneMarking(60, 102, 60, 145, 5, 8);
      this.addLaneMarking(30, 140, 126, 140, 9, 9);

      // Crosswalks around the Flinders / Swanston intersection.
      this.addCrosswalk(0, 12.4, 'x');
      this.addCrosswalk(0, -12.4, 'x');
      this.addCrosswalk(-12.4, 0, 'z');
      this.addCrosswalk(12.4, 0, 'z');
      this.addCrosswalk(60, 18, 'x');
      this.addCrosswalk(100, 18, 'x');
      this.addCrosswalk(100, 32.4, 'x');
      this.addCrosswalk(60, 140, 'x');
      this.addCrosswalk(100, 140, 'x');

      // Painted hook turn box reference at the north-east corner.
      const hookBox = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshStandardMaterial({ color: 0xf6c800, transparent: true, opacity: 0.42, roughness: 0.8 }));
      hookBox.rotation.x = -Math.PI / 2;
      hookBox.position.set(16, 0.035, 7);
      this.scene.add(hookBox);
      const hookOutline = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(9, 7)),
        new THREE.LineBasicMaterial({ color: 0xffd54a })
      );
      hookOutline.rotation.x = -Math.PI / 2;
      hookOutline.position.set(16, 0.05, 7);
      this.scene.add(hookOutline);
    }

    addLaneMarking(x1, z1, x2, z2, count, spacing) {
      const group = new THREE.Group();
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const ux = dx / len;
      const uz = dz / len;
      for (let i = 0; i < count; i++) {
        const t = (i * spacing) / len;
        if (t > 1) break;
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 2.6), this.whiteLineMat);
        dash.rotation.x = -Math.PI / 2;
        dash.rotation.z = Math.atan2(ux, uz);
        dash.position.set(x1 + ux * (i * spacing), 0.035, z1 + uz * (i * spacing));
        group.add(dash);
      }
      this.scene.add(group);
      return group;
    }

    addCrosswalk(x, z, axis) {
      const group = new THREE.Group();
      for (let i = -5; i <= 5; i++) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 5), this.whiteLineMat);
        stripe.rotation.x = -Math.PI / 2;
        if (axis === 'x') {
          stripe.position.set(x + i * 1.3, 0.04, z);
        } else {
          stripe.position.set(x, 0.04, z + i * 1.3);
          stripe.rotation.z = Math.PI / 2;
        }
        group.add(stripe);
      }
      this.scene.add(group);
      return group;
    }

    buildTrackWork() {
      const geometry = this.ribbonGeometry(3.5, 0.055, 700);
      const bed = new THREE.Mesh(geometry, this.trackBedMat);
      bed.receiveShadow = true;
      this.scene.add(bed);

      // Two embedded rails.
      const samples = 500;
      const makeRail = (offset) => {
        const pts = [];
        for (let i = 0; i < samples; i++) {
          const u = i / samples;
          const p = this.tram.curve.getPointAt(u);
          const t = this.tram.curve.getTangentAt(u);
          const nx = -t.z;
          const nz = t.x;
          pts.push(new THREE.Vector3(p.x + nx * offset, 0.135, p.z + nz * offset));
        }
        const railCurve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.08);
        const rail = new THREE.Mesh(new THREE.TubeGeometry(railCurve, 800, 0.058, 6, true), this.railMat);
        rail.castShadow = true;
        rail.receiveShadow = true;
        this.scene.add(rail);
        return rail;
      };
      makeRail(-0.72);
      makeRail(0.72);

      // Concrete sleepers.
      const sleeperCount = Math.floor(this.tram.length / 2.25);
      const sleeperGeo = new THREE.BoxGeometry(3.05, 0.075, 0.34);
      const sleepers = new THREE.InstancedMesh(sleeperGeo, this.sleeperMat, sleeperCount);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < sleeperCount; i++) {
        const s = (i / sleeperCount) * this.tram.length;
        const u = s / this.tram.length;
        const p = this.tram.curve.getPointAt(u);
        const t = this.tram.curve.getTangentAt(u);
        dummy.position.set(p.x, 0.095, p.z);
        dummy.rotation.set(0, Math.atan2(t.x, t.z), 0);
        dummy.updateMatrix();
        sleepers.setMatrixAt(i, dummy.matrix);
      }
      sleepers.instanceMatrix.needsUpdate = true;
      sleepers.receiveShadow = true;
      this.scene.add(sleepers);

      // Overhead wires.
      const wirePts = [];
      const messengerPts = [];
      const dropperPts = [];
      for (let i = 0; i <= 360; i++) {
        const u = i / 360;
        const p = this.tram.curve.getPointAt(u);
        const sag = Math.sin(u * Math.PI * 2 * 24) * 0.035;
        wirePts.push(new THREE.Vector3(p.x, 6.25 + sag, p.z));
        messengerPts.push(new THREE.Vector3(p.x, 7.05, p.z));
        if (i % 5 === 0) {
          dropperPts.push(p.x, 6.25, p.z, p.x, 7.05, p.z);
        }
      }
      const wireMat = new THREE.LineBasicMaterial({ color: 0x1d2c27, transparent: true, opacity: 0.9 });
      const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePts);
      this.scene.add(new THREE.Line(wireGeo, wireMat));
      this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(messengerPts), wireMat));
      const dropperGeo = new THREE.BufferGeometry();
      dropperGeo.setAttribute('position', new THREE.Float32BufferAttribute(dropperPts, 3));
      this.scene.add(new THREE.LineSegments(dropperGeo, wireMat));

      // Catenary poles every 26 m.
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x3d4a44, roughness: 0.55, metalness: 0.7 });
      const insulatorMat = new THREE.MeshStandardMaterial({ color: 0xd8cfa8, roughness: 0.6 });
      const poleCount = Math.floor(this.tram.length / 26);
      this.poles = new THREE.Group();
      for (let i = 0; i < poleCount; i++) {
        const u = (i / poleCount);
        const p = this.tram.curve.getPointAt(u);
        const t = this.tram.curve.getTangentAt(u);
        const outward = new THREE.Vector3(p.x - LOOP_CENTER.x, 0, p.z - LOOP_CENTER.z).normalize();
        const base = new THREE.Vector3(p.x + outward.x * 5.1, 0, p.z + outward.z * 5.1);
        const top = new THREE.Vector3(base.x, 7.35, base.z);
        this.poles.add(this.bar(base.x, 0.2, base.z, top.x, top.y, top.z, 0.11, poleMat));
        const armEnd = new THREE.Vector3(p.x, 7.0, p.z);
        this.poles.add(this.bar(base.x, 7.02, base.z, armEnd.x, armEnd.y, armEnd.z, 0.07, poleMat));
        const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 8), insulatorMat);
        ins.position.set(p.x, 6.75, p.z);
        this.poles.add(ins);
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), this.sidewalkMat);
        foot.position.set(base.x, 0.17, base.z);
        this.poles.add(foot);
      }
      this.scene.add(this.poles);
    }

    ribbonGeometry(width, y, samples) {
      const positions = [];
      const uvs = [];
      const indices = [];
      const half = width / 2;
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const p = this.tram.curve.getPointAt(u);
        const t = this.tram.curve.getTangentAt(u);
        const nx = -t.z;
        const nz = t.x;
        positions.push(p.x + nx * half, y, p.z + nz * half);
        positions.push(p.x - nx * half, y, p.z - nz * half);
        uvs.push(0, u * 90, 1, u * 90);
        if (i < samples) {
          const a = i * 2;
          indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    }

    bar(ax, ay, az, bx, by, bz, radius, mat) {
      const a = new THREE.Vector3(ax, ay, az);
      const b = new THREE.Vector3(bx, by, bz);
      const dir = b.clone().sub(a);
      const len = dir.length();
      if (len < 0.0001) return new THREE.Group();
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 8), mat);
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
      mesh.castShadow = true;
      return mesh;
    }

    /* ---- Landmarks ------------------------------------------------------- */

    buildLandmarks() {
      this.buildStation();
      this.buildFederationSquare();
      this.buildMelbourneUni();
      this.buildYarra();
    }

    buildStation() {
      const station = new THREE.Group();
      station.name = 'Flinders Street Station';
      const cream = new THREE.MeshStandardMaterial({ color: 0xd9c89c, roughness: 0.82, metalness: 0.05 });
      const creamLight = new THREE.MeshStandardMaterial({ color: 0xe8dab4, roughness: 0.78 });
      const copper = new THREE.MeshStandardMaterial({ color: 0x2f7d63, roughness: 0.45, metalness: 0.55, emissive: 0x0d2f24, emissiveIntensity: 0.35 });
      const darkGlass = new THREE.MeshStandardMaterial({ color: 0x14201c, roughness: 0.25, metalness: 0.6 });
      const trim = new THREE.MeshStandardMaterial({ color: 0x8f7c4d, roughness: 0.5, metalness: 0.4 });

      // Main hall.
      const hall = new THREE.Mesh(new THREE.BoxGeometry(60, 15, 22), cream);
      hall.position.set(-34, 7.5, -36);
      hall.castShadow = true;
      hall.receiveShadow = true;
      station.add(hall);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(62, 1.5, 24), copper);
      roof.position.set(-34, 15.7, -36);
      roof.castShadow = true;
      station.add(roof);

      // Detailed cream façade with arches and the station name.
      const facadeTex = makeCanvasTexture(1024, 300, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#e9dbb6');
        grd.addColorStop(1, '#c9b786');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8f7c4d';
        ctx.fillRect(0, 0, w, 14);
        ctx.fillRect(0, h - 18, w, 18);
        for (let i = 0; i < 9; i++) {
          const x = 34 + i * 108;
          ctx.fillStyle = '#d4c495';
          ctx.beginPath();
          ctx.arc(x + 36, 82, 30, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(x + 6, 82, 60, 92);
          ctx.fillStyle = '#1b2a25';
          ctx.beginPath();
          ctx.arc(x + 36, 88, 22, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(x + 14, 88, 44, 76);
          ctx.fillStyle = 'rgba(150,220,220,0.2)';
          ctx.fillRect(x + 18, 94, 12, 52);
          ctx.fillStyle = '#8f7c4d';
          ctx.fillRect(x, 168, 72, 6);
          ctx.fillRect(x + 32, 62, 8, 130);
        }
        ctx.fillStyle = '#0d3b2a';
        ctx.fillRect(0, 182, w, 48);
        ctx.fillStyle = '#f6c800';
        ctx.font = '900 34px Orbitron, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FLINDERS STREET STATION', w / 2, 217);
        ctx.fillStyle = '#46ffd3';
        ctx.font = '700 14px Rajdhani, Arial, sans-serif';
        ctx.fillText('MELBOURNE · EST. 1854 · REIMAGINED 2088', w / 2, 242);
      });
      facadeTex.wrapS = facadeTex.wrapT = THREE.ClampToEdgeWrapping;
      const facade = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.78, emissiveMap: facadeTex, emissive: 0xffffff, emissiveIntensity: 0.12 }));
      facade.position.set(-34, 8, -24.9);
      station.add(facade);

      // Recessed corner entrance beneath the clock tower.
      const arch = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 6.4), new THREE.MeshStandardMaterial({ color: 0x08110d, roughness: 0.4, metalness: 0.25 }));
      arch.position.set(-9.5, 3.5, -24.82);
      station.add(arch);
      const archTrim = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.22, 8, 28, Math.PI), trim);
      archTrim.position.set(-9.5, 5.3, -24.72);
      station.add(archTrim);
      const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.2), new THREE.MeshBasicMaterial({ color: 0xffd894, transparent: true, opacity: 0.16 }));
      doorGlow.position.set(-9.5, 2.4, -24.8);
      station.add(doorGlow);
      for (let i = 0; i < 4; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(11 - i * 0.8, 0.22, 1.05), creamLight);
        step.position.set(-9.5, 0.13 + i * 0.22, -23.3 + i * 0.85);
        step.receiveShadow = true;
        station.add(step);
      }
      for (let i = 0; i < 2; i++) {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 6, 12), creamLight);
        column.position.set(-15.1 + i * 11.2, 3.1, -24.2);
        column.castShadow = true;
        station.add(column);
      }

      // Dome.
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.2, 4.4, 20), creamLight);
      drum.position.set(-34, 17.4, -36);
      drum.castShadow = true;
      station.add(drum);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(5.6, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2), copper);
      dome.position.set(-34, 19.6, -36);
      dome.castShadow = true;
      station.add(dome);
      const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.4, 8), trim);
      finial.position.set(-34, 26.1, -36);
      station.add(finial);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf6c800, emissive: 0xf6c800, emissiveIntensity: 0.7, metalness: 0.9, roughness: 0.2 }));
      orb.position.set(-34, 27.8, -36);
      station.add(orb);

      // Clock tower at the eastern end.
      const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 13, 8), creamLight);
      tower.position.set(-6, 21, -36);
      tower.castShadow = true;
      station.add(tower);
      const clockTex = makeCanvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#f4e9c8';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#12241c';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 92, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 5;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(w / 2 + Math.cos(a) * 74, h / 2 + Math.sin(a) * 74);
          ctx.lineTo(w / 2 + Math.cos(a) * 86, h / 2 + Math.sin(a) * 86);
          ctx.stroke();
        }
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + 40, h / 2 - 32);
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 - 14, h / 2 - 56);
        ctx.stroke();
        ctx.fillStyle = '#12241c';
        ctx.font = '700 22px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2088', w / 2, h - 20);
      });
      const clockMat = new THREE.MeshStandardMaterial({ map: clockTex, emissiveMap: clockTex, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.6 });
      const clockGeom = new THREE.PlaneGeometry(4.6, 4.6);
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((rot) => {
        const face = new THREE.Mesh(clockGeom, clockMat);
        face.position.set(-6, 25, -36);
        face.rotation.y = rot;
        face.translateZ(4.02);
        if (rot === 0 || rot === Math.PI) face.position.y = 25;
        station.add(face);
      });
      const towerCap = new THREE.Mesh(new THREE.ConeGeometry(6, 4.2, 4), copper);
      towerCap.position.set(-6, 30, -36);
      towerCap.rotation.y = Math.PI / 4;
      station.add(towerCap);

      // Side elevations so the station reads from every approach.
      const sideTex = makeCanvasTexture(512, 300, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#e4d6ae');
        grd.addColorStop(1, '#c7b482');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8f7c4d';
        ctx.fillRect(0, 0, w, 12);
        ctx.fillRect(0, h - 16, w, 16);
        for (let i = 0; i < 5; i++) {
          const x = 28 + i * 96;
          ctx.fillStyle = '#1b2a25';
          roundRectPath(ctx, x, 74, 58, 120, 24);
          ctx.fill();
          ctx.strokeStyle = '#8f7c4d';
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.fillStyle = 'rgba(150,220,220,0.18)';
          ctx.fillRect(x + 9, 84, 15, 100);
        }
        ctx.fillStyle = '#0d3b2a';
        ctx.fillRect(0, 212, w, 40);
        ctx.fillStyle = '#f6c800';
        ctx.font = '900 24px Orbitron, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FLINDERS STREET', w / 2, 240);
      });
      sideTex.wrapS = sideTex.wrapT = THREE.ClampToEdgeWrapping;
      const sideMat = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.8, emissiveMap: sideTex, emissive: 0xffffff, emissiveIntensity: 0.1 });
      [-64.05, -3.95].forEach((x, i) => {
        const face = new THREE.Mesh(new THREE.PlaneGeometry(21.6, 12.4), sideMat);
        face.position.set(x, 7.7, -36);
        face.rotation.y = i === 0 ? -Math.PI / 2 : Math.PI / 2;
        station.add(face);
      });
      const backFace = new THREE.Mesh(new THREE.PlaneGeometry(54, 12.2), sideMat);
      backFace.position.set(-34, 7.5, -47.05);
      backFace.rotation.y = Math.PI;
      station.add(backFace);
      // Tower windows.
      const towerGlass = new THREE.MeshStandardMaterial({ color: 0x14201c, roughness: 0.24, metalness: 0.55 });
      [[-10.05, 20.5, -36, Math.PI / 2], [-1.95, 20.5, -36, -Math.PI / 2], [-6, 20.5, -31.95, Math.PI], [-6, 20.5, -40.05, 0]].forEach(([x, y, z, ry]) => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.4), towerGlass);
        win.position.set(x, y, z);
        win.rotation.y = ry;
        station.add(win);
      });

      this.station = station;
      this.scene.add(station);
    }

    buildFederationSquare() {
      const group = new THREE.Group();
      group.name = 'Federation Square';

      const pavingTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
        const rng = mulberry32(4242);
        ctx.fillStyle = '#6a6f6a';
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 64) {
          for (let x = 0; x < w; x += 64) {
            const v = 96 + Math.floor(rng() * 42);
            ctx.fillStyle = 'rgb(' + v + ',' + (v + 4) + ',' + (v - 2) + ')';
            ctx.fillRect(x + 2, y + 2, 60, 60);
          }
        }
        ctx.strokeStyle = 'rgba(30,36,34,0.5)';
        ctx.lineWidth = 3;
        for (let i = 0; i <= w; i += 64) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }
      }, { repeat: [4, 4] });
      const plaza = new THREE.Mesh(new THREE.BoxGeometry(46, 0.35, 48), new THREE.MeshStandardMaterial({ map: pavingTex, roughness: 0.9 }));
      plaza.position.set(39, 0.1, 34);
      plaza.receiveShadow = true;
      group.add(plaza);

      const panelTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
        const rng = mulberry32(5150);
        ctx.fillStyle = '#4a585f';
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 52) {
          for (let x = 0; x < w; x += 74) {
            const v = 58 + Math.floor(rng() * 26);
            ctx.fillStyle = 'rgb(' + v + ',' + (v + 10) + ',' + (v + 14) + ')';
            ctx.fillRect(x + 2, y + 2, 70, 48);
            if (rng() > 0.55) {
              ctx.fillStyle = rng() > 0.5 ? 'rgba(120,245,230,0.5)' : 'rgba(255,214,140,0.42)';
              ctx.fillRect(x + 10, y + 12, 22, 16);
            }
          }
        }
        ctx.strokeStyle = 'rgba(16,28,30,0.7)';
        ctx.lineWidth = 4;
        for (let y = 0; y <= h; y += 52) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        for (let x = 0; x <= w; x += 74) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        ctx.fillStyle = 'rgba(70,255,211,0.18)';
        ctx.fillRect(0, 210, w, 3);
      });
      const glassTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, w, h);
        grd.addColorStop(0, '#1d5b5d');
        grd.addColorStop(0.45, '#0c2f35');
        grd.addColorStop(1, '#2b7c78');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(150,255,240,0.2)';
        ctx.lineWidth = 3;
        for (let x = 0; x <= w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y <= h; y += 72) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
        ctx.fillStyle = 'rgba(190,255,245,0.16)';
        for (let i = 0; i < 6; i++) ctx.fillRect(20 + i * 80, 0, 22, h);
        ctx.fillStyle = 'rgba(246,200,0,0.18)';
        for (let i = 0; i < 22; i++) ctx.fillRect(10 + Math.random() * (w - 30), 12 + Math.random() * (h - 30), 8, 8);
      });
      const zinc = new THREE.MeshStandardMaterial({ map: panelTex, color: 0xa5b2b8, roughness: 0.52, metalness: 0.52, emissiveMap: panelTex, emissive: 0xffffff, emissiveIntensity: 0.22 });
      const glass = new THREE.MeshStandardMaterial({ map: glassTex, color: 0x9fe2df, roughness: 0.14, metalness: 0.5, emissiveMap: glassTex, emissive: 0xffffff, emissiveIntensity: 0.42 });
      const faceted = new THREE.MeshStandardMaterial({ map: panelTex, color: 0x8a9aa2, roughness: 0.62, metalness: 0.42, flatShading: true });

      // Deconstructivist shards with neon-wrapped edges.
      const shards = [
        { x: 30, z: 24, w: 13, h: 15, d: 18, ry: 0.5, rz: 0.16, mat: zinc },
        { x: 46, z: 30, w: 11, h: 20, d: 14, ry: -0.35, rz: -0.2, mat: glass },
        { x: 33, z: 47, w: 16, h: 12, d: 11, ry: 0.24, rz: 0.24, mat: faceted },
        { x: 48, z: 48, w: 10, h: 17, d: 10, ry: 0.1, rz: -0.12, mat: zinc }
      ];
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x9bffe9, transparent: true, opacity: 0.5 });
      const bandMat = new THREE.MeshBasicMaterial({ color: 0x46ffd3, transparent: true, opacity: 0.65 });
      shards.forEach((s, index) => {
        const geo = new THREE.BoxGeometry(s.w, s.h, s.d);
        const box = new THREE.Mesh(geo, s.mat);
        box.position.set(s.x, s.h / 2 + 2, s.z);
        box.rotation.y = s.ry;
        box.rotation.z = s.rz;
        box.castShadow = true;
        box.receiveShadow = true;
        group.add(box);

        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
        edges.position.copy(box.position);
        edges.rotation.copy(box.rotation);
        group.add(edges);

        [0.34, 0.66].forEach((f, k) => {
          const band = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.12, 0.1, s.d + 0.12), bandMat.clone());
          band.material.opacity = k === 0 ? 0.55 : 0.3;
          band.position.copy(box.position);
          band.position.y = s.h * f + 2;
          band.rotation.copy(box.rotation);
          group.add(band);
        });
      });

      // Big public screen facing Swanston Street.
      const screenTex = makeCanvasTexture(512, 288, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, w, h);
        grd.addColorStop(0, '#062b22');
        grd.addColorStop(0.5, '#0c5d4c');
        grd.addColorStop(1, '#04201a');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#46ffd3';
        ctx.font = '900 38px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FED SQUARE', w / 2, 112);
        ctx.fillStyle = '#f6c800';
        ctx.font = '700 22px Rajdhani, sans-serif';
        ctx.fillText('MELBOURNE · LIVE FROM 2088', w / 2, 154);
        ctx.fillStyle = 'rgba(70,255,211,0.28)';
        for (let i = 0; i < 18; i++) {
          const bh = 8 + Math.random() * 48;
          ctx.fillRect(20 + i * 27, 238 - bh, 16, bh);
        }
        ctx.strokeStyle = 'rgba(70,255,211,0.5)';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, w - 16, h - 16);
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshBasicMaterial({ map: screenTex }));
      screen.position.set(20.4, 8.6, 31);
      screen.rotation.y = -Math.PI / 2;
      group.add(screen);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 10.4, 17.4), zinc);
      frame.position.set(20.8, 8.6, 31);
      group.add(frame);
      const screenLight = new THREE.PointLight(0x46ffd3, 1.4, 46, 2);
      screenLight.position.set(16.5, 9, 31);
      group.add(screenLight);

      // Amphitheatre steps.
      for (let i = 0; i < 5; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(18 - i * 1.4, 0.55, 4), new THREE.MeshStandardMaterial({ color: 0x777d77, roughness: 0.9 }));
        step.position.set(39, 0.28 + i * 0.55, 54 - i * 1.5);
        step.receiveShadow = true;
        group.add(step);
      }

      // Orange shard sculpture at the street corner.
      const orange = new THREE.MeshStandardMaterial({ color: 0xd9582e, roughness: 0.5, metalness: 0.35, emissive: 0x3a0f06, emissiveIntensity: 0.4 });
      const beamA = this.bar(23, 0.4, 14, 20, 12.5, 18, 0.4, orange);
      const beamB = this.bar(24.5, 0.4, 18, 27, 11, 14.5, 0.34, orange);
      const beamC = this.bar(22, 0.3, 16, 26, 8, 22, 0.28, orange);
      group.add(beamA, beamB, beamC);

      // Signage.
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.4), new THREE.MeshBasicMaterial({ map: makeSignTexture('FEDERATION SQUARE', 'ART · FOOD · CULTURE', { fontSize: 40 }) }));
      sign.position.set(39, 3.2, 58.4);
      group.add(sign);
      for (let i = 0; i < 8; i++) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x46ffd3, emissive: 0x46ffd3, emissiveIntensity: 1.2 }));
        strip.position.set(20 + i * 6, 0.34, 34);
        this.emissiveMats.push(strip.material);
        group.add(strip);
      }

      this.fedSquare = group;
      this.scene.add(group);
    }

    buildMelbourneUni() {
      const group = new THREE.Group();
      group.name = 'Melbourne University';
      const stone = new THREE.MeshStandardMaterial({ color: 0xc4b184, roughness: 0.86 });
      const stoneLight = new THREE.MeshStandardMaterial({ color: 0xdccca4, roughness: 0.82 });
      const roof = new THREE.MeshStandardMaterial({ color: 0x375348, roughness: 0.6, metalness: 0.4 });
      const glass = new THREE.MeshStandardMaterial({ color: 0x17251f, roughness: 0.28, metalness: 0.45 });

      const hall = new THREE.Mesh(new THREE.BoxGeometry(34, 12, 20), stone);
      hall.position.set(-34, 6, 92);
      hall.castShadow = true;
      hall.receiveShadow = true;
      group.add(hall);
      const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(36, 1.3, 22), roof);
      roofMesh.position.set(-34, 12.6, 92);
      roofMesh.castShadow = true;
      group.add(roofMesh);

      // Classical east elevation with tall arched windows.
      const facadeTex = makeCanvasTexture(1024, 512, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#e6d7b0');
        grd.addColorStop(1, '#c5b080');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8f7c4d';
        ctx.fillRect(0, 0, w, 16);
        ctx.fillRect(0, h - 20, w, 20);
        for (let i = 0; i < 5; i++) {
          const x = 70 + i * 186;
          ctx.fillStyle = '#d6c69b';
          ctx.beginPath();
          ctx.arc(x + 50, 170, 46, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(x, 170, 100, 170);
          ctx.fillStyle = '#17251f';
          ctx.beginPath();
          ctx.arc(x + 50, 178, 36, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(x + 14, 178, 72, 154);
          ctx.fillStyle = 'rgba(140,220,210,0.15)';
          ctx.fillRect(x + 22, 190, 20, 120);
          ctx.fillStyle = '#8f7c4d';
          ctx.fillRect(x - 8, 154, 116, 10);
        }
        ctx.fillStyle = '#0d3b2a';
        ctx.fillRect(0, 350, w, 62);
        ctx.fillStyle = 'rgba(246,200,0,0.7)';
        ctx.font = '700 20px Rajdhani, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EST. 1853', w / 2, 390);
      });
      facadeTex.wrapS = facadeTex.wrapT = THREE.ClampToEdgeWrapping;
      const facadeMat = new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.8, emissiveMap: facadeTex, emissive: 0xffffff, emissiveIntensity: 0.1 });
      const facade = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), facadeMat);
      facade.position.set(-16.92, 6.1, 92);
      facade.rotation.y = Math.PI / 2;
      group.add(facade);

      // Portico columns.
      for (let i = 0; i < 6; i++) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 9, 12), stoneLight);
        col.position.set(-15.7, 4.9, 83.5 + i * 3.4);
        col.castShadow = true;
        group.add(col);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 1.5), stoneLight);
        cap.position.set(-15.7, 9.5, 83.5 + i * 3.4);
        group.add(cap);
      }
      const entablature = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 20), stoneLight);
      entablature.position.set(-15.8, 10.3, 92);
      entablature.castShadow = true;
      group.add(entablature);

      // Triangular pediment.
      const pedShape = new THREE.Shape();
      pedShape.moveTo(-10.5, 0);
      pedShape.lineTo(10.5, 0);
      pedShape.lineTo(0, 4.2);
      pedShape.closePath();
      const pedGeo = new THREE.ExtrudeGeometry(pedShape, { depth: 1.3, bevelEnabled: false });
      const pediment = new THREE.Mesh(pedGeo, stoneLight);
      pediment.rotation.y = Math.PI / 2;
      pediment.position.set(-16.4, 10.9, 92);
      pediment.castShadow = true;
      group.add(pediment);

      // University name board above the pediment.
      const uniSign = new THREE.Mesh(
        new THREE.PlaneGeometry(19, 2.5),
        new THREE.MeshBasicMaterial({ map: makeSignTexture('MELBOURNE UNIVERSITY', 'EST. 1853 · 2088', { fontSize: 34 }), side: THREE.DoubleSide })
      );
      uniSign.position.set(-16.4, 15.6, 92);
      uniSign.rotation.y = Math.PI / 2;
      group.add(uniSign);
      const signPostMat = new THREE.MeshStandardMaterial({ color: 0x5a6248, roughness: 0.7, metalness: 0.4 });
      [86, 98].forEach((z) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 6), signPostMat);
        post.position.set(-16.4, 14.3, z);
        group.add(post);
      });

      // Steps and lawn.
      const stepMat = new THREE.MeshStandardMaterial({ color: 0xb8a678, roughness: 0.9 });
      for (let i = 0; i < 4; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 12 - i * 0.9), stepMat);
        step.position.set(-14.9 + i * 0.9, 0.12 + i * 0.24, 92);
        step.receiveShadow = true;
        group.add(step);
      }
      const lawn = new THREE.Mesh(new THREE.PlaneGeometry(24, 30), new THREE.MeshStandardMaterial({ color: 0x28583a, roughness: 1 }));
      lawn.rotation.x = -Math.PI / 2;
      lawn.position.set(-5, 0.05, 92);
      group.add(lawn);

      // Courtyard lamps.
      const lampMat = new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffc46b, emissiveIntensity: 1.2 });
      [[-2, 80], [-2, 104]].forEach(([x, z]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.4, 8), roof);
        post.position.set(x, 2.2, z);
        group.add(post);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampMat);
        bulb.position.set(x, 4.5, z);
        group.add(bulb);
      });

      this.uni = group;
      this.scene.add(group);
    }

    buildYarra() {
      const group = new THREE.Group();
      group.name = 'Yarra River';

      const waterTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#2f8f9d');
        grd.addColorStop(0.5, '#1d6572');
        grd.addColorStop(1, '#2f8f9d');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(190,255,245,0.16)';
        const rng = mulberry32(818);
        for (let i = 0; i < 90; i++) {
          ctx.lineWidth = 1 + rng() * 3;
          const y = rng() * h;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(w * 0.3, y + 14, w * 0.6, y - 12, w, y + 3);
          ctx.stroke();
        }
      }, { repeat: [5, 3] });
      const waterMat = new THREE.MeshStandardMaterial({ map: waterTex, color: 0xbfeef0, roughness: 0.12, metalness: 0.65, transparent: true, opacity: 0.94, emissive: 0x0d3a3a, emissiveIntensity: 0.35 });
      const water = new THREE.Mesh(new THREE.PlaneGeometry(420, 100), waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, -0.55, -113);
      group.add(water);
      this.waterMat = waterMat;
      this.waterTex = waterTex;

      const bankMat = new THREE.MeshStandardMaterial({ color: 0x4b5148, roughness: 0.95 });
      const bankA = new THREE.Mesh(new THREE.BoxGeometry(420, 1.4, 7), bankMat);
      bankA.position.set(0, 0.1, -62);
      group.add(bankA);
      const bankB = new THREE.Mesh(new THREE.BoxGeometry(420, 1.4, 7), bankMat);
      bankB.position.set(0, 0.1, -164);
      group.add(bankB);

      // Princes Bridge.
      const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x737a70, roughness: 0.88 });
      const deck = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 112), bridgeMat);
      deck.position.set(0, 1.4, -112);
      deck.castShadow = true;
      group.add(deck);
      for (let i = 0; i < 4; i++) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(7, 1, 8, 20, Math.PI), bridgeMat);
        arch.rotation.y = Math.PI / 2;
        arch.position.set(0, -5.6, -81 - i * 19);
        group.add(arch);
      }
      const railMat = new THREE.MeshStandardMaterial({ color: 0x2c3a34, roughness: 0.6, metalness: 0.6 });
      [-9.6, 9.6].forEach((x) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 112), railMat);
        rail.position.set(x, 2.4, -112);
        group.add(rail);
      });
      for (let i = 0; i < 10; i++) {
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 5.5, 8), railMat);
        lamp.position.set(9.6, 5, -62 - i * 11);
        group.add(lamp);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffc46b, emissiveIntensity: 1.4 }));
        bulb.position.set(9.6, 7.8, -62 - i * 11);
        group.add(bulb);
      }

      // Southbank skyline silhouettes.
      const rng = mulberry32(2088);
      const skylineMat = new THREE.MeshStandardMaterial({ color: 0x1a2b2a, roughness: 0.8, metalness: 0.25, emissive: 0x07110f, emissiveIntensity: 0.5 });
      for (let i = 0; i < 24; i++) {
        const w = 8 + rng() * 16;
        const h = 18 + rng() * 58;
        const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, 9 + rng() * 8), skylineMat);
        tower.position.set(-200 + i * 18 + rng() * 6, h / 2, -186 - rng() * 26);
        group.add(tower);
      }

      this.yarra = group;
      this.scene.add(group);
    }

    /* ---- City fill ------------------------------------------------------- */

    buildCity() {
      const rng = mulberry32(8088);
      const tints = ['#1d2a2b', '#223033', '#20282c', '#25302e', '#1a2430'];
      this.buildingTextures = tints.map((tint, i) => makeWindowTexture(300 + i * 71, tint));
      this.buildingMats = this.buildingTextures.map((tex) => {
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.72,
          metalness: 0.22,
          emissiveMap: tex,
          emissive: 0xffffff,
          emissiveIntensity: 0.4
        });
        this.windowMats.push(mat);
        return mat;
      });

      const exclude = [
        { x0: -66, x1: -2, z0: -52, z1: -18 }, // station
        { x0: -52, x1: -8, z0: 74, z1: 108 }, // university
        { x0: 16, x1: 64, z0: 10, z1: 60 },    // federation square
        { x0: -18, x1: 74, z0: -14, z1: 14 },  // Flinders/Swanston junction
        { x0: -16, x1: 76, z0: -56, z1: -24 },
        { x0: -16, x1: 76, z0: 84, z1: 114 },
        { x0: 90, x1: 110, z0: 16, z1: 150 },  // Spring / Parliament corridor
        { x0: 52, x1: 150, z0: 15, z1: 35 },   // Collins Street East
        { x0: 30, x1: 132, z0: 130, z1: 151 }, // La Trobe / Queensberry
        { x0: 50, x1: 70, z0: 94, z1: 150 },   // Spring north / RMIT
        { x0: 68, x1: 98, z0: 106, z1: 136 },  // RMIT campus
        { x0: 106, x1: 134, z0: 50, z1: 80 },  // Parliament House
        { x0: 62, x1: 98, z0: 36, z1: 56 },    // Collins north landmark
        { x0: 62, x1: 98, z0: 0, z1: 16 }      // Collins south landmark
      ];
      const overlaps = (r) => exclude.some((e) => r.x0 < e.x1 && r.x1 > e.x0 && r.z0 < e.z1 && r.z1 > e.z0);
      const roadCorridors = [
        { x0: -11, x1: 11, z0: -70, z1: 150 },     // Swanston
        { x0: -140, x1: 140, z0: -11, z1: 11 },    // Flinders
        { x0: 51, x1: 69, z0: -60, z1: 150 },      // Spring / Exhibition
        { x0: -70, x1: 70, z0: -49, z1: -31 },     // Yarra / south edge
        { x0: -30, x1: 75, z0: 91, z1: 109 },      // La Trobe / University
        { x0: 91, x1: 109, z0: 5, z1: 150 },       // Spring North / Parliament
        { x0: 52, x1: 150, z0: 16, z1: 34 },       // Collins Street East
        { x0: 30, x1: 132, z0: 130, z1: 150 },     // La Trobe / Queensberry
        { x0: -82, x1: -62, z0: -60, z1: 150 }     // West / Spencer
      ];
      const nearRoad = (r) => roadCorridors.some((e) => r.x0 < e.x1 && r.x1 > e.x0 && r.z0 < e.z1 && r.z1 > e.z0);

      const cells = [];
      for (let x = -116; x < -20; x += 26) {
        for (let z = -74; z < 132; z += 30) cells.push({ x, z });
      }
      for (let x = 78; x < 156; x += 27) {
        for (let z = -66; z < 166; z += 30) cells.push({ x, z });
      }
      for (let x = -160; x < -80; x += 26) {
        for (let z = -50; z < 160; z += 32) cells.push({ x, z });
      }
      for (let x = 2; x < 56; x += 26) {
        for (let z = 102; z < 140; z += 28) cells.push({ x, z });
      }

      cells.forEach((cell, i) => {
        const w = 12 + rng() * 9;
        const d = 12 + rng() * 9;
        const h = 9 + rng() * 30;
        const x = cell.x + (rng() - 0.5) * 5;
        const z = cell.z + (rng() - 0.5) * 5;
        const rect = { x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 };
        if (overlaps(rect) || nearRoad(rect)) return;
        this.addBuilding(x, z, w, d, h, rng, i);
      });

      // Add a few taller towers farther out.
      const towerSpots = [
        { x: -148, z: 60, w: 20, d: 20, h: 58 },
        { x: 152, z: 58, w: 18, d: 18, h: 64 },
        { x: 104, z: -34, w: 22, d: 18, h: 48 },
        { x: -140, z: -8, w: 16, d: 20, h: 42 },
        { x: 126, z: 112, w: 18, d: 20, h: 56 },
        { x: 82, z: 78, w: 16, d: 18, h: 46 },
        { x: 82, z: 158, w: 18, d: 16, h: 38 }
      ];
      towerSpots.forEach((t, i) => this.addBuilding(t.x, t.z, t.w, t.d, t.h, rng, 900 + i, true));
    }

    buildCBDLandmarks() {
      this.buildParliamentHouse();
      this.buildRMIT();
      this.buildCollinsStreet();
    }

    buildParliamentHouse() {
      const group = new THREE.Group();
      group.name = 'Parliament House';
      const stone = new THREE.MeshStandardMaterial({ color: 0xcfc4a5, roughness: 0.84 });
      const stoneLight = new THREE.MeshStandardMaterial({ color: 0xe0d6b8, roughness: 0.8 });
      const copper = new THREE.MeshStandardMaterial({ color: 0x2f7d63, roughness: 0.42, metalness: 0.5, emissive: 0x0b2a20, emissiveIntensity: 0.3 });

      const hall = new THREE.Mesh(new THREE.BoxGeometry(16, 11, 28), stone);
      hall.position.set(120, 5.5, 65);
      hall.castShadow = true;
      hall.receiveShadow = true;
      group.add(hall);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(17, 1.3, 29), copper);
      roof.position.set(120, 11.8, 65);
      group.add(roof);

      const facadeTex = makeCanvasTexture(1024, 420, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#e6dbbd');
        grd.addColorStop(1, '#c6b98f');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8f7c4d';
        ctx.fillRect(0, 0, w, 14);
        ctx.fillRect(0, h - 16, w, 16);
        // pediment
        ctx.fillStyle = '#d5c8a4';
        ctx.beginPath();
        ctx.moveTo(0, 96);
        ctx.lineTo(w / 2, 16);
        ctx.lineTo(w, 96);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8f7c4d';
        ctx.lineWidth = 6;
        ctx.stroke();
        // windows and pilasters
        for (let i = 0; i < 7; i++) {
          const x = 80 + i * 124;
          ctx.fillStyle = '#1b2a25';
          roundRectPath(ctx, x, 150, 62, 150, 24);
          ctx.fill();
          ctx.strokeStyle = '#8f7c4d';
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.fillStyle = 'rgba(160,235,220,0.18)';
          ctx.fillRect(x + 10, 160, 18, 124);
          ctx.fillStyle = '#d5c8a4';
          ctx.fillRect(x - 16, 128, 18, 184);
        }
        ctx.fillStyle = '#0d3b2a';
        ctx.fillRect(0, 326, w, 62);
        ctx.fillStyle = '#f6c800';
        ctx.font = '900 34px Orbitron, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PARLIAMENT OF VICTORIA', w / 2, 366);
      });
      facadeTex.wrapS = facadeTex.wrapT = THREE.ClampToEdgeWrapping;
      const facade = new THREE.Mesh(
        new THREE.PlaneGeometry(28, 11),
        new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.78, emissiveMap: facadeTex, emissive: 0xffffff, emissiveIntensity: 0.1 })
      );
      facade.position.set(111.92, 5.5, 65);
      facade.rotation.y = -Math.PI / 2;
      group.add(facade);

      for (let i = 0; i < 7; i++) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.6, 9.2, 10), stoneLight);
        col.position.set(110.9, 4.8, 55 + i * 3.4);
        col.castShadow = true;
        group.add(col);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 1.4), stoneLight);
        cap.position.set(110.9, 9.5, 55 + i * 3.4);
        group.add(cap);
      }

      const drum = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.4, 3.2, 16), stoneLight);
      drum.position.set(120, 13.2, 65);
      group.add(drum);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(3.8, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), copper);
      dome.position.set(120, 14.8, 65);
      group.add(dome);
      const flag = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 4.2, 6), stoneLight);
      flag.position.set(120, 19.4, 65);
      group.add(flag);

      for (let i = 0; i < 5; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 22 - i * 1.2), stoneLight);
        step.position.set(109.8 - i * 0.9, 0.12 + i * 0.24, 65);
        step.receiveShadow = true;
        group.add(step);
      }

      const lawn = new THREE.Mesh(new THREE.PlaneGeometry(22, 30), new THREE.MeshStandardMaterial({ color: 0x28583a, roughness: 1 }));
      lawn.rotation.x = -Math.PI / 2;
      lawn.position.set(116, 0.05, 65);
      group.add(lawn);

      this.scene.add(group);
      this.parliament = group;
    }

    buildRMIT() {
      const group = new THREE.Group();
      group.name = 'RMIT University';
      const brickTex = this.buildingTextures && this.buildingTextures[1] ? this.buildingTextures[1] : null;
      const brick = new THREE.MeshStandardMaterial({ map: brickTex, color: 0xd08a70, roughness: 0.88, emissiveMap: brickTex, emissive: 0xffffff, emissiveIntensity: 0.14 });
      const brickLight = new THREE.MeshStandardMaterial({ color: 0xb06048, roughness: 0.82 });
      const glassMat = this.buildingMats && this.buildingMats[1]
        ? this.buildingMats[1]
        : new THREE.MeshStandardMaterial({ color: 0x24424a, roughness: 0.3, metalness: 0.55 });

      const podium = new THREE.Mesh(new THREE.BoxGeometry(18, 7, 22), brick);
      podium.position.set(84, 3.5, 120);
      podium.castShadow = true;
      podium.receiveShadow = true;
      group.add(podium);

      const tower = new THREE.Mesh(new THREE.BoxGeometry(14, 34, 16), glassMat);
      tower.position.set(86, 24, 122);
      tower.castShadow = true;
      group.add(tower);

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 28, 2.4), new THREE.MeshStandardMaterial({ color: 0xff5577, emissive: 0xff3355, emissiveIntensity: 1.4 }));
      stripe.position.set(78.9, 24, 124);
      group.add(stripe);

      const sign = new THREE.Mesh(new THREE.PlaneGeometry(17, 3), new THREE.MeshBasicMaterial({ map: makeSignTexture('RMIT UNIVERSITY', 'CITY CAMPUS · 2088', { fontSize: 44, fg: '#f6c800', accent: '#ff5577' }) }));
      sign.position.set(78.88, 14, 120);
      sign.rotation.y = -Math.PI / 2;
      group.add(sign);

      const podiumSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.3), new THREE.MeshBasicMaterial({ map: makeSignTexture('RMIT UNIVERSITY', 'CITY CAMPUS', { fontSize: 44, fg: '#f6c800', accent: '#ff5577' }) }));
      podiumSign.position.set(74.88, 5.2, 120);
      podiumSign.rotation.y = -Math.PI / 2;
      group.add(podiumSign);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0x2b3a35, roughness: 0.6, metalness: 0.4 }));
      awning.position.set(74.2, 3.2, 120);
      group.add(awning);

      const forecourt = new THREE.Mesh(new THREE.PlaneGeometry(10, 26), new THREE.MeshStandardMaterial({ color: 0x5a655c, roughness: 0.95 }));
      forecourt.rotation.x = -Math.PI / 2;
      forecourt.position.set(68, 0.04, 120);
      group.add(forecourt);

      const canopy = new THREE.Mesh(new THREE.BoxGeometry(8, 0.25, 13), new THREE.MeshStandardMaterial({ color: 0x2b3a35, roughness: 0.6, metalness: 0.4 }));
      canopy.position.set(74, 4.2, 120);
      group.add(canopy);
      for (let i = 0; i < 3; i++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4, 8), brickLight);
        post.position.set(70 + i * 3, 2.1, 114);
        group.add(post);
      }

      this.scene.add(group);
      this.rmit = group;
    }

    buildCollinsStreet() {
      const group = new THREE.Group();
      group.name = 'Collins Street';
      const collinsTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#ddcfae');
        grd.addColorStop(1, '#bfae82');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        for (let y = 26; y < h - 30; y += 64) {
          for (let x = 24; x < w - 30; x += 58) {
            const dark = 0.7 + Math.random() * 0.2;
            ctx.fillStyle = 'rgba(20, 36, 31, ' + dark + ')';
            roundRectPath(ctx, x, y, 34, 42, 8);
            ctx.fill();
            ctx.fillStyle = 'rgba(130, 230, 215, 0.2)';
            ctx.fillRect(x + 5, y + 6, 8, 28);
          }
          ctx.fillStyle = 'rgba(120, 100, 60, 0.4)';
          ctx.fillRect(0, y + 52, w, 3);
        }
        ctx.fillStyle = 'rgba(246, 200, 0, 0.25)';
        ctx.fillRect(0, 0, w, 5);
      });
      const stone = new THREE.MeshStandardMaterial({ map: collinsTex, color: 0xffffff, roughness: 0.82, emissiveMap: collinsTex, emissive: 0xffffff, emissiveIntensity: 0.12 });
      const stoneLight = new THREE.MeshStandardMaterial({ color: 0xded1b1, roughness: 0.78 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x15201b, roughness: 0.3, metalness: 0.5 });

      const north = new THREE.Mesh(new THREE.BoxGeometry(32, 20, 16), stone);
      north.position.set(80, 10, 50);
      north.castShadow = true;
      north.receiveShadow = true;
      group.add(north);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(33, 1.2, 17), stoneLight);
      cornice.position.set(80, 20.4, 50);
      group.add(cornice);

      for (let i = 0; i < 6; i++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(3, 5), dark);
        win.position.set(68 + i * 5, 10, 41.92);
        win.rotation.y = Math.PI;
        group.add(win);
      }
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.2), new THREE.MeshBasicMaterial({ map: makeSignTexture('COLLINS STREET', 'PARIS END · 2088', { fontSize: 44 }) }));
      sign.position.set(80, 4.2, 41.88);
      sign.rotation.y = Math.PI;
      group.add(sign);
      for (let i = 0; i < 4; i++) {
        const sideWin = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4.2), dark);
        sideWin.position.set(63.92, 8 + (i % 2) * 5, 43 + i * 3.4);
        sideWin.rotation.y = -Math.PI / 2;
        group.add(sideWin);
      }
      const sideSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.8), new THREE.MeshBasicMaterial({ map: makeSignTexture('COLLINS', 'PARIS END', { fontSize: 44 }), side: THREE.DoubleSide }));
      sideSign.position.set(63.85, 14.5, 50);
      sideSign.rotation.y = -Math.PI / 2;
      group.add(sideSign);

      for (let i = 0; i < 5; i++) {
        const awning = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 2.6), new THREE.MeshStandardMaterial({ color: 0x1b3d2e, roughness: 0.6, metalness: 0.3 }));
        awning.position.set(68 + i * 6, 3.6, 40.3);
        group.add(awning);
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.5, 6), stoneLight);
        post.position.set(66 + i * 6, 1.8, 39.2);
        group.add(post);
      }

      const south = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 13), stone);
      south.position.set(80, 7.5, 2);
      south.castShadow = true;
      group.add(south);
      const southSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 2), new THREE.MeshBasicMaterial({ map: makeSignTexture('PARIS END', 'COLLINS STREET', { fontSize: 44, fg: '#46ffd3' }) }));
      southSign.position.set(80, 4, 8.56);
      group.add(southSign);

      this.scene.add(group);
      this.collins = group;
    }

    addBuilding(x, z, w, d, h, rng, index, isTower) {
      const mat = this.buildingMats[index % this.buildingMats.length];
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      body.position.set(x, h / 2, z);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const capMat = new THREE.MeshStandardMaterial({ color: 0x1b2524, roughness: 0.9 });
      const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.6, d + 0.8), capMat);
      cap.position.set(x, h + 0.25, z);
      group.add(cap);

      if (rng() > 0.4) {
        const ac = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.8), capMat);
        ac.position.set(x + (rng() - 0.5) * w * 0.5, h + 1, z + (rng() - 0.5) * d * 0.5);
        group.add(ac);
      }
      if (isTower || rng() > 0.8) {
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 5 + rng() * 5, 6), capMat);
        antenna.position.set(x, h + 3, z);
        group.add(antenna);
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), new THREE.MeshStandardMaterial({ color: 0xff4d64, emissive: 0xff2244, emissiveIntensity: 2 }));
        beacon.position.set(x, h + 5.5 + rng() * 3, z);
        group.add(beacon);
      }

      // Neon shopfront sign on some street-facing buildings.
      if (rng() > 0.72) {
        const names = ['MYki', 'NIGHT OWL', 'SUSHI 2088', 'TRAM 2088', 'LANEWAY', 'FLINDERS', 'COFFEE', 'YARRA'];
        const name = names[Math.floor(rng() * names.length)];
        const signTex = makeSignTexture(name, null, { fontSize: 44, border: false, bg: 'rgba(3,18,13,0.9)', fg: rng() > 0.5 ? '#46ffd3' : '#f6c800' });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 2), new THREE.MeshBasicMaterial({ map: signTex, transparent: true }));
        const faceZ = z + (d / 2) + 0.06;
        sign.position.set(x, 3.2, faceZ);
        group.add(sign);
        const glow = new THREE.PointLight(rng() > 0.5 ? 0x46ffd3 : 0xf6c800, 0.35, 18, 2);
        glow.position.set(x, 3, faceZ + 1.5);
        group.add(glow);
      }

      this.scene.add(group);
    }

    /* ---- Street props ---------------------------------------------------- */

    buildStreetProps() {
      const rng = mulberry32(616);
      this.obstacles = [];
      this.traffic = [];
      this.lampLights = [];

      const poleMat = new THREE.MeshStandardMaterial({ color: 0x26332e, roughness: 0.5, metalness: 0.7 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd070, emissiveIntensity: 1.2, roughness: 0.4 });
      const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd070, emissiveIntensity: 1.2, roughness: 0.4 });

      const lampPositions = [
        [-13.5, 10], [13.5, 30], [-13.5, 50], [13.5, 70], [-13.5, 90],
        [-40, 13.5], [40, 13.5], [-80, 13.5], [80, 13.5],
        [50.5, 20], [70.5, 40], [50.5, 60], [30, -50.5], [50, -50.5],
        [90.5, 48], [90.5, 92], [109.5, 118], [70.5, 130], [80, 129.5],
        [80, 150.5], [50.5, 118], [109.5, 38]
      ];
      lampPositions.forEach(([x, z], i) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 6.4, 8), poleMat);
        pole.position.set(x, 3.2, z);
        pole.castShadow = true;
        this.scene.add(pole);
        const arm = this.bar(x, 6.3, z, x + (x < 0 ? 1.4 : -1.4), 6.3, z, 0.06, poleMat);
        this.scene.add(arm);
        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 8, 1, true), poleMat);
        shade.position.set(x + (x < 0 ? 1.4 : -1.4), 6.2, z);
        this.scene.add(shade);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), lightMat);
        bulb.position.set(x + (x < 0 ? 1.4 : -1.4), 6.08, z);
        this.scene.add(bulb);
        this.emissiveMats.push(lightMat);
        if (i % 3 === 0) {
          const light = new THREE.PointLight(0xffd28a, 0.7, 26, 2);
          light.position.set(x, 5.7, z);
          this.scene.add(light);
          this.lampLights.push(light);
        }
      });

      // Traffic lights at the Flinders/Swanston intersection.
      const corners = [
        { x: 13.5, z: 13.5, ry: -Math.PI * 0.75 },
        { x: -13.5, z: 13.5, ry: Math.PI * 0.75 },
        { x: 13.5, z: -13.5, ry: -Math.PI * 0.25 },
        { x: -13.5, z: -13.5, ry: Math.PI * 0.25 }
      ];
      this.signalLamps = [];
      corners.forEach((c) => {
        const group = new THREE.Group();
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 5.6, 8), poleMat);
        post.position.set(c.x, 2.8, c.z);
        group.add(post);
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x161d1a, roughness: 0.7 }));
        box.position.set(c.x, 4.7, c.z);
        box.rotation.y = c.ry;
        group.add(box);
        ['red', 'amber', 'green'].forEach((name, i) => {
          const color = name === 'red' ? 0xff3b55 : name === 'amber' ? 0xffb340 : 0x46ffd3;
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.25 }));
          lamp.position.set(c.x, 5.15 - i * 0.42, c.z + 0.22);
          lamp.userData.color = color;
          this.signalLamps.push(lamp);
          group.add(lamp);
        });
        this.scene.add(group);
      });

      // Trees along the sidewalks.
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2c1e, roughness: 1 });
      const leafMats = [
        new THREE.MeshStandardMaterial({ color: 0x1e5a36, roughness: 0.95, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0x2a6d42, roughness: 0.95, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0x184b2e, roughness: 0.95, flatShading: true })
      ];
      const treeSpots = [
        [-15.4, 22], [-15.4, 45], [-15.4, 68], [15.4, 12], [15.4, 82],
        [-30, 15.4], [-55, 15.4], [35, 15.4], [75, 15.4], [-20, -15.4], [20, -15.4],
        [53.5, 8], [53.5, 52], [67, 8], [67, 52], [10, 50], [10, 75],
        [90, 45], [90, 90], [110, 110], [80, 150], [50, 120], [70, 110],
        [110, 35], [80, 33]
      ];
      treeSpots.forEach(([x, z], i) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 2.6, 7), trunkMat);
        trunk.position.set(x, 1.4, z);
        trunk.castShadow = true;
        this.scene.add(trunk);
        const leafMat = leafMats[i % leafMats.length];
        for (let j = 0; j < 3; j++) {
          const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + rng() * 0.8, 0), leafMat);
          leaf.position.set(x + (rng() - 0.5) * 1.8, 3.2 + rng() * 1.6, z + (rng() - 0.5) * 1.8);
          leaf.castShadow = true;
          this.scene.add(leaf);
        }
        const grate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 1.6), new THREE.MeshStandardMaterial({ color: 0x333a35, roughness: 0.9 }));
        grate.position.set(x, 0.23, z);
        this.scene.add(grate);
        this.obstacles.push({ x: x, z: z, w: 0.5, d: 0.5, h: 2 });
      });

      // Parked cars and a couple of delivery vans.
      const carColors = [0xd6d8d2, 0x2f3b46, 0x7a1f2b, 0x2d5a4a, 0xc9a23c, 0x3b3f55];
      const parked = [
        { x: -22, z: 13.2, ry: 0 }, { x: 24, z: 13.2, ry: 0 }, { x: -62, z: 13.2, ry: 0 },
        { x: -35, z: -13.2, ry: Math.PI }, { x: 45, z: -13.2, ry: Math.PI },
        { x: 13.2, z: 44, ry: Math.PI / 2 }, { x: 13.2, z: 62, ry: Math.PI / 2 },
        { x: 56.8, z: 40, ry: -Math.PI / 2 }, { x: 56.8, z: 64, ry: -Math.PI / 2 },
        { x: -13.2, z: 34, ry: -Math.PI / 2 }
      ];
      parked.forEach((c, i) => {
        const car = this.makeCar(carColors[i % carColors.length], i === 3 || i === 6);
        car.position.set(c.x, 0.2, c.z);
        car.rotation.y = c.ry;
        this.scene.add(car);
        this.obstacles.push({ x: c.x, z: c.z, w: c.ry === 0 || c.ry === Math.PI ? 2.1 : 4.4, d: c.ry === 0 || c.ry === Math.PI ? 4.4 : 2.1, h: 1.6, car: true });
      });

      // Simple moving traffic on Flinders and the eastern street.
      this.makeTraffic([
        { axis: 'x', lane: -5, min: -128, max: 128, speed: 5.5, x: -40, dir: 1, color: 0xd0d2cc },
        { axis: 'x', lane: 5, min: -128, max: 128, speed: 6.2, x: 60, dir: -1, color: 0x33404b },
        { axis: 'x', lane: -8, min: -128, max: 128, speed: 4.4, x: 10, dir: 1, color: 0x8b2330 },
        { axis: 'z', lane: -5, min: -55, max: 118, speed: 5.8, x: 0, dir: 1, color: 0xc9a23c, z: 90 },
        { axis: 'z', lane: 5, min: -55, max: 118, speed: 4.9, x: 0, dir: -1, color: 0x3b5d55, z: 15 },
        { axis: 'z', lane: 8.5, min: -55, max: 118, speed: 6.6, x: 0, dir: 1, color: 0x6c7480, z: -20 }
      ]);

      // Bins and benches around the stops.
      const binMat = new THREE.MeshStandardMaterial({ color: 0x2e3b34, roughness: 0.8, metalness: 0.3 });
      [[-12, 18], [12, 24], [52, 18], [30, -47]].forEach(([x, z]) => {
        const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 1.05, 10), binMat);
        bin.position.set(x, 0.72, z);
        bin.castShadow = true;
        this.scene.add(bin);
      });
    }

    makeCar(color, van) {
      const group = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.42, metalness: 0.45 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x18292b, roughness: 0.15, metalness: 0.7 });
      const tyreMat = new THREE.MeshStandardMaterial({ color: 0x0c100f, roughness: 0.95 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.62, 4.1), bodyMat);
      body.position.y = 0.72;
      body.castShadow = true;
      group.add(body);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, van ? 2.8 : 2.1), glassMat);
      cabin.position.set(0, 1.25, van ? -0.2 : -0.25);
      cabin.castShadow = true;
      group.add(cabin);
      if (van) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.3, 2.6), bodyMat);
        box.position.set(0, 1.45, 0.85);
        group.add(box);
      }
      [-0.95, 0.95].forEach((x) => {
        [-1.3, 1.3].forEach((z) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 12), tyreMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(x, 0.4, z);
          group.add(wheel);
        });
      });
      const headMat = new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffe0a0, emissiveIntensity: 1.2 });
      [-0.62, 0.62].forEach((x) => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), headMat);
        h.position.set(x, 0.78, 2.05);
        group.add(h);
      });
      return group;
    }

    makeTraffic(defs) {
      defs.forEach((def) => {
        const car = this.makeCar(def.color, false);
        const state = Object.assign({ mesh: car }, def);
        if (def.axis === 'x') {
          car.position.set(def.x, 0.18, def.lane);
          car.rotation.y = def.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
          car.position.set(def.lane, 0.18, def.z);
          car.rotation.y = def.dir > 0 ? 0 : Math.PI;
        }
        this.scene.add(car);
        this.traffic.push(state);
      });
    }

    /* ---- Stops and passengers ------------------------------------------- */

    buildStops() {
      this.stops.forEach((stop) => {
        const group = new THREE.Group();
        const heading = Math.atan2(stop.tangent.x, stop.tangent.z);
        const px = stop.platform.x;
        const pz = stop.platform.z;
        const zinc = new THREE.MeshStandardMaterial({ color: 0x4f5a56, roughness: 0.5, metalness: 0.6 });
        const glass = new THREE.MeshStandardMaterial({ color: 0x183b38, roughness: 0.12, metalness: 0.7, transparent: true, opacity: 0.55 });
        const gold = new THREE.MeshStandardMaterial({ color: PALETTE.gold, emissive: PALETTE.gold, emissiveIntensity: 0.35, roughness: 0.5 });

        const platform = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.26, 16), this.sidewalkMat);
        platform.position.set(px, 0.2, pz);
        platform.rotation.y = heading;
        platform.receiveShadow = true;
        group.add(platform);

        const edge = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 16), gold);
        edge.position.set(px - stop.outward.x * 1.65, 0.34, pz - stop.outward.z * 1.65);
        edge.rotation.y = heading;
        group.add(edge);

        // Shelter.
        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.16, 9), new THREE.MeshStandardMaterial({ color: 0x1b3d2e, roughness: 0.5, metalness: 0.5 }));
        roof.position.set(px, 3.15, pz);
        roof.rotation.y = heading;
        roof.castShadow = true;
        group.add(roof);
        [-3.6, 0, 3.6].forEach((off) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.95, 8), zinc);
          post.position.set(px + stop.tangent.x * off - stop.outward.x * 0.9, 1.75, pz + stop.tangent.z * off - stop.outward.z * 0.9);
          group.add(post);
        });
        const backGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 8.4), glass);
        backGlass.position.set(px - stop.outward.x * 1.2, 1.9, pz - stop.outward.z * 1.2);
        backGlass.rotation.y = heading;
        group.add(backGlass);

        // Double-faced stop sign: one face to the tram, one to the platform.
        const signTex = makeSignTexture(stop.name.toUpperCase(), 'TRAM 2088', { fontSize: 38, bg: '#031a12', fg: '#f6c800' });
        const signMat = new THREE.MeshBasicMaterial({ map: signTex });
        const signToTrack = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.05), signMat);
        signToTrack.position.set(px, 3.56, pz);
        signToTrack.rotation.y = Math.atan2(-stop.outward.x, -stop.outward.z);
        group.add(signToTrack);
        const signToPlatform = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.05), signMat);
        signToPlatform.position.set(px, 3.56, pz);
        signToPlatform.rotation.y = Math.atan2(stop.outward.x, stop.outward.z);
        group.add(signToPlatform);
        const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 3.35, 6), zinc);
        signPost.position.set(px, 1.9, pz);
        group.add(signPost);

        // Myki validator, screen facing the platform.
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), zinc);
        pole.position.set(px + stop.tangent.x * 5.8, 1.5, pz + stop.tangent.z * 5.8);
        group.add(pole);
        const validatorGroup = new THREE.Group();
        validatorGroup.position.set(px + stop.tangent.x * 5.8, 1.75, pz + stop.tangent.z * 5.8);
        validatorGroup.rotation.y = Math.atan2(stop.outward.x, stop.outward.z);
        const validator = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.55, 0.22), new THREE.MeshStandardMaterial({ color: 0x0b1713, roughness: 0.4, metalness: 0.5 }));
        validatorGroup.add(validator);
        const validatorScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), new THREE.MeshBasicMaterial({ color: 0x46ffd3 }));
        validatorScreen.position.set(0, 0.07, 0.115);
        validatorGroup.add(validatorScreen);
        group.add(validatorGroup);

        // Bench.
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x5b3f28, roughness: 0.9 });
        const bench = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 3), benchMat);
        bench.position.set(px - stop.outward.x * 1.0, 0.95, pz - stop.outward.z * 1.0);
        bench.rotation.y = heading;
        group.add(bench);

        // Glowing platform marker on the road.
        const marker = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.1, 8, 32), new THREE.MeshBasicMaterial({ color: stop.hue, transparent: true, opacity: 0.85 }));
        marker.rotation.x = Math.PI / 2;
        marker.position.set(stop.point.x, 0.2, stop.point.z);
        group.add(marker);
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 0.35, 24, 1, true), new THREE.MeshBasicMaterial({ color: stop.hue, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
        beam.position.set(stop.point.x, 0.4, stop.point.z);
        group.add(beam);

        const light = new THREE.PointLight(stop.hue, 0.6, 22, 2);
        light.position.set(px, 3, pz);
        group.add(light);

        stop.group = group;
        stop.marker = marker;
        stop.beam = beam;
        stop.shelterPos = new THREE.Vector3(px, 0, pz);
        this.scene.add(group);
      });
    }

    makePerson(seed) {
      const rng = mulberry32(seed);
      const group = new THREE.Group();
      const skinTones = [0xf1c9a5, 0xd8a77c, 0xa9744f, 0x6b4a32, 0xf3d9be];
      const jacketColors = [0x2c4a5e, 0x703b45, 0x3f5d3a, 0x5a4a6e, 0xb5832f, 0x2d6b5e, 0x4b4b4b, 0x8a3d3d];
      const trouserColors = [0x202a33, 0x3a3d42, 0x2b3b2c, 0x4a3a2a];
      const skin = skinTones[Math.floor(rng() * skinTones.length)];
      const jacket = jacketColors[Math.floor(rng() * jacketColors.length)];
      const trousers = trouserColors[Math.floor(rng() * trouserColors.length)];

      const legMat = new THREE.MeshStandardMaterial({ color: trousers, roughness: 0.9 });
      const bodyMat = new THREE.MeshStandardMaterial({ color: jacket, roughness: 0.82 });
      const headMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.85 });
      const hairMat = new THREE.MeshStandardMaterial({ color: rng() > 0.5 ? 0x211a16 : 0x5b4128, roughness: 1 });

      [-0.09, 0.09].forEach((x) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.72, 6), legMat);
        leg.position.set(x, 0.36, 0);
        leg.castShadow = true;
        group.add(leg);
      });
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.72, 8), bodyMat);
      torso.position.y = 1.06;
      torso.castShadow = true;
      group.add(torso);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), headMat);
      head.position.y = 1.58;
      head.castShadow = true;
      group.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.165, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
      hair.position.y = 1.61;
      group.add(hair);

      // Bag.
      if (rng() > 0.55) {
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.12), new THREE.MeshStandardMaterial({ color: 0x18211d, roughness: 0.8 }));
        bag.position.set(0.24, 1.02, 0);
        group.add(bag);
      }

      const umbrella = new THREE.Mesh(
        new THREE.ConeGeometry(0.62, 0.32, 10),
        new THREE.MeshStandardMaterial({ color: jacketColors[Math.floor(rng() * jacketColors.length)], roughness: 0.75, side: THREE.DoubleSide })
      );
      umbrella.position.set(0, 2.04, 0);
      umbrella.visible = this.currentWeather === 'rain';
      group.add(umbrella);
      group.userData.umbrella = umbrella;
      group.userData.bobOffset = rng() * Math.PI * 2;
      group.userData.baseY = 0;
      return group;
    }

    buildPassengers() {
      let seed = 500;
      this.stops.forEach((stop) => {
        const count = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const person = this.makePerson(seed++);
          const along = (Math.random() - 0.5) * 11;
          const across = (Math.random() - 0.5) * 1.6;
          person.position.set(
            stop.platform.x + stop.tangent.x * along + stop.outward.x * across,
            0.34,
            stop.platform.z + stop.tangent.z * along + stop.outward.z * across
          );
          person.rotation.y = Math.random() * Math.PI * 2;
          this.scene.add(person);
          const rider = {
            mesh: person,
            stop: stop,
            state: 'waiting',
            bob: Math.random() * Math.PI * 2,
            delay: Math.random() * 1.2,
            along: along,
            across: across
          };
          stop.riders.push(rider);
          this.passengers.push(rider);
        }
      });
    }

    repopulateStop(stop) {
      const count = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const person = this.makePerson(9000 + Math.floor(Math.random() * 9999));
        const along = (Math.random() - 0.5) * 11;
        const across = (Math.random() - 0.5) * 1.6;
        person.position.set(
          stop.platform.x + stop.tangent.x * along + stop.outward.x * across,
          0.34,
          stop.platform.z + stop.tangent.z * along + stop.outward.z * across
        );
        person.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(person);
        const rider = { mesh: person, stop: stop, state: 'waiting', bob: Math.random() * Math.PI * 2, delay: Math.random() * 1.2, along: along, across: across };
        stop.riders.push(rider);
        this.passengers.push(rider);
      }
    }

    /* ---- The tram -------------------------------------------------------- */

    buildTram() {
      const group = new THREE.Group();
      group.name = 'W-Class Cyber Tram 2088';

      const green = new THREE.MeshStandardMaterial({ color: PALETTE.green, roughness: 0.34, metalness: 0.42 });
      const greenDark = new THREE.MeshStandardMaterial({ color: PALETTE.greenDark, roughness: 0.5, metalness: 0.35 });
      const cream = new THREE.MeshStandardMaterial({ color: PALETTE.cream, roughness: 0.48, metalness: 0.14 });
      const gold = new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.32, metalness: 0.65, emissive: PALETTE.gold, emissiveIntensity: 0.15 });
      const glass = new THREE.MeshStandardMaterial({ color: 0x0d2727, roughness: 0.08, metalness: 0.8, emissive: 0x0a3434, emissiveIntensity: 0.5 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x121816, roughness: 0.62, metalness: 0.5 });
      const neon = new THREE.MeshStandardMaterial({ color: 0x46ffd3, emissive: 0x46ffd3, emissiveIntensity: 1.8, roughness: 0.3 });
      const headMat = new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xffedb0, emissiveIntensity: 2.2 });
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2d4a, emissive: 0xff2d4a, emissiveIntensity: 1.6 });

      // Lower hull.
      const hull = new THREE.Mesh(new THREE.BoxGeometry(2.52, 1.5, 9.4), green);
      hull.position.y = 1.3;
      hull.castShadow = true;
      hull.receiveShadow = true;
      group.add(hull);

      // Skirt.
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 9.0), greenDark);
      skirt.position.y = 0.62;
      group.add(skirt);

      // Gold waistline.
      const waist = new THREE.Mesh(new THREE.BoxGeometry(2.56, 0.18, 9.42), gold);
      waist.position.y = 1.86;
      group.add(waist);

      // Cream upper saloon.
      const upper = new THREE.Mesh(new THREE.BoxGeometry(2.44, 1.2, 9.15), cream);
      upper.position.y = 2.56;
      upper.castShadow = true;
      group.add(upper);

      // Side window band with pillars.
      const sideTex = makeCanvasTexture(1024, 160, (ctx, w, h) => {
        ctx.fillStyle = '#0b7a3c';
        ctx.fillRect(0, 0, w, h);
        const cols = 8;
        for (let i = 0; i < cols; i++) {
          const x = 18 + i * (w / cols);
          const ww = w / cols - 32;
          const grd = ctx.createLinearGradient(0, 22, 0, h - 20);
          grd.addColorStop(0, '#123a3a');
          grd.addColorStop(0.5, '#0a2526');
          grd.addColorStop(1, '#061616');
          ctx.fillStyle = grd;
          roundRectPath(ctx, x, 22, ww, h - 44, 18);
          ctx.fill();
          ctx.strokeStyle = '#c9b57c';
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.fillStyle = 'rgba(70,255,211,0.16)';
          ctx.fillRect(x + 10, 30, ww * 0.3, h - 60);
          if (i < cols - 1) {
            ctx.fillStyle = '#e7dcba';
            ctx.fillRect(x + ww + 8, 0, 14, h);
          }
        }
      });
      sideTex.wrapS = sideTex.wrapT = THREE.ClampToEdgeWrapping;
      const sideMat = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.24, metalness: 0.45, emissiveMap: sideTex, emissive: 0xffffff, emissiveIntensity: 0.28 });
      [-1.235, 1.235].forEach((x) => {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(9.15, 1.2), sideMat);
        side.position.set(x, 2.58, 0);
        side.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2;
        group.add(side);
      });

      // Cab ends.
      const endL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 0.8), cream);
      endL.position.set(0, 2.2, 4.85);
      group.add(endL);
      const endR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 0.8), cream);
      endR.position.set(0, 2.2, -4.85);
      group.add(endR);

      // Cab windscreens.
      [-1, 1].forEach((dir) => {
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 0.9), glass);
        screen.position.set(0, 2.58, dir * 5.27);
        screen.rotation.y = dir > 0 ? 0 : Math.PI;
        group.add(screen);
      });

      // Destination signs.
      const destTex = makeSignTexture('2088  FLINDERS ST', 'CBD LOOP', { fontSize: 40, bg: '#0a0f0c', fg: '#f6c800', accent: '#46ffd3', border: false });
      [-1, 1].forEach((dir) => {
        const dest = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.6), new THREE.MeshBasicMaterial({ map: destTex }));
        dest.position.set(0, 3.16, dir * 5.27);
        dest.rotation.y = dir > 0 ? 0 : Math.PI;
        group.add(dest);
      });

      // Headlights / tail lights.
      [-0.78, 0.78].forEach((x) => {
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), headMat);
        head.position.set(x, 1.35, 5.12);
        group.add(head);
        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), tailMat);
        tail.position.set(x, 1.35, -5.12);
        group.add(tail);
      });

      // Doors with gold frames, dark doorways and a manual sliding action.
      const doorDark = new THREE.MeshBasicMaterial({ color: 0x040b08 });
      [-2.2, 2.2].forEach((z) => {
        [-1.27, 1.27].forEach((x) => {
          const frame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8, 1.5), gold);
          frame.position.set(x, 1.85, z);
          group.add(frame);
          const doorway = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 1.6), doorDark);
          doorway.position.set(x + (x > 0 ? -0.006 : 0.006), 1.85, z);
          doorway.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
          group.add(doorway);
          const door = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.62, 1.3), glass);
          door.position.set(x + (x > 0 ? 0.02 : -0.02), 1.85, z);
          group.add(door);
          this.tramDoors.push({
            mesh: door,
            baseZ: z,
            dir: z > 0 ? 1 : -1
          });
        });
      });

      // Roof and clerestory.
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.22, 8.7), cream);
      roof.position.y = 3.24;
      group.add(roof);
      const clerestory = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 8.3), greenDark);
      clerestory.position.y = 3.46;
      group.add(clerestory);

      // Bell and pantograph.
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), gold);
      bell.position.set(0, 3.62, 3.0);
      group.add(bell);
      this.tramBell = bell;

      const pantoMat = new THREE.MeshStandardMaterial({ color: 0x2f3a35, roughness: 0.4, metalness: 0.85 });
      const baseBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.12), pantoMat);
      baseBar.position.set(0, 3.58, -1.8);
      group.add(baseBar);
      const armA = this.bar(-0.55, 3.6, -2.1, 0, 4.5, -0.9, 0.035, pantoMat);
      const armB = this.bar(0.55, 3.6, -2.1, 0, 4.5, -0.9, 0.035, pantoMat);
      const armC = this.bar(0, 4.5, -0.9, 0, 4.9, -2.3, 0.035, pantoMat);
      const contact = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.14), pantoMat);
      contact.position.set(0, 4.92, -2.35);
      group.add(armA, armB, armC, contact);
      this.pantograph = [armA, armB, armC, contact];

      // Bogies and wheels.
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x151a18, roughness: 0.7, metalness: 0.7 });
      [-3.2, 3.2].forEach((z) => {
        const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.7), dark);
        bogie.position.set(0, 0.55, z);
        group.add(bogie);
        [-1.0, 1.0].forEach((x) => {
          [-0.5, 0.5].forEach((dz) => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.18, 14), wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, 0.42, z + dz);
            group.add(wheel);
          });
        });
      });

      // Neon underglow and side accents.
      [-1.28, 1.28].forEach((x) => {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 8.6), neon);
        strip.position.set(x, 0.72, 0);
        group.add(strip);
      });
      const under = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.04, 8.4), neon);
      under.position.set(0, 0.4, 0);
      group.add(under);
      const glow = new THREE.PointLight(0x46ffd3, 0.8, 14, 2);
      glow.position.set(0, 0.7, 0);
      group.add(glow);

      // Route number plates.
      const plateTex = makeSignTexture('2088', null, { fontSize: 80, bg: '#0a0f0c', fg: '#f6c800', border: true });
      [-1, 1].forEach((dir) => {
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.4), new THREE.MeshBasicMaterial({ map: plateTex }));
        plate.position.set(dir * 1.29, 2.15, 0);
        plate.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        group.add(plate);
      });

      // Interior glow.
      const interior = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 8.4), new THREE.MeshStandardMaterial({ color: 0xffe8b0, emissive: 0xffd070, emissiveIntensity: 1.1 }));
      interior.position.set(0, 2.2, 0);
      group.add(interior);

      group.position.set(this.tram.curve.getPointAt(this.tram.s / this.tram.length).x, 0.12, this.tram.curve.getPointAt(this.tram.s / this.tram.length).z);
      group.rotation.y = this.tram.heading;
      this.tramGroup = group;
      this.scene.add(group);

      this.tramHeadlight = new THREE.SpotLight(0xfff0c0, 1.8, 62, 0.48, 0.42, 1.4);
      this.tramHeadlight.position.set(0, 1.4, 5.1);
      this.tramHeadlight.target.position.set(0, 0.4, 24);
      group.add(this.tramHeadlight);
      group.add(this.tramHeadlight.target);
    }

    initPhysics() {
      const world = new CANNON.World();
      world.gravity.set(0, -9.82, 0);
      world.broadphase = new CANNON.SAPBroadphase(world);
      world.solver.iterations = 10;
      world.allowSleep = true;
      world.defaultContactMaterial.friction = 0.45;
      world.defaultContactMaterial.restitution = 0.06;
      this.world = world;

      const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
      ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      ground.position.y = 0;
      world.addBody(ground);

      // Static collision volumes for street furniture and parked vehicles.
      (this.obstacles || []).forEach((o) => {
        const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(o.w / 2, o.h / 2, o.d / 2)) });
        body.position.set(o.x, o.h / 2, o.z);
        body.userData = { type: o.car ? 'car' : 'prop' };
        world.addBody(body);
      });

      const tramShape = new CANNON.Box(new CANNON.Vec3(1.32, 1.5, 5.0));
      const body = new CANNON.Body({ mass: 12000, material: new CANNON.Material('tram') });
      body.addShape(tramShape);
      const start = this.tram.curve.getPointAt(this.tram.s / this.tram.length);
      body.position.set(start.x, 2.0, start.z);
      body.linearDamping = 0.02;
      body.angularDamping = 0.9;
      body.fixedRotation = true;
      body.allowSleep = false;
      body.updateMassProperties();
      body.userData = { type: 'tram' };
      world.addBody(body);
      this.tramBody = body;

      this.physicsAccumulator = 0;
      body.addEventListener('collide', (event) => {
        const other = event.body;
        if (!other || !other.userData) return;
        if (other.userData.type === 'car' || other.userData.type === 'prop') {
          this.onTramImpact(other);
        }
      });
    }

    onTramImpact(other) {
      if (this.time - (this.lastImpact || 0) < 2.5) return;
      this.lastImpact = this.time;
      this.audio.crash();
      this.tram.speed *= 0.45;
      this.toast('⚠️ Traffic contact — ease off and mind the intersection', 2800, 'danger');
    }

    /* ---- Weather FX ------------------------------------------------------ */

    buildWeatherFX() {
      const count = 1900;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 6);
      const speeds = new Float32Array(count);
      const lengths = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 160;
        const y = Math.random() * 60;
        const z = (Math.random() - 0.5) * 160;
        const len = 0.6 + Math.random() * 0.9;
        positions[i * 6] = x;
        positions[i * 6 + 1] = y;
        positions[i * 6 + 2] = z;
        positions[i * 6 + 3] = x;
        positions[i * 6 + 4] = y + len;
        positions[i * 6 + 5] = z;
        speeds[i] = 24 + Math.random() * 26;
        lengths[i] = len;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({ color: 0xa9d9ff, transparent: true, opacity: 0, depthWrite: false });
      this.rainDrops = new THREE.LineSegments(geo, mat);
      this.rainDrops.frustumCulled = false;
      this.rainSpeeds = speeds;
      this.rainLengths = lengths;
      this.scene.add(this.rainDrops);

      const puddleMat = new THREE.MeshStandardMaterial({ color: 0x8fc8d2, roughness: 0.05, metalness: 0.65, transparent: true, opacity: 0 });
      for (let i = 0; i < 10; i++) {
        const puddle = new THREE.Mesh(new THREE.CircleGeometry(1.1 + Math.random() * 1.7, 18), puddleMat.clone());
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set((Math.random() - 0.5) * 90, 0.045, (Math.random() - 0.5) * 150 + 20);
        this.scene.add(puddle);
        this.puddles.push(puddle);
      }
      this.puddleMat = puddleMat;
    }

    setWeather(name, silent) {
      if (!WEATHERS[name]) return;
      const changed = name !== this.currentWeather;
      this.currentWeather = name;
      this.weatherTarget = WEATHERS[name];
      document.body.dataset.weather = name;
      $$('.weather-btn').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.weather === name));
      this.audio.setRain(this.weatherTarget.rain > 0.5);
      this.audio.setWeatherMood(name);
      this.career.settings.weather = name;
      if (!silent) {
        this.toast('Weather set · ' + this.weatherTarget.label, 2600);
        this.audio.click();
      }
      if (changed) this.checkBadges();
      this.persist();
      // Update umbrellas instantly.
      (this.passengers || []).forEach((p) => {
        if (p.mesh.userData.umbrella) p.mesh.userData.umbrella.visible = name === 'rain';
      });
    }

    applyWeather(name, instant) {
      this.setWeather(name, true);
      const target = WEATHERS[name];
      const cur = this.weatherCurrent;
      ['skyTop', 'skyBottom', 'horizon', 'fog', 'sun', 'water'].forEach((key) => {
        if (!cur[key] || !cur[key].isColor) cur[key] = new THREE.Color(target[key]);
      });
      if (instant) {
        cur.fogNear = target.fogNear;
        cur.fogFar = target.fogFar;
        cur.sunIntensity = target.sunIntensity;
        cur.hemi = target.hemi;
        cur.ambient = target.ambient;
        cur.window = target.window;
        cur.lamp = target.lamp;
        cur.rain = target.rain;
        cur.star = target.star;
        cur.exposure = target.exposure;
        cur.skyTop.setHex(target.skyTop);
        cur.skyBottom.setHex(target.skyBottom);
        cur.horizon.setHex(target.horizon);
        cur.fog.setHex(target.fog);
        cur.sun.setHex(target.sun);
        cur.water.setHex(target.water);
        this.commitWeatherVisuals();
      }
      this.weatherMix = instant ? 0 : 1;
    }

    updateWeather(dt) {
      if (this.weatherMix <= 0) return;
      const t = this.weatherTarget;
      const c = this.weatherCurrent;
      const k = clamp(dt * 1.4, 0, 1);
      c.skyTop.lerp(new THREE.Color(t.skyTop), k);
      c.skyBottom.lerp(new THREE.Color(t.skyBottom), k);
      c.horizon.lerp(new THREE.Color(t.horizon), k);
      c.fog.lerp(new THREE.Color(t.fog), k);
      c.sun.lerp(new THREE.Color(t.sun), k);
      c.water.lerp(new THREE.Color(t.water), k);
      c.fogNear = damp(c.fogNear, t.fogNear, 2, dt);
      c.fogFar = damp(c.fogFar, t.fogFar, 2, dt);
      c.sunIntensity = damp(c.sunIntensity, t.sunIntensity, 2, dt);
      c.hemi = damp(c.hemi, t.hemi, 2, dt);
      c.ambient = damp(c.ambient, t.ambient, 2, dt);
      c.window = damp(c.window, t.window, 2, dt);
      c.lamp = damp(c.lamp, t.lamp, 2, dt);
      c.rain = damp(c.rain, t.rain, 2, dt);
      c.star = damp(c.star, t.star, 2, dt);
      c.exposure = damp(c.exposure, t.exposure, 2, dt);
      this.commitWeatherVisuals();
    }

    commitWeatherVisuals() {
      const c = this.weatherCurrent;
      if (this.skyUniforms) {
        this.skyUniforms.topColor.value.copy(c.skyTop);
        this.skyUniforms.bottomColor.value.copy(c.skyBottom);
        this.skyUniforms.horizonColor.value.copy(c.horizon);
      }
      this.scene.background = c.horizon;
      if (this.renderer) this.renderer.toneMappingExposure = c.exposure;
      if (this.scene.fog) {
        this.scene.fog.color.copy(c.fog);
        this.scene.fog.near = c.fogNear;
        this.scene.fog.far = c.fogFar;
      }
      if (this.lights) {
        this.lights.sun.color.copy(c.sun);
        this.lights.sun.intensity = c.sunIntensity;
        this.lights.hemi.intensity = c.hemi;
        this.lights.hemi.color.copy(c.skyTop);
        this.lights.ambient.intensity = c.ambient;
      }
      if (this.waterMat) this.waterMat.color.copy(c.water);
      this.windowMats.forEach((m) => { m.emissiveIntensity = c.window; });
      this.emissiveMats.forEach((m) => { m.emissiveIntensity = c.lamp * 1.2; });
      this.lampLights.forEach((l) => { l.intensity = c.lamp * 0.75; });
      if (this.rainDrops) {
        this.rainDrops.material.opacity = c.rain * 0.55;
        this.rainDrops.visible = c.rain > 0.05;
      }
      if (this.stars) this.stars.material.opacity = c.star;
      if (this.sunDisc) {
        this.sunDisc.material.opacity = 0.25 + c.sunIntensity * 0.55;
        this.sunDisc.material.color.copy(c.sun);
      }
      if (this.cloudMat) this.cloudMat.opacity = 0.28 + (1 - c.star) * 0.2 + c.rain * 0.25;
      this.puddles.forEach((p) => { p.material.opacity = c.rain * 0.34; });
      if (this.accentLights) this.accentLights.forEach((l) => { l.intensity = 0.45 + c.window * 0.3; });
      this.audio.setRain(c.rain > 0.5);
    }

    updateRain(dt) {
      if (!this.rainDrops || this.weatherCurrent.rain < 0.04) return;
      const pos = this.rainDrops.geometry.attributes.position;
      const arr = pos.array;
      const tramPos = this.tramGroup ? this.tramGroup.position : { x: 0, z: 0 };
      for (let i = 0; i < this.rainSpeeds.length; i++) {
        const b = i * 6;
        arr[b + 1] -= this.rainSpeeds[i] * dt;
        arr[b + 4] = arr[b + 1] + this.rainLengths[i];
        arr[b] -= dt * 6;
        arr[b + 3] = arr[b];
        if (arr[b + 1] < 0) {
          const x = tramPos.x + (Math.random() - 0.5) * 150;
          const z = tramPos.z + (Math.random() - 0.5) * 150;
          const y = 45 + Math.random() * 15;
          arr[b] = x; arr[b + 1] = y; arr[b + 2] = z;
          arr[b + 3] = x; arr[b + 4] = y + this.rainLengths[i]; arr[b + 5] = z;
        }
      }
      pos.needsUpdate = true;

      this.lightningTimer = (this.lightningTimer || 6 + Math.random() * 8) - dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 7 + Math.random() * 11;
        this.triggerLightning();
      }
    }

    triggerLightning() {
      if (this.currentWeather !== 'rain') return;
      const flash = this.dom.screenFlash;
      if (flash) {
        flash.style.transition = 'none';
        flash.style.opacity = '0.7';
        setTimeout(() => {
          flash.style.transition = 'opacity 0.8s';
          flash.style.opacity = '0';
        }, 90);
      }
      if (this.lights && this.lights.sun) {
        const base = this.weatherTarget.sunIntensity;
        this.lights.sun.intensity = base + 2.4;
        setTimeout(() => { if (this.lights && this.lights.sun) this.lights.sun.intensity = this.weatherTarget.sunIntensity; }, 120);
      }
      setTimeout(() => this.audio.thunder(), 500 + Math.random() * 500);
    }

    /* ---- Camera / gameplay loop ----------------------------------------- */

    setupCamera() {
      const p = this.tram.curve.getPointAt(this.tram.s / this.tram.length);
      const t = this.tram.curve.getTangentAt(this.tram.s / this.tram.length);
      this.camera.position.set(p.x - t.x * 21 + 7, 11, p.z - t.z * 21 + 7);
      this.controls.target.set(p.x, 2, p.z);
      this.controls.update();
      this.lastCameraTarget = this.controls.target.clone();
    }

    buildHookGame() {
      this.hook = new HookTurnGame(this);
      this.hook.init();
    }

    bindGameplay() {
      // Resume audio on first pointer interaction with the canvas (needed by Safari).
      const canvas = this.renderer && this.renderer.domElement;
      if (canvas) {
        canvas.addEventListener('pointerdown', (e) => {
          if (this.started) this.audio.ensure();
          if (this.viewMode !== 'driver') return;
          this.driverDragging = true;
          this.driverLookIdle = 0;
          this.driverLast = { x: e.clientX, y: e.clientY };
          document.body.classList.add('is-looking');
          if (canvas.setPointerCapture) {
            try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          }
        });
        canvas.addEventListener('pointermove', (e) => {
          if (!this.driverDragging || this.viewMode !== 'driver' || !this.driverLast) return;
          const dx = e.clientX - this.driverLast.x;
          const dy = e.clientY - this.driverLast.y;
          this.driverYaw = clamp(this.driverYaw + dx * 0.0035, -1.35, 1.35);
          this.driverPitch = clamp(this.driverPitch - dy * 0.0028, -0.55, 0.5);
          this.driverLast = { x: e.clientX, y: e.clientY };
          this.driverLookIdle = 0;
        });
        const endLook = (e) => {
          if (!this.driverDragging) return;
          this.driverDragging = false;
          this.driverLookIdle = 0;
          this.driverLast = null;
          document.body.classList.remove('is-looking');
          if (canvas.releasePointerCapture && e && e.pointerId !== undefined) {
            try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          }
        };
        canvas.addEventListener('pointerup', endLook);
        canvas.addEventListener('pointercancel', endLook);
      }
      window.addEventListener('blur', () => {
        this.keys = Object.create(null);
        this.driverDragging = false;
        document.body.classList.remove('is-looking');
      });
    }

    /* =======================================================================
       DRIVING, BOARDING, ANIMATION
       ===================================================================== */

    updateTram(dt) {
      if (!this.tramGroup) return;
      this.tram.bellCooldown = Math.max(0, this.tram.bellCooldown - dt);

      const doorsLocked = this.trip.doorState !== 'closed';
      const throttle = !doorsLocked && (this.keys.ArrowUp || this.keys.w || this.keys.W);
      const brake = this.keys.ArrowDown || this.keys.s || this.keys.S || doorsLocked;
      const handbrake = this.keys[' '];

      let speed = this.tram.speed;
      if (throttle) speed += 1.95 * dt;
      if (brake) speed -= (speed > 0 ? 4.6 : 1.7) * dt;
      if (handbrake) speed *= Math.pow(0.015, dt);
      if (!throttle && !brake && !handbrake) speed *= Math.pow(0.55, dt);
      speed = clamp(speed, this.tram.maxReverse, this.tram.maxSpeed);
      if (Math.abs(speed) < 0.02) speed = 0;
      if (doorsLocked) {
        speed = 0;
        if ((this.keys.ArrowUp || this.keys.w || this.keys.W) && this.time - this.lastDoorHint > 5) {
          this.lastDoorHint = this.time;
          this.toast('Doors are open — press O or DOORS to close before departing.', 2400);
        }
      }

      const next = this.getNextStop();
      if (next && !doorsLocked && this.started) {
        const ahead = this.distanceAhead(next);
        if (ahead > 10 && ahead < 38 && this.announcedStopId !== next.id && this.time - this.lastAnnouncementAt > 6) {
          this.announcedStopId = next.id;
          const nearby = this.formatNearby(next);
          this.announce('Next stop, ' + next.speechName + '.' + (nearby ? ' Get off here for ' + nearby + '.' : ''), 'stop');
        }
      }

      this.tram.speed = speed;
      const prevWrapped = mod(this.tram.s, this.tram.length);
      this.tram.s = mod(this.tram.s + speed * dt, this.tram.length);
      const dist = Math.abs(speed) * dt;
      this.trip.distance += dist;
      if (this.currentWeather === 'rain') this.trip.rainDistance += dist;
      this.career.stats.totalDistance += dist;
      if (this.currentWeather === 'rain') this.career.stats.rainDistance += dist;

      const nowWrapped = this.tram.s;
      if (speed > 0 && nowWrapped < prevWrapped && (prevWrapped - nowWrapped) > this.tram.length * 0.5) {
        this.trip.loops += 1;
        this.career.stats.loops += 1;
        this.trip.score += 250;
        this.toast('🔁 <b>City loop complete</b> · +250 · lap ' + this.trip.loops, 3800);
        this.audio.success();
        this.checkBadges();
      }

      const u = mod(this.tram.s / this.tram.length, 1);
      const p = this.tram.curve.getPointAt(u);
      const t = this.tram.curve.getTangentAt(u);
      const yaw = this.headingAtDistance(this.tram.s);
      const delta = Math.atan2(Math.sin(yaw - this.tram.heading), Math.cos(yaw - this.tram.heading));
      const step = clamp(delta * Math.min(1, dt * 14), -0.32, 0.32);
      this.tram.heading += step;
      this.tram.turnRate = step / Math.max(dt, 0.0001);

      this.tramGroup.position.set(p.x, 0.12, p.z);
      this.tramGroup.rotation.y = this.tram.heading;

      if (this.tramBody) {
        this.tramBody.position.set(p.x, 2.0, p.z);
        this.tramBody.velocity.set(t.x * speed, 0, t.z * speed);
        this.tramBody.angularVelocity.set(0, 0, 0);
        if (!this._cannonY) this._cannonY = new CANNON.Vec3(0, 1, 0);
        this.tramBody.quaternion.setFromAxisAngle(this._cannonY, this.tram.heading);
      }

      // Curve physics: wheel screech and rail clatter.
      const uAhead = mod(u + 0.0025, 1);
      const t2 = this.tram.curve.getTangentAt(uAhead);
      const cross = t.x * t2.z - t.z * t2.x;
      const dot = t.x * t2.x + t.z * t2.z;
      const turnAngle = Math.abs(Math.atan2(cross, dot));
      const curvature = turnAngle / (0.0025 * this.tram.length);
      const screech = clamp((Math.abs(speed) - 2.6) / 8, 0, 1) * clamp(curvature / 0.055, 0, 1);
      this.tram.screech = screech;
      this.audio.setScreech(screech);
      if (Math.abs(speed) > 1.2 && this.time - this.tram.lastClack > 1.05) {
        this.tram.lastClack = this.time;
        this.audio.clack();
      }

      if (this.pantograph) {
        const sway = Math.sin(this.time * 5.2) * 0.006 * (0.4 + Math.abs(speed) / 10);
        this.pantograph.forEach((part, i) => {
          if (part) part.rotation.z = sway * (i % 2 === 0 ? 1 : -1);
        });
      }
      if (this.tramBell) {
        this.tramBell.scale.setScalar(1 + Math.max(0, this.tram.bellCooldown - 0.24) * 0.8);
      }
      if (this.tramHeadlight) {
        this.tramHeadlight.intensity = this.currentWeather === 'sunny' ? 1.1 : 2.4;
      }
    }

    announce(text, chimeKind) {
      this.showAnnouncement(text);
      this.lastAnnouncementAt = this.time;
      if (this.audio.muted) return;
      this.audio.chime(chimeKind || 'stop');
      clearTimeout(this.announceTimer);
      this.announceTimer = setTimeout(() => this.audio.speak(text), 640);
    }

    formatNearby(stop) {
      const items = stop && Array.isArray(stop.nearby) ? stop.nearby : [];
      if (!items.length) return '';
      if (items.length === 1) return items[0];
      return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
    }

    showStopGuide(stop, force) {
      if (!stop || !this.dom.stopInfo) return;
      if (!force && this.guideStopId === stop.id) return;
      this.guideStopId = stop.id;
      const d = this.dom;
      if (d.stopInfoName) d.stopInfoName.textContent = stop.name;
      if (d.stopInfoBlurb) d.stopInfoBlurb.textContent = stop.blurb || '';
      if (d.stopInfoNearby) {
        d.stopInfoNearby.innerHTML = '';
        (stop.nearby || []).forEach((place) => {
          const chip = document.createElement('span');
          chip.textContent = place;
          d.stopInfoNearby.appendChild(chip);
        });
      }
      if (d.stopInfoLink) {
        d.stopInfoLink.href = stop.wiki || 'https://en.wikipedia.org/wiki/Melbourne';
        d.stopInfoLink.setAttribute('aria-label', 'Read more about ' + stop.name + ' on Wikipedia');
      }
      d.stopInfo.classList.add('show');
      d.stopInfo.setAttribute('aria-hidden', 'false');
      clearTimeout(this.guideTimer);
      this.guideTimer = setTimeout(() => this.hideStopGuide(), 15000);
    }

    hideStopGuide() {
      clearTimeout(this.guideTimer);
      this.guideTimer = null;
      if (this.dom.stopInfo) {
        this.dom.stopInfo.classList.remove('show');
        this.dom.stopInfo.setAttribute('aria-hidden', 'true');
      }
    }

    showAnnouncement(text) {
      const bar = this.dom.announcementBar;
      const copy = this.dom.announcementText;
      if (!bar || !copy) return;
      copy.textContent = text;
      bar.classList.add('show');
      clearTimeout(this.announceHideTimer);
      const ms = clamp(text.length * 78, 3800, 8200);
      this.announceHideTimer = setTimeout(() => bar.classList.remove('show'), ms);
    }

    toggleDoors() {
      if (!this.started) return;
      if (this.trip.doorState === 'open') {
        this.closeDoors();
      } else if (this.trip.doorState === 'closed') {
        this.openDoors();
      } else {
        this.audio.click();
      }
    }

    openDoors() {
      if (!this.started || this.trip.doorState !== 'closed') return;
      const stop = this.getPlatformStop();
      if (!stop) {
        this.audio.click();
        const next = this.getNextStop();
        if (next && Math.abs(this.tram.speed) < 1.4) {
          this.toast('Roll closer to the platform marker to release the doors.', 2800, 'danger');
          this.showAnnouncement('Doors locked. Move closer to the platform to open.');
        } else {
          this.toast('Doors locked while moving — stop at a platform first.', 2800, 'danger');
          this.showAnnouncement('Doors locked while the tram is moving.');
        }
        return;
      }

      const ahead = this.distanceAhead(stop);
      this.trip.doorState = 'opening';
      this.trip.doors = true;
      this.trip.doorTimer = 0.85;
      this.trip.doorStop = stop;
      this.trip.doorAnim = 0;
      this.tram.speed = 0;
      stop.servedAt = this.time;
      this.announcedStopId = null;
      this.audio.ensure();
      this.audio.doorHiss(true);
      this.audio.click();
      this.announce('Now arriving at ' + stop.speechName + '. Doors opening.', 'open');
      this.showStopGuide(stop);
      this.trip.perfectStopPending = ahead < 4.2;
      this.updateHud(true);
    }

    closeDoors() {
      if (this.trip.doorState !== 'open' && this.trip.doorState !== 'opening') return;
      this.trip.doorState = 'closing';
      this.trip.doorTimer = 0.85;
      this.tram.speed = 0;
      this.audio.doorHiss(false);
      this.announce('Doors closing. Please stand clear.', 'close');
      this.updateHud(true);
    }

    boardPassengers(stop) {
      if (!stop) return;
      const waiting = stop.riders.filter((r) => r.state === 'waiting');
      const perfect = this.trip.perfectStopPending || this.distanceAhead(stop) < 4.2;
      if (!waiting.length) {
        this.toast('🚏 ' + stop.name + ' · no passengers waiting', 2200);
        return;
      }

      let earned = waiting.length * 15;
      if (perfect) earned += 40;
      this.trip.score += earned;
      this.trip.passengers += waiting.length;
      this.career.stats.totalPassengers += waiting.length;

      waiting.forEach((rider, i) => {
        rider.state = 'boarding';
        rider.t = -i * 0.14;
        rider.start = rider.mesh.position.clone();
        setTimeout(() => { if (this.audio.ready) this.audio.myki(); }, 280 + i * 150);
      });

      const perfectText = perfect ? ' · perfect stop +40' : '';
      this.toast('💳 <b>' + waiting.length + ' tapped on</b> at ' + stop.short + ' · +' + earned + perfectText, 4200);
      this.audio.myki();
      this.respawnQueue = this.respawnQueue || [];
      this.respawnQueue.push({ stop: stop, at: this.time + 16 });
      this.career.stats.bestScore = Math.max(this.career.stats.bestScore, Math.floor(this.trip.score));
      this.checkBadges();
      this.refreshBadges();
      this.updateHud(true);
      this.drawMinimap();
    }

    updateDoors(dt) {
      if (!this.tramDoors) this.tramDoors = [];
      const state = this.trip.doorState;
      const target = state === 'opening' || state === 'open' ? 1 : 0;
      this.trip.doorAnim = damp(this.trip.doorAnim, target, 7, dt);
      this.tramDoors.forEach((door) => {
        door.mesh.position.z = door.baseZ + door.dir * 0.72 * this.trip.doorAnim;
      });

      if (state === 'opening') {
        this.trip.doorTimer -= dt;
        if (this.trip.doorTimer <= 0) {
          this.trip.doorState = 'open';
          this.trip.doorTimer = 0;
          this.boardPassengers(this.trip.doorStop);
          this.career.stats.bestScore = Math.max(this.career.stats.bestScore, Math.floor(this.trip.score));
          this.updateHud(true);
        }
      } else if (state === 'closing') {
        this.trip.doorTimer -= dt;
        if (this.trip.doorTimer <= 0) {
          this.trip.doorState = 'closed';
          this.trip.doorTimer = 0;
          this.trip.doors = false;
          this.trip.doorStop = null;
          this.announcedStopId = null;
          this.toast('🚪 Doors closed — ready to depart', 2000);
          this.updateHud(true);
        }
      }
    }

    updatePassengers(dt) {
      const doorPos = this.tramGroup ? this.tramGroup.position : null;
      this.passengers.forEach((rider) => {
        if (rider.state === 'gone') return;
        if (rider.state === 'waiting') {
          rider.bob += dt * 1.8;
          rider.mesh.position.y = 0.34 + Math.sin(rider.bob + rider.mesh.userData.bobOffset) * 0.014;
          return;
        }
        if (rider.state !== 'boarding') return;
        rider.t += dt;
        if (rider.t < 0) return;
        const progress = clamp(rider.t / 0.85, 0, 1);
        if (!doorPos) return;
        const tx = doorPos.x + (this.tram.heading ? Math.cos(this.tram.heading) * 1.8 : 1.8);
        const tz = doorPos.z - (this.tram.heading ? Math.sin(this.tram.heading) * 1.8 : 0);
        rider.mesh.position.x = lerp(rider.start.x, tx, progress);
        rider.mesh.position.z = lerp(rider.start.z, tz, progress);
        rider.mesh.position.y = lerp(0.34, 0.5, Math.sin(progress * Math.PI)) + 0.2;
        rider.mesh.rotation.y += dt * 5;
        rider.mesh.scale.setScalar(1 - progress * 0.85);
        if (progress >= 1) {
          rider.state = 'gone';
          this.scene.remove(rider.mesh);
          rider.mesh.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.material && o.material.dispose) o.material.dispose();
          });
        }
      });

      if (this.respawnQueue) {
        for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
          const job = this.respawnQueue[i];
          if (this.time < job.at) continue;
          const active = job.stop.riders.filter((r) => r.state === 'waiting' || r.state === 'boarding');
          if (active.length === 0) {
            this.repopulateStop(job.stop);
            job.stop.riders = job.stop.riders.filter((r) => r.state === 'waiting');
            this.respawnQueue.splice(i, 1);
          }
        }
      }
    }

    updateTraffic(dt) {
      const tramPos = this.tramGroup ? this.tramGroup.position : null;
      this.traffic.forEach((car) => {
        let factor = 1;
        if (tramPos) {
          const dx = car.mesh.position.x - tramPos.x;
          const dz = car.mesh.position.z - tramPos.z;
          if (dx * dx + dz * dz < 240) factor = 0.25;
        }
        if (car.axis === 'x') {
          car.x += car.speed * car.dir * factor * dt;
          if (car.x > car.max) car.x = car.min;
          if (car.x < car.min) car.x = car.max;
          car.mesh.position.x = car.x;
          car.mesh.position.z = car.lane;
        } else {
          car.z += car.speed * car.dir * factor * dt;
          if (car.z > car.max) car.z = car.min;
          if (car.z < car.min) car.z = car.max;
          car.mesh.position.z = car.z;
          car.mesh.position.x = car.lane;
        }
      });
    }

    updateSignalCycle() {
      if (!this.signalLamps) return;
      const cycle = this.time % 12;
      const state = cycle < 6 ? 'green' : cycle < 8 ? 'amber' : 'red';
      this.signalLamps.forEach((lamp) => {
        const isGreen = lamp.userData.color === 0x46ffd3;
        const isAmber = lamp.userData.color === 0xffb340;
        const active = (state === 'green' && isGreen) || (state === 'amber' && isAmber) || (state === 'red' && !isGreen && !isAmber);
        lamp.material.emissiveIntensity = active ? 1.9 : 0.12;
        lamp.material.color.setHex(active ? lamp.userData.color : 0x1b2320);
      });
    }

    updateClouds(dt) {
      if (!this.clouds) return;
      this.clouds.rotation.y += dt * 0.0035;
      this.clouds.position.y = Math.sin(this.time * 0.03) * 2;
    }

    toggleView() {
      this.setViewMode(this.viewMode === 'driver' ? 'chase' : 'driver');
    }

    setViewMode(mode, silent) {
      const next = mode === 'driver' ? 'driver' : 'chase';
      if (this.viewMode === next) return;
      this.viewMode = next;
      const driver = next === 'driver';
      document.body.classList.toggle('view-driver', driver);
      if (this.controls) this.controls.enabled = !driver;
      if (this.camera) {
        this.camera.fov = driver ? 66 : 55;
        this.camera.updateProjectionMatrix();
      }
      const btn = this.dom.viewBtn;
      if (btn) {
        btn.classList.toggle('is-active', driver);
        btn.setAttribute('aria-pressed', driver ? 'true' : 'false');
        const icon = btn.querySelector('.tool-icon');
        if (icon) icon.textContent = driver ? '🚘' : '🎥';
        btn.title = driver ? 'Chase view (V)' : 'Driver view (V)';
      }
      if (driver) {
        this.driverYaw = 0;
        this.driverPitch = 0;
        this.driverDragging = false;
        this.driverLookIdle = 0;
        document.body.classList.remove('is-looking');
      } else if (this.started) {
        this.recenterRequested = true;
      }
      if (!silent) {
        this.audio.click();
        this.toast(driver
          ? '🚘 <b>Driver\'s cab</b> · drag to look · V for chase'
          : '🎥 Chase camera · V for the driver\'s cab', 3200);
      }
    }

    updateDriverCamera(dt) {
      if (!this.tramGroup) return;
      const p = this.tramGroup.position;
      const heading = this.tram.heading;
      const fx = Math.sin(heading);
      const fz = Math.cos(heading);
      const speedRatio = clamp(Math.abs(this.tram.speed) / this.tram.maxSpeed, 0, 1);
      const bob = Math.sin(this.time * 8.4) * 0.01 * speedRatio + Math.sin(this.time * 2.1) * 0.003;
      const camX = p.x + fx * 5.55;
      const camY = 2.86 + bob;
      const camZ = p.z + fz * 5.55;

      this.camera.position.set(camX, camY, camZ);

      if (!this.driverDragging) {
        this.driverLookIdle += dt;
        if (this.driverLookIdle > 2.4) {
          this.driverYaw = damp(this.driverYaw, 0, 1.6, dt);
          this.driverPitch = damp(this.driverPitch, 0, 1.6, dt);
        }
      }

      const yaw = heading + this.driverYaw;
      const pitch = this.driverPitch - 0.055;
      const cosP = Math.cos(pitch);
      const dirX = Math.sin(yaw) * cosP;
      const dirY = Math.sin(pitch);
      const dirZ = Math.cos(yaw) * cosP;
      this.camera.lookAt(camX + dirX * 60, camY + dirY * 60, camZ + dirZ * 60);
      this.camera.rotateZ(clamp((this.tram.turnRate || 0) * 0.018, -0.03, 0.03));

      const targetFov = 66 + speedRatio * 4;
      if (Math.abs(this.camera.fov - targetFov) > 0.06) {
        this.camera.fov = targetFov;
        this.camera.updateProjectionMatrix();
      }
      this.controls.target.set(camX + fx * 24, 2.0, camZ + fz * 24);
    }

    updateCamera(dt) {
      if (!this.camera || !this.controls) return;
      if (this.started && this.viewMode === 'driver') {
        this.updateDriverCamera(dt);
        return;
      }
      if (SHOT_MODE) {
        const p = this.tramGroup ? this.tramGroup.position : new THREE.Vector3(0, 0, 30);
        const u = mod(this.tram.s / this.tram.length, 1);
        const t = this.tram.curve.getTangentAt(u);
        const side = new THREE.Vector3(-t.z, 0, t.x);
        const view = params.get('view');
        if (view === 'hero') {
          this.camera.position.set(16, 12.5, 68);
          this.camera.lookAt(0, 2.5, 22);
        } else if (view === 'station') {
          this.camera.position.set(34, 17, 6);
          this.camera.lookAt(-30, 8, -32);
        } else if (view === 'fed') {
          this.camera.position.set(-6, 17, 56);
          this.camera.lookAt(40, 8, 28);
        } else if (view === 'tram') {
          this.camera.position.set(21, 6.2, 44);
          this.camera.lookAt(0, 2.4, 28);
        } else if (view === 'yarra') {
          this.camera.position.set(34, 12, -8);
          this.camera.lookAt(0, 2, -70);
        } else if (view === 'uni') {
          this.camera.position.set(28, 13, 56);
          this.camera.lookAt(-28, 7, 94);
        } else if (view === 'collins') {
          this.camera.position.set(48, 19, 60);
          this.camera.lookAt(82, 4, 22);
        } else if (view === 'parliament') {
          this.camera.position.set(68, 21, 104);
          this.camera.lookAt(102, 5, 64);
        } else if (view === 'rmit') {
          this.camera.position.set(32, 22, 154);
          this.camera.lookAt(62, 5, 120);
        } else if (view === 'cbd') {
          this.camera.position.set(6, 66, 174);
          this.camera.lookAt(55, 0, 58);
        } else {
          const aspect = window.innerWidth / window.innerHeight;
          if (aspect < 0.8) {
            this.camera.position.set(p.x - t.x * 36, 19, p.z - t.z * 36);
            this.camera.lookAt(p.x + t.x * 14, 2.6, p.z + t.z * 14);
          } else {
            this.camera.position.set(p.x - t.x * 32, 17, p.z - t.z * 32);
            this.camera.lookAt(p.x + t.x * 18, 2.6, p.z + t.z * 18);
          }
        }
        return;
      }
      if (!this.started) {
        const a = this.time * 0.05;
        this.camera.position.set(Math.cos(a) * 70 + 22, 30, Math.sin(a) * 70 + 14);
        this.camera.lookAt(6, 4, 8);
        this.controls.target.set(6, 4, 8);
        return;
      }
      if (!this.tramGroup) return;
      const p = this.tramGroup.position;
      const target = new THREE.Vector3(p.x, 2.2, p.z);
      if (this.recenterRequested) {
        const u = mod(this.tram.s / this.tram.length, 1);
        const t = this.tram.curve.getTangentAt(u);
        this.camera.position.set(p.x - t.x * 20, 13.5, p.z - t.z * 20);
        this.controls.target.copy(target);
        this.recenterRequested = false;
        this.cameraInitialised = true;
      } else {
        const delta = target.clone().sub(this.controls.target);
        this.camera.position.add(delta);
        this.controls.target.copy(target);
      }
      this.controls.update();
      if (this.camera.position.y < 2.4) this.camera.position.y = 2.4;
    }

    drawMinimap() {
      const canvas = this.dom.minimap;
      if (!canvas) return;
      if (!this.mapCtx) this.mapCtx = canvas.getContext('2d');
      const ctx = this.mapCtx;
      const w = canvas.width || 440;
      const h = canvas.height || 320;
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#04150f');
      bg.addColorStop(1, '#061d17');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const bounds = { x0: -70, x1: 140, z0: -60, z1: 165 };
      const pad = 20;
      const scale = Math.min((w - pad * 2) / (bounds.x1 - bounds.x0), (h - pad * 2) / (bounds.z1 - bounds.z0));
      const ox = (w - (bounds.x1 - bounds.x0) * scale) / 2;
      const oy = (h - (bounds.z1 - bounds.z0) * scale) / 2;
      const mx = (x) => ox + (x - bounds.x0) * scale;
      const mz = (z) => h - (oy + (z - bounds.z0) * scale);

      // Yarra River.
      ctx.fillStyle = 'rgba(56, 156, 164, 0.35)';
      ctx.fillRect(0, mz(-58), w, Math.max(3, (mz(-70) - mz(-58))));
      ctx.strokeStyle = 'rgba(120,255,235,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mz(-62));
      ctx.lineTo(w, mz(-62));
      ctx.stroke();

      // Landmark blocks.
      ctx.fillStyle = 'rgba(246, 200, 0, 0.18)';
      ctx.strokeStyle = 'rgba(246, 200, 0, 0.5)';
      ctx.fillRect(mx(-64), mz(-24), 60 * scale, 22 * scale);
      ctx.strokeRect(mx(-64), mz(-24), 60 * scale, 22 * scale);
      ctx.fillStyle = 'rgba(255, 122, 77, 0.16)';
      ctx.strokeStyle = 'rgba(255, 122, 77, 0.5)';
      ctx.fillRect(mx(18), mz(12), 44 * scale, 46 * scale);
      ctx.strokeRect(mx(18), mz(12), 44 * scale, 46 * scale);
      ctx.fillStyle = 'rgba(157, 123, 255, 0.13)';
      ctx.strokeStyle = 'rgba(157, 123, 255, 0.45)';
      ctx.fillRect(mx(106), mz(50), 28 * scale, 30 * scale);
      ctx.strokeRect(mx(106), mz(50), 28 * scale, 30 * scale);
      ctx.fillStyle = 'rgba(255, 85, 119, 0.13)';
      ctx.strokeStyle = 'rgba(255, 85, 119, 0.45)';
      ctx.fillRect(mx(68), mz(106), 30 * scale, 30 * scale);
      ctx.strokeRect(mx(68), mz(106), 30 * scale, 30 * scale);

      // Route line.
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0, 185, 92, 0.22)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      for (let i = 0; i <= 220; i++) {
        const p = this.tram.curve.getPointAt(i / 220);
        const X = mx(p.x);
        const Y = mz(p.z);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(70, 255, 211, 0.78)';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Tram tracks ticks / hook turn marker.
      ctx.fillStyle = '#ff5577';
      ctx.fillRect(mx(0) - 3, mz(0) - 3, 6, 6);

      // Stops.
      this.stops.forEach((stop) => {
        const X = mx(stop.platform.x);
        const Y = mz(stop.platform.z);
        ctx.beginPath();
        ctx.arc(X, Y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#' + stop.hue.toString(16).padStart(6, '0');
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(220,255,246,0.72)';
        ctx.font = '600 7px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stop.short, X, Y - 8);
      });

      // Tram marker.
      const p = this.tram.curve.getPointAt(mod(this.tram.s / this.tram.length, 1));
      const X = mx(p.x);
      const Y = mz(p.z);
      ctx.save();
      ctx.translate(X, Y);
      const heading = this.tram.heading;
      ctx.rotate(-heading);
      ctx.fillStyle = '#f6c800';
      ctx.shadowColor = '#f6c800';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 5);
      ctx.lineTo(0, 2.5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // North arrow.
      ctx.fillStyle = 'rgba(246,200,0,0.85)';
      ctx.font = '700 9px Orbitron, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('N', w - 18, 18);
      ctx.beginPath();
      ctx.moveTo(w - 14, 24);
      ctx.lineTo(w - 18, 32);
      ctx.lineTo(w - 10, 32);
      ctx.closePath();
      ctx.fill();
    }

    animate() {
      const loop = () => {
        requestAnimationFrame(loop);
        const now = performance.now();
        let dt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        if (!Number.isFinite(dt) || dt < 0) dt = 0.016;
        dt = Math.min(dt, 0.05);

        if (this.hookActive) return;

        this.time += dt;
        this.updateWeather(dt);
        this.updateRain(dt);
        if (this.started) this.audio.updateAmbience(dt);
        this.updateClouds(dt);
        this.updateTraffic(dt);
        this.updatePassengers(dt);
        this.updateSignalCycle();
        if (this.started && !this.paused) {
          this.updateDoors(dt);
          this.updateTram(dt);
        }
        this.updateCamera(dt);
        if (this.waterTex) this.waterTex.offset.x += dt * 0.006;

        if (this.world) {
          this.world.step(1 / 60, dt, 3);
        }

        this.hudTimer += dt;
        if (this.hudTimer > 0.11) {
          this.hudTimer = 0;
          this.updateHud(false);
        }
        this.mapTimer += dt;
        if (this.mapTimer > 0.2) {
          this.mapTimer = 0;
          this.drawMinimap();
        }
        this.saveTimer += dt;
        if (this.saveTimer > 9) {
          this.saveTimer = 0;
          this.persist();
        }

        this.renderer.render(this.scene, this.camera);
      };
      requestAnimationFrame(loop);
    }

    /* =======================================================================
       HOOK TURN CONTROL
       ===================================================================== */

    openHookGame() {
      if (!this.started) {
        this.toast('Clock on first — then take the hook turn challenge.', 3200);
        return;
      }
      if (!this.hook) this.buildHookGame();
      if (this.hook && this.hook.ready) {
        this.audio.ensure();
        this.hook.open();
      } else {
        this.toast('Hook turn module unavailable', 3000, 'danger');
      }
    }

    closeHookGame() {
      if (this.hook) this.hook.close();
    }

    /* =======================================================================
       SELF-TEST
       ===================================================================== */

    runSelfTests() {
      const results = [];
      const add = (name, ok, detail) => results.push({ name: name, ok: Boolean(ok), detail: detail || '' });
      const savedCareer = JSON.parse(JSON.stringify(this.career));
      const savedScore = this.trip.score;

      add('Three.js runtime loaded', typeof THREE !== 'undefined' && THREE.REVISION === '128', THREE.REVISION);
      add('Cannon.js runtime loaded', typeof CANNON !== 'undefined' && !!CANNON.World, typeof CANNON !== 'undefined' ? '0.6.2' : 'missing');
      add('WebGL renderer created', !!(this.renderer && this.renderer.domElement), this.renderer ? 'canvas' : 'none');
      add('Scene populated', this.scene && this.scene.children.length > 80, this.scene ? this.scene.children.length + ' objects' : 'none');
      add('CBD loop built', !!(this.tram.curve && this.tram.length > 500), Math.round(this.tram.length) + ' m');
      add('Seven named tram stops', this.stops.length === 7, this.stops.map((s) => s.short).join(', '));
      add('Waiting passengers spawned', this.stops.reduce((n, s) => n + s.riders.length, 0) >= 12, this.stops.reduce((n, s) => n + s.riders.length, 0) + ' riders');
      add('Tram mesh assembled', !!(this.tramGroup && this.tramGroup.children.length > 40), this.tramGroup ? this.tramGroup.children.length + ' parts' : 'none');
      add('Cannon tram body', !!(this.tramBody && this.tramBody.mass > 1000), this.tramBody ? Math.round(this.tramBody.mass) + ' kg' : 'none');
      add('Overhead catenary', !!(this.poles && this.poles.children.length > 30), this.poles ? this.poles.children.length + ' pieces' : 'none');
      add('Flinders Street Station', !!(this.station && this.station.children.length > 20), this.station ? this.station.children.length + ' parts' : 'none');
      add('Federation Square', !!(this.fedSquare && this.fedSquare.children.length > 10), this.fedSquare ? this.fedSquare.children.length + ' parts' : 'none');
      add('Yarra River & bridge', !!(this.yarra && this.waterMat), this.yarra ? this.yarra.children.length + ' parts' : 'none');
      add('Web Audio synth voices', typeof this.audio.bell === 'function' && typeof this.audio.myki === 'function' && typeof this.audio.setScreech === 'function' && typeof this.audio.updateAmbience === 'function', 'bell, myki, screech, traffic, crowd, birds, distant trams');
      add('Three weather presets', Object.keys(WEATHERS).length === 3, Object.keys(WEATHERS).join(', '));
      add('Nine route badges', BADGES.length === 9, BADGES.length + ' badges');
      add('Save schema validates', sanitizeSave(this.serializeSave()) !== null, 'tramtracker_save.json');

      // Drive the tram briefly with Cannon stepping.
      this.started = true;
      const startS = this.tram.s;
      let moved = 0;
      this.keys.ArrowUp = true;
      for (let i = 0; i < 150; i++) {
        this.updateTram(1 / 60);
        moved += Math.abs(this.tram.speed) / 60;
        if (this.world) this.world.step(1 / 60, 1 / 60, 1);
      }
      this.keys.ArrowUp = false;
      add('Traction moves the tram', moved > 0.5, moved.toFixed(1) + ' m');

      const stop = this.stops.find((s) => s.riders.some((r) => r.state === 'waiting'));
      let doorOK = false;
      let paxOK = false;
      let boarded = 0;
      if (stop) {
        this.tram.s = mod(stop.s - 3, this.tram.length);
        this.tram.speed = 0;
        this.trip.doorState = 'closed';
        this.trip.doors = false;
        this.trip.doorStop = null;
        this.trip.doorAnim = 0;
        const beforePax = this.career.stats.totalPassengers;
        this.openDoors();
        const opening = this.trip.doorState === 'opening';
        for (let i = 0; i < 70; i++) this.updateDoors(1 / 60);
        const open = this.trip.doorState === 'open';
        boarded = this.career.stats.totalPassengers - beforePax;
        paxOK = boarded > 0;
        this.closeDoors();
        for (let i = 0; i < 70; i++) this.updateDoors(1 / 60);
        const closed = this.trip.doorState === 'closed' && this.trip.doors === false;
        doorOK = opening && open && closed;
      }
      add('Manual doors open, board and close', doorOK && paxOK, paxOK ? boarded + ' tapped on' : 'no boarding');

      this.showAnnouncement('Now arriving at Flinders Street Station.');
      const annOK = typeof this.audio.speak === 'function'
        && typeof this.audio.chime === 'function'
        && !!this.dom.announcementBar
        && !!this.dom.announcementText
        && this.dom.announcementText.textContent.indexOf('Flinders Street') >= 0;
      add('Stop & door announcements', annOK, 'en-AU speech + chime + subtitle');

      this.showStopGuide(this.stops[0], true);
      const guideOK = !!this.dom.stopInfo
        && !!this.dom.stopInfoLink
        && this.dom.stopInfoLink.href.indexOf('wikipedia.org') >= 0
        && this.dom.stopInfoName.textContent.indexOf('Flinders') >= 0
        && this.stops.every((s) => s.blurb && s.nearby && s.nearby.length && s.wiki);
      add('Stop guide with Wikipedia links', guideOK, 'nearby places · background · external link');
      this.hideStopGuide();

      this.setWeather('rain', true);
      const rainOK = this.currentWeather === 'rain';
      this.setWeather('twilight', true);
      const twilightOK = this.currentWeather === 'twilight';
      this.setWeather('sunny', true);
      add('Weather presets switch', rainOK && twilightOK && this.currentWeather === 'sunny', 'sunny → rain → twilight → sunny');

      this.setViewMode('driver', true);
      const cabOK = document.body.classList.contains('view-driver') && this.camera.fov === 66 && this.controls.enabled === false && !!document.querySelector('.cab-overlay');
      this.setViewMode('chase', true);
      add('Driver cab view', cabOK, 'first-person cab, drag-to-look and rain wipers');

      add('CBD extension landmarks', !!(this.parliament && this.rmit && this.collins), 'Parliament · RMIT · Collins Street');

      add('Hook turn scene ready', !!(this.hook && this.hook.ready && this.hook.carGroup), this.hook && this.hook.ready ? '60 s challenge' : 'unavailable');
      add('Minimap canvas', !!this.dom.minimap, '440 × 320');
      add('Save/load UI', !!(this.dom.saveBtn && this.dom.loadBtn && this.dom.importFile), 'export + import');
      add('HUD wired', !!(this.dom.speedValue && this.dom.scoreValue && this.dom.nextStopName), 'telemetry live');
      add('No uncaught errors', this.expectedErrors.length === 0 && this.jsErrors.length === 0, this.expectedErrors.concat(this.jsErrors).join('; ') || 'clean');

      this.career = savedCareer;
      this.trip.score = savedScore;
      this.tram.s = startS;
      this.tram.speed = 0;
      this.tramGroup.position.copy(this.tram.curve.getPointAt(startS / this.tram.length));
      this.updateHud(true);

      const passed = results.filter((r) => r.ok).length;
      const lines = results.map((r) => (r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail ? ' — ' + r.detail : ''));
      const summary = 'SUMMARY ' + passed + '/' + results.length + ' ' + (passed === results.length ? 'PASS' : 'FAIL');
      const output = lines.join('\n') + '\n\n' + summary;
      if (this.dom.selftestOut) {
        this.dom.selftestOut.hidden = false;
        this.dom.selftestOut.textContent = output;
      }
      document.body.dataset.selftest = passed === results.length ? 'pass' : 'fail';
      document.body.dataset.selftestSummary = summary;
      window.__tramTestResults = results;
      console.log('[TramTracker 2088 self-test]\n' + output);
    }

  }

  /* ===========================================================================
     Hook Turn Challenge
     ======================================================================== */

  class HookTurnGame {
    constructor(app) {
      this.app = app;
      this.ready = false;
      this.running = false;
      this.keys = Object.create(null);
      this.raf = 0;
      this.last = 0;
      this.session = null;
      this.bikes = [];
      this.preview = false;
    }

    init() {
      const canvas = document.getElementById('hookCanvas');
      if (!canvas) return;
      this.canvas = canvas;
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
      } catch (err) {
        console.warn('[TramTracker] hook renderer failed', err);
        return;
      }

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x04110d);
      this.scene.fog = new THREE.Fog(0x04110d, 90, 260);
      this.camera = new THREE.OrthographicCamera(-60, 60, 60, -60, 0.1, 500);
      this.camera.up.set(0, 0, -1);
      this.camera.position.set(0, 132, 30);
      this.camera.lookAt(0, 0, 12);

      this.scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x14251c, 0.8));
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.28));
      const sun = new THREE.DirectionalLight(0xfff0cc, 1.2);
      sun.position.set(50, 90, 40);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -80;
      sun.shadow.camera.right = 80;
      sun.shadow.camera.top = 80;
      sun.shadow.camera.bottom = -80;
      this.scene.add(sun);

      this.buildScene();
      this.ready = true;
      this.resize();
      this.resetSession();
    }

    buildScene() {
      const asphalt = new THREE.MeshStandardMaterial({ color: 0x222825, roughness: 0.94 });
      const concrete = new THREE.MeshStandardMaterial({ color: 0x7c817a, roughness: 0.92 });
      const white = new THREE.MeshStandardMaterial({ color: 0xd8e6d8, roughness: 0.7 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xf6c800, roughness: 0.5, emissive: 0xf6c800, emissiveIntensity: 0.28 });
      const rail = new THREE.MeshStandardMaterial({ color: 0xcfd8d3, roughness: 0.25, metalness: 0.95 });

      const ground = new THREE.Mesh(new THREE.PlaneGeometry(280, 280), new THREE.MeshStandardMaterial({ color: 0x0d1a15, roughness: 1 }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.12;
      ground.receiveShadow = true;
      this.scene.add(ground);

      const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(280, 26), asphalt);
      roadEW.rotation.x = -Math.PI / 2;
      roadEW.position.y = 0.01;
      roadEW.receiveShadow = true;
      this.scene.add(roadEW);

      const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(26, 230), asphalt);
      roadNS.rotation.x = -Math.PI / 2;
      roadNS.position.set(10, 0.012, 0);
      roadNS.receiveShadow = true;
      this.scene.add(roadNS);

      // Sidewalks.
      [[-1, 20], [1, 20], [-1, -20], [1, -20]].forEach(([sx, sz]) => {
        const w = sx < 0 ? 120 : 120;
        const walk = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, 5), concrete);
        walk.position.set(sx * 60 - 5, 0.15, sz);
        this.scene.add(walk);
      });
      [[-22, 0], [22, 0]].forEach(([x]) => {
        const walk = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 100), concrete);
        walk.position.set(x, 0.15, -35);
        this.scene.add(walk);
      });

      // Lane markings.
      for (let i = -12; i <= 12; i++) {
        if (Math.abs(i) < 2) continue;
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.14), white);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(i * 5.4, 0.035, -5);
        this.scene.add(dash);
        const dash2 = dash.clone();
        dash2.position.z = 5;
        this.scene.add(dash2);
      }

      // Tram tracks along Flinders Street.
      const trackBed = new THREE.Mesh(new THREE.BoxGeometry(280, 0.04, 5.2), new THREE.MeshStandardMaterial({ color: 0x2c3330, roughness: 0.95 }));
      trackBed.position.set(0, 0.03, 0);
      trackBed.receiveShadow = true;
      this.scene.add(trackBed);
      [-0.72, 0.72].forEach((z) => {
        const railMesh = new THREE.Mesh(new THREE.BoxGeometry(280, 0.12, 0.16), rail);
        railMesh.position.set(0, 0.105, z);
        railMesh.receiveShadow = true;
        this.scene.add(railMesh);
      });
      const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x323a34, roughness: 0.92 });
      for (let x = -130; x <= 130; x += 2.6) {
        const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.07, 3.1), sleeperMat);
        sleeper.position.set(x, 0.07, 0);
        this.scene.add(sleeper);
      }

      // Overhead wire and poles.
      const wireMat = new THREE.LineBasicMaterial({ color: 0x21352e });
      const wirePts = [new THREE.Vector3(-140, 6.3, 0), new THREE.Vector3(140, 6.3, 0)];
      this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePts), wireMat));
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334039, roughness: 0.5, metalness: 0.7 });
      [-90, -45, 55, 100].forEach((x) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 6.6, 8), poleMat);
        pole.position.set(x, 3.3, 7.5);
        this.scene.add(pole);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), poleMat);
        arm.rotation.z = Math.PI / 2;
        arm.position.set(x + 2, 6.2, 7.5);
        this.scene.add(arm);
      });

      // Crosswalks.
      this.addZebra(10, -14, 'z');
      this.addZebra(10, 14, 'z');
      this.addZebra(-16, 0, 'x');
      this.addZebra(36, 0, 'x');

      // Hook turn box.
      const hookMat = new THREE.MeshBasicMaterial({ color: 0xf6c800, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });
      const hook = new THREE.Mesh(new THREE.PlaneGeometry(11, 8), hookMat);
      hook.rotation.x = -Math.PI / 2;
      hook.position.set(10, 0.045, -8);
      this.scene.add(hook);
      const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(11, 8)),
        new THREE.LineBasicMaterial({ color: 0xffd54a })
      );
      outline.rotation.x = -Math.PI / 2;
      outline.position.set(10, 0.06, -8);
      this.scene.add(outline);
      // Target zone.
      const target = new THREE.Mesh(new THREE.PlaneGeometry(13, 8), new THREE.MeshBasicMaterial({ color: 0x46ffd3, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
      target.rotation.x = -Math.PI / 2;
      target.position.set(10, 0.05, 38);
      this.scene.add(target);
      const targetRing = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.28, 8, 40), new THREE.MeshBasicMaterial({ color: 0x46ffd3 }));
      targetRing.rotation.x = Math.PI / 2;
      targetRing.position.set(10, 0.12, 38);
      this.scene.add(targetRing);
      this.targetRing = targetRing;

      const makeLabelSprite = (title, sub, color) => {
        const tex = makeSignTexture(title, sub, { fontSize: 66, bg: 'rgba(3,18,13,0.94)', fg: color || '#f6c800', accent: '#46ffd3', border: true });
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
        sprite.scale.set(13, 4.1, 1);
        return sprite;
      };
      const waitSprite = makeLabelSprite('WAIT IN BOX', 'STOP HERE', '#f6c800');
      waitSprite.position.set(10, 6.4, -19);
      this.scene.add(waitSprite);
      const goSprite = makeLabelSprite('TURN HERE', 'ON GREEN', '#46ffd3');
      goSprite.position.set(10, 6.4, 28);
      this.scene.add(goSprite);
      const poleMat2 = new THREE.MeshStandardMaterial({ color: 0x334039, roughness: 0.6, metalness: 0.5 });
      [[10, -8], [10, 38]].forEach(([x, z]) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 6.3, 8), poleMat2);
        pole.position.set(x, 3.15, z);
        this.scene.add(pole);
      });

      // Buildings around the intersection.
      const rng = mulberry32(707);
      const windowTex = makeWindowTexture(707, '#1b2a2b');
      const buildingMat = new THREE.MeshStandardMaterial({ map: windowTex, roughness: 0.8, emissiveMap: windowTex, emissive: 0xffffff, emissiveIntensity: 0.4 });
      const spots = [
        [-48, 34, 26, 22, 18], [-78, 38, 24, 26, 26], [52, 38, 30, 24, 16], [88, 42, 26, 26, 24],
        [-48, -36, 24, 22, 20], [-82, -42, 26, 26, 30], [56, -36, 28, 22, 22], [90, -40, 26, 24, 18],
        [-118, 8, 20, 40, 34], [124, 10, 22, 42, 30]
      ];
      spots.forEach(([x, z, w, d, h]) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMat);
        b.position.set(x, h / 2, z);
        b.castShadow = true;
        b.receiveShadow = true;
        this.scene.add(b);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.8, d + 1), new THREE.MeshStandardMaterial({ color: 0x1b2524, roughness: 0.9 }));
        cap.position.set(x, h + 0.3, z);
        this.scene.add(cap);
      });

      // Neon corner signs.
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), new THREE.MeshBasicMaterial({ map: makeSignTexture('FLINDERS ST', 'HOOK TURN ZONE', { fontSize: 44, fg: '#46ffd3', accent: '#f6c800', bg: '#031a12' }) }));
      sign.position.set(-26, 8, 13.2);
      this.scene.add(sign);
      const signLight = new THREE.PointLight(0x46ffd3, 0.9, 34, 2);
      signLight.position.set(-24, 7, 18);
      this.scene.add(signLight);

      // Traffic lights.
      this.signalLamps = [];
      [[-18, 13], [38, 13], [-18, -13], [38, -13]].forEach(([x, z]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.4, 8), poleMat);
        post.position.set(x, 2.7, z);
        this.scene.add(post);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x151c19, roughness: 0.6 }));
        head.position.set(x, 4.7, z);
        this.scene.add(head);
        const lamps = {};
        ['red', 'amber', 'green'].forEach((name, i) => {
          const color = name === 'red' ? 0xff3b55 : name === 'amber' ? 0xffb340 : 0x46ffd3;
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.1 }));
          lamp.position.set(x, 5.15 - i * 0.45, z + 0.28);
          this.scene.add(lamp);
          lamps[name] = lamp;
        });
        this.signalLamps.push(lamps);
      });

      // Mini tram.
      const tram = new THREE.Group();
      const tramGreen = new THREE.MeshStandardMaterial({ color: 0x00853e, roughness: 0.35, metalness: 0.4 });
      const tramCream = new THREE.MeshStandardMaterial({ color: 0xefe4c4, roughness: 0.5 });
      const tramGlass = new THREE.MeshStandardMaterial({ color: 0x0d2727, roughness: 0.1, metalness: 0.8, emissive: 0x0d4040, emissiveIntensity: 0.7 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(10.5, 2.4, 2.5), tramGreen);
      body.position.y = 1.6;
      body.castShadow = true;
      tram.add(body);
      const top = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.7, 2.35), tramCream);
      top.position.y = 3.05;
      tram.add(top);
      const windows = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.85, 2.42), tramGlass);
      windows.position.y = 2.55;
      tram.add(windows);
      const dest = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.62), new THREE.MeshBasicMaterial({ map: makeSignTexture('2088', 'CITY', { fontSize: 64, bg: '#080d0b', fg: '#f6c800', accent: '#46ffd3', border: false }), side: THREE.DoubleSide }));
      dest.position.set(5.32, 2.9, 0);
      dest.rotation.y = Math.PI / 2;
      tram.add(dest);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.16, 2.56), gold);
      stripe.position.y = 2.05;
      tram.add(stripe);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfff4d0, emissive: 0xfff4d0, emissiveIntensity: 2.2 }));
      head.position.set(5.3, 1.35, 0);
      tram.add(head);
      const panto = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), poleMat);
      panto.position.set(-1.5, 4.1, 0);
      tram.add(panto);
      tram.position.set(-80, 0.12, 0);
      this.scene.add(tram);
      this.tramGroup = tram;

      // Player car.
      const car = new THREE.Group();
      const carRed = new THREE.MeshStandardMaterial({ color: 0xd92f4f, roughness: 0.35, metalness: 0.55, emissive: 0x2a0410, emissiveIntensity: 0.55 });
      const carGlass = new THREE.MeshStandardMaterial({ color: 0x0e2326, roughness: 0.12, metalness: 0.8 });
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.62, 3.7), carRed);
      carBody.position.y = 0.66;
      carBody.castShadow = true;
      car.add(carBody);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 1.8), carGlass);
      cabin.position.set(0, 1.14, -0.15);
      cabin.castShadow = true;
      car.add(cabin);
      [-0.95, 0.95].forEach((x) => {
        [-1.15, 1.15].forEach((z) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10), new THREE.MeshStandardMaterial({ color: 0x0b100e, roughness: 0.9 }));
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(x, 0.36, z);
          car.add(wheel);
        });
      });
      const neon = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 3.2), new THREE.MeshStandardMaterial({ color: 0x46ffd3, emissive: 0x46ffd3, emissiveIntensity: 2 }));
      neon.position.set(0, 0.36, 0);
      car.add(neon);
      const headlights = new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffe0a0, emissiveIntensity: 1.8 });
      [-0.6, 0.6].forEach((x) => {
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), headlights);
        lamp.position.set(x, 0.62, 1.9);
        car.add(lamp);
      });
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.07, 8, 28), new THREE.MeshBasicMaterial({ color: 0xf6c800, transparent: true, opacity: 0.85 }));
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 0.04;
      car.add(halo);
      car.position.set(-58, 0.12, -6);
      this.scene.add(car);
      this.carGroup = car;

      // Chevrons guiding eastbound traffic toward the hook box.
      const chevMat = new THREE.MeshBasicMaterial({ color: 0xf6c800, transparent: true, opacity: 0.55 });
      for (let i = 0; i < 6; i++) {
        const chev = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.42), chevMat);
        chev.rotation.x = -Math.PI / 2;
        chev.rotation.z = -Math.PI / 2;
        chev.position.set(-48 + i * 8, 0.05, -6);
        this.scene.add(chev);
      }
      // Direction arrow from the box to the target.
      const arrowMat = new THREE.MeshBasicMaterial({ color: 0x46ffd3, transparent: true, opacity: 0.6 });
      for (let i = 0; i < 4; i++) {
        const arrow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.7), arrowMat);
        arrow.rotation.x = -Math.PI / 2;
        arrow.position.set(10, 0.05, 16 + i * 6);
        this.scene.add(arrow);
      }

      // Bikes (hazards).
      this.bikes = [];
      const bikeColors = [0x46ffd3, 0xf6c800];
      [0, 1].forEach((i) => {
        const bike = this.makeBike(bikeColors[i]);
        const dir = i === 0 ? 1 : -1;
        bike.position.set(dir * 30, 0.1, i === 0 ? 10.5 : -10.5);
        this.scene.add(bike);
        this.bikes.push({ mesh: bike, x: dir * 30, z: i === 0 ? 10.5 : -10.5, dir: dir, speed: 7 + i * 1.6 });
      });

      this.addAmbientDetails();
    }

    addAmbientDetails() {
      // Trees and bollards to give the corner depth.
      const trunk = new THREE.MeshStandardMaterial({ color: 0x3a2b1e, roughness: 1 });
      const leaf = new THREE.MeshStandardMaterial({ color: 0x1e5a36, roughness: 0.95, flatShading: true });
      [[-20, 22], [46, 22], [-20, -22], [46, -22]].forEach(([x, z]) => {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 3, 7), trunk);
        t.position.set(x, 1.5, z);
        this.scene.add(t);
        for (let i = 0; i < 3; i++) {
          const l = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), leaf);
          l.position.set(x + (i - 1) * 1.1, 3.4 + (i % 2) * 0.7, z + (i - 1) * 0.6);
          this.scene.add(l);
        }
      });

      const bollardMat = new THREE.MeshStandardMaterial({ color: 0x2e3a34, roughness: 0.7, metalness: 0.4 });
      for (let i = 0; i < 8; i++) {
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 8), bollardMat);
        b.position.set(-12 + i * 7, 0.55, 14.5);
        this.scene.add(b);
      }
    }

    addZebra(x, z, axis) {
      const mat = new THREE.MeshStandardMaterial({ color: 0xd8e6d8, roughness: 0.7 });
      for (let i = -5; i <= 5; i++) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 4.5), mat);
        stripe.rotation.x = -Math.PI / 2;
        if (axis === 'z') stripe.position.set(x + i * 1.2, 0.04, z);
        else {
          stripe.position.set(x, 0.04, z + i * 1.2);
          stripe.rotation.z = Math.PI / 2;
        }
        this.scene.add(stripe);
      }
    }

    makeBike(color) {
      const group = new THREE.Group();
      const frameMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.65, emissive: color, emissiveIntensity: 0.2 });
      const tyreMat = new THREE.MeshStandardMaterial({ color: 0x0b100e, roughness: 0.9 });
      [-1, 1].forEach((z) => {
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 8, 16), tyreMat);
        wheel.rotation.y = Math.PI / 2;
        wheel.position.set(0, 0.42, z * 0.62);
        group.add(wheel);
      });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.3), frameMat);
      bar.position.y = 0.55;
      group.add(bar);
      const rider = this.app.makePerson(1200 + Math.floor(Math.random() * 999));
      rider.scale.setScalar(0.72);
      rider.position.y = 0.12;
      group.add(rider);
      return group;
    }

    resize() {
      if (!this.renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h, false);
      const aspect = w / h;
      const view = aspect < 0.9 ? 190 : 100;
      if (aspect >= 1) {
        this.camera.left = -view * aspect / 2;
        this.camera.right = view * aspect / 2;
        this.camera.top = view / 2;
        this.camera.bottom = -view / 2;
      } else {
        this.camera.left = -view / 2;
        this.camera.right = view / 2;
        this.camera.top = view / aspect / 2;
        this.camera.bottom = -view / aspect / 2;
      }
      this.camera.updateProjectionMatrix();
    }

    resetSession() {
      this.hideResult();
      this.keys = Object.create(null);
      this.session = {
        phase: 'enter',
        time: 60,
        lives: 3,
        violations: 0,
        waited: 0,
        score: 0,
        greenTimer: 0,
        signal: 'red',
        tramX: -55,
        tramSpeed: 17,
        car: { x: -56, z: -6, heading: Math.PI / 2, speed: 0 },
        hintCooldown: 0,
        finished: false
      };
      this.bikes.forEach((bike, i) => {
        bike.x = i === 0 ? -20 : 40;
        bike.z = i === 0 ? 10.5 : -10.5;
        bike.dir = i === 0 ? 1 : -1;
      });
      if (this.carGroup) {
        this.carGroup.position.set(-56, 0.12, -6);
        this.carGroup.rotation.y = Math.PI / 2;
        this.carGroup.visible = true;
      }
      if (this.tramGroup) this.tramGroup.position.set(-55, 0.12, 0);
      this.updateHud();
    }

    open() {
      if (!this.ready) return;
      this.app.hookActive = true;
      this.app.paused = false;
      const overlay = document.getElementById('hookOverlay');
      if (overlay) {
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden', 'false');
      }
      this.resetSession();
      this.resize();
      this.running = true;
      this.last = performance.now();
      this.app.audio.click();
      this.loop();
    }

    close() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      const overlay = document.getElementById('hookOverlay');
      if (overlay) {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
      }
      this.app.hookActive = false;
      this.app.recenterRequested = true;
      this.app.persist();
      this.app.audio.click();
    }

    restart() {
      this.resetSession();
      this.running = true;
      this.last = performance.now();
      if (!this.raf) this.loop();
    }

    loop() {
      if (!this.running) return;
      this.raf = requestAnimationFrame(() => this.loop());
      const now = performance.now();
      let dt = (now - this.last) / 1000;
      this.last = now;
      if (!Number.isFinite(dt) || dt < 0) dt = 0.016;
      dt = Math.min(dt, 0.05);
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    }

    update(dt) {
      const s = this.session;
      if (!s) return;

      // Animate tram and its signal even after the attempt ends.
      if (!s.finished) {
        s.tramX += s.tramSpeed * dt;
        if (s.tramX > 88) s.tramX = -72;
      }
      this.tramGroup.position.x = s.tramX;

      const tramInBox = Math.abs(s.tramX - 10) < 30;
      if (tramInBox) {
        s.greenTimer = 0;
        s.signal = 'red';
      } else {
        if (s.greenTimer <= 0 && s.tramX > 30) s.greenTimer = 4.8;
        s.greenTimer = Math.max(0, s.greenTimer - dt);
        s.signal = s.greenTimer > 0 ? 'green' : 'red';
      }

      this.updateSignalMeshes(s.signal);

      // Bikes always move.
      this.bikes.forEach((bike, i) => {
        bike.x += bike.speed * bike.dir * dt;
        if (bike.x > 78) bike.x = -78;
        if (bike.x < -78) bike.x = 78;
        bike.mesh.position.x = bike.x;
        bike.mesh.position.z = bike.z;
        bike.mesh.rotation.y = bike.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        if (!s.finished && s.phase !== 'done') {
          const dx = bike.x - s.car.x;
          const dz = bike.z - s.car.z;
          if (dx * dx + dz * dz < 2.9) this.failAttempt('You clipped a bike in the hook turn box.');
        }
      });

      if (s.finished) {
        this.updateHud();
        return;
      }

      s.time -= dt;
      if (s.time <= 0) {
        s.time = 0;
        this.finish(false, 'Time expired. The light cycle waits for no tram.');
        return;
      }

      // Car controls.
      const up = this.keys.ArrowUp || this.keys.w || this.keys.W;
      const down = this.keys.ArrowDown || this.keys.s || this.keys.S;
      const left = this.keys.ArrowLeft || this.keys.a || this.keys.A;
      const right = this.keys.ArrowRight || this.keys.d || this.keys.D;
      const car = s.car;

      if (s.phase !== 'done') {
        if (up) car.speed += 5.4 * dt;
        if (down) car.speed -= (car.speed > 0 ? 9 : 3) * dt;
        if (!up && !down) car.speed *= Math.pow(0.32, dt);
        car.speed = clamp(car.speed, -2.4, 9.5);
        if (Math.abs(car.speed) < 0.03) car.speed = 0;

        const steer = (left ? 1 : 0) - (right ? 1 : 0);
        if (Math.abs(car.speed) > 0.1) {
          car.heading += steer * dt * (0.9 + Math.abs(car.speed) * 0.09) * Math.sign(car.speed);
        }
        car.x += Math.sin(car.heading) * car.speed * dt;
        car.z += Math.cos(car.heading) * car.speed * dt;

        if (car.x < -82 || car.x > 84 || car.z < -32 || car.z > 58) {
          car.x = clamp(car.x, -82, 84);
          car.z = clamp(car.z, -32, 58);
          car.speed *= -0.3;
        }

        this.carGroup.position.set(car.x, 0.12, car.z);
        this.carGroup.rotation.y = car.heading;

        const inBox = Math.hypot(car.x - 10, car.z + 8) < 6.4;
        const boxSpeedOK = Math.abs(car.speed) < 1.5;

        if (s.phase === 'enter' && inBox && boxSpeedOK) {
          s.phase = 'wait';
          s.waited = 0;
          this.app.audio.click();
          this.flash('gold');
        }
        if (s.phase === 'wait') {
          if (inBox) s.waited += dt;
          else s.waited = Math.max(0, s.waited - dt * 2);
          if (s.waited > 0.9 && s.signal === 'green') {
            s.phase = 'turn';
            this.app.audio.click();
            this.flash('teal');
          }
        }

        // Crossing the tram tracks.
        if (Math.abs(car.z) < 3.2 && Math.abs(car.x - 10) < 34) {
          if (Math.abs(car.x - s.tramX) < 7.2 && Math.abs(car.z - 0) < 3.4) {
            this.failAttempt('The tram clipped you on the tracks.');
            return;
          }
        }

        // Leaving the box into the north road without completing the wait.
        if (s.phase !== 'turn' && car.z > 17 && car.x > -2 && car.x < 24) {
          s.violations += 1;
          s.phase = 'enter';
          car.x = -56; car.z = -6; car.heading = Math.PI / 2; car.speed = 0;
          this.carGroup.position.set(car.x, 0.12, car.z);
          this.app.audio.fail();
          this.flash('red');
          this.setPhaseHint('ENTER THE HOOK TURN BOX', 'Too soon — wait inside the painted box for the tram to clear.', 1);
          return;
        }

        // Successful completion.
        if (s.phase === 'turn' && car.z > 33 && car.x > -3 && car.x < 26) {
          const score = Math.max(120, Math.round(700 + s.time * 12 - s.violations * 60));
          this.finish(true, 'Legal hook turn completed across the Swanston tracks.', score);
          return;
        }
      }

      // Keep tram wheels / target ring lively.
      if (this.targetRing) this.targetRing.rotation.z += dt * 0.8;
      this.updateHud();
    }

    updateSignalMeshes(signal) {
      if (!this.signalLamps) return;
      this.signalLamps.forEach((lamps) => {
        ['red', 'amber', 'green'].forEach((name) => {
          const lamp = lamps[name];
          if (!lamp) return;
          const active = (signal === 'green' && name === 'green') || (signal === 'red' && name === 'red');
          lamp.material.emissiveIntensity = active ? 2.4 : 0.08;
          lamp.material.color.setHex(active ? (name === 'green' ? 0x46ffd3 : 0xff3b55) : 0x18201c);
        });
      });
    }

    failAttempt(reason) {
      const s = this.session;
      if (!s || s.finished) return;
      s.lives -= 1;
      s.violations += 1;
      this.app.audio.crash();
      this.flash('red');
      this.carGroup.visible = false;
      if (s.lives <= 0) {
        this.finish(false, reason);
        return;
      }
      s.phase = 'enter';
      s.waited = 0;
      s.car.x = -56; s.car.z = -6; s.car.heading = Math.PI / 2; s.car.speed = 0;
      setTimeout(() => {
        if (this.carGroup) {
          this.carGroup.position.set(-56, 0.12, -6);
          this.carGroup.rotation.y = Math.PI / 2;
          this.carGroup.visible = true;
        }
      }, 450);
      this.setPhaseHint('ENTER THE HOOK TURN BOX', reason + ' ' + s.lives + ' attempt' + (s.lives === 1 ? '' : 's') + ' left.', 1);
    }

    finish(success, reason, score) {
      const s = this.session;
      if (!s || s.finished) return;
      s.finished = true;
      s.phase = 'done';
      s.score = success ? score : 0;
      this.app.audio[success ? 'success' : 'fail']();
      if (success) {
        this.app.career.stats.hookWins += 1;
        this.app.career.stats.hookBest = Math.max(this.app.career.stats.hookBest, score);
        this.app.hookBest = Math.max(this.app.hookBest, score);
        this.app.trip.score += score;
        this.app.awardBadge('hook_turn');
        this.app.checkBadges();
        this.app.persist();
      }
      this.setPhaseHint(
        success ? 'HOOK TURN COMPLETE' : 'ATTEMPT OVER',
        success ? 'Legal hook turn completed across the Swanston tracks.' : reason,
        success ? 3 : 2
      );
      this.showResult(success, reason, score);
      this.updateHud();
    }

    showResult(success, reason, score) {
      const d = this.app.dom;
      if (!d.hookResult) return;
      d.hookResult.classList.add('show');
      d.hookResultKicker.textContent = success ? 'LEGAL TURN COMPLETE' : 'ATTEMPT OVER';
      d.hookResultTitle.textContent = success ? 'Hook turn nailed.' : 'Hook turn failed.';
      d.hookResultText.textContent = reason;
      d.hookResultScore.textContent = success ? '+' + score : '0';
      d.hookResultScore.style.color = success ? 'var(--gold)' : 'var(--danger)';
      if (d.hookBest) d.hookBest.textContent = fmt(this.app.hookBest);
    }

    hideResult() {
      const d = this.app.dom;
      if (d.hookResult) d.hookResult.classList.remove('show');
    }

    setPhaseHint(title, text, step) {
      const d = this.app.dom;
      if (d.hookPhaseTitle) d.hookPhaseTitle.textContent = title;
      if (d.hookPhaseText) d.hookPhaseText.textContent = text;
      if (d.hookStep) d.hookStep.textContent = String(step || 1);
    }

    flash(color) {
      const el = this.app.dom.screenFlash;
      if (!el) return;
      const prev = el.style.backgroundColor;
      el.style.backgroundColor = color === 'red' ? '#ff3355' : color === 'gold' ? '#f6c800' : '#46ffd3';
      el.style.transition = 'none';
      el.style.opacity = '0.45';
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s';
        el.style.opacity = '0';
        setTimeout(() => { el.style.backgroundColor = prev || '#eaffff'; }, 520);
      }, 70);
    }

    updateHud() {
      const s = this.session;
      const d = this.app.dom;
      if (!s || !d) return;
      if (d.hookTime) d.hookTime.textContent = Math.max(0, Math.ceil(s.time));
      if (d.hookLives) d.hookLives.textContent = String(Math.max(0, s.lives));
      if (d.hookBest) d.hookBest.textContent = fmt(this.app.hookBest);
      if (d.hookSignal) d.hookSignal.classList.toggle('go', s.signal === 'green');
      if (d.hookSignalText) d.hookSignalText.textContent = s.signal === 'green' ? 'GO — TRAM CLEAR' : 'WAIT FOR TRAM';
      if (d.hookSignalBar) d.hookSignalBar.style.width = (s.signal === 'green' ? clamp(s.greenTimer / 4.8, 0, 1) * 100 : 0) + '%';

      if (s.finished) return;
      if (s.phase === 'enter') {
        this.setPhaseHint('ENTER THE HOOK TURN BOX', 'Drive east and pull into the painted box on the far corner.', 1);
      } else if (s.phase === 'wait') {
        this.setPhaseHint('WAIT FOR THE TRAM', 'Hold in the box. Turn only when the signal goes green.', 2);
      } else if (s.phase === 'turn') {
        this.setPhaseHint('TURN NOW', 'The tram has cleared — complete the hook turn across the tracks.', 3);
        if (d.hookPhase) d.hookPhase.classList.add('success');
      }
      if (d.hookPhase) d.hookPhase.classList.toggle('success', s.phase === 'turn');
    }
  }

  /* ===========================================================================
     Boot
     ======================================================================== */

  window.TramTracker = {
    VERSION: VERSION,
    BADGES: BADGES,
    WEATHERS: WEATHERS,
    STOP_DEFS: STOP_DEFS,
    TramApp: TramApp,
    AudioEngine: AudioEngine,
    HookTurnGame: HookTurnGame,
    sanitizeSave: sanitizeSave,
    defaultSave: defaultSave
  };

  function boot() {
    const app = new TramApp();
    window.TramTracker.instance = app;
    app.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
