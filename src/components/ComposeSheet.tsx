import { useState } from 'react';
import { Gift, HandHelping, MapPin, X } from 'lucide-react';
import type { NewPost } from '../lib/api';
import { CATEGORIES, type Category, type Kind, type LngLat, type Urgency } from '../lib/types';

type Props = {
  pin: LngLat;
  onCancel: () => void;
  onSubmit: (p: NewPost) => Promise<void>;
};

const EXPIRY = [
  { h: 3, label: '3 hours' },
  { h: 24, label: '24 hours' },
  { h: 72, label: '3 days' },
  { h: 168, label: 'A week' },
];

const PROMPTS: Record<Kind, string> = {
  request: 'e.g. Need to borrow a drill for 20 minutes',
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
        <div>
          <h2>New post</h2>
          <p>Visible to neighbours within their search radius.</p>
        </div>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Cancel">
          <X size={17} />
        </button>
      </div>

      <div className="seg">
        <button type="button" className={kind === 'request' ? 'on' : ''} onClick={() => setKind('request')}>
          <HandHelping size={16} /> I need help
        </button>
        <button type="button" className={kind === 'offer' ? 'on' : ''} onClick={() => setKind('offer')}>
          <Gift size={16} /> I can offer
        </button>
      </div>

      <div className="field">
        <label>Category</label>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`chip ${category === c.id ? 'chip--on' : ''}`}
              style={{ ['--accent-cat' as string]: c.color }}
              onClick={() => setCategory(c.id)}
            >
              <c.icon size={14} /> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="title">Title</label>
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
        <label htmlFor="body">
          Details <span className="optional">Optional</span>
        </label>
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
                {u === 'high' ? 'High' : u === 'low' ? 'Low' : 'Normal'}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="expiry">Expires in</label>
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
        <MapPin size={15} />
        <div>
          <strong>
            {pin[1].toFixed(4)}, {pin[0].toFixed(4)}
          </strong>
          <span>Move the map to adjust the location</span>
        </div>
      </div>

      <button className="btn btn--primary btn--block" disabled={busy || title.trim().length < 3}>
        {busy ? 'Publishing…' : 'Publish post'}
      </button>
    </form>
  );
}
