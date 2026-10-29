# ParcelVex

An interactive parcel delivery concept built with HTML, CSS, JavaScript, and native canvas. No build step or JavaScript dependencies.

## Preview

Run `python -m http.server 4174 --bind 127.0.0.1 --directory dist` from this folder, then open http://127.0.0.1:4174.

## Features

- Real 3D parcel and delivery-van geometry, with mipmapped textures, WebGL depth testing, directional lighting, orbit drag, and keyboard rotation.
- Hinged parcel flaps, three parcel sizes, mint/sky/rose tape, care-label toggle, model reset, and ambient-motion pause.
- Demo tracking for PV20261027 only; other identifiers show a validation message. A route illustration and five-step timeline support direct selection and playback.
- Draggable service carousel with touch, keyboard, arrow-button, and dot navigation; hover responses on 3D service illustrations.
- Instant sample estimates based on route, parcel size, weight, delivery style, and care option; origin/destination swap.
- Native modal parcel planner with date validation, safe text rendering, downloadable SVG demo shipping labels, and repeat planning.
- Interactive three-step packing storyboard, optional synthesized sounds, confetti, magnetic buttons, accordion answers, and reduced-motion support.

## Demonstration boundaries

This is a working frontend concept. Shipment statuses, routes, and prices are illustrative. No courier, payment, tracking API, collection, or real booking is connected. Shipping labels are marked DEMO ONLY and NOT VALID POSTAGE. Visitor inputs remain in the browser.

## Files and hosting

`dist/index.html`, `dist/delivery.css`, `dist/delivery.js`, and `dist/depth-renderer.js` are the active application. Archivo uses an optional Google Fonts stylesheet with an Arial fallback. The original playground's unused CSS/JS are retained as legacy source assets and are not loaded.

The existing site identity and owner-only audience are preserved in `.openai/hosting.json`. Package and push the exact source before deploying.

## Design

The charcoal-and-mint identity is preserved. A shipping label becomes the compositional device: route details, the tear-off tracking slip, package labels, and the downloadable label share the same visual language. The user's request for 3D illustration and extensive interaction takes precedence over generic restrictions on multiple interactive demos and a horizontal carousel. All illustrations are actual generated geometry; stock imagery would not demonstrate the requested manipulation.

## Verification

JavaScript syntax checks and browser checks at 1440, 768, and 390 pixels. Verified tracking stages, sample lookup, calculator arithmetic (including a RM 76.90 route/size/weight/extras combination), matching planner summaries, label creation and SVG download, route swapping, and motion controls. No horizontal page overflow or JavaScript errors were observed.

ParcelVex uses WebGL depth testing for correct overlapping surfaces, interior walls and layered flaps. SVG icons share a 24px grid. Model animation stops when offscreen, hidden, or paused.

## Motion and dropdown repair

The van keeps a fixed pose during idle and hover; its service card uses a small, eased scale response. Hero van rotation remains controlled by drag and keyboard. Other model motion uses elapsed-time easing and follows the display refresh rate, preserving its phase through pause/resume.

`dist/interactions.css` animates all three native select pickers, their arrows and option highlights, plus FAQ disclosures and the mobile navigation. Native selection, keyboard handling, and form events are preserved. Browsers supporting `appearance: base-select` receive the styled picker; older browsers retain their native picker. Reduced-motion settings disable these transitions.

Regression check: `node tests/model-motion.cjs`. Browser checks cover all three select pickers, keyboard selection, Escape, pointer selection, route swapping, quote updates, FAQ expansion, mobile navigation and reduced-motion durations.

## Delivery experience upgrade

The homepage prioritizes sending and tracking; optional size, tape and care controls are under Customize your parcel. The kraft model has subtle material grain and folded-edge shading while retaining the stable van pose.

`planner.js` adds a four-step sender, recipient, parcel and review flow. Required fields, five-digit postcodes, weight bounds and collection dates are validated; sample details are available. Back/edit preserves values, and package changes synchronize the existing calculator. Final confirmation generates a demo SVG label with the entered route/address details. Inputs stay in memory in the current browser tab; no data is sent to a courier or stored remotely.

Tracking adds explicitly illustrative arrival/scan details, copyable tracking ID and delay guidance. The sending guide covers sample coverage, packing, restricted-item checks and preparing a support request. Actual coverage, support and claims policies must come from a booked courier.

Verified desktop and mobile flow completion, blocked empty fields and invalid postcode, edit retention, quote updates (4kg medium everyday = RM16.90), label generation, tracking scan changes and copying. Responsive inspection at 1440/768/390px has zero blocking findings with the existing intentional design allowances.

The parcel's lid animation now uses thin rigid panels on fixed hinges, with staged outer/inner flap timing and reversed closing order. Flaps finish folded outward; tape follows the panel normal. Contents remain present and are naturally occluded by closed lids. Fixed framing avoids zooming the entire carton, while a modest pitch change reveals the interior. Reversing a moving lid preserves its position and eases its velocity. Regression checks cover finite endpoints, staged timing, unchanged scale, continuous reversal and reduced-motion states.

## Weight slider interaction

`weight-slider.js` and `weight-slider.css` enhance the original native range with a filled ruler, enlarged grip, following weight bubble, integer tick feedback, release bounce, quote response and a brief parcel preview compression. Optional tones use the existing sound toggle. Half-kilogram increment/decrement buttons and 1/5/10/20kg presets share the same input and quote calculation. All controls remain keyboard accessible; the native range retains its label, bounds and step. Programmatic quote updates synchronize the visual position. Reduced-motion mode skips JavaScript animation and cancels active effects.

Verified actual pointer dragging, keyboard arrows/Home/End, half-kilogram buttons, presets, disabled endpoint controls and reduced-motion selection. Default Medium/Everyday route at 10.5kg calculates RM30.90; at 20kg RM48.90. Checked mobile layout and console with no errors.

Weight heading and bubble numbers use a 190ms directional roll, with a fixed unit and tabular numeral window. A running transition adopts the latest target instead of queuing old values; reduced motion cancels layers and shows the current number immediately. Verified rapid preset changes keep the latest value and reduced-motion changes leave zero outgoing layers.

The sealing tape now follows the outer flaps' shared free-edge seam (x direction at z=0), continuing down the left and right carton faces. The previous perpendicular top strip and front/back decorative strips were removed. Opening illustrates tape already slit along the lid seam, with each top half attached to its own moving flap. Geometry regression checks verify seam alignment and matching side wraps.
