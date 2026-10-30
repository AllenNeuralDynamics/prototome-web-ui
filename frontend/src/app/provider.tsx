import { useEffect, useState, Suspense } from "react";
import { Loader, MantineProvider } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MainErrorFallback } from "@/components/errors/main";
import { queryConfig } from "@/lib/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { WidgetGate } from "@/widgets/framework/gate.tsx";
import { defaultWidgetContractRegistry } from "@/widgets/index.ts";
import { PageModeProvider } from "@/lib/write-token/provider.tsx";
import { recheckWriteToken } from "@/lib/write-token/use-write-token";
import { RPCHttpError } from "@/lib/one-liner-router/errors";

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {

  const [queryClient] = useState(() => {
    // Handle 403 - check if the write token was taken
    const onError = (error: unknown) => {
      if (error instanceof RPCHttpError && error.status === 403) {
        recheckWriteToken(client);
      }
    };
    // Create the React Query client with error handling for 403 responses.
    const client = new QueryClient({
      defaultOptions: queryConfig,
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
    });
    return client;
  });

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
            <PageModeProvider>
              <WidgetGate registry={defaultWidgetContractRegistry}>
                {children}
              </WidgetGate>
            </PageModeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </Suspense>
    </MantineProvider>
  );
};
