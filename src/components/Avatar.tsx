import { hueFor, initials } from '../lib/format';

export function Avatar({ id, name, size = 28 }: { id: string; name: string; size?: number }) {
  const hue = hueFor(id);
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.38),
        background: `hsl(${hue} 45% 92%)`,
        color: `hsl(${hue} 45% 32%)`,
      }}
      aria-hidden
    >
      {initials(name) || '?'}
    </span>
  );
}
