import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Modal, Button, Text } from "@mantine/core";

type GlobalApiErrorProps = {
  children: ReactNode;
};

type ApiError = {
  message: string;
  status?: number;
  url?: string;
};

export const GlobalApiError = ({ children }: GlobalApiErrorProps) => {
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ApiError>;
      setError(customEvent.detail);
    };

    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  return (
    <>
      {children}

      <Modal
        opened={!!error}
        onClose={() => setError(null)}
        title={`Error${error?.status ? ` (${error.status})` : ""}`}
        centered
        overlayProps={{ opacity: 0.55, blur: 3 }}
      >
        <Text mb="md">{error?.message}</Text>

        <Button color="red" onClick={() => setError(null)}>
          Close
        </Button>
      </Modal>
    </>
  );
};
