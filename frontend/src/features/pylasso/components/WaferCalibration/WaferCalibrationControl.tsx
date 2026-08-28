import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { WaferMap } from "./WaferMap";
import { useEffect, useMemo, useState } from "react";
import type { NavigatorData, RefPointStatus, Wafer } from "../../types/wafer";
import { useDataChannelStore } from "@/stores/dataChannelStore";
import { useRPCAction } from "@/lib/one-liner-router/call-rpc";

export const WaferCalibrationControl = () => {
  // Local state
  // -------------------------------
  const [reference, setReference] = useState<string>("origin");
  const [wafer, setWafer] = useState<Wafer>();
  const [navigatorData, setNavigatorData] = useState<NavigatorData>();

  // Store state
  // -------------------------------
  const dataChannels = useDataChannelStore((state) => state.channels);

  // Hook - RPC Action
  // -------------------------------
  const calibrateWafer = useRPCAction("calibrate");
  const setWorldRefpoint = useRPCAction<void, { key: string }>(
    "set_word_refpoint",
  );

  // Memoized functions
  // -------------------------------
  const aperturesSignature = useMemo(() => {
    if (!wafer) return null;

    return JSON.stringify(
      Object.entries(wafer.apertures)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([uid, aperture]) => [uid, aperture]),
    );
  }, [wafer]);

  // Effects
  // -------------------------------
  useEffect(() => {
    // add state channel
    const waferStateChannel = dataChannels[`pylasso_wafer_data`];
    const navigatorStateChannel = dataChannels[`pylasso_navigator_data`];
    if (!waferStateChannel || !navigatorStateChannel) return;

    const handleWaferStateMessage = (evt: MessageEvent) => {
      const state = JSON.parse(evt.data);
      state.refpoints = {};
      Object.entries(
        state.refpoint as Record<string, [number, number, number]>,
      ).map(([id, pos]) => {
        const formattedRF: RefPointStatus = {
          position: pos,
          status: state.refpoint_world[id] !== undefined ? true : false,
        };
        state.refpoints[id] = formattedRF;
      });

      setWafer(state);
    };
    const handleNavigatorStateMessage = (evt: MessageEvent) => {
      const state = JSON.parse(evt.data);
      setNavigatorData(state);
    };

    waferStateChannel.addEventListener("message", handleWaferStateMessage);
    navigatorStateChannel.addEventListener(
      "message",
      handleNavigatorStateMessage,
    );

    return () => {
      waferStateChannel.removeEventListener("message", handleWaferStateMessage);
      navigatorStateChannel.removeEventListener(
        "message",
        handleNavigatorStateMessage,
      );
    };
  }, [dataChannels]);

  // Handlers
  // -------------------------------
  function handleReferenceChange(value: string | null) {
    if (value !== null) setReference(value);
  }

  if (wafer === undefined) return;

  return (
    <Stack gap="xs">
      <Group gap="xs">
        {/** TODO: investigate, what does crosshair look like, would need to overlay over camera */}
        <Button size="compact-xs">Toggle Camera Crosshair</Button>
        <Button
          size="compact-xs"
          onClick={async () => {
            await calibrateWafer.callAsync();
          }}
          loading={calibrateWafer.isLoading}
        >
          Calibrate Wafer
        </Button>
      </Group>
      <Group gap="xs">
        <Text size="xs">Reference: </Text>
        <Select
          size="xs"
          data={["origin", "end", "ref"]}
          defaultValue={reference}
          onChange={handleReferenceChange}
          allowDeselect={false}
        />
        <Text size="xs">
          at ({navigatorData?.current_position.X},{" "}
          {navigatorData?.current_position.Y},{" "}
          {navigatorData?.current_position.Z})
        </Text>
        <Button
          size="compact-xs"
          onClick={async () => {
            await setWorldRefpoint.callAsync({ key: reference });
          }}
          loading={setWorldRefpoint.isLoading}
        >
          {" "}
          Set{" "}
        </Button>
      </Group>
      <Group gap="xs">
        <Text size="xs">Wafer Status: </Text>
        <Text size="xs">{wafer.status}</Text>
        <Text size="xs">Wafer Calibration Status: </Text>
        <Text size="xs">{wafer.calibration_status}</Text>
      </Group>
      <WaferMap
        wafer={wafer}
        nextApertureId={navigatorData?.next_aperture_id}
        refreshKey={aperturesSignature ?? "initial"}
      />
    </Stack>
  );
};
