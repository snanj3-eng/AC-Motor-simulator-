# Induction Motor Explorer (Single HTML File)

This project is now a **single-file HTML/CSS/JavaScript simulator**.

## Run

Just open `index.html` directly in your browser.

Or run a local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What is improved

- One self-contained file (`index.html`) with embedded styles and scripts.
- Improved UI/UX and visual hierarchy.
- Better mechanism: load-driven slip behavior with inertia-like response.
- Presets for start-up, rated, light-load, and overload exploration.
- Live torque-speed mini-curve and operating-zone explanation.

## Core equations

- `Ns = 120f / P`
- `Nr = Ns(1 - s)`
- `fr = s·f`

Main principle:

**No slip -> no induced rotor EMF/current -> no electromagnetic torque.**
