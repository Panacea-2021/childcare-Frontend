'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Wallet } from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import {
  formatBillingDateLong,
  type StudentBilling,
} from '@/lib/center-management/billingStore';
import { hydrateStudentBilling } from '@/lib/center-management/billingLedgerOps';
import { StudentDebitPanel } from '@/components/modules/center-management/StudentDebitPanel';
import { StudentGeneratedInvoicePanel } from '@/components/modules/center-management/StudentGeneratedInvoicePanel';
import '@/components/modules/center-management/billing.css';

type SubTab = 'generated' | 'debit' | 'fee-plan';

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'generated', label: 'Generated Invoice' },
  { id: 'debit', label: 'Debit' },
  { id: 'fee-plan', label: 'Fee Plan' },
];

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  student: Student;
};

export function ParentBillingTab({ student }: Props) {
  const searchParams = useSearchParams();
  const billingDeepLink = searchParams.get('billing');
  const [subTab, setSubTab] = useState<SubTab>(() => {
    if (billingDeepLink === 'debit' || billingDeepLink === 'fee-plan' || billingDeepLink === 'generated') {
      return billingDeepLink;
    }
    return 'generated';
  });
  const [billing, setBilling] = useState<StudentBilling>(() => hydrateStudentBilling(student.id));

  useEffect(() => {
    setBilling(hydrateStudentBilling(student.id));
  }, [student.id]);

  useEffect(() => {
    if (billingDeepLink === 'debit' || billingDeepLink === 'fee-plan' || billingDeepLink === 'generated') {
      setSubTab(billingDeepLink);
    }
  }, [billingDeepLink]);

  const selectSub = (id: SubTab) => {
    setSubTab(id);
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('tab', 'Billing');
    qs.set('billing', id);
    window.history.replaceState(null, '', `/parent/profile?${qs.toString()}`);
  };

  return (
    <motion.div
      className="bill-root"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease }}
    >
      <motion.div
        className="bill-shell"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <div className="bill-subnav">
          <div className="bill-subtabs" role="tablist">
            {SUB_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={subTab === t.id}
                className={`bill-subtab${subTab === t.id ? ' is-active' : ''}`}
                onClick={() => selectSub(t.id)}
              >
                {t.label}
                {subTab === t.id ? (
                  <motion.span
                    layoutId="parent-bill-sub-underline"
                    className="bill-sub-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={subTab}
            className="bill-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            {subTab === 'generated' ? (
              <StudentGeneratedInvoicePanel student={student} variant="parent" />
            ) : null}
            {subTab === 'debit' ? (
              <StudentDebitPanel student={student} variant="parent" />
            ) : null}
            {subTab === 'fee-plan' ? (
              <ParentFeePlanPanel plans={billing.feePlans || []} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function ParentFeePlanPanel({
  plans,
}: {
  plans: NonNullable<StudentBilling['feePlans']>;
}) {
  if (!plans.length) {
    return (
      <div className="bill-empty-hero">
        <Wallet size={28} strokeWidth={1.5} />
        <p>No fee plan assigned to student</p>
      </div>
    );
  }

  return (
    <div className="bill-fee-list">
      {plans.map((plan, i) => (
        <motion.div
          key={plan.id}
          className="bill-fee-card"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.38, ease }}
        >
          <span className="bill-fee-glow" aria-hidden />
          <span className="bill-fee-glow bill-fee-glow--soft" aria-hidden />
          <div className="bill-fee-head">
            <span className="bill-fee-ico">
              <Wallet size={20} />
            </span>
            <div className="bill-fee-titles">
              <strong>{plan.name}</strong>
              <em>{plan.frequency} billing cycle</em>
            </div>
            <span
              className={`bill-status-pill is-${
                plan.status === 'Active'
                  ? 'paid'
                  : plan.status === 'Completed'
                    ? 'completed'
                    : plan.status === 'Paused'
                      ? 'due'
                      : 'draft'
              }`}
            >
              {plan.status}
            </span>
          </div>
          <div className="bill-fee-grid">
            <div>
              <span>FREQUENCY</span>
              <strong>{plan.frequency}</strong>
            </div>
            <div>
              <span>Start Date</span>
              <strong>{formatBillingDateLong(plan.startDate)}</strong>
            </div>
            <div>
              <span>End Date</span>
              <strong>{plan.endDate ? formatBillingDateLong(plan.endDate) : 'Ongoing'}</strong>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
