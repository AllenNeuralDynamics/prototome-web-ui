import { useEffect } from "react";
import { RELEASE_URL, useWriteToken } from "./use-write-token";

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

  const pageMode: PageMode = hasToken ? "write" : "read";

  useEffect(() => {
    if (!hasToken) return;
    const release = () => navigator.sendBeacon(RELEASE_URL);
    window.addEventListener("pagehide", release);
    return () => window.removeEventListener("pagehide", release);
  }, [hasToken]);

  return (
    <PageModeContext.Provider value={pageMode}>
      {children}
    </PageModeContext.Provider>
  );
};
