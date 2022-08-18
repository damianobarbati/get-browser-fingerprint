# get-browser-fingerprint

Zero dependencies package exporting a single and synchronous function which computes a browser fingerprint.

## Usage

Get browser fingerprint:  
```js
import getBrowserFingerprint from 'get-browser-fingerprint';
const fingerprint = getBrowserFingerprint();
console.log(fingerprint);
```

Options available:
- `enableWebgl`: enable webgl renderer, 5x times slower but adds another deadly powerful hardware detection layer on top of canvas (default `false`)
- `debug`: log data used to generate fingerprint to console and add canvas/webgl canvas to body to see rendered image (default `false`)

⚠️ Be careful: the strongest discriminating factor is canvas token which can't be computed on old devices (eg: iPhone 6), deal accordingly ⚠️

## Development

To test locally:
```sh
nvm install
yarn install
yarn test
```