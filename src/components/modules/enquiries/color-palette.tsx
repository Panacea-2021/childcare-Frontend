'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { StageColorSwatch } from '@/lib/enquiries/types';
import { STAGE_COLOR_PALETTE } from '@/lib/enquiries/stagesStore';

type Props = {
  value: string;
  onChange: (color: string) => void;
  colors?: StageColorSwatch[];
};

export const ColorPalette = memo(function ColorPalette({
  value,
  onChange,
  colors = STAGE_COLOR_PALETTE,
}: Props) {
  return (
    <div className="enq-color-palette" role="listbox" aria-label="Stage color palette">
      {colors.map((swatch) => {
        const selected = value.toLowerCase() === swatch.value.toLowerCase();
        return (
          <motion.button
            key={swatch.value}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={swatch.name}
            title={swatch.name}
            className={`enq-color-chip${selected ? ' is-selected' : ''}`}
            style={{ background: swatch.value }}
            onClick={() => onChange(swatch.value)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            animate={selected ? { scale: 1.1 } : { scale: 1 }}
          />
        );
      })}
    </div>
  );
});
