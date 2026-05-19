import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage.tsx";
import { StagesPage } from "./routes/StagesPage.tsx";
import { PylassoPage } from "./routes/PylassoPage.tsx";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stage" element={<StagesPage />} />
      <Route path="/pylasso" element={<PylassoPage />} />
    </Routes>
  );
};
