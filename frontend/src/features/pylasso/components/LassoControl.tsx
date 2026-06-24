import {
  Button,
  Grid,
  Group,
  Select,
  Slider,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { lassoCameraApi } from "../api/lassoCameraApi";
import type { LassoData } from "../types/lasso";
import { useDataChannelStore } from "@/stores/dataChannelStore";
import { useRoiStore } from "@/stores/roiStore";

export const LassoControl = () => {
  const [lassoData, setLassoData] = useState<LassoData>();
  const dataChannels = useDataChannelStore((state) => state.channels);
  const statePositions = Object.entries(lassoData?.state_positions || {});
  const axes: Array<"X" | "Y" | "Z"> = ["X", "Y", "Z"];

  const [roiId, setRoiId] = useState<string>("Consumer_dropoffimager");

  useEffect(() => {
    // add state channel
    const stateChannel = dataChannels[`pylasso_data`];
    if (!stateChannel) return;
    // update pos upon message
    const handleStateMessage = (evt: MessageEvent) => {
      const state = JSON.parse(evt.data);
      setLassoData(state);
    };
    stateChannel.addEventListener("message", handleStateMessage);

    return () => {
      stateChannel.removeEventListener("message", handleStateMessage);
    };
  }, [dataChannels]);

  const { rois, addRoi, updateRoi, setSelectedRoi } = useRoiStore();
  
  // This list can be move to a generic configuration once that is established
  const listOfRois = [
    { id: "Consumer_dropoffimager", name: "Dropoff Imager" },
    { id: "Consumer_lassorecorder", name: "Lasso Recorder" },
  ];

  // Initialize ROIs if none exist (since the list of ROI exist here)
  if (rois.length === 0) {
    listOfRois.forEach((roiId) => {
      addRoi({
        id: roiId.id,
        name: roiId.name,
        colorIndex: 0,
        positions: null,
      });
    });
    setSelectedRoi(roiId);
  }

  async function handleROI(value: string) {
    setRoiId(value); // local roi value
    setSelectedRoi(value); // global selected roi value in store
  }

  async function handleToggleColor() {
    const currentColorIndex = rois.find((r) => r.id === roiId)?.colorIndex || 0;
    updateRoi(roiId, {
      colorIndex: (currentColorIndex + 1),
    });
  }

  // move_to_state_position
  async function handleMove(state: string) {
    console.log("MOVE", state);
    lassoCameraApi.postMoveToStatePosition(state);
  }

  // store_position
  async function handleStore(state: string) {
    console.log("STORE", state);
    lassoCameraApi.postStorePosition(state);
  }

  // home_all_axes
  async function handleHomeAll() {
    console.log("HOME ALL");
    lassoCameraApi.postHomeAllAxes();
  }
  // stop_all_axes
  async function handleStopAll() {
    console.log("STOP ALL");
    lassoCameraApi.postStopAllAxes();
  }

  // home_axis
  async function handleHome(axis: string) {
    console.log("HOME", axis);
    lassoCameraApi.postHomeAxis(axis);
  }
  // stop_axis
  async function handleStop(axis: string) {
    console.log("STOP", axis);
    lassoCameraApi.postStopAxis(axis);
  }

  // gui_update_speed
  async function handleStageSpeed(axis: "X" | "Y" | "Z", value: number) {
    console.log("SPEED", axis, value);
    lassoCameraApi.postGuiUpdateSpeed(axis, value);
  }

  return (
    <Stack className="space-y-10">
      <Group>
        <Grid columns={4}>
          <Grid.Col span={1}>
            <Text>Current State</Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text>{lassoData?.state}</Text>
          </Grid.Col>
          <Grid.Col span={1}>
            <Text>Cycle Count: </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text>{lassoData?.cycle_count}</Text>
          </Grid.Col>
          <Grid.Col span={1}>
            <Text>Select ROI: </Text>
          </Grid.Col>
          <Grid.Col span={1}>
            <Select
              defaultValue={listOfRois[0].id}
              data={listOfRois.map((roi) => ({ value: roi.id, label: roi.name }))}
              onChange={(value) => {
                if (value !== null) handleROI(value);
              }}
              clearable={false}
              allowDeselect={false}
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <Button onClick={handleToggleColor}>Toggle Color</Button>
          </Grid.Col>

          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleMove("dropoff")}>
              Move To Drop-off
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleMove("midpoint")}>
              Move To Midpoint
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleMove("pickup")}>
              Move To Pickup
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleMove("post_pickup")}>
              Move To Post Pickup
            </Button>
          </Grid.Col>

          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleStore("dropoff")}>
              Store Drop-off
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleStore("midpoint")}>
              Store Midpoint
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleStore("pickup")}>
              Store Pickup
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth onClick={() => handleStore("post_pickup")}>
              Store Post Pickup
            </Button>
          </Grid.Col>
        </Grid>
      </Group>

      <Stack gap="xs">
        <Group></Group>

        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Axis</Table.Th>
              {statePositions.map(([state]) => (
                <Table.Th key={state}>{state}</Table.Th>
              ))}
              <Table.Th key="current">Current</Table.Th>
              <Table.Th>
                <Button fullWidth onClick={handleHomeAll}>
                  Home All Axes
                </Button>
              </Table.Th>
              <Table.Th>
                <Button fullWidth onClick={handleStopAll}>
                  Stop All Axes
                </Button>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {axes.map((axis) => (
              <Table.Tr key={axis}>
                <Table.Td>{axis}</Table.Td>
                {statePositions.map(([state, pos]) => (
                  <Table.Td key={`${state}-${axis}`}>
                    {pos[axis].toFixed(3)}
                  </Table.Td>
                ))}
                <Table.Td key={`current-${axis}`}>
                  {lassoData?.axes[axis].position.toFixed(3)}
                </Table.Td>
                <Table.Td>
                  <Button fullWidth onClick={() => handleHome(axis)}>
                    Home
                  </Button>
                </Table.Td>
                <Table.Td>
                  <Button fullWidth onClick={() => handleStop(axis)}>
                    Stop
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>

      <Stack>
        <Group>
          <Text>X Speed (%)</Text>
          <Slider
            defaultValue={lassoData?.axes.X.speed || 10}
            className="flex-1"
            onChange={(value) => handleStageSpeed("X", value)}
          />
          <Text>10.000 mm/s</Text>
        </Group>
        <Group>
          <Text>Y Speed (%)</Text>
          <Slider
            defaultValue={lassoData?.axes.Y.speed}
            className="flex-1"
            onChange={(value) => handleStageSpeed("Y", value)}
          />
          <Text>10.000 mm/s</Text>
        </Group>
        <Group>
          <Text>Z Speed (%)</Text>
          <Slider
            defaultValue={lassoData?.axes.Z.speed}
            className="flex-1"
            onChange={(value) => handleStageSpeed("Z", value)}
          />
          <Text>10.000 mm/s</Text>
        </Group>
      </Stack>
    </Stack>
  );
};
