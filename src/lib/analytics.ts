type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: GtagEventParams) => void;
    dataLayer?: unknown[];
  }
}

export function track(name: string, params?: GtagEventParams) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
