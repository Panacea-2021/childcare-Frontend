/* Billing invoice styles — scoped to this route tree (not global root). */
import '@/components/modules/billing-accounting/billing-invoices.css';
import '@/components/modules/billing-accounting/billing-invoices-spacing.css';
import '@/components/modules/billing-accounting/customize-invoice-pdf.css';

export default function BillingAccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
