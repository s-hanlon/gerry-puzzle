import './App.css';
import Board from './canvas/Board';
import { useGame } from './store/useGame';
import { useMemo } from 'react';
import HUD from './ui/HUD';

function DistrictPicker() {
  const { grid, totalDistricts, cellsPerDistrict, currentDistrict, setCurrentDistrict } = useGame();

  // sizes per district + unassigned count
  const { sizes, unassigned } = useMemo(() => {
    const sizes = Array(totalDistricts + 1).fill(0); // 1..N used
    let unassigned = 0;
    for (const cell of grid) {
      if (!cell.districtId) unassigned++;
      else if (cell.districtId >= 1 && cell.districtId <= totalDistricts) {
        sizes[cell.districtId]++;
      }
    }
    return { sizes, unassigned };
  }, [grid, totalDistricts]);

  const buttons = [];

  // Eraser button (district 0)
  buttons.push(
    <button
      key="eraser"
      onClick={() => setCurrentDistrict(0)}
      style={{
        padding: '6px 10px',
        borderRadius: 6,
        border: currentDistrict === 0 ? '2px solid black' : '1px solid #ccc',
        background: currentDistrict === 0 ? '#fff' : '#f7f7f7',
        fontWeight: currentDistrict === 0 ? 700 : 500,
        cursor: 'pointer',
      }}
      title="Unassign cells (Eraser)"
    >
      Eraser ({unassigned})
    </button>
  );

  // District buttons 1..N
  for (let d = 1; d <= totalDistricts; d++) {
    const isActive = d === currentDistrict;
    buttons.push(
      <button
        key={d}
        onClick={() => setCurrentDistrict(d)}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: isActive ? '2px solid black' : '1px solid #ccc',
          background: isActive ? '#fff' : '#f7f7f7',
          fontWeight: isActive ? 700 : 500,
          cursor: 'pointer',
        }}
        title={`Set current district to ${d}`}
      >
        D{d} ({sizes[d]}/{cellsPerDistrict})
      </button>
    );
  }
  return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{buttons}</div>;
}

function SelectedDistrictStats() {
  const { grid, currentDistrict, cellsPerDistrict } = useGame();

  const { label, size, r, b } = useMemo(() => {
    if (currentDistrict === 0) {
      const unassigned = grid.reduce((acc, c) => acc + (c.districtId ? 0 : 1), 0);
      return { label: 'Eraser', size: unassigned, r: 0, b: 0 };
    }
    let size = 0,
      r = 0;
    for (const cell of grid) {
      if (cell.districtId === currentDistrict) {
        size++;
        if (cell.color === 'R') r++;
      }
    }
    const b = size - r;
    return { label: `D${currentDistrict}`, size, r, b };
  }, [grid, currentDistrict]);

  if (currentDistrict === 0) {
    return (
      <div style={{ fontSize: 14, opacity: 0.9 }}>
        <strong>{label}:</strong> Unassigned cells: {size}
      </div>
    );
  }

  return (
    <div style={{ fontSize: 14, opacity: 0.9 }}>
      <strong>{label}:</strong> {size}/{cellsPerDistrict} · R {r} / B {b}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 12 }}>Gerry Puzzle (MVP)</h1>
      <p style={{ marginTop: 0, marginBottom: 12, opacity: 0.8 }}>
        Click and drag to paint cells. Use <strong>Eraser</strong> to unassign (won’t allow splits).
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600 }}>Tool / District:</span>
        <DistrictPicker />
      </div>
      <SelectedDistrictStats />

      <Board />

      <HUD />
    </div>
  );
}
