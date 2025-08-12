import { useMemo } from 'react';
import { useGame } from '../store/useGame';
import { evaluateWin } from '../game/win';

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

  if (result.isWin) {
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
        }}
      >
        <div style={{ fontWeight: 700 }}>✅ Level Complete!</div>
        <div>
          Seats: R {result.seatsR} · B {result.seatsB} — Target R {targetSeats.R} · B {targetSeats.B}
        </div>
        <button
          onClick={() => regenerate()}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #80d199',
            background: '#f6fffa',
            cursor: 'pointer',
          }}
        >
          New Map
        </button>
      </div>
    );
  }

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
