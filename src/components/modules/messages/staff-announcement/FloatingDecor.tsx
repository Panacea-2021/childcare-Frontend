'use client';

import { motion } from 'framer-motion';
import { Bell, Mail, MessageCircle, MessageSquare, Plane, Smartphone } from 'lucide-react';

const ICONS: {
  Icon: typeof Mail;
  top: string;
  left?: string;
  right?: string;
  size: number;
  dur: number;
}[] = [
  { Icon: Mail, top: '8%', left: '6%', size: 18, dur: 14 },
  { Icon: MessageCircle, top: '18%', right: '10%', size: 16, dur: 16 },
  { Icon: Bell, top: '42%', left: '4%', size: 15, dur: 12 },
  { Icon: Plane, top: '28%', right: '4%', size: 17, dur: 15 },
  { Icon: Smartphone, top: '55%', right: '14%', size: 14, dur: 13 },
  { Icon: MessageSquare, top: '12%', left: '28%', size: 14, dur: 17 },
];

export function FloatingDecor() {
  return (
    <div className="sa-float-layer" aria-hidden>
      <span className="sa-float-blob b1" />
      <span className="sa-float-blob b2" />
      {ICONS.map(({ Icon, top, left, right, size, dur }, i) => (
        <motion.span
          key={i}
          className="sa-float-icon"
          style={{ top, left, right }}
          animate={{ y: [0, -14, 0], x: [0, i % 2 === 0 ? 6 : -6, 0], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          <Icon size={size} strokeWidth={1.5} />
        </motion.span>
      ))}
    </div>
  );
}
