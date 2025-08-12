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

// register Pixi classes for JSX elements: <pixiContainer>, <pixiGraphics>
extend({ Container, Graphics });

const DISTRICT_COLORS: number[] = [
  0x00c853, // 1
  0xffab00, // 2
  0x7c4dff, // 3
  0xff5252, // 4
  0x40c4ff, // 5
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

  // base voter cell
  const drawCell = useCallback(
    (g: PixiGraphics, x: number, y: number, color: 'R' | 'B') => {
      g.clear();
      const fill = color === 'R' ? 0xdd1144 : 0x4499ff;
      g.rect(x, y, cellSize - 1, cellSize - 1).fill(fill);
    },
    [cellSize]
  );

  // overlay for district assignment (semi-transparent)
  const drawDistrictOverlay = useCallback(
    (g: PixiGraphics, x: number, y: number, districtId?: number) => {
      g.clear();
      if (!districtId) return;
      const color = DISTRICT_COLORS[(districtId - 1) % DISTRICT_COLORS.length] ?? 0x000000;
      g.alpha = 0.35;
      g.rect(x, y, cellSize - 1, cellSize - 1).fill(color);
      g.alpha = 1;
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

  // canvas pixel -> cell index
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
            <pixiContainer>{cellsVoter}</pixiContainer>
            <pixiContainer>{cellsOverlay}</pixiContainer>
          </pixiContainer>
        </Application>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => regenerate()}>Regenerate (random seed)</button>
        <span style={{ opacity: 0.7 }}>
          Size: {rows}×{cols} · Cells: {grid.length}
        </span>
      </div>
    </div>
  );
}
