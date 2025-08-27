import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage.tsx";
import { StagesPage } from "./routes/StagesPage.tsx";

export const AppRouter = ({ config }) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage config={config} />} />
      <Route path="/stage" element={<StagesPage config={config} />} />
    </Routes>
  );
};
