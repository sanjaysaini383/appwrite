import { useEffect, useRef, useState } from 'react';
import { Channel, type RealtimeResponseEvent } from 'appwrite';
import { config, realtime, TABLES } from '../lib/appwrite';
import { logEvent } from '../lib/inspector';

export type RowEvent = {
  table: keyof typeof TABLES;
  action: 'create' | 'update' | 'delete';
  payload: Record<string, unknown> & { $id: string };
};

/**
 * One websocket, three tables. Every row change in posts, messages or kudos is
 * pushed to the browser and fanned out to the handler.
 */
export function useRealtime(onEvent: (e: RowEvent) => void, enabled: boolean) {
  const handler = useRef(onEvent);
  handler.current = onEvent;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const db = Channel.tablesdb(config.databaseId);
    const channels = [db.table(TABLES.posts).row(), db.table(TABLES.messages).row(), db.table(TABLES.kudos).row()];
    let closed = false;
    let sub: { close: () => Promise<void> } | undefined;

    realtime.onOpen(() => setConnected(true));
    realtime.onClose(() => setConnected(false));

    realtime
      .subscribe(channels, (event: RealtimeResponseEvent<RowEvent['payload']>) => {
        const table = (Object.keys(TABLES) as (keyof typeof TABLES)[]).find((t) =>
          event.channels.some((c) => c.includes(`.tables.${TABLES[t]}.rows`)),
        );
        const action = (['create', 'update', 'delete'] as const).find((a) => event.events.some((e) => e.endsWith(`.${a}`)));
        if (!table || !action) return;
        logEvent(`realtime:${action}`, TABLES[table], [`rowId: ${event.payload.$id}`], 'pushed over websocket');
        handler.current({ table, action, payload: event.payload });
      })
      .then((s) => {
        if (closed) void s.close();
        else {
          sub = s;
          setConnected(true);
        }
      })
      .catch(() => setConnected(false));

    return () => {
      closed = true;
      void sub?.close();
    };
  }, [enabled]);

  return connected;
}
