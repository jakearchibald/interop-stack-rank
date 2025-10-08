/** @type {{ [key: number]: { title: string; subtitle?: string } | {titleHTML: string} }} */
const defs = {
  994: {
    title: 'JPEG-XL image format',
  },
  995: {
    title: 'Customizable/stylable `<select>`',
    subtitle: '_Not_ including `<select multiple>`',
  },
  996: {
    title: 'CSS linked parameters',
    subtitle: 'Allows passing custom properties into external SVG resources',
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
      'Such as `:playing`, `:paused`, `:seeking`, `:buffering`, `:stalled`, `:muted`, and `:volume-locked`',
  },
  1004: {
    title: 'CSS `field-sizing: content`',
    subtitle:
      'Allows form controls such as `<textarea>` to be sized based on their content',
  },
  1005: {
    title: '`requestIdleCallback`',
    subtitle:
      'Queues a function that runs in idle browser time, either at the end of a frame or when the user is inactive',
  },
  1006: {
    title: 'CSS `margin-trim`',
    subtitle:
      'Removes the margins of child elements when they meet the edges of the container',
  },
  1007: {
    title: 'Invoker commands',
    subtitle:
      'Declarative commands on `<button>` via the `command` and `commandfor` attributes',
  },
  1008: {
    title: 'CSS `interpolate-size` property and `calc-size()` function',
    subtitle:
      'Allows animating to `height: auto` and other intrinsic sizing keywords',
  },
  1011: {
    title: 'HTML reference targets',
    subtitle:
      'A declarative way to forward IDrefs (such as `for` and `aria-labelledby`) to an element inside a shadow root',
  },
  1012: {
    title: 'XSL transformations (XSLT) version 3',
    subtitle: 'For declaratively transforming XML to other formats',
  },
  1016: {
    title: 'Virtual keyboard API',
    subtitle:
      '`navigator.virtualKeyboard` lets you react to and control on-screen virtual keyboards',
  },
  1018: {
    title: 'Consistent print layout width',
    subtitle:
      'Consistently base printed layout width on the page size rather than the viewport size',
  },
  1019: {
    title: 'WebGPU API',
    subtitle:
      '`navigator.gpu` allows operations such as rendering and computation on dedicated graphics hardware',
  },
  1020: {
    title: "Resolve text rendering 'smoothing' inconsistencies on macOS",
    subtitle:
      'Explore and create a standard version of `-webkit-font-smoothing`',
  },
  1021: {
    title: 'WebXR API',
    subtitle:
      "`navigator.xr` allows interacting with the browser's virtual reality or augmented reality system",
  },
  1022: {
    title: 'JavaScript `Temporal`',
    subtitle: 'A modern and extensive date/time API to replace `Date`',
  },
  1024: {
    title: 'CSS `sibling-count()` and `sibling-index()` functions',
    subtitle: "Allow styling based on an element's position among its siblings",
  },
  1025: {
    title: 'CSS `:open` pseudo-class',
    subtitle:
      'Matches open states on things like `<details>`, `<dialog>`, and `<select>`',
  },
  1026: {
    title: 'Improve CSS `background-clip: text` implementations',
    subtitle: 'Widely supported, but frustrating bugs persist',
  },
  1027: {
    title: 'Scoped custom element registries',
    subtitle:
      'Allows elements/roots to use different custom element registries, so the same custom element names can point to different definitions',
  },
  1028: {
    title: 'CSS `accent-color` property',
    subtitle:
      'Sets a color for checkboxes, radio buttons, and other form controls',
  },
  1029: {
    title: 'CSS `line-clamp` property',
    subtitle:
      'Limits the text in a block container to a certain number of lines',
  },
  1030: {
    title: 'CSS `interactivity: inert`',
    subtitle:
      'Makes an element and its descendants inert, like the `inert` HTML attribute',
  },
  1031: {
    title: 'CSS `overlay` property',
    subtitle:
      'When used as an `allow-discrete` CSS transition, prevents a top layer element, such as a popover or a `<dialog>`, from leaving top layer before it has finished animating',
  },
  1032: {
    title: 'CSS `@container style()`',
    subtitle:
      'Apply styles based on the values of custom properties of a container',
  },
  1033: {
    title: 'CSS scroll-driven animations',
    subtitle:
      "`animation-timeline`, `scroll-timeline`, and `view-timeline` CSS properties advance animations based on the user's scroll position",
  },
  1034: {
    title: 'DOM `moveBefore()`',
    subtitle:
      'Relocates a node while preserving its state like focus, animation, or move an iframe without reloading its content',
  },
  1036: {
    title: 'CSS `@custom-media`',
    subtitle: 'Alias media queries to reusable identifiers',
  },
  1037: {
    title: 'CSS `justify-items` and `justify-self` outside of flexbox/grid',
  },
  1038: {
    title: 'Synthesis for `font-variant-position`',
    subtitle:
      "If the font doesn't support `super`/`sub`, browsers should synthesize the effect",
  },
  1039: {
    title: 'CSS `break-after` and `break-before` properties',
    subtitle: 'Control breaks in paged media and CSS columns',
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
    subtitle: 'Encourage spans of text to avoid breaks unless necessary',
  },
  1045: {
    title: 'Reference entire files with SVG `<use>`',
    subtitle: 'Avoids needing to specify an ID on the root `<svg>` element',
  },
  1046: {
    title: 'CSS `shape()` function',
    subtitle:
      'Similar to `path()`, but allow a variety of responsive units and CSS functions',
  },
  1047: {
    title: 'Improve reliability of the Notification API',
  },
  1048: {
    title: 'CSS `corner-shape` property',
    subtitle:
      'Alternative shapes for `border-radius`, such as squircles and bevels',
  },
  1049: {
    title:
      'Alpha channel support in color inputs via `<input type="color" alpha>`',
  },
  1050: {
    title:
      'CSS `ui-serif`, `ui-sans-serif`, `ui-monospace`, and `ui-rounded` font families',
    subtitle: 'Selects the device-default user interface fonts for text',
  },
  1051: {
    title: 'CSS `stretch` value for `width` and `height` properties',
    subtitle: `Expands a box as needed to fit its contents until the maximum size is reached, without preserving the content's preferred aspect ratio`,
  },
  1056: {
    title: 'JavaScript CSS constructable stylesheet imports',
    subtitle:
      '`import … with { type: "css" }` to load CSS resources as constructable stylesheets',
  },
  1057: {
    title: '`LayoutShift` entries in the Performance API',
    subtitle:
      'Measures the layout stability of web pages based on movements of the elements on the page',
  },
  1058: {
    title:
      'CSS `light-dark()` and `prefers-color-scheme` support in external SVG resources',
    subtitle:
      'Allows external SVG resources to adapt to light and dark mode preferences',
  },
  1061: {
    title: 'CSS stroked text',
    subtitle:
      'Support for `stroke-width`, `stroke-color`, `stroke-align` and `fill-color`',
  },
  1062: {
    title: 'CSS `text-box` and related longhand properties',
    subtitle:
      "sets the spacing above and below text based on a font's typographic features",
  },
  1063: {
    title: 'HTML switch input via `<input type="checkbox" switch>`',
  },
  1064: {
    title: '`SharedWorker`',
    subtitle: 'A web worker that can be shared by multiple pages/workers',
  },
  1066: {
    title: 'CSS `element()` function',
    subtitle:
      'Creates a live-updating image from an HTML element that can be used as an image or background image',
  },
  1067: {
    title:
      '`PerformanceLongAnimationFrameTiming` entries in the Performance API',
    subtitle:
      'Provides information about rendering updates that take longer than 50 milliseconds',
  },
  1068: {
    title: 'Async iterable `ReadableStream`s',
    subtitle:
      "Allows you to use `for await … of` loops to iterate through a stream's incoming data",
  },
  1069: {
    title: '`fetchLater()` API',
    subtitle:
      'Requests a deferred fetch sent at an unknown time. The browser chooses a reliable time to send the request, ideally when the document is unloaded, and ignores the response',
  },
  1070: {
    title:
      'HTML `blocking="render"` attribute on `<link>`, `<script>` and `<style>`',
    subtitle:
      'Blocks rendering until the external script or stylesheet has been loaded',
  },
  1071: {
    title: 'Signature-based Subresource Integrity (SbSRI) ',
    subtitle:
      'Allows subresources to be validated against publisher-provided digital signatures',
  },
  1072: {
    title: 'Allow fetching requests with `ReadableStream` bodies',
    subtitle:
      'Allows sending data before the entire body is available, and sending large bodies without buffering them in memory',
  },
  1077: {
    title: 'CSS `attr()` usage in all properties',
    subtitle: 'Previously only supported in the `content` property',
  },
  1078: {
    title: 'Improve resource timing support',
  },
  1079: {
    title: '`navigator.connection` API',
    subtitle:
      'provides information about the network connection and fires events when the connection type changes',
  },
  1080: {
    title: '`trackVisibility` in `IntersectionObserver`',
    subtitle:
      'Enables tracking the visibility of an element, to detect if it may be obscured by other content or visual effects',
  },
  1081: {
    title: 'Speculation Rules API',
    subtitle:
      'Hints to the browser to proactively download pages in the background so they appear instantly when the user navigates to them',
  },
  1082: {
    title: 'Permissions Policy',
    subtitle:
      'Similar to Content Security Policy but controls features instead of security behavior',
  },
  1083: {
    title: 'Web Share API',
    subtitle:
      "Invokes the device's native sharing mechanism and passes text, links, files, and other content to share targets",
  },
  1084: {
    titleHTML: 'Viewports',
  },
  1088: {
    titleHTML: 'CSS Typed OM Level 1',
  },
  1089: {
    titleHTML: 'Keyboard focusable scrollers',
  },
  1090: {
    titleHTML: 'CSS Scroll State Queries',
  },
  1093: {
    titleHTML: 'JSPI (JavaScript Promise Integration) for WASM',
  },
  1094: {
    titleHTML: 'WebDriver BiDi',
  },
  1097: {
    titleHTML: 'Opt-In Partitioned Cookies (CHIPS)',
  },
  1098: {
    titleHTML: 'Federated Credential Management (FedCM) API',
  },
  1101: {
    titleHTML: 'WebRTC Interop',
  },
  1102: {
    titleHTML: 'CSS Gap Decorations',
  },
  1103: {
    titleHTML: 'Custom supports',
  },
  1104: {
    titleHTML: 'Standardize CSS Filters on Inline SVG Elements',
  },
  1105: {
    titleHTML:
      'ESM Module Loading: Cyclic Module Records / multiple top-level awaits in different modules',
  },
  1106: {
    titleHTML:
      'Interopability of all rel attributes for the &lt;link&gt; HTML element',
  },
  1107: {
    titleHTML: 'CSS Scroll Snap Events',
  },
  1108: {
    titleHTML: 'scrollend Event',
  },
  1109: {
    titleHTML: '::details-content',
  },
  1110: {
    titleHTML: 'Cross-document View Transitions',
  },
  1111: {
    titleHTML: 'dialog closedby',
  },
  1112: {
    titleHTML: 'display-animation',
  },
  1113: {
    titleHTML: 'Navigation API precommit handlers',
  },
  1114: {
    titleHTML: 'Support <code>sizes=auto</code> on img and source elements',
  },
  1119: {
    titleHTML: 'Web Neural Network API (WebNN) for On-Device AI',
  },
  1120: {
    titleHTML: 'Prioritized Task Scheduling',
  },
  1121: {
    titleHTML: 'WebTransport',
  },
  1122: {
    titleHTML: 'MediaStreamTrackProcessor and VideoTrackGenerator',
  },
  1123: {
    titleHTML: 'Pointer Events for Mobile',
  },
  1124: {
    titleHTML:
      '<code>::before</code> and <code>::after</code> on replaced elements',
  },
  1125: {
    titleHTML: 'Rendering of fieldset / legend',
  },
  1126: {
    titleHTML: 'Timing of scroll events relative to animation events',
  },
  1127: {
    titleHTML: 'Promises In Detached Documents',
  },
  1129: {
    titleHTML: 'popover=&quot;hint&quot;',
  },
  1130: {
    titleHTML: 'reading-flow',
  },
  1131: {
    titleHTML: 'Scroll markers',
  },
  1134: {
    titleHTML: 'scroll snap',
  },
  1136: {
    titleHTML: 'text-wrap:pretty',
  },
  1137: {
    titleHTML: 'View Transition Types',
  },
  1138: {
    titleHTML: 'Trusted Types',
  },
  1140: {
    titleHTML: 'Mathematics Rendering',
  },
  1142: {
    titleHTML: 'NavigationTiming - NotRestoredReasons',
  },
  1143: {
    titleHTML: 'Incumbent Globals in Promises',
  },
  1146: {
    titleHTML: 'CSS Flexbox Sizing',
  },
  1147: {
    titleHTML: 'WASM Memory64',
  },
  1149: {
    titleHTML: 'CSS Custom Highlight API',
  },
  1150: {
    titleHTML: 'CSS object-view-box',
  },
  1151: {
    titleHTML:
      'IndexedDB getAllRecords() and direction option for getAll()/getAllKeys()',
  },
  1152: {
    titleHTML: 'Customized built-in elements',
  },
  1154: {
    titleHTML: 'CSS Paint API',
  },
  1155: {
    titleHTML: 'Support autocorrect attribute',
  },
  1156: {
    titleHTML: 'fully support fetch/body for formdata and mime-type',
  },
  1157: {
    titleHTML: 'fully support fetch/range',
  },
  1160: {
    titleHTML: 'CSS filter() function',
  },
  1161: {
    titleHTML: 'WebVTT',
  },
  1162: {
    titleHTML: 'Payment Handler API',
  },
  1163: {
    titleHTML: 'JSON.parse source text access',
  },
  1164: {
    titleHTML: '<code>background-clip: border-area</code>',
  },
  1165: {
    titleHTML: 'CSS <code>contrast-color()</code> function',
  },
  1166: {
    titleHTML: 'Using <code>color-mix()</code> without specifying a colorspace',
  },
  1167: {
    titleHTML: '<code>display-p3-linear</code> colorspace',
  },
  1168: {
    titleHTML: '<code>box-shadow-*</code> longhands',
  },
  1172: {
    titleHTML: 'Carryover evaluation for CSS anchor positioning',
  },
  1173: {
    titleHTML: 'Carryover evaluation for Core Web Vitals',
  },
  1174: {
    titleHTML: 'Carryover evaluation for @scope',
  },
  1175: {
    titleHTML: 'Carryover evaluation for Writing modes',
  },
  1176: {
    titleHTML: 'Carryover evaluation for Layout',
  },
  1177: {
    titleHTML: 'Carryover evaluation for Modules',
  },
  1178: {
    titleHTML: 'Carryover evaluation for Navigation API',
  },
  1179: {
    titleHTML: 'Carryover evaluation for backdrop-filter',
  },
  1180: {
    titleHTML: 'Carryover evaluation for Pointer and mouse events',
  },
  1181: {
    titleHTML: 'Carryover evaluation for Storage Access API',
  },
  1182: {
    titleHTML: 'Carryover evaluation for Details element',
  },
  1183: {
    titleHTML: 'Carryover evaluation for text-decoration',
  },
  1184: {
    titleHTML: 'Carryover evaluation for View Transition API',
  },
  1185: {
    titleHTML: 'Carryover evaluation for WebAssembly',
  },
  1186: {
    titleHTML: 'Carryover evaluation for URLPattern',
  },
  1187: {
    titleHTML: 'Carryover evaluation for Web Compat',
  },
  1188: {
    titleHTML: 'Carryover evaluation for WebRTC',
  },
};

export default defs;
