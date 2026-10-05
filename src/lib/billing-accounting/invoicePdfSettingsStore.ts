/** Persistable Invoice PDF customization (client / localStorage). */

export type InvoicePdfFieldKey =
  | 'studentName'
  | 'className'
  | 'motherName'
  | 'fatherName'
  | 'invoiceNumber'
  | 'dateIssued'
  | 'dueDate'
  | 'billingPeriod';

export type InvoicePdfAdditionalOption =
  | ''
  | 'birthDate'
  | 'admissionNumber'
  | 'admissionDate'
  | 'address'
  | 'parentOnePhone'
  | 'parentTwoPhone';

export type InvoicePdfSettings = {
  heading: string;
  fields: Record<InvoicePdfFieldKey, boolean>;
  additionalFieldOne: InvoicePdfAdditionalOption;
  additionalFieldTwo: InvoicePdfAdditionalOption;
  extraFieldName: string;
  extraFieldValue: string;
  showBillingAddress: boolean;
  billingName: string;
  billingAddress: string;
  showItemCode: boolean;
  itemCodeLabel: string;
  showTaxSummary: boolean;
  taxHeaderColor: string;
  showPaymentQr: boolean;
  paymentQrLabel: string;
  paymentQrDataUrl: string;
  textColor1: string;
  textColor2: string;
  fontSize: number;
  backgroundColor: string;
  headerFooterColor: string;
  tableHeaderColor: string;
};

export const DEFAULT_INVOICE_PDF_SETTINGS: InvoicePdfSettings = {
  heading: 'INVOICE',
  fields: {
    studentName: true,
    className: true,
    motherName: true,
    fatherName: true,
    invoiceNumber: true,
    dateIssued: true,
    dueDate: true,
    billingPeriod: true,
  },
  additionalFieldOne: '',
  additionalFieldTwo: '',
  extraFieldName: '',
  extraFieldValue: '',
  showBillingAddress: true,
  billingName: 'Special',
  billingAddress: '',
  showItemCode: true,
  itemCodeLabel: 'Item Code',
  showTaxSummary: true,
  taxHeaderColor: '#E8E8E8',
  showPaymentQr: false,
  paymentQrLabel: 'Scan QR to pay',
  paymentQrDataUrl: '',
  textColor1: '#0f172a',
  textColor2: '#5E6470',
  fontSize: 10,
  backgroundColor: '#FFFFFF',
  headerFooterColor: '#F6F7FA',
  tableHeaderColor: '#E8F2FF',
};

const STORAGE_KEY = 'panacea.billing.invoice-pdf-settings.v1';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadInvoicePdfSettings(): InvoicePdfSettings {
  if (!canUseStorage()) return { ...DEFAULT_INVOICE_PDF_SETTINGS, fields: { ...DEFAULT_INVOICE_PDF_SETTINGS.fields } };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INVOICE_PDF_SETTINGS, fields: { ...DEFAULT_INVOICE_PDF_SETTINGS.fields } };
    const parsed = JSON.parse(raw) as Partial<InvoicePdfSettings>;
    return {
      ...DEFAULT_INVOICE_PDF_SETTINGS,
      ...parsed,
      fields: { ...DEFAULT_INVOICE_PDF_SETTINGS.fields, ...(parsed.fields ?? {}) },
    };
  } catch {
    return { ...DEFAULT_INVOICE_PDF_SETTINGS, fields: { ...DEFAULT_INVOICE_PDF_SETTINGS.fields } };
  }
}

export function saveInvoicePdfSettings(settings: InvoicePdfSettings) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const ADDITIONAL_FIELD_OPTIONS: { group: string; items: { value: InvoicePdfAdditionalOption; label: string }[] }[] =
  [
    {
      group: 'Student',
      items: [
        { value: 'birthDate', label: 'Birth Date' },
        { value: 'admissionNumber', label: 'Admission Number' },
        { value: 'admissionDate', label: 'Admission Date' },
        { value: 'address', label: 'Address' },
      ],
    },
    {
      group: 'Parent One',
      items: [{ value: 'parentOnePhone', label: 'Parent One Phone' }],
    },
    {
      group: 'Parent Two',
      items: [{ value: 'parentTwoPhone', label: 'Parent Two Phone' }],
    },
  ];

export const DISPLAY_FIELD_OPTIONS: { key: InvoicePdfFieldKey; label: string }[] = [
  { key: 'studentName', label: 'Student Name' },
  { key: 'className', label: 'Class Name' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'invoiceNumber', label: 'Invoice Number' },
  { key: 'dateIssued', label: 'Date Issued' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'billingPeriod', label: 'Billing Period' },
];
