import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchPositions } from "../stores/positionSlice.tsx";
import { UseStageProps } from "../types/stageTypes.tsx";
import { AppDispatch } from "../../../stores/store.tsx";

export function useStagePositions({
  host,
  instrumentStages,
}: UseStageProps) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchPositions({ host, instrumentStages }));
    const posInt = setInterval(() => {
      const pos = dispatch(fetchPositions({ host, instrumentStages }));
    }, 1000);
    return () => {
      clearInterval(posInt);
    };
  }, [dispatch, host, instrumentStages]);
}
