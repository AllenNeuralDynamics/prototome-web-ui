import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { WaferMap } from "./WaferMap";
import { useCallback, useEffect, useState } from "react";
import type { NavigatorData, RefPointStatus, Wafer } from "../../types/wafer";
import { lassoCameraApi } from "../../api/lassoCameraApi";

export const WaferCalibrationControl = () => {
  const [wafer, setWafer] = useState<Wafer>();
  const [navigatorData, setNavigatorData] = useState<NavigatorData>();
  const [refreshCount, setRefreshCount] = useState(0);

  const [reference, setReference] = useState<string>("origin");

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
    setRefreshCount((c) => c + 1);
  }, []);

  // Fetch wafer and navigator data
  useEffect(() => {
    async function init() {
      await getWaferData();
      const nav = await lassoCameraApi.getNavigatorData();
      setNavigatorData(nav);
    }
    init();
    // lassoCameraApi.getNavigatorData().then(setNavigatorData);
    // getWaferData();
  }, []);

  function handleReferenceChange(value: string | null) {
    if (value !== null) setReference(value);
  }

  if (wafer === undefined) return;

  return (
    <Stack>
      <Group>
        {/** TODO: investigate, what does crosshair look like, would need to overlay over camera */}
        <Button>Toggle Camera Crosshair</Button>
        <Button
          onClick={async () => {
            lassoCameraApi.postCalibrate();
            await getWaferData();
          }}
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
            lassoCameraApi.postSetWorldRefpoint(reference);
            await getWaferData();
          }}
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
        refreshCount={refreshCount}
      />
    </Stack>
  );
};
