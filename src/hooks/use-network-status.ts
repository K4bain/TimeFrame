"use client";

import { useEffect, useState } from "react";

/**
 * useNetworkStatus — tracks online/offline state per ERR.3.
 *
 * Listens to `window.online` and `window.offline` events.
 * On reconnect, the caller is responsible for triggering retries
 * (e.g. via TanStack Query's `refetchOnReconnect`).
 *
 * Spec reference: ERR.3 (NETWORK_OFFLINE), COMP.10.
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Sync with actual state on mount (SSR defaults to true)
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
