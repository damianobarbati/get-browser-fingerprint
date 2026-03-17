export interface FingerprintOptions {
  debug?: boolean;
}

export type FingerprintResult = {
  fingerprint: string;
  elapsedMs: number;
} & Record<string, unknown>;

export default function getBrowserFingerprint(options?: FingerprintOptions): Promise<FingerprintResult>;

declare global {
  interface Window {
    getBrowserFingerprint: typeof getBrowserFingerprint;
  }
}
