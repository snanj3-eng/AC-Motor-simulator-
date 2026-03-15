# Induction Motor Explorer (Single HTML File)

A single-file HTML/CSS/JavaScript simulator for understanding induction motor behavior.

## Run

Open `index.html` directly in a browser.

Or run a local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What is enhanced

- Realistic rotor dynamic response using torque balance:
  - `dω/dt = (Te - Tl - Bω) / J`
- Parameter dependency in animation:
  - Frequency and poles change synchronous speed (`Ns = 120f/P`)
  - Load changes mechanical load torque and steady slip
  - Inertia changes acceleration/deceleration response
  - Slip directly affects induced rotor current brightness and rotor frequency (`fr = s f`)
- Auto-slip mode and manual slip override.
- Presets for start-up, rated, light load, and overload.

## Core equations shown

- `Ns = 120f/P`
- `Nr = Ns(1 - s)`
- `fr = s·f`

Main principle:

**No slip -> no induced rotor current -> no electromagnetic torque.**
