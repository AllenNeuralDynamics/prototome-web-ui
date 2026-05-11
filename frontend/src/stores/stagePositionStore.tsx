import { create } from "zustand";
import { useDataChannelStore } from "./dataChannelStore";

type StagePositionState = {
  positions: Record<string, number>;
  setPositions: (positions: Record<string, number>) => void;
};

export const useStagePositionStore = create<StagePositionState>((set) => {
  let currentListener: ((evt: MessageEvent) => void) | null = null;

  const attachChannelListener = (channel: RTCDataChannel) => {
    // Remove previous listener from this channel
    if (currentListener) {
      channel.removeEventListener("message", currentListener);
    }

    currentListener = (evt: MessageEvent) => {
      try {
        const pos: Record<string, number> = JSON.parse(evt.data);
        set({ positions: pos });
      } catch {
        console.warn("Failed to parse position message:", evt.data);
      }
    };

    channel.addEventListener("message", currentListener);
  };

  const unsubscribe = useDataChannelStore.subscribe((state, prevState) => {
    const newChannel = state.channels["prototome_stage_positions"];
    const oldChannel = prevState.channels["prototome_stage_positions"];

    if (oldChannel && currentListener && oldChannel !== newChannel) {
      oldChannel.removeEventListener("message", currentListener);
    }

    if (newChannel && oldChannel !== newChannel) {
      attachChannelListener(newChannel);
    }
  });

  return {
    positions: {},
    setPositions: (positions) => set({ positions }),
    destroy: unsubscribe,
  };
});
