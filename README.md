# get-browser-fingerprint

Zero dependencies package exporting a single, fast (<15ms) and synchronous function which computes a browser fingerprint, without requiring any permission to the user.

## Usage

Get browser fingerprint:  
```js
import getBrowserFingerprint from 'get-browser-fingerprint';
const fingerprint = getBrowserFingerprint();
console.log(fingerprint);
```

Options available:
- `hardwareOnly` (default `false`): leverage only hardware info about device 
- `enableWebgl` (default `false`): enable webgl renderer, ~4x times slower but adds another deadly powerful hardware detection layer on top of canvas
- `enableScreen` (default `true`): enable screen resolution detection, disable it if your userbase may use multiple screens
- `debug`: log data used to generate fingerprint to console and add canvas/webgl canvas to body to see rendered image (default `false`)

⚠️ Be careful: the strongest discriminating factor is canvas token which can't be computed on old devices (eg: iPhone 6), deal accordingly ⚠️

## Development

To test locally:
```sh
nvm install
yarn install
yarn test
```

To run example locally:
```sh
yarn http-server src -o -c-1 -p 80
```
