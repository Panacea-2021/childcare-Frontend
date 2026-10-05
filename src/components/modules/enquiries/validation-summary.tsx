'use client';

import { memo } from 'react';
import type { ImportValidationSummary } from '@/lib/enquiries/types';

type Props = {
  summary: ImportValidationSummary | null;
};

export const ValidationSummary = memo(function ValidationSummary({ summary }: Props) {
  if (!summary) return null;

  return (
    <div className="enq-validation">
      <div className="enq-validation-card">
        <span>Records</span>
        <strong>{summary.total}</strong>
      </div>
      <div className="enq-validation-card is-ok">
        <span>Valid</span>
        <strong>{summary.valid}</strong>
      </div>
      <div className="enq-validation-card is-warn">
        <span>Warnings</span>
        <strong>{summary.warnings}</strong>
      </div>
      <div className="enq-validation-card is-err">
        <span>Invalid</span>
        <strong>{summary.invalid}</strong>
      </div>
      <div className="enq-validation-card is-warn">
        <span>Duplicates</span>
        <strong>{summary.duplicates}</strong>
      </div>
    </div>
  );
});
