import { useMemo } from 'react';
import { useGame } from '../store/useGame';
import { computeStats } from '../game/scoring';
import { computeContiguity } from '../game/contiguity';

export default function HUD() {
  const { grid, totalDistricts, cellsPerDistrict, rows, cols } = useGame();

  const stats = useMemo(
    () => computeStats(grid, totalDistricts, cellsPerDistrict),
    [grid, totalDistricts, cellsPerDistrict]
  );
  const contig = useMemo(
    () => computeContiguity(grid, totalDistricts, rows, cols),
    [grid, totalDistricts, rows, cols]
  );

  const contigById = useMemo(() => {
    const m = new Map<number, { components: number; contiguous: boolean; size: number }>();
    for (const c of contig) m.set(c.id, { components: c.components, contiguous: c.contiguous, size: c.size });
    return m;
  }, [contig]);

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: '1px solid #e5e5e5',
        borderRadius: 8,
        background: '#fafafa',
        fontFamily: 'Inter, system-ui, Arial',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
        <strong>Unassigned:</strong>
        <span>
          {stats.unassigned} {stats.unassigned === 0 ? '✅' : '❌'}
        </span>
        <strong>Cells / district:</strong>
        <span>
          {cellsPerDistrict} {stats.sizeAllOk ? '✅' : '❌'}
        </span>
        <strong>Seats:</strong>
        <span>R {stats.totalRSeats} · B {stats.totalBSeats}</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th style={{ padding: '6px 4px' }}>District</th>
            <th style={{ padding: '6px 4px' }}>Size</th>
            <th style={{ padding: '6px 4px' }}>R</th>
            <th style={{ padding: '6px 4px' }}>B</th>
            <th style={{ padding: '6px 4px' }}>Winner</th>
            <th style={{ padding: '6px 4px' }}>Contiguity</th>
          </tr>
        </thead>
        <tbody>
          {stats.districts.map((d) => {
            const c = contigById.get(d.id);
            const contigCell =
              !c || d.size === 0
                ? '—'
                : c.contiguous
                ? '✅ contiguous'
                : `${c.components} islands ❌`;
            return (
              <tr key={d.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '6px 4px' }}>D{d.id}</td>
                <td style={{ padding: '6px 4px' }}>
                  {d.size} / {cellsPerDistrict} {d.sizeOk ? '✅' : '❌'}
                </td>
                <td style={{ padding: '6px 4px' }}>{d.r}</td>
                <td style={{ padding: '6px 4px' }}>{d.b}</td>
                <td style={{ padding: '6px 4px' }}>{d.winner}</td>
                <td style={{ padding: '6px 4px' }}>{contigCell}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
