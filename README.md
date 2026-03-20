# get-browser-fingerprint

A single asynchronous function that returns a browser fingerprint (8‑char hex) without requiring any user permission.

Live [example here](https://damianobarbati.github.io/get-browser-fingerprint/).

## Return value

- **`fingerprint`** — MurmurHash3 (32-bit, hex) of the stable stringified payload.
- **`elapsedMs`** — Execution time in milliseconds.
- All collected signals are also spread on the returned object (e.g. `timezone`, `canvasID`, `webglID`, `languages`, …).

## Collected signals

- **UA / platform:** `vendor`, `platform`, `userAgentHighEntropy` (UA Client Hints: architecture, bitness, platformVersion, model, fullVersionList).
- **Locale / Intl:** `languages`, `timezone`, `timezoneOffset`, `numberingSystem`, `intlCalendar`, `hourCycle`, `intlSupportedCalendars`.
- **Preferences:** `reducedMotion`, `colorScheme`, `prefersContrast`, `prefersReducedTransparency`, `forcedColors`.
- **Screen:** `devicePixelRatio`, `pixelDepth`, `colorDepth`, `screenOrientation`; on mobile: `width`, `height`, `aspectRatio`, `maxTouchPoints`.
- **Network:** `connectionType`, `effectiveType`, `saveData` (when available).
- **Device:** `hardwareConcurrency`, `deviceMemory`, `touchSupport`.
- **Media / codecs:** `mediaCodecs` (canPlayType for common MIME types), `canvasID`, `webglID`, `webgpuID`, `audioID`.
- **Other:** `fonts` (detected list), `pdfViewerEnabled`, `webdriver`, `permissionsState` (geolocation, notifications).

Signals that fail or are unavailable are set to `null` (no throw).

## Assumptions

The function targets stock installations of:

- Google Chrome (desktop and Android)
- Mozilla Firefox (desktop, default tracking protection)
- Microsoft Edge (desktop and Android)
- Apple Safari (macOS)
- Safari on iOS / iPadOS

Assumptions:

- No privacy-focused extensions or add-ons.
- Browser privacy settings at factory defaults.
- No hardened or anti-detect browser variants.

Under these conditions the signals keep useful entropy; on Safari iOS or strict Firefox modes entropy can be lower. The script does not try to bypass intentional randomization or hardening.

## Usage

```js
// Import the default async function
import getBrowserFingerprint from 'get-browser-fingerprint'

// Call once; result holds fingerprint, elapsedMs, and all collected signals
const result = await getBrowserFingerprint()
// Log the 8-char hex fingerprint
console.log(result.fingerprint)
// Log execution time in milliseconds
console.log(result.elapsedMs)

// Or destructure to get only the fingerprint
const { fingerprint } = await getBrowserFingerprint()
console.log(fingerprint)
```

Options:

- **`debug`** (default `false`): append canvas / WebGL / audio debug elements to `document.body` and include extra debug output.

```js
const result = await getBrowserFingerprint({ debug: true })
```

### CDN

Load as ESM from a CDN:

```html
<script type="module">
  import getBrowserFingerprint from 'https://cdn.jsdelivr.net/npm/get-browser-fingerprint/+esm'
  const { fingerprint, elapsedMs } = await getBrowserFingerprint()
  console.log(fingerprint, elapsedMs)
</script>
```

Or with a version pin:

```html
<script type="module">
  import getBrowserFingerprint from 'https://cdn.jsdelivr.net/npm/get-browser-fingerprint@latest/+esm'
  const result = await getBrowserFingerprint()
  console.log(result.fingerprint)
</script>
```

## Development

Install and run tests:

```sh
fnm install
npm install -g corepack
corepack enable
corepack install
pnpm install
pnpm exec playwright install chromium
pnpm exec playwright install firefox
pnpm test
```

Run the demo locally (serve `src/`):

```sh
pnpm serve -p 80 ./src
# or
npm run serve
```

Then open `http://localhost/index.html` (or port 80 if using `-p 80`).

## References

- [Fingerprinting (MDN Glossary)](https://developer.mozilla.org/en-US/docs/Glossary/Fingerprinting)
- [HTTP Client hints (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Client_hints)
- [Intl.DateTimeFormat.resolvedOptions() (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions)
- [Intl.supportedValuesOf() (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf)
- [Mitigating Browser Fingerprinting (W3C)](https://w3c.github.io/fingerprinting-guidance/)
- [Navigator (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Navigator)
- [NavigatorUAData.getHighEntropyValues() (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues)
- [NetworkInformation (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation)
- [Permissions API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- [Screen (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Screen)
- [User-Agent Client Hints API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/User-Agent_Client_Hints_API)
- [Window.devicePixelRatio (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
