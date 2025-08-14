import React, { createContext, useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchPositions } from "../stores/positionSlice.tsx";
import { UseStagePositionsProps } from "../types/stageTypes.tsx";
import { AppDispatch } from "../../../stores/store.tsx";

export function useStagePositions({
  host,
  instrumentStages,
}: UseStagePositionsProps) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchPositions({ host, instrumentStages }));
    const posInt = setInterval(() => {
      const pos = dispatch(fetchPositions({ host, instrumentStages }));
    }, 500);
    return () => {
      clearInterval(posInt);
    };
  }, [dispatch, host, instrumentStages]);
}
