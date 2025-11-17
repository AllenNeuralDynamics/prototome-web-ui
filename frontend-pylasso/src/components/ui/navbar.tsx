import { Button, Group } from "@mantine/core";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <Group>
			<Button component={Link} to="/" variant={location.pathname === '/' ? 'filled' : 'subtle'}>
				Home
			</Button>	
			<Button component={Link} to="/about" variant={location.pathname === '/about' ? 'filled' : 'subtle'}>
				About	
			</Button>	
    </Group>
  );
};

export default Navbar;