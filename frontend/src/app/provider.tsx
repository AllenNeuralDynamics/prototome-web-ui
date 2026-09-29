import { useEffect, useState, Suspense } from "react";
import { Loader, MantineProvider } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainErrorFallback } from "@/components/errors/main";
import { queryConfig } from "@/lib/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { WidgetGate } from "@/widgets/framework/gate.tsx";
import { defaultWidgetContractRegistry } from "@/widgets/index.ts";

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

  // //  fetch ui config
  // useEffect(() => {
  //   async function fetchConfig() {
  //     try {
  //       const uiConfig = await api.get("/ui_config");
  //       const streams = await fetchStreamMetadata("api/streams");
  //       Object.keys(streams).forEach((streamName) => {
  //         uiConfig.data.data_channels = uiConfig.data.data_channels || [];
  //         if (!uiConfig.data.video_streams.includes(streamName)) {
  //           uiConfig.data.data_channels.push(streamName);
  //         }
  //       });
  //       setConfig(uiConfig.data);
  //     } catch (error) {
  //       console.error("Error fetching config:", error);
  //     }
  //   }
  //   fetchConfig();
  // }, []);

  //  fetch prototome config
  // useEffect(() => {
  //   async function fetchConfig() {
  //     try {
  //       const prototomeConfig = await api.post("/get_prototome_config");
  //       setPrototomeConfig(prototomeConfig.data);
  //     } catch (error) {
  //       console.error("Error fetching config:", error);
  //       setPrototomeConfig(null);
  //     }
  //   }
  //   fetchConfig();
  // }, []);

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
            <WidgetGate registry={defaultWidgetContractRegistry}>
              {children}
            </WidgetGate>
          </QueryClientProvider>
        </ErrorBoundary>
      </Suspense>
    </MantineProvider>
  );
};
