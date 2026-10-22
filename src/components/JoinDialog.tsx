import { useState } from 'react';
import { HandHelping, MapPin, Star } from 'lucide-react';

type Props = { onJoin: (name: string) => Promise<void>; onBrowse: () => void };

const STEPS = [
  { icon: MapPin, title: 'Post a request or offer', text: 'Pin it to your street, visible to neighbours nearby.' },
  { icon: HandHelping, title: 'A neighbour steps in', text: 'They claim it and you coordinate in a private thread.' },
  { icon: Star, title: 'Close the loop', text: 'Mark it done and send kudos to the person who helped.' },
];

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
        <div className="join__brand">
          <img src="/hearth.svg" alt="" className="join__logo" />
          <span>Hearth</span>
        </div>
        <h1 id="join-title">Help is closer than you think.</h1>
        <p className="join__tag">Ask your neighbours for a hand, or lend one: a ladder, a ride, a meal, ten minutes of tech help.</p>
        <ul className="join__how">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="join__step">
                <Icon size={16} />
              </span>
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </li>
          ))}
        </ul>
        <label className="join__label" htmlFor="join-name">
          Your first name
        </label>
        <input
          id="join-name"
          className="input input--lg"
          autoFocus
          placeholder="e.g. Priya"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <div className="join__err">{error}</div>}
        <button className="btn btn--primary btn--block btn--lg" disabled={busy || !name.trim()}>
          {busy ? 'Joining…' : 'Continue'}
        </button>
        <button type="button" className="btn btn--ghost btn--block" onClick={onBrowse}>
          Browse without joining
        </button>
        <p className="join__fine">No email or password. Only your first name is shown to neighbours.</p>
      </form>
    </div>
  );
}
