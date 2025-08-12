import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Cell } from '../game/grid';
import { generateGrid } from '../game/grid';
import type { LevelDef } from '../game/levels';

type Difficulty = 'easy' | 'medium' | 'hard';

function redRatioFor(d: Difficulty): number {
  // redRatio = P(cell is Red). Easy favors Blue (more blue cells overall).
  if (d === 'easy') return 0.40; // ~60% Blue
  if (d === 'hard') return 0.60; // ~60% Red
  return 0.50; // balanced
}

type GameState = {
  // Board & grid
  rows: number;
  cols: number;
  cellSize: number;
  seed: number;
  grid: Cell[];

  // Modes & difficulty
  mode: 'freeplay' | 'level';
  difficulty: Difficulty;
  redRatio: number;

  // District config
  totalDistricts: number;
  cellsPerDistrict: number;

  // Level target & rules
  targetSeats: { R: number; B: number };
  requireAllAssigned: boolean;
  requireExactSizes: boolean;
  requireContiguity: boolean;

  // Tool state
  currentDistrict: number; // 0 = Eraser, 1..N = districts
  isPainting: boolean;
  paintDistrict: number | null;

  // Level state
  currentLevelIndex: number | null;

  // Actions
  setCurrentDistrict: (d: number) => void;
  setDifficulty: (d: Difficulty) => void;
  loadLevel: (level: LevelDef, index: number) => void;
  startPainting: (d?: number) => void;
  paintCellByIndex: (index: number) => void;
  stopPainting: () => void;
  regenerate: (seed?: number) => void;
};

// ---------- Contiguity helpers ----------

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

// Allow adding a cell if the district is empty OR the cell is adjacent (4-neighbor) to it.
function isAdditionSafe(grid: Cell[], rows: number, cols: number, d: number, addIndex: number): boolean {
  let hasAny = false;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].districtId === d) { hasAny = true; break; }
  }
  if (!hasAny) return true;
  for (const nb of neighbors4(addIndex, rows, cols)) {
    if (grid[nb] && grid[nb].districtId === d) return true;
  }
  return false;
}

// Safe to remove a cell from district d if the remainder stays in one component.
function isRemovalSafe(grid: Cell[], rows: number, cols: number, d: number, removeIndex: number): boolean {
  const remaining: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (i !== removeIndex && grid[i].districtId === d) remaining.push(i);
  }
  if (remaining.length === 0) return true; // removing the last cell is fine

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

// ---------- Store ----------

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

    targetSeats: { R: 2, B: 3 },
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true, // toggled per level

    currentDistrict: 1,
    isPainting: false,
    paintDistrict: null,

    currentLevelIndex: null,

    setCurrentDistrict: (d) =>
      set((st) => {
        if (d < 0) d = 0;
        if (d > st.totalDistricts) d = st.totalDistricts;
        st.currentDistrict = d;
      }),

    setDifficulty: (d) =>
      set((st) => {
        st.mode = 'freeplay';
        st.currentLevelIndex = null;
        st.difficulty = d;
        st.redRatio = redRatioFor(d);
        const s = Math.floor(Math.random() * 1_000_000);
        st.seed = s;
        st.grid = generateGrid({ rows: st.rows, cols: st.cols, seed: s, redRatio: st.redRatio });
      }),

    loadLevel: (level, index) =>
      set((st) => {
        st.mode = 'level';
        st.currentLevelIndex = index;

        st.rows = level.rows;
        st.cols = level.cols;
        st.totalDistricts = level.totalDistricts;
        st.cellsPerDistrict = level.cellsPerDistrict;

        st.targetSeats = level.targetSeats;
        st.requireAllAssigned = level.requireAllAssigned;
        st.requireExactSizes = level.requireExactSizes;
        st.requireContiguity = level.requireContiguity;

        st.redRatio = level.redRatio;
        st.seed = level.seed;

        // reset tool state
        st.currentDistrict = 1;
        st.isPainting = false;
        st.paintDistrict = null;

        st.grid = generateGrid({ rows: st.rows, cols: st.cols, seed: st.seed, redRatio: st.redRatio });
      }),

    startPainting: (d) =>
      set((st) => {
        st.isPainting = true;
        st.paintDistrict = d ?? st.currentDistrict;
      }),

    paintCellByIndex: (index) =>
      set((st) => {
        const d = st.paintDistrict ?? st.currentDistrict; // 0 = Eraser
        const { rows, cols, cellsPerDistrict, requireContiguity } = st;
        const cell = st.grid[index];
        if (!cell) return;

        // ----- ERASE (unassign) -----
        if (d === 0) {
          const source = cell.districtId;
          if (!source) return; // already unassigned
          // Only block splits if contiguity is required for this level
          if (requireContiguity && !isRemovalSafe(st.grid, rows, cols, source, index)) return;
          cell.districtId = undefined;
          return;
        }

        // ----- PAINT to district d -----
        if (cell.districtId === d) return; // no-op

        // Size cap is always enforced
        let targetSize = 0;
        for (const c of st.grid) if (c.districtId === d) targetSize++;
        if (targetSize >= cellsPerDistrict) return;

        // Only enforce adjacency if contiguity is required
        if (requireContiguity && !isAdditionSafe(st.grid, rows, cols, d, index)) return;

        // Moving from another district: only block if contiguity required
        const source = cell.districtId;
        if (source && source !== d) {
          if (requireContiguity && !isRemovalSafe(st.grid, rows, cols, source, index)) return;
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
          : get().seed); // in level mode, keep the seed unless explicitly provided
      const { rows, cols, redRatio } = get();
      const grid = generateGrid({ rows, cols, seed: s, redRatio });
      set((st) => {
        st.seed = s;
        st.grid = grid;
      });
    },
  }))
);
