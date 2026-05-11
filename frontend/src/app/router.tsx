import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage.tsx";
import { StagesPage } from "./routes/StagesPage.tsx";
import type { AppConfig } from "@/types/configTypes.tsx";
import { PylassoPage } from "./routes/PylassoPage.tsx";

export const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage config={config} setConfig={setConfig} />}
      />
      <Route path="/stage" element={<StagesPage config={config} />} />
      <Route path="/pylasso" element={<PylassoPage config={config} />} />
    </Routes>
  );
};
