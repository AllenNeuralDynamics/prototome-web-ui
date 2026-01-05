import { Button, Group, Select, Slider, Stack, Text } from "@mantine/core";

export const CameraControl = () => {
  return (
    <Stack className="space-y-10">
      <Group grow>
        <Button>Start Automated Dropoff</Button>
        <Button>Start Automated Dropoff</Button>
        <Button>Minimize XY Distance</Button>
      </Group>

      <Stack>
        <video className="border" />
        <Group>
          <Button>Start Camera</Button>
          <Button>Stop Camera</Button>
        </Group>
      </Stack>

      <Group gap="xl">
        <Stack className="flex-1 min-w-sm">
          <Group gap="xl">
            <Select data={["Saturation Derivative"]} className="w-50"/>
            <Slider defaultValue={40} className="flex-1" />
          </Group>
          <Group gap="xl">
            <Text className="min-w-50 text-right"> Exposure Time (μs)</Text>
            <Slider defaultValue={40} className="flex-1"/>
          </Group>
          <Group gap="xl">
            <Text className="min-w-50 text-right"> Gain </Text>
            <Slider defaultValue={40} className="flex-1"/>
          </Group>
        </Stack>
      </Group>

      <Stack>
        <Button>Enable Auto White Balance</Button>
        <Button>Save Camera Settings</Button>
      </Stack>
       
    </Stack>
  );
};
