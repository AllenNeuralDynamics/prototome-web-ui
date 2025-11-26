import { useEffect, useState } from "react";
import { BrowserRouter, Link, useLocation } from "react-router-dom";
import { AppRouter } from "./router.tsx";
import { Group, Button, Card } from "@mantine/core";
import type { AppConfig } from "../types/configTypes.tsx";
import { useDataChannelStore, useVideoStreamStore } from "../stores/dataChannelStore.tsx";

import { negotiate } from "../utils/webRtcConnection.tsx";
import { api } from "../lib/client.tsx";

const NavBar = () => {
  const location = useLocation();

  return (
    <Card shadow="xs" p="sm" style={{ marginBottom: "1rem" }}>
      <Group>
        <Button
          component={Link}
          to="/"
          variant={location.pathname === "/" ? "filled" : "outline"}
          color="blue"
        >
          Home
        </Button>
        <Button
          component={Link}
          to="/stage"
          variant={location.pathname === "/stage" ? "filled" : "outline"}
          color="blue"
        >
          Stages
        </Button>
      </Group>
    </Card>
  );
}

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
  }, [config?.data_channels, config?.video_streams]);

  if (!config) return <div>Loading configuration...</div>;

  if (!config.data_channels.every((ch) => ch in dataChannels))
    return <div> Connecting data channels </div>;

  return (
    <BrowserRouter>
      <NavBar />
      <AppRouter
        config={config}
        setConfig={setConfig as React.Dispatch<React.SetStateAction<AppConfig>>}
      />
    </BrowserRouter>
  );
}

export default App;
