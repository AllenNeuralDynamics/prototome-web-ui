import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage.tsx";
import { StagesPage } from "./routes/StagesPage.tsx";
import type { AppConfig } from "../types/configTypes.tsx";

type AppRouterProps = {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
};


export const AppRouter = ({ config, setConfig }: AppRouterProps) => {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage config={config} setConfig={setConfig} />}
      />
      <Route path="/stage" element={<StagesPage config={config} />} />
    </Routes>
  );
};
