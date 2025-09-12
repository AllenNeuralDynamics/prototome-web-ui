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
import { postPosition, getVelocity, postVelocity } from "../api/stageApi.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { useDispatch, useStore } from "react-redux";
import { AppDispatch } from "../../../stores/store.tsx";
import { postMinPos, postMaxPos } from "../stores/rangeSlice.tsx";

export default function StageControl({
  stageId,
  axes,
  host,
  unit = "um",
}: StageControlProps) {
  const [positions, setPos] = useState<Record<string, number>>(() => Object.fromEntries(axes.map(axis => [axis, 0])));
  const ranges = useSelector((state: RootState) => state.range.data);
  const dispatch = useDispatch<AppDispatch>();
  const [velocity, setVelocity] = useState<Record<string, number>>({});
  const [posInput, setPosInput] = useState<Record<string, number>>({});
  const [stepSizeInput, setStepSizeInput] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
      let socket: WebSocket;
      const connectFrameSocket = () => {
        socket = new WebSocket(`ws://localhost:8000/ws/${stageId}/z/stage_pos`);
      
        socket.onopen = () => {
          console.log("Stage WebSocket connected", `ws://localhost:8000/ws/${stageId}/z/stage_pos`);
        };
      
        socket.onmessage = (event) => {
          
          const pos = JSON.parse(event.data);
          setPos((prev) => ({...prev, "z": pos}))
          console.log("pos", pos)
        };
      
        socket.onclose = () => {
          console.log("Stage WebSocket closed, reconnecting...");
          setTimeout(() => connectFrameSocket(), 2000); // auto-reconnect
        };
      };
      connectFrameSocket()
  
      return() => socket.close();
    }, [stageId])

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

    if (
      clampedMin !== ranges[stageId][axis].min ||
      clampedMax !== ranges[stageId][axis].max
    ) {
      dispatch(postMinPos({ host, stageId, axis, value: clampedMin }));
      dispatch(postMaxPos({ host, stageId, axis, value: clampedMax }));
    }
  };
  const onVelocityChange = (vel: number, axis: string) => {
    setVelocity((prev) => ({ ...prev, [axis]: vel }));
    postVelocity(host, stageId, axis, vel);
  };

  const onMoveLowerClick = (axis: string) => {
    postPosition(host, stageId, axis, ranges[stageId][axis].min);
  };

  const onMoveUpperClick = (axis: string) => {
    postPosition(host, stageId, axis, ranges[stageId][axis].max);
  };

  const onMoveMiddleClick = (axis: string) => {
    postPosition(
      host,
      stageId,
      axis,
      Math.round((ranges[stageId][axis].min + ranges[stageId][axis].max) / 2),
    );
  };
  const onMoveClick = (val: number, axis: string) => {
    postPosition(host, stageId, axis, val);
  };

  const stagePositions = positions ?? {};
  console.log("stage positions", stagePositions)
  if (!axes.every((axis) => axis in stagePositions))
    return <div> Cannot find positions to {stageId} </div>;

  const stageRanges = ranges[stageId] ?? {};
  if (!axes.every((axis) => axis in stageRanges))
    return <div> Cannot find ranges to {stageId} </div>;

  return (
    <div>
      {Object.entries(positions).map(([axis, value]) => (
        <Card
          key={axis}
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
          <Group mb="xs">
            <Text size="sm">Position </Text>
            <Text size="sm" c="dimmed">
              {positions[axis]?.toFixed(2) || 0} {unit}
            </Text>
          </Group>
          <Slider
            color={getAxisColor(axis)}
            value={positions[axis]}
            labelAlwaysOn
            marks={[
              {
                value: ranges[stageId][axis].min ?? 0,
                label: "",
              },
              {
                value: ranges[stageId][axis].max ?? 100,
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
                Min: {ranges[stageId][axis].min?.toFixed(2) || 0} {unit}
              </Text>
              <Text size="sm" c="dimmed">
                Max: {ranges[stageId][axis].max?.toFixed(2) || 100} {unit}
              </Text>
            </Group>
          </Group>
          <RangeSlider
            color={getAxisColor(axis)}
            value={[
              ranges[stageId][axis].min ?? 0,
              ranges[stageId][axis].max ?? 100,
            ]}
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
                min={ranges[stageId][axis].min}
                max={ranges[stageId][axis].max}
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
