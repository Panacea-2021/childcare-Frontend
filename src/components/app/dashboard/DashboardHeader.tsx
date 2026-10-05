'use client';

import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { DashboardButterfly } from './DashboardButterfly';

type Props = {
  dateValue: string;
  onDateChange: (value: string) => void;
  displayLabel: string;
  title?: string;
  eyebrow?: string;
};

export function DashboardHeader({
  dateValue,
  onDateChange,
  displayLabel,
  title = 'Center Dashboard',
  eyebrow = 'Dashboard Overview',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    try {
      if (typeof el.showPicker === 'function') {
        el.showPicker();
        return;
      }
    } catch {
      /* fall through */
    }
    el.focus();
    el.click();
  };

  return (
    <div className="dash-headRow dash-revealBlock dash-inview">
      <div className="dash-headCopy">
        <p className="dash-headEyebrow">{eyebrow}</p>
        <div className="dash-headTitleWrap">
          <h1 className="dash-headTitle">{title}</h1>
          <DashboardButterfly />
        </div>
      </div>

      <div className="dash-dateBox">
        <button type="button" className="dash-dateTrigger" onClick={openPicker} aria-label="Open calendar">
          <span className="dash-dateLabel">{displayLabel}</span>
          <span className="dash-dateIcon" aria-hidden>
            <CalendarDays size={18} strokeWidth={2.25} />
          </span>
        </button>
        <input
          ref={inputRef}
          type="date"
          className="dash-dateInput"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label="Select dashboard date"
        />
      </div>
    </div>
  );
}
