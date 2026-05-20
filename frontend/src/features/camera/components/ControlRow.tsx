import {
  Slider,
  Text,
  Button,
  Group,
  NumberInput,
  Box
} from "@mantine/core";
import { IconCaretLeftFilled, IconCaretRightFilled } from "@tabler/icons-react";


// slider componen with label and step size adjuster

interface ControlRowProps {
  label: string;
  value: number;
  displayValue: string;
  specs: { min: number; max: number; step: number };
  onSliderChange: (val: number) => void;
  onStepChange: (val: number) => void;
  stepDisplayValue?: string;
}
export const ControlRow = ({
  label,
  value,
  displayValue,
  specs,
  onSliderChange,
  onStepChange,
  stepDisplayValue,
}: ControlRowProps) => (
  <Group align="center" gap="xs" wrap="nowrap">
    <Text size="sm" w={70} style={{ flexShrink: 0 }}>
      {label}
    </Text>
    <Text size="sm" c="dimmed" w={55} style={{ flexShrink: 0, textAlign: "right" }}>
      {displayValue}
    </Text>
    <Box style={{ flex: 1 }}>
      <Slider
        value={value}
        onChange={onSliderChange}
        min={specs.min}
        max={specs.max}
        step={specs.step}
      />
    </Box>
    <NumberInput
      size="xs"
      w={120}
      value={stepDisplayValue ?? specs.step}
      hideControls
      prefix="Step: "
      style={{ flexShrink: 0 }}
      onChange={(val) => {
        if (typeof val === "number") onStepChange(val);
      }}
    />
    <Button
      size="xs"
      variant="default"
      px="xs"
      style={{ flexShrink: 0 }}
      onClick={() => onSliderChange(Math.max(value - specs.step, specs.min))}
    >
      <IconCaretLeftFilled size={14} />
    </Button>
    <Button
      size="xs"
      px="xs"
      style={{ flexShrink: 0 }}
      onClick={() => onSliderChange(Math.min(value + specs.step, specs.max))}
    >
      <IconCaretRightFilled size={14} />
    </Button>
  </Group>
);