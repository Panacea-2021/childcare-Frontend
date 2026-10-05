'use client';

import { memo } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { Cloud, Mail, ShieldCheck, Smartphone, Users } from 'lucide-react';

const floats = [
  { Icon: Users, style: { top: '16%', left: '7%' }, duration: 7.5, delay: 0.1 },
  { Icon: Smartphone, style: { top: '20%', right: '9%' }, duration: 8.2, delay: 0.55 },
  { Icon: Mail, style: { bottom: '22%', left: '13%' }, duration: 9.4, delay: 0.25 },
  { Icon: ShieldCheck, style: { top: '46%', left: '44%' }, duration: 6.8, delay: 0.8 },
  { Icon: Cloud, style: { bottom: '18%', right: '14%' }, duration: 10, delay: 0.4 },
];

function HeaderAtmosphereBase() {
  const reduce = useReducedMotion();

  return (
    <div className="pai-header-atmosphere" aria-hidden>
      {floats.map(({ Icon, style, duration, delay }, i) => (
        <m.span
          key={i}
          className="pai-header-float"
          style={{ ...style, opacity: 0.05 }}
          animate={reduce ? undefined : { y: [0, -15, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={22} strokeWidth={1.5} />
        </m.span>
      ))}
    </div>
  );
}

export const HeaderAtmosphere = memo(HeaderAtmosphereBase);
