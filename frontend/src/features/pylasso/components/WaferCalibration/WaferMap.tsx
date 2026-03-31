import type { Wafer } from "../../types/wafer";
import { ApertureCircle } from "./Aperture";
import { RefPointPlus } from "./RefPoints";

interface WaferMapProps {
  wafer: Wafer;
  nextApertureId: string | undefined;
  refreshCount: number;
  onRefresh: () => Promise<void>;
}

export const WaferMap = ({
  wafer,
  nextApertureId,
  refreshCount,
  onRefresh,
}: WaferMapProps) => {
  /**
   *
   * TODO:  might need to adjust how data is fetched
   *  - Setting reference points will require RefPoints to redraw
   *
   * TODO: display wafer status
   *  - Wafer status (used)
   *  - Wafer calibration status: (calibration failed, etc)
   *
   * INVESTIGATE: is there any other functionality that triggers changes to aperture or reference points?
   *
   */

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
      <div>Wafer Map ID: {wafer["media_id"]}</div>
      <div style={{ border: "1px solid black" }}>
        <svg
          viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
          style={{ width: "100%", height: "auto" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            key={refreshCount}
            transform={`translate(${viewMinX * 2 + viewWidth}, 0) scale(-1, 1)`}
          >
            {Object.entries(wafer.apertures).map(([uid, aperture]) => (
              <ApertureCircle
                uid={Number(uid)}
                nextAperture={
                  nextApertureId !== undefined && nextApertureId === uid
                }
                apertureInput={aperture}
                radius={radius}
                onRefresh={onRefresh}
              />
            ))}
            {Object.entries(wafer.refpoints).map(([id, refPoint]) => (
              <RefPointPlus id={id} refPoint={refPoint} width={radius * 2} />
            ))}
          </g>
        </svg>
      </div>
    </>
  );
};
