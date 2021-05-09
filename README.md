# get-browser-fingerprint

Zero dependencies package exporting a single function which computes a browser fingerprint.

## Usage

Get browser fingerprint:  
```javascript
import getBrowserFingerprint from 'get-browser-fingerprint';
const fingerprint = getBrowserFingerprint();
console.log(fingerprint);
```

Options available:
- `enableWebgl`: enable webgl renderer, 5x times slower but deadly powerful (default `false`)
- `debug`: log data used to generate fingerprint to console (default `false`)

## Disclaimer

Be careful: 
- strongest discriminating factor is canvas token which can't be computed on old devices (eg: iPhone 6) 
