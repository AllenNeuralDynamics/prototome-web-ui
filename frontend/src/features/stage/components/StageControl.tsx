import React, { useState, useEffect } from "react";
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
import "@mantine/core/styles.css";
import { StageControlProps } from "../types/stageTypes.tsx";
import {
  postPosition,
  getMinimumPosition,
  getMaximumPosition,
  postMinimumPosition,
  postMaximumPosition,
  getVelocity,
  postVelocity,
} from "../api/stageApi.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";

export default function StageControl({
  stageId,
  axes,
  host,
  unit = "um",
}: StageControlProps) {
  const positions = useSelector((state: RootState) => state.positions.data);
  const [posMins, setMinPositions] = useState<Record<string, number>>({});
  const [posMaxes, setMaxPositions] = useState<Record<string, number>>({});
  const [velocity, setVelocity] = useState<Record<string, number>>({});
  const [posInput, setPosInput] = useState<Record<string, number>>({});
  const [stepSizeInput, setStepSizeInput] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    async function fetchMinPositions() {
      try {
        const newMins: Record<string, number> = {};
        for (const axis of axes) {
          const min = await getMinimumPosition(host, stageId, axis);
          newMins[axis] = min;
        }
        setMinPositions(newMins);
      } catch (error) {
        console.error("Error fetching minimum positions:", error);
      }
    }
    fetchMinPositions();
  }, [stageId, axes, host]);

  useEffect(() => {
    async function fetchMaxPositions() {
      try {
        const newMaxes: Record<string, number> = {};
        for (const axis of axes) {
          const min = await getMaximumPosition(host, stageId, axis);
          newMaxes[axis] = min;
        }
        setMaxPositions(newMaxes);
      } catch (error) {
        console.error("Error fetching maximum positions:", error);
      }
    }
    fetchMaxPositions();
  }, [stageId, axes, host]);

  useEffect(() => {
    async function fetchVelocity() {
      try {
        const newVelocities: Record<string, number> = {};
        for (const axis of axes) {
          const vel = await getVelocity(host, stageId, axis);
          newVelocities[axis] = vel;
        }
        setVelocity(newVelocities);
      } catch (error) {
        console.error("Error fetching velocities:", error);
      }
    }
    fetchVelocity();
  }, [stageId, axes, host]);

  const onPosRangeChange = (range: [number, number], axis: string) => {
    const position = positions[stageId][axis];

    // Clamp range so it must contain current position
    const clampedMin = Math.min(Math.max(range[0], 0), position);
    const clampedMax = Math.max(Math.min(range[1], 100), position);

    if (clampedMin !== posMins[axis] || clampedMax !== posMaxes[axis]) {
      setMinPositions((prev) => ({ ...prev, [axis]: clampedMin }));
      postMinimumPosition(host, stageId, axis, clampedMin);

      setMaxPositions((prev) => ({ ...prev, [axis]: clampedMax }));
      postMaximumPosition(host, stageId, axis, clampedMax);
    }
  };
  const onVelocityChange = (vel: number, axis: string) => {
    setVelocity((prev) => ({ ...prev, [axis]: vel }));
    postVelocity(host, stageId, axis, vel);
  };

  const onMoveLowerClick = (axis: string) => {
    postPosition(host, stageId, axis, posMins[axis]);
  };

  const onMoveUpperClick = (axis: string) => {
    postPosition(host, stageId, axis, posMaxes[axis]);
  };

  const onMoveMiddleClick = (axis: string) => {
    postPosition(
      host,
      stageId,
      axis,
      Math.round((posMins[axis] + posMaxes[axis]) / 2),
    );
  };
  const onMoveClick = (val: number, axis: string) => {
    console.log(val);
    postPosition(host, stageId, axis, val);
  };

  const stagePositions = positions[stageId] ?? {};
  if (!axes.every((axis) => axis in stagePositions))
    return <div> Cannot find positions to {stageId} </div>;

  return (
    <div>
      {Object.entries(positions[stageId]).map(([axis, value]) => (
        <Card
          key={axis}
          shadow="xs"
          padding="md"
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
          <Group mb="xs">
            <Text size="sm">Position </Text>
            <Text size="sm" c="dimmed">
              {positions[stageId][axis]?.toFixed(2) || 0} {unit}
            </Text>
          </Group>
          <Slider
            color={getAxisColor(axis)}
            value={positions[stageId][axis]}
            labelAlwaysOn
            marks={[
              {
                value: posMins[axis] ?? 0,
                label: "",
              },
              {
                value: posMaxes[axis] ?? 100,
                label: "",
              },
            ]}
            style={{ marginTop: "30px" }}
            styles={{
              bar: { backgroundColor: "transparent" },
              mark: {
                backgroundColor: getAxisColor(axis),
              },
            }}
          />
          <Group mb="xs" style={{ marginTop: "10px" }}>
            <Text size="sm">Bounds</Text>
            <Group>
              <Text size="sm" c="dimmed">
                Min: {posMins[axis]?.toFixed(2) || 0} {unit}
              </Text>
              <Text size="sm" c="dimmed">
                Max: {posMaxes[axis]?.toFixed(2) || 100} {unit}
              </Text>
            </Group>
          </Group>
          <RangeSlider
            color={getAxisColor(axis)}
            value={[posMins[axis] ?? 0, posMaxes[axis] ?? 100]}
            minRange={0}
            onChange={(val) => onPosRangeChange(val, axis)}
          />
          <Group mb="xs" style={{ marginTop: "10px" }}>
            <Text size="sm">Velocity</Text>
            <Text size="sm" c="dimmed">
              {velocity[axis]?.toFixed(2) || 0}
            </Text>
          </Group>
          <Slider
            color={getAxisColor(axis)}
            value={velocity[axis] || 0}
            onChange={(val) => onVelocityChange(val, axis)}
          />
          <Group mt="md">
            <Button
              color={getAxisColor(axis)}
              variant="light"
              onClick={(val) => onMoveLowerClick(axis)}
            >
              Go to Lower
            </Button>
            <Button
              color={getAxisColor(axis)}
              onClick={(val) => onMoveMiddleClick(axis)}
            >
              Go to Middle
            </Button>
            <Button
              color={getAxisColor(axis)}
              variant="light"
              onClick={(val) => onMoveUpperClick(axis)}
            >
              Go to Upper
            </Button>
            <Stack>
              <NumberInput
                min={posMins[axis]}
                max={posMaxes[axis]}
                value={posInput[axis]}
                placeholder="position"
                hideControls
                suffix={unit}
                decimalScale={4}
                onChange={(val) => {
                  if (typeof val === "number") {
                    setPosInput((prev) => ({ ...prev, [axis]: val }));
                  }
                }}
              />
              <NumberInput
                placeholder="step size"
                hideControls
                suffix={unit}
                onChange={(val) => {
                  if (typeof val === "number") {
                    setStepSizeInput((prev) => ({ ...prev, [axis]: val }));
                  }
                }}
              />
            </Stack>
            <Stack>
              <Button
                color={getAxisColor(axis)}
                onClick={() => {
                  if (
                    typeof posInput[axis] === "number" &&
                    typeof stepSizeInput[axis] === "number"
                  ) {
                    const newPos = posInput[axis] + stepSizeInput[axis];
                    setPosInput((prev) => ({ ...prev, [axis]: newPos }));
                    onMoveClick(newPos, axis);
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
                    typeof posInput[axis] === "number" &&
                    typeof stepSizeInput[axis] === "number"
                  ) {
                    const newPos = posInput[axis] - stepSizeInput[axis];
                    setPosInput((prev) => ({ ...prev, [axis]: newPos }));
                    onMoveClick(newPos, axis);
                  }
                }}
              >
                ▼
              </Button>
            </Stack>
            <Button
              color={getAxisColor(axis)}
              onClick={() => {
                if (typeof posInput[axis] === "number") {
                  onMoveClick(posInput[axis], axis);
                }
              }}
            >
              Move
            </Button>
          </Group>
        </Card>
      ))}
    </div>
  );
}
