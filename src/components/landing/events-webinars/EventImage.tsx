'use client';

type Props = {
  imageUrl: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
};

/** Backend-ready image shell — pass API `imageUrl` directly. */
export function EventImage({
  imageUrl,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority,
  width = 1200,
  height = 675,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={alt}
      className={`ew-eventImg ${className}`.trim()}
      loading={loading}
      decoding="async"
      width={width}
      height={height}
      referrerPolicy="no-referrer"
      {...(fetchPriority ? { fetchPriority } : {})}
    />
  );
}
