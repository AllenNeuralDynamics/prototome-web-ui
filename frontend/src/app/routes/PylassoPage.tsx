import {
  LassoCamera,
  LassoControl,
  WaferCalibrationControl,
} from "@/features/pylasso/index";

import { Container, SimpleGrid, Stack } from "@mantine/core";

export const PylassoPage = () => {
  return (
    <Container fluid px="md">
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" verticalSpacing="md">
        <Stack>
          <LassoCamera />
          <LassoControl />
        </Stack>
        <WaferCalibrationControl />
      </SimpleGrid>
    </Container>
  );
};
