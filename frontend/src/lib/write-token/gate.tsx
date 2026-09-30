import { useWriteToken } from "./use-write-token";

/**
 * Attempt to grab the write token before rendering the children.
 */
export const WriteTokenGate = ({ children }: { children: React.ReactNode }) => {
  useWriteToken();
  return <>{children}</>;
};
