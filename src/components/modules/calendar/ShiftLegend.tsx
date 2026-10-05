'use client';

import { motion } from 'framer-motion';
import { CloudSun, Moon, Sun } from 'lucide-react';

const items = [
  { id: 'morning', label: 'Morning Shift', className: 'cal-legend-morning', Icon: Sun },
  { id: 'afternoon', label: 'Afternoon Shift', className: 'cal-legend-afternoon', Icon: CloudSun },
  { id: 'evening', label: 'Evening Shift', className: 'cal-legend-evening', Icon: Moon },
] as const;

export function ShiftLegend() {
  return (
    <motion.div
      className="cal-legend"
      role="list"
      aria-label="Shift types"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.35 }}
    >
      {items.map(({ id, label, className, Icon }, i) => (
        <motion.div
          key={id}
          role="listitem"
          className={`cal-legend-badge ${className}`}
          whileHover={{ scale: 1.03 }}
          transition={{ delay: 0.05 * i }}
        >
          <span className="cal-legend-ico" aria-hidden>
            <Icon size={15} />
          </span>
          {label}
        </motion.div>
      ))}
    </motion.div>
  );
}
