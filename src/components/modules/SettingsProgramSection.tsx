'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Layers3 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  getProgramAssignments,
  subscribeProgramAssignments,
} from '@/lib/programAssignmentsStore';
import { getPrograms, subscribePrograms } from '@/lib/programsStore';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import styles from './SettingsProgramSection.module.css';

type FeePlan = {
  id: string;
  name: string;
  dateRange: string;
  cycle: string;
};

type ProgramRow = {
  id: string;
  name: string;
  dateRange: string;
  studentCount: number;
  feePlanIds: string[];
};

type UnresolvedStudent = {
  id: string;
  programName: string;
  studentName: string;
  startDate: string;
  endDate: string;
};

const MOCK_FEE_PLANS: FeePlan[] = [
  {
    id: 'fp-toddler',
    name: 'Toddler Monthly FeePlan (Sample)',
    dateRange: 'Jul 01, 2026 - Jul 31, 2026',
    cycle: 'Monthly',
  },
  {
    id: 'fp-full',
    name: 'Full Day Fee Plan',
    dateRange: 'Jul 01, 2026 - Dec 31, 2026',
    cycle: 'Monthly',
  },
  {
    id: 'fp-half',
    name: 'Half Day Fee Plan',
    dateRange: 'Jul 01, 2026 - Dec 31, 2026',
    cycle: 'Monthly',
  },
];

const FEE_LINKS_KEY = 'panacea.settings.program.feeLinks.v1';
const MOCK_UNRESOLVED: UnresolvedStudent[] = [];

function loadFeeLinks(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(FEE_LINKS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveFeeLinks(links: Record<string, string[]>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FEE_LINKS_KEY, JSON.stringify(links));
  } catch {
    /* ignore */
  }
}

function buildRowsFromCatalog(feeLinks: Record<string, string[]>): ProgramRow[] {
  return getPrograms().map((p) => ({
    id: p.id,
    name: p.name,
    dateRange: p.endDate ? `${p.startDate} - ${p.endDate}` : p.startDate,
    studentCount: getProgramAssignments(p.id, p.name).students.length,
    feePlanIds: feeLinks[p.id] ?? [],
  }));
}

const STEPS = [
  'Link Programs To Fee Plan',
  'Review Program Details',
  'Resolve Student Assignments',
  'Confirm the billing',
] as const;

type StepIndex = 0 | 1 | 2 | 3;

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className={styles.toast} role="status">
      <span className={styles.toastIcon} aria-hidden>
        ✓
      </span>
      <span>{message}</span>
      <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function FeePlanPicker({
  selectedIds,
  onChange,
  openId,
  setOpenId,
  rowId,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  rowId: string;
}) {
  const open = openId === rowId;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const selected = MOCK_FEE_PLANS.filter((f) => selectedIds.includes(f.id));
  const available = MOCK_FEE_PLANS.filter((f) => !selectedIds.includes(f.id));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, setOpenId]);

  return (
    <div className={styles.feePicker} ref={wrapRef}>
      <button
        type="button"
        className={styles.feeTrigger}
        aria-expanded={open}
        onClick={() => setOpenId(open ? null : rowId)}
      >
        <span>
          {selected.length === 0
            ? 'Select fee plan'
            : `${selected.length} Fee plan selected`}
        </span>
        <span aria-hidden>▾</span>
      </button>

      {selected.map((plan) => (
        <div key={plan.id} className={styles.feeChip}>
          <div className={styles.feeChipBody}>
            <strong>{plan.name}</strong>
            <div className={styles.feeMeta}>
              <span>
                <span aria-hidden>📅</span> {plan.dateRange}
              </span>
              <span>
                <span aria-hidden>↻</span> {plan.cycle}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.feeRemove}
            aria-label={`Remove ${plan.name}`}
            onClick={() => onChange(selectedIds.filter((id) => id !== plan.id))}
          >
            🗑
          </button>
        </div>
      ))}

      {open ? (
        <div className={styles.feeMenu} role="listbox">
          {available.length === 0 ? (
            <div className={styles.feeEmpty}>
              <span aria-hidden>📭</span>
              <p>No data</p>
            </div>
          ) : (
            available.map((plan) => (
              <button
                key={plan.id}
                type="button"
                role="option"
                className={styles.feeOption}
                onClick={() => {
                  onChange([...selectedIds, plan.id]);
                  setOpenId(null);
                }}
              >
                <strong>{plan.name}</strong>
                <span>
                  {plan.dateRange} · {plan.cycle}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export function SettingsProgramSection() {
  const [billingActive, setBillingActive] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterUnassigned, setFilterUnassigned] = useState(true);
  const [filterNotLinked, setFilterNotLinked] = useState(true);
  const [filterUnresolved, setFilterUnresolved] = useState(true);
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setPrograms(buildRowsFromCatalog(loadFeeLinks()));
    refresh();
    const unsubP = subscribePrograms(refresh);
    const unsubA = subscribeProgramAssignments(refresh);
    return () => {
      unsubP();
      unsubA();
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const filteredLinkPrograms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => {
      const matchesName = !q || p.name.toLowerCase().includes(q);
      const matchesFilter = !filterUnassigned || p.feePlanIds.length === 0;
      return matchesName && matchesFilter;
    });
  }, [programs, search, filterUnassigned]);

  const unassignedCount = programs.filter((p) => p.feePlanIds.length === 0).length;

  const reviewPrograms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [programs, search]);

  const notLinkedCount = programs.filter((p) => p.feePlanIds.length === 0).length;

  const unresolved = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_UNRESOLVED.filter((s) => {
      const matches =
        !q ||
        s.programName.toLowerCase().includes(q) ||
        s.studentName.toLowerCase().includes(q);
      return matches && (filterUnresolved ? true : true);
    });
  }, [search, filterUnresolved]);

  const summary = useMemo(() => {
    const withPlans = programs.filter((p) => p.feePlanIds.length > 0).length;
    return {
      total: programs.length,
      withFeePlans: withPlans,
      withoutFeePlans: programs.length - withPlans,
      inactiveFeePlans: 0,
      overCapacity: 0,
    };
  }, [programs]);

  const setProgramFees = (programId: string, feePlanIds: string[]) => {
    const next = { ...loadFeeLinks(), [programId]: feePlanIds };
    saveFeeLinks(next);
    setPrograms(buildRowsFromCatalog(next));
  };

  const startWizard = () => {
    setWizardOpen(true);
    setStep(0);
    setSearch('');
    setFilterUnassigned(true);
    setOpenPickerId(null);
    showToast('Successfully fetched linked programs and fee-plans.');
  };

  const goNext = () => {
    if (step === 0) {
      setStep(1);
      setSearch('');
      setFilterNotLinked(true);
      showToast('Successfully validated the linked fee plans');
      return;
    }
    if (step === 1) {
      setStep(2);
      setSearch('');
      setFilterUnresolved(true);
      showToast('Successfully fetched unresolved students');
      return;
    }
    if (step === 2) {
      setStep(3);
      showToast('Successfully fetched programs with over capacity');
      return;
    }
    setBillingActive(true);
    setWizardOpen(false);
    setStep(0);
    showToast('Successfully enabled program based billing settings');
  };

  const goBack = () => {
    if (step === 0) return;
    setStep((s) => (s - 1) as StepIndex);
    setSearch('');
  };

  const confirmDeactivate = () => {
    setDeactivateOpen(false);
    setBillingActive(false);
    showToast('Successfully disabled program based billing settings');
  };

  return (
    <SettingsSectionShell
      title="Programs"
      description="Activate program-based billing and link fee plans to your programs."
      icon={<Layers3 size={22} strokeWidth={2.1} />}
      actions={
        !wizardOpen ? (
          billingActive ? (
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeactivateOpen(true)}
            >
              Set as Inactive
            </button>
          ) : (
            <button type="button" className="ui-btn ui-btn-primary" onClick={startWizard}>
              Set as Active
            </button>
          )
        ) : undefined
      }
    >
    <div className={styles.root}>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}

      {!wizardOpen ? (
        <section className={styles.heroCard}>
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroStatus}>
            <span className={`${styles.statusPill} ${billingActive ? styles.statusLive : styles.statusIdle}`}>
              {billingActive ? 'Active' : 'Inactive'}
            </span>
            <span className={styles.heroStat}>{programs.length} programs</span>
            <span className={styles.heroStat}>{MOCK_FEE_PLANS.length} fee plans</span>
          </div>
          <h2 className={styles.title}>Activate Program based Billing</h2>
          <p className={styles.lead}>
            Invoicing is linked to Programs and fee structures, ensuring that invoices are generated
            accurately based on the programs students are enrolled in — automatically.
          </p>
          <p className={styles.note}>
            Please review your setup against the guidelines below when configuring program-based billing.
          </p>

          <div className={styles.guideGrid}>
            <div className={styles.guideBlock}>
              <h3>Getting Started</h3>
              <ol>
                <li>
                  <strong>Define fee structure for each Program:</strong> Assign fee plans to
                  programs so enrolled students are billed correctly.
                </li>
                <li>
                  <strong>Complementary Programs:</strong> Zero-fee programs do not need fee plans
                  and will not trigger billing.
                </li>
              </ol>
            </div>

            <div className={styles.guideBlock}>
              <h3>Student Assignment</h3>
              <ol>
                <li>
                  <strong>Active Enrollment:</strong> Students must be enrolled in programs to
                  trigger billing.
                </li>
                <li>
                  <strong>Correct Date Range:</strong> Use accurate dates when assigning students to
                  avoid billing discrepancies.
                </li>
              </ol>
            </div>

            <div className={styles.guideBlock}>
              <h3>Invoicing Guidelines</h3>
              <ol>
                <li>
                  <strong>Multiple Fee Plans:</strong> Each program can have multiple fee plans.
                </li>
                <li>
                  <strong>Unique Associations:</strong> Each fee plan should belong to only one
                  program.
                </li>
                <li>
                  <strong>Automatic Components:</strong> One-time and recurring fees are pulled
                  from linked fee plans.
                </li>
              </ol>
            </div>
          </div>

          <div className={styles.landingActions}>
            {billingActive ? (
              <button
                type="button"
                className={`ui-btn ui-btn-outline ${styles.ctaBtn}`}
                onClick={() => setDeactivateOpen(true)}
              >
                Set as Inactive
              </button>
            ) : (
              <button
                type="button"
                className={`ui-btn ui-btn-primary ${styles.ctaBtn}`}
                onClick={startWizard}
              >
                Set as Active
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className={styles.wizardCard}>
          <div className={styles.stepper} aria-label="Program settings steps">
            {STEPS.map((label, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <div
                  key={label}
                  className={`${styles.step} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}
                >
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span className={styles.stepLabel}>{label}</span>
                  {i < STEPS.length - 1 ? <span className={styles.stepLine} aria-hidden /> : null}
                </div>
              );
            })}
          </div>

          {step === 0 ? (
            <div className={styles.stepBody}>
              <h2 className={styles.title}>Link Programs To Fee Plan</h2>
              <p className={styles.lead}>
                In this step, you need to link each program to its corresponding fee plans. This
                ensures that students enrolled in the program are billed according to the
                appropriate fee structure.
              </p>
              <ul className={styles.bullets}>
                <li>Multiple fee plans can be linked to one program.</li>
                <li>Invoices will not generate for a program without a linked fee plan.</li>
                <li>Accurate linking is essential for correct billing.</li>
              </ul>

              <div className={styles.toolbar}>
                <div className="ui-search">
                  <span>⌕</span>
                  <input
                    placeholder="Search Program"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search Program"
                  />
                </div>
                <div className={styles.filterRow}>
                  <span>Filter by</span>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterUnassigned ? styles.filterPillOn : ''}`}
                    onClick={() => setFilterUnassigned((v) => !v)}
                  >
                    Unassigned
                  </button>
                </div>
                <span className={styles.countLabel}>Programs unassigned : {unassignedCount}</span>
              </div>

              <div className={styles.tableWrap}>
                <table className={`ui-table ${styles.linkTable}`}>
                  <thead>
                    <tr>
                      <th>Program Name</th>
                      <th>Fee Plan Name</th>
                      <th>Assigned student count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLinkPrograms.length === 0 ? (
                      <tr>
                        <td colSpan={3}>
                          <p className={styles.emptyInline}>No programs match your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLinkPrograms.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                            <div className={styles.metaLine}>
                              <span aria-hidden>📅</span> {p.dateRange}
                            </div>
                          </td>
                          <td>
                            <FeePlanPicker
                              rowId={p.id}
                              selectedIds={p.feePlanIds}
                              openId={openPickerId}
                              setOpenId={setOpenPickerId}
                              onChange={(ids) => setProgramFees(p.id, ids)}
                            />
                          </td>
                          <td>
                            {p.studentCount} student{p.studentCount === 1 ? '' : 's'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className={styles.stepBody}>
              <h2 className={styles.title}>Review Program Details</h2>
              <p className={styles.lead}>
                Review the mapping between programs and fee plans to ensure accuracy.
              </p>

              <div className={styles.toolbar}>
                <div className="ui-search">
                  <span>⌕</span>
                  <input
                    placeholder="Search Program"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search Program"
                  />
                </div>
                <div className={styles.filterRow}>
                  <span>Filter by</span>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterNotLinked ? styles.filterPillOn : ''}`}
                    onClick={() => setFilterNotLinked((v) => !v)}
                  >
                    Programs not linked
                  </button>
                </div>
                <span className={styles.countLabel}>Programs not linked : {notLinkedCount}</span>
              </div>

              <div className={styles.reviewList}>
                {reviewPrograms.map((p, index) => {
                  const plans = MOCK_FEE_PLANS.filter((f) => p.feePlanIds.includes(f.id));
                  return (
                    <article key={p.id} className={styles.reviewCard}>
                      <header className={styles.reviewHead}>
                        <h3>
                          {index + 1}. {p.name}
                        </h3>
                        <span className={styles.metaLine}>
                          <span aria-hidden>📅</span> {p.dateRange}
                        </span>
                        {plans.length === 0 ? (
                          <span className={styles.warnBadge}>No fee plans linked</span>
                        ) : null}
                      </header>
                      {plans.length > 0 ? (
                        <table className="ui-table">
                          <thead>
                            <tr>
                              <th>Fee Plan</th>
                              <th>Date Range</th>
                              <th>Billing Cycle</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plans.map((plan) => (
                              <tr key={plan.id}>
                                <td>{plan.name}</td>
                                <td>{plan.dateRange}</td>
                                <td>{plan.cycle}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className={styles.stepBody}>
              <h2 className={styles.title}>Resolve Student Assignments</h2>
              <p className={styles.lead}>
                Review student assignments for date conflicts and resolve unresolved students so
                billing stays accurate.
              </p>

              <div className={styles.toolbar}>
                <div className="ui-search">
                  <span>⌕</span>
                  <input
                    placeholder="Search Program"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search Program"
                  />
                </div>
                <div className={styles.filterRow}>
                  <span>Filter by</span>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterUnresolved ? styles.filterPillOn : ''}`}
                    onClick={() => setFilterUnresolved((v) => !v)}
                  >
                    Unresolved
                  </button>
                </div>
                <span className={styles.countLabel}>
                  Student Assignments to Resolve : {unresolved.length}
                </span>
              </div>

              <div className={styles.tableWrap}>
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Program Name</th>
                      <th>Student Name</th>
                      <th>Student Program Start Date</th>
                      <th>Student Program End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unresolved.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <div className={styles.emptyBox}>All the student are resolved</div>
                        </td>
                      </tr>
                    ) : (
                      unresolved.map((s) => (
                        <tr key={s.id}>
                          <td>{s.programName}</td>
                          <td>{s.studentName}</td>
                          <td>{s.startDate}</td>
                          <td>{s.endDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className={styles.stepBody}>
              <h2 className={styles.title}>Confirm the billing</h2>
              <p className={styles.lead}>
                Before proceeding, please review all fee plans and program links, make sure that all
                students are associated with their respective programs to ensure accurate billing.
              </p>

              <div className={styles.summary}>
                <h3>Summary</h3>
                <div className={styles.summaryGrid}>
                  <div>
                    <span>Total Programs</span>
                    <strong>{summary.total}</strong>
                  </div>
                  <div>
                    <span>Programs with Fee Plans</span>
                    <strong>{summary.withFeePlans}</strong>
                  </div>
                  <div>
                    <span>Programs without Fee Plans</span>
                    <strong>{summary.withoutFeePlans}</strong>
                  </div>
                  <div>
                    <span>Inactive Fee Plans</span>
                    <strong>{summary.inactiveFeePlans}</strong>
                  </div>
                  <div>
                    <span>Programs with over capacity</span>
                    <strong>{summary.overCapacity}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.wizardFooter}>
            {step > 0 ? (
              <button type="button" className="ui-btn ui-btn-outline" onClick={goBack}>
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="button" className="ui-btn ui-btn-primary" onClick={goNext}>
              {step === 3 ? 'Confirm' : 'Proceed'}
            </button>
          </div>
        </section>
      )}

      <Modal
        open={deactivateOpen}
        title="Confirm Deactivation of Program-Based Billing"
        onClose={() => setDeactivateOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeactivateOpen(false)}
            >
              No
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={confirmDeactivate}>
              Yes
            </button>
          </>
        }
      >
        <p>
          If you set program-based billing as inactive, billing will only occur if a student is
          directly assigned to a fee plan, bypassing any program assignments. This change will
          impact the school&apos;s entire billing process and cannot be undone. Do you wish to
          proceed with deactivating program-based billing?
        </p>
      </Modal>
    </div>
    </SettingsSectionShell>
  );
}
