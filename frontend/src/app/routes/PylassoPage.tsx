import { CameraControl, LassoControl, WaferCalibrationControl } from "@/features/pylasso/index";

import type { AppConfig } from "@/types/configTypes.tsx";
import { Container } from "@mantine/core";

export const PylassoPage = ({ config }: { config: AppConfig }) => {
  return (
    <Container>
      <CameraControl />
      <LassoControl />
      <WaferCalibrationControl />
    </Container>
  );
};
