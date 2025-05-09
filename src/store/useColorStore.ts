import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ColorState {
  currentColor: string;
  colorHistory: string[];
  colorPresets: { [key: string]: string };
  setCurrentColor: (color: string) => void;
  addToHistory: (color: string) => void;
  clearHistory: () => void;
  savePreset: (name: string, color: string) => void;
  removePreset: (name: string) => void;
}

export const useColorStore = create<ColorState>()(
  persist(
    (set) => ({
      currentColor: "#FF0000", // 기본 빨간색
      colorHistory: [],
      colorPresets: {},

      setCurrentColor: (color) => set({ currentColor: color }),

      addToHistory: (color) =>
        set((state) => ({
          colorHistory: [
            color,
            ...state.colorHistory.filter((c) => c !== color).slice(0, 19), // 중복 제거 및 최대 20개 유지
          ],
        })),

      clearHistory: () => set({ colorHistory: [] }),

      savePreset: (name, color) =>
        set((state) => ({
          colorPresets: { ...state.colorPresets, [name]: color },
        })),

      removePreset: (name) =>
        set((state) => {
          const newPresets = { ...state.colorPresets };
          delete newPresets[name];
          return { colorPresets: newPresets };
        }),
    }),
    {
      name: "color-storage", // localStorage 키
    }
  )
);
