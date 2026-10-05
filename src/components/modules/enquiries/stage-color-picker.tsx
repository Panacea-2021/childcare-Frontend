'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ColorPalette } from './color-palette';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export const StageColorPicker = memo(function StageColorPicker({ value, onChange }: Props) {
  return (
    <div className="enq-stage-color-picker">
      <div className="enq-stage-color-preview" style={{ background: value }}>
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.span>
      </div>
      <div className="ui-field" style={{ margin: 0 }}>
        <label className="ui-label">Palette</label>
        <ColorPalette value={value} onChange={onChange} />
      </div>
      <div className="ui-field" style={{ margin: 0 }}>
        <label className="ui-label" htmlFor="stage-custom-color">
          Custom color
        </label>
        <div className="enq-custom-color-row">
          <input
            id="stage-custom-color"
            type="color"
            className="enq-color-native"
            value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#6366F1'}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Pick a custom color"
          />
          <input
            className="ui-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#5D5FEF"
            maxLength={7}
            aria-label="Hex color"
          />
        </div>
      </div>
    </div>
  );
});
