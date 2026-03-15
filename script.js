const $ = (id) => document.getElementById(id);

const state = {
  f: 50,
  p: 4,
  slip: 0.04,
  timeScale: 1,
  running: true,
  t: 0,
};

const ui = {
  freq: $('freq'),
  poles: $('poles'),
  slip: $('slip'),
  timeScale: $('timeScale'),
  toggleAnim: $('toggleAnim'),
  reset: $('reset'),
  ns: $('ns'),
  nr: $('nr'),
  slipSpeed: $('slipSpeed'),
  fr: $('fr'),
  torqueVal: $('torqueVal'),
  torqueBar: $('torqueBar'),
  explain: $('explain'),
  freqVal: $('freqVal'),
  polesVal: $('polesVal'),
  slipVal: $('slipVal'),
  timeScaleVal: $('timeScaleVal'),
  presetButtons: document.querySelectorAll('.preset'),
};

const canvas = $('motorCanvas');
const ctx = canvas.getContext('2d');

function rpmSync(f, p) {
  return (120 * f) / p;
}

function estimateTorque(slip) {
  const s = Math.max(0.001, slip);
  const r = 0.055;
  const x = 0.33;
  const raw = s / (r * r + (s * x) ** 2);
  return Math.min(raw / 18, 1.8);
}

function explanationText(slip, torque) {
  if (slip < 0.015) {
    return 'Slip is very small: rotor speed is very close to synchronous speed. Relative motion is weak, so induced rotor current and electromagnetic torque are both small. This is close to no-load behavior.';
  }
  if (slip < 0.07) {
    return 'This is a typical efficient operating range. There is enough slip to induce rotor current and produce useful torque, while rotor losses are still moderate.';
  }
  if (torque < 0.55) {
    return 'Slip is high but torque gain is no longer efficient. Rotor current is strong and heating increases. In real machines this region is stressful and should be brief.';
  }
  return 'High-slip region: large relative speed induces strong rotor current and high torque potential. This is similar to start-up or overload transients.';
}

function refreshReadout() {
  const ns = rpmSync(state.f, state.p);
  const nr = ns * (1 - state.slip);
  const slipSpeed = ns - nr;
  const fr = state.slip * state.f;
  const torque = estimateTorque(state.slip);

  ui.ns.textContent = ns.toFixed(0);
  ui.nr.textContent = nr.toFixed(0);
  ui.slipSpeed.textContent = slipSpeed.toFixed(1);
  ui.fr.textContent = fr.toFixed(2);
  ui.torqueVal.textContent = `${torque.toFixed(2)} pu`;
  ui.torqueBar.style.width = `${Math.min(torque / 1.8, 1) * 100}%`;

  ui.explain.textContent = explanationText(state.slip, torque);
}

function updateControlValues() {
  ui.freqVal.textContent = `${state.f} Hz`;
  ui.polesVal.textContent = `${state.p} poles`;
  ui.slipVal.textContent = state.slip.toFixed(3);
  ui.timeScaleVal.textContent = `${state.timeScale.toFixed(1)}×`;
}

function drawArrow(cx, cy, angle, len, color, label) {
  const x2 = cx + Math.cos(angle) * len;
  const y2 = cy + Math.sin(angle) * len;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const head = 12;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - 0.3), y2 - head * Math.sin(angle - 0.3));
  ctx.lineTo(x2 - head * Math.cos(angle + 0.3), y2 - head * Math.sin(angle + 0.3));
  ctx.closePath();
  ctx.fill();

  ctx.font = '13px sans-serif';
  ctx.fillText(label, x2 + 8, y2 + 8);
}

function drawMotor() {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);

  const statorR = 150;
  const rotorR = 96;

  ctx.strokeStyle = '#8aa4c6';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, statorR, 0, Math.PI * 2);
  ctx.stroke();

  for (let phase = 0; phase < 3; phase += 1) {
    const base = (phase * Math.PI * 2) / 3;
    for (let side = 0; side < 2; side += 1) {
      const a = base + side * Math.PI;
      const x = cx + Math.cos(a) * (statorR - 6);
      const y = cy + Math.sin(a) * (statorR - 6);
      ctx.fillStyle = '#5d79a8';
      ctx.beginPath();
      ctx.arc(x, y, 7.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#deebff';
  ctx.beginPath();
  ctx.arc(cx, cy, rotorR, 0, Math.PI * 2);
  ctx.fill();

  const omegaSync = (2 * Math.PI * rpmSync(state.f, state.p)) / 60;
  const omegaRotor = omegaSync * (1 - state.slip);

  const thetaField = omegaSync * state.t;
  const thetaRotor = omegaRotor * state.t;
  const relativeAngle = thetaField - thetaRotor;

  for (let i = 0; i < 16; i += 1) {
    const a = thetaRotor + (i * Math.PI * 2) / 16;
    const x1 = cx + Math.cos(a) * (rotorR - 26);
    const y1 = cy + Math.sin(a) * (rotorR - 26);
    const x2 = cx + Math.cos(a) * (rotorR - 3);
    const y2 = cy + Math.sin(a) * (rotorR - 3);

    const emfStrength = Math.sin(relativeAngle + i * 0.6) * state.slip;
    const alpha = Math.min(1, 0.18 + Math.abs(emfStrength) * 7);
    ctx.strokeStyle = `rgba(255, 139, 43, ${alpha.toFixed(2)})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  drawArrow(cx, cy, thetaField, 118, '#2d74ff', 'Stator field');
  drawArrow(cx, cy, thetaRotor, 84, '#0d9d60', 'Rotor');

  ctx.fillStyle = '#2e435d';
  ctx.font = '14px sans-serif';
  ctx.fillText('Blue rotates at synchronous speed (Ns)', 20, 28);
  ctx.fillText('Green lags by slip (s), enabling induced rotor current', 20, 48);
}

function applyPreset(name) {
  if (name === 'start') {
    state.f = 50;
    state.p = 4;
    state.slip = 0.2;
  } else if (name === 'rated') {
    state.f = 50;
    state.p = 4;
    state.slip = 0.04;
  } else if (name === 'light') {
    state.f = 50;
    state.p = 4;
    state.slip = 0.01;
  } else if (name === 'overload') {
    state.f = 50;
    state.p = 4;
    state.slip = 0.12;
  }

  ui.freq.value = String(state.f);
  ui.poles.value = String(state.p);
  ui.slip.value = String(state.slip);
  updateControlValues();
  refreshReadout();
}

function tick(ts) {
  if (!tick.last) tick.last = ts;
  const dt = (ts - tick.last) / 1000;
  tick.last = ts;

  if (state.running) {
    state.t += dt * state.timeScale;
  }

  drawMotor();
  requestAnimationFrame(tick);
}

ui.freq.addEventListener('input', (e) => {
  state.f = Number(e.target.value);
  updateControlValues();
  refreshReadout();
});

ui.poles.addEventListener('input', (e) => {
  state.p = Number(e.target.value);
  updateControlValues();
  refreshReadout();
});

ui.slip.addEventListener('input', (e) => {
  state.slip = Number(e.target.value);
  updateControlValues();
  refreshReadout();
});

ui.timeScale.addEventListener('input', (e) => {
  state.timeScale = Number(e.target.value);
  updateControlValues();
});

ui.toggleAnim.addEventListener('click', () => {
  state.running = !state.running;
  ui.toggleAnim.textContent = state.running ? 'Pause' : 'Play';
});

ui.reset.addEventListener('click', () => {
  state.t = 0;
  state.running = true;
  state.f = 50;
  state.p = 4;
  state.slip = 0.04;
  state.timeScale = 1;

  ui.freq.value = String(state.f);
  ui.poles.value = String(state.p);
  ui.slip.value = String(state.slip);
  ui.timeScale.value = String(state.timeScale);

  ui.toggleAnim.textContent = 'Pause';
  updateControlValues();
  refreshReadout();
});

ui.presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyPreset(button.dataset.preset);
  });
});

updateControlValues();
refreshReadout();
requestAnimationFrame(tick);
