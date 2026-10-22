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
      <div className="pulse__head">
        <div>
          <div className="pulse__big">{total}</div>
          <div className="pulse__label">open nearby</div>
        </div>
        <div>
          <div className="pulse__big pulse__big--warm">{doneThisWeek ?? '–'}</div>
          <div className="pulse__label">helped this week</div>
        </div>
      </div>
      <div className="pulse__bars" role="list">
        <button className={`chip ${active === 'all' ? 'chip--on' : ''}`} onClick={() => onPick('all')}>
          All
        </button>
        {CATEGORIES.map((c) => {
          const n = byCat.get(c.id) ?? 0;
          return (
            <button
              key={c.id}
              role="listitem"
              className={`chip chip--bar ${active === c.id ? 'chip--on' : ''}`}
              style={{ ['--accent' as string]: c.color, ['--fill' as string]: `${(n / max) * 100}%` }}
              onClick={() => onPick(active === c.id ? 'all' : c.id)}
              title={`${n} open ${c.label.toLowerCase()} posts`}
            >
              <span>{c.emoji}</span>
              <span className="chip__n">{n}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
