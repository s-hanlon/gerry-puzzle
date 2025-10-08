import { useMemo, useCallback, useRef } from 'react';
import { Application, extend } from '@pixi/react';
import {
  Container,
  Graphics,
  Rectangle,
  type Graphics as PixiGraphics,
  type FederatedPointerEvent,
} from 'pixi.js';
import { useGame } from '../store/useGame';

extend({ Container, Graphics });

const DISTRICT_COLORS: number[] = [
  0x00c853, // 1
  0xffab00, // 2
  0x7c4dff, // 3
  0xff5252, // 4
  0x40c4ff, // 5
  0xb388ff, // 6 (future)
  0x8bc34a, // 7 (future)
];

export default function Board() {
  const {
    rows,
    cols,
    cellSize,
    grid,
    regenerate,
    isPainting,
    startPainting,
    paintCellByIndex,
    stopPainting,
  } = useGame();

  const width = cols * cellSize;
  const height = rows * cellSize;
  const parentRef = useRef<HTMLDivElement>(null);

  // Base voter cell (solid red/blue)
  const drawCell = useCallback(
    (g: PixiGraphics, x: number, y: number, color: 'R' | 'B') => {
      g.clear();
      const fill = color === 'R' ? 0xdd1144 : 0x4499ff;
      g.rect(x, y, cellSize - 1, cellSize - 1).fill(fill);
    },
    [cellSize]
  );

  // Semi-transparent district overlay
  const drawDistrictOverlay = useCallback(
    (g: PixiGraphics, x: number, y: number, districtId?: number) => {
      g.clear();
      if (!districtId) return;
      const color = DISTRICT_COLORS[(districtId - 1) % DISTRICT_COLORS.length] ?? 0x000000;
      g.rect(x, y, cellSize - 1, cellSize - 1)
        .fill({ color, alpha: 0.75 }) // <-- tweak here if you want
        .stroke({ color, alpha: 0.6, width: 1 });
    },
    [cellSize]
  );

  // Tiny markers (locked pad + future blocked 'X')
  const drawMarkers = useCallback(
    (g: PixiGraphics, x: number, y: number, locked?: boolean, blocked?: boolean) => {
      g.clear();
      if (blocked) {
        // an 'X' to indicate obstacle (reserved for future)
        g.moveTo(x + 3, y + 3).lineTo(x + cellSize - 4, y + cellSize - 4).stroke({ width: 2, alpha: 0.9, color: 0x333333 });
        g.moveTo(x + cellSize - 4, y + 3).lineTo(x + 3, y + cellSize - 4).stroke({ width: 2, alpha: 0.9, color: 0x333333 });
        return;
      }
      if (locked) {
        // simple lock: small rounded rect + shackle
        const w = Math.max(6, Math.floor(cellSize / 3));
        const h = w;
        const px = x + cellSize - w - 3;
        const py = y + 3;
        g.roundRect(px, py, w, h, 2).fill({ color: 0xffd54f, alpha: 0.95 }).stroke({ color: 0x8d6e63, width: 1, alpha: 0.9 });
        // shackle
        g.moveTo(px + 2, py + 3).lineTo(px + 2, py + 1).stroke({ color: 0x8d6e63, width: 2, alpha: 0.9 });
        g.moveTo(px + w - 2, py + 3).lineTo(px + w - 2, py + 1).stroke({ color: 0x8d6e63, width: 2, alpha: 0.9 });
      }
    },
    [cellSize]
  );

  const cellsVoter = useMemo(
    () =>
      grid.map((cell) => {
        const x = cell.c * cellSize;
        const y = cell.r * cellSize;
        return (
          <pixiGraphics
            key={`v-${cell.id}`}
            draw={(g: PixiGraphics) => drawCell(g, x, y, cell.color)}
          />
        );
      }),
    [grid, cellSize, drawCell]
  );

  const cellsOverlay = useMemo(
    () =>
      grid.map((cell) => {
        const x = cell.c * cellSize;
        const y = cell.r * cellSize;
        return (
          <pixiGraphics
            key={`d-${cell.id}`}
            draw={(g: PixiGraphics) => drawDistrictOverlay(g, x, y, cell.districtId)}
          />
        );
      }),
    [grid, cellSize, drawDistrictOverlay]
  );

  const cellsMarkers = useMemo(
    () =>
      grid.map((cell) => {
        const x = cell.c * cellSize;
        const y = cell.r * cellSize;
        return (
          <pixiGraphics
            key={`m-${cell.id}`}
            draw={(g: PixiGraphics) => drawMarkers(g, x, y, cell.locked, cell.blocked)}
          />
        );
      }),
    [grid, cellSize, drawMarkers]
  );

  // Canvas pixel -> cell index
  const getIndexFromPointer = useCallback(
    (e: FederatedPointerEvent) => {
      const c = Math.floor(e.global.x / cellSize);
      const r = Math.floor(e.global.y / cellSize);
      if (r < 0 || r >= rows || c < 0 || c >= cols) return -1;
      return r * cols + c;
    },
    [cellSize, rows, cols]
  );

  const onPointerDown = useCallback(
    (e: FederatedPointerEvent) => {
      startPainting();
      const idx = getIndexFromPointer(e);
      if (idx >= 0) paintCellByIndex(idx);
    },
    [startPainting, getIndexFromPointer, paintCellByIndex]
  );

  const onPointerMove = useCallback(
    (e: FederatedPointerEvent) => {
      if (!isPainting) return;
      const idx = getIndexFromPointer(e);
      if (idx >= 0) paintCellByIndex(idx);
    },
    [isPainting, getIndexFromPointer, paintCellByIndex]
  );

  const onPointerUp = useCallback(() => {
    stopPainting();
  }, [stopPainting]);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        ref={parentRef}
        style={{ width, height, border: '1px solid #ddd', borderRadius: 6 }}
      >
        <Application resizeTo={parentRef}>
          <pixiContainer
            eventMode="static"
            hitArea={new Rectangle(0, 0, width, height)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerUpOutside={onPointerUp}
          >
            {/* Layer 1: base voter colors */}
            <pixiContainer>{cellsVoter}</pixiContainer>
            {/* Layer 2: transparent district overlay */}
            <pixiContainer>{cellsOverlay}</pixiContainer>
            {/* Layer 3: markers (locks / obstacles) */}
            <pixiContainer>{cellsMarkers}</pixiContainer>
          </pixiContainer>
        </Application>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => regenerate()}>Regenerate</button>
        <span style={{ opacity: 0.7 }}>
          Size: {rows}×{cols} · Cells: {grid.length}
        </span>
      </div>
    </div>
  );
}
