import { LEVELS } from '../game/levels';
import { useGame } from '../store/useGame';

export default function LevelPicker() {
  const { loadLevel, mode, currentLevelIndex, setMode, progressUnlockedThrough } = useGame();

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>
          Levels — World 1
          <span style={{ fontWeight: 500, marginLeft: 8, fontSize: 12, opacity: 0.8 }}>
            Unlocked: {progressUnlockedThrough + 1}/{LEVELS.length}
          </span>
        </div>
        <button
          onClick={() => setMode('freeplay')}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
          title="Switch to Freeplay"
        >
          Back to Freeplay
        </button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {LEVELS.map((lvl, i) => {
          const isActive = mode === 'level' && currentLevelIndex === i;
          const locked = i > progressUnlockedThrough;
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
                opacity: locked ? 0.6 : 1,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{lvl.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{lvl.blurb}</div>
              </div>
              <button
                onClick={() => !locked && loadLevel(lvl, i)}
                disabled={locked}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  background: '#fff',
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
                title={locked ? 'Locked — complete earlier levels to unlock' : 'Play this level'}
              >
                {locked ? 'Locked' : isActive ? 'Loaded' : 'Play'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
