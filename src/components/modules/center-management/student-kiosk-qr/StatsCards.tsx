'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, QrCode, Users } from 'lucide-react';

type Props = {
  selected: number;
  generated: number;
  schoolLabel?: string;
};

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let frame = 0;
    const steps = 18;
    const tick = () => {
      frame += 1;
      setValue(Math.round((target * frame) / steps));
      if (frame < steps) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, active]);
  return value;
}

export function StatsCards({ selected, generated, schoolLabel = '1' }: Props) {
  const selectedN = useCountUp(selected, true);
  const generatedN = useCountUp(generated, true);
  const validN = useCountUp(generated, true);

  const cards = [
    { label: 'Students Selected', value: String(selectedN), icon: Users, tone: 'purple' },
    { label: 'QR Generated', value: String(generatedN), icon: QrCode, tone: 'blue' },
    { label: 'School', value: schoolLabel, icon: Building2, tone: 'soft' },
    { label: 'Valid', value: String(validN), icon: CheckCircle2, tone: 'green' },
  ] as const;

  return (
    <div className="slq-stats" role="group" aria-label="QR statistics">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            className={`slq-stat slq-stat-${card.tone}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.28 }}
            whileHover={{ y: -3 }}
          >
            <span className="slq-stat-icon" aria-hidden>
              <Icon size={15} />
            </span>
            <div>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
