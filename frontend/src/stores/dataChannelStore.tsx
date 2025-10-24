import { create } from 'zustand'

interface DataChannelState {
  channels: Record<string, RTCDataChannel>;
  addChannel: (id: string, channel:RTCDataChannel) => void;
}

export const useDataChannelStore = create<DataChannelState>((set) => ({
  channels: {},
  addChannel: (id: string, channel:RTCDataChannel) => set((state) => ({ channels: { ...state.channels, [id]: channel } })),
}))

interface VideoStreamState {
  streams: Record<string, MediaStream>;
  addStream: (id: string, stream:MediaStream) => void;
}

export const useVideoStreamStore = create<VideoStreamState>((set) => ({
  streams: {},
  addStream: (id: string, stream:MediaStream) => set((state) => ({ streams: { ...state.streams, [id]: stream } })),
}))