import { useEffect, useMemo, useRef } from 'react';
import { useGame } from '../store/useGame';
import { evaluateWin } from '../game/win';
import { LEVELS } from '../game/levels';

export default function WinBanner() {
  const {
    grid,
    rows,
    cols,
    totalDistricts,
    cellsPerDistrict,
    targetSeats,
    requireAllAssigned,
    requireExactSizes,
    requireContiguity,
    regenerate,
    mode,
    currentLevelIndex,
    nextLevel,
    retryLevel,
    unlockUpTo,
  } = useGame();

  const result = useMemo(
    () =>
      evaluateWin(
        grid,
        rows,
        cols,
        totalDistricts,
        cellsPerDistrict,
        targetSeats,
        {
          requireAllAssigned,
          requireExactSizes,
          requireContiguity,
        }
      ),
    [
      grid,
      rows,
      cols,
      totalDistricts,
      cellsPerDistrict,
      targetSeats,
      requireAllAssigned,
      requireExactSizes,
      requireContiguity,
    ]
  );

  // When a level is beaten, unlock the next level (idempotent).
  const unlockedForThisLevel = useRef(false);
  useEffect(() => {
    if (mode !== 'level') return;
    if (!result.isWin) {
      unlockedForThisLevel.current = false;
      return;
    }
    if (unlockedForThisLevel.current) return;
    if (currentLevelIndex === null) return;

    const nextIndex = currentLevelIndex + 1;
    if (nextIndex < LEVELS.length) unlockUpTo(nextIndex);
    unlockedForThisLevel.current = true;
  }, [mode, result.isWin, currentLevelIndex, unlockUpTo]);

  if (result.isWin) {
    const hasNext = mode === 'level' && currentLevelIndex !== null && currentLevelIndex + 1 < LEVELS.length;
    return (
      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 10,
          background: '#e9f9ee',
          border: '1px solid #b6e6c3',
          color: '#205c2f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontWeight: 700 }}>✅ Level Complete!</div>
        <div>
          Seats: R {result.seatsR} · B {result.seatsB} — Target R {targetSeats.R} · B {targetSeats.B}
        </div>
        {mode === 'level' ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={retryLevel}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #80d199', background: '#f6fffa', cursor: 'pointer' }}
            >
              Retry
            </button>
            <button
              onClick={nextLevel}
              disabled={!hasNext}
              title={hasNext ? 'Go to next level' : 'No more levels'}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #80d199', background: '#f6fffa', cursor: hasNext ? 'pointer' : 'not-allowed' }}
            >
              Next Level
            </button>
          </div>
        ) : (
          <button
            onClick={() => regenerate()}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #80d199', background: '#f6fffa', cursor: 'pointer' }}
          >
            New Map
          </button>
        )}
      </div>
    );
  }

  // Not a win yet -> show checklist status
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        background: '#f7f7f7',
        border: '1px solid #e5e5e5',
        color: '#333',
        display: 'grid',
        gap: 6,
      }}
    >
      <div><strong>Goal:</strong> Seats R {targetSeats.R} · B {targetSeats.B}</div>
      <div><strong>Current:</strong> R {result.seatsR} · B {result.seatsB}</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 14, opacity: 0.9 }}>
        {result.unmetReasons.map((r, i) => (
          <span key={i}>❌ {r}</span>
        ))}
        {result.unmetReasons.length === 0 && <span>…almost there</span>}
      </div>
    </div>
  );
}
