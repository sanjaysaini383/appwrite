import { useCallback, useEffect, useState } from 'react';
import type { Models } from 'appwrite';
import { account, isConfigured } from '../lib/appwrite';
import type { Me } from '../lib/api';

type State = { status: 'loading' } | { status: 'guest' } | { status: 'ready'; me: Me };

const toMe = (u: Models.User<Models.Preferences>): Me => ({ id: u.$id, name: u.name || 'Neighbour' });

export function useSession() {
  const [state, setState] = useState<State>({ status: isConfigured ? 'loading' : 'guest' });

  useEffect(() => {
    if (!isConfigured) return;
    account
      .get()
      .then((u) => setState(u.name ? { status: 'ready', me: toMe(u) } : { status: 'guest' }))
      .catch(() => setState({ status: 'guest' }));
  }, []);

  /** Neighbours join with just a first name — an anonymous Appwrite session under the hood. */
  const join = useCallback(async (name: string) => {
    try {
      await account.get();
    } catch {
      await account.createAnonymousSession();
    }
    const u = await account.updateName({ name });
    setState({ status: 'ready', me: toMe(u) });
  }, []);

  const leave = useCallback(async () => {
    await account.deleteSession({ sessionId: 'current' }).catch(() => undefined);
    setState({ status: 'guest' });
  }, []);

  return { state, join, leave };
}
