import {
  LassoCamera,
  LassoControl,
  WaferCalibrationControl,
} from "@/features/pylasso/index";

import type { AppConfig } from "@/types/configTypes.tsx";
import { Container, Stack } from "@mantine/core";

export const PylassoPage = ({ config }: { config: AppConfig }) => {
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
