import { Container, Flex, Title } from "@mantine/core";
import Navbar from "./navbar";
import ColorSchemeToggle from "./color-scheme-toggle";

const Header = () => {
  return (
    <Container size="xl" className="flex items-center justify-between h-24">
			<Title> pyLASSO </Title>
      <Flex className="items-center gap-4">
				<Navbar />
				<ColorSchemeToggle />
			</Flex>
    </Container>
  );
};

export default Header;
