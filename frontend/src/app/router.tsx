import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage.tsx";
import { StagesPage } from "./routes/StagesPage.tsx";

export const AppRouter = ({ config, setConfig }) => {
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
