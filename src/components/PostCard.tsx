import { distanceKm, formatDistance, timeAgo } from '../lib/format';
import { categoryMeta, type LngLat, type Post } from '../lib/types';
import { Avatar } from './Avatar';

type Props = { post: Post; origin: LngLat; selected: boolean; fresh: boolean; onSelect: () => void };

export function PostCard({ post, origin, selected, fresh, onSelect }: Props) {
  const meta = categoryMeta(post.category);
  return (
    <button
      className={`card ${selected ? 'card--selected' : ''} ${fresh ? 'card--fresh' : ''} card--${post.status}`}
      style={{ ['--accent' as string]: meta.color }}
      onClick={onSelect}
    >
      <div className="card__icon">{meta.emoji}</div>
      <div className="card__main">
        <div className="card__meta">
          <span className={`badge badge--${post.kind}`}>{post.kind === 'request' ? 'Needs help' : 'Offering'}</span>
          {post.urgency === 'high' && post.status === 'open' && <span className="badge badge--urgent">Urgent</span>}
          {post.status !== 'open' && <span className={`badge badge--${post.status}`}>{post.status === 'done' ? 'Done' : 'Claimed'}</span>}
          <span className="card__dist">{formatDistance(distanceKm(origin, post.location))}</span>
        </div>
        <div className="card__title">{post.title}</div>
        <div className="card__foot">
          <Avatar id={post.authorId} name={post.authorName} size={18} />
          <span>{post.authorName}</span>
          <span className="dot">·</span>
          <span>{timeAgo(post.$createdAt)}</span>
          <span className="card__stats">
            {post.replies > 0 && <span>💬 {post.replies}</span>}
            {post.hearts > 0 && <span>♥ {post.hearts}</span>}
          </span>
        </div>
      </div>
    </button>
  );
}
