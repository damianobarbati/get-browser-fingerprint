# get-browser-fingerprint

Zero dependencies package exporting a single and fast (<50ms) asynchronous function returning a browser fingerprint, without requiring any permission to the user.  

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
fnm install
pnpm install
pnpm exec playwright install chromium
pnpm test
```

To run example locally:
```sh
pnpm serve -p 80 ./src
```
