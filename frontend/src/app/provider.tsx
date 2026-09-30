import { useEffect, useState, Suspense } from "react";
import { Loader, MantineProvider } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainErrorFallback } from "@/components/errors/main";
import { queryConfig } from "@/lib/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { WidgetGate } from "@/widgets/framework/gate.tsx";
import { defaultWidgetContractRegistry } from "@/widgets/index.ts";
import { WriteTokenGate } from "@/lib/write-token/gate.tsx";

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

  const { colorScheme } = useThemeStore();

  // Set root to have "dark" class for tailwind dark mode theming
  useEffect(() => {
    const root = document.documentElement;
    if (colorScheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [colorScheme]);

  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center">
            <Loader color="green" size="xl" />
          </div>
        }
      >
        <ErrorBoundary FallbackComponent={MainErrorFallback}>
          <QueryClientProvider client={queryClient}>
            {/* {import.meta.env.DEV && <ReactQueryDevtools />} */}
            <WriteTokenGate>
              <WidgetGate registry={defaultWidgetContractRegistry}>
                {children}
              </WidgetGate>
            </WriteTokenGate>
          </QueryClientProvider>
        </ErrorBoundary>
      </Suspense>
    </MantineProvider>
  );
};
