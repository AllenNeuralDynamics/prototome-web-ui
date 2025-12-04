import { Header } from "../ui/Header";

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {

  return (
    <div>
      <Header/>
      {children}
    </div>
  );
};

export default MainLayout;