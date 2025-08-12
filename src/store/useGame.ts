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
  cellsPerDistrict: number;
  currentDistrict: number; // 0 = Eraser (unassign), 1..N = real districts

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

// --- helpers for contiguity enforcement ---

function neighbors4(index: number, rows: number, cols: number): number[] {
  const r = Math.floor(index / cols);
  const c = index % cols;
  const out: number[] = [];
  if (r > 0) out.push((r - 1) * cols + c);
  if (r < rows - 1) out.push((r + 1) * cols + c);
  if (c > 0) out.push(r * cols + (c - 1));
  if (c < cols - 1) out.push(r * cols + (c + 1));
  return out;
}

function isAdditionSafe(grid: Cell[], rows: number, cols: number, d: number, addIndex: number): boolean {
  let hasAny = false;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].districtId === d) {
      hasAny = true;
      break;
    }
  }
  if (!hasAny) return true; // first cell is always fine
  for (const nb of neighbors4(addIndex, rows, cols)) {
    if (grid[nb] && grid[nb].districtId === d) return true;
  }
  return false;
}

function isRemovalSafe(grid: Cell[], rows: number, cols: number, d: number, removeIndex: number): boolean {
  const remaining: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (i !== removeIndex && grid[i].districtId === d) remaining.push(i);
  }
  if (remaining.length === 0) return true; // removing last cell is fine

  const allowed = new Set(remaining);
  const start = remaining[0];
  const visited = new Set<number>([start]);
  const q: number[] = [start];

  while (q.length) {
    const cur = q.shift()!;
    for (const nb of neighbors4(cur, rows, cols)) {
      if (!allowed.has(nb) || visited.has(nb)) continue;
      visited.add(nb);
      q.push(nb);
    }
  }
  return visited.size === remaining.length;
}

export const useGame = create<GameState>()(
  immer((set, get) => ({
    rows: 20,
    cols: 20,
    cellSize: 24,
    seed: 12345,
    grid: generateGrid({ rows: 20, cols: 20, seed: 12345, redRatio: 0.5 }),

    totalDistricts: 5,
    cellsPerDistrict: 80, // 400 / 5

    currentDistrict: 1,

    isPainting: false,
    paintDistrict: null,

    setCurrentDistrict: (d) =>
      set((st) => {
        // allow 0 (Eraser) through totalDistricts
        if (d < 0) d = 0;
        if (d > st.totalDistricts) d = st.totalDistricts;
        st.currentDistrict = d;
      }),

    startPainting: (d) =>
      set((st) => {
        st.isPainting = true;
        st.paintDistrict = d ?? st.currentDistrict;
      }),

    paintCellByIndex: (index) =>
      set((st) => {
        const d = st.paintDistrict ?? st.currentDistrict; // 0 = erase
        const { rows, cols, cellsPerDistrict } = st;
        const cell = st.grid[index];
        if (!cell) return;

        // --- ERASE: set to unassigned if it won't split the source district ---
        if (d === 0) {
          const source = cell.districtId;
          if (!source) return; // already unassigned
          if (!isRemovalSafe(st.grid, rows, cols, source, index)) return; // would split
          cell.districtId = undefined;
          return;
        }

        // --- PAINT to district d (>=1) ---

        // no-op if already in target
        if (cell.districtId === d) return;

        // enforce target size cap
        let targetSize = 0;
        for (const c of st.grid) if (c.districtId === d) targetSize++;
        if (targetSize >= cellsPerDistrict) return;

        // addition must touch the district (no new islands)
        if (!isAdditionSafe(st.grid, rows, cols, d, index)) return;

        // moving from a different source district? ensure removal won't split source
        const source = cell.districtId;
        if (source && source !== d) {
          if (!isRemovalSafe(st.grid, rows, cols, source, index)) return;
        }

        // apply
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
