# Kpomo-fancy
<img width="auto" height="600" alt="image" src="https://github.com/user-attachments/assets/0422d226-58ab-48d8-ae23-8f1d3766347a" />
<br /><br />
<a href="https://ko-fi.com/kurizu" target="_blank">
   <img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support me on Ko-fi" />
</a>
<br /><br />
Kpomo-fancy is a stylish Pomodoro focus timer designed for Kindles.

## Overview

- 25‑minute work sessions followed by 5‑minute short breaks (configurable in the UI)
- Start, pause, reset controls
- **Flip‑clock display** — large digit tiles that look like a split‑flap clock, tuned for
  Kindle's e‑ink screen (no heavy animation, no shadows — e‑ink is slow and ghosts)
- **Landscape & portrait** — the layout is orientation-aware and fits both, so you can
  rotate the Kindle however you like
- **Soft cue when a session ends** — a gentle chime plus a full‑screen flash + message so
  you know to take a break, even if the device is silent
- **Fullscreen** — the status/chrome bar is hidden so the timer fills the screen
- **No screensaver / lock** — the screen stays awake while Kpomo-fancy runs
- No external dependencies: just HTML, CSS and vanilla JavaScript
- Installs as a Kindle booklet using the same packaging pattern as [KWordle](https://github.com/crizmo/KWordle)

## Design notes (why it's not a "dark" flip clock)

The reference aesthetic is a dark flip clock (e.g. flocus.com/online-flip-clock). Kindles,
however, use e‑ink: a dark background and CSS animations are slow and leave ghosting. So the
redesign keeps the *look* of a flip clock (dark rounded digit tiles with a center seam) but on
a clean light background, and updates digits **without** animation. This keeps it crisp and fast
on e‑ink while still reading like a flip clock.

## How to Install

**Note:** If you have an older Kindle (5.6.1.1), download the zip with `-legacy` in its name.

1. Download the latest release from this repository (or build it yourself).
2. Connect your Kindle to your computer via USB.
3. Copy the entire `kpomo-fancy` folder and `kpomo-fancy.sh` file into the **Documents** folder
   of your Kindle.
4. Safely eject your Kindle.
5. Run `kpomo-fancy.sh` (jailbroken Kindle) — this registers the app, hides the chrome bar,
   allows both orientations **and** keeps the screen awake.
6. On the device open the **Kpomo-fancy** booklet to start the timer.

## Usage

1. Tap **Start** to begin a work session (default 25 minutes).
2. When the work timer ends, a **gentle chime** plays and a full‑screen cue appears
   ("Break time / Time to move"). Tap **Start** to begin the short break.
3. Use **Pause** to pause the countdown or **Reset** to return to the current session length.
4. You can adjust durations by editing the values in the center.

## About the sound

Kindles only play Audible natively, and a WebKit `Audio` element is often silent on Kindle, so
the end‑of‑session cue is **primarily visual** (screen flash + full‑screen message) and always
reliable. The gentle chime (`sounds/chime.ogg`) plays on devices/WebKit that support audio.
On a jailbroken Kindle with a speaker, audio can also be routed through the system
(`aplay /var/local/mesquite/kpomo-fancy/sounds/chime.wav`) if you wire a shell trigger.

## Fullscreen, orientation & keeping the screen awake

- **Fullscreen**: `kpomo-fancy.sh` and the app both set the chrome bar to `blank`
  (`configureChrome ... topNavBar:{template:"blank"}`), so the timer fills the screen.
- **Landscape & portrait**: the installer sets `supportedOrientation` to `URL` (both
  orientations), and the CSS is orientation-aware (tiles are sized off the smaller screen
  dimension, with a landscape media query that tightens spacing).
- **No screensaver/lock**: `kpomo-fancy.sh` runs `lipc-set-prop com.lab126.powerd preventScreenSaver 1`.
  To restore the screensaver later: `lipc-set-prop com.lab126.powerd preventScreenSaver 0`.
  (On firmware ≥ 5.14.2 the old `~ds` trick is gone; you can also drop an empty
  `TESTD_PREVENT_SCREENSAVER` file in the Kindle root.)

## Development

The code lives entirely in the `kpomo-fancy` directory. Modify `main.js` for logic,
`main.css` for styling and `index.html` for structure. The `config.xml` file makes
Kindle aware of the booklet and configures the chrome bar. The app ID is
`xyz.kurizu.kpomo-fancy`.
