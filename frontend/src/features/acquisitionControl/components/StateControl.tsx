import { useState, useEffect, useRef } from "react";
import { Card, Button, Group, Stack, Text, Badge } from "@mantine/core";
import { useDataChannelStore } from "../../../stores/dataChannelStore.tsx";
import { useRPCAction } from "@/lib/one-liner-router/call-rpc.ts";

export const StateControl = () => {
  // Local state
  // -------------------------------
  const [currentState, setCurrentState] = useState("Paused");
  const stateChannelRef = useRef<RTCDataChannel | null>(null);

  // Store state
  // -------------------------------
  const dataChannels = useDataChannelStore((state) => state.channels);

  // Hook - RPC Action
  // -------------------------------

  // TODO: one-liner bug
  //  If args or kwargs are defined in the zmq RouterServer config
  //  The argument will still be required in the call here
  //  If I provide the arguments here, it will throw a "multiple values for argument" error
  const startCutting = useRPCAction<void, { state: string }>("start_cutting");
  const cutOne = useRPCAction("cut_one");
  const stopCuttingSafely = useRPCAction("stop_cutting_safely");
  const stopCuttingNow = useRPCAction("stop_cutting_now");

  // Effects
  // -------------------------------
  // initialize and connect prototome state dataChannel
  useEffect(() => {
    // add state channel
    const stateChannel = dataChannels[`prototome_state`];
    if (!stateChannel) return;
    // update pos upon message
    const handleStateMessage = (evt: MessageEvent) => {
      const state = JSON.parse(evt.data);
      setCurrentState(state[1]);
    };
    stateChannel.addEventListener("message", handleStateMessage);
    // create reference
    stateChannelRef.current = stateChannel;

    return () => {
      stateChannel.removeEventListener("message", handleStateMessage);
    };
  }, [dataChannels]);

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
          <Button
            color="green"
            onClick={() =>
              startCutting.call(
                { state: "Run" },
                {
                  onError: (err) => {
                    console.error("Error starting cutting:", err);
                  },
                },
              )
            }
          >
            Start Cutting
          </Button>
          <Button color="yellowgreen">Repeat Cut</Button>
          <Button color="yellow" onClick={() => cutOne.call()}>
            Cut One
          </Button>
          <Button color="orange" onClick={() => stopCuttingSafely.call()}>
            Stop Cutting Safely
          </Button>
          <Button color="red" onClick={() => stopCuttingNow.call()}>
            Stop Cutting Now
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};
