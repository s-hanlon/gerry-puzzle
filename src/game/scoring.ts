import type { Cell } from './grid';

export type DistrictStats = {
  id: number;
  size: number;
  r: number;
  b: number;
  winner: 'R' | 'B' | 'Tie' | 'Unassigned';
  sizeOk: boolean;
};

export type BoardStats = {
  districts: DistrictStats[];
  totalRSeats: number;
  totalBSeats: number;
  unassigned: number;
  allAssigned: boolean;
  sizeAllOk: boolean;
};

export function computeStats(
  grid: Cell[],
  totalDistricts: number,
  cellsPerDistrict: number
): BoardStats {
  const groups: Cell[][] = Array.from({ length: totalDistricts + 1 }, () => []);
  let unassigned = 0;

  for (const cell of grid) {
    const d = cell.districtId;
    if (typeof d === 'number' && d >= 1 && d <= totalDistricts) groups[d].push(cell);
    else unassigned++;
  }

  const districts: DistrictStats[] = [];
  let totalRSeats = 0;
  let totalBSeats = 0;

  for (let d = 1; d <= totalDistricts; d++) {
    const arr = groups[d];
    const size = arr.length;
    let r = 0;
    for (const cell of arr) if (cell.color === 'R') r++;
    const b = size - r;

    let winner: 'R' | 'B' | 'Tie' | 'Unassigned';
    if (size === 0) winner = 'Unassigned';
    else if (r > b) {
      winner = 'R';
      totalRSeats++;
    } else if (b > r) {
      winner = 'B';
      totalBSeats++;
    } else winner = 'Tie';

    const sizeOk = size === cellsPerDistrict;
    districts.push({ id: d, size, r, b, winner, sizeOk });
  }

  const allAssigned = unassigned === 0;
  const sizeAllOk = districts.every((d) => d.sizeOk);

  return { districts, totalRSeats, totalBSeats, unassigned, allAssigned, sizeAllOk };
}
