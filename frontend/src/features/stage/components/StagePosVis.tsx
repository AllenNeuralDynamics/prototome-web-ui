import React, { useState, useEffect, useRef } from "react";
import { LineChart } from "@mantine/charts";
import { Card, Paper, Text, Title, Slider } from "@mantine/core";
import "@mantine/core/styles.css";
import { StageControlProps } from "../types/stageTypes.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";

export default function StagePosVis({
  stageId,
  axes,
  host,
  unit = "um",
}: StageControlProps) {
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
              <Slider
                color={getAxisColor(axis)}
                value={positions[stageId][axis]}
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
          ))}
          </div> 
  );
}
