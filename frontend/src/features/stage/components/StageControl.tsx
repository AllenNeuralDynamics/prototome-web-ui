import React, { useState, useEffect, useRef } from "react";
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
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { useDataChannelStore } from "../../../stores/dataChannelStore.tsx";

export default function StageControl({
  stageId,
  axes,
  host,
  unit = "um",
}: StageControlProps) {
  const [velocities, setVelocities] = useState<Record<string, number>>({});
  const [posInput, setPosInput] = useState<Record<string, number>>({});
  const [stepSizeInput, setStepSizeInput] = useState<Record<string, number>>(
    {},
  );
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [ranges, setRanges] = useState<Record<string,  number[]>>({});
  const positionChannelRef = useRef<RTCDataChannel | null>(null);
  const rangeChannelRef = useRef<RTCDataChannel | null>(null);
  const velocityChannelRef = useRef<RTCDataChannel | null>(null);
  const dataChannels = useDataChannelStore((state) => state.channels)

  // initialize and negotiate webRTC
  useEffect(() => {

    // add position channel
    const positionChannel = dataChannels[`prototome_stage_positions`]
    // update pos upon message
    const handlePosMessage = (evt: MessageEvent) => {
      const pos = JSON.parse(evt.data);
      setPositions((prev) => ({ ...prev, ...pos }));
  };
    positionChannel.addEventListener('message', handlePosMessage)
    // create reference
    positionChannelRef.current = positionChannel;

    // add range channel
    const rangeChannel = dataChannels[`prototome_stage_travel`];
    // update range upon message
    const handleRangeMessage = (evt: MessageEvent) => {
      const range = JSON.parse(evt.data);
      setRanges((prev) => ({ ...prev, ...range }));
    }
    rangeChannel.addEventListener('message', handleRangeMessage)
    // create reference
    rangeChannelRef.current = rangeChannel;

    // add velocity channel
    const velocityChannel = dataChannels[`prototome_stage_velocities`];
    // update range upon message
    const handleVelocityMessage = (evt: MessageEvent) => {
      console.log("message")
      const velocity = JSON.parse(evt.data);
      setVelocities((prev) => ({ ...prev, ...velocity }));
    }

    velocityChannel.addEventListener('message', handleVelocityMessage)
    // create reference
    velocityChannelRef.current = velocityChannel;  

    return () => {
      positionChannel.close();
      rangeChannel.close();
      velocityChannel.close()
    };
  }, []);

  const onPosRangeChange = (range: [number, number], axis: string) => {
    const position = positions[axis];

    // Clamp range so it must contain current position
    const clampedMin = Math.min(range[0], position);
    const clampedMax = Math.max(range[1], position);

    if (
      rangeChannelRef.current &&
      (clampedMin !== ranges[axis][0] ||
      clampedMax !== ranges[axis][1])
    ) {
      const newRange = [clampedMin, clampedMax];
      setRanges((prev) => ({ ...prev, [axis]: newRange}));
      // send updated ranges to backend
      rangeChannelRef.current.send(
        JSON.stringify({
          destination: "range",
          stage_id: stageId,
          axis: axis,
          value: newRange
        }),
      );
    }
    };
  

  const onMoveLowerClick = (axis: string) => {
    if (positionChannelRef.current) {
      positionChannelRef.current.send(
        JSON.stringify({
          destination: "position",
          stage_id: stageId,
          axis: axis,
          value: ranges[axis][0],
        }))
      }
  };

  const onMoveUpperClick = (axis: string) => {
    if (positionChannelRef.current) {
      positionChannelRef.current.send(
        JSON.stringify({
          destination: "position",
          stage_id: stageId,
          axis: axis,
          value: ranges[axis][1],
        }))
      }
  };

  const onMoveMiddleClick = (axis: string) => {
    if (positionChannelRef.current) {
      positionChannelRef.current.send(
        JSON.stringify({
          destination: "position",
          stage_id: stageId,
          axis: axis,
          value: Math.round((ranges[axis][0] + ranges[axis][1]) / 2),
        }))
      }
  };
  const onMoveClick = (val: number, axis: string) => {
    if (positionChannelRef.current) {
      positionChannelRef.current.send(
        JSON.stringify({
          destination: "position",
          stage_id: stageId,
          axis: axis,
          value: val,
        }))
      }
  };

  const stagePositions = positions ?? {};
  if (!axes.every((axis) => axis in stagePositions))
    return <div> Cannot find positions to {stageId} </div>;

  const stageRanges = ranges ?? {};
  if (!axes.every((axis) => axis in stageRanges))
    return <div> Cannot find ranges for {stageId} </div>;

  const stageVelocities = velocities ?? {};
  if (!axes.every((axis) => axis in stageVelocities))
    return <div> Cannot find velocities for {stageId} </div>;

  return (
    <div>
      {axes.map((axis, index) => (
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
                value: ranges[axis][0] ?? 0,
                label: "",
              },
              {
                value: ranges[axis][1] ?? 100,
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
                Min: {ranges[axis][0]?.toFixed(2) || 0} {unit}
              </Text>
              <Text size="sm" c="dimmed">
                Max: {ranges[axis][1]?.toFixed(2) || 100} {unit}
              </Text>
            </Group>
          </Group>
          <RangeSlider
            color={getAxisColor(axis)}
            value={[ranges[axis][0] ?? 0, ranges[axis][1] ?? 100]}
            minRange={0}
            onChange={(val) => onPosRangeChange(val, axis)}
          />
          <Group mb="xs" style={{ marginTop: "10px" }}>
            <Text size="sm">Velocity</Text>
            <Text size="sm" c="dimmed">
              {velocities[axis]?.toFixed(2) || 0}
            </Text>
          </Group>
          <Slider
            color={getAxisColor(axis)}
            value={velocities[axis] || 0}
            onChange={(val) => {
              console.log(velocityChannelRef.current)
              if (velocityChannelRef.current) {
                setVelocities((prev) => ({ ...prev, [axis]:val }));
                velocityChannelRef.current.send(
                  JSON.stringify({
                    destination: "velocity",
                    stage_id: stageId,
                    axis: axis,
                    value: val,
                  }),
                );
              }
            }}
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
                min={ranges[axis][0]}
                max={ranges[axis][1]}
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
