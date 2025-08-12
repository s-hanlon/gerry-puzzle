import { computeStats } from './scoring';
import { computeContiguity } from './contiguity';
import type { Cell } from './grid';

export type WinResult = {
  seatsR: number;
  seatsB: number;
  allAssigned: boolean;
  sizeAllOk: boolean;
  contiguityAllOk: boolean;
  meetsSeatTarget: boolean;
  isWin: boolean;
  unmetReasons: string[];
};

export function evaluateWin(
  grid: Cell[],
  rows: number,
  cols: number,
  totalDistricts: number,
  cellsPerDistrict: number,
  targetSeats: { R: number; B: number },
  opts: { requireAllAssigned: boolean; requireExactSizes: boolean; requireContiguity: boolean }
): WinResult {
  const stats = computeStats(grid, totalDistricts, cellsPerDistrict);
  const contig = computeContiguity(grid, totalDistricts, rows, cols);

  const contiguityAllOk = contig.every((c) => c.size === 0 || c.contiguous);
  const seatsR = stats.totalRSeats;
  const seatsB = stats.totalBSeats;
  const seatTargetEnabled = (targetSeats.R + targetSeats.B) > 0;
  const meetsSeatTarget = !seatTargetEnabled
    || (seatsR === targetSeats.R && seatsB === targetSeats.B);

  const unmetReasons: string[] = [];
  if (opts.requireAllAssigned && !stats.allAssigned) unmetReasons.push('Assign all cells');
  if (opts.requireExactSizes && !stats.sizeAllOk) unmetReasons.push('Each district must be exact size');
  if (opts.requireContiguity && !contiguityAllOk) unmetReasons.push('All districts must be contiguous');
  if (seatTargetEnabled && !meetsSeatTarget)
    unmetReasons.push(`Seats must be R ${targetSeats.R} · B ${targetSeats.B}`);

  const isWin =
    (!opts.requireAllAssigned || stats.allAssigned) &&
    (!opts.requireExactSizes || stats.sizeAllOk) &&
    (!opts.requireContiguity || contiguityAllOk) &&
    meetsSeatTarget;


  return { seatsR, seatsB, allAssigned: stats.allAssigned, sizeAllOk: stats.sizeAllOk, contiguityAllOk, meetsSeatTarget, isWin, unmetReasons };
}
