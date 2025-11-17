import { Container } from "@mantine/core";
import Header from "../ui/header";

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="space-y-10">
      <Container fluid className="shadow-md">
        <Header />
      </Container>
      <Container size="xl">{children}</Container>
    </div>
  );
};

export default MainLayout;
