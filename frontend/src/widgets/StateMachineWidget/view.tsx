import type { ResourcesForContract } from "@/widgets/framework";
import { Alert, Button, Card, Group, Table, Text, Title } from "@mantine/core";
import { StateMachineWidgetContract } from "./contract";

type Resources = ResourcesForContract<typeof StateMachineWidgetContract>;

export type StateMachineWidgetProps = Resources & {
  instanceId: string;
};

type Machine = { name: string; state: string };

type Report = {
  machines: Machine[];
  gamepadFocus: string;
  hasGamepad: boolean;
};

// The backend value is untyped, so keep only what has the expected shape.
const parseReport = (reported: unknown): Report | null => {
  if (typeof reported !== "object" || reported === null) return null;
  const { machines, gamepad_focus, has_gamepad } = reported as Record<
    string,
    unknown
  >;
  if (!Array.isArray(machines)) return null;
  return {
    machines: machines.filter(
      (machine): machine is Machine =>
        typeof machine?.name === "string" && typeof machine?.state === "string",
    ),
    gamepadFocus: typeof gamepad_focus === "string" ? gamepad_focus : "",
    hasGamepad: has_gamepad === true,
  };
};

// Same rule as the instrument's own GUI: ready and pause states are standby.
const isStandby = (state: string) => /ready|pause/i.test(state);

export const StateMachineWidgetView = ({
  stateMachines,
  switchMasterState,
  advanceState,
  setGamepadFocus,
}: StateMachineWidgetProps) => {
  const report = parseReport(stateMachines.data);
  const error =
    switchMasterState.error ?? advanceState.error ?? setGamepadFocus.error;

  return (
    <Card withBorder padding="md">
      <Title order={4} mb="xs">
        State Machine Control
      </Title>
      <Group gap="xl" mb="sm">
        <Text size="sm" c="red">
          Standby states are shown in red
        </Text>
        <Text size="sm" c="green">
          Working states are shown in green
        </Text>
      </Group>
      {error && (
        <Alert color="red" mb="sm" title="Request failed">
          {error.message}
        </Alert>
      )}
      {!report ? (
        <Text c="dimmed">Waiting for the instrument…</Text>
      ) : report.machines.length === 0 ? (
        <Text c="dimmed">The instrument reports no state machines.</Text>
      ) : (
        <Table verticalSpacing="sm">
          <Table.Tbody>
            {report.machines.map(({ name, state }) => {
              const hasFocus = report.gamepadFocus === name;
              return (
                <Table.Tr key={name}>
                  <Table.Td>
                    <Text fw={600}>{name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c={isStandby(state) ? "red" : "green"}>{state}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Button
                        variant="default"
                        onClick={() => switchMasterState.call({ name })}
                      >
                        Switch master state
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => advanceState.call({ name })}
                      >
                        Advance
                      </Button>
                      {report.hasGamepad && (
                        <Button
                          color="green"
                          variant={hasFocus ? "filled" : "default"}
                          aria-pressed={hasFocus}
                          onClick={() =>
                            setGamepadFocus.call({ name: hasFocus ? "" : name })
                          }
                        >
                          Gamepad Control
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </Card>
  );
};
