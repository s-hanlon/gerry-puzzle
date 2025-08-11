import { useMemo, useCallback, useRef } from 'react';
import { Application, extend } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import type { Graphics as PixiGraphics } from 'pixi.js';
import { useGame } from '../store/useGame';

// Register Pixi classes so we can use <pixiContainer> / <pixiGraphics>
extend({ Container, Graphics });

export default function Board() {
  const { rows, cols, cellSize, grid, regenerate } = useGame();

  const width = cols * cellSize;
  const height = rows * cellSize;

  // We'll size the canvas to this div
  const parentRef = useRef<HTMLDivElement>(null);

  const drawCell = useCallback(
    (g: PixiGraphics, x: number, y: number, color: 'R' | 'B') => {
      g.clear();
      const fill = color === 'R' ? 0xdd1144 : 0x4499ff;
      // Pixi v8 chainable API
      g.rect(x, y, cellSize - 1, cellSize - 1).fill(fill);
    },
    [cellSize]
  );

  const cells = useMemo(() => {
    return grid.map((cell) => {
      const x = cell.c * cellSize;
      const y = cell.r * cellSize;
      return (
        <pixiGraphics
          key={cell.id}
          draw={(g: PixiGraphics) => drawCell(g, x, y, cell.color)}
        />
      );
    });
  }, [grid, cellSize, drawCell]);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        ref={parentRef}
        style={{ width, height, border: '1px solid #ddd', borderRadius: 6 }}
      >
        {/* v8 uses <Application> instead of Stage.
           We size the canvas to this div via resizeTo. */}
        <Application resizeTo={parentRef}>
          <pixiContainer>{cells}</pixiContainer>
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
