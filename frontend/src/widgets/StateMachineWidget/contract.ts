import { z } from "zod";

// Every action takes the name of the state machine it applies to.
const machineParams = z.object({ name: z.unknown() });

export const StateMachineWidgetContract = {
  type: "StateMachineWidget",
  slots: {
    // Sent periodically: every state machine with its current state.
    stateMachines: { results: z.unknown(), kind: "channel" },
    // Toggles a state machine between standby and working.
    switchMasterState: {
      params: machineParams,
      results: z.unknown(),
      kind: "action",
    },
    advanceState: {
      params: machineParams,
      results: z.unknown(),
      kind: "action",
    },
    // An empty name releases the gamepad.
    setGamepadFocus: {
      params: machineParams,
      results: z.unknown(),
      kind: "action",
    },
  },
} as const;
