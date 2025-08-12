import './App.css';
import Board from './canvas/Board';
import { useGame } from './store/useGame';
import { useMemo } from 'react';
import HUD from './ui/HUD';

function DistrictPicker() {
  const { grid, totalDistricts, cellsPerDistrict, currentDistrict, setCurrentDistrict } = useGame();

  const sizes = useMemo(() => {
    const arr = Array(totalDistricts + 1).fill(0);
    for (const cell of grid) {
      if (cell.districtId && cell.districtId >= 1 && cell.districtId <= totalDistricts) {
        arr[cell.districtId]++;
      }
    }
    return arr; // index by districtId
  }, [grid, totalDistricts]);

  const buttons = [];
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
  return <div style={{ display: 'flex', gap: 8 }}>{buttons}</div>;
}

function SelectedDistrictStats() {
  const { grid, currentDistrict, cellsPerDistrict } = useGame();

  const { size, r, b } = useMemo(() => {
    let size = 0,
      r = 0;
    for (const cell of grid) {
      if (cell.districtId === currentDistrict) {
        size++;
        if (cell.color === 'R') r++;
      }
    }
    const b = size - r;
    return { size, r, b };
  }, [grid, currentDistrict]);

  return (
    <div style={{ fontSize: 14, opacity: 0.9 }}>
      <strong>District D{currentDistrict}:</strong> {size}/{cellsPerDistrict} · R {r} / B {b}
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 12 }}>Gerry Puzzle (MVP)</h1>
      <p style={{ marginTop: 0, marginBottom: 12, opacity: 0.8 }}>
        Click and drag to paint cells into the selected district.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>Current district:</span>
        <DistrictPicker />
      </div>
      <SelectedDistrictStats />

      <Board />

      <HUD />
    </div>
  );
}
