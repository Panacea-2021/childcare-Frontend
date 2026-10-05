import type { ParentInvoice } from './types';

export type ParentPaymentResult = {
  ok: boolean;
  invoiceId: string;
  message?: string;
};

/**
 * Single entry point for parent invoice payment.
 *
 * There is currently no parent-portal payment gateway wired in this repo.
 * When a real payment API / gateway integration exists, replace the body of
 * this function — do not add a parallel payment path from the UI.
 *
 * UI contract: confirmation modal → this function → success / error state.
 */
export async function processParentInvoicePayment(
  invoice: ParentInvoice,
): Promise<ParentPaymentResult> {
  // Simulate network latency for the existing (mock) payment path.
  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });

  if (!invoice?.id) {
    return { ok: false, invoiceId: '', message: 'Invalid invoice.' };
  }

  if (invoice.balance <= 0 || invoice.paymentStatus === 'Paid') {
    return {
      ok: false,
      invoiceId: invoice.id,
      message: 'This invoice has already been paid.',
    };
  }

  return {
    ok: true,
    invoiceId: invoice.id,
    message: 'Payment completed successfully.',
  };
}
