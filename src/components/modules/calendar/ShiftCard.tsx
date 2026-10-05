'use client';

import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Clock3, Moon, Sparkles, Sun } from 'lucide-react';
import type { ScheduleShift } from './types';
import { formatHoursMinutes, toDisplayTime } from './mockData';

type Props = {
  shift: ScheduleShift;
  index?: number;
  onClick?: (shift: ScheduleShift) => void;
};

function ShiftIcon({ type }: { type: ScheduleShift['shiftType'] }) {
  if (type === 'morning') return <Sun size={12} aria-hidden />;
  if (type === 'afternoon') return <Clock3 size={12} aria-hidden />;
  return <Moon size={12} aria-hidden />;
}

function ShiftCardInner({ shift, index = 0, onClick }: Props) {
  const reduce = useReducedMotion();
  const [sparkle, setSparkle] = useState(false);

  return (
    <motion.button
      type="button"
      className={`cal-shift cal-shift-${shift.shiftType}`}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.3 }}
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.05,
              y: -3,
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(93, 95, 239, 0.12)',
            }
      }
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onHoverStart={() => {
        if (reduce) return;
        setSparkle(true);
        window.setTimeout(() => setSparkle(false), 700);
      }}
      onClick={() => onClick?.(shift)}
      aria-label={`${shift.title}, ${toDisplayTime(shift.startTime)} to ${toDisplayTime(shift.endTime)}, ${shift.room}. Open details`}
    >
      {!reduce && sparkle ? (
        <motion.span
          className="cal-shift-sparkle"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.8] }}
          transition={{ duration: 0.65 }}
          aria-hidden
        >
          <Sparkles size={11} />
        </motion.span>
      ) : null}
      <div className="cal-shift-top">
        <ShiftIcon type={shift.shiftType} />
        <span>{shift.title}</span>
      </div>
      <div className="cal-shift-time">
        {toDisplayTime(shift.startTime)} – {toDisplayTime(shift.endTime)}
      </div>
      <div className="cal-shift-room">
        <BookOpen size={10} aria-hidden /> {shift.lesson}
      </div>
      <div className="cal-shift-room">{shift.room}</div>
      <div className="cal-shift-foot">
        <motion.span
          className={`cal-shift-status ${shift.status}`}
          initial={reduce ? false : { scale: 0.9, opacity: 0.5 }}
          animate={reduce ? undefined : { scale: [0.9, 1.08, 1], opacity: 1 }}
          transition={{ delay: 0.15 + index * 0.04, duration: 0.55 }}
        >
          {shift.status}
        </motion.span>
        <span className="cal-shift-dur">{formatHoursMinutes(shift.startTime, shift.endTime)}</span>
      </div>
    </motion.button>
  );
}

export const ShiftCard = memo(ShiftCardInner);
