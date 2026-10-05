'use client';

type Props = {
  name: string;
  src?: string;
  alt?: string;
  className?: string;
  size?: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function fallbackSvg(name: string, size: number) {
  const letter = initials(name);
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size / 2}" fill="#E8F2FF"/><text x="50%" y="54%" text-anchor="middle" font-family="Poppins,sans-serif" font-size="${Math.round(size * 0.35)}" font-weight="700" fill="#5D5FEF">${letter}</text></svg>`,
  )}`;
}

export function AuthorAvatar({
  name,
  src,
  alt,
  className = 'act-author-avatar',
  size,
}: Props) {
  const trimmed = src?.trim();
  const label = alt ?? name;

  if (!trimmed) {
    return (
      <span
        className={`${className} act-author-avatar-fallback`}
        role="img"
        aria-label={label}
        style={size ? { width: size, height: size, fontSize: Math.round(size * 0.38) } : undefined}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={trimmed}
      alt={label}
      className={className}
      style={size ? { width: size, height: size } : undefined}
      onError={(e) => {
        const el = e.currentTarget;
        el.onerror = null;
        el.src = fallbackSvg(name, size ?? 44);
      }}
    />
  );
}
