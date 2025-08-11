import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Cell } from '../game/grid';
import { generateGrid } from '../game/grid';

type GameState = {
  rows: number;
  cols: number;
  cellSize: number;
  seed: number;
  grid: Cell[];
  regenerate: (seed?: number) => void;
};

export const useGame = create<GameState>()(
  immer((set, get) => ({
    rows: 20,
    cols: 20,
    cellSize: 24, // pixels per cell (we can tweak later)
    seed: 12345,
    grid: generateGrid({ rows: 20, cols: 20, seed: 12345, redRatio: 0.5 }),

    regenerate: (seed) => {
      const s = seed ?? Math.floor(Math.random() * 1_000_000);
      const { rows, cols } = get();
      const grid = generateGrid({ rows, cols, seed: s, redRatio: 0.5 });
      set((st) => {
        st.seed = s;
        st.grid = grid;
      });
    },
  }))
);
