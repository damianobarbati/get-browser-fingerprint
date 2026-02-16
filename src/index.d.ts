export interface FingerprintOptions {
  debug?: boolean;
}

export type FingerprintResult = {
  fingerprint: string;
} & Record<string, string>;

export default function getBrowserFingerprint(options?: FingerprintOptions): Promise<FingerprintResult>;

declare global {
  interface Window {
    getBrowserFingerprint: typeof getBrowserFingerprint;
  }
}
