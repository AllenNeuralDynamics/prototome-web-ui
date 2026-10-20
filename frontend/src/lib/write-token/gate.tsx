import { useEffect } from "react";
import { RELEASE_URL, useWriteToken } from "./use-write-token";

/**
 * Attempt to grab the write token before rendering the children.
 * Releases the token (best-effort) when the tab is closed or navigated away.
 */
export const WriteTokenGate = ({ children }: { children: React.ReactNode }) => {
  const { hasToken } = useWriteToken();

  useEffect(() => {
    if (!hasToken) return;
    const release = () => navigator.sendBeacon(RELEASE_URL);
    window.addEventListener("pagehide", release);
    return () => window.removeEventListener("pagehide", release);
  }, [hasToken]);

  return <>{children}</>;
};
