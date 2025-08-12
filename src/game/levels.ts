export type LevelDef = {
  name: string;
  rows: number;
  cols: number;
  seed: number;
  redRatio: number;              // overall composition
  totalDistricts: number;
  cellsPerDistrict: number;
  targetSeats: { R: number; B: number };
  requireAllAssigned: boolean;
  requireExactSizes: boolean;
  requireContiguity: boolean;
  blurb?: string;
};

// World 1 — Basics (3 starter levels)
export const LEVELS: LevelDef[] = [
  {
    name: '1-1: Paint to Size',
    rows: 20, cols: 20, seed: 10101, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 0, B: 0 }, // ignore seats
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: false,
    blurb: 'Fill all districts to exact size. No contiguity required.',
  },
  {
    name: '1-2: Keep It Connected',
    rows: 20, cols: 20, seed: 20202, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 0, B: 0 }, // ignore seats
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,
    blurb: 'Exact sizes + contiguity.',
  },
  {
    name: '1-3: Win 3–2 for Blue',
    rows: 20, cols: 20, seed: 30303, redRatio: 0.50,
    totalDistricts: 5, cellsPerDistrict: 80,
    targetSeats: { R: 2, B: 3 },
    requireAllAssigned: true,
    requireExactSizes: true,
    requireContiguity: true,
    blurb: 'Exact sizes, contiguous, and reach B 3–2.',
  },
];
