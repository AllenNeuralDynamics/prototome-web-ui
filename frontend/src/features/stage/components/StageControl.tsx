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
import { negotiate } from "../../../utils/webRtcConnection.tsx";

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
  const [ranges, setRanges] = useState({});
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const positionChannelRef = useRef<RTCDataChannel | null>(null);
  const rangeChannelRef = useRef<RTCDataChannel | null>(null);
  const velocityChannelRef = useRef<RTCDataChannel | null>(null);

  // initialize and negotiate webRTC
  useEffect(() => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // add position channel
    const positionChannel = pcRef.current.createDataChannel(
      `position_${stageId}`,
    );
    positionChannel.onopen = (evt) => {
      // initialize position upon channel opening
      initializeStagePosition();
    };
    positionChannel.onmessage = (evt) => {
      // update positions upon message
      const pos = JSON.parse(evt.data);
      setPositions((prev) => ({ ...prev, ...pos }));
    };
    positionChannelRef.current = positionChannel;

    // add range channel
    const rangeChannel = pcRef.current.createDataChannel(`range_${stageId}`);
    rangeChannel.onopen = (evt) => {
      // initialize range upon channel opening
      initializeStageRange();
    };
    rangeChannel.onmessage = (evt) => {
      // update range upon message
      const range = JSON.parse(evt.data);
      setRanges((prev) => ({ ...prev, ...range }));
    };
    rangeChannelRef.current = rangeChannel;

    // add velocity channel
    const velocityChannel = pcRef.current.createDataChannel(
      `velocity_${stageId}`,
    );
    velocityChannel.onopen = (evt) => {
      // initialize velocity upon channel opening
      initializeStageVelocity();
    };
    velocityChannel.onmessage = (evt) => {
      // update velocity upon message
      const velocity = JSON.parse(evt.data);
      setVelocities((prev) => ({ ...prev, ...velocity }));
    };
    velocityChannelRef.current = velocityChannel;

    // negotiate sbd and ice with peer connection
    negotiate(pc, stageId);

    return () => {
      pc.close();
      positionChannel.close();
      rangeChannel.close();
    };
  }, []);

  // initialize stage positions
  function initializeStagePosition() {
    if (positionChannelRef.current) {
      for (const axis of axes) {
        positionChannelRef.current.send(
          JSON.stringify({
            destination: "position",
            stage_id: stageId,
            axis: axis,
          }),
        );
      }
    }
  }

  // initialize stage range
  function initializeStageRange() {
    if (rangeChannelRef.current) {
      for (const axis of axes) {
        rangeChannelRef.current.send(
          JSON.stringify({
            destination: "range",
            stage_id: stageId,
            axis: axis,
          }),
        );
      }
    }
  }

  // initialize stage velocity
  function initializeStageVelocity() {
    if (velocityChannelRef.current) {
      for (const axis of axes) {
        velocityChannelRef.current.send(
          JSON.stringify({
            destination: "velocity",
            stage_id: stageId,
            axis: axis,
          }),
        );
      }
    }
  }

  const onPosRangeChange = (range: [number, number], axis: string) => {
    const position = positions[axis];

    // Clamp range so it must contain current position
    const clampedMin = Math.min(range[0], position);
    const clampedMax = Math.max(range[1], position);

    if (
      rangeChannelRef.current &&
      (clampedMin !== ranges[axis].min ||
      clampedMax !== ranges[axis].max)
    ) {
      const newRange = { min: clampedMin, max: clampedMax };
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
          value: ranges[axis].min,
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
          value: ranges[axis].max,
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
          value: Math.round((ranges[axis].min + ranges[axis].max) / 2),
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
                value: ranges[axis].min ?? 0,
                label: "",
              },
              {
                value: ranges[axis].max ?? 100,
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
                Min: {ranges[axis].min?.toFixed(2) || 0} {unit}
              </Text>
              <Text size="sm" c="dimmed">
                Max: {ranges[axis].max?.toFixed(2) || 100} {unit}
              </Text>
            </Group>
          </Group>
          <RangeSlider
            color={getAxisColor(axis)}
            value={[ranges[axis].min ?? 0, ranges[axis].max ?? 100]}
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
                min={ranges[axis].min}
                max={ranges[axis].max}
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
