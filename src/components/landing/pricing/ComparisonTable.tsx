'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Minus, Plus } from 'lucide-react';
import {
  COMPARISON_CATEGORIES,
  type ComparisonValue,
} from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type PlanKey = 'standard' | 'business' | 'enterprise';

function CellValue({ value }: { value: ComparisonValue }) {
  if (value === true) {
    return (
      <span className="px-cellOk" aria-label="Included">
        <Check size={18} aria-hidden />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="px-cellNo" aria-label="Not included">
        <Minus size={16} aria-hidden />
      </span>
    );
  }
  if (value === 'addon') {
    return (
      <span className="px-cellAddon" aria-label="Available as add-on">
        <Plus size={16} aria-hidden />
      </span>
    );
  }
  return <span className="px-cellText">{value}</span>;
}

export function ComparisonTable() {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      COMPARISON_CATEGORIES.map((c, i) => [c.id, i === 0]),
    ),
  );
  const [mobilePlan, setMobilePlan] = useState<PlanKey>('business');

  const planLabels = useMemo(
    () =>
      ({
        standard: 'Standard',
        business: 'Business',
        enterprise: 'Enterprise',
      }) as const,
    [],
  );

  const toggle = (id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="px-compare" id="px-compare" aria-labelledby="px-compare-title">
      <div className="px-wrap">
        <motion.h2
          id="px-compare-title"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Compare Plans &amp; Features
        </motion.h2>

        {/* Mobile: plan selector */}
        <div className="px-mobilePlans" role="tablist" aria-label="Select plan to compare">
          {(Object.keys(planLabels) as PlanKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mobilePlan === key}
              className={mobilePlan === key ? 'is-active' : undefined}
              onClick={() => setMobilePlan(key)}
            >
              {planLabels[key]}
            </button>
          ))}
        </div>

        <div className="px-tableShell">
          <div className="px-tableScroll">
            <table className={`px-table px-table--${mobilePlan}`}>
              <thead>
                <tr>
                  <th scope="col" className="px-colFeature">
                    Feature
                  </th>
                  <th scope="col" className="px-colPlan px-plan-standard">
                    Standard
                  </th>
                  <th scope="col" className="px-colPlan px-colBiz px-plan-business">
                    Business
                  </th>
                  <th scope="col" className="px-colPlan px-plan-enterprise">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_CATEGORIES.map((cat) => {
                  const isOpen = Boolean(open[cat.id]);
                  return (
                    <ComparisonCategory
                      key={cat.id}
                      id={cat.id}
                      name={cat.name}
                      open={isOpen}
                      onToggle={() => toggle(cat.id)}
                      features={cat.features}
                      reduced={reduced}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonCategory({
  id,
  name,
  open,
  onToggle,
  features,
  reduced,
}: {
  id: string;
  name: string;
  open: boolean;
  onToggle: () => void;
  features: {
    name: string;
    standard: ComparisonValue;
    business: ComparisonValue;
    enterprise: ComparisonValue;
  }[];
  reduced: boolean;
}) {
  return (
    <>
      <tr className="px-catRow">
        <th colSpan={4} scope="colgroup">
          <button
            type="button"
            className="px-catBtn"
            aria-expanded={open}
            aria-controls={`px-cat-${id}`}
            onClick={onToggle}
          >
            <span>{name}</span>
            <ChevronDown
              size={18}
              aria-hidden
              className={`px-catChevron${open ? ' is-open' : ''}`}
            />
          </button>
        </th>
      </tr>
      <AnimatePresence initial={false}>
        {open
          ? features.map((f) => (
              <motion.tr
                key={f.name}
                id={`px-cat-${id}`}
                className="px-featureRow"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <th scope="row" className="px-colFeature">
                  {f.name}
                </th>
                <td className="px-colPlan px-plan-standard">
                  <CellValue value={f.standard} />
                </td>
                <td className="px-colPlan px-colBiz px-plan-business">
                  <CellValue value={f.business} />
                </td>
                <td className="px-colPlan px-plan-enterprise">
                  <CellValue value={f.enterprise} />
                </td>
              </motion.tr>
            ))
          : null}
      </AnimatePresence>
    </>
  );
}
