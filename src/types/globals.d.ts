declare global {
  interface Window {
    __buddyLabProject?: {
      cleanRoom: boolean;
      toolCount: number;
      skinCount: number;
      saveKey: string;
      source: string;
    };
    __buddyLabDebug?: unknown;
  }
}

export {};
