import {
  LassoCamera,
  LassoControl,
  WaferCalibrationControl,
} from "@/features/pylasso/index";

import { Container, Stack } from "@mantine/core";

export const PylassoPage = () => {
  return (
    <Container>
      <Stack>
        <LassoCamera cameraId="window2_web_camera" />
        <LassoControl />
        <WaferCalibrationControl />
      </Stack>
    </Container>
  );
};
