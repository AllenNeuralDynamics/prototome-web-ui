import type { ReactNode } from "react";
import { useWriteToken } from "./use-write-token";

type Props = { write: ReactNode; readOnly: ReactNode };

/**
 * Helper switch to render either a write-access component or a read-only component.
 */
export const WriteAccessSwitch = ({ write, readOnly }: Props) => {
  const { hasToken } = useWriteToken();
  return <>{hasToken ? write : readOnly}</>;
};
