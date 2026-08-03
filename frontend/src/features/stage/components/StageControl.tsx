import { useState } from "react";
import {
  RangeSlider,
  Slider,
  Text,
  Button,
  Group,
  Card,
  Badge,
  NumberInput,
  Stack,
} from "@mantine/core";
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { useStagePositionStore } from "@/stores/stagePositionStore.tsx";
import { useRPCAction, useRPCData } from "@/lib/one-liner-router/call-rpc.ts";

type AxisControlCardProps = {
  axis: string;
  position: number;
  unit: string;
};

const AxisControlCard = ({ axis, position, unit }: AxisControlCardProps) => {
  // Local state
  // -------------------------------
  const [velocityOverride, setVelocityOverride] = useState<number | null>(null);
  const [posInput, setPosInput] = useState<number | undefined>();
  const [stepSizeInput, setStepSizeInput] = useState<number | undefined>();

  // Hook - RPC Data
  // -------------------------------
  const { result: velocities } = useRPCData<Record<string, number>>(
    "get_axis_velocities",
    {},
  );
  const { result: maxVelocity } = useRPCData<number>("get_axis_max_velocity", {
    logical_axis: axis,
  });
  const { result: ranges } = useRPCData<Record<string, number[]>>("get_axis_travel_ranges", {});

  // Hook - RPC Action
  // -------------------------------
  const setAxisPosition = useRPCAction<
    void,
    { axis: string; position: number }
  >("set_axis_position");
  const setAxisMaxVelocity = useRPCAction<
    void,
    { logical_axis: string; speed: number }
  >("set_axis_max_velocity");
  const homeAxis = useRPCAction<void, { axis: string }>("home_axis");
  const stopAxis = useRPCAction<void, { axis: string }>("stop_axis");

  // Wait until reads are populated
  if (!ranges || velocities === undefined || maxVelocity === undefined)
    return <></>;

  // Derived state
  // -------------------------------
  const [min, max] = ranges[axis] ?? [0, 100];
  const displayVelocity = velocityOverride ?? velocities[axis] ?? 0;

  // Handlers
  // -------------------------------
  const moveTo = (value: number) =>
    setAxisPosition.call({ axis: axis, position: value });

  const onMoveLowerClick = () => moveTo(min);
  const onMoveUpperClick = () => moveTo(max);
  const onMoveMiddleClick = () => moveTo(Math.round((min + max) / 2));

  return (
    <Card
      shadow="xs"
      padding="xs"
      radius="md"
      withBorder
      className="bg-gray-50"
    >
      <Group mb="xs">
        <Badge
          size="lg"
          color={getAxisColor(axis)}
          variant="filled"
          className="w-16 text-center"
        >
          {axis.toUpperCase()}
        </Badge>
      </Group>

      {/* Position display */}
      <Group mb="xs">
        <Text size="sm">Position </Text>
        <Text size="sm" c="dimmed">
          {position?.toFixed(2) || 0} {unit}
        </Text>
      </Group>
      <Slider
        min={Math.min(0, min)}
        max={Math.max(100, max)}
        color={getAxisColor(axis)}
        value={parseFloat(position.toFixed(3))}
        labelAlwaysOn
        marks={[
          { value: min ?? 0, label: "" },
          { value: max ?? 100, label: "" },
        ]}
        style={{ marginTop: "30px" }}
        styles={{
          bar: { backgroundColor: "transparent" },
          mark: { backgroundColor: getAxisColor(axis) },
        }}
      />

      {/* Bounds */}
      <Group mb="xs" style={{ marginTop: "10px" }}>
        <Text size="sm">Bounds</Text>
        <Group>
          <Text size="sm" c="dimmed">
            Min: {min?.toFixed(2) || 0} {unit}
          </Text>
          <Text size="sm" c="dimmed">
            Max: {max?.toFixed(2) || 100} {unit}
          </Text>
        </Group>
      </Group>
      <RangeSlider
        color={getAxisColor(axis)}
        value={[min ?? 0, max ?? 100]}
        min={Math.min(0, min)}
        max={Math.max(100, max)}
      />

      {/* Velocity */}
      <Group mb="xs" style={{ marginTop: "10px" }}>
        <Text size="sm">Velocity</Text>
        <Text size="sm" c="dimmed">
          {displayVelocity?.toFixed(2) || 0}
        </Text>
      </Group>
      <Slider
        color={getAxisColor(axis)}
        step={0.01}
        value={displayVelocity || 0}
        onChange={(val) => {
          setVelocityOverride(val);
          setAxisMaxVelocity.call({ logical_axis: axis, speed: val });
        }}
        max={maxVelocity}
      />

      {/* Actions */}
      <Group mt="md">
        <Button
          color={getAxisColor(axis)}
          variant="light"
          onClick={onMoveLowerClick}
        >
          Go to Lower
        </Button>
        <Button color={getAxisColor(axis)} onClick={onMoveMiddleClick}>
          Go to Middle
        </Button>
        <Button
          color={getAxisColor(axis)}
          variant="light"
          onClick={onMoveUpperClick}
        >
          Go to Upper
        </Button>

        <Stack>
          <NumberInput
            min={min}
            max={max}
            value={posInput}
            placeholder="position"
            hideControls
            suffix={unit}
            decimalScale={4}
            onChange={(val) => {
              if (typeof val === "number") setPosInput(val);
            }}
          />
          <NumberInput
            placeholder="step size"
            hideControls
            suffix={unit}
            value={stepSizeInput}
            onChange={(val) => {
              if (typeof val === "number") setStepSizeInput(val);
            }}
          />
        </Stack>

        <Stack>
          <Button
            color={getAxisColor(axis)}
            onClick={() => {
              if (
                typeof posInput === "number" &&
                typeof stepSizeInput === "number"
              ) {
                const newPos = posInput + stepSizeInput;
                setPosInput(newPos);
                moveTo(newPos);
              }
            }}
          >
            ▲
          </Button>
          <Button
            color={getAxisColor(axis)}
            variant="light"
            onClick={() => {
              if (
                typeof posInput === "number" &&
                typeof stepSizeInput === "number"
              ) {
                const newPos = posInput - stepSizeInput;
                setPosInput(newPos);
                moveTo(newPos);
              }
            }}
          >
            ▼
          </Button>
        </Stack>

        <Stack>
          <Button
            size="xs"
            color={getAxisColor(axis)}
            onClick={() => {
              if (typeof posInput === "number") moveTo(posInput);
            }}
          >
            Move
          </Button>
          <Button
            size="xs"
            color={getAxisColor(axis)}
            variant="light"
            onClick={() => homeAxis.call({ axis })}
          >
            Home
          </Button>
          <Button
            size="xs"
            color={getAxisColor(axis)}
            onClick={() => stopAxis.call({ axis })}
          >
            Stop
          </Button>
        </Stack>
      </Group>
    </Card>
  );
};

// StageControl: renders one AxisControlCard per axis.

export type StageControlProps = {
  stageId: string;
  axes: string[];
  unit?: string;
};

export const StageControl = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stageId,
  axes,
  unit = "um",
}: StageControlProps) => {
  // Store State
  // -------------------------------
  const positions = useStagePositionStore((state) => state.positions);

  if (!axes.every((axis) => axis in positions)) return null;

  // TODO: Do we still need stageId

  return (
    <div>
      {axes.map((axis) => (
        <AxisControlCard
          key={axis}
          axis={axis}
          position={positions[axis]}
          unit={unit}
        />
      ))}
    </div>
  );
};
