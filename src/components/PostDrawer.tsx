import { useEffect, useRef, useState } from 'react';
import {
  ClaimConflict,
  claimPost,
  completePost,
  deletePost,
  getPostWithThread,
  heartPost,
  releasePost,
  sendMessage,
  type Me,
} from '../lib/api';
import { distanceKm, formatDistance, timeAgo, timeLeft } from '../lib/format';
import { categoryMeta, type LngLat, type Message, type Post } from '../lib/types';
import { Avatar } from './Avatar';

type Props = {
  postId: string;
  livePost: Post | undefined;
  me: Me | null;
  origin: LngLat;
  bus: EventTarget;
  onClose: () => void;
  onRequireJoin: () => void;
  onFocus: (at: LngLat) => void;
  toast: (msg: string, tone?: 'ok' | 'warn' | 'err') => void;
};

const hearted = (id: string) => {
  try {
    return localStorage.getItem(`hearth:heart:${id}`) === '1';
  } catch {
    return false;
  }
};

export function PostDrawer({ postId, livePost, me, origin, bus, onClose, onRequireJoin, onFocus, toast }: Props) {
  const [fetched, setFetched] = useState<Post | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [thanking, setThanking] = useState(false);
  const [stars, setStars] = useState(5);
  const [note, setNote] = useState('');
  const [liked, setLiked] = useState(() => hearted(postId));
  const threadRef = useRef<HTMLDivElement>(null);

  const post = livePost ?? fetched;

  const [reload, setReload] = useState(0);

  useEffect(() => {
    setMessages(null);
    setThanking(false);
    setLiked(hearted(postId));
  }, [postId]);

  useEffect(() => {
    let alive = true;
    getPostWithThread(postId)
      .then(({ post, messages }) => {
        if (!alive) return;
        setFetched(post);
        setMessages(messages);
      })
      .catch(() => alive && toast('Could not load this post.', 'err'));
    return () => {
      alive = false;
    };
  }, [postId, reload, toast]);

  // New messages for this post arrive over Realtime via the app-wide bus. If an
  // event can't be attributed to a post, re-read the thread through the relationship.
  useEffect(() => {
    const onMsg = (e: Event) => {
      const { postId: pid, message } = (e as CustomEvent<{ postId: string | null; message: Message }>).detail;
      if (pid === null) return setReload((n) => n + 1);
      if (pid !== postId) return;
      setMessages((prev) => (prev && !prev.some((m) => m.$id === message.$id) ? [...prev, message] : prev));
    };
    bus.addEventListener('message', onMsg);
    return () => bus.removeEventListener('message', onMsg);
  }, [bus, postId]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length]);

  if (!post) {
    return (
      <aside className="drawer">
        <div className="drawer__loading">Loading…</div>
      </aside>
    );
  }

  const meta = categoryMeta(post.category);
  const isAuthor = me?.id === post.authorId;
  const isHelper = me?.id === post.helperId;
  const left = timeLeft(post.expiresAt);

  const run = async (label: string, fn: () => Promise<unknown>, ok?: string) => {
    if (!me) return onRequireJoin();
    setBusy(label);
    try {
      await fn();
      if (ok) toast(ok, 'ok');
    } catch (err) {
      if (err instanceof ClaimConflict) toast(err.message, 'warn');
      else toast(err instanceof Error ? err.message : 'Something went wrong', 'err');
    } finally {
      setBusy(null);
    }
  };

  const onHeart = () => {
    if (liked) return;
    setLiked(true);
    try {
      localStorage.setItem(`hearth:heart:${post.$id}`, '1');
    } catch {
      /* per-browser nicety only */
    }
    heartPost(post.$id).catch(() => setLiked(false));
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    if (!me) return onRequireJoin();
    setDraft('');
    await run('send', () => sendMessage(post.$id, body, me));
  };

  return (
    <aside className="drawer" style={{ ['--accent' as string]: meta.color }}>
      <header className="drawer__head">
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ←
        </button>
        <div className="drawer__crumbs">
          <span className={`badge badge--${post.kind}`}>{post.kind === 'request' ? 'Needs help' : 'Offering'}</span>
          <span className={`badge badge--${post.status}`}>{post.status}</span>
          {left && <span className="badge">{left}</span>}
        </div>
        <button className="icon-btn" onClick={() => onFocus(post.location)} aria-label="Show on map" title="Show on map">
          ◎
        </button>
      </header>

      <div className="drawer__body">
        <div className="drawer__hero">
          <div className="drawer__emoji">{meta.emoji}</div>
          <div>
            <h2 className="drawer__title">{post.title}</h2>
            <div className="drawer__sub">
              <Avatar id={post.authorId} name={post.authorName} size={20} />
              {post.authorName} · {timeAgo(post.$createdAt)} · {formatDistance(distanceKm(origin, post.location))} away
            </div>
          </div>
        </div>
        {post.body && <p className="drawer__text">{post.body}</p>}

        <div className="drawer__actions">
          {post.status === 'open' && !isAuthor && (
            <button className="btn btn--primary" disabled={!!busy} onClick={() => run('claim', () => claimPost(post.$id, me!), 'You’re on it! They’ve been notified.')}>
              {busy === 'claim' ? 'Claiming…' : post.kind === 'request' ? '🙋 I can help' : '🙏 I’d like this'}
            </button>
          )}
          {post.status === 'claimed' && isHelper && (
            <button className="btn" disabled={!!busy} onClick={() => run('release', () => releasePost(post.$id, me!))}>
              Step back
            </button>
          )}
          {post.status === 'claimed' && isAuthor && !thanking && (
            <button className="btn btn--primary" onClick={() => setThanking(true)}>
              ✅ Done — thank {post.helperName}
            </button>
          )}
          <button className={`btn btn--ghost ${liked ? 'btn--liked' : ''}`} onClick={onHeart} title="Show some love">
            ♥ {post.hearts}
          </button>
          {isAuthor && (
            <button
              className="btn btn--ghost btn--danger"
              disabled={!!busy}
              onClick={() => {
                if (confirm('Delete this post and its conversation?')) run('delete', () => deletePost(post.$id), 'Post removed.').then(onClose);
              }}
            >
              Delete
            </button>
          )}
        </div>

        {post.status === 'claimed' && post.helperName && !thanking && (
          <div className="helper-banner">
            <Avatar id={post.helperId!} name={post.helperName} size={26} />
            <span>
              <strong>{isHelper ? 'You are' : `${post.helperName} is`}</strong> on it
            </span>
          </div>
        )}

        {thanking && (
          <form
            className="thank"
            onSubmit={(e) => {
              e.preventDefault();
              run('complete', () => completePost(post, me!, stars, note.trim()), `Kudos sent to ${post.helperName} ✨`).then(() =>
                setThanking(false),
              );
            }}
          >
            <div className="thank__title">How much did {post.helperName} help?</div>
            <div className="stars" role="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} className={n <= stars ? 'on' : ''} onClick={() => setStars(n)} aria-label={`${n} stars`}>
                  ★
                </button>
              ))}
            </div>
            <input className="input" placeholder="Say thanks (optional)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="thank__row">
              <button type="button" className="btn btn--ghost" onClick={() => setThanking(false)}>
                Cancel
              </button>
              <button className="btn btn--primary" disabled={busy === 'complete'}>
                {busy === 'complete' ? 'Committing…' : 'Mark done'}
              </button>
            </div>
            <div className="thank__hint">One TablesDB transaction: post → done, kudos row, thank-you message.</div>
          </form>
        )}

        <div className="thread" ref={threadRef}>
          {messages === null && <div className="thread__empty">Loading conversation…</div>}
          {messages?.length === 0 && <div className="thread__empty">No messages yet — say hi 👋</div>}
          {messages?.map((m) =>
            m.system ? (
              <div key={m.$id} className="msg msg--system">
                {m.body}
              </div>
            ) : (
              <div key={m.$id} className={`msg ${m.authorId === me?.id ? 'msg--mine' : ''}`}>
                <Avatar id={m.authorId} name={m.authorName} size={24} />
                <div className="msg__bubble">
                  <div className="msg__who">
                    {m.authorName} <span>{timeAgo(m.$createdAt)}</span>
                  </div>
                  {m.body}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <form className="composer" onSubmit={onSend}>
        <input
          className="input"
          placeholder={me ? 'Write a message…' : 'Join to reply'}
          value={draft}
          maxLength={1000}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => !me && onRequireJoin()}
        />
        <button className="btn btn--primary" disabled={!draft.trim() || busy === 'send'}>
          Send
        </button>
      </form>
    </aside>
  );
}
