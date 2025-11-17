import { Container } from "@mantine/core";

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <Container>
      <p> WOOPSIES SOMETHING WENT TERRIBLY WRONG</p>
      <pre className="red"> {error.message} </pre>
    </Container>
  );
}
