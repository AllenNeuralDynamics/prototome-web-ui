import type { ResourcesForContract } from "@/widgets/framework";
import { RefPointPlus } from "@/widgets/WaferCalibrationWidget/RefPoints";
import type {
  Aperture,
  ApertureStatus,
  NavigatorData,
  RefPointStatus,
  Wafer,
} from "@/widgets/WaferCalibrationWidget/wafer";
import { useDisclosure } from "@mantine/hooks";
import { Button, Group, Popover, Select, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WaferCalibrationWidgetContract } from "./contract";

type Resources = ResourcesForContract<typeof WaferCalibrationWidgetContract>;

export type WaferCalibrationWidgetProps = Resources & {
  instanceId: string;
};

export const WaferCalibrationWidgetView = ({
  waferData,
  navigatorData,
  calibrate,
  setWorldRefpoint,
  updateApertureStatus,
  removeAperture,
}: WaferCalibrationWidgetProps) => {
  // Local state
  // -------------------------------
  const [reference, setReference] = useState<string>("origin");

  // Derived values
  // -------------------------------
  // Backend schemas are untyped, so narrow here.
  const navigator = navigatorData.data as NavigatorData | null;

  const wafer = useMemo(() => {
    if (!waferData.data) return undefined;
    const state = waferData.data as Omit<Wafer, "refpoints">;
    const refpoints: Record<string, RefPointStatus> = {};
    for (const [id, pos] of Object.entries(state.refpoint)) {
      refpoints[id] = {
        position: pos,
        status: state.refpoint_world[id] !== undefined,
      };
    }
    return { ...state, refpoints } as Wafer;
  }, [waferData.data]);

  const aperturesSignature = useMemo(() => {
    if (!wafer) return null;
    return JSON.stringify(
      Object.entries(wafer.apertures).sort(([a], [b]) => a.localeCompare(b)),
    );
  }, [wafer]);

  // Handlers
  // -------------------------------
  function handleReferenceChange(value: string | null) {
    if (value !== null) setReference(value);
  }

  if (wafer === undefined) return null;

  return (
    <Stack gap="xs">
      <Group gap="xs">
        {/** TODO: investigate, what does crosshair look like, would need to overlay over camera */}
        <Button size="compact-xs">Toggle Camera Crosshair</Button>
        <Button
          size="compact-xs"
          onClick={() => calibrate.callAsync({})}
          loading={calibrate.isLoading}
        >
          Calibrate Wafer
        </Button>
      </Group>
      <Group gap="xs">
        <Text size="xs">Reference: </Text>
        <Select
          size="xs"
          data={["origin", "end", "ref"]}
          defaultValue={reference}
          onChange={handleReferenceChange}
          allowDeselect={false}
        />
        <Text size="xs">
          at ({navigator?.current_position.X}, {navigator?.current_position.Y},{" "}
          {navigator?.current_position.Z})
        </Text>
        <Button
          size="compact-xs"
          onClick={() => setWorldRefpoint.callAsync({ key: reference })}
          loading={setWorldRefpoint.isLoading}
        >
          Set
        </Button>
      </Group>
      <Group gap="xs">
        <Text size="xs">Wafer Status: </Text>
        <Text size="xs">{wafer.status}</Text>
        <Text size="xs">Wafer Calibration Status: </Text>
        <Text size="xs">{wafer.calibration_status}</Text>
      </Group>
      <WaferMap
        wafer={wafer}
        nextApertureId={navigator?.next_aperture_id}
        refreshKey={aperturesSignature ?? "initial"}
        updateApertureStatus={updateApertureStatus}
        removeAperture={removeAperture}
      />
    </Stack>
  );
};

// --------------------------------------------------------------------------------
//  Wafer map
// --------------------------------------------------------------------------------

type ApertureActions = Pick<
  Resources,
  "updateApertureStatus" | "removeAperture"
>;

type WaferMapProps = ApertureActions & {
  wafer: Wafer;
  nextApertureId: string | undefined;
  refreshKey: string;
};

const WaferMap = ({
  wafer,
  nextApertureId,
  refreshKey,
  updateApertureStatus,
  removeAperture,
}: WaferMapProps) => {
  // Aperture settings, this is later used to determine width of plus symbol for ref points
  const radius = 5;

  // Padding around outermost SVG elements
  const padding = 1;

  // Calculating viewbox dimensions to fit all apertures + reference points
  const positions = [
    ...Object.values(wafer.refpoints).map((a) => a.position),
    ...Object.values(wafer.apertures).map((a) => a.centroid),
  ];

  const minX = Math.min(...positions.map((p) => p[0]));
  const minY = Math.min(...positions.map((p) => p[1]));
  const maxX = Math.max(...positions.map((p) => p[0]));
  const maxY = Math.max(...positions.map((p) => p[1]));

  const viewMinX = minX - radius - padding;
  const viewMinY = minY - radius - padding;
  const viewWidth = maxX - minX + radius * 2 + padding * 2;
  const viewHeight = maxY - minY + radius * 2 + padding * 2;

  return (
    <>
      <div style={{ fontSize: 12 }}>Wafer Map ID: {wafer.media_id}</div>
      <div
        style={{
          border: "1px solid black",
          maxHeight: "55vh",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "55vh",
            display: "block",
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            key={refreshKey}
            transform={`translate(${viewMinX * 2 + viewWidth}, 0) scale(-1, 1)`}
          >
            {Object.entries(wafer.apertures).map(([uid, aperture]) => (
              <ApertureCircle
                key={uid}
                uid={Number(uid)}
                nextAperture={
                  nextApertureId !== undefined && nextApertureId === uid
                }
                apertureInput={aperture}
                radius={radius}
                updateApertureStatus={updateApertureStatus}
                removeAperture={removeAperture}
              />
            ))}
            {Object.entries(wafer.refpoints).map(([id, refPoint]) => (
              <RefPointPlus
                key={id}
                id={id}
                refPoint={refPoint}
                width={radius * 2}
              />
            ))}
          </g>
        </svg>
      </div>
    </>
  );
};

// --------------------------------------------------------------------------------
//  Aperture
// --------------------------------------------------------------------------------

type ApertureCircleProps = ApertureActions & {
  uid: number;
  apertureInput: Aperture;
  nextAperture: boolean;
  radius: number;
};

const statusTailwindClass: Record<ApertureStatus, string> = {
  available: "fill-blue-100 hover:fill-blue-50",
  scheduled: "fill-blue-100 hover:fill-blue-50",
  used: "fill-zinc-300 hover:fill-zinc-200",
  damaged: "fill-red-300 hover:fill-red-200",
};

const ApertureCircle = ({
  uid,
  apertureInput,
  nextAperture,
  radius,
  updateApertureStatus,
  removeAperture,
}: ApertureCircleProps) => {
  // Local state
  // -------------------------------
  const [aperture, setAperture] = useState<Aperture>(apertureInput);
  const [clicked, setClicked] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isPopoverOpen = opened || clicked;

  // Memoize functions
  // -------------------------------
  const handleClose = useCallback(() => {
    setTimeout(() => {
      close(); // close hover popover
      setClicked(false); // close click popover
    }, 10);
  }, [close]);

  // Effects
  // -------------------------------
  useEffect(() => {
    if (!isPopoverOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (dropdownRef.current?.contains(target)) return;
      if (circleRef.current?.contains(target)) return;
      handleClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClose, isPopoverOpen]);

  // Handlers
  // -------------------------------
  async function handleStatusChange(value: string | null) {
    const status = value?.toLowerCase() as ApertureStatus;
    await updateApertureStatus.callAsync({ aperture_id: String(uid), status });
    setAperture({ ...aperture, status });
  }

  async function handleRemoveAperture() {
    handleClose();
    await removeAperture.callAsync({ aperture_id: String(uid) });
  }

  return (
    <Popover
      width={200}
      position="bottom"
      withArrow
      shadow="md"
      onClose={() => setClicked(false)}
      opened={isPopoverOpen}
      trapFocus={false}
    >
      <Popover.Target>
        <circle
          ref={circleRef}
          className={`
            ${clicked ? "stroke-[1.5]" : ""}
            ${statusTailwindClass[aperture.status]}
            ${nextAperture || aperture.status === "scheduled" ? "stroke-red-300" : "stroke-neutral-700"}
            cursor-pointer
            transition-all
            duration-200
          `}
          cx={aperture.centroid[0]}
          cy={aperture.centroid[1]}
          r={radius}
          onMouseEnter={open}
          onMouseLeave={close}
          onClick={() => setClicked((c) => !c)}
        />
      </Popover.Target>
      {isPopoverOpen && (
        <Popover.Dropdown ref={dropdownRef}>
          {clicked ? (
            <Stack>
              <div>ID: {uid}</div>
              <Select
                placeholder="Set status"
                data={["Available", "Scheduled", "Used", "Damaged"]}
                comboboxProps={{ withinPortal: false }}
                onChange={handleStatusChange}
              />
              <Button
                fullWidth
                variant="default"
                onClick={handleRemoveAperture}
              >
                Remove Aperture
              </Button>
            </Stack>
          ) : (
            <div>
              <div>ID: {uid}</div>
              <div>Status: {aperture.status}</div>
              <div>
                Position: ({aperture.centroid[0]}, {aperture.centroid[1]})
              </div>
              <div>Substrate: {aperture.substrate}</div>
            </div>
          )}
        </Popover.Dropdown>
      )}
    </Popover>
  );
};
