import { useContext } from "react";
import { PageModeContext } from "./page-mode-context";

export function usePageMode() {
  return useContext(PageModeContext);
}

export function useIsReadOnly() {
  return usePageMode() !== "write";
}
