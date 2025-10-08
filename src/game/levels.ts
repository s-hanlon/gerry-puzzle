// src/game/levels.ts
export type LevelDef = {
  world: number;                  // NEW: which world it belongs to
  name: string;
  rows: number;
  cols: number;
  seed: number;
  redRatio: number;               // P(R)
  totalDistricts: number;
  cellsPerDistrict: number;
  targetSeats: { R: number; B: number };   // 0–0 => ignored
  requireAllAssigned: boolean;
  requireExactSizes: boolean;
  requireContiguity: boolean;
  lockedSeedsPerDistrict?: number;
  blurb?: string;
};

// Keep this FLAT so indexing/unlock logic still works.
// (We’ll group by `world` only in the UI.)
export const LEVELS: LevelDef[] = [
  // ---------- World 1 ----------
  {
    world: 1,
    name: '1-1: Paint to Size',
    rows: 20, cols: 20, seed: 10101, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 0, B: 0 }, // ignored
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: false,
    lockedSeedsPerDistrict: 0,
    blurb: 'Fill all districts to exact size. Contiguity OFF.',
  },
  {
    world: 1,
    name: '1-2: Keep It Connected',
    rows: 20, cols: 20, seed: 20202, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 0, B: 0 }, // ignored
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,
    lockedSeedsPerDistrict: 0,
    blurb: 'Exact sizes + contiguity ON.',
  },
  {
    world: 1,
    name: '1-3: Win 3–2 for Blue',
    rows: 20, cols: 20, seed: 30303, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 2, B: 3 },
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,
    lockedSeedsPerDistrict: 0,
    blurb: 'Exact sizes, contiguous, reach B 3–2.',
  },

  // ---------- World 2 ----------
  {
    world: 2,
    name: '2-1: Find Your Capitals',
    rows: 20, cols: 20, seed: 40404, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 0, B: 0 }, // ignored
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,
    lockedSeedsPerDistrict: 1,
    blurb: 'Each district has 1 locked seed; build out contiguously.',
  },
  {
    world: 2,
    name: '2-2: Doubling Down',
    rows: 20, cols: 20, seed: 50505, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 0, B: 0 }, // ignored
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,
    lockedSeedsPerDistrict: 2,
    blurb: 'Two locked seeds per district — plan your corridors.',
  },
  {
    world: 2,
    name: '2-3: Tilted Map (Red-lean)',
    rows: 20, cols: 20, seed: 60606, redRatio: 0.60, // more Red overall
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 3, B: 2 }, // exact 3–2 Red
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,
    lockedSeedsPerDistrict: 1,
    blurb: 'Seeded starts on a Red-leaning map; win 3–2 for Red.',
  },
];
