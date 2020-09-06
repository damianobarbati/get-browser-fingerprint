# get-browser-fingerprint

Zero dependencies package exporting a single function which computes a browser fingerprint.

## Usage

Get browser fingerprint:  
```javascript
import getBrowserFingerprint from 'get-browser-fingerprint';
const fingerprint = getBrowserFingerprint();
console.log(fingerprint);
```

Get a "stable" browser fingerprint across os/browser updates taking into account only hardware:
```javascript
import getBrowserFingerprint from 'get-browser-fingerprint';
const fingerprint = getBrowserFingerprint(true);
console.log(fingerprint);
```
