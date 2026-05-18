import { Routes, Route } from "react-router-dom";
import { HomePage } from "./routes/HomePage.tsx";
import { StagesPage } from "./routes/StagesPage.tsx";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stage" element={<StagesPage />} />
    </Routes>
  );
};
