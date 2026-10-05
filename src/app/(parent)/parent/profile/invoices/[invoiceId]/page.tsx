import { ParentInvoiceDetailPage } from '@/components/parent/pages/ParentInvoiceDetailPage';

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return <ParentInvoiceDetailPage invoiceId={invoiceId} />;
}
