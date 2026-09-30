import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router.tsx";
import { AppProvider } from "./provider.tsx";
import MainLayout from "@/components/layouts/MainLayout.tsx";
import { GlobalApiError } from "@/components/globalApiError/GlobalApiError.tsx";
import { WriteAccessSwitch } from "@/lib/write-token/switch.tsx";

const App = () => {
  return (
    <AppProvider>
      <GlobalApiError>
        <BrowserRouter>
          {/* 
          TODO: create read-only layout, route, widget, etc 
          current it just renders same layout, but one will have 403 errors for write-protected actions
          */}

          <WriteAccessSwitch
            write={
              <MainLayout>
                <AppRouter />
              </MainLayout>
            }
            readOnly={
              <MainLayout>
                <AppRouter />
              </MainLayout>
            }
          />
        </BrowserRouter>
      </GlobalApiError>
    </AppProvider>
  );
};

export default App;
