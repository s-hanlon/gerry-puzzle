export type Cell = {
  id: number;
  r: number;
  c: number;
  color: 'R' | 'B';
};

export type LevelConfig = {
  rows: number;
  cols: number;
  seed: number;
  redRatio?: number; // 0..1, default 0.5
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateGrid(cfg: LevelConfig): Cell[] {
  const { rows, cols, seed, redRatio = 0.5 } = cfg;
  const rand = mulberry32(seed);
  const cells: Cell[] = [];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isRed = rand() < redRatio;
      cells.push({ id: id++, r, c, color: isRed ? 'R' : 'B' });
    }
  }
  return cells;
}
