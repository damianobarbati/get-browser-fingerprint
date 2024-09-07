declare global {
  interface Window {
    getBrowserFingerprint: ({
      hardwareOnly,
      enableWebgl,
      enableScreen,
      debug,
    }?: {
      hardwareOnly?: boolean;
      enableWebgl?: boolean;
      enableScreen?: boolean;
      debug?: boolean;
    }) => number;
  }
}

export type {};
