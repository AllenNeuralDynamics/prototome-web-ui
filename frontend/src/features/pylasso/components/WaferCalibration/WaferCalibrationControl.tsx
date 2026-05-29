import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { WaferMap } from "./WaferMap";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { NavigatorData, RefPointStatus, Wafer } from "../../types/wafer";
import { lassoCameraApi } from "../../api/lassoCameraApi";
import { useMutation } from "@tanstack/react-query";
import { useDataChannelStore } from "@/stores/dataChannelStore";

export const WaferCalibrationControl = () => {
  const [reference, setReference] = useState<string>("origin");

  const [wafer, setWafer] = useState<Wafer>();
  const [navigatorData, setNavigatorData] = useState<NavigatorData>();

  const dataChannels = useDataChannelStore((state) => state.channels);

  useEffect(() => {
    // add state channel
    const waferStateChannel = dataChannels[`pylasso_wafer_data`];
    const navigatorStateChannel = dataChannels[`pylasso_navigator_data`];
    if (!waferStateChannel || !navigatorStateChannel) return;

    const handleWaferStateMessage = (evt: MessageEvent) => {
      const state = JSON.parse(evt.data);
      state.refpoints = {};
      Object.entries(state.refpoint as Record<string, [number, number, number]>).map(([id, pos]) => {
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

  const getWaferData = useCallback(async () => {
    const waferData: Wafer = await lassoCameraApi.getWafer();
    waferData.refpoints = {};
    Object.entries(waferData.refpoint).map(([id, pos]) => {
      const formattedRF: RefPointStatus = {
        position: pos,
        status: waferData.refpoint_world[id] !== undefined ? true : false,
      };
      waferData.refpoints[id] = formattedRF;
    });

    setWafer(waferData);
  }, []);

  // Mutations
  // -------------------------------

  const calibrateWafer = useMutation({
    mutationFn: lassoCameraApi.postCalibrate,
  });

  const setWorldRefpoint = useMutation({
    mutationFn: (key: string) => lassoCameraApi.postSetWorldRefpoint(key),
  });

  function handleReferenceChange(value: string | null) {
    if (value !== null) setReference(value);
  }

  const aperturesSignature = useMemo(() => {
    if (!wafer) return null;

    return JSON.stringify(
      Object.entries(wafer.apertures)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([uid, aperture]) => [uid, aperture]),
    );
  }, [wafer]);

  if (wafer === undefined) return;

  return (
    <Stack>
      <Group>
        {/** TODO: investigate, what does crosshair look like, would need to overlay over camera */}
        <Button>Toggle Camera Crosshair</Button>
        <Button
          onClick={async () => {
            await calibrateWafer.mutateAsync();
          }}
          loading={calibrateWafer.isPending}
        >
          Calibrate Wafer
        </Button>
      </Group>
      <Group>
        <Text>Reference: </Text>
        <Select
          data={["origin", "end", "ref"]}
          defaultValue={reference}
          onChange={handleReferenceChange}
          allowDeselect={false}
        />
        <Text>
          at ({navigatorData?.current_position.X},{" "}
          {navigatorData?.current_position.Y},{" "}
          {navigatorData?.current_position.Z})
        </Text>
        <Button
          onClick={async () => {
            await setWorldRefpoint.mutateAsync(reference);
          }}
          loading={setWorldRefpoint.isPending}
        >
          {" "}
          Set{" "}
        </Button>
      </Group>
      <Group>
        <Text>Wafer Status: </Text>
        <Text>{wafer.status}</Text>
        <Text>Wafer Calibration Status: </Text>
        <Text>{wafer.calibration_status}</Text>
      </Group>
      <WaferMap
        wafer={wafer}
        nextApertureId={navigatorData?.next_aperture_id}
        onRefresh={getWaferData}
        refreshKey={aperturesSignature ?? "initial"}
      />
    </Stack>
  );
};
