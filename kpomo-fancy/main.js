/* KPomo — Pomodoro for Kindle (flip-clock UI)
   Kept lean: no heavy libraries, e-ink friendly.
   Written for Kindle's old WebKit: no classList, no getElementsByClassName,
   no flex in JS. Tiles are cached as references; settings hidden via inline style. */

var timer = null;
var remaining = 0;       // seconds left in current session
var sessionTotal = 0;    // full length of current session
var inBreak = false;     // false = work, true = break
var tiles = [];         // the four digit tiles, cached at build time

// Build the flip-clock tiles once: MM : SS  (4 tiles + 1 colon).
function buildClock() {
  var clock = document.getElementById('clock');
  if (!clock || clock.childNodes.length > 0) return;

  function tile() {
    var d = document.createElement('div');
    d.className = 'tile';
    d.textContent = '0';
    clock.appendChild(d);
    return d;
  }
  function colon() {
    var c = document.createElement('div');
    c.className = 'colon';
    c.textContent = ':';
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
  tiles[0].textContent = Math.floor(mins / 10);
  tiles[1].textContent = mins % 10;
  tiles[2].textContent = Math.floor(s / 10);
  tiles[3].textContent = s % 10;

  var label = document.getElementById('session-label');
  label.textContent = inBreak ? 'Break' : 'Focus';
  label.className = inBreak ? 'break' : 'work';

  var fill = document.getElementById('progress-fill');
  fill.style.width = sessionTotal > 0 ? ((sessionTotal - remaining) / sessionTotal * 100) + '%' : '0%';
}

function onPageLoad() {
  buildClock();
  updateDisplay();
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
