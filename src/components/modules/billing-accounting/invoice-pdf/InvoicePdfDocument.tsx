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
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { INVOICE_BRAND, buildInvoiceViewModel } from './invoiceModel';

const C = {
  accent: '#5D5FEF',
  accentHover: '#4B51E0',
  soft: '#E8F2FF',
  softDeep: '#DEECFF',
  border: '#E8EDF5',
  text: '#0F172A',
  muted: '#64748B',
  label: '#94A3B8',
  white: '#FFFFFF',
  rowAlt: '#F8FAFC',
  paid: '#047857',
  due: '#C2410C',
  overdue: '#DC2626',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.text,
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    backgroundColor: C.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    maxWidth: '58%',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    color: C.white,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  product: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.accent,
    marginBottom: 2,
  },
  center: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    marginBottom: 4,
  },
  contact: {
    fontSize: 8,
    color: C.muted,
    lineHeight: 1.45,
  },
  titleBlock: {
    alignItems: 'flex-end',
    maxWidth: '40%',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    color: C.text,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 8.5,
    color: C.muted,
    marginBottom: 2,
    textAlign: 'right',
  },
  metaStrong: {
    fontFamily: 'Helvetica-Bold',
    color: C.text,
  },
  statusPill: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: C.softDeep,
  },
  statusText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.accentHover,
    textTransform: 'uppercase',
  },
  dueBanner: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.soft,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueBannerText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.accentHover,
  },
  columns: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 16,
  },
  col: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: C.rowAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  colTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.accent,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  field: {
    marginBottom: 5,
  },
  fieldLabel: {
    fontSize: 7.5,
    color: C.label,
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
  },
  table: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.accent,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  th: {
    color: C.white,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  rowAlt: {
    backgroundColor: C.rowAlt,
  },
  td: {
    fontSize: 8.5,
    color: C.text,
  },
  tdMuted: {
    fontSize: 8,
    color: C.muted,
  },
  colDesc: { width: '40%' },
  colQty: { width: '12%', textAlign: 'right' },
  colUnit: { width: '16%', textAlign: 'right' },
  colTax: { width: '14%', textAlign: 'right' },
  colAmt: { width: '18%', textAlign: 'right' },
  totalsWrap: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  totals: {
    width: 220,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 8.5,
    color: C.muted,
  },
  totalValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
  },
  dueBox: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.softDeep,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueBoxLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.accentHover,
  },
  dueBoxValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.accent,
  },
  footer: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 22,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    marginBottom: 3,
  },
  footerText: {
    fontSize: 7.5,
    color: C.muted,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  footerMeta: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pageNumber: {
    fontSize: 7.5,
    color: C.label,
  },
});

function statusPillStyle(status: string) {
  if (status === 'Paid') return { backgroundColor: '#D1FAE5' };
  if (status === 'Overdue') return { backgroundColor: '#FEE2E2' };
  if (status === 'Due') return { backgroundColor: '#FFF7ED' };
  return {};
}

function statusTextStyle(status: string) {
  if (status === 'Paid') return { color: C.paid };
  if (status === 'Overdue') return { color: C.overdue };
  if (status === 'Due') return { color: C.due };
  return {};
}

export function InvoicePdfDocument({ invoice }: { invoice: CenterInvoice }) {
  const vm = buildInvoiceViewModel(invoice);
  const { invoice: inv, lines } = vm;

  return (
    <Document title={`${inv.invoiceId} · ${INVOICE_BRAND.product}`} author={INVOICE_BRAND.product}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Text style={styles.logoMark}>P</Text>
            </View>
            <View>
              <Text style={styles.product}>{INVOICE_BRAND.product}</Text>
              <Text style={styles.center}>{INVOICE_BRAND.center}</Text>
              {INVOICE_BRAND.address.map((line) => (
                <Text key={line} style={styles.contact}>
                  {line}
                </Text>
              ))}
              <Text style={styles.contact}>
                {INVOICE_BRAND.phone} · {INVOICE_BRAND.email}
              </Text>
              <Text style={styles.contact}>{INVOICE_BRAND.website}</Text>
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{inv.kind === 'debit' ? 'DEBIT NOTE' : 'INVOICE'}</Text>
            <Text style={styles.metaLine}>
              No. <Text style={styles.metaStrong}>{inv.invoiceId}</Text>
            </Text>
            <Text style={styles.metaLine}>
              Issued <Text style={styles.metaStrong}>{formatDisplayDate(inv.invoiceDate)}</Text>
            </Text>
            <Text style={styles.metaLine}>
              Due <Text style={styles.metaStrong}>{formatDisplayDate(inv.dueDate)}</Text>
            </Text>
            <View style={[styles.statusPill, statusPillStyle(inv.status)]}>
              <Text style={[styles.statusText, statusTextStyle(inv.status)]}>{inv.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dueBanner}>
          <Text style={styles.dueBannerText}>{vm.dueLabel}</Text>
          <Text style={styles.dueBannerText}>{inv.billingPlan}</Text>
        </View>

        <View style={styles.columns}>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Bill to</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Student</Text>
              <Text style={styles.fieldValue}>{inv.studentName}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Program</Text>
              <Text style={styles.fieldValue}>{inv.billingPlan}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Class</Text>
              <Text style={styles.fieldValue}>{inv.roomId || 'Demo Room'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Billing period</Text>
              <Text style={styles.fieldValue}>{vm.period}</Text>
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.colTitle}>Summary</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Invoice number</Text>
              <Text style={styles.fieldValue}>{inv.invoiceId}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date issued</Text>
              <Text style={styles.fieldValue}>{formatDisplayDate(inv.invoiceDate)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Due date</Text>
              <Text style={styles.fieldValue}>{formatDisplayDate(inv.dueDate)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Created by</Text>
              <Text style={styles.fieldValue}>{inv.createdBy || '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colUnit]}>Unit Price</Text>
            <Text style={[styles.th, styles.colTax]}>Tax</Text>
            <Text style={[styles.th, styles.colAmt]}>Amount</Text>
          </View>
          {lines.map((line, index) => (
            <View
              key={line.id}
              style={index % 2 === 1 ? [styles.row, styles.rowAlt] : styles.row}
              wrap={false}
            >
              <View style={styles.colDesc}>
                <Text style={[styles.td, { fontFamily: 'Helvetica-Bold' }]}>{line.name}</Text>
                {line.taxPercent > 0 ? (
                  <Text style={styles.tdMuted}>Tax {line.taxPercent}%</Text>
                ) : null}
              </View>
              <Text style={[styles.td, styles.colQty]}>{line.quantity.toFixed(2)}</Text>
              <Text style={[styles.td, styles.colUnit]}>{formatInr(line.unitPrice)}</Text>
              <Text style={[styles.td, styles.colTax]}>{line.taxLabel}</Text>
              <Text style={[styles.td, styles.colAmt, { fontFamily: 'Helvetica-Bold' }]}>
                {formatInr(line.amount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap} wrap={false}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatInr(vm.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>{formatInr(vm.discount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{formatInr(vm.taxTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Paid</Text>
              <Text style={styles.totalValue}>{formatInr(vm.paid)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Balance</Text>
              <Text style={styles.totalValue}>{formatInr(vm.balance)}</Text>
            </View>
            <View style={styles.dueBox}>
              <Text style={styles.dueBoxLabel}>Amount Due</Text>
              <Text style={styles.dueBoxValue}>{formatInr(vm.amountDue)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerTitle}>Payment instructions</Text>
          <Text style={styles.footerText}>{INVOICE_BRAND.paymentNote}</Text>
          <Text style={styles.footerText}>{INVOICE_BRAND.terms}</Text>
          <Text style={styles.footerText}>{INVOICE_BRAND.thankYou}</Text>
          <View style={styles.footerMeta}>
            <Text style={styles.pageNumber}>Generated {vm.generatedAt}</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
