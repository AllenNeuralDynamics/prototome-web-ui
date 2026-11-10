import type { ResourcesForContract } from "@/widgets/framework";
import { useIsReadOnly } from "@/lib/write-token/use-page-mode";
import { useForceWriteToken } from "@/lib/write-token/use-write-token";
import { Button, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { EStopButtonContract } from "./contract";

type Resources = ResourcesForContract<typeof EStopButtonContract>;

export type EStopButtonProps = Resources & {
  instanceId: string;
};

export const EStopButtonView = ({ stopCuttingNow }: EStopButtonProps) => {
  const readOnly = useIsReadOnly();
  // Reload is deferred until the user acknowledges the stop.
  const forceToken = useForceWriteToken({ reload: false });
  const [stoppedOpen, { open: openStopped }] = useDisclosure(false);

  const onClick = async () => {
    try {
      if (readOnly) await forceToken.mutateAsync();
      await stopCuttingNow.callAsync({});
      openStopped();
    } catch (error) {
      console.error("E-stop failed:", error);
      // Token may have been claimed; reload into the matching layout.
      if (readOnly) window.location.reload();
    }
  };

  return (
    <>
      <Button
        color="red"
        loading={forceToken.isPending || stopCuttingNow.isLoading}
        onClick={onClick}
      >
        Stop Cutting Now
      </Button>
      <Modal
        opened={stoppedOpen}
        onClose={() => window.location.reload()}
        title="Cutting stopped"
        centered
      >
        <Text size="sm">The microtome has been stopped.</Text>
        <Group justify="flex-end" mt="md">
          <Button onClick={() => window.location.reload()}>OK</Button>
        </Group>
      </Modal>
    </>
  );
};
