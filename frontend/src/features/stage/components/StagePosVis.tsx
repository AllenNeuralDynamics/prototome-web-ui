import React, { useState, useEffect, useRef } from "react";
import { LineChart } from "@mantine/charts";
import { Card, Paper, Text, Title } from "@mantine/core";
import "@mantine/core/styles.css";
import { StageControlProps } from "../types/stageTypes.tsx";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/store.tsx";
import { getAxisColor } from "../utils/colorGrabber.tsx";

interface ChartTooltipProps {
  payload: Record<string, any>[] | undefined;
}

function ChartTooltip({ payload }: ChartTooltipProps) {
  if (!payload) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      {payload.map((item: any) => (
        <Text key={item.name} c={item.color} fz="sm">
          {item.name}: {item.value}
        </Text>
      ))}
    </Paper>
  );
}

export default function StagePosVis({
  stageId,
  axes,
  host,
  unit = "um",
}: StageControlProps) {
  const positions = useSelector((state: RootState) => state.positions.data);
  const positionsRef = useRef(positions);
  const [posSeries, setPosSeries] = useState<Array<Record<string, any>>>([]);

  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    function updatePosSeries() {
      const latest = { time: Date.now() };
      for (const axis of axes) {
        latest[axis] = positionsRef.current[stageId]?.[axis] ?? 0;
      }
      setPosSeries((prev) => {
        const next = [...prev, latest];
        return next.slice(-50); // only last 50
      });
    }
    const posSeriesPoll = setInterval(updatePosSeries, 500);
    return () => {
      clearInterval(posSeriesPoll);
    };
  }, [stageId, axes]);

  const stagePositions = positions[stageId] ?? {};
  if (!axes.every((axis) => axis in stagePositions))
    return <div> Cannot find positions to {stageId} </div>;

  return (
    <Card
      key={stageId}
      shadow="xs"
      padding="sm"
      radius="md"
      withBorder
      className="bg-gray-50"
    >
      <Title order={5} align="center" mb="sm" font="8rm">
        {stageId
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") + " Positions"}
      </Title>
      <LineChart
        h={300}
        data={posSeries}
        dataKey="time"
        xAxisProps={{ hide: true }}
        yAxisProps={{
          padding: { top: 30, bottom: 30 },
          tickMargin: 0,
          width: 30,
        }}
        tooltipProps={{
          content: ({ payload }) => <ChartTooltip payload={payload} />,
        }}
        legendProps={{ layout: "vertical" }}
        strokeWidth={4}
        series={axes.map((axis) => ({
          name: axis,
          color: getAxisColor(axis),
        }))}
        dotProps={{ r: 0 }}
      />
    </Card>
  );
}
