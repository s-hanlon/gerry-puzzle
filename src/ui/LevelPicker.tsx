import { useMemo } from 'react';
import { LEVELS } from '../game/levels';
import { useGame } from '../store/useGame';

export default function LevelPicker() {
  const { loadLevel, mode, currentLevelIndex, setMode, progressUnlockedThrough } = useGame();

  // Group the flat LEVELS by world, keeping original order and global indices.
  const groups = useMemo(() => {
    const m = new Map<number, { index: number; name: string; blurb?: string }[]>();
    LEVELS.forEach((lvl, idx) => {
      const w = lvl.world ?? 1;
      const arr = m.get(w) ?? [];
      arr.push({ index: idx, name: lvl.name, blurb: lvl.blurb });
      m.set(w, arr);
    });
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, []);

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
          Levels
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

      {/* Render a section per world */}
      <div style={{ display: 'grid', gap: 14 }}>
        {groups.map(([world, items]) => (
          <div key={world} style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700, opacity: 0.9 }}>World {world}</div>
            {items.map(({ index }) => {
              const lvl = LEVELS[index];
              const isActive = mode === 'level' && currentLevelIndex === index;
              const locked = index > progressUnlockedThrough;
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
                    onClick={() => !locked && loadLevel(lvl, index)}
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
        ))}
      </div>
    </div>
  );
}
