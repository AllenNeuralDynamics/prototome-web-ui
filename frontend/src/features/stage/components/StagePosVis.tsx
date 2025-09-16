import React, { useState, useEffect, useRef } from "react";
import { Card, Slider, Badge } from "@mantine/core";
import "@mantine/core/styles.css";
import { StagePosVisProps } from "../types/stageTypes.tsx";
import { useSelector, useStore } from "react-redux";
import { RootState } from "../../../stores/store.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { negotiate } from "../../../utils/webRtcConnection.tsx";

export default function StagePosVis({
  stageId,
  axes,
  config,
  unit = "mm",
}: StagePosVisProps) {
  const [positions, setPositions] = useState({})
  const [ranges, setRanges] = useState({})
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const positionChannelRef = useRef<RTCDataChannel | null>(null)
  const rangeChannelRef = useRef<RTCDataChannel | null>(null)

  // initialize and negotiate webRTC 
  useEffect(() => {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
        
      // add any dataChannels
      const positionChannel = pcRef.current.createDataChannel(`position_${stageId}`);
      positionChannel.onmessage = (evt) => {
          const pos = JSON.parse(evt.data)
          setPositions(prev => ({...prev, ...pos}));
      }
      positionChannel.onopen = (evt) => {
        initializeStage()
    }
      positionChannelRef.current = positionChannel
  
      const rangeChannel = pcRef.current.createDataChannel(`range_${stageId}`);
      rangeChannelRef.current = rangeChannel 
      
      // negotiate sbd and ice with peer connection
      negotiate(pc, stageId)
  
      return () => {
        pc.close();
        positionChannel.close()
        rangeChannel.close()  
      };
    }, []); 

  // initialize stage positions
  function initializeStage () {
    if (positionChannelRef.current){
    for (const axis of axes){
      positionChannelRef.current.send(JSON.stringify({"destination": "position", "stage_id": stageId, "axis": axis}))
    }}
  }; 

  const stagePositions = positions ?? {};
  if (!axes.every((axis) => axis in stagePositions))
    return <div> Cannot find positions to {stageId} </div>;

  return (
    <div>
      {Object.entries(positions).map(([axis, value]) => (
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
              // {
              //   value: ranges[stageId][axis].min ?? 0,
              //   label: `Min:  ${ranges[stageId][axis].min} ${unit}`,
              // },
              // {
              //   value: ranges[stageId][axis].max ?? 100,
              //   label: `Max: ${ranges[stageId][axis].max} ${unit}`,
              // },
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
