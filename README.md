# Kinetic Delivery

An interactive parcel delivery concept built with HTML, CSS, JavaScript, and native canvas. No build step or JavaScript dependencies.

## Preview

Run `python -m http.server 4174 --bind 127.0.0.1 --directory dist` from this folder, then open http://127.0.0.1:4174.

## Features

- Real 3D parcel and delivery-van geometry, with projected textures, depth sorting, directional lighting, orbit drag, and keyboard rotation.
- Hinged parcel flaps, three parcel sizes, mint/sky/rose tape, care-label toggle, model reset, and ambient-motion pause.
- Demo tracking for KT20261027 only; other identifiers show a validation message. A route illustration and five-step timeline support direct selection and playback.
- Draggable service carousel with touch, keyboard, arrow-button, and dot navigation; hover responses on 3D service illustrations.
- Instant sample estimates based on route, parcel size, weight, delivery style, and care option; origin/destination swap.
- Native modal parcel planner with date validation, safe text rendering, downloadable SVG demo shipping labels, and repeat planning.
- Interactive three-step packing storyboard, optional synthesized sounds, confetti, magnetic buttons, accordion answers, and reduced-motion support.

## Demonstration boundaries

This is a working frontend concept. Shipment statuses, routes, and prices are illustrative. No courier, payment, tracking API, collection, or real booking is connected. Shipping labels are marked DEMO ONLY and NOT VALID POSTAGE. Visitor inputs remain in the browser.

## Files and hosting

`dist/index.html`, `dist/delivery.css`, and `dist/delivery.js` are the active application. Archivo uses an optional Google Fonts stylesheet with an Arial fallback. The original playground's unused CSS/JS are retained as legacy source assets and are not loaded.

The existing site identity and owner-only audience are preserved in `.openai/hosting.json`. Package and push the exact source before deploying.

## Design

The charcoal-and-mint identity is preserved. A shipping label becomes the compositional device: route details, the tear-off tracking slip, package labels, and the downloadable label share the same visual language. The user's request for 3D illustration and extensive interaction takes precedence over generic restrictions on multiple interactive demos and a horizontal carousel. All illustrations are actual generated geometry; stock imagery would not demonstrate the requested manipulation.

## Verification

JavaScript syntax checks and browser checks at 1440, 768, and 390 pixels. Verified tracking stages, sample lookup, calculator arithmetic (including a RM 76.90 route/size/weight/extras combination), matching planner summaries, label creation and SVG download, route swapping, and motion controls. No horizontal page overflow or JavaScript errors were observed.
