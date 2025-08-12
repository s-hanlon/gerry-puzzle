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

// Can we add `addIndex` to district `d` without creating a new island?
// Allow if district is empty, OR if addIndex touches any existing cell in d.
function isAdditionSafe(grid: Cell[], rows: number, cols: number, d: number, addIndex: number): boolean {
  let hasAny = false;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].districtId === d) {
      hasAny = true;
      break;
    }
  }
  if (!hasAny) return true; // first cell of the district is always fine

  // Must be adjacent (4-neighbor) to at least one existing cell in d
  for (const nb of neighbors4(addIndex, rows, cols)) {
    if (grid[nb] && grid[nb].districtId === d) return true;
  }
  return false;
}

// If we remove `removeIndex` from district `d` (i.e., reassign elsewhere),
// does district `d` stay in ONE piece? If not, it's unsafe.
function isRemovalSafe(grid: Cell[], rows: number, cols: number, d: number, removeIndex: number): boolean {
  // Build set of remaining indices in district d (excluding the one being removed)
  const remaining: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (i !== removeIndex && grid[i].districtId === d) remaining.push(i);
  }
  if (remaining.length === 0) return true; // removing the last cell is fine

  const allowed = new Set(remaining);
  // BFS from the first remaining index
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

  // If we reached all remaining cells, it's still one component
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
    // 20*20 = 400; 400 / 5 = 80 per district
    cellsPerDistrict: 80,

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
        const { rows, cols, cellsPerDistrict } = st;
        const cell = st.grid[index];
        if (!cell) return;

        // Already in this district? no-op
        if (cell.districtId === d) return;

        // Enforce target size cap
        let targetSize = 0;
        for (const c of st.grid) if (c.districtId === d) targetSize++;
        if (targetSize >= cellsPerDistrict) return;

        // Enforce "no new islands" for target district
        if (!isAdditionSafe(st.grid, rows, cols, d, index)) return;

        // Enforce "don't split the source district"
        const source = cell.districtId;
        if (source && source !== d) {
          if (!isRemovalSafe(st.grid, rows, cols, source, index)) {
            return; // unsafe to remove from source (would split it)
          }
        }

        // All checks passed; reassign the cell
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
