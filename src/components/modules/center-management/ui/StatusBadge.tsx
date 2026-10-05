'use client';

import { ChevronDown } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import type { StudentStatus } from '@/lib/center-management/types';
import { statusBadgeTone } from '@/lib/center-management/studentsStore';

type Props = {
  status: StudentStatus;
  open?: boolean;
  showChevron?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function StatusBadge({
  status,
  open,
  showChevron = true,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  const tone = statusBadgeTone(status);
  const interactive = Boolean(rest.onClick);
  if (!interactive) {
    return <span className={`cm-status-pill ${tone} ${className}`.trim()}>{status}</span>;
  }
  return (
    <button
      type={type}
      className={`cm-status-pill ${tone}${open ? ' is-open' : ''} ${className}`.trim()}
      aria-haspopup="listbox"
      aria-expanded={open}
      {...rest}
    >
      {status}
      {showChevron ? <ChevronDown size={12} /> : null}
    </button>
  );
}
