import React, { useState, useEffect, useRef } from "react";
import { Card, Slider, Badge } from "@mantine/core";
import "@mantine/core/styles.css";
import { StagePosVisProps } from "../types/stageTypes.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { negotiate } from "../../../utils/webRtcConnection.tsx";

export default function StagePosVis({
  stageId,
  axes,
  config,
  unit = "mm",
}: StagePosVisProps) {
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [ranges, setRanges] = useState<Record<string,  number[]>>({});
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const positionChannelRef = useRef<RTCDataChannel | null>(null);
  const rangeChannelRef = useRef<RTCDataChannel | null>(null);

  // initialize and negotiate webRTC
  useEffect(() => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // add any dataChannels

    // add position channel
    const positionChannel = pcRef.current.createDataChannel(
      `prototome_stage_positions`,
    );
    // positionChannel.onopen = (evt) => {
    //   // initialize stage upon channel opening
    //   initializeStagePosition();
    // };
    positionChannel.onmessage = (evt) => {
      // update positions upon message
      const pos = JSON.parse(evt.data);
      setPositions((prev) => ({ ...prev, ...pos }));
    };
    positionChannelRef.current = positionChannel;

    // add range channel
    const rangeChannel = pcRef.current.createDataChannel(`prototome_stage_travel`);
    // rangeChannel.onopen = (evt) => {
    //   // initialize stage upon channel opening
    //   initializeStageRange();
    // };
    rangeChannel.onmessage = (evt) => {
      // update range upon message
      const range = JSON.parse(evt.data);
      setRanges((prev) => ({ ...prev, ...range }));
    };
    rangeChannelRef.current = rangeChannel;

    // negotiate sbd and ice with peer connection
    negotiate(pc, stageId);

    return () => {
      pc.close();
      positionChannel.close();
      rangeChannel.close();
    };
  }, []);

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
            value={positions[axis]}
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
