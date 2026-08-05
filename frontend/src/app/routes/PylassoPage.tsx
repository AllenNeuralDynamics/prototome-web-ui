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
        <LassoCamera />
        <LassoControl />
        <WaferCalibrationControl />
      </Stack>
    </Container>
  );
};
