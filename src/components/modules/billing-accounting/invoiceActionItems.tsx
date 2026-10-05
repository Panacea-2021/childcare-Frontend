import type { ReactNode } from 'react';
import {
  Bell,
  Copy,
  FileText,
  Mail,
  Pencil,
  Receipt,
  RefreshCcw,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  invoiceHasReceipts,
  isInvoicePaidLike,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { loadStudents } from '@/lib/center-management/studentsStore';

export function parentEmailsForInvoice(invoice: CenterInvoice) {
  const students = loadStudents();
  const student =
    students.find((s) => s.id === invoice.studentId) ||
    students.find((s) => s.name.toLowerCase() === invoice.studentName.toLowerCase());
  const emails = (student?.parents ?? [])
    .map((p) => p.email?.trim())
    .filter((email): email is string => Boolean(email));
  return { student, emails: [...new Set(emails)] };
}

export type InvoiceMenuHandlers = {
  onRecordPayment?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClone?: () => void;
  onView?: () => void;
  onViewReceipt?: () => void;
  onDownloadReceipt?: () => void;
  onRefreshPdf?: () => void;
  onEmail?: () => void;
  onRemind?: () => void;
  onCancel?: () => void;
  onRefund?: () => void;
};

export type InvoiceMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function buildParentDebitActionItems(
  invoice: CenterInvoice,
  handlers: InvoiceMenuHandlers,
): InvoiceMenuItem[] {
  const paid = isInvoicePaidLike(invoice);
  const hasReceipts = invoiceHasReceipts(invoice);
  const items: InvoiceMenuItem[] = [
    {
      id: 'view',
      label: 'View Debit',
      icon: <FileText size={15} />,
      onSelect: () => handlers.onView?.(),
    },
  ];
  if (hasReceipts || paid) {
    items.push({
      id: 'receipt',
      label: 'View Receipt',
      icon: <Receipt size={15} />,
      onSelect: () => handlers.onViewReceipt?.() ?? handlers.onDownloadReceipt?.(),
      disabled: !hasReceipts,
    });
  }
  return items;
}

export function buildParentInvoiceActionItems(
  invoice: CenterInvoice,
  handlers: InvoiceMenuHandlers,
): InvoiceMenuItem[] {
  if (invoice.kind === 'debit') return buildParentDebitActionItems(invoice, handlers);

  const paid = isInvoicePaidLike(invoice);
  const hasReceipts = invoiceHasReceipts(invoice);
  const items: InvoiceMenuItem[] = [
    {
      id: 'view',
      label: 'View Invoice',
      icon: <FileText size={15} />,
      onSelect: () => handlers.onView?.(),
    },
  ];
  if (paid && hasReceipts) {
    items.push({
      id: 'receipt',
      label: 'View Receipt',
      icon: <Receipt size={15} />,
      onSelect: () => handlers.onViewReceipt?.() ?? handlers.onDownloadReceipt?.(),
    });
  }
  return items;
}

export function buildDebitActionItems(
  invoice: CenterInvoice,
  handlers: InvoiceMenuHandlers,
): InvoiceMenuItem[] {
  const paid = isInvoicePaidLike(invoice);
  const hasReceipts = invoiceHasReceipts(invoice);
  const items: InvoiceMenuItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil size={15} />,
      onSelect: () => handlers.onEdit?.(),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={15} />,
      danger: true,
      onSelect: () => handlers.onDelete?.(),
    },
  ];

  if (!paid) {
    items.push({
      id: 'record',
      label: 'Record Payment',
      icon: <Receipt size={15} />,
      onSelect: () => handlers.onRecordPayment?.(),
    });
  }

  if (hasReceipts || paid) {
    items.push({
      id: 'receipt',
      label: 'View Receipt',
      icon: <Receipt size={15} />,
      onSelect: () => handlers.onViewReceipt?.() ?? handlers.onDownloadReceipt?.(),
      disabled: !hasReceipts,
    });
  }

  items.push(
    {
      id: 'view',
      label: 'View Debit',
      icon: <FileText size={15} />,
      onSelect: () => handlers.onView?.(),
    },
    {
      id: 'email',
      label: 'Email Debit/Receipt',
      icon: <Mail size={15} />,
      onSelect: () => handlers.onEmail?.(),
    },
  );

  return items;
}

export function buildInvoiceActionItems(
  invoice: CenterInvoice,
  handlers: InvoiceMenuHandlers,
): InvoiceMenuItem[] {
  if (invoice.kind === 'debit') return buildDebitActionItems(invoice, handlers);

  const paid = isInvoicePaidLike(invoice);
  const cancelled = invoice.status === 'Cancelled';
  const hasReceipts = invoiceHasReceipts(invoice);
  const items: InvoiceMenuItem[] = [];

  if (!paid && !cancelled) {
    items.push({
      id: 'record',
      label: 'Record Payment',
      icon: <Receipt size={15} />,
      onSelect: () => handlers.onRecordPayment?.(),
    });
  }

  items.push(
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil size={15} />,
      onSelect: () => handlers.onEdit?.(),
      disabled: cancelled,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={15} />,
      danger: true,
      onSelect: () => handlers.onDelete?.(),
    },
    {
      id: 'clone',
      label: 'Clone',
      icon: <Copy size={15} />,
      onSelect: () => handlers.onClone?.(),
    },
    {
      id: 'view',
      label: 'View Invoice',
      icon: <FileText size={15} />,
      onSelect: () => handlers.onView?.(),
    },
  );

  if (hasReceipts) {
    items.push({
      id: 'receipt',
      label: 'View Receipt',
      icon: <Receipt size={15} />,
      onSelect: () => handlers.onViewReceipt?.() ?? handlers.onDownloadReceipt?.(),
    });
  }

  items.push(
    {
      id: 'refresh',
      label: 'Refresh Pdf',
      icon: <RefreshCcw size={15} />,
      onSelect: () => handlers.onRefreshPdf?.(),
    },
    {
      id: 'email',
      label: 'Email Invoice/Receipt',
      icon: <Mail size={15} />,
      onSelect: () => handlers.onEmail?.(),
    },
  );

  if (!paid && !cancelled) {
    items.push({
      id: 'remind',
      label: 'Send Fee Reminder',
      icon: <Bell size={15} />,
      onSelect: () => handlers.onRemind?.(),
    });
    items.push({
      id: 'cancel',
      label: 'Cancel Invoice',
      icon: <XCircle size={15} />,
      danger: true,
      onSelect: () => handlers.onCancel?.(),
    });
  }

  if (paid) {
    items.push({
      id: 'refund',
      label: 'Refund',
      icon: <RotateCcw size={15} />,
      onSelect: () => handlers.onRefund?.(),
    });
  }

  return items;
}
