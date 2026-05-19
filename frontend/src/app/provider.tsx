import { useEffect, useState, Suspense } from "react";
import { Loader, MantineProvider } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDataChannelStore,
  useVideoStreamStore,
} from "@/stores/dataChannelStore.tsx";
import { useConfigStore } from "@/stores/configStore.ts";
import { usePrototomeConfigStore } from "@/stores/prototomeConfigStore.tsx";
import { MainErrorFallback } from "@/components/errors/main";
import { queryConfig } from "@/lib/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { api } from "../lib/client.tsx";
import { negotiate } from "@/utils/webRtcConnection.tsx";

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const addChannel = useDataChannelStore((state) => state.addChannel);
  const addStream = useVideoStreamStore((state) => state.addStream);
  const setConfig = useConfigStore((state) => state.setConfig);
  const config = useConfigStore((state) => state.config);
  const setPrototomeConfig = usePrototomeConfigStore(
    (state) => state.setConfig,
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

  //  fetch ui config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const uiConfig = await api.get("/ui_config");
        setConfig(uiConfig.data);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    }
    fetchConfig();
  }, []);

  //  fetch prototome config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const prototomeConfig = await api.get("/get_prototome_config");
        setPrototomeConfig(prototomeConfig.data);
      } catch (error) {
        console.error("Error fetching config:", error);
        setPrototomeConfig(null)
      }
    }
    fetchConfig();
  }, []);

  //  populate dataChannels and streams
  useEffect(() => {
    if (!config) return;
    const pc = new RTCPeerConnection();
    // create dataChannels and store them
    for (const channel of config.data_channels) {
      const newChannel = pc.createDataChannel(channel);
      addChannel(channel, newChannel);
    }

    // create streams and store them
    const transceiverMapping: { [key: string]: RTCRtpTransceiver } = {};
    for (const stream of config.video_streams) {
      const newTran = pc.addTransceiver("video", { direction: "recvonly"});
      transceiverMapping[stream] = newTran;
    }
    // add track listener for video
    pc.addEventListener("track", (evt) => {
      if (evt.track.kind === "video") {
        
        const streamName = Object.keys(transceiverMapping).find(
          (k) => transceiverMapping[k] === evt.transceiver,
        );
        if (streamName) {
          const mediaStream = new MediaStream([evt.track]);
          addStream(streamName, mediaStream);
        }
      }
    });

    negotiate(pc, transceiverMapping);

    return () => {
      pc.close();
      console.log("closing");
    };
  }, [!!config]);

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
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader color="green" size="xl" />
        </div>
      }
    >
      <MantineProvider forceColorScheme={colorScheme}>
        <ErrorBoundary FallbackComponent={MainErrorFallback}>
          <QueryClientProvider client={queryClient}>
            {/* {import.meta.env.DEV && <ReactQueryDevtools />} */}
            {children}
          </QueryClientProvider>
        </ErrorBoundary>
      </MantineProvider>
    </Suspense>
  );
};
