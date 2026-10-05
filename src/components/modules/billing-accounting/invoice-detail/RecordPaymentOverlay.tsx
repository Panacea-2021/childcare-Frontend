'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ImagePlus, Mail, Sparkles, Trash2, Wallet } from 'lucide-react';
import { AppSelect } from '@/components/modules/center-management/ui';
import {
  formatInr,
  getStudentCreditBalance,
  recordInvoicePayment,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { PaymentDateCalendar } from './PaymentDateCalendar';
import { easeOutCubic, fadeUpTransition } from './animations';

const PAYMENT_MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Card', label: 'Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'M-Pesa', label: 'M-Pesa' },
  { value: 'FPS', label: 'FPS' },
  { value: 'Other', label: 'Other' },
];

function todayIso() {
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

type Props = {
  invoice: CenterInvoice;
  onBack: () => void;
  onSaved: (next: CenterInvoice) => void;
  /** Debit notes: hide use-credit UI. Default true for invoices. */
  allowCredit?: boolean;
  /** Override back link label (e.g. student profile embed). */
  backLabel?: string;
};

export function RecordPaymentPage({
  invoice,
  onBack,
  onSaved,
  allowCredit = true,
  backLabel = 'Back to invoice',
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  // Placeholder balance until Credit Balance setup is implemented.
  const creditBalance = getStudentCreditBalance(invoice.studentId);
  const [amount, setAmount] = useState(String(invoice.pendingAmount || 0));
  const [creditAmount, setCreditAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [date, setDate] = useState(todayIso());
  const [emailParent, setEmailParent] = useState(true);
  const [useCredit, setUseCredit] = useState(false);
  const [reference, setReference] = useState('');
  const [proofName, setProofName] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setAmount(String(invoice.pendingAmount || 0));
    setCreditAmount('');
    setMode('Cash');
    setDate(todayIso());
    setEmailParent(true);
    setUseCredit(false);
    setReference('');
    setProofName('');
    setProofPreview('');
    setError(null);
    setSuccess(false);
    setSaving(false);
  }, [invoice.id, invoice.pendingAmount]);

  const onProof = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Payment proof must be an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setError(null);
    setProofName(file.name);
    const reader = new FileReader();
    reader.onload = () => setProofPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const clearProof = () => {
    setProofName('');
    setProofPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async () => {
    if (!date) {
      setError('Select a payment date');
      return;
    }

    if (useCredit && allowCredit) {
      const creditValue = Number(creditAmount);
      if (!Number.isFinite(creditValue) || creditValue <= 0) {
        setError('Enter a valid credit amount');
        return;
      }
      if (creditValue > creditBalance) {
        setError(`Credit amount cannot exceed balance (INR ${creditBalance})`);
        return;
      }
      if (creditValue > invoice.pendingAmount) {
        setError(`Credit amount cannot exceed pending (${formatInr(invoice.pendingAmount)})`);
        return;
      }
    } else {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        setError('Enter a valid payment amount');
        return;
      }
      if (!mode) {
        setError('Select a payment mode');
        return;
      }
    }

    setError(null);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 520));

    const next = recordInvoicePayment(invoice.id, {
      amount: useCredit && allowCredit ? Number(creditAmount) : Number(amount),
      mode: useCredit && allowCredit ? 'Credit Balance' : mode,
      date,
      reference,
      emailParent,
      useCredit: Boolean(useCredit && allowCredit),
      creditAmount: useCredit && allowCredit ? Number(creditAmount) : undefined,
    });

    setSaving(false);
    if (next) {
      setSuccess(true);
      onSaved(next);
      window.setTimeout(() => {
        setSuccess(false);
        onBack();
      }, 850);
    }
  };

  return (
    <motion.div
      className="ivd-pay-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: easeOutCubic }}
    >
      <div className="ivd-pay-mesh" aria-hidden>
        <span className="ivd-pay-blob a" />
        <span className="ivd-pay-blob b" />
        <span className="ivd-pay-blob c" />
      </div>

      <div className="ivd-pay-stack">
        <motion.button
          type="button"
          className="ivd-pay-back-btn"
          onClick={onBack}
          disabled={saving}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} />
          {backLabel}
        </motion.button>

        <motion.div
          className="ivd-pay-student-chip"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fadeUpTransition(0.04)}
        >
          <motion.span
            className="ivd-pay-avatar"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {invoice.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={invoice.photoUrl} alt="" />
            ) : (
              initials(invoice.studentName)
            )}
          </motion.span>
          <div className="ivd-pay-chip-meta">
            <h1>{invoice.studentName}</h1>
            <p>
              {invoice.invoiceId}
              <em aria-hidden>·</em>
              {invoice.billingPlan}
            </p>
          </div>
          <div className="ivd-pay-due-chip">
            <Wallet size={14} />
            <div>
              <span>Amount due</span>
              <strong>{formatInr(invoice.pendingAmount)}</strong>
            </div>
          </div>
        </motion.div>

        <motion.section
          className="ivd-pay-shell"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fadeUpTransition(0.08)}
        >
          <header className="ivd-pay-shell-head">
            <div>
              <span className="ivd-pay-kicker">Record payment</span>
              <h2>Payment details</h2>
            </div>
            <p>Enter amount, mode, date, and attach payment proof if available.</p>
          </header>

          <div className="ivd-pay-body">
            <div className="ivd-pay-fields">
              {useCredit && allowCredit ? (
                <p className="ivd-pay-pending-line">
                  Amount Pending :{' '}
                  <strong>
                    {invoice.pendingAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </p>
              ) : (
                <div className="ivd-pay-fields-grid">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="pay-amount">
                      <span className="ivd-req">*</span> Amount
                    </label>
                    <div className="ivd-pay-amount-wrap">
                      <span aria-hidden>₹</span>
                      <input
                        id="pay-amount"
                        className="ui-input ivd-pay-input"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ui-field">
                    <label className="ui-label">
                      <span className="ivd-req">*</span> Payment Mode
                    </label>
                    <AppSelect
                      value={mode}
                      onChange={setMode}
                      options={PAYMENT_MODES}
                      searchable
                      placeholder="Select payment mode"
                    />
                  </div>
                </div>
              )}

              {allowCredit ? (
                <label className="ivd-credit-check">
                  <input
                    type="checkbox"
                    checked={useCredit}
                    onChange={(e) => {
                      setUseCredit(e.target.checked);
                      setError(null);
                      if (e.target.checked) setCreditAmount('');
                    }}
                  />
                  <span>
                    Use credit ( Balance : INR{' '}
                    {creditBalance.toLocaleString('en-IN', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}{' '}
                    )
                  </span>
                </label>
              ) : null}

              {useCredit && allowCredit ? (
                <div className="ui-field">
                  <label className="ui-label" htmlFor="pay-credit-amount">
                    <span className="ivd-req">*</span> Credit Amount
                  </label>
                  <input
                    id="pay-credit-amount"
                    className="ui-input ivd-pay-input"
                    inputMode="decimal"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Enter credit amount"
                  />
                </div>
              ) : null}

              <div className="ui-field">
                <span className="ui-label">
                  <Mail size={13} /> Send email to parent
                </span>
                <div className="ivd-radio-row" role="radiogroup" aria-label="Email parent">
                  <label className={`ivd-radio${emailParent ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name="pay-email"
                      checked={emailParent}
                      onChange={() => setEmailParent(true)}
                    />
                    Yes
                  </label>
                  <label className={`ivd-radio${!emailParent ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name="pay-email"
                      checked={!emailParent}
                      onChange={() => setEmailParent(false)}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="ui-field">
                <label className="ui-label" htmlFor="pay-ref">
                  Reference Number
                </label>
                <textarea
                  id="pay-ref"
                  className="ui-textarea ivd-pay-input"
                  rows={3}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Transaction Ref. Number (Optional)"
                />
              </div>

              <div className="ui-field">
                <span className="ui-label">Payment proof image</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="ivd-pay-file-input"
                  onChange={(e) => onProof(e.target.files?.[0] ?? null)}
                />
                {proofPreview ? (
                  <div className="ivd-pay-proof is-ready">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofPreview} alt="Payment proof preview" />
                    <div className="ivd-pay-proof-meta">
                      <strong>{proofName || 'Payment proof'}</strong>
                      <span>Ready to submit with this payment</span>
                      <button type="button" className="ui-btn ui-btn-outline" onClick={clearProof}>
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="ivd-pay-proof"
                    onClick={() => fileRef.current?.click()}
                  >
                    <span className="ivd-pay-proof-icon" aria-hidden>
                      <ImagePlus size={22} />
                    </span>
                    <strong>Upload payment proof</strong>
                    <em>PNG, JPG or WEBP up to 5MB</em>
                  </button>
                )}
              </div>

              <AnimatePresence>
                {error ? (
                  <motion.p
                    className="ivd-pay-error"
                    role="alert"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <div className="ivd-pay-actions">
                <button type="button" className="ui-btn ui-btn-outline" onClick={onBack} disabled={saving}>
                  Cancel
                </button>
                <motion.button
                  type="button"
                  className="ui-btn ui-btn-primary ivd-pay-submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={submit}
                  disabled={saving || success}
                >
                  {success ? (
                    <>
                      <Sparkles size={16} />
                      Paid
                    </>
                  ) : saving ? (
                    'Submitting…'
                  ) : (
                    'Submit payment'
                  )}
                </motion.button>
              </div>
            </div>

            <motion.div
              className="ivd-pay-cal-wrap"
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={fadeUpTransition(0.12)}
            >
              <div className="ivd-pay-cal-title">
                <span className="ivd-req">*</span> Payment Date
              </div>
              <PaymentDateCalendar value={date} onChange={setDate} />
            </motion.div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

/** @deprecated use RecordPaymentPage */
export const RecordPaymentOverlay = RecordPaymentPage;
