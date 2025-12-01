import { Button, Container, Group } from "@mantine/core";
import { ColorSchemeToggle } from "../ColorSchemeToggle";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

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
      </Group>
      <ColorSchemeToggle />
    </Container>
  );
}
