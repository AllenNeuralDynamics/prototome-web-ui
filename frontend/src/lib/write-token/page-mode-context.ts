import { createContext } from "react";

export type PageMode = "write" | "read";

export const PageModeContext = createContext<PageMode>("read");
