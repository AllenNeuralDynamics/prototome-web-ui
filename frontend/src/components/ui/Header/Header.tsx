import { Badge, Button, Container, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ColorSchemeToggle } from "../ColorSchemeToggle";
import { Link, useLocation } from "react-router-dom";
import {
  useForceWriteToken,
  useReleaseWriteToken,
  useWriteTokenOwner,
  type WriteTokenOwner,
} from "@/lib/write-token/use-write-token";
import { useIsReadOnly } from "@/lib/write-token/use-page-mode";

const describeOwner = ({ token_owner, owned_by_this_client }: WriteTokenOwner) => {
  if (!token_owner) return owned_by_this_client ? "No session" : "Nobody";
  return owned_by_this_client
    ? `Session ${token_owner}`
    : `External client ${token_owner}`;
};

export const Header = () => {
  const location = useLocation();
  const readOnly = useIsReadOnly();
  const forceToken = useForceWriteToken();
  const releaseToken = useReleaseWriteToken();
  const owner = useWriteTokenOwner();
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);

  return (
    <Container fluid className="flex justify-between shadow-xs p-2 mb-[1rem]">
      <Group>
        <Button
          component={Link}
          to="/"
          variant={location.pathname === "/" ? "filled" : "outline"}
          color="blue"
        >
          Home
        </Button>
        <Button
          component={Link}
          to="/stage"
          variant={location.pathname === "/stage" ? "filled" : "outline"}
          color="blue"
        >
          Stages
        </Button>
        <Button
          component={Link}
          to="/pylasso"
          variant={location.pathname === "/pylasso" ? "filled" : "outline"}
          color="blue"
        >
          PyLasso
        </Button>
      </Group>
      <Group>
        {readOnly && owner.data && (
          <Text size="sm" c="dimmed">
            In control: {describeOwner(owner.data)}
          </Text>
        )}
        {!readOnly ? (
          <>
            <Badge color="green">Write access</Badge>
            <Button
              variant="light"
              loading={releaseToken.isPending}
              onClick={() => releaseToken.mutate()}
            >
              Release
            </Button>
          </>
        ) : (
          <>
            <Badge color="gray">Read-only</Badge>
            <Button
              color="red"
              variant="light"
              loading={forceToken.isPending}
              onClick={openConfirm}
            >
              Take control
            </Button>
          </>
        )}
        <ColorSchemeToggle />
      </Group>
      <Modal
        opened={confirmOpen}
        onClose={closeConfirm}
        title="Take control?"
        centered
      >
        <Text size="sm">
          Another session currently has write access. Taking control will revoke
          it and they will be switched to read-only.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeConfirm}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              closeConfirm();
              forceToken.mutate();
            }}
          >
            Take control
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};
