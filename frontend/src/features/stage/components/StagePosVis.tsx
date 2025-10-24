import React, { useState, useEffect, useRef } from "react";
import { Card, Slider, Badge } from "@mantine/core";
import "@mantine/core/styles.css";
import { StagePosVisProps } from "../types/stageTypes.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { useDataChannelStore } from "../../../stores/dataChannelStore.tsx";

export default function StagePosVis({
  stageId,
  axes,
  config,
  unit = "mm",
}: StagePosVisProps) {
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [ranges, setRanges] = useState<Record<string,  number[]>>({});
  const positionChannelRef = useRef<RTCDataChannel | null>(null);
  const rangeChannelRef = useRef<RTCDataChannel | null>(null);
  const dataChannels = useDataChannelStore((state) => state.channels)
  

  // access stored dataChannels and add message handlers 
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

    return () => {
      positionChannel.close();
      rangeChannel.close();
    };
  }, [dataChannels]);

  const stagePositions = positions ?? {};
  if (!axes.every((axis) => axis in stagePositions))
    return <div> Cannot find positions to {stageId} </div>;

  const stageRanges = ranges ?? {};
  if (!axes.every((axis) => axis in stageRanges))
    return <div> Cannot find ranges for {stageId} </div>;
  return (
    <div>
      {axes.map((axis, index) => (
        <Card
          key={axis}
          shadow="xs"
          padding="xl"
          radius="md"
          withBorder
          className="bg-gray-50"
        >
          <Badge
            size="lg"
            color={getAxisColor(axis)}
            variant="filled"
            className="w-16 text-center"
            style={{
              position: "absolute",
              top: 10,
              left: 10,
            }}
          >
            {axis.toUpperCase()}
          </Badge>
          <Slider
            color={getAxisColor(axis)}
            value={parseFloat(positions[axis].toFixed(3))}
            labelAlwaysOn
            marks={[
              {
                value: ranges[axis][0] ?? 0,
                label: `Min:  ${ranges[axis][0]} ${unit}`,
              },
              {
                value: ranges[axis][1] ?? 100,
                label: `Max: ${ranges[axis][1]} ${unit}`,
              },
              ...Object.entries(config[axis]).map(([key, value]) => ({
                value: Number(value),
                label: `${key}: ${value}`,
              })),
            ]}
            mt="70px"
            mb="-15px"
            ml="-20px"
            mr="20px"
            styles={{
              bar: { backgroundColor: "transparent" },
              mark: {
                backgroundColor: getAxisColor(axis),
              },
              markLabel: {
                position: "absolute",
                transform: "rotate(-45deg)",
                transformOrigin: "bottom right",
                textAlign: "center",
                maxWidth: "55px",
                fontSize: 10,
                marginLeft: "0px",
                marginTop: "-60px", // lift above track
              },
            }}
          />
        </Card>
      ))}
    </div>
  );
}
