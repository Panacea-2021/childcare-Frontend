'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  Banknote,
  Building2,
  Check,
  CreditCard,
  Mail,
  MessageSquareText,
  PiggyBank,
  Search,
  Smartphone,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import { AppSelect, DayDatePicker } from '@/components/modules/center-management/ui';
import {
  PAYMENT_MODES,
  addStudentCredit,
  addStudentDeposit,
} from '@/lib/center-management/billingStore';
import { STAFF_OPTIONS } from '@/lib/center-management/studentsStore';
import type { Student } from '@/lib/center-management/types';
import { lockUiOverlay, unlockUiOverlay } from '@/lib/uiOverlay';
import { formatInrPlain } from '@/lib/billing-accounting/invoiceStore';
import '@/components/modules/attendance-leaves/student-attendance.css';
import './balance-allocation-modal.css';

export type AllocationMode = 'credit' | 'deposit';

type Props = {
  open: boolean;
  mode: AllocationMode;
  students: Student[];
  onClose: () => void;
  onSuccess: (result: { count: number; notify: boolean; amount: number }) => void;
};

const ease = [0.22, 1, 0.36, 1] as const;
const REASON_MAX = 280;

const PAYMENT_META: Record<string, { icon: typeof Wallet; blurb: string }> = {
  Cash: { icon: Banknote, blurb: 'Physical cash received' },
  Credit: { icon: CreditCard, blurb: 'Account credit adjustment' },
  Cheque: { icon: Building2, blurb: 'Cheque / demand draft' },
  Card: { icon: CreditCard, blurb: 'Debit or credit card' },
  'Bank Transfer': { icon: Building2, blurb: 'NEFT · IMPS · wire' },
  'M-Pesa': { icon: Smartphone, blurb: 'Mobile wallet transfer' },
  FPS: { icon: Smartphone, blurb: 'Faster Payment System' },
  Other: { icon: Wallet, blurb: 'Other payment method' },
};

function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function avatarTone(name: string) {
  const tones = [
    'linear-gradient(145deg, #818cf8, #5d5fef)',
    'linear-gradient(145deg, #34d399, #059669)',
    'linear-gradient(145deg, #fb7185, #e11d48)',
    'linear-gradient(145deg, #38bdf8, #0284c7)',
    'linear-gradient(145deg, #fbbf24, #d97706)',
    'linear-gradient(145deg, #c084fc, #7c3aed)',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % tones.length;
  return tones[h];
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bam-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function BalanceAllocationModal({ open, mode, students, onClose, onSuccess }: Props) {
  const isCredit = mode === 'credit';
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayInput);
  const [approvedBy, setApprovedBy] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(false);
  const [pick, setPick] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modeOpen, setModeOpen] = useState(false);
  const modeWrapRef = useRef<HTMLDivElement>(null);

  const staffOptions = STAFF_OPTIONS.map((s) => ({ value: s.name, label: s.name }));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setAmount('');
    setDate(todayInput());
    setApprovedBy('');
    setPaymentMode('');
    setNote('');
    setNotify(false);
    setPick([]);
    setSearch('');
    setSubmitting(false);
    setSuccess(false);
    setShake(null);
    setErrors({});
    setModeOpen(false);
  }, [open, mode]);

  useEffect(() => {
    if (!modeOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!modeWrapRef.current?.contains(e.target as Node)) setModeOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [modeOpen]);

  useEffect(() => {
    if (!open) return;
    lockUiOverlay();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !success) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      unlockUiOverlay();
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, submitting, success]);

  const selectable = useMemo(
    () => [...students].sort((a, b) => a.name.localeCompare(b.name)),
    [students],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? selectable.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.admissionNumber || '').toLowerCase().includes(q),
        )
      : selectable;
    return [...list].sort((a, b) => {
      const aOn = pick.includes(a.id) ? 0 : 1;
      const bOn = pick.includes(b.id) ? 0 : 1;
      if (aOn !== bOn) return aOn - bOn;
      return a.name.localeCompare(b.name);
    });
  }, [selectable, search, pick]);

  const amountNum = Number(amount) || 0;
  const canSubmit = amountNum > 0 && Boolean(paymentMode) && pick.length > 0 && !submitting;

  const flashError = (field: string, message: string) => {
    setErrors((e) => ({ ...e, [field]: message }));
    setShake(field);
    window.setTimeout(() => setShake(null), 480);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!amount || amountNum <= 0) next.amount = 'Enter a valid amount';
    if (!paymentMode) next.paymentMode = 'Select a payment mode';
    if (pick.length === 0) next.students = 'Select at least one student';
    setErrors(next);
    if (next.amount) flashError('amount', next.amount);
    else if (next.paymentMode) flashError('paymentMode', next.paymentMode);
    else if (next.students) flashError('students', next.students);
    return Object.keys(next).length === 0;
  };

  const toggle = (id: string) => {
    setPick((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setErrors((e) => {
      const { students: _, ...rest } = e;
      return rest;
    });
  };

  const selectAllFiltered = () => {
    const ids = filtered.map((s) => s.id);
    const allOn = ids.length > 0 && ids.every((id) => pick.includes(id));
    if (allOn) {
      const drop = new Set(ids);
      setPick((prev) => prev.filter((id) => !drop.has(id)));
    } else {
      setPick((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const submit = () => {
    if (!validate()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      for (const id of pick) {
        if (isCredit) {
          addStudentCredit(id, {
            amount: amountNum,
            paymentMode,
            approvedBy: approvedBy || undefined,
            reason: note.trim() || undefined,
            date,
            description: 'Amount credited',
          });
        } else {
          addStudentDeposit(id, {
            amount: amountNum,
            paymentMode,
            approvedBy: approvedBy || undefined,
            description: note.trim() || undefined,
            date,
          });
        }
      }
      setSubmitting(false);
      setSuccess(true);
      window.setTimeout(() => {
        onSuccess({ count: pick.length, notify, amount: amountNum });
        onClose();
      }, 900);
    }, 320);
  };

  const TitleIcon = isCredit ? Wallet : PiggyBank;
  const selectedStaff = STAFF_OPTIONS.find((s) => s.name === approvedBy);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="bam-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease }}
          onClick={() => !submitting && !success && onClose()}
        >
          <motion.div
            className="bam-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bam-title"
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.35, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="bam-header">
              <div className="bam-header-left">
                <span className={`bam-hero-ico${isCredit ? ' is-credit' : ' is-deposit'}`} aria-hidden>
                  <TitleIcon size={22} />
                </span>
                <div>
                  <h2 id="bam-title">{isCredit ? 'Add Credit' : 'Add Deposit'}</h2>
                  <p>
                    {isCredit
                      ? 'Allocate credit to one or more students'
                      : 'Record a deposit for one or more students'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bam-close"
                aria-label="Close"
                disabled={submitting || success}
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </header>

            <div className="bam-body">
              <motion.section
                className={`bam-card${shake === 'amount' ? ' is-shake' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3, ease }}
              >
                <div className="bam-card-head">
                  <h3>{isCredit ? 'Credit Information' : 'Deposit Information'}</h3>
                  <span>{isCredit ? 'Amount & date' : 'Deposit amount & date'}</span>
                </div>
                <div className="bam-grid-2">
                  <div className={`bam-field${errors.amount ? ' is-invalid' : ''}`}>
                    <label className="bam-label">
                      {isCredit ? 'Credit' : 'Deposit Amount'} <span className="bam-req">*</span>
                    </label>
                    <div className="bam-money">
                      <span className="bam-currency" aria-hidden>
                        ₹
                      </span>
                      <input
                        className="bam-input"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setErrors((er) => {
                            const { amount: _, ...rest } = er;
                            return rest;
                          });
                        }}
                        aria-invalid={Boolean(errors.amount)}
                      />
                    </div>
                    {errors.amount ? <p className="bam-error">{errors.amount}</p> : null}
                  </div>
                  <div className="bam-field">
                    <label className="bam-label">Date</label>
                    <div className="bam-date">
                      <DayDatePicker value={date} onChange={setDate} />
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                className={`bam-card${shake === 'paymentMode' ? ' is-shake' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3, ease }}
              >
                <div className="bam-card-head">
                  <h3>Approval Details</h3>
                  <span>Staff & payment</span>
                </div>
                <div className="bam-grid-2">
                  <div className="bam-field">
                    <label className="bam-label">
                      <UserRound size={13} aria-hidden /> Approved By
                    </label>
                    <div className={`bam-staff${approvedBy ? ' has-value' : ''}`}>
                      {selectedStaff ? (
                        <span className="bam-staff-avatar" aria-hidden>
                          {initials(selectedStaff.name)}
                        </span>
                      ) : (
                        <span className="bam-staff-avatar is-empty" aria-hidden>
                          <UserRound size={14} />
                        </span>
                      )}
                      <AppSelect
                        searchable
                        searchPlaceholder="Select staff"
                        placeholder="Select staff"
                        value={approvedBy}
                        onChange={setApprovedBy}
                        options={staffOptions}
                      />
                    </div>
                  </div>
                  <div className={`bam-field${errors.paymentMode ? ' is-invalid' : ''}`}>
                    <label className="bam-label">
                      <Wallet size={13} aria-hidden /> Payment Mode <span className="bam-req">*</span>
                    </label>
                    <div className="bam-mode-wrap" ref={modeWrapRef}>
                      <button
                        type="button"
                        className={`bam-mode-trigger${modeOpen ? ' is-open' : ''}${paymentMode ? ' has-value' : ''}`}
                        onClick={() => setModeOpen((v) => !v)}
                        aria-expanded={modeOpen}
                      >
                        {paymentMode ? (
                          <>
                            {(() => {
                              const Meta = PAYMENT_META[paymentMode]?.icon ?? Wallet;
                              return <Meta size={16} aria-hidden />;
                            })()}
                            <span>{paymentMode}</span>
                          </>
                        ) : (
                          <>
                            <Wallet size={16} aria-hidden />
                            <span className="is-ph">Select Payment Mode</span>
                          </>
                        )}
                      </button>
                      <AnimatePresence>
                        {modeOpen ? (
                          <motion.div
                            className="bam-mode-menu"
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.2, ease }}
                          >
                            {PAYMENT_MODES.map((m) => {
                              const Meta = PAYMENT_META[m]?.icon ?? Wallet;
                              const blurb = PAYMENT_META[m]?.blurb ?? m;
                              const on = paymentMode === m;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  className={`bam-mode-option${on ? ' is-on' : ''}`}
                                  onClick={() => {
                                    setPaymentMode(m);
                                    setModeOpen(false);
                                    setErrors((er) => {
                                      const { paymentMode: _, ...rest } = er;
                                      return rest;
                                    });
                                  }}
                                >
                                  <span className="bam-mode-ico">
                                    <Meta size={16} />
                                  </span>
                                  <span>
                                    <strong>{m}</strong>
                                    <em>{blurb}</em>
                                  </span>
                                  {on ? <Check size={15} /> : null}
                                </button>
                              );
                            })}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                    {errors.paymentMode ? <p className="bam-error">{errors.paymentMode}</p> : null}
                  </div>
                </div>
              </motion.section>

              <motion.section
                className="bam-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.3, ease }}
              >
                <div className="bam-card-head">
                  <h3>{isCredit ? 'Reason' : 'Description'}</h3>
                  <span>Optional notes</span>
                </div>
                <div className="bam-field">
                  <label className="bam-label">
                    <MessageSquareText size={13} aria-hidden />{' '}
                    {isCredit ? 'Reason' : 'Description'}
                  </label>
                  <textarea
                    className="bam-textarea"
                    rows={2}
                    maxLength={REASON_MAX}
                    placeholder={
                      isCredit ? 'Why are you adding this credit?' : 'Add a short description…'
                    }
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="bam-counter">
                    {note.length}/{REASON_MAX}
                  </div>
                </div>

                <button
                  type="button"
                  className={`bam-toggle${notify ? ' is-on' : ''}`}
                  onClick={() => setNotify((v) => !v)}
                  aria-pressed={notify}
                >
                  <span className="bam-switch" aria-hidden>
                    <span className="bam-knob" />
                  </span>
                  <span className="bam-toggle-copy">
                    <strong>Notify Parent & Admin</strong>
                    <em>Send email to parent and admin</em>
                  </span>
                  <AnimatePresence>
                    {notify ? (
                      <motion.span
                        className="bam-mail-pop"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        aria-hidden
                      >
                        <Mail size={14} />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </button>
              </motion.section>

              <motion.section
                className={`bam-card bam-students${shake === 'students' ? ' is-shake' : ''}${errors.students ? ' is-invalid' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3, ease }}
              >
                <div className="bam-students-top">
                  <div className="bam-students-title">
                    <h3>Students</h3>
                    <motion.span
                      className="bam-badge"
                      key={pick.length}
                      initial={{ scale: 0.85 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                    >
                      {pick.length} Selected
                    </motion.span>
                  </div>
                  <div className="bam-search">
                    <Search size={15} aria-hidden />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by student"
                      aria-label="Search students"
                    />
                    {search ? (
                      <button
                        type="button"
                        className="bam-search-clear"
                        aria-label="Clear search"
                        onClick={() => setSearch('')}
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="bam-select-all-row">
                  <button
                    type="button"
                    className={`bam-pill-check${
                      filtered.length > 0 && filtered.every((s) => pick.includes(s.id))
                        ? ' is-on'
                        : ''
                    }`}
                    onClick={selectAllFiltered}
                  >
                    <span className="bam-mini-check" aria-hidden>
                      <Check size={12} />
                    </span>
                    Select All
                  </button>
                  {errors.students ? <p className="bam-error">{errors.students}</p> : null}
                </div>

                {filtered.length === 0 ? (
                  <div className="bam-empty">
                    <div className="bam-empty-art" aria-hidden>
                      <Search size={22} />
                    </div>
                    <h4>{search ? 'No matching students' : 'No students available'}</h4>
                    <p>
                      {search
                        ? 'Try another name or admission number.'
                        : 'Add students in Center Management first.'}
                    </p>
                  </div>
                ) : (
                  <LayoutGroup>
                    <div className="bam-student-list">
                      <AnimatePresence initial={false}>
                        {filtered.map((s) => {
                          const on = pick.includes(s.id);
                          return (
                            <motion.button
                              layout
                              key={s.id}
                              type="button"
                              className={`bam-student${on ? ' is-on' : ''}`}
                              onClick={() => toggle(s.id)}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.22, ease }}
                              whileTap={{ scale: 0.985 }}
                            >
                              <span
                                className="bam-avatar"
                                style={{ background: avatarTone(s.name) }}
                                aria-hidden
                              >
                                {s.photoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={s.photoUrl} alt="" />
                                ) : (
                                  initials(s.name)
                                )}
                              </span>
                              <span className="bam-student-meta">
                                <strong>{highlightMatch(s.name, search)}</strong>
                                <em>
                                  {s.admissionNumber || s.id}
                                  {s.programEnrollments?.[0]?.programName
                                    ? ` · ${s.programEnrollments[0].programName}`
                                    : ''}
                                </em>
                              </span>
                              <span className={`bam-tick${on ? ' is-on' : ''}`} aria-hidden>
                                <Check size={13} />
                              </span>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </LayoutGroup>
                )}
              </motion.section>
            </div>

            <footer className="bam-footer">
              <div className="bam-summary" aria-live="polite">
                <strong>₹ {formatInrPlain(amountNum)}</strong>
                <span>
                  {pick.length} student{pick.length === 1 ? '' : 's'} selected
                </span>
              </div>
              <div className="bam-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-outline bam-btn-cancel"
                  onClick={onClose}
                  disabled={submitting || success}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn-primary bam-btn-submit"
                  onClick={submit}
                  disabled={!canSubmit}
                >
                  {submitting ? (
                    <>
                      <span className="bam-spinner" aria-hidden />
                      Submitting…
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </footer>

            <AnimatePresence>
              {success ? (
                <motion.div
                  className="bam-success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bam-success-check"
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                  >
                    <Check size={28} />
                  </motion.div>
                  <p>{isCredit ? 'Credit Added Successfully' : 'Deposit Recorded Successfully'}</p>
                  <div className="bam-confetti" aria-hidden>
                    {Array.from({ length: 18 }).map((_, i) => (
                      <span key={i} style={{ '--i': i } as CSSProperties} />
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
