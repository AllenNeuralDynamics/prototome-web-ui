import {
  LassoCamera,
  LassoControl,
  WaferCalibrationControl,
} from "@/features/pylasso/index";

import { Container, Stack } from "@mantine/core";
import { useRPCData } from "@/lib/one-liner-router/call-rpc.ts";

export const PylassoPage = () => {
  // TODO: testing new RPC call; remove when done
  const data = useRPCData("get_dancer", {});
  console.log(data.result);
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
