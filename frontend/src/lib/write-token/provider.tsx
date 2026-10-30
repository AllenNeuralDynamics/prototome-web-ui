import { useEffect } from "react";
import { useTokenSettings, useWriteToken } from "./use-write-token";

import { PageModeContext } from "./page-mode-context";
import type { PageMode } from "./page-mode-context";

/**
 * Changes the page mode based on the presence of a write token.
 */
export const PageModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { hasToken } = useWriteToken();
  const { release_url } = useTokenSettings();

  const pageMode: PageMode = hasToken ? "write" : "read";

  useEffect(() => {
    if (!hasToken) return;
    const release = () => navigator.sendBeacon(release_url);
    window.addEventListener("pagehide", release);
    return () => window.removeEventListener("pagehide", release);
  }, [hasToken, release_url]);

  return (
    <PageModeContext.Provider value={pageMode}>
      {children}
    </PageModeContext.Provider>
  );
};
