import React, { useState, useEffect, useRef } from "react";
import { Card, Slider, Badge } from "@mantine/core";
import "@mantine/core/styles.css";
import { StagePosVisProps } from "../types/stageTypes.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";

export default function StagePosVis({
  stageId,
  axes,
  config, 
  unit = "mm",
}: StagePosVisProps) {
  const positions = useSelector((state: RootState) => state.positions.data);
  const ranges = useSelector((state: RootState) => state.range.data);

  const stagePositions = positions[stageId] ?? {};
  if (!axes.every((axis) => axis in stagePositions))
    return <div> Cannot find positions to {stageId} </div>;

  const stageRanges = ranges[stageId] ?? {};
  if (!axes.every((axis) => axis in stageRanges))
    return <div> Cannot find ranges to {stageId} </div>;
  
  return (
    <div>
      {Object.entries(positions[stageId]).map(([axis, value]) => (
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
          >
            {axis.toUpperCase()}
          </Badge>
          <Slider
            color={getAxisColor(axis)}
            value={positions[stageId][axis]}
            labelAlwaysOn
            marks={[
              {
                value: ranges[stageId][axis].min ?? 0,
                label: `Min: ${ranges[stageId][axis].min} ${unit}`,
              },
              {
                value: ranges[stageId][axis].max ?? 100,
                label:`Max: ${ranges[stageId][axis].max} ${unit}`,
              },
              ...Object.entries(config[axis]).map(([key, value]) => ({
                value: Number(value),
                label: `${key}: ${value}`,
              })),
            ]}
            style={{ marginTop: "30px" }}
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
                marginLeft:"0px",
                marginTop: "-60px", // lift above track
              }
            }}
          />
        </Card>
      ))}
    </div>
  );
}
