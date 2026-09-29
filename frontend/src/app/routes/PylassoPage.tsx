import {
  LassoCameraWidget,
  LassoControlWidget,
  WaferCalibrationWidget,
} from "@/widgets";

import { Container, Divider, SimpleGrid, Stack } from "@mantine/core";

export const PylassoPage = () => {
  return (
    <Container fluid px="md">
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" verticalSpacing="md">
        <Stack>
          <LassoCameraWidget instanceId="lassoCamera1" />
          <Divider />
          <LassoControlWidget instanceId="lassoControl1" />
          {/* <LassoCamera />
          <LassoControl /> */}
        </Stack>
        <WaferCalibrationWidget instanceId="waferCalibration1" />
        {/* <WaferCalibrationControl /> */}
      </SimpleGrid>
    </Container>
  );
};
