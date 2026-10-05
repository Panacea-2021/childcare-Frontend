'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Minus } from 'lucide-react';
import {
  TTE_CATEGORIES,
  TTE_COMPARE_TITLE,
  TTE_COMPETITORS,
  TTE_PLAN_COLUMNS,
  type TteCell,
  type TteFeature,
} from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type PlanColId = 'essentials' | 'growth' | 'scale';
type MobileCol = PlanColId | 'competitor';

function Cell({ value }: { value: TteCell }) {
  if (value === true) {
    return (
      <span className="tte-cellOk" aria-label="Included">
        <Check size={16} aria-hidden />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="tte-cellNo" aria-label="Not included">
        <Minus size={14} aria-hidden />
      </span>
    );
  }
  return <span className="tte-cellText">{value}</span>;
}

export function FeatureComparison() {
  const reduced = usePrefersReducedMotion();
  const [competitor, setCompetitor] = useState<(typeof TTE_COMPETITORS)[number]>('Brightwheel');
  const [mobileCol, setMobileCol] = useState<MobileCol>('growth');
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TTE_CATEGORIES.map((c, i) => [c.id, i === 0])),
  );

  return (
    <section className="tte-compare" id="tte-compare" aria-labelledby="tte-compare-title">
      <div className="tte-wrap">
        <motion.h2
          id="tte-compare-title"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {TTE_COMPARE_TITLE}
        </motion.h2>

        <div className="tte-compareWith" role="group" aria-label="Compare with">
          <span>Compare with</span>
          <div className="tte-competitorToggle">
            {TTE_COMPETITORS.map((name) => (
              <button
                key={name}
                type="button"
                className={competitor === name ? 'is-active' : undefined}
                aria-pressed={competitor === name}
                onClick={() => setCompetitor(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <p className="tte-swipeHint">Swipe to compare plans</p>

        <div className="tte-mobileCols" role="tablist" aria-label="Select plan">
          {TTE_PLAN_COLUMNS.map((col) => (
            <button
              key={col.id}
              type="button"
              role="tab"
              aria-selected={mobileCol === col.id}
              className={mobileCol === col.id ? 'is-active' : undefined}
              onClick={() => setMobileCol(col.id)}
            >
              {col.label}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={mobileCol === 'competitor'}
            className={mobileCol === 'competitor' ? 'is-active' : undefined}
            onClick={() => setMobileCol('competitor')}
          >
            {competitor}
          </button>
        </div>

        <motion.div
          className="tte-tableShell"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45 }}
        >
          <div className="tte-tableScroll">
            <table className={`tte-table tte-table--${mobileCol}`}>
              <thead>
                <tr>
                  <th scope="col" className="tte-colFeature">
                    Feature
                  </th>
                  {TTE_PLAN_COLUMNS.map((col) => (
                    <th
                      key={col.id}
                      scope="col"
                      className={`tte-colPlan tte-plan-${col.id}${col.id === 'growth' ? ' is-rec' : ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th scope="col" className="tte-colPlan tte-plan-competitor">
                    {competitor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {TTE_CATEGORIES.map((cat) => {
                  const isOpen = Boolean(open[cat.id]);
                  return (
                    <CategoryBlock
                      key={cat.id}
                      id={cat.id}
                      name={cat.name}
                      open={isOpen}
                      onToggle={() => setOpen((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                      features={cat.features}
                      competitor={competitor}
                      reduced={reduced}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CategoryBlock({
  id,
  name,
  open,
  onToggle,
  features,
  competitor,
  reduced,
}: {
  id: string;
  name: string;
  open: boolean;
  onToggle: () => void;
  features: TteFeature[];
  competitor: string;
  reduced: boolean;
}) {
  return (
    <>
      <tr className="tte-catRow">
        <th colSpan={5} scope="colgroup">
          <button type="button" className="tte-catBtn" aria-expanded={open} onClick={onToggle}>
            <span>{name}</span>
            <ChevronDown
              size={18}
              aria-hidden
              className={`tte-catChevron${open ? ' is-open' : ''}`}
            />
          </button>
        </th>
      </tr>
      <AnimatePresence initial={false}>
        {open
          ? features.map((f) => (
              <motion.tr
                key={f.name}
                className="tte-featureRow"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
              >
                <th scope="row" className="tte-colFeature">
                  <span className="tte-featureName">
                    {f.name}
                    {f.badge ? <em className="tte-aiBadge">{f.badge}</em> : null}
                  </span>
                </th>
                <td className="tte-colPlan tte-plan-essentials">
                  <Cell value={f.essentials} />
                </td>
                <td className="tte-colPlan tte-plan-growth is-rec">
                  <Cell value={f.growth} />
                </td>
                <td className="tte-colPlan tte-plan-scale">
                  <Cell value={f.scale} />
                </td>
                <td className="tte-colPlan tte-plan-competitor">
                  <Cell value={f.competitors[competitor] ?? false} />
                </td>
              </motion.tr>
            ))
          : null}
      </AnimatePresence>
    </>
  );
}
