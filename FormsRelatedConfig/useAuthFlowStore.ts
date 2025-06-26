// stores/useAuthFlowStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthFlowState {
  fromRegister: boolean;
  setFromRegister: (value: boolean) => void;
}

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  fromRegister: false,
  setFromRegister: (value) => set({ fromRegister: value }),
}));