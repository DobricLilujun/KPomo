/* KPomo — Pomodoro for Kindle (flip-clock UI)
   Kept lean: no heavy libraries, e-ink friendly.
   Written for Kindle's old WebKit: no classList, no getElementsByClassName,
   no flex in JS. Tiles are cached as references; settings hidden via inline style. */

var timer = null;
var remaining = 0;       // seconds left in current session
var sessionTotal = 0;    // full length of current session
var inBreak = false;     // false = work, true = break
var tiles = [];         // the four digit elements, cached at build time
var flaps = [];         // split-flap FX elements, parallel to tiles
var fxOn = true;        // user toggle (Flip FX checkbox)
var flipSupport = false;// 3D + animation capability, detected at load
var fxReady = false;    // no flipping during the very first paint

// Detect what this Kindle's WebKit can do. If anything is missing we fall
// back to a plain digit swap (the old behaviour) — never broken graphics.
function detectFlip() {
  var s = document.createElement('div').style;
  flipSupport = (('webkitAnimation' in s) || ('animation' in s)) &&
                ('webkitTransform' in s) &&
                ('webkitBackfaceVisibility' in s);
}

// Build the flip-clock tiles once: MM : SS  (4 tiles + 1 colon).
function buildClock() {
  var clock = document.getElementById('clock');
  if (!clock || clock.childNodes.length > 0) return;

  function half(cls, txt) {
    var h = document.createElement('div');
    h.className = cls;
    var n = document.createElement('div');
    n.className = 'num-copy';
    n.textContent = txt;
    h.appendChild(n);
    return h;
  }
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
    // The falling flap: front = old digit top half, back = new digit bottom
    // half. Hidden until a flip runs; e-ink sees only 3 static frames.
    var flap = document.createElement('div');
    flap.className = 'flap';
    var front = half('flap-face flap-front', '0');
    var back = half('flap-face flap-back', '0');
    flap.appendChild(front);
    flap.appendChild(back);
    d.appendChild(flap);
    clock.appendChild(d);
    flaps.push({ root: flap, front: front.firstChild, back: back.firstChild });
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
// only when the FX is on + supported; everything else is a plain swap.
function setDigit(i, v) {
  var t = tiles[i];
  if (String(t.textContent) === String(v)) return;
  if (fxReady && fxOn && flipSupport) flipCard(i, String(t.textContent), String(v));
  t.textContent = v;   // base card shows the NEW digit immediately; the flap
                       // (front = old top half) still covers the top until it falls
}

// E-ink-friendly split-flap: exactly 3 rendered frames via step-end timing —
// 0deg (flap over old top, no visual change), -90deg (edge = one partial
// refresh), -180deg (flap landed showing new bottom half = one more).
function flipCard(i, oldDigit, newDigit) {
  var f = flaps[i];
  f.front.textContent = oldDigit;
  f.back.textContent = newDigit;
  f.root.style.display = 'block';
  // restart the CSS animation (remove -> reflow -> re-add)
  f.root.style.webkitAnimation = 'none';
  f.root.style.animation = 'none';
  void f.root.offsetWidth;
  f.root.style.webkitAnimation = 'flapfall .24s step-end forwards';
  f.root.style.animation = 'flapfall .24s step-end forwards';
  setTimeout(function () {
    f.root.style.display = 'none';
    f.root.style.webkitAnimation = 'none';
    f.root.style.animation = 'none';
  }, 260);
}

function toggleFlipFx() {
  var c = document.getElementById('flip-fx');
  if (c) fxOn = !!c.checked;
}

function onPageLoad() {
  detectFlip();
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
