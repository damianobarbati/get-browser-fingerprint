export interface FingerprintOptions {
  hardwareOnly?: boolean;
  debug?: boolean;
}

export default function getBrowserFingerprint(options?: FingerprintOptions): number;

declare global {
  interface Window {
    getBrowserFingerprint: typeof getBrowserFingerprint;
  }
}
