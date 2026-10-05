'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import {
  ADDITIONAL_FIELD_OPTIONS,
  type InvoicePdfAdditionalOption,
  type InvoicePdfSettings,
} from '@/lib/billing-accounting/invoicePdfSettingsStore';

const ease = [0.22, 1, 0.36, 1] as const;

export type InvoicePdfPreviewLine = {
  name: string;
  description?: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  amount: number;
};

export type InvoicePdfPreviewTaxRow = {
  name: string;
  rate: number;
  amount: number;
};

export type InvoicePdfPreviewData = {
  dueAmount: number;
  dueDateLabel: string;
  studentName?: string;
  className?: string;
  motherName?: string;
  fatherName?: string;
  invoiceNumber?: string;
  dateIssued?: string;
  dueDate?: string;
  billingPeriod?: string;
  lines: InvoicePdfPreviewLine[];
  taxRows?: InvoicePdfPreviewTaxRow[];
  subtotal: number;
  discount: number;
  total: number;
};

const SAMPLE_ADDITIONAL: Record<Exclude<InvoicePdfAdditionalOption, ''>, string> = {
  birthDate: '12 Mar 2020',
  admissionNumber: 'ADM-1024',
  admissionDate: '01 Jun 2023',
  address: '12 Garden Road, Hyderabad',
  parentOnePhone: '+91 98765 43210',
  parentTwoPhone: '+91 98765 10022',
};

const SAMPLE_DATA: InvoicePdfPreviewData = {
  dueAmount: 12500,
  dueDateLabel: '12/08/2026',
  studentName: 'Demo Child',
  className: 'Childcare',
  motherName: 'Evelyn Carter',
  fatherName: 'Benjamin Parker',
  invoiceNumber: 'INV-5',
  dateIssued: '05/08/2026',
  dueDate: '12/08/2026',
  billingPeriod: '05/08/2026 - 05/08/2026',
  lines: [
    {
      name: 'Full Day Monthly',
      description: 'Tuition · Aug 2026',
      itemCode: 'FEE-001',
      quantity: 1,
      unitPrice: 12500,
      taxPercent: 0,
      amount: 12500,
    },
  ],
  taxRows: [{ name: 'GST', rate: 0, amount: 0 }],
  subtotal: 12500,
  discount: 0,
  total: 12500,
};

function additionalLabel(value: InvoicePdfAdditionalOption) {
  for (const group of ADDITIONAL_FIELD_OPTIONS) {
    const hit = group.items.find((i) => i.value === value);
    if (hit) return hit.label;
  }
  return '';
}

export function formatInvoicePdfMoney(n: number) {
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type Props = {
  settings: InvoicePdfSettings;
  /** When omitted, sample customize-PDF demo data is used. */
  data?: InvoicePdfPreviewData;
};

export function InvoicePdfPreviewSheet({ settings, data }: Props) {
  const invoice = data ?? SAMPLE_DATA;

  const detailPairs = useMemo(() => {
    const left: { label: string; value: string }[] = [];
    const right: { label: string; value: string }[] = [];
    if (settings.fields.studentName) {
      left.push({ label: 'Student Name', value: invoice.studentName || '—' });
    }
    if (settings.fields.className) {
      left.push({ label: 'Class Name', value: invoice.className || '—' });
    }
    if (settings.fields.motherName) {
      left.push({ label: 'Mother Name', value: invoice.motherName || '—' });
    }
    if (settings.fields.fatherName) {
      left.push({ label: 'Father Name', value: invoice.fatherName || '—' });
    }
    if (settings.fields.invoiceNumber) {
      right.push({ label: 'Invoice Number', value: invoice.invoiceNumber || '—' });
    }
    if (settings.fields.dateIssued) {
      right.push({ label: 'Date Issued', value: invoice.dateIssued || '—' });
    }
    if (settings.fields.dueDate) {
      right.push({ label: 'Due Date', value: invoice.dueDate || '—' });
    }
    if (settings.fields.billingPeriod) {
      right.push({ label: 'Billing Period', value: invoice.billingPeriod || '—' });
    }

    const extras: { label: string; value: string }[] = [];
    if (settings.additionalFieldOne) {
      extras.push({
        label: additionalLabel(settings.additionalFieldOne),
        value: SAMPLE_ADDITIONAL[settings.additionalFieldOne],
      });
    }
    if (settings.additionalFieldTwo) {
      extras.push({
        label: additionalLabel(settings.additionalFieldTwo),
        value: SAMPLE_ADDITIONAL[settings.additionalFieldTwo],
      });
    }
    if (settings.extraFieldName.trim()) {
      extras.push({
        label: settings.extraFieldName.trim(),
        value: settings.extraFieldValue.trim() || '—',
      });
    }

    extras.forEach((row, i) => {
      if (i % 2 === 0) left.push(row);
      else right.push(row);
    });

    return { left, right };
  }, [settings, invoice]);

  const taxRows = invoice.taxRows?.length
    ? invoice.taxRows
    : [{ name: 'GST', rate: 0, amount: 0 }];

  return (
    <motion.article
      className="bip-preview-sheet"
      style={{
        background: settings.backgroundColor,
        color: settings.textColor1,
        fontSize: `${settings.fontSize + 3}px`,
      }}
      layout
      transition={{ duration: 0.25, ease }}
    >
      <div className="bip-preview-notice">
        <Sparkles size={14} />
        Invoice will be created using language selected in the school settings
      </div>

      <header className="bip-preview-top" style={{ background: settings.headerFooterColor }}>
        <div className="bip-preview-brand">
          <span className="bip-preview-logo" aria-hidden />
          <div>
            <strong>Hams Kids Home | Daycare</strong>
            <em style={{ color: settings.textColor2 }}>Panacea Childcare Group</em>
          </div>
        </div>
        <h2 style={{ color: settings.textColor1 }}>{settings.heading || 'INVOICE'}</h2>
      </header>

      <div className="bip-preview-billrow">
        <div>
          {settings.showBillingAddress ? (
            <>
              <span style={{ color: settings.textColor2 }}>Bill to</span>
              <strong>{settings.billingName || 'Special'}</strong>
              {settings.billingAddress ? <p>{settings.billingAddress}</p> : null}
            </>
          ) : (
            <span style={{ color: settings.textColor2 }}>Bill to family</span>
          )}
        </div>
        <div className="bip-preview-due">
          <strong>{formatInvoicePdfMoney(invoice.dueAmount)}</strong>
          <span>due on {invoice.dueDateLabel}</span>
        </div>
      </div>

      <div className="bip-preview-grid">
        <div>
          {detailPairs.left.map((row) => (
            <div key={`${row.label}-${row.value}`} className="bip-preview-meta">
              <span style={{ color: settings.textColor2 }}>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
        <div>
          {detailPairs.right.map((row) => (
            <div key={`${row.label}-${row.value}`} className="bip-preview-meta">
              <span style={{ color: settings.textColor2 }}>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <table className="bip-preview-table">
        <thead>
          <tr style={{ background: settings.tableHeaderColor }}>
            <th>DESCRIPTION</th>
            {settings.showItemCode ? <th>{settings.itemCodeLabel || 'Item Code'}</th> : null}
            <th>QTY</th>
            <th>UNIT PRICE</th>
            <th>TAX</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, idx) => (
            <tr key={`${line.name}-${idx}`}>
              <td>
                <strong>{line.name}</strong>
                {line.description ? (
                  <small style={{ color: settings.textColor2 }}>{line.description}</small>
                ) : null}
              </td>
              {settings.showItemCode ? <td>{line.itemCode || '—'}</td> : null}
              <td>{line.quantity}</td>
              <td>{formatInvoicePdfMoney(line.unitPrice)}</td>
              <td>{line.taxPercent}%</td>
              <td>{formatInvoicePdfMoney(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {settings.showTaxSummary ? (
        <div className="bip-preview-tax">
          <table>
            <thead>
              <tr style={{ background: settings.taxHeaderColor }}>
                <th>Tax</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {taxRows.map((row) => (
                <tr key={`${row.name}-${row.rate}`}>
                  <td>{row.name}</td>
                  <td>{row.rate}%</td>
                  <td>{formatInvoicePdfMoney(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="bip-preview-totals">
        <div>
          <span style={{ color: settings.textColor2 }}>Subtotal</span>
          <strong>{formatInvoicePdfMoney(invoice.subtotal)}</strong>
        </div>
        <div>
          <span style={{ color: settings.textColor2 }}>Discount</span>
          <strong>{formatInvoicePdfMoney(invoice.discount)}</strong>
        </div>
        <div className="is-total">
          <span>Total</span>
          <strong>{formatInvoicePdfMoney(invoice.total)}</strong>
        </div>
      </div>

      {settings.showPaymentQr ? (
        <div className="bip-preview-qr">
          <div className="bip-preview-qr-box" aria-hidden>
            {settings.paymentQrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.paymentQrDataUrl} alt="" />
            ) : (
              <span>QR</span>
            )}
          </div>
          <p>{settings.paymentQrLabel || 'Scan QR to pay'}</p>
        </div>
      ) : null}
    </motion.article>
  );
}
