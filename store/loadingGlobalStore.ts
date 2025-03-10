import { create } from "zustand";

interface LoadingGlbalState {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

export const useLoadingGlobalStore = create<LoadingGlbalState>((set) => ({
  loading: false,
  setLoading: (state) => set({ loading: state }),
}));
