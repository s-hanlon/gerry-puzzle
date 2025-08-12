import { useMemo } from 'react';
import { useGame } from '../store/useGame';
import { computeStats } from '../game/scoring';
import { computeContiguity } from '../game/contiguity';

export default function HUD() {
  const {
    grid,
    totalDistricts,
    cellsPerDistrict,
    rows,
    cols,
    mode,
    requireContiguity,
    targetSeats,
  } = useGame();

  // Existing stats
  const stats = useMemo(
    () => computeStats(grid, totalDistricts, cellsPerDistrict),
    [grid, totalDistricts, cellsPerDistrict]
  );
  const contig = useMemo(
    () => computeContiguity(grid, totalDistricts, rows, cols),
    [grid, totalDistricts, rows, cols]
  );

  // Global composition + unassigned pool
  const { totalR, totalB, unassignedR, unassignedB } = useMemo(() => {
    let totalR = 0, unassignedR = 0;
    for (const cell of grid) {
      if (cell.color === 'R') {
        totalR++;
        if (!cell.districtId) unassignedR++;
      }
    }
    const totalB = grid.length - totalR;
    const unassignedB = stats.unassigned - unassignedR;
    return { totalR, totalB, unassignedR, unassignedB };
  }, [grid, stats.unassigned]);

  const contigById = useMemo(() => {
    const m = new Map<number, { components: number; contiguous: boolean; size: number }>();
    for (const c of contig) m.set(c.id, { components: c.components, contiguous: c.contiguous, size: c.size });
    return m;
  }, [contig]);

  const seatTargetEnabled = (targetSeats.R + targetSeats.B) > 0;

  const chip = (label: string, value: string) => (
    <span
      style={{
        fontSize: 12,
        padding: '4px 8px',
        borderRadius: 999,
        border: '1px solid #e0e0e0',
        background: '#fff',
      }}
    >
      <strong>{label}:</strong> {value}
    </span>
  );

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
      {/* NEW: Chips row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {chip('Mode', mode === 'level' ? 'Level' : 'Freeplay')}
        {chip('Contiguity', requireContiguity ? 'ON' : 'OFF')}
        {chip('Seat target', seatTargetEnabled ? `R ${targetSeats.R} · B ${targetSeats.B}` : 'ignored')}
      </div>

      {/* Global composition */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
        <strong>Board composition:</strong>
        <span>R {totalR} · B {totalB}</span>
        <strong>Unassigned pool:</strong>
        <span>R {unassignedR} · B {unassignedB}</span>
      </div>

      {/* Topline */}
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
