import './App.css';
import Board from './canvas/Board';
import { useGame } from './store/useGame';

function DistrictPicker() {
  const { totalDistricts, currentDistrict, setCurrentDistrict } = useGame();
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
        {d}
      </button>
    );
  }
  return <div style={{ display: 'flex', gap: 8 }}>{buttons}</div>;
}

export default function App() {
  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 12 }}>Gerry Puzzle (MVP)</h1>
      <p style={{ marginTop: 0, marginBottom: 12, opacity: 0.8 }}>
        Click and drag to paint cells into the selected district.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontWeight: 600 }}>Current district:</span>
        <DistrictPicker />
      </div>

      <Board />
    </div>
  );
}
