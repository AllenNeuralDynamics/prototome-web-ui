import React, { useState } from "react";
import { Card, Button, Group, Stack, Text, Badge } from "@mantine/core";
import { stateControlApi } from "../api/stateControlApi.ts";

export default function StateControl() {
  const [currentState, setCurrentState] = useState("Idle");

  return (
    <Card
      w="100%"
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ maxWidth: "450px", margin: "auto" }}
    >
      <Stack>
        <Group>
          <Text size="sm">Current State:</Text>
          <Badge color="green" variant="light">
            {currentState}
          </Badge>
        </Group>
        <Stack>
          <Button>Switch to Facing</Button>
          <Button color="green" onClick={() => stateControlApi.postStartCutting()}>Start Cutting</Button>
          <Button color="yellowgreen">Repeat Cut</Button>
          <Button color="yellow" onClick={() => stateControlApi.postCutOne()}>Cut One</Button>
          <Button color="orange" onClick={() => stateControlApi.postStopCuttingSafely()}>Stop Cutting Safely</Button>
          <Button color="red" onClick={() => stateControlApi.postStopCuttingNow()}>Stop Cutting Now</Button>
        </Stack>
      </Stack>
    </Card>
  );
}
