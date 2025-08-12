import { LEVELS } from '../game/levels';
import { useGame } from '../store/useGame';

export default function LevelPicker() {
  const { loadLevel, mode, currentLevelIndex } = useGame();

  return (
    <div
      style={{
        marginTop: 8,
        padding: 12,
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        background: '#fbfbfb',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Levels — World 1</div>
      <div style={{ display: 'grid', gap: 8 }}>
        {LEVELS.map((lvl, i) => {
          const isActive = mode === 'level' && currentLevelIndex === i;
          return (
            <div
              key={lvl.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 8,
                border: '1px solid #eee',
                borderRadius: 6,
                background: isActive ? '#eef7ff' : '#fff',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{lvl.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{lvl.blurb}</div>
              </div>
              <button
                onClick={() => loadLevel(lvl, i)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: 'pointer',
                }}
                title="Load this level"
              >
                {isActive ? 'Loaded' : 'Play'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
