export {};

declare global {
  interface Window {
    MSStream?: unknown;
    opera?: string;
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(
        siteKey: string,
        options: {
          action: string;
        }
      ): Promise<string>;
    };
  }
}


