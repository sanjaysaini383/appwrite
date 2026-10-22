import type { PulseRow } from '../lib/api';
import { CATEGORIES, type Category } from '../lib/types';

type Props = {
  rows: PulseRow[];
  doneThisWeek: number | null;
  active: Category | 'all';
  onPick: (c: Category | 'all') => void;
};

export function PulseBar({ rows, doneThisWeek, active, onPick }: Props) {
  const total = rows.reduce((s, r) => s + r.n, 0);
  const max = Math.max(1, ...rows.map((r) => r.n));
  const byCat = new Map(rows.map((r) => [r.category, r.n]));

  return (
    <section className="pulse">
      <div className="kpis">
        <div className="kpi">
          <div className="kpi__label">Open nearby</div>
          <div className="kpi__value">{total}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Helped this week</div>
          <div className="kpi__value kpi__value--accent">{doneThisWeek ?? '–'}</div>
        </div>
      </div>
      <div className="cats" role="list" aria-label="Filter by category">
        <button className={`cat ${active === 'all' ? 'cat--on' : ''}`} onClick={() => onPick('all')}>
          All
        </button>
        {CATEGORIES.map((c) => {
          const n = byCat.get(c.id) ?? 0;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              role="listitem"
              className={`cat ${active === c.id ? 'cat--on' : ''}`}
              style={{ ['--accent-cat' as string]: c.color, ['--fill' as string]: `${(n / max) * 100}%` }}
              onClick={() => onPick(active === c.id ? 'all' : c.id)}
              title={`${c.label}: ${n} open`}
            >
              <Icon size={14} strokeWidth={2} />
              <span className="cat__n">{n}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
