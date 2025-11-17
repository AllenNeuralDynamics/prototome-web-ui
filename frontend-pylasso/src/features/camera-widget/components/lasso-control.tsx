import {
  Button,
  Grid,
  Group,
  Select,
  Slider,
  Stack,
  Text,
} from "@mantine/core";

const LassoControl = () => {
  return (
    <Stack className="space-y-10">
      <Group>
        <Grid columns={4}>
          <Grid.Col span={1}>
            <Text>Current State</Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text>microtome_pause</Text>
          </Grid.Col>
          <Grid.Col span={1}>
            <Text>Cycle Count: </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text>placeholder</Text>
          </Grid.Col>
          <Grid.Col span={1}>
            <Text>Select ROI: </Text>
          </Grid.Col>
          <Grid.Col span={1}>
            <Select data={["Saturation Derivative"]} />
          </Grid.Col>
          <Grid.Col span={2}>
            <Button>Toggle Color</Button>
          </Grid.Col>

          <Grid.Col span={1}>
            <Button fullWidth>Move To Drop-off</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth>Move To Midpoint</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth>Move To Pickup</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth>Move To Post Pickup</Button>
          </Grid.Col>

          <Grid.Col span={1}>
            <Button fullWidth>Store Drop-off</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth>Store Midpoint</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth>Store Pickup</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button fullWidth>Store Post Pickup</Button>
          </Grid.Col>
        </Grid>
      </Group>

      <Group>
        <Grid columns={7}>
          <Grid.Col span={1}>Axis</Grid.Col>
          <Grid.Col span={1}>dropoff</Grid.Col>
          <Grid.Col span={1}>midpoint</Grid.Col>
          <Grid.Col span={1}>post pickup</Grid.Col>
          <Grid.Col span={1}>current</Grid.Col>
          <Grid.Col span={1}>
            <Button>Home All</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button>Stop All</Button>
          </Grid.Col>

          <Grid.Col span={1}>X</Grid.Col>
          <Grid.Col span={1}>2</Grid.Col>
          <Grid.Col span={1}>3</Grid.Col>
          <Grid.Col span={1}>4</Grid.Col>
          <Grid.Col span={1}>5</Grid.Col>
          <Grid.Col span={1}>
            <Button>Home</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button>Stop</Button>
          </Grid.Col>

          <Grid.Col span={1}>Y</Grid.Col>
          <Grid.Col span={1}>2</Grid.Col>
          <Grid.Col span={1}>3</Grid.Col>
          <Grid.Col span={1}>4</Grid.Col>
          <Grid.Col span={1}>5</Grid.Col>
          <Grid.Col span={1}>
            <Button>Home</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button>Stop</Button>
          </Grid.Col>

          <Grid.Col span={1}>Z</Grid.Col>
          <Grid.Col span={1}>1</Grid.Col>
          <Grid.Col span={1}>3</Grid.Col>
          <Grid.Col span={1}>4</Grid.Col>
          <Grid.Col span={1}>5</Grid.Col>
          <Grid.Col span={1}>
            <Button>Home</Button>
          </Grid.Col>
          <Grid.Col span={1}>
            <Button>Stop</Button>
          </Grid.Col>
        </Grid>
      </Group>

      <Stack>
        <Group>
          <Text>X Speed (%)</Text>
          <Slider defaultValue={40} className="flex-1" />
          <Text>10.000 mm/s</Text>
        </Group>
        <Group>
          <Text>Y Speed (%)</Text>
          <Slider defaultValue={40} className="flex-1" />
          <Text>10.000 mm/s</Text>
        </Group>
        <Group>
          <Text>Z Speed (%)</Text>
          <Slider defaultValue={40} className="flex-1" />
          <Text>10.000 mm/s</Text>
        </Group>
      </Stack> 

    </Stack>
  );
};

export default LassoControl;
