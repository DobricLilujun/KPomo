# KPomo — Redesign + Audio + Fullscreen/Lock Plan

## Context
KPomo is a Pomodoro timer that runs as a Kindle "booklet" (Mesquite WebKit app, KWordle-style
install). It currently shows a plain countdown (`25:00`) with a progress bar, start/pause/reset
buttons, and editable work/break durations.

The user wants:
1. **Redesign the UI** to be aesthetic like a flip/flip-clock timer (ref: flocus.com/online-flip-clock).
2. **Soft audio/voice cue** when the countdown ends (e.g. a gentle sound or a voice saying
   "你要开始运动了，不能再工作了").
3. **Fullscreen** display on Kindle (ref: KOReader fullscreen approach).
4. **Disable lock screen / screensaver** while running.
5. **Keep the code as simple/lean as possible** (Kindle has very limited performance + e-ink is slow).

## Current code
- `kpomo/index.html` — structure + chromebar JS (KPP_MORE / KPP_CLOSE, system menu, reload).
- `kpomo/main.js` — timer logic: work/break sessions, `setInterval` tick, `showMessage`, `changeDuration`.
- `kpomo/main.css` — plain light styling, progress bar, settings.
- `kpomo/config.xml` — widget manifest; `viewmodes="application"`, permissions, messaging, `saveContext no`.
- `kpomo.sh` — installer (copies to `/var/local/mesquite/kpomo`, registers in appreg.db, launches via lipc).
- `js/sdk.js`, `js/polyfill.min.js` — helpers + polyfills.

## Key research findings (constraints that shape the design)

### A. Audio on Kindle is the big risk
- Kindles **only play Audible natively**. WebKit `Audio()` from an uploaded/web source is
  usually **silent** on Kindle (Reddit + WebKit bug #173863 confirm no audio output from web).
- Reliable audio needs a **jailbroken shell** path: `aplay` / GStreamer PCM / `pactl`
  (see `audiobook.koplugin`, `kindle-gst-play`). Some PW models (11th gen, 2023+) have a
  **speaker**; older ones do **not**.
- Existing `sdk.js` has `flashDisplay()` (invert screen briefly) — a good **visual** fallback.
- **Decision needed from user:** device model / speaker / jailbreak / Bluetooth.

### B. E-ink performance & ghosting (drives "keep it simple")
- KindleNoodle (a Kindle flip-clock + pomodoro app) states: **no CSS animation/transition**,
  **no shadows** (ghosting), **lines instead of shadows**, **min font 28px**.
- A real split-flap "flip" animation is slow + heavy on e-ink. Better: a **static flip-card
  look** (rounded dark digit tiles) that reads like a flip clock without animating.

### C. Fullscreen & lock screen
- `viewmodes="application"` already removes reader chrome; app fills the screen.
- Hide the status/chrome bar: chromebar configure + (there may be a fullscreen flag).
- Disable screensaver/lock: `lipc-set-prop com.lab126.powerd preventScreenSaver 1`
  (jailbreak). New firmware (≥5.14.2) removed the `~ds` trick; empty file
  `TESTD_PREVENT_SCREENSAVER` also works. These are **shell/system** actions, not pure WebKit.

## Approach (draft, to confirm)
- **UI:** redesign to a flip-clock aesthetic that is e-ink-safe: large digit tiles (rounded
  cards), session label, minimal controls. Optionally light (black-on-white, best on e-ink)
  vs dark (flocus look) — decide with user. Keep it single-file-ish and dependency-free.
- **Timer:** keep existing main.js logic; add the end-of-session cue.
- **End cue:** soft audio (if device supports it) + always a strong visual (flash + big
  message) so it works even when silent.
- **Fullscreen + no-lock:** update config.xml / chromebar + shell (kpomo.sh) for
  `preventScreenSaver` and chromebar hide.

## Files to modify
- `kpomo/index.html` — new markup + chromebar/fullscreen
- `kpomo/main.css` — flip-clock aesthetic (e-ink safe)
- `kpomo/main.js` — end cue (audio + flash) hook
- `kpomo/config.xml` — fullscreen/no-lock settings
- `kpomo.sh` — screensaver disable + (optional) audio trigger
- `assets/` — add gentle audio + (maybe) TTS voice

## Reuse
- `sdk.js` `flashDisplay()` — e-ink flash fallback.
- `showMessage()` in main.js — end-of-session message.
- Existing chromebar `configureChrome` block in index.html.
- `lipc-set-prop com.lab126.powerd preventScreenSaver 1` (already documented in README).

## Open questions (need user)
1. **Device**: which Kindle? Does it have a **speaker** (PW 2023/11th+ yes; older no)?
2. **Jailbreak?**: is the Kindle jailbroken (kpomo.sh implies yes)? Is Bluetooth audio used?
3. **Theme**: e-ink-friendly **black-on-white** (clearest) vs **dark** flocus look?
4. **Flip**: real flip **animation** (heavier) vs **static** flip-card look (e-ink-friendly)?

## Steps (draft)
- [x] Confirm device/audio/lock/fullscreen constraints (defaults chosen: e-ink-friendly light + dark
      flip tiles, static flip look, WebKit audio + strong visual fallback, jailbroken-shell no-lock).
- [x] Redesign UI (flip-clock, e-ink safe) — index.html + main.css + main.js.
- [x] Wire end-of-session cue (chime + flash + full-screen message + auto-advance).
- [x] Fullscreen (chromebar blank) + disable screensaver (kpomo.sh).
- [x] Generate gentle chime (assets/sounds + kpomo/sounds: ogg/mp3).
- [x] Verify: logic unit tests pass; headless Chrome renders tiles (idle 25:00, cue text).

## Verification
- Load in browser (dev) to check layout.
- Install via kpomo.sh on target Kindle; verify fullscreen, no screensaver, end cue.
