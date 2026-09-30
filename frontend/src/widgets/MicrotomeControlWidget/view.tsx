import type { ResourcesForContract } from "@/widgets/framework";
import { ControlRow } from "@/widgets/MicrotomeControlWidget/ControlRow";
import "@/widgets/MicrotomeControlWidget/assets/rjsf-spacing.css";
import {
  prototomeSchema,
  uiPrototomeSchema,
} from "@/widgets/MicrotomeControlWidget/PrototomeConfigTypes";
import { getAxisColor } from "@/utils/colorGrabber";
import type { AppConfig } from "@/types/configTypes";
import type { PrototomeConfig } from "@/types/prototomeConfig";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  FileButton,
  Group,
  Slider,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Form from "@rjsf/mantine";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { MicrotomeControlWidgetContract } from "./contract";

type Resources = ResourcesForContract<typeof MicrotomeControlWidgetContract>;
type AxisVariableMapping = AppConfig["axis_variable_mapping"];
type VisConfig = Record<string, Record<string, unknown>>;

export type MicrotomeControlWidgetProps = Resources & {
  instanceId: string;
  axes: string[];
  unit?: string;
  // Maps each prototome stage axis to the config keys shown as markers on its slider.
  axisVariableMapping: AxisVariableMapping;
};

// Backend schemas are untyped, so narrow here.
const asNumber = (value: unknown) =>
  typeof value === "number" ? value : undefined;

const buildVisConfig = (
  axes: string[],
  prototomeConfig: PrototomeConfig,
  axisVariableMapping: AxisVariableMapping,
): VisConfig =>
  Object.fromEntries(
    axes.map((axis) => {
      const [ptStage, ...rest] = prototomeConfig.axis_map[axis].split(".");
      const cfgKeys = axisVariableMapping[ptStage][rest.join(".")];
      return [
        axis,
        Object.fromEntries(cfgKeys.map((key) => [key, prototomeConfig[key]])),
      ];
    }),
  );

export const MicrotomeControlWidgetView = ({
  axes,
  unit = "mm",
  axisVariableMapping,
  getPrototomeConfig,
  setPrototomeConfig,
  prototomeState,
  startCutting,
  cutOne,
  stopCuttingSafely,
  stopCuttingNow,
  cameraPrototome: { ref: cameraVideoRef },
  startLivestream,
  stopLivestream,
  getExposure,
  getExposureMax,
  getExposureMin,
  getExposureStep,
  getGain,
  getGainMax,
  getGainMin,
  getGainStep,
  setExposure,
  setGain,
  stagePositions,
  getAxisTravelRanges,
}: MicrotomeControlWidgetProps) => {
  // Local state
  // -------------------------------
  const [exposureOverride, setExposureOverride] = useState<number | null>(null);
  const [gainOverride, setGainOverride] = useState<number | null>(null);
  const [exposureStepOverride, setExposureStepOverride] = useState<
    number | null
  >(null);
  const [gainStepOverride, setGainStepOverride] = useState<number | null>(null);
  // Set by file load or submit; otherwise the backend config is used.
  const [localConfig, setLocalConfig] = useState<PrototomeConfig | null>(null);

  // Derived values
  // -------------------------------
  const prototomeConfig =
    localConfig ?? (getPrototomeConfig.data as PrototomeConfig | undefined);
  const visConfig = prototomeConfig
    ? buildVisConfig(axes, prototomeConfig, axisVariableMapping)
    : null;

  // prototome_state messages are [timestamp, state].
  const currentState = String(
    (prototomeState.data as unknown[] | null)?.[1] ?? "Paused",
  );

  const exposure = exposureOverride ?? asNumber(getExposure.data) ?? 0;
  const gain = gainOverride ?? asNumber(getGain.data) ?? 0;
  const exposureSpecs = {
    min: asNumber(getExposureMin.data) ?? 0,
    max: asNumber(getExposureMax.data) ?? 0,
    step: exposureStepOverride ?? asNumber(getExposureStep.data) ?? 0,
  };
  const gainSpecs = {
    min: asNumber(getGainMin.data) ?? 0,
    max: asNumber(getGainMax.data) ?? 0,
    step: gainStepOverride ?? asNumber(getGainStep.data) ?? 0,
  };

  const positions =
    (stagePositions.data as Record<string, number> | null) ?? {};
  const ranges = getAxisTravelRanges.data as
    | Record<string, number[]>
    | undefined;
  const hasAllPositions = axes.every((axis) => axis in positions);

  // Handlers
  // -------------------------------
  const onExposureChange = (value: number) => {
    setExposureOverride(value);
    setExposure.call({ value });
  };
  const onGainChange = (value: number) => {
    setGainOverride(value);
    setGain.call({ value });
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Group
        style={{ gap: "2rem", justifyContent: "center", width: "100%" }}
        align="center"
      >
        {/* State control */}
        <Stack align="stretch">
          <PrototomeConfigCard
            config={prototomeConfig}
            onConfigChange={setLocalConfig}
            setPrototomeConfig={setPrototomeConfig}
          />
          <Card
            w="100%"
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ maxWidth: "450px", margin: "auto" }}
          >
            <Stack>
              <Group>
                <Text size="sm">Current State:</Text>
                <Badge color="green" variant="light">
                  {currentState}
                </Badge>
              </Group>
              <Stack>
                <Button>Switch to Facing</Button>
                <Button color="green" onClick={() => startCutting.call({})}>
                  Start Cutting
                </Button>
                <Button color="yellowgreen">Repeat Cut</Button>
                <Button color="yellow" onClick={() => cutOne.call({})}>
                  Cut One
                </Button>
                <Button
                  color="orange"
                  onClick={() => stopCuttingSafely.call({})}
                >
                  Stop Cutting Safely
                </Button>
                <Button color="red" onClick={() => stopCuttingNow.call({})}>
                  Stop Cutting Now
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Stack>

        <Stack align="stretch">
          {/* Camera */}
          <Card
            shadow="xs"
            padding="md"
            radius="md"
            withBorder
            className="bg-gray-50"
          >
            <Card.Section>
              <video
                ref={cameraVideoRef}
                muted
                autoPlay
                playsInline
                width={768}
                height={576}
                style={{ border: "1px solid black" }}
              />
            </Card.Section>

            <Group mt="sm" mb="xs" gap="xs">
              <Button
                size="xs"
                variant="light"
                onClick={() => startLivestream.call({})}
              >
                Start
              </Button>
              <Button size="xs" onClick={() => stopLivestream.call({})}>
                Stop
              </Button>
            </Group>

            <Divider mb="sm" />

            <ControlRow
              label="Exposure"
              value={exposure}
              displayValue={String(exposure)}
              specs={exposureSpecs}
              onSliderChange={onExposureChange}
              onStepChange={setExposureStepOverride}
            />
            <Box mt="sm">
              <ControlRow
                label="Gain"
                value={gain}
                displayValue={gain.toFixed(2)}
                specs={gainSpecs}
                onSliderChange={onGainChange}
                onStepChange={setGainStepOverride}
              />
            </Box>
          </Card>

          {/* Stage positions */}
          {hasAllPositions && (
            <div>
              {axes.map((axis) => (
                <AxisCard
                  key={axis}
                  axis={axis}
                  range={ranges?.[axis]}
                  position={positions[axis]}
                  config={visConfig?.[axis]}
                  unit={unit}
                />
              ))}
            </div>
          )}
        </Stack>
      </Group>
    </div>
  );
};

// --------------------------------------------------------------------------------
//  Prototome config form
// --------------------------------------------------------------------------------

type PrototomeConfigCardProps = Pick<Resources, "setPrototomeConfig"> & {
  config: PrototomeConfig | undefined;
  onConfigChange: (config: PrototomeConfig) => void;
};

const PrototomeConfigCard = ({
  config,
  onConfigChange,
  setPrototomeConfig,
}: PrototomeConfigCardProps) => {
  // Effects
  // -------------------------------
  // revert blue edited fields when user presses enter on form
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") clearEditedFields();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handlers
  // -------------------------------
  const handleChange = () => {
    const activeEl = document.activeElement as HTMLInputElement | null;
    activeEl?.classList.add("edited-field");
  };

  const loadConfig = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") return;
        const parsedData = JSON.parse(result);
        const loaded = parsedData?.prototome_config || parsedData;
        const validate = validator.ajv.compile<PrototomeConfig>(prototomeSchema);
        if (!validate(loaded)) throw new Error("Loaded json is not valid");
        onConfigChange(loaded);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  if (!config) return null;

  return (
    <Card
      shadow="xs"
      padding="md"
      radius="md"
      withBorder
      className="bg-gray-50"
    >
      <div className="prototome-config-form">
        <Title style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          Prototome Config
        </Title>
        <Form
          uiSchema={uiPrototomeSchema}
          schema={prototomeSchema}
          validator={validator}
          formData={config}
          onChange={handleChange}
          onSubmit={(form) => {
            setPrototomeConfig.call({ value: form.formData });
            onConfigChange(form.formData);
            clearEditedFields();
          }}
        >
          <Button m="xs" type="submit">
            Submit
          </Button>
          <FileButton onChange={loadConfig} accept="json">
            {(props) => <Button {...props}>Load Config</Button>}
          </FileButton>
        </Form>
      </div>
    </Card>
  );
};

const clearEditedFields = () => {
  document
    .querySelectorAll(".edited-field")
    .forEach((el) => el.classList.remove("edited-field"));
};

// --------------------------------------------------------------------------------
//  Axis position card
// --------------------------------------------------------------------------------

type AxisCardProps = {
  axis: string;
  position: number;
  range: number[] | undefined;
  config: Record<string, unknown> | undefined;
  unit: string;
};

const AxisCard = ({ axis, position, range, config, unit }: AxisCardProps) => {
  const [min, max] = range ?? [0, 0];
  const color = getAxisColor(axis);
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
        color={color}
        variant="filled"
        className="w-16 text-center"
        style={{ position: "absolute", top: 10, left: 10 }}
      >
        {axis.toUpperCase()}
      </Badge>
      <Slider
        color={color}
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
          mark: { backgroundColor: color },
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
