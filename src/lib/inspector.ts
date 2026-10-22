// A tiny in-memory log of every TablesDB call the app makes, so the
// Query Inspector panel can show exactly how Hearth uses the database.

export type LogEntry = {
  id: number;
  at: number;
  op: string;
  table: string;
  detail: string[];
  ms?: number;
  ok?: boolean;
  error?: string;
  note?: string;
};

type Listener = (entries: LogEntry[]) => void;

let seq = 0;
let entries: LogEntry[] = [];
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(entries));

export function subscribeLog(listener: Listener) {
  listeners.add(listener);
  listener(entries);
  return () => void listeners.delete(listener);
}

export function clearLog() {
  entries = [];
  emit();
}

/** Appwrite queries are JSON strings; render them like the SDK call that built them. */
export function prettyQuery(raw: string | object): string {
  try {
    const q = (typeof raw === 'string' ? JSON.parse(raw) : raw) as { method: string; attribute?: string; values?: unknown[] };
    const args: string[] = [];
    if (q.attribute) args.push(JSON.stringify(q.attribute));
    // Geo queries pack [point, distance, meters] into a single value; unpack for readability.
    if (q.method.startsWith('distance') && Array.isArray(q.values?.[0])) {
      const [point, distance, meters] = q.values[0] as [number[], number, boolean];
      args.push(`[${point.map((n) => n.toFixed(4)).join(', ')}]`, String(distance), String(meters));
    } else if (q.values?.length) {
      // Logical queries (or/and) nest whole queries, as JSON strings or objects.
      const isQuery = (v: unknown) => (typeof v === 'string' && v.startsWith('{')) || (typeof v === 'object' && v !== null && 'method' in v);
      const nested = q.values.every(isQuery);
      args.push(nested ? `[${(q.values as (string | object)[]).map(prettyQuery).join(', ')}]` : q.values.map((v) => JSON.stringify(v)).join(', '));
    }
    return `Query.${q.method}(${args.join(', ')})`;
  } catch {
    return typeof raw === 'string' ? raw : JSON.stringify(raw);
  }
}

export function logEvent(op: string, table: string, detail: string[] = [], note?: string) {
  entries = [{ id: ++seq, at: Date.now(), op, table, detail, ok: true, note }, ...entries].slice(0, 80);
  emit();
}

/** Wrap a TablesDB call so it is timed and recorded. */
export async function track<T>(op: string, table: string, detail: string[], fn: () => Promise<T>, note?: string): Promise<T> {
  const entry: LogEntry = { id: ++seq, at: Date.now(), op, table, detail, note };
  entries = [entry, ...entries].slice(0, 80);
  emit();
  const start = performance.now();
  try {
    const result = await fn();
    entry.ok = true;
    return result;
  } catch (err) {
    entry.ok = false;
    entry.error = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    entry.ms = Math.round(performance.now() - start);
    entries = [...entries];
    emit();
  }
}
