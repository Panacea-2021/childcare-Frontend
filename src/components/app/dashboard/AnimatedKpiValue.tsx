'use client';

import { useCountUp } from './useCountUp';

type Props = {
  value: number;
  animate: boolean;
};

export function AnimatedKpiValue({ value, animate }: Props) {
  const n = useCountUp(value, 900, animate);
  return <>{n}</>;
}
