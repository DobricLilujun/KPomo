/* KPomo — Pomodoro for Kindle (flip-clock UI)
   Kept lean: no heavy libraries, e-ink friendly.
   Written for Kindle's old WebKit: no classList, no getElementsByClassName,
   no flex in JS. Tiles are cached as references; settings hidden via inline style. */

var timer = null;
var remaining = 0;       // seconds left in current session
var sessionTotal = 0;    // full length of current session
var inBreak = false;     // false = work, true = break
var tiles = [];         // the four digit elements, cached at build time
var flaps = [];         // fold-cover elements, parallel to tiles
var fxOn = true;        // user toggle (Flip FX checkbox)
var fxReady = false;    // no flipping during the very first paint
var FX_STEP_MS = 420;   // pause between the two e-ink updates

// Build the flip-clock tiles once: MM : SS  (4 tiles + 1 colon).
function buildClock() {
  var clock = document.getElementById('clock');
  if (!clock || clock.childNodes.length > 0) return;

  function tile() {
    var d = document.createElement('div');
    d.className = 'tile';
    var num = document.createElement('div');   // the digit
    num.className = 'tile-num';
    num.textContent = '0';
    d.appendChild(num);
    var hinge = document.createElement('div'); // the split-flap hinge line
    hinge.className = 'hinge';
    d.appendChild(hinge);
    // The fold cover: a plain white "falling card face" that hides the bottom
    // half during stage 1 of the flip. No 3D, no CSS animation — JS timed
    // style changes, so every stage is a real repaint the e-ink shows.
    var flap = document.createElement('div');
    flap.className = 'flap';
    d.appendChild(flap);
    clock.appendChild(d);
    flaps.push({ root: flap });
    return num;                                 // updateDisplay writes to tile-num
  }
  function colon() {
    var c = document.createElement('div');
    c.className = 'colon';
    var d1 = document.createElement('div'); d1.className = 'dot';
    var d2 = document.createElement('div'); d2.className = 'dot dot2';
    c.appendChild(d1);
    c.appendChild(d2);
    clock.appendChild(c);
  }

  tiles.push(tile());   // tens of minutes
  tiles.push(tile());   // ones of minutes
  colon();
  tiles.push(tile());   // tens of seconds
  tiles.push(tile());   // ones of seconds
}

function currentMinutes() {
  var inp = inBreak ? document.getElementById('break-duration') : document.getElementById('work-duration');
  return Math.max(1, parseInt(inp.value, 10) || 0);
}

function updateDisplay() {
  var secs = remaining > 0 ? remaining : currentMinutes() * 60;
  var mins = Math.floor(secs / 60);
  var s = secs % 60;

  // tiles: [tens-min, ones-min, tens-sec, ones-sec]
  setDigit(0, Math.floor(mins / 10));
  setDigit(1, mins % 10);
  setDigit(2, Math.floor(s / 10));
  setDigit(3, s % 10);

  var label = document.getElementById('session-label');
  label.textContent = inBreak ? 'Break' : 'Focus';
  label.className = inBreak ? 'break' : 'work';

  var fill = document.getElementById('progress-fill');
  fill.style.width = sessionTotal > 0 ? ((sessionTotal - remaining) / sessionTotal * 100) + '%' : '0%';
}

// Write a digit into tile i. Only tiles whose digit CHANGED animate, and
// only when the FX is on; everything else is a plain swap.
function setDigit(i, v) {
  var t = tiles[i];
  if (String(t.textContent) === String(v)) return;
  if (fxReady && fxOn) flipCard(i, v);
  else t.textContent = v;
}

// E-ink friendly split-flap, driven by two JS-timed repaints (CSS animations
// get collapsed to their final frame by the Kindle browser — this cannot be):
// stage 1: top half of the card shows the NEW digit, the bottom half is
//          covered by a white fold (looks like the card mid-fall);
// stage 2 (FX_STEP_MS later): fold removed, new bottom revealed.
function flipCard(i, v) {
  var f = flaps[i];
  tiles[i].textContent = v;       // stage 1 paint: new top, fold hides bottom
  f.root.style.display = 'block';
  setTimeout(function () {
    f.root.style.display = 'none'; // stage 2 paint: full new digit
  }, FX_STEP_MS);
}

function toggleFlipFx() {
  var c = document.getElementById('flip-fx');
  if (c) fxOn = !!c.checked;
}

function onPageLoad() {
  buildClock();
  updateDisplay();
  fxReady = true;   // first paint is static; flips start afterwards
}

function setRunning(run) {
  // Hide/show settings by inline style (no CSS class / classList needed).
  document.getElementById('settings').style.display = run ? 'none' : 'block';
  document.getElementById('start-button').disabled = run;
  document.getElementById('pause-button').disabled = !run;
  document.getElementById('reset-button').disabled = !run;
}

function startTimer() {
  var workInput = document.getElementById('work-duration');
  var breakInput = document.getElementById('break-duration');

  if (remaining === 0) {
    var minutes = inBreak ? parseInt(breakInput.value, 10) : parseInt(workInput.value, 10);
    minutes = Math.max(1, minutes || 0);
    remaining = minutes * 60;
    sessionTotal = remaining;
  }

  workInput.disabled = true;
  breakInput.disabled = true;
  setRunning(true);
  timer = setInterval(tick, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  timer = null;
  setRunning(false);
}

function resetTimer() {
  clearInterval(timer);
  timer = null;
  remaining = 0;
  sessionTotal = 0;
  setRunning(false);
  document.getElementById('work-duration').disabled = false;
  document.getElementById('break-duration').disabled = false;
  updateDisplay();
}

function changeDuration(which, delta) {
  var el = document.getElementById(which + '-duration');
  if (!el) return;
  var v = parseInt(el.value, 10) + delta;
  if (v < 1) v = 1;
  el.value = v;
}

function tick() {
  if (remaining > 0) {
    remaining--;
    updateDisplay();
  } else {
    sessionComplete();
  }
}

// ---- End-of-session cue: VISUAL only (no audio) — e-ink flash + full-screen message ----
function sessionComplete() {
  clearInterval(timer);
  timer = null;
  setRunning(false);
  document.getElementById('work-duration').disabled = false;
  document.getElementById('break-duration').disabled = false;

  // Visual alert only (no audio): e-ink flash + full-screen message.
  if (typeof flashDisplay === 'function') { try { flashDisplay(); } catch (e) {} }

  // Pre-switch the mode label (work<->break) so the next manual Start runs the
  // correct session. NO auto-start: nothing runs until the user presses Start.
  inBreak = !inBreak;
  remaining = 0;
  sessionTotal = 0;
  updateDisplay();

  // Full-screen message (block, not flex — max compatibility).
  var cue = document.getElementById('cue');
  var msg = document.getElementById('cue-message');
  var sub = document.getElementById('cue-sub');
  if (inBreak) {
    msg.textContent = 'Break time';
    sub.textContent = 'Time to move \u2014 take a break';
  } else {
    msg.textContent = 'Back to focus';
    sub.textContent = 'Start when ready';
  }
  cue.style.display = 'block';
  setTimeout(function () { cue.style.display = 'none'; }, 4000);
}
