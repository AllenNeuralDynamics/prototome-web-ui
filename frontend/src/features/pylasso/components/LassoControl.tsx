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
import type { LassoData } from "../types/lasso";
import { useDataChannelStore } from "@/stores/dataChannelStore";
import { useRoiStore } from "@/stores/roiStore";
import { useRPCAction } from "@/lib/one-liner-router/call-rpc";

export const LassoControl = () => {
  // Local state
  // -------------------------------
  const [lassoData, setLassoData] = useState<LassoData>();
  const [roiId, setRoiId] = useState<string>("Consumer_dropoffimager");
  // This list can be move to a generic configuration once that is established
  const listOfRois = [
    { id: "Consumer_dropoffimager", name: "Dropoff Imager" },
    { id: "Consumer_lassorecorder", name: "Lasso Recorder" },
  ];
  const statePositions = Object.entries(lassoData?.state_positions || {});
  const axes: Array<"X" | "Y" | "Z"> = ["X", "Y", "Z"];

  // Store state
  // -------------------------------
  const dataChannels = useDataChannelStore((state) => state.channels);
  const { rois, addRoi, updateRoi, setSelectedRoi } = useRoiStore();

  // Hook - RPC Action
  // -------------------------------
  const moveToStatePosition = useRPCAction("move_to_state_position");
  const storePosition = useRPCAction("store_position");
  const homeAllAxes = useRPCAction("lasso_home_all_axes");
  const stopAllAxes = useRPCAction("lasso_stop_all_axes");
  const homeAxis = useRPCAction("lasso_home_axis");
  const stopAxis = useRPCAction("lasso_stop_axis");
  const guiUpdateSpeed = useRPCAction("gui_update_speed");

  // Effects
  // -------------------------------
  useEffect(() => {
    // Initialize ROIs if none exist (since the list of ROI exist here)
    if (rois.length > 0) return;
    for (const r of listOfRois) {
      addRoi({ id: r.id, name: r.name, colorIndex: 0, positions: null });
    }
    setSelectedRoi(roiId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

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

  // Handlers
  // -------------------------------

  async function handleROI(value: string) {
    setRoiId(value); // local roi value
    setSelectedRoi(value); // global selected roi value in store
  }

  async function handleToggleColor() {
    const currentColorIndex = rois.find((r) => r.id === roiId)?.colorIndex || 0;
    updateRoi(roiId, {
      colorIndex: currentColorIndex + 1,
    });
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
              data={listOfRois.map((roi) => ({
                value: roi.id,
                label: roi.name,
              }))}
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
            <Button
              fullWidth
              onClick={() =>
                moveToStatePosition.call({ state_name: "dropoff" })
              }
            >
              Move To Drop-off
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button
              fullWidth
              onClick={() =>
                moveToStatePosition.call({ state_name: "midpoint" })
              }
            >
              Move To Midpoint
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button
              fullWidth
              onClick={() => moveToStatePosition.call({ state_name: "pickup" })}
            >
              Move To Pickup
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button
              fullWidth
              onClick={() =>
                moveToStatePosition.call({ state_name: "post_pickup" })
              }
            >
              Move To Post Pickup
            </Button>
          </Grid.Col>

          <Grid.Col span={1}>
            <Button
              fullWidth
              onClick={() => storePosition.call({ condition: "dropoff" })}
            >
              Store Drop-off
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button
              fullWidth
              onClick={() => storePosition.call({ condition: "midpoint" })}
            >
              Store Midpoint
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button
              fullWidth
              onClick={() => storePosition.call({ condition: "pickup" })}
            >
              Store Pickup
            </Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button
              fullWidth
              onClick={() => storePosition.call({ condition: "post_pickup" })}
            >
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
                <Button fullWidth onClick={() => homeAllAxes.call({})}>
                  Home All Axes
                </Button>
              </Table.Th>
              <Table.Th>
                <Button fullWidth onClick={() => stopAllAxes.call({})}>
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
                  <Button fullWidth onClick={() => homeAxis.call({ axis })}>
                    Home
                  </Button>
                </Table.Td>
                <Table.Td>
                  <Button fullWidth onClick={() => stopAxis.call({ axis })}>
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
            onChange={(value) =>
              guiUpdateSpeed.call({ axis: "X", speed: value })
            }
          />
          <Text>10.000 mm/s</Text>
        </Group>
        <Group>
          <Text>Y Speed (%)</Text>
          <Slider
            defaultValue={lassoData?.axes.Y.speed}
            className="flex-1"
            onChange={(value) =>
              guiUpdateSpeed.call({ axis: "Y", speed: value })
            }
          />
          <Text>10.000 mm/s</Text>
        </Group>
        <Group>
          <Text>Z Speed (%)</Text>
          <Slider
            defaultValue={lassoData?.axes.Z.speed}
            className="flex-1"
            onChange={(value) =>
              guiUpdateSpeed.call({ axis: "Z", speed: value })
            }
          />
          <Text>10.000 mm/s</Text>
        </Group>
      </Stack>
    </Stack>
  );
};
