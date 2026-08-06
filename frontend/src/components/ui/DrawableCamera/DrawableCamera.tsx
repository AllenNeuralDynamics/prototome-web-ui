import { useRef, useState, type ReactNode } from "react";

type DrawableCameraProps = {
  video: ReactNode;
  rois: Roi[];
  selectedRoi?: string;
  onRoiStateChange: (id: string, newRoi: Roi) => void;
  colors?: string[];
};

type Roi = {
  id: string;
  name: string;
  colorIndex: number;
  positions: RoiBoxPosition | null;
};

interface RoiBoxPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const DrawableCamera = ({
  video,
  rois,
  onRoiStateChange: onRoiChange,
  selectedRoi = (Object.keys(rois)[0] as string) || "",
  colors = ["#2ed573", "#ff6b6b", "#54a0ff", "#ff9f43", "#a55eea"],
}: DrawableCameraProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  const roi = rois.find((r) => r.id === selectedRoi) || rois[0];
  if (!roi) {
    console.warn(
      `Selected ROI with id ${selectedRoi} not found. Falling back to the first ROI.`,
    );
  }

  // Helper to get mouse coordinates relative to the container
  const getRelativeCoords = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Prevent dragging text/video elements by accident
    e.preventDefault();

    const coords = getRelativeCoords(e);
    setIsDragging(true);
    setStartPos(coords);
    setCurrentPos(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isDragging) return;
    const coords = getRelativeCoords(e);
    setCurrentPos(coords);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Calculate final dimensions
    const left: number = Math.min(startPos.x, currentPos.x);
    const top: number = Math.min(startPos.y, currentPos.y);
    const width: number = Math.abs(currentPos.x - startPos.x);
    const height: number = Math.abs(currentPos.y - startPos.y);

    // Only save if it's an actual drag, not a tiny accidental click
    if (width > 5 && height > 5) {
      if (roi) {
        onRoiChange(roi.id, {
          ...roi,
          positions: { left, top, width, height },
        });
      }
    }
  };

  // Calculate dimensions strictly for the live preview overlay
  const previewLeft = Math.min(startPos.x, currentPos.x);
  const previewTop = Math.min(startPos.y, currentPos.y);
  const previewWidth = Math.abs(currentPos.x - startPos.x);
  const previewHeight = Math.abs(currentPos.y - startPos.y);

  return (
    <div>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: "relative",
          display: "inline-block", // Shrinks container to fit the video size
          cursor: "crosshair",
          userSelect: "none",
        }}
      >
        {/* The Video Element */}
        {video}

        {/* Live Drawing Preview Box */}
        {isDragging && (
          <div
            style={{
              position: "absolute",
              border: `2px dashed ${colors[roi.colorIndex % colors.length] ?? colors[0]}`,
              backgroundColor: `${colors[roi.colorIndex % colors.length] ?? colors[0]}33`,
              left: `${previewLeft}px`,
              top: `${previewTop}px`,
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              pointerEvents: "none",
            }}
          />
        )}
        {rois.map((box) => {
          if (box === null || box === undefined) return;
          return (
            box.positions !== null &&
            ((!isDragging && selectedRoi === box.id) ||
              selectedRoi !== box.id) && (
              <div
                className="text-center"
                style={{
                  position: "absolute",
                  border: `2px solid ${colors[box.colorIndex % colors.length]}`,
                  left: `${box.positions?.left}px`,
                  top: `${box.positions?.top}px`,
                  width: `${box.positions?.width}px`,
                  height: `${box.positions?.height}px`,
                  pointerEvents: "none",
                }}
              >
                {box.name}
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};
