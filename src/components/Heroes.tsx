import type { Hero } from '../lib/api';
import { Avatar } from './Avatar';

export function Heroes({ heroes, meId }: { heroes: Hero[]; meId?: string }) {
  if (!heroes.length) {
    return (
      <div className="empty">
        <div className="empty__art">🏅</div>
        <p>No kudos yet. Help a neighbour and when they mark it done, you'll show up here.</p>
      </div>
    );
  }
  const top = heroes[0]!.points;
  return (
    <ol className="heroes">
      {heroes.map((h, i) => (
        <li key={h.toId} className={`hero ${h.toId === meId ? 'hero--me' : ''}`}>
          <span className="hero__rank">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
          <Avatar id={h.toId} name={h.toName} size={34} />
          <div className="hero__main">
            <div className="hero__name">
              {h.toName}
              {h.toId === meId && <span className="badge badge--offer">you</span>}
            </div>
            <div className="hero__bar">
              <span style={{ width: `${(h.points / top) * 100}%` }} />
            </div>
          </div>
          <div className="hero__score">
            <strong>{h.points}</strong>
            <span>
              ★ · {h.helps} help{h.helps === 1 ? '' : 's'}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
