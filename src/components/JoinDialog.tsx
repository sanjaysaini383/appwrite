import { useState } from 'react';

type Props = { onJoin: (name: string) => Promise<void>; onBrowse: () => void };

export function JoinDialog({ onJoin, onBrowse }: Props) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await onJoin(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="join-title">
      <form className="join" onSubmit={submit}>
        <img src="/hearth.svg" alt="" className="join__logo" />
        <h1 id="join-title">Hearth</h1>
        <p className="join__tag">
          Your neighbourhood on a live map. Ask for a hand or lend one: a ladder, a ride, a meal, ten minutes of tech help.
        </p>
        <ul className="join__how">
          <li>
            <b>1</b> Pin a request or an offer
          </li>
          <li>
            <b>2</b> A neighbour taps “I can help”
          </li>
          <li>
            <b>3</b> Mark it done, send kudos
          </li>
        </ul>
        <input
          className="input input--lg"
          autoFocus
          placeholder="Your first name"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <div className="join__err">{error}</div>}
        <button className="btn btn--primary btn--block" disabled={busy || !name.trim()}>
          {busy ? 'Joining…' : 'Join your neighbourhood'}
        </button>
        <button type="button" className="btn btn--ghost btn--block" onClick={onBrowse}>
          Just look around
        </button>
        <p className="join__fine">No email needed. Your first name is the only thing neighbours see.</p>
      </form>
    </div>
  );
}
