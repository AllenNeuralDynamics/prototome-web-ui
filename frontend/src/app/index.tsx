import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router.tsx";
import { AppProvider } from "./provider.tsx";
import MainLayout from "@/components/layouts/MainLayout.tsx";
import { GlobalApiError } from "@/components/globalApiError/GlobalApiError.tsx";

const App = () => {
  return (
    <AppProvider>
      <GlobalApiError>
        <BrowserRouter>
          <MainLayout>
            <AppRouter />
          </MainLayout>
        </BrowserRouter>
      </GlobalApiError>
    </AppProvider>
  );
};

export default App;
