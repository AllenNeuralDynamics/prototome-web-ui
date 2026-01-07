import { useState, useEffect, useRef } from "react";
import { Card, Button, Group, Stack, Text, Badge } from "@mantine/core";
import { stateControlApi } from "../api/stateControlApi.ts";
import { useDataChannelStore } from "../../../stores/dataChannelStore.tsx";

export const StateControl = () => {
  const [currentState, setCurrentState] = useState("Paused");
  const dataChannels = useDataChannelStore((state) => state.channels);
  const stateChannelRef = useRef<RTCDataChannel | null>(null);
  

  // initialize and connect prototome state dataChannel
  useEffect(() => {
    // add state channel
    const stateChannel = dataChannels[`prototome_state`];
    // update pos upon message
    const handleStateMessage = (evt: MessageEvent) => {
      const state = JSON.parse(evt.data);
      setCurrentState(state);
    };
    stateChannel.addEventListener("message", handleStateMessage);
    // create reference
    stateChannelRef.current = stateChannel;

    return () => {
      stateChannel.removeEventListener("message", handleStateMessage);
    };
  }, [dataChannels]);

  // query instrument for initial state
  // useEffect(() => {
  //   async function fetchInitState () {
  //     const state = await stateControlApi.getState()
  //     setCurrentState(state)
  //   }
  //   fetchInitState()

  // }, []);

  return (
    <Card
      w="100%"
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ maxWidth: "450px", margin: "auto" }}
    >
      <Stack>
        <Group>
          <Text size="sm">Current State:</Text>
          <Badge color="green" variant="light">
            {currentState}
          </Badge>
        </Group>
        <Stack>
          <Button>Switch to Facing</Button>
          <Button color="green" onClick={() => stateControlApi.postStartCutting()}>Start Cutting</Button>
          <Button color="yellowgreen">Repeat Cut</Button>
          <Button color="yellow" onClick={() => stateControlApi.postCutOne()}>Cut One</Button>
          <Button color="orange" onClick={() => stateControlApi.postStopCuttingSafely()}>Stop Cutting Safely</Button>
          <Button color="red" onClick={() => stateControlApi.postStopCuttingNow()}>Stop Cutting Now</Button>
        </Stack>
      </Stack>
    </Card>
  );
}
