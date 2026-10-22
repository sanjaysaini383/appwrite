import { useState } from 'react';
import type { NewPost } from '../lib/api';
import { CATEGORIES, type Category, type Kind, type LngLat, type Urgency } from '../lib/types';

type Props = {
  pin: LngLat;
  onCancel: () => void;
  onSubmit: (p: NewPost) => Promise<void>;
};

const EXPIRY = [
  { h: 3, label: '3 hours' },
  { h: 24, label: 'Today' },
  { h: 72, label: '3 days' },
  { h: 168, label: 'A week' },
];

const PROMPTS: Record<Kind, string> = {
  request: 'e.g. Need a drill for 20 minutes',
  offer: 'e.g. Extra homemade dal for 2 people',
};

export function ComposeSheet({ pin, onCancel, onSubmit }: Props) {
  const [kind, setKind] = useState<Kind>('request');
  const [category, setCategory] = useState<Category>('tools');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('normal');
  const [expiresInHours, setExpires] = useState(24);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return;
    setBusy(true);
    try {
      await onSubmit({ kind, category, title: title.trim(), body: body.trim(), urgency, location: pin, expiresInHours });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="sheet" onSubmit={submit}>
      <div className="sheet__head">
        <h2>Post to your neighbourhood</h2>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Cancel">
          ✕
        </button>
      </div>

      <div className="seg">
        <button type="button" className={kind === 'request' ? 'on' : ''} onClick={() => setKind('request')}>
          🙋 I need help
        </button>
        <button type="button" className={kind === 'offer' ? 'on' : ''} onClick={() => setKind('offer')}>
          🎁 I can offer
        </button>
      </div>

      <div className="field">
        <label>What kind?</label>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`chip ${category === c.id ? 'chip--on' : ''}`}
              style={{ ['--accent' as string]: c.color }}
              onClick={() => setCategory(c.id)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="title">Headline</label>
        <input
          id="title"
          className="input"
          autoFocus
          maxLength={120}
          placeholder={PROMPTS[kind]}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="body">Details</label>
        <textarea
          id="body"
          className="input"
          rows={3}
          maxLength={2000}
          placeholder="Anything that helps a neighbour say yes"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Urgency</label>
          <div className="seg seg--sm">
            {(['low', 'normal', 'high'] as Urgency[]).map((u) => (
              <button type="button" key={u} className={urgency === u ? 'on' : ''} onClick={() => setUrgency(u)}>
                {u === 'high' ? '🔥 High' : u === 'low' ? 'Low' : 'Normal'}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="expiry">Visible for</label>
          <select id="expiry" className="input" value={expiresInHours} onChange={(e) => setExpires(Number(e.target.value))}>
            {EXPIRY.map((x) => (
              <option key={x.h} value={x.h}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="sheet__pin">
        📍 Pinned at {pin[1].toFixed(4)}, {pin[0].toFixed(4)} <span>· move the map to adjust</span>
      </div>

      <button className="btn btn--primary btn--block" disabled={busy || title.trim().length < 3}>
        {busy ? 'Posting…' : 'Post it'}
      </button>
    </form>
  );
}
