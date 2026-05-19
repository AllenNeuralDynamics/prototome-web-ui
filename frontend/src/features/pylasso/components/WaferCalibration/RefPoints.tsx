import { useDisclosure } from "@mantine/hooks";
import type { RefPointStatus } from "../../types/wafer";
import { Popover } from "@mantine/core";

interface RefPointPlusProps {
  id: string;
  refPoint: RefPointStatus;
  width: number;
}

export const RefPointPlus = ({ id, refPoint, width }: RefPointPlusProps) => {
  const [opened, { close, open }] = useDisclosure(false);

  // Original vibe code used radius, adjusted so plus shape can be set with width (double radius)
  width = width / 2;

  return (
    <Popover
      width={200}
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
    >
      <Popover.Target>
        <path
          // Vibe-coded plus shape hehe
          d={`M ${refPoint.position[0] - width * 0.3} ${refPoint.position[1] - width}
                   L ${refPoint.position[0] + width * 0.3} ${refPoint.position[1] - width}
                   L ${refPoint.position[0] + width * 0.3} ${refPoint.position[1] - width * 0.3}
                   L ${refPoint.position[0] + width} ${refPoint.position[1] - width * 0.3}
                   L ${refPoint.position[0] + width} ${refPoint.position[1] + width * 0.3}
                   L ${refPoint.position[0] + width * 0.3} ${refPoint.position[1] + width * 0.3}
                   L ${refPoint.position[0] + width * 0.3} ${refPoint.position[1] + width}
                   L ${refPoint.position[0] - width * 0.3} ${refPoint.position[1] + width}
                   L ${refPoint.position[0] - width * 0.3} ${refPoint.position[1] + width * 0.3}
                   L ${refPoint.position[0] - width} ${refPoint.position[1] + width * 0.3}
                   L ${refPoint.position[0] - width} ${refPoint.position[1] - width * 0.3}
                   L ${refPoint.position[0] - width * 0.3} ${refPoint.position[1] - width * 0.3}
                   Z`}
          className="fill-white stroke-[.8] stroke-red-300"
          strokeDasharray={refPoint.status ? 0 : 0.55}
          onMouseEnter={open}
          onMouseLeave={close}
        />
      </Popover.Target>
      <Popover.Dropdown>
        <div>
          <div>ID: {id}</div>
          <div>Status: {refPoint.status ? "True" : "False"}</div>
          <div>
            Position: ({refPoint.position[0]}, {refPoint.position[1]})
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};
