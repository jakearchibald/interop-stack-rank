/** @type {{ [key: number]: { title: string; subtitle?: string } | {titleHTML: string} }} */
const defs = {
  // Interop 2026 proposals
  994: {
    title: 'JPEG XL image format',
  },
  995: {
    title: 'Customizable/stylable `<select>`',
    subtitle: '_Not_ including `<select multiple>`.',
  },
  996: {
    title: 'CSS linked parameters',
    subtitle:
      'Allows passing custom properties into external SVG resources, such as colors.',
  },
  999: {
    title: 'OpenID4VC',
  },
  1000: {
    title: 'CSS `user-select` without a vendor prefix',
  },
  1001: {
    title: 'Web Bluetooth API',
  },
  1002: {
    title: 'Web NFC API',
  },
  1003: {
    title: 'Media element pseudo-classes',
    subtitle:
      'Such as `:playing`, `:paused`, `:seeking`, `:buffering`, `:stalled`, `:muted`, and `:volume-locked`.',
  },
  1004: {
    title: 'CSS `field-sizing: content`',
    subtitle:
      'Allows form controls such as `<textarea>` to be sized based on their content.',
  },
  1005: {
    title: '`requestIdleCallback`',
    subtitle:
      'Queues a function that runs in idle browser time, either at the end of a frame or when the user is inactive.',
  },
  1006: {
    title: 'CSS `margin-trim`',
    subtitle:
      'Removes the margins of child elements when they meet the edges of the container.',
  },
  1007: {
    title: 'Invoker commands',
    subtitle:
      'Declarative commands on `<button>` via the `command` and `commandfor` attributes.',
  },
  1008: {
    title: 'CSS `interpolate-size` property and `calc-size()` function',
    subtitle:
      'Allows animating to `height: auto` and other intrinsic sizing keywords.',
  },
  1011: {
    title: 'HTML reference targets',
    subtitle:
      'A declarative way to forward IDrefs (such as `for` and `aria-labelledby`) to an element inside a shadow root.',
  },
  1012: {
    title: 'XSL transformations (XSLT) version 3',
    subtitle: 'For declaratively transforming XML to other formats.',
  },
  1016: {
    title: 'Virtual keyboard API',
    subtitle:
      '`navigator.virtualKeyboard` lets you react to and control on-screen virtual keyboards.',
  },
  1018: {
    title: 'Consistent print layout width',
    subtitle:
      'Consistently base printed layout width on the page size rather than the viewport size.',
  },
  1019: {
    title: 'WebGPU API',
    subtitle:
      '`navigator.gpu` allows operations such as rendering and computation on dedicated graphics hardware.',
  },
  1020: {
    title: "Resolve text rendering 'smoothing' inconsistencies on macOS",
    subtitle:
      'Explore and create a standard version of `-webkit-font-smoothing`.',
  },
  1021: {
    title: 'WebXR API',
    subtitle:
      "`navigator.xr` allows interacting with the browser's virtual reality or augmented reality system.",
  },
  1022: {
    title: 'JavaScript `Temporal`',
    subtitle: 'A modern and extensive date/time API to replace `Date`.',
  },
  1024: {
    title: 'CSS `sibling-count()` and `sibling-index()` functions',
    subtitle:
      "Allow styling based on an element's position among its siblings.",
  },
  1025: {
    title: 'CSS `:open` pseudo-class',
    subtitle:
      'Matches open states on things like `<details>`, `<dialog>`, and `<select>`.',
  },
  1026: {
    title: 'Improve CSS `background-clip: text` implementations',
    subtitle: 'Widely supported, but frustrating bugs persist.',
  },
  1027: {
    title: 'Scoped custom element registries',
    subtitle:
      'Allows elements/roots to use different custom element registries, so the same custom element names can point to different definitions.',
  },
  1028: {
    title: 'CSS `accent-color` property',
    subtitle:
      'Sets a color for checkboxes, radio buttons, and other form controls.',
  },
  1029: {
    title: 'CSS `line-clamp` property',
    subtitle:
      'Limits the text in a block container to a certain number of lines.',
  },
  1030: {
    title: 'CSS `interactivity: inert`',
    subtitle:
      'Makes an element and its descendants inert, like the `inert` HTML attribute.',
  },
  1031: {
    title: 'CSS `overlay` property',
    subtitle:
      'When used as an `allow-discrete` CSS transition, prevents a top layer element, such as a popover or a `<dialog>`, from leaving top layer before it has finished animating.',
  },
  1032: {
    title: 'CSS `@container style()`',
    subtitle:
      'Apply styles based on the values of custom properties of a container.',
  },
  1033: {
    title: 'CSS scroll-driven animations',
    subtitle:
      "`animation-timeline`, `scroll-timeline`, and `view-timeline` CSS properties advance animations based on the user's scroll position.",
  },
  1034: {
    title: 'DOM `moveBefore()`',
    subtitle:
      'Relocates a node while preserving its state like focus, animation, or move an iframe without reloading its content.',
  },
  1036: {
    title: 'CSS `@custom-media`',
    subtitle: 'Alias media queries to reusable identifiers.',
  },
  1037: {
    title: 'CSS `justify-items` and `justify-self` outside of flexbox/grid',
  },
  1038: {
    title: 'Synthesis for `font-variant-position`',
    subtitle:
      "If the font doesn't support `super`/`sub`, browsers should synthesize the effect.",
  },
  1039: {
    title: 'CSS `break-after` and `break-before` properties',
    subtitle: 'Control breaks in paged media and CSS columns.',
  },
  1042: {
    title:
      'CSS `hyphenate-limit-chars`, `hyphenate-limit-lines`, `hyphenate-limit-last` and `hyphenate-limit-zone` properties',
  },
  1043: {
    title: 'CSS `hanging-punctuation` property',
    subtitle:
      'Puts punctuation characters outside of the box to align the text with the rest of the document.',
  },
  1044: {
    title: 'CSS `wrap-inside: avoid`',
    subtitle: 'Encourage spans of text to avoid breaks unless necessary.',
  },
  1045: {
    title: 'Reference entire files with SVG `<use>`',
    subtitle: 'Avoids needing to specify an ID on the root `<svg>` element.',
  },
  1046: {
    title: 'CSS `shape()` function',
    subtitle:
      'Similar to `path()`, but allow a variety of responsive units and CSS functions.',
  },
  1047: {
    title: 'Improve reliability of the Notification API',
  },
  1048: {
    title: 'CSS `corner-shape` property',
    subtitle:
      'Alternative shapes for `border-radius`, such as squircles and bevels.',
  },
  1049: {
    title:
      'Alpha channel support in color inputs via `<input type="color" alpha>`',
  },
  1050: {
    title:
      'CSS `ui-serif`, `ui-sans-serif`, `ui-monospace`, and `ui-rounded` font families',
    subtitle: 'Selects the device-default user interface fonts for text.',
  },
  1051: {
    title: 'CSS `stretch` value for `width` and `height` properties',
    subtitle:
      "Expands a box as needed to fit its contents until the maximum size is reached, without preserving the content's preferred aspect ratio.",
  },
  1056: {
    title: 'JavaScript CSS constructable stylesheet imports',
    subtitle:
      '`import … with { type: "css" }` to load CSS resources as constructable stylesheets.',
  },
  1057: {
    title: '`LayoutShift` entries in the Performance API',
    subtitle:
      'Measures the layout stability of web pages based on movements of the elements on the page.',
  },
  1058: {
    title:
      'CSS `light-dark()` and `prefers-color-scheme` support in external SVG resources',
    subtitle:
      'Allows external SVG resources to adapt to light and dark mode preferences.',
  },
  1061: {
    title: 'CSS stroked text',
    subtitle:
      'Support for `stroke-width`, `stroke-color`, `stroke-align` and `fill-color`.',
  },
  1062: {
    title: 'CSS `text-box` and related longhand properties',
    subtitle:
      "Sets the spacing above and below text based on a font's typographic features.",
  },
  1063: {
    title: 'HTML switch input via `<input type="checkbox" switch>`',
  },
  1064: {
    title: '`SharedWorker`',
    subtitle: 'A web worker that can be shared by multiple pages/workers.',
  },
  1066: {
    title: 'CSS `element()` function',
    subtitle:
      'Creates a live-updating image from an HTML element that can be used as an image or background image.',
  },
  1067: {
    title:
      '`PerformanceLongAnimationFrameTiming` entries in the Performance API',
    subtitle:
      'Provides information about rendering updates that take longer than 50 milliseconds.',
  },
  1068: {
    title: 'Async iterable `ReadableStream`s',
    subtitle:
      "Allows you to use `for await … of` loops to iterate through a stream's incoming data.",
  },
  1069: {
    title: '`fetchLater()` API',
    subtitle:
      'Requests a deferred fetch sent at an unknown time. The browser chooses a reliable time to send the request, ideally when the document is unloaded, and ignores the response.',
  },
  1070: {
    title:
      'HTML `blocking="render"` attribute on `<link>`, `<script>` and `<style>`',
    subtitle:
      'Blocks rendering until the external script or stylesheet has been loaded.',
  },
  1071: {
    title: 'Signature-based Subresource Integrity (SbSRI) ',
    subtitle:
      'Allows subresources to be validated against publisher-provided digital signatures.',
  },
  1072: {
    title: 'Allow fetching requests with `ReadableStream` bodies',
    subtitle:
      'Allows sending data before the entire body is available, and sending large bodies without buffering them in memory.',
  },
  1077: {
    title: 'CSS `attr()` usage in all properties',
    subtitle: 'Previously only supported in the `content` property.',
  },
  1078: {
    title: 'Improve resource timing support',
  },
  1079: {
    title: '`navigator.connection` API',
    subtitle:
      'Provides information about the network connection and fires events when the connection type changes.',
  },
  1080: {
    title: '`trackVisibility` in `IntersectionObserver`',
    subtitle:
      'Enables tracking the visibility of an element, to detect if it may be obscured by other content or visual effects.',
  },
  1081: {
    title: 'Speculation Rules API',
    subtitle:
      'Hints to the browser to proactively download pages in the background so they appear instantly when the user navigates to them.',
  },
  1082: {
    title: 'Permissions Policy',
    subtitle:
      'Similar to Content Security Policy but controls features instead of security behavior.',
  },
  1083: {
    title: 'Web Share API',
    subtitle:
      "Invokes the device's native sharing mechanism and passes text, links, files, and other content to share targets.",
  },
  1084: {
    title:
      'Improve reliability of viewport-related units (`lvh`, `dhv`, `svh`) and APIs',
  },
  1088: {
    title: 'CSS Typed OM',
    subtitle:
      '`CSSStyleValue` and its subclasses represent CSS values as distinct types instead of only strings.',
  },
  1089: {
    title: 'Force scroll containers without focusable children to be focusable',
    subtitle:
      'Otherwise, content within the container is unreachable to keyboard users.',
  },
  1090: {
    title: 'CSS container scroll-state queries',
    subtitle:
      'The `@container scroll-state(...)` at-rule applies styles based on the sticky positioning, snapped, and scrollable state of the container.',
  },
  1093: {
    title: 'JSPI (JavaScript Promise Integration) for WASM',
    subtitle:
      'Allows code compiled to WASM to be written as-if synchronous, but awaits a Promise outside of WASM.',
  },
  1094: {
    title: 'WebDriver BiDi',
    subtitle:
      "A new protocol for browser automation, extending 'classic' WebDriver by introducing bidirectional communication.",
  },
  1097: {
    title: 'Partitioned cookies',
    subtitle:
      'Allows opting a cookie into partitioned storage, with a separate cookie jar per top-level site.',
  },
  1098: {
    title: 'Federated credential management (FedCM)',
    subtitle:
      '`IdentityCredential` API delegates authentication to a third-party identity provider, instead of using third-party cookies.',
  },
  1101: {
    title: 'Improve WebRTC test pass-rate',
  },
  1102: {
    title: 'CSS Gap decorations',
    subtitle:
      '`column-rule` and `row-rule` display decorative lines between columns and rows of a flex, grid, or multi-column layout.',
  },
  1103: {
    title: 'CSS `@supports` for at-rules, nesting, and other CSS syntax',
  },
  1104: {
    title: 'Improve support for CSS `filter()` within SVG',
  },
  1105: {
    title: 'JavaScript top-level `await`',
    subtitle:
      'Largely supported, but some implementations have race conditions in simple cases that cause modules to fail to load.',
  },
  1107: {
    title: 'CSS Scroll snap events',
    subtitle:
      '`scrollsnapchanging` and `scrollsnapchange` events fire when a scroll gesture changes the selected scroll snap target.',
  },
  1108: {
    title: '`scrollend` event',
    subtitle: 'Fires when an element or document has finished scrolling.',
  },
  1109: {
    title: 'Chaining pseudo-elements to `::details-content`',
    subtitle: 'Such as `::details-content::before`.',
  },
  1110: {
    title: 'Cross-document CSS view transitions',
    subtitle:
      '`@view-transition` sets whether a document opts-in to transitions between documents in a multi-page application.',
  },
  1111: {
    title: 'HTML `closedby` attribute on `<dialog>`',
    subtitle:
      'Sets which user actions close a dialog. For example, closedby="any" allows the dialog to be closed by clicking outside of it.',
  },
  1112: {
    title:
      'Allow CSS transitioning/animating `display` between `none` and other values',
    subtitle:
      'Useful for delaying `display: none` until an exit animation completes.',
  },
  1113: {
    title: 'Navigation API `precommitHandler`',
    subtitle:
      'Allows deferring the URL change until some point during a same-document navigation.',
  },
  1114: {
    title: '`<img sizes="auto" loading="lazy">`, and similar on `<source>`',
    subtitle:
      'Avoids needing to specify `sizes` in cases where the image has already received layout by CSS.',
  },
  1119: {
    title: 'Web Neural Network API (WebNN)',
    subtitle:
      'Constructs and executes computational graphs of neural networks by making use of the various machine learning capabilities and hardware accelerators available on the device.',
  },
  1120: {
    title: 'Scheduler API',
    subtitle: 'Helps chunk up main-thread work relative to other tasks.',
  },
  1121: {
    title: 'WebTransport API',
    subtitle:
      'Enables transmitting data between a client and a server, using the HTTP/3 protocol.',
  },
  1122: {
    title: '`MediaStreamTrackProcessor` and `VideoTrackGenerator` APIs',
    subtitle: 'Enables real-time processing of video streams.',
  },
  1123: {
    title: 'Improve compatibility of pointer events on touch devices',
  },
  1124: {
    title: 'CSS `::before` and `::after` on replaced elements',
    subtitle: 'Such as `<input>`, `<img>`, and `<video>`.',
  },
  1125: {
    title: 'Interoperable rendering of HTML `<fieldset>` / `<legend>`',
    subtitle:
      'Including how particular CSS properties impact appearance on those elements.',
  },
  1126: {
    title: 'Timing of scroll events relative to animation events',
  },
  1127: {
    title: 'Unify behavior of Promises in detached documents',
  },
  1129: {
    title: 'HTML `popover="hint"`',
    subtitle:
      'Creates a popover that is subordinate to popovers with a popover="auto" attribute. You can use this to create tooltips that don\'t dismiss auto popovers.',
  },
  1130: {
    title: 'CSS `reading-flow` property',
    subtitle:
      'Sets the order in which flex or grid elements are rendered to speech or reached via focus navigation.',
  },
  1131: {
    title: 'CSS `::scroll-marker` and `::scroll-marker-group` pseudo-elements',
    subtitle:
      'Create and style markers that are visually represented within the scrollbar track of a container.',
  },
  1134: {
    title: 'Resolve CSS scroll snap differences across browsers',
  },
  1136: {
    title: 'CSS `text-wrap: pretty`',
    subtitle:
      'Prioritizes better layout over speed when text is broken into multiple lines.',
  },
  1137: {
    title: 'View transition types',
    subtitle:
      'Specify the type when starting a transition, and react to that using the `:active-view-transition-type()` pseudo-class.',
  },
  1138: {
    title: 'Trusted Types',
    subtitle:
      'Allows you to lock down insecure parts of the DOM API and prevent client-side cross-site scripting (XSS) attacks.',
  },
  1140: {
    title: 'Improve interoperability of MathML rendering',
  },
  1142: {
    title: '`NotRestoredReasons` in the Performance API',
    subtitle:
      'Provides report data containing reasons why the current document was blocked from using the back/forward cache.',
  },
  1143: {
    title: 'Align behavior of incumbent globals in Promises',
  },
  1146: {
    title: 'Improve browser interoperability of CSS flexbox sizing',
  },
  1147: {
    title: 'WASM `Memory64`',
    subtitle:
      'Adds support for WebAssembly memories larger than 4GB for memory-intensive applications.',
  },
  1149: {
    title: 'CSS Custom Highlight API',
    subtitle:
      'Style arbitrary text ranges, without adding extra elements to the DOM.',
  },
  1150: {
    title: 'CSS `object-view-box`',
    subtitle: 'Crops and zooms to an inset area of an image.',
  },
  1151: {
    title:
      'IndexedDB `getAllRecords()` and direction option for `getAll()`/`getAllKeys()`',
    subtitle:
      'Enables certain read patterns to be significantly faster when compared to the existing alternative of iteration with cursors.',
  },
  1152: {
    title:
      'Custom elements that extend built-in elements via the `is` attribute',
  },
  1154: {
    title: 'CSS `paint()` API',
    subtitle:
      "Creates a custom image, drawn using a paint worklet, for an element's background or border.",
  },
  1155: {
    title: 'HTML `autocorrect` attribute',
    subtitle:
      'Controls whether to automatically correct spelling or punctuation errors for user input.',
  },
  1156: {
    title: 'Improve support for request/response body formdata and mime-type',
  },
  1157: {
    title: 'Fully support fetch/range',
  },
  1160: {
    title: 'CSS `filter(image, ...filters)`',
    subtitle: 'Takes an image and a filter, and returns a new image.',
  },
  1161: {
    title: 'WebVTT',
    subtitle:
      'WebVTT files are loaded using the `<track>` element, and the `VTTCue` API can be used to create or update cues dynamically.',
  },
  1162: {
    title: 'Payment Handler API',
    subtitle:
      'A standardized set of functionality for web applications to directly handle payments, rather than having to be redirected to a separate site for payment handling.',
  },
  1163: {
    title: 'JSON source text access',
    subtitle:
      "To serialize and parse JSON in a lossless way,` JSON.stringify()` handles `rawJSON` values and `JSON.parse()`'s reviver callback takes a source context parameter.",
  },
  1164: {
    title: 'CSS `background-clip: border-area`',
    subtitle: 'Draws the background underneath only the border of an element.',
  },
  1165: {
    title: 'CSS `contrast-color()` function',
    subtitle:
      'Picks a color that has guaranteed contrast against a specified foreground or background color.',
  },
  1166: {
    title: 'CSS `color-mix()` without specifying a colorspace',
    subtitle: 'Defaulting to `oklab`.',
  },
  1167: {
    title: 'CSS `display-p3-linear` colorspace',
  },
  1168: {
    title: 'CSS `box-shadow` longhands',
    subtitle: 'Such as `box-shadow-color` and `box-shadow-offset`.',
  },
  1172: {
    title: 'CSS anchor positioning',
    subtitle: 'Places an element based on the position of another element.',
  },
  1173: {
    title: '`LargestContentfulPaint` entries in the Performance API',
    subtitle:
      'Measures the time it takes for the largest image or text to appear.',
  },
  1174: {
    title: 'CSS `@scope`',
    subtitle: 'Sets the scope for a group of rules.',
  },
  1175: {
    title:
      'CSS `overflow-inline`, `overflow-block`, and `writing-mode` properties',
  },
  1176: {
    title: 'Improve interoperability of CSS grid, subgrid, and flexbox',
  },
  1177: {
    title: 'JavaScript JSON imports via `import … with { type: "json" }`',
  },
  1178: {
    title: 'Improve interoperability of the navigation API',
  },
  1179: {
    title: 'Improve interoperability of CSS `backdrop-filter`',
  },
  1180: {
    title: 'Improve interoperability of pointer and mouse events',
  },
  1181: {
    title: 'Improve interoperability of storage access API',
  },
  1182: {
    title: 'Improve interoperability of the HTML `<details>` element',
  },
  1183: {
    title: 'Improve interoperability of CSS `text-decoration`',
  },
  1184: {
    title: 'Improve interoperability of the view transition API',
  },
  1185: {
    title: 'Improve interoperability of WebAssembly',
  },
  1186: {
    title: 'Improve interoperability of `URLPattern`',
  },
  1187: {
    title:
      'Improve interoperability of CSS `appearance`, CSS `zoom`, error events when a worker is blocked via CSP, `Performance.observe`, CSS `list-style-position`, CSS `overscroll-behavior` on the root, `document.caretPositionFromPoint()`',
    subtitle:
      'These are small things which have caused compat issues in the wild.',
  },
  1188: {
    title:
      'WebRTC `RTCRtpScriptTransform` and transferability of `RTCDataChannels`',
  },
  1197: {
    title: 'HTML `<link rel="prefetch">`',
    subtitle:
      'Hints to the browser that the user is likely to need a resource, so the browser should preemptively fetch and cache it.',
  },
  1198: {
    title: 'HTML `<link rel="expect">`',
    subtitle:
      'Hints to the browser to block rendering until a particular element is connected to the document and fully parsed.',
  },
  1199: {
    title: 'HTML `<link rel="alternate stylesheet">`',
    subtitle: 'Offers an alternative style option to users.',
  },
  // Interop 2027 proposals
  1331: {
    title: 'WebUSB API',
    subtitle: 'Exposes USB-compatible devices to web pages.',
  },
  1333: {
    title: 'Shadow DOM `referenceTarget`',
    subtitle:
      'Forwards IDrefs (such as `for` and `aria-labelledby`) to an element inside a shadow root.',
  },
  1334: {
    title: 'Correct handling of powerless and missing color components',
    subtitle:
      'Fixes `none` and powerless components in `color-mix()`, relative color syntax, and gradients.',
  },
  1335: {
    title: 'Speculation Rules API',
    subtitle:
      'Hints to the browser to proactively download pages in the background so they appear instantly when the user navigates to them.',
  },
  1336: {
    title: 'Sanitizer API, via `document.parseHTML()` and `element.setHTML()`',
    subtitle:
      'Customizes the sanitization of HTML inserted into the DOM, to prevent cross-site scripting attacks.',
  },
  1342: {
    title: 'Deprecate customized built-in elements (via the `is` attribute)',
    subtitle:
      'Remove the feature from the spec and the browsers that implement it.',
  },
  1343: {
    title: 'CSS `if()` function',
    subtitle:
      'An inline conditional value that returns a value based on a set of conditions.',
  },
  1344: {
    title: 'CSS `var()` in size container queries',
    subtitle: 'Such as `@container (width >= var(--min-width))`.',
  },
  1345: {
    title: 'CSS scroll snap events',
    subtitle:
      '`scrollsnapchanging` and `scrollsnapchange` events fire when a scroll gesture changes the selected scroll snap target.',
  },
  1346: {
    title: 'CSS linked parameters',
    subtitle:
      'Allows passing custom properties into external SVG resources, such as colors.',
  },
  1347: {
    title: '`CSSPseudoElement` API',
    subtitle:
      'Represents pseudo-elements in JavaScript, allowing things like detecting clicks on a `::backdrop`.',
  },
  1348: {
    title: 'HTML `focusgroup` attribute',
    subtitle:
      'Combines descendant elements into a single tab stop, with arrow-key navigation between them.',
  },
  1349: {
    title: 'CSS `reading-flow` and `reading-order` properties',
    subtitle:
      'Sets the order in which flex or grid elements are rendered to speech or reached via focus navigation.',
  },
  1350: {
    title: 'CSS `flex-wrap: balance`',
    subtitle:
      'Distributes items in a multi-line flex container so each line has about the same number of items.',
  },
  1351: {
    title: 'CSS anchor positioning across shadow roots',
    subtitle:
      'Allows elements in shadow trees to reference anchor names defined in "higher" trees.',
  },
  1352: {
    title: '`LayoutShift` entries in the Performance API',
    subtitle:
      'Measures the layout stability of web pages based on movements of the elements on the page. Used to calculate cumulative layout shift (CLS).',
  },
  1353: {
    title: 'CSS `text-size-adjust` property',
    subtitle:
      "Disables or modifies the browser's default text size adjustment on small screens.",
  },
  1354: {
    title: 'CSS `random()` function',
    subtitle: 'Chooses a random numeric value within a specified range.',
  },
  1355: {
    title: 'DOM `moveBefore()`',
    subtitle:
      'Relocates a node while preserving its state like focus, animation, or move an iframe without reloading its content.',
  },
  1356: {
    title: 'CSS `:has-slotted` pseudo-class',
    subtitle:
      'Matches `<slot>` elements that have slotted content, rather than showing fallback content.',
  },
  1357: {
    title: 'CSS `@function`',
    subtitle:
      'Defines custom functions that take arguments and return a CSS value.',
  },
  1358: {
    title: 'Interest invokers',
    subtitle:
      'The `interestfor` attribute triggers actions on a target element when the user shows interest, such as via hover, focus, or long-press.',
  },
  1360: {
    title: 'CSS `justify-items` and `justify-self` in block layout',
  },
  1361: {
    title: 'CSS `AccentColor` system color reflects `accent-color`',
    subtitle:
      'Provides a consistent way to style custom form controls to match native ones.',
  },
  1363: {
    title: 'CSS anchored container queries',
    subtitle:
      '`@container anchored(fallback: …)` applies styles based on which position fallback an anchor-positioned element is using.',
  },
  1364: {
    title: 'CSS container scroll-state queries',
    subtitle:
      'The `@container scroll-state(...)` at-rule applies styles based on the sticky positioning, snapped, and scrollable state of the container.',
  },
  1365: {
    title: 'HTML `headingoffset` and `headingreset` attributes',
    subtitle:
      'Offsets the heading level of descendant `<h1>`–`<h6>` elements. Includes the CSS `:heading()` pseudo-class.',
  },
  1366: {
    title: 'Out-of-order streaming with `<template for>`',
    subtitle:
      'Replaces content at a named range or insertion point, allowing partial updates to be streamed into the document out of order.',
  },
  1368: {
    title: 'CSS `corner-shape` property',
    subtitle:
      'Alternative shapes for `border-radius`, such as squircles and bevels.',
  },
  1371: {
    title: 'CSS `border-shape` property',
    subtitle:
      'Sets the geometry of the border box to a fully custom shape, changing the shape of borders, outlines, and shadows.',
  },
  1372: {
    title:
      '`PerformanceLongAnimationFrameTiming` entries in the Performance API',
    subtitle:
      'Provides information about rendering updates that take longer than 50 milliseconds.',
  },
  1373: {
    title: 'CSS `interpolate-size` property and `calc-size()` function',
    subtitle:
      'Allows animating to `height: auto`, and using intrinsic sizes in calculations.',
  },
  1374: {
    title: 'CSS gap decorations',
    subtitle:
      '`column-rule` and `row-rule` display decorative lines between columns and rows of a flex, grid, or multi-column layout.',
  },
  1378: {
    title: 'Improve interoperability of the WebCodecs API',
    subtitle:
      'Low-level access to individual video frames and chunks of audio samples.',
  },
  1379: {
    title: 'CSS `line-clamp` property',
    subtitle:
      'Limits the text in a block container to a certain number of lines. Also allows custom end text if content overflow occurs.',
  },
  1381: {
    title: 'JavaScript `Temporal`',
    subtitle: 'A modern and extensive date/time API to replace `Date`.',
  },
  1382: {
    title: 'Extended lifetime `SharedWorker`s',
    subtitle:
      'Gives shared workers extra time to finish work after all pages using them have closed.',
  },
  1384: {
    title:
      'Allow CSS transitioning/animating `display` and `content-visibility`',
    subtitle:
      'Useful for delaying `display: none` until an exit animation completes.',
  },
  1385: {
    title: 'CSS `object-view-box` property',
    subtitle: 'Crops and zooms to an inset area of an image.',
  },
  1386: {
    title: 'JavaScript modules in more contexts',
    subtitle:
      'Such as `<script type="module">` in XHTML and SVG documents, and module background scripts in web extensions.',
  },
  1387: {
    title: '`ariaNotify()`',
    subtitle:
      'Requests that assistive technology, such as a screen reader, announces a message to the user.',
  },
  1390: {
    title: 'Improve `createImageBitmap()` resizing and cropping',
    subtitle:
      'Better image resizing, cropping, and thumbnailing when creating an `ImageBitmap`.',
  },
  1391: {
    title: 'CSS `box-decoration-break` without a vendor prefix',
    subtitle:
      'Sets whether borders and backgrounds wrap each fragment of a box split across lines, columns, or pages.',
  },
  1393: {
    title: 'Customizable/stylable `<select>`',
    subtitle:
      'Customize the button, selected option, picker, and options with CSS.',
  },
  1394: {
    title: 'CSS color gamut mapping',
    subtitle:
      'Displays out-of-gamut colors (such as from `oklch()`) closer to the intended color, rather than clipping RGB channels.',
  },
  1395: {
    title: 'CSS `:host(:has(…))`',
    subtitle: 'Selects a shadow host based on its light DOM descendants.',
  },
  1396: {
    title: 'Timing of cross-origin redirects in the Performance API',
    subtitle:
      'Consistent navigation timing and resource timing entries for cross-origin redirects.',
  },
  1397: {
    title: '`NotRestoredReasons` in the Performance API',
    subtitle:
      'Provides report data containing reasons why the current document was blocked from using the back/forward cache.',
  },
  1398: {
    title: '`requestIdleCallback`',
    subtitle:
      'Queues a function that runs in idle browser time, either at the end of a frame or when the user is inactive.',
  },
  1399: {
    title: 'Multiple import maps',
    subtitle:
      'Allows multiple import maps in a single document, and allows modules to load before unrelated import maps.',
  },
  1400: {
    title: '`103 Early Hints` preloading',
    subtitle:
      'Browsers start preconnecting and preloading resources while the server is still generating the page, with consistent resource timing entries.',
  },
  1401: {
    title: '`OpaqueRange` for form controls',
    subtitle:
      'A live range of text within `<textarea>` and `<input>`, for things like custom highlights and positioning popovers next to text.',
  },
  1403: {
    title: 'CSS `random-item()` function',
    subtitle: 'Picks a random item from a list of values.',
  },
  1404: {
    title: 'Web app manifest `share_target`',
    subtitle:
      "Allows an installed web app to appear in the device's share dialog as a target for shared content.",
  },
  1405: {
    title: 'HTML `<input type="week">`',
  },
  1406: {
    title: 'CSS `::scroll-marker` and `::scroll-marker-group` pseudo-elements',
    subtitle:
      'Generates navigation markers for scroll containers, for things like carousels, tabs, and tables of contents.',
  },
  1409: {
    title: 'Keyboard lock in `requestFullscreen()`',
    subtitle:
      'Allows fullscreen pages, such as games, to prevent the Escape key from exiting fullscreen, and to handle other reserved shortcuts.',
  },
  1410: {
    title: 'CSS `align-content` for centering in buttons and inputs',
    subtitle:
      'Allows overriding the vertical alignment of text in form controls.',
  },
  1411: {
    title: 'Lazy-loaded images should not be completed by out-of-band loads',
    subtitle:
      "Background loads of a lazy image's URL shouldn't leak into its `complete` state or metadata.",
  },
  1412: {
    title: 'HTML `headingoffset` and `headingreset` attributes',
    subtitle:
      'Offsets the heading level of descendant `<h1>`–`<h6>` elements. Includes the CSS `:heading()` pseudo-class.',
  },
  1413: {
    title: 'Scheduler API',
    subtitle: 'Helps chunk up main-thread work relative to other tasks.',
  },
  1414: {
    title: '`MediaStreamTrackProcessor` and `VideoTrackGenerator` APIs',
    subtitle: 'Simplifies real-time processing of video streams.',
  },
  1415: {
    title: 'WebRTC SFrame encryption',
    subtitle:
      'Native end-to-end encryption in WebRTC, without exposing keys to JavaScript.',
  },
  1416: {
    title: 'Additional sanitizing HTML methods and trusted types integration',
    subtitle:
      'Such as `beforeHTML()`, `appendHTML()`, and `replaceWithHTML()`, which insert sanitized HTML into an existing tree.',
  },
  1417: {
    title: 'WebDriver BiDi',
    subtitle:
      "A new protocol for browser automation, extending 'classic' WebDriver by introducing bidirectional communication.",
  },
  1418: {
    title: 'CSS `polygon()` vertex rounding',
    subtitle:
      'Such as `polygon(round 20px, …)` to round the corners of a polygon.',
  },
  1419: {
    title: 'Element-scoped view transitions',
    subtitle:
      "`element.startViewTransition()` starts a view transition that only affects that element's subtree, allowing multiple transitions to run concurrently.",
  },
  1424: {
    title: '`Connection-Allowlist` header',
    subtitle:
      'Limits which origins a page may connect to using fetch and other APIs.',
  },
  1427: {
    title: 'Improve interoperability of pointer events on touch devices',
  },
  1428: {
    title:
      'Media Session `togglecamera`, `togglemicrophone`, and `voiceactivity` actions',
    subtitle:
      'Provides awareness of media actions on platform UI and hardware, such as muting from a picture-in-picture window.',
  },
  1429: {
    title: 'JavaScript self-profiling API',
    subtitle:
      'The `Profiler` API records data about the execution of a page, which you can send to a server for later analysis.',
  },
  1430: {
    title: 'Web app installation via `<install>` and `navigator.install()`',
    subtitle: 'Prompts the user to install a progressive web app.',
  },
  1432: {
    title: 'CSS `symbols()` function',
    subtitle:
      'Defines a counter style inline, such as in `list-style`, without needing `@counter-style`.',
  },
  1433: {
    title: 'CSS scroll-triggered animations',
    subtitle:
      '`timeline-trigger` and `animation-trigger` play, pause, or reverse animations when the user scrolls to a particular point.',
  },
  1434: {
    title: 'CSS `@supports at-rule()`',
    subtitle: 'Checks if a CSS at-rule is supported.',
  },
  1435: {
    title: 'Promises from programmatic scroll methods',
    subtitle:
      '`scroll()`, `scrollTo()`, `scrollBy()`, and `scrollIntoView()` return promises that resolve when scrolling completes.',
  },
  1436: {
    title: 'Single-axis scroll containers',
    subtitle:
      'Such as `overflow: scroll clip`, which allows `position: sticky` to work relative to different scroll containers per axis.',
  },
  1438: {
    title: 'CSS `scroll-snap-type: pair`',
    subtitle: 'Snap to the same element in both axes.',
  },
  1439: {
    title: 'Device Posture API',
    subtitle:
      'Reflects the posture of a device, such as whether a foldable device is folded, in both CSS and script.',
  },
  1440: {
    title: 'Viewport Segments API',
    subtitle:
      'Adapt layouts to devices where the display is split, such as foldables.',
  },
  1441: {
    title: 'Preserve history state after cross-document navigation',
    subtitle:
      'Some browsers discard `history.state` after cross-document navigations, but keep it for same-document navigations.',
  },
  1443: {
    title: 'Responsive iframes',
    subtitle:
      'The `frame-sizing` CSS property sizes an `<iframe>` to its content, avoiding scrolling within the iframe.',
  },
  1444: {
    title: 'CSS `margin-trim`',
    subtitle:
      'Removes the margins of child elements when they meet the edges of the container.',
  },
  1445: {
    title: 'CSS grid lanes (masonry)',
    subtitle:
      '`display: grid-lanes` creates a layout where items are tightly packed into parallel lanes.',
  },
  1446: {
    title: 'CSS `@counter-style`',
    subtitle:
      'Defines custom counter styles for list items, such as a sequence of symbols instead of numbers.',
  },
  1447: {
    title: 'WebVTT',
    subtitle:
      'WebVTT files are loaded using the `<track>` element, and the `VTTCue` API can be used to create or update cues dynamically.',
  },
  1449: {
    title: 'CSS `filter(image, ...filters)`',
    subtitle: 'Takes an image and a filter, and returns a new image.',
  },
  1450: {
    title: 'CSS `baseline-source` property',
    subtitle:
      'Controls which baseline is used to align multi-line inline-level boxes with surrounding text.',
  },
  1452: {
    title: 'CSS `ident()` function',
    subtitle:
      'Builds an identifier from strings, integers, and other identifiers, such as `view-transition-name: ident("item-" sibling-index())`.',
  },
  1453: {
    title: 'CSS `inherit()` function',
    subtitle:
      "Like `var()`, but uses the parent element's value of the custom property.",
  },
  1457: {
    title: 'CSS anchor positioning with transforms and animations',
    subtitle:
      'Anchor-positioned elements track transforms on their anchors, and changes to the calculated `anchor()` triggers transitions.',
  },
  1459: {
    title: 'Progressive rendering of JPEG XL and AVIF images',
    subtitle:
      'Displays a preview version of the image while the rest downloads.',
  },
  1460: {
    title:
      'Improve CSS `sibling-count()` and `sibling-index()` functions interop.',
    subtitle: 'Fix remaining test failures.',
  },
  1462: {
    title: 'Contact Picker API',
    subtitle:
      '`navigator.contacts` allows users to share selected entries from their contact list.',
  },
  1465: {
    title: 'Trusted Types',
    subtitle:
      'Ensures input has been passed through a transformation function before being passed to an API that might execute that input.',
  },
  1466: {
    title: 'JavaScript CSS module imports',
    subtitle:
      '`import … with { type: "css" }` to load CSS resources as constructable stylesheets.',
  },
  1467: {
    title: 'Brotli support in `CompressionStream` and `DecompressionStream`',
  },
  1468: {
    title: 'Pause media in hidden iframes',
    subtitle:
      'The `media-playback-while-not-visible` permission policy pauses audible media in iframes that are hidden.',
  },
  1469: {
    title: 'Targeted SVG improvements',
    subtitle:
      'SVG filters, `context-fill`/`context-stroke`, `<use>` without a fragment, and path data APIs.',
  },
  1470: {
    title: 'HTML `<iframe allow="cross-origin-isolated">`',
    subtitle:
      'Allows cross-origin isolated features, such as `SharedArrayBuffer`, within iframes.',
  },
  1471: {
    title: 'Streaming HTML insertion with sanitizing',
    subtitle:
      'Methods such as `streamHTML()` and `streamAppendHTML()` return writable streams that incrementally insert sanitized HTML into an existing tree.',
  },
};

export default defs;
