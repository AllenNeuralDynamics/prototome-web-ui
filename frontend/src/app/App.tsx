import React, { useEffect, useState, useMemo } from "react";
import { BrowserRouter, Link, useLocation } from "react-router-dom";
import { AppRouter } from "./router.tsx";
import { useDispatch } from "react-redux";
import { initializeRanges } from "../features/stage/stores/rangeSlice.tsx";
import { Group, Button, Paper } from "@mantine/core";
import { AppConfig, StageConfig } from "../types/configTypes.tsx";
import { AppDispatch } from "../stores/store.tsx";
import { initializePosition,  connectPositionSocket  } from "../features/stage/stores/positionSlice.tsx";

function NavBar() {
  const location = useLocation();

  return (
    <Paper shadow="xs" p="sm" style={{ marginBottom: "1rem" }}>
      <Group>
        <Button
          component={Link}
          to="/"
          variant={location.pathname === "/" ? "filled" : "outline"}
          color="blue"
        >
          Home
        </Button>
        <Button
          component={Link}
          to="/stage"
          variant={location.pathname === "/stage" ? "filled" : "outline"}
          color="blue"
        >
          Stages
        </Button>
      </Group>
    </Paper>
  );
}

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  //  fetch config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("http://localhost:8000/config");
        if (!response.ok) throw new Error("Failed to fetch config");
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    }
    fetchConfig();
  }, []);
  
  if (!config) return <div>Loading configuration...</div>;

  return (
    <BrowserRouter>
      <NavBar />
      <AppRouter config={config} setConfig={setConfig} />
    </BrowserRouter>
  );
}

export default App;
