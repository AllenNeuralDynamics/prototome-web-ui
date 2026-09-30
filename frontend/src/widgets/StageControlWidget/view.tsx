import type { ResourcesForContract } from "@/widgets/framework";
import { getAxisColor } from "@/utils/colorGrabber";
import {
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  RangeSlider,
  Slider,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { StageControlWidgetContract } from "./contract";

type Resources = ResourcesForContract<typeof StageControlWidgetContract>;

export type StageControlWidgetProps = Resources & {
  instanceId: string;
  axes: string[];
  unit?: string;
};

export const StageControlWidgetView = ({
  axes,
  unit = "um",
  stagePositions,
  getAxisVelocities,
  getAxisTravelRanges,
  getAxisMaxVelocity,
  setAxisPosition,
  setAxisMaxVelocity,
  homeAxis,
  stopAxis,
}: StageControlWidgetProps) => {
  // Local state
  // -------------------------------
  const [maxVelocities, setMaxVelocities] = useState<Record<string, number>>();

  // Derived values
  // -------------------------------
  // Backend schemas are untyped, so narrow here.
  const positions = stagePositions.data as Record<string, number> | null;
  const velocities = getAxisVelocities.data as
    | Record<string, number>
    | undefined;
  const ranges = getAxisTravelRanges.data as
    | Record<string, number[]>
    | undefined;

  // Effects
  // -------------------------------
  const axesKey = axes.join(",");
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      axes.map(async (axis) => {
        const max = await getAxisMaxVelocity.callAsync({ logical_axis: axis });
        return [axis, max as number] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setMaxVelocities(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axesKey]);

  if (!positions || !axes.every((axis) => axis in positions)) return null;
  if (!ranges || !velocities || !maxVelocities) return null;

  return (
    <div>
      {axes.map((axis) => (
        <AxisControlCard
          key={axis}
          axis={axis}
          unit={unit}
          position={positions[axis]}
          velocity={velocities[axis] ?? 0}
          maxVelocity={maxVelocities[axis]}
          range={ranges[axis] ?? [0, 100]}
          setAxisPosition={setAxisPosition}
          setAxisMaxVelocity={setAxisMaxVelocity}
          homeAxis={homeAxis}
          stopAxis={stopAxis}
        />
      ))}
    </div>
  );
};

// --------------------------------------------------------------------------------
//  Axis control card
// --------------------------------------------------------------------------------

type AxisControlCardProps = Pick<
  Resources,
  "setAxisPosition" | "setAxisMaxVelocity" | "homeAxis" | "stopAxis"
> & {
  axis: string;
  unit: string;
  position: number;
  velocity: number;
  maxVelocity: number;
  range: number[];
};

const AxisControlCard = ({
  axis,
  unit,
  position,
  velocity,
  maxVelocity,
  range,
  setAxisPosition,
  setAxisMaxVelocity,
  homeAxis,
  stopAxis,
}: AxisControlCardProps) => {
  // Local state
  // -------------------------------
  const [velocityOverride, setVelocityOverride] = useState<number | null>(null);
  const [posInput, setPosInput] = useState<number | undefined>();
  const [stepSizeInput, setStepSizeInput] = useState<number | undefined>();

  // Derived state
  // -------------------------------
  const [min, max] = range;
  const displayVelocity = velocityOverride ?? velocity;
  const color = getAxisColor(axis);

  // Handlers
  // -------------------------------
  const moveTo = (value: number) =>
    setAxisPosition.call({ logical_axis: axis, position: value });

  const step = (direction: 1 | -1) => {
    if (typeof posInput !== "number" || typeof stepSizeInput !== "number")
      return;
    const newPos = posInput + direction * stepSizeInput;
    setPosInput(newPos);
    moveTo(newPos);
  };

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
          color={color}
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
        color={color}
        value={parseFloat(position.toFixed(3))}
        labelAlwaysOn
        marks={[
          { value: min ?? 0, label: "" },
          { value: max ?? 100, label: "" },
        ]}
        style={{ marginTop: "30px" }}
        styles={{
          bar: { backgroundColor: "transparent" },
          mark: { backgroundColor: color },
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
        color={color}
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
        color={color}
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
        <Button color={color} variant="light" onClick={() => moveTo(min)}>
          Go to Lower
        </Button>
        <Button
          color={color}
          onClick={() => moveTo(Math.round((min + max) / 2))}
        >
          Go to Middle
        </Button>
        <Button color={color} variant="light" onClick={() => moveTo(max)}>
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
          <Button color={color} onClick={() => step(1)}>
            ▲
          </Button>
          <Button color={color} variant="light" onClick={() => step(-1)}>
            ▼
          </Button>
        </Stack>

        <Stack>
          <Button
            size="xs"
            color={color}
            onClick={() => {
              if (typeof posInput === "number") moveTo(posInput);
            }}
          >
            Move
          </Button>
          <Button
            size="xs"
            color={color}
            variant="light"
            onClick={() => homeAxis.call({ logical_axis: axis })}
          >
            Home
          </Button>
          <Button
            size="xs"
            color={color}
            onClick={() => stopAxis.call({ logical_axis: axis })}
          >
            Stop
          </Button>
        </Stack>
      </Group>
    </Card>
  );
};
