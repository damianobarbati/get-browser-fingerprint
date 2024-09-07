export interface FingerprintOptions {
  hardwareOnly?: boolean;
  enableWebgl?: boolean;
  enableScreen?: boolean;
  debug?: boolean;
}

export default function getBrowserFingerprint(options?: FingerprintOptions): number;

declare global {
  interface Window {
    getBrowserFingerprint: typeof getBrowserFingerprint;
  }
}
