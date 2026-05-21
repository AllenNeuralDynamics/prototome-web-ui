import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { WaferMap } from "./WaferMap";
import { useMemo, useState } from "react";
import type { NavigatorData, RefPointStatus, Wafer } from "../../types/wafer";
import { lassoCameraApi } from "../../api/lassoCameraApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const waferQueryKey = ["pylasso", "wafer"] as const;
const navigatorQueryKey = ["pylasso", "navigatorData"] as const;

// This "select" function does two things for us:
//  1) parses waferData and transforms refpoints for the UI to be used
//  2) memoizes the wafer data to reduce re-rendering
function mapWaferData(waferData: Wafer): Wafer {
  const refpoints = Object.entries(waferData.refpoint).reduce<
    Record<string, RefPointStatus>
  >((acc, [id, pos]) => {
    acc[id] = {
      position: pos,
      status: waferData.refpoint_world[id] !== undefined,
    };
    return acc;
  }, {});

  return {
    ...waferData,
    refpoints,
  };
}

export const WaferCalibrationControl = () => {
  const queryClient = useQueryClient();
  const [reference, setReference] = useState<string>("origin");

  // Queries
  // -------------------------------

  const { data: wafer, refetch: refetchWafer } = useQuery<Wafer, Error, Wafer>({
    queryKey: waferQueryKey,
    queryFn: lassoCameraApi.getWafer,
    select: mapWaferData,
    staleTime: 1000,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
  });

  const { data: navigatorData } = useQuery<NavigatorData>({
    queryKey: navigatorQueryKey,
    queryFn: lassoCameraApi.getNavigatorData,
    staleTime: 0,
    refetchInterval: 300,
    refetchIntervalInBackground: false,
  });

  // Mutations
  // -------------------------------

  const calibrateWafer = useMutation({
    mutationFn: lassoCameraApi.postCalibrate,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: waferQueryKey }),
        queryClient.invalidateQueries({ queryKey: navigatorQueryKey }),
      ]);
    },
  });

  const setWorldRefpoint = useMutation({
    mutationFn: (key: string) => lassoCameraApi.postSetWorldRefpoint(key),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: waferQueryKey }),
        queryClient.invalidateQueries({ queryKey: navigatorQueryKey }),
      ]);
    },
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
        onRefresh={async () => {
          await refetchWafer();
        }}
        refreshKey={aperturesSignature ?? "initial"}
      />
    </Stack>
  );
};
