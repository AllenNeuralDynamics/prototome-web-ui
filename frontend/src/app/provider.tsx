import * as React from "react";
import { Loader, MantineProvider } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { MainErrorFallback } from "@/components/errors/main";
import { queryConfig } from "@/lib/react-query";
import { useThemeStore } from "@/stores/themeStore";

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      })
  );

  // TODO: query prototome configuration here (from fastapi) before app renders

  const { colorScheme } = useThemeStore();

  // Set root to have "dark" class for tailwind dark mode theming 
  React.useEffect(() => {
    const root = document.documentElement;
    if (colorScheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [colorScheme]);

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader color="green" size="xl" />
        </div>
      }
    >
      <MantineProvider>
        <ErrorBoundary FallbackComponent={MainErrorFallback}>
          <QueryClientProvider client={queryClient}>
            {/* {import.meta.env.DEV && <ReactQueryDevtools />} */}
            {children}
          </QueryClientProvider>
        </ErrorBoundary>
      </MantineProvider>
    </React.Suspense>
  );
};
