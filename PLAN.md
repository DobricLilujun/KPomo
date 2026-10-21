# Kpomo-fancy — Polish pass (big bold reversed digits, bigger buttons, 50/5 defaults, visual alert)

## Context
The flip-clock layout now centers correctly on the Kindle (table-layout fix confirmed
working). Final polish pass requested by the user:
1. **Digits too small** → make them as big as the screen can fit, **bold**, **reversed**
   (white tile background, black text) with a **border** for a slight "flip-card" design
   feel; clear/legible ("artistic" type).
2. **Controls too small** → make Start / Pause / Reset (and the +/- settings) bigger.
3. **Defaults** → Focus **50 min**, Break **5 min**.
4. **End-of-session alert** → **no audio** (user: "取消声音"). Alert is **visual only**:
   a prominent screen flash / full-screen message (Kindle PW5 has no speaker anyway).

User decisions (from Q&A):
- Q1 audio → **none**; alert = **screen flash / UI blink** (visual).
- Q2 sound style → **cancel sound entirely** (remove the chime playback).
- Q3 tile look → **white bg + black text + border**, slight design feel, must be clearly
  legible, use a bold/"artistic" typeface; make it **as big as the screen can fit**.
- Q4 auto-advance → **answered: manual only, no auto-advance.** When a session ends the
  timer STOPS and the alert shows; the next session does **NOT** start by itself — the
  user must press **Start**. (Mode label still pre-switches to the next session so the
  next Start is the right one; nothing runs until the user presses.)

## Key constraints
- **Kindle WebKit is ancient** (CSS3 ~45% on older FW; PW5 5.16.9 is better but assume
  the minimum): no flexbox, no `:root`/`var`, no `min/clamp/inset`, no `::after` for
  critical layout, no CSS transforms/animations (e-ink is slow + ghosts).
- **e-ink**: no shadows, no smooth animation; a "flash" = a few full-screen toggles or
  one unmistakable full-screen message.
- **Centering already works** via `display: table` + `margin: 0 auto` — keep it.
- Kindle **font support is limited** → use a bold system sans-serif (no web-font
  dependency, keeps the app lean); "artistic" = large + very bold + clean + bordered.

## Approach
- **Digits (main.css):** enlarge `.tile` to ~170–180px with `font-size` ~110–115px;
  `font-weight: 900`; **white background + black text**; add a **dark border (3px)** and
  keep `border-radius` for a rounded flip-card look; enlarge `.colon` to match. Keep
  `display: table` / `table-cell` centering. Add a landscape `@media` scale so the
  vertical stack still fits the short axis.
- **Buttons (main.css):** `#controls button` → `font-size: 24px`, `font-weight: 700`
  (bolder), `padding: 16px 30px`; enlarge `#settings` +/- buttons + input + make them bold.
- **Defaults (index.html):** work `value="50"`, break `value="5"`.
- **Alert (main.js):** remove `loadChime()`/audio entirely from `sessionComplete()`.
  Keep `flashDisplay()` + the `#cue` overlay; make the cue **unmistakable** (full-screen
  black bg + big white text, shown a few seconds; optionally a couple of full-screen
  flashes). No `<audio>` playback.
- **No auto-advance (main.js):** `sessionComplete()` stops the timer and shows the alert
  but does **NOT** auto-start the next session. It pre-switches the mode label
  (work↔break) so the next manual **Start** runs the correct session; nothing runs until
  the user presses Start (honors "手动按，不要自动").
- **Cache-bust (index.html):** `?v=4` → `?v=5` (forces Kindle to drop the old cached
  CSS/JS — this has been the recurring "it didn't change" cause).

## Files to modify
- `kpomo-fancy/main.css` — tile size/color/weight/border, button sizes, (optionally
  vertical centering), landscape scale.
- `kpomo-fancy/index.html` — work/break default values (50 / 5); cache-bust `?v=5`.
- `kpomo-fancy/main.js` — drop audio; robust visual `sessionComplete()` alert
  (flash + full-screen `#cue`).
- `kpomo-fancy/sounds/` — **leave as-is / unused** (no audio played); no change needed.
- `kpomo-fancy/config.xml` — **no change** (no audio permission needed since sound is off).

## Reuse
- `kpomo-fancy/main.js` → `buildClock()`, `updateDisplay()`, `tiles[]`, `sessionComplete()`,
  `setRunning()` (inline-style pattern). Remove `loadChime()` + the `chime` var usage.
- `kpomo-fancy/index.html` → `#cue` overlay + `#cue-message` / `#cue-sub`.
- `kpomo-fancy/main.css` → existing `display: table` centering + `@media (orientation:
  landscape)` block (extend with new sizes).

## Steps
- [x] 1. main.css: `.tile` → size ~175px, `font-size` ~110px, `font-weight: 900`,
      `background: #fff`, `color: #000`, `border: 3px solid #1b1b1b`, keep `border-radius`;
      enlarge `.colon`; update landscape `@media` sizes proportionally.
- [x] 2. main.css: `#controls button` → `font-size: 24px`, `font-weight: 700`,
      `padding: 16px 30px`; `#settings` +/- buttons + input → bigger + bolder;
      `#session-label` slightly bigger.
- [x] 3. index.html: work `value="50"`, break `value="5"`; bump cache-bust to `?v=5`.
- [x] 4. main.js: delete `loadChime()` + `var chime` audio use; in `sessionComplete()`
      keep `flashDisplay()` + show `#cue` (enhanced: full-screen, big text) for a few
      seconds; no audio calls.
- [x] 5. Verify CSS is valid; headless Chrome render portrait + landscape (no overflow,
      no JS errors, digits centered + white/black + bordered).
- [x] 6. Ship new zip to release v1.0.

## Verification
- CSS brace balance + headless Chrome render in portrait & landscape: digits centered,
  white bg / black text / bordered / bold / large; buttons bigger; no overflow; no JS
  errors; `#cue` overlay renders.
- Logic test: session-complete flips work↔break, no audio call remains, settings hidden
  while running, `updateDisplay()` counts correctly.
- User confirms on Kindle: digits bigger + clear + bordered; buttons bigger; defaults
  50/5; on completion a clear full-screen flash/message (no sound).

## Icon (new request: "在 Kindle 上的 ICON 记得换一下")
### Findings
- The current "icon" is **`assets/kpomo.png` (454×695) — a screenshot, not a real icon.**
  It appears only as a **`# Icon: data:image/png;base64,…` comment** in the header of
  `kpomo-fancy.sh`; the installer body (copy → appreg.db register → launch) **never
  applies it**, so the app currently shows a default/placeholder icon.
- KindleModding confirms scriptlets/booklets are given an icon via the **`# Icon:` flag**
  (value = an absolute image path **or** a base64 data URI), and/or via the **appreg.db
  `properties` table**. Our manual installer uses the appreg.db path.
- Tooling available to generate a new icon: **Python PIL 12.3.0** (and Node). No
  ImageMagick. The user cannot send images (channel limit) and I cannot view theirs.

### Plan for the icon
- [x] Generate a new **square icon (128×128, transparent, PNG)** with PIL — a **white
      flip-clock tile with a bold black digit** (user-chosen), matching the new app look:
      white rounded tile, dark border, centered bold digit (e.g. "5" or "0").
- [x] Save it to `assets/` (replace the screenshot) and **base64-encode** it.
- [x] Apply it via the installer: set the icon in the appreg.db **`properties`** table
      (name `icon`, value `data:image/png;base64,…`) for `$APP_ID`, and/or restore the
      `# Icon:` flag to the installer header. (Verify exact mechanism against the live
      appreg.db schema during implementation.)
- [x] Update the release zip so the installer carries the new icon.

### Icon design (DECIDED by user)
- **Design = a single white flip-clock tile with a bold black digit** (option 1).

## Open items
- None — all questions answered (icon = flip-clock tile + bold digit; buttons bigger +
  bolder; no audio; no auto-advance; white/black bold digits with border; defaults 50/5).
  (If the user later wants **zero** auto behavior, we can drop the mode pre-switch too
  and add a manual mode toggle.)
