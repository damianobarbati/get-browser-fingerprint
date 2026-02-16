# get-browser-fingerprint

A single and fast (<50ms) asynchronous function returning a browser fingerprint, without requiring any permission to the user.  
Live [example here](https://damianobarbati.github.io/get-browser-fingerprint/).  

## Assumptions

The function is targeting stock installations of the following browsers (no extensions or add-ons installed):
- Google Chrome (desktop and Android)
- Mozilla Firefox (desktop, default tracking protection, no custom privacy flags enabled)
- Microsoft Edge (desktop and Android)
- Apple Safari (macOS)
- Safari on iOS / iPadOS

Explicit assumptions:
- No privacy-focused extensions or add-ons installed.
- Browser privacy settings left at factory defaults (no manual changes to fingerprint resistance features).
- No hardened, anti-detect or heavily modified browser variants.

Under these conditions the collected signals retain meaningful entropy in February 2026:
- Canvas rendering (stable on Chrome, Edge, Firefox default; noisy or low-entropy on iOS Safari and partially on macOS Safari)
- WebGL unmasked vendor and renderer (strong on desktop, more uniform on mobile)
- Offline audio context (useful on Chrome, Edge, Firefox; heavily restricted on Safari)
- WebGPU properties (if available; low but increasing entropy)
- Locally installed fonts (valuable mainly on desktop Windows and macOS)
- Passive signals (hardwareConcurrency, deviceMemory, screen, timezone, languages, etc.)

On browsers with strong default fingerprint resistance (Safari iOS, certain Firefox modes) entropy and stability decrease significantly.  
The script does not attempt to bypass intentional randomization or hardening.

## Usage

Get browser fingerprint:
```js
import getBrowserFingerprint from 'get-browser-fingerprint';
const fingerprint = await getBrowserFingerprint();
console.log(fingerprint);
```

Options available:
- `hardwareOnly` (default `true`): use only hardware info about device.
- `debug` (default `false`): log data used to generate fingerprint to console and add canvas/webgl/audio elements to body.

## Development

To test locally:
```sh
fnm install # nodejs from .nvmrc
npm install -g corepack
corepack enable # package manager from package.json
corepack install # package manager from package.json
pnpm install # install deps
pnpm exec playwright install chromium
pnpm exec playwright install firefox
pnpm test
```

To run the example locally:
```sh
pnpm serve -p 80 ./src
```
