import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Cell } from '../game/grid';
import { generateGrid } from '../game/grid';

type Difficulty = 'easy' | 'medium' | 'hard';

function redRatioFor(d: Difficulty): number {
  // redRatio = P(cell is Red). Easy gives Blue advantage (more B).
  if (d === 'easy') return 0.40;   // ~60% Blue
  if (d === 'hard') return 0.60;   // ~60% Red
  return 0.50;                     // balanced
}

type GameState = {
  rows: number;
  cols: number;
  cellSize: number;
  seed: number;
  grid: Cell[];

  mode: 'freeplay' | 'level';
  difficulty: Difficulty;
  redRatio: number;

  totalDistricts: number;
  cellsPerDistrict: number;

  // Level target & rules
  targetSeats: { R: number; B: number };
  requireAllAssigned: boolean;
  requireExactSizes: boolean;
  requireContiguity: boolean;

  currentDistrict: number; // 0 = Eraser, 1..N = real districts

  // painting state
  isPainting: boolean;
  paintDistrict: number | null;

  // actions
  setCurrentDistrict: (d: number) => void;
  setDifficulty: (d: Difficulty) => void;
  startPainting: (d?: number) => void;
  paintCellByIndex: (index: number) => void;
  stopPainting: () => void;

  regenerate: (seed?: number) => void;
};

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
  for (let i = 0; i < grid.length; i++) if (grid[i].districtId === d) { hasAny = true; break; }
  if (!hasAny) return true;
  for (const nb of neighbors4(addIndex, rows, cols)) if (grid[nb] && grid[nb].districtId === d) return true;
  return false;
}

function isRemovalSafe(grid: Cell[], rows: number, cols: number, d: number, removeIndex: number): boolean {
  const remaining: number[] = [];
  for (let i = 0; i < grid.length; i++) if (i !== removeIndex && grid[i].districtId === d) remaining.push(i);
  if (remaining.length === 0) return true;

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

    mode: 'freeplay',
    difficulty: 'medium',
    redRatio: redRatioFor('medium'),

    grid: generateGrid({ rows: 20, cols: 20, seed: 12345, redRatio: redRatioFor('medium') }),

    totalDistricts: 5,
    cellsPerDistrict: 80, // 400 / 5

    // Freeplay default target/rules (can change later)
    targetSeats: { R: 2, B: 3 },
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,

    currentDistrict: 1,

    isPainting: false,
    paintDistrict: null,

    setCurrentDistrict: (d) =>
      set((st) => {
        if (d < 0) d = 0;
        if (d > st.totalDistricts) d = st.totalDistricts;
        st.currentDistrict = d;
      }),

    setDifficulty: (d) =>
      set((st) => {
        st.difficulty = d;
        st.redRatio = redRatioFor(d);
        // regenerate on difficulty change with a fresh seed
        const s = Math.floor(Math.random() * 1_000_000);
        st.seed = s;
        st.grid = generateGrid({ rows: st.rows, cols: st.cols, seed: s, redRatio: st.redRatio });
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

        if (d === 0) {
          const source = cell.districtId;
          if (!source) return;
          if (!isRemovalSafe(st.grid, rows, cols, source, index)) return;
          cell.districtId = undefined;
          return;
        }

        if (cell.districtId === d) return;

        let targetSize = 0;
        for (const c of st.grid) if (c.districtId === d) targetSize++;
        if (targetSize >= cellsPerDistrict) return;

        if (!isAdditionSafe(st.grid, rows, cols, d, index)) return;

        const source = cell.districtId;
        if (source && source !== d) {
          if (!isRemovalSafe(st.grid, rows, cols, source, index)) return;
        }

        cell.districtId = d;
      }),

    stopPainting: () =>
      set((st) => {
        st.isPainting = false;
        st.paintDistrict = null;
      }),

    regenerate: (seed) => {
      const s =
        seed ??
        (get().mode === 'freeplay'
          ? Math.floor(Math.random() * 1_000_000)
          : get().seed); // in level mode, keep current seed unless provided
      const { rows, cols, redRatio } = get();
      const grid = generateGrid({ rows, cols, seed: s, redRatio });
      set((st) => {
        st.seed = s;
        st.grid = grid;
      });
    },
  }))
);
