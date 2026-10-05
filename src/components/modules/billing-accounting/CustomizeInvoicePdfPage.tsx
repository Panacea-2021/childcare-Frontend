'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Plus,
  RotateCcw,
  Settings2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppSelect } from '@/components/modules/center-management/ui';
import {
  ADDITIONAL_FIELD_OPTIONS,
  DEFAULT_INVOICE_PDF_SETTINGS,
  DISPLAY_FIELD_OPTIONS,
  loadInvoicePdfSettings,
  saveInvoicePdfSettings,
  type InvoicePdfAdditionalOption,
  type InvoicePdfFieldKey,
  type InvoicePdfSettings,
} from '@/lib/billing-accounting/invoicePdfSettingsStore';
import { InvoicePdfPreviewSheet } from './InvoicePdfPreviewSheet';

const ease = [0.22, 1, 0.36, 1] as const;

const BILLING_NAME_OPTIONS = [
  { value: 'Special', label: 'Special' },
  { value: 'School', label: 'School' },
  { value: 'Guardian', label: 'Guardian' },
];

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`bip-color-row${disabled ? ' is-disabled' : ''}`}>
      <span className="bip-color-label">{label}</span>
      <label className="bip-color">
        <span className="bip-color-swatch" style={{ background: value }} aria-hidden>
          <input
            type="color"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
          />
        </span>
        <input
          className="ui-input bip-color-hex"
          value={value.toUpperCase()}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            onChange(next);
          }}
          spellCheck={false}
        />
      </label>
    </div>
  );
}

function ToggleRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`bip-toggle${checked ? ' is-on' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="bip-toggle-mark" aria-hidden>
        {checked ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      <span>{label}</span>
    </label>
  );
}

export function CustomizeInvoicePdfPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<InvoicePdfSettings>(() => loadInvoicePdfSettings());
  const [billingNames, setBillingNames] = useState(BILLING_NAME_OPTIONS);
  const [addNameOpen, setAddNameOpen] = useState(false);
  const [newBillingName, setNewBillingName] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setSettings(loadInvoicePdfSettings());
  }, []);

  const onBack = () => router.push('/billing-accounting/invoices');

  const patch = (partial: Partial<InvoicePdfSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  };

  const patchField = (key: InvoicePdfFieldKey, value: boolean) => {
    setSettings((s) => ({ ...s, fields: { ...s.fields, [key]: value } }));
  };

  const reset = () => {
    setSettings({
      ...DEFAULT_INVOICE_PDF_SETTINGS,
      fields: { ...DEFAULT_INVOICE_PDF_SETTINGS.fields },
    });
  };

  const save = () => {
    saveInvoicePdfSettings(settings);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  const additionalOptions = [
    { value: '', label: 'Select additional field' },
    ...ADDITIONAL_FIELD_OPTIONS.flatMap((g) =>
      g.items.map((i) => ({ value: i.value, label: `${g.group}: ${i.label}` })),
    ),
  ];

  return (
    <motion.div
      className="bip-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease }}
    >
      <header className="bip-topbar">
        <div className="bip-topbar-title">
          <button type="button" className="bip-back" onClick={onBack} aria-label="Back to invoices">
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="bip-topbar-ico" aria-hidden>
            <Settings2 size={18} />
          </span>
          <div>
            <h1>Customize Invoice PDF</h1>
            <p>Live preview updates as you style fields, colors, and extras.</p>
          </div>
        </div>
        <div className="bip-topbar-actions">
          <AnimatePresence>
            {savedFlash ? (
              <motion.span
                className="bip-saved"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Changes saved
              </motion.span>
            ) : null}
          </AnimatePresence>
          <button type="button" className="bip-reset" onClick={reset}>
            <RotateCcw size={14} /> Reset to default
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
            Save Changes
          </button>
        </div>
      </header>

      <div className="bip-body">
        <aside className="bip-sidebar">
          <section className="bip-section">
            <div className="bip-section-head">
              <h3>Customize Style</h3>
            </div>
          </section>

          <section className="bip-section">
            <h3>Select fields to display</h3>
            <div className="bip-field-grid">
              {DISPLAY_FIELD_OPTIONS.map((f, i) => (
                <motion.label
                  key={f.key}
                  className={`bip-check${settings.fields[f.key] ? ' is-on' : ''}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * i, duration: 0.25, ease }}
                >
                  <input
                    type="checkbox"
                    checked={settings.fields[f.key]}
                    onChange={(e) => patchField(f.key, e.target.checked)}
                  />
                  <span className="bip-check-mark" aria-hidden>
                    {settings.fields[f.key] ? <Check size={11} strokeWidth={3} /> : null}
                  </span>
                  {f.label}
                </motion.label>
              ))}
            </div>
          </section>

          <section className="bip-section">
            <h3>Invoice heading</h3>
            <div className="ui-field">
              <label className="ui-label">Modify Text</label>
              <input
                className="ui-input"
                value={settings.heading}
                onChange={(e) => patch({ heading: e.target.value })}
              />
            </div>
          </section>

          <section className="bip-section">
            <h3>Additional Fields</h3>
            <div className="bip-stack">
              <div className="ui-field">
                <label className="ui-label">Additional field one</label>
                <AppSelect
                  value={settings.additionalFieldOne}
                  onChange={(v) => patch({ additionalFieldOne: v as InvoicePdfAdditionalOption })}
                  options={additionalOptions}
                  searchable
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Additional field two</label>
                <AppSelect
                  value={settings.additionalFieldTwo}
                  onChange={(v) => patch({ additionalFieldTwo: v as InvoicePdfAdditionalOption })}
                  options={additionalOptions}
                  searchable
                />
              </div>
            </div>
          </section>

          <section className="bip-section">
            <h3>Extra Information</h3>
            <div className="bip-inline-2">
              <div className="ui-field">
                <label className="ui-label">Field Name</label>
                <input
                  className="ui-input"
                  value={settings.extraFieldName}
                  onChange={(e) => patch({ extraFieldName: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Field Value</label>
                <input
                  className="ui-input"
                  value={settings.extraFieldValue}
                  onChange={(e) => patch({ extraFieldValue: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="bip-section">
            <ToggleRow
              checked={settings.showBillingAddress}
              label="Billing address"
              onChange={(v) => patch({ showBillingAddress: v })}
            />
            <AnimatePresence initial={false}>
              {settings.showBillingAddress ? (
                <motion.div
                  className="bip-stack bip-indent"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="ui-field">
                    <label className="ui-label">Billing Name</label>
                    <div className="bip-add-row">
                      <AppSelect
                        value={settings.billingName}
                        onChange={(v) => patch({ billingName: v })}
                        options={billingNames}
                      />
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline bip-add-btn"
                        onClick={() => setAddNameOpen(true)}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">Billing Address</label>
                    <textarea
                      className="ui-textarea"
                      rows={2}
                      value={settings.billingAddress}
                      onChange={(e) => patch({ billingAddress: e.target.value })}
                      placeholder="Optional address lines"
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          <section className="bip-section">
            <ToggleRow
              checked={settings.showItemCode}
              label="Add item code"
              onChange={(v) => patch({ showItemCode: v })}
            />
            {settings.showItemCode ? (
              <div className="ui-field bip-indent">
                <label className="ui-label">Modify Text</label>
                <input
                  className="ui-input"
                  value={settings.itemCodeLabel}
                  onChange={(e) => patch({ itemCodeLabel: e.target.value })}
                />
              </div>
            ) : null}
          </section>

          <section className="bip-section">
            <ToggleRow
              checked={settings.showTaxSummary}
              label="Tax Summary Table"
              onChange={(v) => patch({ showTaxSummary: v })}
            />
            {settings.showTaxSummary ? (
              <div className="bip-indent">
                <ColorField
                  label="Table column header"
                  value={settings.taxHeaderColor}
                  onChange={(v) => patch({ taxHeaderColor: v })}
                />
              </div>
            ) : null}
          </section>

          <section className="bip-section">
            <ToggleRow
              checked={settings.showPaymentQr}
              label="Payment QR"
              onChange={(v) => patch({ showPaymentQr: v })}
            />
            {settings.showPaymentQr ? (
              <div className="bip-stack bip-indent">
                <div className="ui-field">
                  <label className="ui-label">Modify Text</label>
                  <input
                    className="ui-input"
                    value={settings.paymentQrLabel}
                    onChange={(e) => patch({ paymentQrLabel: e.target.value })}
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Upload QR Image</label>
                  <label className="bip-upload">
                    <ImagePlus size={16} />
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          patch({ paymentQrDataUrl: String(reader.result || '') });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </section>

          <section className="bip-section">
            <h3>Text</h3>
            <ColorField
              label="Text color 1"
              value={settings.textColor1}
              onChange={(v) => patch({ textColor1: v })}
            />
            <ColorField
              label="Text color 2"
              value={settings.textColor2}
              onChange={(v) => patch({ textColor2: v })}
            />
            <div className="bip-color-row">
              <span className="bip-color-label">Font size</span>
              <input
                className="ui-input bip-font-size"
                type="number"
                min={8}
                max={16}
                value={settings.fontSize}
                onChange={(e) => patch({ fontSize: Number(e.target.value) || 10 })}
              />
            </div>
          </section>

          <section className="bip-section">
            <h3>Colors</h3>
            <ColorField
              label="Background"
              value={settings.backgroundColor}
              onChange={(v) => patch({ backgroundColor: v })}
            />
            <ColorField
              label="Header & Footer"
              value={settings.headerFooterColor}
              onChange={(v) => patch({ headerFooterColor: v })}
            />
            <ColorField
              label="Table column header"
              value={settings.tableHeaderColor}
              onChange={(v) => patch({ tableHeaderColor: v })}
            />
          </section>
        </aside>

        <main className="bip-preview-pane">
          <div className="bip-preview-stage">
            <InvoicePdfPreviewSheet settings={settings} />
          </div>
        </main>
      </div>

      <Modal
        open={addNameOpen}
        title="Billing Name"
        elevated
        onClose={() => setAddNameOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setAddNameOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                const name = newBillingName.trim();
                if (!name) return;
                setBillingNames((list) =>
                  list.some((x) => x.value === name) ? list : [...list, { value: name, label: name }],
                );
                patch({ billingName: name });
                setNewBillingName('');
                setAddNameOpen(false);
              }}
            >
              Save
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label">Billing Name</label>
          <input
            className="ui-input"
            placeholder="Billing Name"
            value={newBillingName}
            onChange={(e) => setNewBillingName(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>
    </motion.div>
  );
}
