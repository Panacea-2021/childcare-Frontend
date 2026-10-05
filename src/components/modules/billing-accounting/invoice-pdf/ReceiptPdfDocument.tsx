import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import {
  formatDisplayDate,
  formatInr,
  formatInvoicePaymentMode,
  type CenterInvoice,
  type InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';
import { INVOICE_BRAND, buildInvoiceViewModel } from './invoiceModel';

const C = {
  accent: '#5D5FEF',
  soft: '#E8F2FF',
  softDeep: '#DEECFF',
  border: '#E8EDF5',
  text: '#0F172A',
  muted: '#64748B',
  white: '#FFFFFF',
  paid: '#047857',
  paidBg: '#D1FAE5',
  rowAlt: '#F8FAFC',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.text,
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 32,
    backgroundColor: C.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brand: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.accent },
  center: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  contact: { fontSize: 8, color: C.muted, marginTop: 4, lineHeight: 1.4 },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoMark: { color: C.white, fontSize: 11, fontFamily: 'Helvetica-Bold' },
  brandRow: { flexDirection: 'row', alignItems: 'flex-start' },
  titleWrap: { alignItems: 'center', marginVertical: 14 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', letterSpacing: 1.2 },
  receiptId: { marginTop: 4, fontSize: 11, color: C.muted },
  paidPill: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: C.paidBg,
  },
  paidText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.paid },
  metaGrid: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  metaCol: { flex: 1, gap: 4 },
  metaLine: { fontSize: 9, color: C.text, marginBottom: 3 },
  metaLabel: { color: C.muted },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.softDeep,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.text },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  td: { fontSize: 9, color: C.text },
  muted: { fontSize: 8, color: C.muted, marginTop: 2 },
  totals: { marginTop: 10, alignItems: 'flex-end', gap: 4 },
  totalLine: { flexDirection: 'row', gap: 24 },
  totalLabel: { fontSize: 9, color: C.muted, width: 80, textAlign: 'right' },
  totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', width: 90, textAlign: 'right' },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.6,
  },
  watermark: {
    position: 'absolute',
    top: '42%',
    left: '28%',
    fontSize: 54,
    color: '#86EFAC',
    opacity: 0.22,
    transform: 'rotate(-28deg)',
    fontFamily: 'Helvetica-Bold',
  },
});

type Props = {
  invoice: CenterInvoice;
  payment: InvoicePayment;
  roomName?: string;
  motherName?: string;
  fatherName?: string;
};

export function ReceiptPdfDocument({
  invoice,
  payment,
  roomName = '—',
  motherName = '—',
  fatherName = '—',
}: Props) {
  const vm = buildInvoiceViewModel(invoice);

  return (
    <Document title={`${payment.receiptId} · ${invoice.invoiceId}`} author={INVOICE_BRAND.product}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>Paid</Text>

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoMark}>P</Text>
            </View>
            <View>
              <Text style={styles.brand}>{INVOICE_BRAND.product}</Text>
              <Text style={styles.center}>{INVOICE_BRAND.center}</Text>
              <Text style={styles.contact}>{INVOICE_BRAND.address.join('\n')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            {invoice.kind === 'debit' ? 'DEBIT NOTE RECEIPT' : 'RECEIPT'}
          </Text>
          <Text style={styles.receiptId}>{payment.receiptId}</Text>
          <View style={styles.paidPill}>
            <Text style={styles.paidText}>{formatInr(payment.amount)} Paid</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Student Name: </Text>
              {invoice.studentName}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Class Name: </Text>
              {roomName}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Mother Name: </Text>
              {motherName}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Father Name: </Text>
              {fatherName}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Invoice Number: </Text>
              {invoice.invoiceId}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Date Issued: </Text>
              {formatDisplayDate(invoice.invoiceDate)}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Due Date: </Text>
              {formatDisplayDate(invoice.dueDate)}
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaLabel}>Billing Period: </Text>
              {vm.period}
            </Text>
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.th, { width: '40%' }]}>DESCRIPTION</Text>
          <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>QTY</Text>
          <Text style={[styles.th, { width: '16%', textAlign: 'right' }]}>UNIT PRICE</Text>
          <Text style={[styles.th, { width: '12%', textAlign: 'right' }]}>TAX</Text>
          <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>AMOUNT</Text>
        </View>
        {vm.lines.map((line) => (
          <View key={line.id} style={styles.row} wrap={false}>
            <View style={{ width: '40%' }}>
              <Text style={styles.td}>{line.name}</Text>
              <Text style={styles.muted}>Item Code - M0PK</Text>
            </View>
            <Text style={[styles.td, { width: '12%', textAlign: 'right' }]}>
              {line.quantity.toFixed(2)}
            </Text>
            <Text style={[styles.td, { width: '16%', textAlign: 'right' }]}>
              {formatInr(line.unitPrice)}
            </Text>
            <Text style={[styles.td, { width: '12%', textAlign: 'right' }]}>{line.taxLabel}</Text>
            <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>
              {formatInr(line.amount)}
            </Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatInr(vm.subtotal)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatInr(invoice.invoicedAmount)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>PAYMENTS</Text>
        <View style={styles.tableHead}>
          <Text style={[styles.th, { width: '28%' }]}>MODE</Text>
          <Text style={[styles.th, { width: '28%' }]}>DATE</Text>
          <Text style={[styles.th, { width: '24%' }]}>REF. NO</Text>
          <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>AMOUNT</Text>
        </View>
        {(invoice.payments ?? []).map((p) => (
          <View key={p.id} style={styles.row} wrap={false}>
            <Text style={[styles.td, { width: '28%' }]}>{formatInvoicePaymentMode(p.mode)}</Text>
            <Text style={[styles.td, { width: '28%' }]}>{formatDisplayDate(p.date)}</Text>
            <Text style={[styles.td, { width: '24%' }]}>{p.reference || '—'}</Text>
            <Text style={[styles.td, { width: '20%', textAlign: 'right' }]}>
              {formatInr(p.amount)}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
