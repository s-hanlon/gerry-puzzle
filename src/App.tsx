import './App.css';
import Board from './canvas/Board';

function App() {
  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 12 }}>Gerry Puzzle (MVP)</h1>
      <p style={{ marginTop: 0, marginBottom: 16, opacity: 0.8 }}>
        This is a seeded red/blue voter grid. Click “Regenerate” for a new seed.
      </p>
      <Board />
    </div>
  );
}

export default App;
