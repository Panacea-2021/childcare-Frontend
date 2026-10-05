/** Inline Facebook brand mark — Lucide no longer ships brand icons. */
export function FacebookGlyph({
  size = 24,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.015 3.657 9.174 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.197 2.238.197v2.48h-1.26c-1.243 0-1.63.777-1.63 1.574v1.89h2.773l-.443 2.91h-2.33V22c4.78-.766 8.437-4.925 8.437-9.94z" />
    </svg>
  );
}
