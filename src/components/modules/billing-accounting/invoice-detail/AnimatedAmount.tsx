'use client';

import { useEffect, useState } from 'react';
import { formatInrPlain } from '@/lib/billing-accounting/invoiceStore';

export function AnimatedAmount({
  value,
  prefix = '₹',
  duration = 900,
}: {
  value: number;
  prefix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className="ivd-amount-live">
      {prefix}
      {formatInrPlain(display)}
    </span>
  );
}
