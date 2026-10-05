'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import './my-account.css';

type Invoice = {
  id: string;
  status: 'Paid' | 'Due' | 'Overdue';
  dueDate: string;
  total: string;
  paymentDate: string;
};

type BillingState = {
  ownerName: string;
  ownerEmail: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'INV-1001',
    status: 'Paid',
    dueDate: '01-07-2026',
    total: '₹24,000',
    paymentDate: '28-06-2026',
  },
  {
    id: 'INV-1002',
    status: 'Due',
    dueDate: '01-08-2026',
    total: '₹24,000',
    paymentDate: '',
  },
];

const INITIAL_BILLING: BillingState = {
  ownerName: 'Center Administrator',
  ownerEmail: 'admin@panacea.care',
  contactName: 'Center Administrator',
  contactEmail: 'admin@panacea.care',
  contactPhone: '+91 98765 43210',
  addressLine1: '12 MG Road',
  addressLine2: 'Koramangala',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560034',
  country: 'India',
};

function formatRenewalDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function MyAccountPage() {
  const router = useRouter();
  const renewalDate = useMemo(() => formatRenewalDate('2026-08-15'), []);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billing] = useState<BillingState>(INITIAL_BILLING);

  const closeBilling = () => setBillingOpen(false);

  const show = (value: string) => (value.trim() ? value : '—');

  return (
    <div className="mod-page ma-page">
      <div className="ma-titleRow">
        <button
          type="button"
          className="ma-backBtn"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <h1 className="ma-pageTitle">My Account</h1>
      </div>

      <section className="ma-hero" aria-label="Subscription and billing">
        <div className="ma-heroTop">
          <div className="ma-heroBadge">
            <Sparkles size={14} aria-hidden />
            Annual plan
          </div>
          <h2 className="ma-heroTitle">Subscription &amp; billing</h2>
          <p className="ma-heroSub">
            Manage renewal, billing contacts, and invoice history for your center.
          </p>
        </div>

        <div className="ma-heroGrid">
          <article className="ma-tile ma-tile--renewal">
            <span className="ma-tileIcon" aria-hidden>
              <CalendarDays size={20} />
            </span>
            <div className="ma-tileBody">
              <p className="ma-tileLabel">Subscription renews on</p>
              <p className="ma-tileValue">{renewalDate}</p>
              <p className="ma-tileHint">Your annual subscription stays active until this date.</p>
            </div>
          </article>

          <article className="ma-tile ma-tile--billing">
            <span className="ma-tileIcon" aria-hidden>
              <CreditCard size={20} />
            </span>
            <div className="ma-tileBody">
              <p className="ma-tileLabel">Billing details</p>
              <p className="ma-tileValue">Owner, contact &amp; address</p>
              <button type="button" className="ma-tileAction" onClick={() => setBillingOpen(true)}>
                View details
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
          </article>
        </div>

        <div className="ma-heroFooter">
          <button
            type="button"
            className="ui-btn ui-btn-primary ma-salesBtn"
            onClick={() => {
              window.location.href = 'mailto:sales@panacea.care?subject=Sales%20inquiry';
            }}
          >
            <Headphones size={16} aria-hidden />
            Contact Sales
          </button>
          <p className="ma-heroFooterNote">Need a plan change or upgrade? Our team can help.</p>
        </div>
      </section>

      <section className="ma-invoices" aria-label="Invoices">
        <h2 className="ma-invoicesTitle">Invoices</h2>
        <div className="ui-table-wrap ma-tableWrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Invoice Total</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_INVOICES.length === 0 ? (
                <tr>
                  <td colSpan={5} className="ma-emptyCell">
                    No Data
                  </td>
                </tr>
              ) : (
                SAMPLE_INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.id}</td>
                    <td>
                      <span className={`ma-status is-${inv.status.toLowerCase()}`}>{inv.status}</span>
                    </td>
                    <td>{inv.dueDate}</td>
                    <td>{inv.total}</td>
                    <td>{inv.paymentDate || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={billingOpen}
        title="Billing Details"
        onClose={closeBilling}
        wide
        icon={<CreditCard size={18} />}
        footer={
          <button type="button" className="ui-btn ui-btn-outline" onClick={closeBilling}>
            Close
          </button>
        }
      >
        <p className="ma-formSection">Billing Owner</p>
        <div className="ui-grid-2">
          <div className="ui-field">
            <span className="ui-label">Owner name</span>
            <p className="ma-readonly">{show(billing.ownerName)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">Owner email</span>
            <p className="ma-readonly">{show(billing.ownerEmail)}</p>
          </div>
        </div>

        <p className="ma-formSection">Billing Contact</p>
        <div className="ui-grid-2">
          <div className="ui-field">
            <span className="ui-label">Contact name</span>
            <p className="ma-readonly">{show(billing.contactName)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">Contact email</span>
            <p className="ma-readonly">{show(billing.contactEmail)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">Contact phone</span>
            <p className="ma-readonly">{show(billing.contactPhone)}</p>
          </div>
        </div>

        <p className="ma-formSection">Billing Address</p>
        <div className="ui-grid-2">
          <div className="ui-field">
            <span className="ui-label">Address line 1</span>
            <p className="ma-readonly">{show(billing.addressLine1)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">Address line 2</span>
            <p className="ma-readonly">{show(billing.addressLine2)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">City</span>
            <p className="ma-readonly">{show(billing.city)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">State</span>
            <p className="ma-readonly">{show(billing.state)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">Postal code</span>
            <p className="ma-readonly">{show(billing.postalCode)}</p>
          </div>
          <div className="ui-field">
            <span className="ui-label">Country</span>
            <p className="ma-readonly">{show(billing.country)}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
