// src/game/grid.ts
export type Cell = {
  id: number;
  r: number;
  c: number;
  color: 'R' | 'B';
  districtId?: number;
  locked?: boolean;   // NEW: cannot change assignment if true
  blocked?: boolean;  // reserved for future "obstacle" mechanic
};

type GenOpts = {
  rows: number;
  cols: number;
  seed: number;
  redRatio: number;              // P(cell is Red)
  totalDistricts?: number;       // needed if using lockedSeedsPerDistrict
  lockedSeedsPerDistrict?: number; // how many pre-locked seed cells per district
};

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    // Numerical Recipes LCG
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function generateGrid(opts: GenOpts): Cell[] {
  const { rows, cols, seed, redRatio } = opts;
  const rnd = lcg(seed);
  const N = rows * cols;

  // base cells with partisan color
  const grid: Cell[] = new Array(N);
  for (let i = 0; i < N; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    grid[i] = {
      id: i,
      r,
      c,
      color: rnd() < redRatio ? 'R' : 'B',
      districtId: undefined,
      locked: false,
      blocked: false,
    };
  }

  // Optional: seed "locked" cells per district
  const seedsPer = Math.max(0, opts.lockedSeedsPerDistrict ?? 0);
  const D = Math.max(1, opts.totalDistricts ?? 0);

  if (seedsPer > 0 && D > 0) {
    // pick distinct random indices; assign 1..D in round-robin fashion
    const chosen = new Set<number>();
    const totalSeeds = seedsPer * D;

    let tries = 0;
    while (chosen.size < totalSeeds && tries < totalSeeds * 20) {
      const idx = Math.floor(rnd() * N);
      // avoid picking two seeds right next to each other (soft spacing)
      const r0 = Math.floor(idx / cols);
      const c0 = idx % cols;
      let near = false;
      for (const j of chosen) {
        const r1 = Math.floor(j / cols);
        const c1 = j % cols;
        if (Math.abs(r0 - r1) + Math.abs(c0 - c1) <= 2) {
          near = true;
          break;
        }
      }
      if (!near) chosen.add(idx);
      tries++;
    }
    // fallback if spacing failed
    while (chosen.size < totalSeeds) {
      chosen.add(Math.floor(rnd() * N));
    }

    let d = 1;
    for (const idx of chosen) {
      grid[idx].districtId = d;
      grid[idx].locked = true;
      d++;
      if (d > D) d = 1;
    }
  }

  return grid;
}
