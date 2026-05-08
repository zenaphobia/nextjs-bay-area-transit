"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

declare global {
  interface Navigator {
    /** iOS Safari-only: true when launched from a home-screen icon. */
    standalone?: boolean;
  }
}

const FIRST_STANDALONE_KEY = "pwa_first_standalone_seen";

export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((err) => console.error("SW registration failed:", err));
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;

    if (isStandalone) {
      track("pwa_launched_standalone");
      try {
        if (!window.localStorage.getItem(FIRST_STANDALONE_KEY)) {
          window.localStorage.setItem(FIRST_STANDALONE_KEY, "1");
          track("pwa_first_standalone_launch");
        }
      } catch {
        // Private mode or storage disabled — skip dedupe
      }
    }

    const handleEligible = () => track("pwa_install_eligible");
    const handleInstalled = () => track("pwa_installed");

    window.addEventListener("beforeinstallprompt", handleEligible);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleEligible);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  return null;
}
