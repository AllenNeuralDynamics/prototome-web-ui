import { StateMachineWidget } from "@/widgets";
import { Container } from "@mantine/core";

export const StateMachinesPage = () => {
  return (
    <Container size="md">
      <StateMachineWidget instanceId="stateMachines1" />
    </Container>
  );
};
