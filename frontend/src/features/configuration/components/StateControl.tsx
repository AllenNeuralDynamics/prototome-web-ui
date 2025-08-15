import React, { useState } from "react";
import { Card, Button, Group, Stack, Text, Badge } from "@mantine/core";

export default function StateControl() {
  const [currentState, setCurrentState] = useState("Idle");
  const [cycleCount, setCycleCount] = useState(0);

  const handleSwitchTool = () => setCurrentState("Tool switched");
  const handleAdvanceChild = () => {
    setCycleCount((prev) => prev + 1);
    setCurrentState("Child state advanced");
  };
  const handleSwitchToFacing = () => setCurrentState("Switched to facing");

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ maxWidth: "450px", margin: "auto" }}
    >
      <Stack>
        <Group>
          <Text size="sm">Cycle Count:</Text>
          <Badge color="blue" variant="light">
            {cycleCount}
          </Badge>
        </Group>
        <Group>
          <Text size="sm">Current State:</Text>
          <Badge color="green" variant="light">
            {currentState}
          </Badge>
        </Group>

        <Group style={{ flexWrap: "wrap" }}>
          <Button
            size="xs"
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              position: "relative",
              padding: "0 5px",
            }}
          >
            Switch Microtome / Lasso
          </Button>
          <Button
            size="xs"
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              position: "relative",
              padding: "0 5px",
            }}
          >
            Advance Child State
          </Button>
          <Button
            size="xs"
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              position: "relative",
              padding: "0 5px",
            }}
          >
            Switch to Facing
          </Button>
        </Group>

        <Stack>
          <Button color="green">Start Cutting</Button>
          <Button color="yellow">Stop Cutting Safely</Button>
          <Button color="red">Stop Cutting Now</Button>
        </Stack>
      </Stack>
    </Card>
  );
}
