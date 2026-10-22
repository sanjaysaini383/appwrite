import { useEffect, useState } from 'react';
import { clearLog, subscribeLog, type LogEntry } from '../lib/inspector';

export function Inspector({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  useEffect(() => subscribeLog(setEntries), []);
  const latest = entries[0];

  return (
    <div className={`inspector ${open ? 'inspector--open' : ''}`}>
      <button className="inspector__toggle" onClick={onToggle} aria-expanded={open}>
        <span className="inspector__bolt">⚡</span>
        <span>TablesDB</span>
        <span className="inspector__count">{entries.length}</span>
        {latest && !open && (
          <span className="inspector__peek">
            {latest.op} <em>{latest.table}</em>
          </span>
        )}
      </button>
      {open && (
        <div className="inspector__panel">
          <div className="inspector__head">
            <div>
              <strong>Query Inspector</strong>
              <span>Every Appwrite TablesDB call this page makes, live.</span>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={clearLog}>
              Clear
            </button>
          </div>
          <ol className="inspector__list">
            {entries.map((e) => (
              <li key={e.id} className={`log ${e.ok === false ? 'log--err' : ''} ${e.op.startsWith('realtime') ? 'log--rt' : ''}`}>
                <div className="log__line">
                  <code className="log__op">{e.op}</code>
                  <span className="log__table">{e.table}</span>
                  <span className="log__ms">{e.ms === undefined ? (e.ok ? '' : '…') : `${e.ms} ms`}</span>
                </div>
                {e.detail.map((d, i) => (
                  <code key={i} className="log__detail">
                    {d}
                  </code>
                ))}
                {e.note && <div className="log__note">{e.note}</div>}
                {e.error && <div className="log__note log__note--err">{e.error}</div>}
              </li>
            ))}
            {!entries.length && <li className="log log--empty">Interact with the map to see queries.</li>}
          </ol>
        </div>
      )}
    </div>
  );
}
