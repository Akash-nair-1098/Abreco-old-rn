import { create } from 'zustand';

/**
 * FAB voice panel calls Voice.destroy() which clears callbacks on the singleton.
 * Bump this after FAB closes so header screens re-wire Voice handlers.
 */
export const useVoiceEpochStore = create<{
  epoch: number;
  bumpVoiceListeningEpoch: () => void;
}>(set => ({
  epoch: 0,
  bumpVoiceListeningEpoch: () => set(state => ({ epoch: state.epoch + 1 })),
}));
