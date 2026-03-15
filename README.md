# Induction Motor Learning Simulator (HTML/CSS/JavaScript)

This project is a simple website to **clearly and practically** understand how an induction motor works.

## Main learning goal

Understand this chain:

1. Stator field rotates at synchronous speed.
2. Rotor is slightly slower (slip exists).
3. Relative motion induces rotor EMF/current.
4. Rotor current interacts with stator field and creates torque.

If slip goes to zero, induced current goes to zero and torque disappears.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## What the simulator shows

- **Blue arrow**: rotating stator magnetic field.
- **Green arrow**: rotor position/speed.
- **Orange bars**: induced rotor current intensity.
- **Live cards**: `Ns`, `Nr`, slip speed, and rotor frequency.
- **Torque bar**: educational relative-torque estimate.

## Equations used

- `Ns = 120f/P` (rpm)
- `Nr = Ns(1 - s)`
- `slip speed = Ns - Nr`
- `fr = s·f`

## Practical walkthrough

1. Click **Start-up (high slip)** and observe strong orange bars + high torque estimate.
2. Click **Normal run** and see moderate slip with practical efficient behavior.
3. Click **Light load** and observe slip near zero, weak induced current, low torque.
4. Increase poles at fixed frequency and watch synchronous speed drop.
5. Increase frequency at fixed poles and watch synchronous + rotor speed rise.

## Note

This is an educational visualization designed for conceptual understanding.
