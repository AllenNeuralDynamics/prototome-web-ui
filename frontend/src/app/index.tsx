import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, useLocation } from "react-router-dom";
import { AppRouter } from "./router.tsx";
import { Group, Button, Paper } from "@mantine/core";
import type { AppConfig } from "../types/configTypes.tsx";
import { useDataChannelStore, useVideoStreamStore } from "../stores/dataChannelStore.tsx";
import { negotiate } from "../utils/webRtcConnection.tsx";

const NavBar = () => {
  const location = useLocation();

  return (
    <Paper shadow="xs" p="sm" style={{ marginBottom: "1rem" }}>
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
    </Paper>
  );
}

const App = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const dataChannels = useDataChannelStore((state) => state.channels)
  const addChannel = useDataChannelStore((state) => state.addChannel)
  const addStream = useVideoStreamStore((state) => state.addStream)
  const transcieverMapping = useState<Record<string, string>>({});

  //  fetch config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("http://localhost:8000/config");
        if (!response.ok) throw new Error("Failed to fetch config");
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching config:", error)
      }
    }
    fetchConfig();
  }, []);

  //  populate dataChannels and streams 
  useEffect(() => {
      if (!config) return;
      const pc = new RTCPeerConnection();
      // create dataChannels and store them 
      for (const channel of config.data_channels){
        const newChannel = pc.createDataChannel(channel);
        addChannel(channel, newChannel)
      }
      
      // create streams and store them 
      const transceiverMapping: { [key: string]: RTCRtpTransceiver } = {}
      for (const stream of config.video_streams){
        const newTran = pc.addTransceiver("video", { direction: "recvonly" });
        transceiverMapping[stream] = newTran
      }
      // add track listener for video
      pc.addEventListener("track", (evt) => {
          if (evt.track.kind === "video") {
            const streamName = Object.keys(transceiverMapping).find(k => transceiverMapping[k] === evt.transceiver);
            if (streamName){
              addStream(streamName, evt.streams[0])
            }
          }
        });

      negotiate(pc, transceiverMapping);

  }, [config]);

  if (!config) return <div>Loading configuration...</div>;

  if (!config.data_channels.every((ch) => ch in dataChannels))
    return <div> Connecting data channels </div>;

  return (
    <BrowserRouter>
      <NavBar />
      <AppRouter config={config} setConfig={setConfig as React.Dispatch<React.SetStateAction<AppConfig>>} />
    </BrowserRouter>
  );
}

export default App;
