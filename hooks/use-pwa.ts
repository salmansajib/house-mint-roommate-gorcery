"use client";

import * as React from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);
  const [isDismissed, setIsDismissed] = React.useState(false);

  React.useEffect(() => {
    // 1. Initial online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 2. Check standalone display mode
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");

      setIsStandalone(isStandaloneMode);

      // 3. Detect iOS Safari
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice =
        /iphone|ipad|ipod/.test(userAgent) &&
        !(window as unknown as { MSStream?: boolean }).MSStream;
      setIsIOS(isIosDevice);

      // 4. Check if prompt was dismissed in this session
      const dismissed = sessionStorage.getItem("housemint_pwa_dismissed") === "true";
      setIsDismissed(dismissed);

      // 5. Capture beforeinstallprompt (Chrome / Android / Desktop)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      window.addEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      // 6. Service Worker handling: production only, cleanup in development
      if ("serviceWorker" in navigator) {
        if (process.env.NODE_ENV === "development") {
          // Unregister any active service worker and clean caches in development to avoid stale HTML hydration mismatches
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
          if ("caches" in window) {
            caches.keys().then((keys) => {
              for (const key of keys) {
                caches.delete(key);
              }
            });
          }
        } else {
          window.addEventListener("load", () => {
            navigator.serviceWorker
              .register("/sw.js")
              .then((reg) => {
                // Check for updates periodically
                reg.onupdatefound = () => {
                  const installingWorker = reg.installing;
                  if (installingWorker) {
                    installingWorker.onstatechange = () => {
                      if (
                        installingWorker.state === "installed" &&
                        navigator.serviceWorker.controller
                      ) {
                        console.log("[PWA] New version ready.");
                      }
                    };
                  }
                };
              })
              .catch((err) => {
                console.warn("[PWA] Service Worker registration failed:", err);
              });
          });
        }
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    }
    return false;
  };

  const dismissPrompt = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("housemint_pwa_dismissed", "true");
    }
  };

  return {
    isInstallable,
    isStandalone,
    isIOS,
    isOnline,
    isDismissed,
    triggerInstall,
    dismissPrompt,
  };
}
