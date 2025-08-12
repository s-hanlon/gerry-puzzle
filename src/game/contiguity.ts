import type { Cell } from './grid';

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

/** Count connected components within a single district using BFS (4-neighbor). */
export function countComponentsForDistrict(
  grid: Cell[],
  districtId: number,
  rows: number,
  cols: number
): { components: number; size: number } {
  const cellsInD: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].districtId === districtId) cellsInD.push(i);
  }
  const size = cellsInD.length;
  if (size === 0) return { components: 0, size: 0 };

  const inSet = new Set(cellsInD);
  const visited = new Set<number>();
  let components = 0;

  for (const start of cellsInD) {
    if (visited.has(start)) continue;
    components++;
    // BFS
    const q: number[] = [start];
    visited.add(start);
    while (q.length) {
      const cur = q.shift()!;
      for (const nb of neighbors4(cur, rows, cols)) {
        if (!inSet.has(nb) || visited.has(nb)) continue;
        visited.add(nb);
        q.push(nb);
      }
    }
  }

  return { components, size };
}

/** Compute contiguity info for all districts. */
export function computeContiguity(
  grid: Cell[],
  totalDistricts: number,
  rows: number,
  cols: number
): Array<{ id: number; components: number; size: number; contiguous: boolean }> {
  const out: Array<{ id: number; components: number; size: number; contiguous: boolean }> = [];
  for (let d = 1; d <= totalDistricts; d++) {
    const { components, size } = countComponentsForDistrict(grid, d, rows, cols);
    out.push({ id: d, components, size, contiguous: components <= 1 });
  }
  return out;
}
