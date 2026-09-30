import type { ResourcesForContract } from "@/widgets/framework";
import type { LassoData } from "@/types/lasso";
import { Button, Grid, Group, Slider, Stack, Table, Text } from "@mantine/core";
import { LassoControlWidgetContract } from "./contract";

const axes: Array<"X" | "Y" | "Z"> = ["X", "Y", "Z"];
const states = [
  { value: "dropoff", label: "Drop-off" },
  { value: "midpoint", label: "Midpoint" },
  { value: "pickup", label: "Pickup" },
  { value: "post_pickup", label: "Post Pickup" },
];

export type LassoControlWidgetProps = ResourcesForContract<
  typeof LassoControlWidgetContract
> & {
  instanceId: string;
};

export const LassoControlWidgetView = ({
  pylassoData,
  moveToStatePosition,
  storePosition,
  homeAllAxes,
  stopAllAxes,
  homeAxis,
  stopAxis,
  guiUpdateSpeed,
}: LassoControlWidgetProps) => {
  // Derived values
  // -------------------------------
  // Backend schemas are untyped, so narrow here.
  const lassoData = pylassoData.data as LassoData | null;
  const statePositions = Object.entries(lassoData?.state_positions || {});

  return (
    <Stack gap="xs">
      <Grid columns={4} gap="xs">
        <Grid.Col span={1}>
          <Text size="xs">Current State</Text>
        </Grid.Col>
        <Grid.Col span={1}>
          <Text size="xs">{lassoData?.state}</Text>
        </Grid.Col>
        <Grid.Col span={1}>
          <Text size="xs">Cycle Count:</Text>
        </Grid.Col>
        <Grid.Col span={1}>
          <Text size="xs">{lassoData?.cycle_count}</Text>
        </Grid.Col>

        {states.map((s) => (
          <Grid.Col span={1} key={`move-${s.value}`}>
            <Button
              size="compact-xs"
              fullWidth
              onClick={() => moveToStatePosition.call({ state_name: s.value })}
            >
              Move To {s.label}
            </Button>
          </Grid.Col>
        ))}
        {states.map((s) => (
          <Grid.Col span={1} key={`store-${s.value}`}>
            <Button
              size="compact-xs"
              fullWidth
              onClick={() => storePosition.call({ condition: s.value })}
            >
              Store {s.label}
            </Button>
          </Grid.Col>
        ))}
      </Grid>

      <Table fz="xs" verticalSpacing={2} horizontalSpacing="xs">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Axis</Table.Th>
            {statePositions.map(([state]) => (
              <Table.Th key={state}>{state}</Table.Th>
            ))}
            <Table.Th>Current</Table.Th>
            <Table.Th>
              <Button
                size="compact-xs"
                fullWidth
                onClick={() => homeAllAxes.call({})}
              >
                Home All Axes
              </Button>
            </Table.Th>
            <Table.Th>
              <Button
                size="compact-xs"
                fullWidth
                onClick={() => stopAllAxes.call({})}
              >
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
              <Table.Td>{lassoData?.axes[axis].position.toFixed(3)}</Table.Td>
              <Table.Td>
                <Button
                  size="compact-xs"
                  fullWidth
                  onClick={() => homeAxis.call({ logical_axis: axis })}
                >
                  Home
                </Button>
              </Table.Td>
              <Table.Td>
                <Button
                  size="compact-xs"
                  fullWidth
                  onClick={() => stopAxis.call({ logical_axis: axis })}
                >
                  Stop
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Stack gap="xs">
        {axes.map((axis) => (
          <Group gap="xs" key={`speed-${axis}`}>
            <Text size="xs">{axis} Speed (%)</Text>
            <Slider
              size="xs"
              defaultValue={lassoData?.axes[axis].speed || 10}
              className="flex-1"
              onChange={(value) => guiUpdateSpeed.call({ axis, speed: value })}
            />
          </Group>
        ))}
      </Stack>
    </Stack>
  );
};
