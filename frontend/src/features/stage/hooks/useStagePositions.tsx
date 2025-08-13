import React, { createContext, useState, useEffect, useContext } from "react";
import { StageWidgetProps } from "../types/stageTypes.tsx";
import { getPosition } from "../api/stageApi.tsx";

export function useStagePositions({
  stageId,
  axes,
  host,
}: StageWidgetProps) {
    const [positions, setPositions] = useState<Record<string, number>>({});

    useEffect(() => {
        async function fetchPositions() {
            try {
                const newPos: Record<string, number> = {};
                for (const axis in axes){
                    newPos[axis] = await getPosition(host, stageId, axis);
                }
                setPositions(newPos);

            } catch(error){
                console.error("Error fetching positions", error)
            }    
        }
        fetchPositions();
        const posPoll = setInterval(fetchPositions, 1000);
        return () => {
            clearInterval(posPoll)
        }
    }, [stageId, axes, host])

    return positions;
};
