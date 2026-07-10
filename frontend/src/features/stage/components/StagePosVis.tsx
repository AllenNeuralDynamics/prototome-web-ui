import { Card, Slider, Badge } from "@mantine/core";
import { getAxisColor } from "../utils/colorGrabber.tsx";
import { useStagePositionStore } from "@/stores/stagePositionStore.tsx";
import { useRPCData } from "@/lib/one-liner-router/call-rpc.ts";

type AxisCardProps = {
  axis: string;
  position: number;
  config: Record<string, string[]> | undefined;
  unit: string;
};

const AxisCard = ({ axis, position, config, unit }: AxisCardProps) => {
  // Hook - RPC Data
  // -------------------------------
  const { result: range } = useRPCData<number[]>("get_axis_travel_range", {
    axis: axis,
  });

  if (!range) return null;

  const [min, max] = range;

  return (
    <Card
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
        style={{ position: "absolute", top: 10, left: 10 }}
      >
        {axis.toUpperCase()}
      </Badge>
      <Slider
        color={getAxisColor(axis)}
        value={parseFloat(position.toFixed(3))}
        min={min}
        max={max}
        labelAlwaysOn
        marks={[
          { value: min, label: `Min: ${min} ${unit}` },
          { value: max, label: `Max: ${max} ${unit}` },
          ...Object.entries(config ?? {}).map(([key, value]) => ({
            value: Number(value),
            label: `${key}: ${value}`,
          })),
        ]}
        mt="70px"
        mb="30px"
        ml="-20px"
        mr="20px"
        styles={{
          label: {
            top: "calc(100% + 10px)",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          },
          bar: { backgroundColor: "transparent" },
          mark: { backgroundColor: getAxisColor(axis) },
          markLabel: {
            position: "absolute",
            transform: "rotate(-45deg)",
            transformOrigin: "bottom right",
            textAlign: "center",
            maxWidth: "55px",
            fontSize: 10,
            marginLeft: "0px",
            marginTop: "-60px",
          },
        }}
      />
    </Card>
  );
};

// StagePosVis: renders one AxisCard per axis.

export type StagePosVisProps = {
  stageId: string;
  axes: string[];
  config: Record<string, Record<string, string[]>> | null;
  unit?: string;
};

export const StagePosVis = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stageId,
  axes,
  config,
  unit = "mm",
}: StagePosVisProps) => {
  // Store State
  // -------------------------------
  const positions = useStagePositionStore((state) => state.positions);

  if (!axes.every((axis) => axis in positions)) return null;

  // TODO: Do we still need stageId

  return (
    <div>
      {axes.map((axis) => (
        <AxisCard
          key={axis}
          axis={axis}
          position={positions[axis]}
          config={config?.[axis]}
          unit={unit}
        />
      ))}
    </div>
  );
};
