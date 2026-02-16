export interface FingerprintOptions {
  debug?: boolean;
}

export default function getBrowserFingerprint(options?: FingerprintOptions): Promise<number>;

declare global {
  interface Window {
    getBrowserFingerprint: typeof getBrowserFingerprint;
  }
}
