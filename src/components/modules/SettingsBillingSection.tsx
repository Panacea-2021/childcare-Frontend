'use client';

import { useEffect, useRef, useState } from 'react';
import { Wallet } from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import '@/components/modules/settings-section.css';
import styles from './SettingsBillingSection.module.css';

type BillingSettings = {
  currencyCode: string;
  lateFeeValue: string;
  lateFeeType: string;
  lateFeeMethod: string;
  lateFeeGraceDays: string;
  maxLateFeeCap: string;
  billingModes: string;
  creditBalancePrefix: string;
  creditNotePrefix: string;
  debitNumberPrefix: string;
  debitReceiptPrefix: string;
  receiptCounter: string;
  accountingIntegration: string;
  invoiceNumberPrefix: string;
  invoiceReceiptPrefix: string;
  invoiceCounter: string;
  adminEmail: string;
  billingCcEmails: string;
  billingPeriodMandatory: boolean;
  removeBankDetails: boolean;
  invoiceLevelTax: boolean;
  enableQrOnPdf: boolean;
  disableInvoiceComments: boolean;
  paymentGateway: string;
};

type EmailTemplate = {
  subject: string;
  body: string;
};

const CURRENCIES = [
  { id: 'INR', label: '₹ Indian rupee' },
  { id: 'USD', label: '$ US dollar' },
  { id: 'EUR', label: '€ Euro' },
  { id: 'GBP', label: '£ British pound' },
];

const LATE_FEE_TYPES = ['Fixed', 'Percentage'];
const LATE_FEE_METHODS = ['One-time', 'Per day', 'Monthly'];
const BILLING_MODES = ['Monthly', 'Term', 'Annual', 'Custom'];
const ACCOUNTING_OPTIONS = ['None', 'QuickBooks', 'Xero', 'Tally'];
const PAYMENT_GATEWAYS = ['None', 'Razorpay', 'Stripe', 'PayU', 'PayPal'];

const EMAIL_TAGS = [
  '{{schoolName}}',
  '{{studentName}}',
  '{{invoiceNumber}}',
  '{{dueDate}}',
  '{{pendingAmount}}',
  '{{lateFee}}',
] as const;

const DEFAULT_EMAIL: EmailTemplate = {
  subject: 'Gentle reminder of Fee by {{schoolName}} of amount {{pendingAmount}} for {{studentName}}',
  body: `Dear Parent,
This is a gentle reminder regarding the fee payment of {{studentName}} which is due on {{dueDate}} for Invoice No: {{invoiceNumber}}.

We request you pay outstanding fees on time.
The total due amount is {{pendingAmount}}.
Thank you for your co-operation.
Best Regards,
{{schoolName}}`,
};

const DEFAULT_SETTINGS: BillingSettings = {
  currencyCode: 'INR',
  lateFeeValue: '0',
  lateFeeType: '',
  lateFeeMethod: '',
  lateFeeGraceDays: '0',
  maxLateFeeCap: '0',
  billingModes: '',
  creditBalancePrefix: '',
  creditNotePrefix: '',
  debitNumberPrefix: '',
  debitReceiptPrefix: '',
  receiptCounter: '0',
  accountingIntegration: '',
  invoiceNumberPrefix: 'INV',
  invoiceReceiptPrefix: 'REC',
  invoiceCounter: '2',
  adminEmail: 'mallikathimisetty@gmail.com',
  billingCcEmails: '',
  billingPeriodMandatory: false,
  removeBankDetails: false,
  invoiceLevelTax: false,
  enableQrOnPdf: false,
  disableInvoiceComments: false,
  paymentGateway: 'None',
};

const TRIGGER_COPY =
  "This email gets triggered when a teaching staff chooses to send reminder via one of 3 methods for due Invoices. 1. Upon manual invoice creation, edit 2. Choose to send email for automated invoice generation via Fee Plans. 3. Select an invoice and click on action 'Send Fee Reminder'";

function cloneSettings(s: BillingSettings): BillingSettings {
  return { ...s };
}

function displayCurrency(code: string) {
  return CURRENCIES.find((c) => c.id === code)?.id ?? code;
}

function displayOrEmpty(value: string) {
  return value.trim() ? value : null;
}

function Toggle({
  on,
  onChange,
  label,
  id,
  disabled,
  info,
}: {
  on: boolean;
  onChange?: (next: boolean) => void;
  label: string;
  id: string;
  disabled?: boolean;
  info?: string;
}) {
  return (
    <div className={styles.toggleRow}>
      <button
        id={id}
        type="button"
        className={`${styles.switch} ${on ? styles.switchOn : ''} ${disabled ? styles.switchDisabled : ''}`}
        aria-pressed={on}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!on)}
      />
      <span className={styles.toggleText}>
        <label htmlFor={id}>{label}</label>
        {info ? (
          <button type="button" className={styles.infoBtn} title={info} aria-label={info}>
            i
          </button>
        ) : null}
      </span>
    </div>
  );
}

function ViewRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div className={`${styles.rowValue} ${value == null ? styles.rowEmpty : ''}`}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function EditRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export function SettingsBillingSection() {
  const [view, setView] = useState<'settings' | 'email'>('settings');
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState<BillingSettings>(() => cloneSettings(DEFAULT_SETTINGS));
  const [draft, setDraft] = useState<BillingSettings>(() => cloneSettings(DEFAULT_SETTINGS));
  const [email, setEmail] = useState<EmailTemplate>(() => ({ ...DEFAULT_EMAIL }));
  const [emailBaseline, setEmailBaseline] = useState<EmailTemplate>(() => ({ ...DEFAULT_EMAIL }));
  const [triggerOpen, setTriggerOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [gatewayDraft, setGatewayDraft] = useState('None');
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const insertTarget = useRef<'subject' | 'body'>('body');

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const startEdit = () => {
    setDraft(cloneSettings(settings));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(cloneSettings(settings));
    setEditing(false);
    setGatewayOpen(false);
  };

  const saveEdit = () => {
    setSettings(cloneSettings(draft));
    setEditing(false);
    setToast('Successfully saved billing settings');
  };

  const openEmail = () => {
    setEmail({ ...emailBaseline });
    setView('email');
    setTriggerOpen(true);
  };

  const cancelEmail = () => {
    setEmail({ ...emailBaseline });
    setView('settings');
  };

  const saveEmail = () => {
    setEmailBaseline({ ...email });
    setView('settings');
    setToast('Fee reminder email saved');
  };

  const restoreEmail = () => {
    setEmail({ ...DEFAULT_EMAIL });
    setToast('Email restored to default. Please save the changes.');
  };

  const insertTag = (tag: string) => {
    if (insertTarget.current === 'subject' && subjectRef.current) {
      const el = subjectRef.current;
      const start = el.selectionStart ?? email.subject.length;
      const end = el.selectionEnd ?? start;
      const next = email.subject.slice(0, start) + tag + email.subject.slice(end);
      setEmail((e) => ({ ...e, subject: next }));
      window.requestAnimationFrame(() => {
        el.focus();
        const pos = start + tag.length;
        el.setSelectionRange(pos, pos);
      });
      return;
    }
    const el = bodyRef.current;
    if (!el) {
      setEmail((e) => ({ ...e, body: e.body + tag }));
      return;
    }
    const start = el.selectionStart ?? email.body.length;
    const end = el.selectionEnd ?? start;
    const next = email.body.slice(0, start) + tag + email.body.slice(end);
    setEmail((e) => ({ ...e, body: next }));
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + tag.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const wrapBody = (before: string, after = '') => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = email.body.slice(start, end) || 'text';
    const next = email.body.slice(0, start) + before + selected + after + email.body.slice(end);
    setEmail((e) => ({ ...e, body: next }));
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length + after.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const patchDraft = <K extends keyof BillingSettings>(key: K, value: BillingSettings[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  if (view === 'email') {
    return (
      <div className="cm-page cm-page--settings settings-section">
        <CenterManagementPageHeader
          title="Fee Reminder Email"
          description="Edit the fee reminder email content and trigger rules."
          icon={<Wallet size={22} strokeWidth={2.1} />}
          actions={
            <button type="button" className="ui-btn ui-btn-outline" onClick={cancelEmail}>
              Cancel
            </button>
          }
        />
        <div className="settings-section-body">
      <div className={styles.root}>
        <section className={styles.emailCard}>
          <button
            type="button"
            className={styles.triggerToggle}
            aria-expanded={triggerOpen}
            onClick={() => setTriggerOpen((v) => !v)}
          >
            <svg
              className={`${styles.chevron} ${triggerOpen ? styles.chevronOpen : ''}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              aria-hidden
            >
              <path d="M4 2.5 8 6 4 9.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
            When does this email gets triggered ?
          </button>
          {triggerOpen ? <div className={styles.triggerBody}>{TRIGGER_COPY}</div> : null}
        </section>

        <section className={styles.emailCard}>
          <p className={styles.instructionsLabel}>Instructions :</p>
          <p className={styles.instructionsHelp}>Make sure you use each of these tags in your email.</p>
          <div className={styles.tagList}>
            {EMAIL_TAGS.map((tag) => (
              <button key={tag} type="button" className={styles.tag} onClick={() => insertTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
          <p className={styles.note}>
            NOTE: lateFee is optional and only used if you have configured late fee in your school.
          </p>
          <hr className={styles.divider} />

          <label className={styles.fieldLabel} htmlFor="fee-email-subject">
            Email Subject:
          </label>
          <input
            id="fee-email-subject"
            ref={subjectRef}
            className="ui-input"
            value={email.subject}
            onFocus={() => {
              insertTarget.current = 'subject';
            }}
            onChange={(e) => setEmail((prev) => ({ ...prev, subject: e.target.value }))}
          />

          <label className={styles.fieldLabel} htmlFor="fee-email-body" style={{ marginTop: 16 }}>
            Email Body:
          </label>
          <div className={styles.editorWrap}>
            <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
              {(['H1', 'H2', 'H3', 'H4', 'H5', 'H6'] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  className={styles.toolBtn}
                  onClick={() => wrapBody(`\n${h.toLowerCase()}: `, '\n')}
                >
                  {h}
                </button>
              ))}
              <button type="button" className={styles.toolBtn} onClick={() => wrapBody('\n> ', '\n')}>
                Blockquote
              </button>
              <button type="button" className={styles.toolBtn} onClick={() => wrapBody('\n- ', '\n')}>
                List
              </button>
              <button type="button" className={styles.toolBtn} onClick={() => wrapBody('**', '**')}>
                Bold
              </button>
              <button type="button" className={styles.toolBtn} onClick={() => wrapBody('_', '_')}>
                Italic
              </button>
              <button type="button" className={styles.toolBtn} onClick={() => wrapBody('__', '__')}>
                Underline
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={() => insertTag('🙂')}
                aria-label="Insert emoji"
              >
                🙂
              </button>
            </div>
            <textarea
              id="fee-email-body"
              ref={bodyRef}
              className={styles.bodyArea}
              value={email.body}
              onFocus={() => {
                insertTarget.current = 'body';
              }}
              onChange={(e) => setEmail((prev) => ({ ...prev, body: e.target.value }))}
            />
            <div className={styles.restoreRow}>
              <button type="button" className="ui-btn ui-btn-outline" onClick={restoreEmail}>
                RESTORE DEFAULT EMAIL
              </button>
            </div>
          </div>
        </section>

        <div className={styles.footer}>
          <button type="button" className={`ui-btn ui-btn-outline ${styles.footerBtn}`} onClick={cancelEmail}>
            Cancel
          </button>
          <button type="button" className={`ui-btn ui-btn-primary ${styles.footerBtn}`} onClick={saveEmail}>
            Save
          </button>
        </div>

        {toast ? (
          <div className={styles.toast} role="status">
            <span className={styles.toastOk} aria-hidden>
              ✓
            </span>
            <span>{toast}</span>
            <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={() => setToast(null)}>
              ×
            </button>
          </div>
        ) : null}
      </div>
        </div>
      </div>
    );
  }

  const source = editing ? draft : settings;

  return (
    <div className="cm-page cm-page--settings settings-section">
      <CenterManagementPageHeader
        title="Billing"
        description="Manage billing preferences, reminders, and payment gateways."
        icon={<Wallet size={22} strokeWidth={2.1} />}
        actions={
          !editing ? (
            <>
              <button type="button" className="ui-btn ui-btn-outline" onClick={openEmail}>
                Edit fee reminder email
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={startEdit}>
                Edit
              </button>
            </>
          ) : undefined
        }
      />
      <div className="settings-section-body">
    <div className={styles.root}>
      <section className={styles.mainCard}>
        <div className={styles.columns}>
          <div>
            <h2 className={styles.colTitle}>General</h2>
            {editing ? (
              <>
                <EditRow label="Currency Code">
                  <select
                    className="ui-select"
                    value={draft.currencyCode}
                    onChange={(e) => patchDraft('currencyCode', e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </EditRow>
                <EditRow label="Late Fee Value">
                  <input
                    className="ui-input"
                    value={draft.lateFeeValue}
                    onChange={(e) => patchDraft('lateFeeValue', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Late Fee Type">
                  <select
                    className="ui-select"
                    value={draft.lateFeeType}
                    onChange={(e) => patchDraft('lateFeeType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    {LATE_FEE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </EditRow>
                <EditRow label="Late fee method">
                  <select
                    className="ui-select"
                    value={draft.lateFeeMethod}
                    onChange={(e) => patchDraft('lateFeeMethod', e.target.value)}
                  >
                    <option value="">Select method</option>
                    {LATE_FEE_METHODS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </EditRow>
                <EditRow label="Late fee grace period (days)">
                  <input
                    className="ui-input"
                    placeholder="e.g. 5"
                    value={draft.lateFeeGraceDays}
                    onChange={(e) => patchDraft('lateFeeGraceDays', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Maximum late fee cap">
                  <input
                    className="ui-input"
                    placeholder="e.g. 100"
                    value={draft.maxLateFeeCap}
                    onChange={(e) => patchDraft('maxLateFeeCap', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Billing Modes">
                  <select
                    className="ui-select"
                    value={draft.billingModes}
                    onChange={(e) => patchDraft('billingModes', e.target.value)}
                  >
                    <option value="">Select mode</option>
                    {BILLING_MODES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </EditRow>
                <EditRow label="Credit Balance Prefix">
                  <input
                    className="ui-input"
                    value={draft.creditBalancePrefix}
                    onChange={(e) => patchDraft('creditBalancePrefix', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Credit Note Prefix">
                  <input
                    className="ui-input"
                    value={draft.creditNotePrefix}
                    onChange={(e) => patchDraft('creditNotePrefix', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Debit Number Prefix">
                  <input
                    className="ui-input"
                    value={draft.debitNumberPrefix}
                    onChange={(e) => patchDraft('debitNumberPrefix', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Debit Receipt Prefix">
                  <input
                    className="ui-input"
                    value={draft.debitReceiptPrefix}
                    onChange={(e) => patchDraft('debitReceiptPrefix', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Receipt Counter">
                  <input
                    className="ui-input"
                    value={draft.receiptCounter}
                    onChange={(e) => patchDraft('receiptCounter', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Accounting integration">
                  <select
                    className="ui-select"
                    value={draft.accountingIntegration}
                    onChange={(e) => patchDraft('accountingIntegration', e.target.value)}
                  >
                    <option value="">Select integration</option>
                    {ACCOUNTING_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </EditRow>
              </>
            ) : (
              <>
                <ViewRow label="Currency Code" value={displayCurrency(source.currencyCode)} />
                <ViewRow label="Late Fee Value" value={displayOrEmpty(source.lateFeeValue) ?? '0'} />
                <ViewRow label="Late Fee Type" value={displayOrEmpty(source.lateFeeType)} />
                <ViewRow label="Late fee method" value={displayOrEmpty(source.lateFeeMethod)} />
                <ViewRow
                  label="Late fee grace period (days)"
                  value={displayOrEmpty(source.lateFeeGraceDays) ?? '0'}
                />
                <ViewRow
                  label="Maximum late fee cap"
                  value={displayOrEmpty(source.maxLateFeeCap) ?? '0'}
                />
                <ViewRow label="Billing Modes" value={displayOrEmpty(source.billingModes)} />
                <ViewRow label="Credit Balance Prefix" value={displayOrEmpty(source.creditBalancePrefix)} />
                <ViewRow label="Credit Note Prefix" value={displayOrEmpty(source.creditNotePrefix)} />
                <ViewRow label="Debit Number Prefix" value={displayOrEmpty(source.debitNumberPrefix)} />
                <ViewRow label="Debit Receipt Prefix" value={displayOrEmpty(source.debitReceiptPrefix)} />
                <ViewRow label="Receipt Counter" value={displayOrEmpty(source.receiptCounter) ?? '0'} />
                <ViewRow
                  label="Accounting integration"
                  value={displayOrEmpty(source.accountingIntegration)}
                />
              </>
            )}
          </div>

          <div>
            <h2 className={styles.colTitle}>Invoice</h2>
            {editing ? (
              <>
                <EditRow label="Invoice Number Prefix">
                  <input
                    className="ui-input"
                    value={draft.invoiceNumberPrefix}
                    onChange={(e) => patchDraft('invoiceNumberPrefix', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Invoice Receipt Prefix">
                  <input
                    className="ui-input"
                    value={draft.invoiceReceiptPrefix}
                    onChange={(e) => patchDraft('invoiceReceiptPrefix', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Invoice Counter">
                  <input
                    className="ui-input"
                    value={draft.invoiceCounter}
                    onChange={(e) => patchDraft('invoiceCounter', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Admin Email">
                  <input
                    className="ui-input"
                    type="email"
                    value={draft.adminEmail}
                    onChange={(e) => patchDraft('adminEmail', e.target.value)}
                  />
                </EditRow>
                <EditRow label="Emails to cc on billing emails">
                  <input
                    className="ui-input"
                    value={draft.billingCcEmails}
                    onChange={(e) => patchDraft('billingCcEmails', e.target.value)}
                  />
                </EditRow>
              </>
            ) : (
              <>
                <ViewRow label="Invoice Number Prefix" value={source.invoiceNumberPrefix} />
                <ViewRow label="Invoice Receipt Prefix" value={source.invoiceReceiptPrefix} />
                <ViewRow label="Invoice Counter" value={source.invoiceCounter} />
                <ViewRow label="Admin Email" value={source.adminEmail} />
                <ViewRow
                  label="Emails to cc on billing emails"
                  value={displayOrEmpty(source.billingCcEmails)}
                />
              </>
            )}

            <Toggle
              id="bill-period-mandatory"
              label="Make billing period mandatory for invoice creation"
              on={source.billingPeriodMandatory}
              disabled={!editing}
              onChange={(n) => patchDraft('billingPeriodMandatory', n)}
            />
            <Toggle
              id="bill-remove-bank"
              label="Remove bank details from the invoice"
              on={source.removeBankDetails}
              disabled={!editing}
              onChange={(n) => patchDraft('removeBankDetails', n)}
            />
            <Toggle
              id="bill-invoice-tax"
              label="Invoice Level Tax"
              on={source.invoiceLevelTax}
              disabled={!editing}
              onChange={(n) => patchDraft('invoiceLevelTax', n)}
            />
            <Toggle
              id="bill-qr"
              label="Enable QR Code on Invoice PDFs"
              info="Shows a payment QR code on generated invoice PDFs when enabled."
              on={source.enableQrOnPdf}
              disabled={!editing}
              onChange={(n) => patchDraft('enableQrOnPdf', n)}
            />
            <Toggle
              id="bill-disable-comments"
              label="Disable comments on invoices"
              on={source.disableInvoiceComments}
              disabled={!editing}
              onChange={(n) => patchDraft('disableInvoiceComments', n)}
            />
          </div>
        </div>
      </section>

      <section className={styles.paymentCard}>
        <h2 className={styles.paymentTitle}>Payment Account</h2>
        <div className={styles.paymentRow}>
          {editing ? (
            <>
              <span className={styles.paymentHint}>Select Payment Gateway</span>
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => {
                  setGatewayDraft(draft.paymentGateway || 'None');
                  setGatewayOpen(true);
                }}
              >
                Configure
              </button>
            </>
          ) : (
            <>
              <span className={styles.paymentLabel}>Payment Gateway</span>
              <span className={styles.paymentValue}>{settings.paymentGateway || 'None'}</span>
            </>
          )}
        </div>
        {editing && draft.paymentGateway && draft.paymentGateway !== 'None' ? (
          <p style={{ margin: '10px 0 0', fontSize: '0.875rem', color: 'var(--bill-text)' }}>
            Selected: <strong>{draft.paymentGateway}</strong>
          </p>
        ) : null}
      </section>

      {editing ? (
        <div className={styles.footer}>
          <button type="button" className={`ui-btn ui-btn-outline ${styles.footerBtn}`} onClick={cancelEdit}>
            Cancel
          </button>
          <button type="button" className={`ui-btn ui-btn-primary ${styles.footerBtn}`} onClick={saveEdit}>
            Save
          </button>
        </div>
      ) : (
        <div className={styles.footer}>
          <button type="button" className="ui-btn ui-btn-outline" onClick={openEmail}>
            Edit fee reminder email
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={startEdit}>
            Edit
          </button>
        </div>
      )}

      <Modal
        open={gatewayOpen}
        title="Configure Payment Gateway"
        onClose={() => setGatewayOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setGatewayOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                patchDraft('paymentGateway', gatewayDraft);
                setGatewayOpen(false);
              }}
            >
              Save
            </button>
          </>
        }
      >
        <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--bill-muted)' }}>
          Choose a payment gateway for online fee collection. Mock configuration only.
        </p>
        <div className={styles.gatewayOptions}>
          {PAYMENT_GATEWAYS.map((gw) => (
            <button
              key={gw}
              type="button"
              className={`${styles.gatewayOption} ${gatewayDraft === gw ? styles.gatewayOptionOn : ''}`}
              onClick={() => setGatewayDraft(gw)}
            >
              {gw}
            </button>
          ))}
        </div>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={styles.toastOk} aria-hidden>
            ✓
          </span>
          <span>{toast}</span>
          <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
      </div>
    </div>
  );
}
