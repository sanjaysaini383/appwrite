import { hueFor, initials } from '../lib/format';

export function Avatar({ id, name, size = 28 }: { id: string; name: string; size?: number }) {
  const hue = hueFor(id);
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4, background: `hsl(${hue} 60% 45%)` }}
      aria-hidden
    >
      {initials(name) || '?'}
    </span>
  );
}
