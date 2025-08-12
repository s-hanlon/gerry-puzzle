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

  totalDistricts: number;
  cellsPerDistrict: number;   // NEW
  currentDistrict: number;

  // painting state
  isPainting: boolean;
  paintDistrict: number | null;

  // actions
  setCurrentDistrict: (d: number) => void;
  startPainting: (d?: number) => void;
  paintCellByIndex: (index: number) => void;
  stopPainting: () => void;

  regenerate: (seed?: number) => void;
};

export const useGame = create<GameState>()(
  immer((set, get) => ({
    rows: 20,
    cols: 20,
    cellSize: 24,
    seed: 12345,
    grid: generateGrid({ rows: 20, cols: 20, seed: 12345, redRatio: 0.5 }),

    totalDistricts: 5,
    // 20*20 = 400, 400 / 5 = 80 cells per district
    cellsPerDistrict: 80,      // NEW

    currentDistrict: 1,

    isPainting: false,
    paintDistrict: null,

    setCurrentDistrict: (d) =>
      set((st) => {
        st.currentDistrict = d;
      }),

    startPainting: (d) =>
      set((st) => {
        st.isPainting = true;
        st.paintDistrict = d ?? st.currentDistrict;
      }),

    paintCellByIndex: (index) =>
      set((st) => {
        const d = st.paintDistrict ?? st.currentDistrict;
        const cell = st.grid[index];
        if (!cell) return;
        if (cell.districtId === d) return; // already assigned to this district

        // size cap: block if target district is already full
        const size = st.grid.reduce((acc, c) => acc + (c.districtId === d ? 1 : 0), 0);
        if (size >= st.cellsPerDistrict) return;

        cell.districtId = d;
      }),

    stopPainting: () =>
      set((st) => {
        st.isPainting = false;
        st.paintDistrict = null;
      }),

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
