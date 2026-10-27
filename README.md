# Kinetic

A responsive, dependency-free interaction playground built with HTML, CSS, JavaScript, and a custom canvas renderer.

## Run locally

From this folder:

```powershell
python -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4174. There is no build or install step.

## Interactions

- Drag the shaded 3D sculpture; use arrow keys when it is focused. Switch between orbit, knot, and bloom; change colors; pause or randomize it.
- Browse the scroll-snap carousel with drag, touch, arrow keys, arrow buttons, or pagination dots.
- Open four experiments: a magnetic dot field, a spring-return draggable ball, click-generated ripples, and a type playground with editable text and font weight.
- Try magnetic links, press feedback, a 1.1-second hold action, a reversible love toggle, and canvas confetti.
- Enable synthesized interaction audio. No recording or microphone is involved.
- Toggle ambient motion. Device reduced-motion settings are respected automatically.

## Implementation

All served files are in `dist/`. The only external resource is the optional Archivo web font, with an Arial fallback. No API, account, database, or third-party JavaScript is required.

The experiment dialog uses native modal focus management and Escape handling. Interactive graphics have keyboard controls. Mouse dragging does not interfere with ordinary vertical page scrolling.

## Design decisions

The original concept is an interaction exhibit: Kinetic's name becomes motion visitors can directly manipulate. A charcoal ground, mint material, and Archivo typography connect the sculpture and controls. The fixed visual frame changes its contents as shape and color controls are used. The interface itself supplies the artwork; stock photography and video would not demonstrate the requested interactions.

The user's request for extensive hover, active-button, and carousel interactions takes precedence over generic style restrictions on multiple live demos, lateral scrolling, and tactile button depth. Symbols are functional vector-like glyphs rather than pictorial emoji. Small secondary captions, the cropped footer wordmark, and carousel edges are intentional; important prose and controls are larger.

## Verification

Browser layout checks at 1440, 768, and 390 pixels found no horizontal page overflow or JavaScript errors. The hero, collection, controls, and phone layout were visually inspected. Browser interactions verified sculpture state changes, all four dialogs, keyboard manipulation, editable text, press-and-hold completion, button toggles, reset, confetti, and motion control.

Hosting identity is stored in `.openai/hosting.json`. The Sites workflow publishes the exact pushed source with the static deployment archive.
