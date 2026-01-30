import { ActionIcon, Button, Group, Select, Stack, Text } from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconDeviceFloppy,
  IconHome,
  IconSearch,
  IconViewfinder,
} from "@tabler/icons-react";

export const WaferCalibrationControl = () => {
  return (
    <Stack>
      <Group>
        <ActionIcon>
          <IconHome />
        </ActionIcon>
        <ActionIcon>
          <IconArrowNarrowLeft />
        </ActionIcon>
        <ActionIcon>
          <IconArrowNarrowRight />
        </ActionIcon>
        <ActionIcon>
          <IconViewfinder />
        </ActionIcon>
        <ActionIcon>
          <IconSearch />
        </ActionIcon>
        <ActionIcon>
          <IconAdjustmentsHorizontal />
        </ActionIcon>
        <ActionIcon>
          <IconDeviceFloppy />
        </ActionIcon>
      </Group>
      <Group>
        <Button>Toggle Camera Crosshair</Button>
        <Button>Calibrate Wafer</Button>
      </Group>
      <Group>
        <Text>Reference: </Text>
        <Select data={["origin"]} />
        <Text>at (5.50, 5.50, 5.50)</Text>
        <Button> Set </Button>
      </Group>
      <Group>
        <Text>Wafer Status: </Text>
        <Text>new</Text>
        <Text>Wafer Calibration Status: </Text>
        <Text>uncalibrated</Text>
      </Group>
      <Group justify="center" className="border-1 h-50 w-50">
        <Text>insert wafer map here</Text>
      </Group>
    </Stack>
  );
};
