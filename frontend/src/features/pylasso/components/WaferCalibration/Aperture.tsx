import { useDisclosure } from "@mantine/hooks";
import type { Aperture, ApertureStatus } from "../../types/wafer";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Popover, Select, Stack } from "@mantine/core";
import { lassoCameraApi } from "../../api/lassoCameraApi";

interface ApertureCircleProps {
  uid: number;
  apertureInput: Aperture;
  nextAperture: boolean;
  radius: number;
  onRefresh: () => Promise<void>;
}

export const ApertureCircle = ({
  uid,
  apertureInput,
  nextAperture,
  radius,
  onRefresh,
}: ApertureCircleProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  const [clicked, setClicked] = useState(false);
  const [aperture, setAperture] = useState<Aperture>(apertureInput);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isPopoverOpen = opened || clicked;

  const handleClose = useCallback(() => {
    setTimeout(() => {
      close(); // close hover popover
      setClicked(false); // close click popover
    }, 10);
  }, [close]);

  async function handleStatusChange(value: string | null) {
    const status = value?.toLowerCase() as ApertureStatus;
    await lassoCameraApi.postUpdateApertureStatus(uid.toString(), status);
    setAperture({
      ...aperture,
      status: status,
    });
    await onRefresh();
  }

  async function handleRemoveAperture() {
    handleClose();
    await lassoCameraApi.postRemoveAperture(uid.toString());
    await onRefresh();
  }

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      if (dropdownRef.current?.contains(target)) {
        return;
      }

      if (circleRef.current?.contains(target)) {
        return;
      }

      handleClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClose, isPopoverOpen]);

  const statusTailwindClass: Record<ApertureStatus, string> = {
    available: "fill-blue-100 hover:fill-blue-50",
    scheduled: "fill-blue-100 hover:fill-blue-50",
    used: "fill-zinc-300 hover:fill-zinc-200",
    damaged: "fill-red-300 hover:fill-red-200",
  };

  return (
    <Popover
      width={200}
      position="bottom"
      withArrow
      shadow="md"
      onClose={() => setClicked(false)}
      opened={opened || clicked}
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
      {(opened || clicked) && (
        <Popover.Dropdown ref={dropdownRef}>
          {clicked ? (
            <Stack>
              <div>ID: {uid}</div>
              <Select
                placeholder="Set status"
                data={["Available", "Scheduled", "Used", "Damaged"]}
                comboboxProps={{ withinPortal: false }}
                onChange={(value) => handleStatusChange(value)}
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
