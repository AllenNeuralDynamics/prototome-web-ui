import { useState, useEffect, useRef } from "react";
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
import type { StageControlProps } from "../types/stageTypes.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { useDataChannelStore } from "../../../stores/dataChannelStore.tsx";
import { stageApi } from "../api/stageApi.tsx";

export const StageControl = ({
  stageId,
  axes,
  unit = "um",
}: StageControlProps) => {
  const [velocities, setVelocities] = useState<Record<string, number>>({});
  const [maxVelocities, setMaxVelocities] = useState<Record<string, number>>({});
  const [posInput, setPosInput] = useState<Record<string, number>>({});
  const [stepSizeInput, setStepSizeInput] = useState<Record<string, number>>(
    {},
  );
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [ranges, setRanges] = useState<Record<string, number[]>>({});
  const positionChannelRef = useRef<RTCDataChannel | null>(null);
  const dataChannels = useDataChannelStore((state) => state.channels);

  // initialize and connect position dataChannel
  useEffect(() => {
    // add position channel
    const positionChannel = dataChannels[`prototome_stage_positions`];
    // update pos upon message
    const handlePosMessage = (evt: MessageEvent) => {
      const pos = JSON.parse(evt.data);
      setPositions((prev) => ({ ...prev, ...pos }));
    };
    positionChannel.addEventListener("message", handlePosMessage);
    // create reference
    positionChannelRef.current = positionChannel;

    return () => {
      positionChannel.removeEventListener("message", handlePosMessage);
    };
  }, [dataChannels]);

  // populate range and velocity
    useEffect(() => {
      async function fetchAxisSpecs() {

        for (const axis of axes) {
          const [ vel, maxVel, range] = await Promise.all([
                  stageApi.getVelocity(stageId, axis),
                  stageApi.getMaxVelocity(stageId, axis),
                  stageApi.getRange(stageId, axis),
                ]);
          setVelocities((prev) => ({...prev, ...{[axis]:vel}}))
          setMaxVelocities((prev) => ({...prev, ...{[axis]:maxVel}}))
          setRanges((prev) => ({...prev, ...{[axis]:range}}))
        }
      }
    fetchAxisSpecs()
    }, []);
  
  // Stub out functionality for now
  // const onPosRangeChange = (range: [number, number], axis: string) => {
  //   const position = positions[axis];

  //   // Clamp range so it must contain current position
  //   const clampedMin = Math.min(range[0], position);
  //   const clampedMax = Math.max(range[1], position);

  //   if (
  //     (clampedMin !== ranges[axis][0] || clampedMax !== ranges[axis][1])
  //   ) {
  //     const newRange = [clampedMin, clampedMax];
  //     setRanges((prev) => ({ ...prev, [axis]: newRange }));
  //     stageApi.postRange(stageId, axis, newRange)
      
  //   }
  // };

  const onMoveLowerClick = (axis: string) => {
    stageApi.postPosition(stageId, axis, ranges[axis][0])
  };

  const onMoveUpperClick = (axis: string) => {
    stageApi.postPosition(stageId, axis, ranges[axis][1])
  };

  const onMoveMiddleClick = (axis: string) => {
    stageApi.postPosition(stageId, axis, Math.round((ranges[axis][0] + ranges[axis][1]) / 2))
  };
  const onMoveClick = (val: number, axis: string) => {
    stageApi.postPosition(stageId, axis, val)
  };
  
  const stagePositions = positions ?? {};
  if (!axes.every((axis) => axis in stagePositions)) return;

  const stageRanges = ranges ?? {};
  if (!axes.every((axis) => axis in stageRanges)) return;

  const stageVelocities = velocities ?? {};
  if (!axes.every((axis) => axis in stageVelocities)) return;

  return (
    <div>
      {axes.map((axis) => (
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
            value={parseFloat(positions[axis].toFixed(3))}
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
              stageApi.postVelocity(stageId, axis, val)
            
            }}
            max={maxVelocities[axis]}
          />
          <Group mt="md">
            <Button
              color={getAxisColor(axis)}
              variant="light"
              onClick={() => onMoveLowerClick(axis)}
            >
              Go to Lower
            </Button>
            <Button
              color={getAxisColor(axis)}
              onClick={() => onMoveMiddleClick(axis)}
            >
              Go to Middle
            </Button>
            <Button
              color={getAxisColor(axis)}
              variant="light"
              onClick={() => onMoveUpperClick(axis)}
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
