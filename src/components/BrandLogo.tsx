type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
};

export function BrandLogo({ size = 'md', dark = false }: BrandLogoProps) {
  const heights = { sm: 28, md: 36, lg: 44 };
  const h = heights[size];
  const textSize = size === 'lg' ? 22 : size === 'sm' ? 14 : 17;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={h} height={h} viewBox="0 0 40 40" aria-hidden>
        <path d="M20 2 L34 12 L28 30 L12 30 L6 12 Z" fill="#EDD0E4" opacity="0.95" />
        <path d="M20 2 L34 12 L20 20 Z" fill="#EDE8D0" />
        <path d="M20 2 L6 12 L20 20 Z" fill="#D0D5ED" />
        <path d="M6 12 L20 20 L12 30 Z" fill="#D0EDDA" />
        <path d="M34 12 L20 20 L28 30 Z" fill="#D0D5ED" />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: textSize,
          letterSpacing: '-0.03em',
          color: dark ? '#1F2937' : '#1F2937',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Panacea Childcare Group
      </span>
    </div>
  );
}
