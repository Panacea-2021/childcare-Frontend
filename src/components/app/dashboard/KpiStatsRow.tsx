'use client';

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { DashboardKpi, KpiPanelId } from '@/data/dashboard.types';
import { AnimatedKpiValue } from './AnimatedKpiValue';

type Props = {
  items: DashboardKpi[];
  animate: boolean;
  activeId: KpiPanelId | null;
  onSelect: (id: KpiPanelId) => void;
};

/** Guarantees Student/Staff right panel fill (matches Students green) */
const RATIO_RIGHT_STYLE: CSSProperties = {
  background: 'linear-gradient(160deg, #fdf2f8 0%, #fbcfe8 45%, #f9a8d4 100%)',
  alignSelf: 'stretch',
  justifySelf: 'stretch',
  width: '100%',
  height: '100%',
  minHeight: '100%',
};

export function KpiStatsRow({ items, animate, activeId, onSelect }: Props) {
  return (
    <div className="dash-stats" role="list" aria-label="Center statistics">
      <div className="dash-statsInner">
        {items.map((item, index) => {
          const selected = activeId === item.id;
          const isRatio = item.id === 'ratio';
          const valueNode =
            typeof item.animateNumber === 'number' ? (
              <AnimatedKpiValue value={item.animateNumber} animate={animate} />
            ) : (
              item.value
            );

          const className = [
            'dash-kpiCard',
            `dash-kpi-${item.tone}`,
            selected ? 'dash-kpiSelected' : '',
            activeId && !selected ? 'dash-kpiDimmed' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const style = { '--dash-stagger': `${index * 70}ms` } as CSSProperties;

          return (
            <motion.button
              key={item.id}
              type="button"
              className={className}
              style={style}
              role="listitem"
              aria-pressed={selected}
              aria-expanded={selected}
              aria-label={`${item.label}: ${item.value}. ${selected ? 'Collapse' : 'Expand'} details`}
              onClick={() => onSelect(item.id)}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <div className="dash-kpiLeft">
                <span className="dash-kpiIcon" aria-hidden>
                  {item.icon}
                </span>
                <div className="dash-kpiCopy">
                  <span className="dash-kpiLabel">{item.label}</span>
                  <span className="dash-kpiHint">{selected ? 'Expanded' : 'Tap to explore'}</span>
                </div>
              </div>
              <div className="dash-kpiRight" style={isRatio ? RATIO_RIGHT_STYLE : undefined}>
                <strong>{valueNode}</strong>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
