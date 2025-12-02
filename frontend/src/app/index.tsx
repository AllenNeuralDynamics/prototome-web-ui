import { useEffect, useState } from "react";
import { BrowserRouter} from "react-router-dom";
import { AppRouter } from "./router.tsx";
import type { AppConfig } from "@/types/configTypes.tsx";
import { useDataChannelStore, useVideoStreamStore } from "@/stores/dataChannelStore.tsx";
import { negotiate } from "@/utils/webRtcConnection.tsx";
import { AppProvider } from "./provider.tsx";
import MainLayout from "@/components/layouts/MainLayout.tsx";
import { api } from "../lib/client.tsx";


const App = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const dataChannels = useDataChannelStore((state) => state.channels);
  const addChannel = useDataChannelStore((state) => state.addChannel);
  const addStream = useVideoStreamStore((state) => state.addStream);

  //  fetch ui config and prototome config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const uiConfig = await api.get("/config");
        const prototomeConfig = await api.get("/get_prototome_config");
        setConfig({...uiConfig.data, prototome_config:prototomeConfig.data});
      } catch (error) {
        console.error("Error fetching config:", error);
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
      const newTran = pc.addTransceiver("video", { direction: "recvonly" });
      transceiverMapping[stream] = newTran;
    }
    // add track listener for video
    pc.addEventListener("track", (evt) => {
      if (evt.track.kind === "video") {
        const streamName = Object.keys(transceiverMapping).find(
          (k) => transceiverMapping[k] === evt.transceiver,
        );
        if (streamName) {
          addStream(streamName, evt.streams[0]);
        }
      }
    });

    negotiate(pc, transceiverMapping);

  return () => {
    pc.close();
    console.log("closing") 
  };

  }, [!!config]);

  if (!config) return <div>Loading configuration...</div>;

  if (!config.data_channels.every((ch) => ch in dataChannels))
    return <div> Connecting data channels </div>;

  return (
    <AppProvider>
      <BrowserRouter>
        <MainLayout>
          <AppRouter config={config} setConfig={setConfig as React.Dispatch<React.SetStateAction<AppConfig>>} />
        </MainLayout> 
      </BrowserRouter>
    </AppProvider> 
  );
}

export default App;
