'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { invoices as seedInvoices, feePlans as seedFeePlans, badgeClass } from '@/lib/moduleData';
import '@/components/ui/module.css';

const PAGE_SIZE = 5;
type Invoice = (typeof seedInvoices)[number];
type FeePlan = (typeof seedFeePlans)[number];
type Selected = Invoice | FeePlan | (Invoice & { paidOn: string }) | StudentBalance;
type TabId = 'invoices' | 'plans' | 'payments' | 'balances';

export type BillingSection =
  | 'dashboard'
  | 'invoices'
  | 'balances'
  | 'payments'
  | 'plans'
  | 'reminders';

type StudentBalance = {
  id: string;
  student: string;
  family: string;
  due: string;
  overdue: string;
  balance: string;
};

const money = (amount: string) => Number(amount.replace(/[^\d]/g, ''));
const formatMoney = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const SECTION_META: Record<
  Exclude<BillingSection, 'reminders'>,
  { title: string; description: string; tab: TabId; showTabs: boolean }
> = {
  dashboard: {
    title: 'Billing Dashboard',
    description: 'Overview of invoices, fee plans, and family payment activity.',
    tab: 'invoices',
    showTabs: true,
  },
  invoices: {
    title: 'Invoices',
    description: 'Create and track family invoices by status.',
    tab: 'invoices',
    showTabs: false,
  },
  balances: {
    title: 'Student Balances',
    description: 'Outstanding balances grouped by student.',
    tab: 'balances',
    showTabs: false,
  },
  payments: {
    title: 'Payments',
    description: 'Recorded payments against family invoices.',
    tab: 'payments',
    showTabs: false,
  },
  plans: {
    title: 'Fee Plan',
    description: 'Manage recurring fee plans and program pricing.',
    tab: 'plans',
    showTabs: false,
  },
};

type Props = { section?: Exclude<BillingSection, 'reminders'> };

export function BillingAccountingPage({ section = 'dashboard' }: Props) {
  const meta = SECTION_META[section];
  const [tab, setTab] = useState<TabId>(meta.tab);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [feePlans, setFeePlans] = useState(seedFeePlans);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [form, setForm] = useState({ family: '', student: '', amount: '', due: '' });

  const payments = invoices
    .filter((item) => item.status === 'Paid')
    .map((item) => ({ ...item, paidOn: '31 Jul 2026' }));

  const balances = useMemo<StudentBalance[]>(() => {
    const map = new Map<string, StudentBalance>();
    for (const inv of invoices) {
      if (inv.status === 'Paid') continue;
      const key = `${inv.family}::${inv.student}`;
      const amount = money(inv.amount);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          id: key,
          student: inv.student,
          family: inv.family,
          due: inv.status === 'Due' ? inv.amount : formatMoney(0),
          overdue: inv.status === 'Overdue' ? inv.amount : formatMoney(0),
          balance: formatMoney(amount),
        });
        continue;
      }
      const dueAmt = money(existing.due) + (inv.status === 'Due' ? amount : 0);
      const overdueAmt = money(existing.overdue) + (inv.status === 'Overdue' ? amount : 0);
      map.set(key, {
        ...existing,
        due: formatMoney(dueAmt),
        overdue: formatMoney(overdueAmt),
        balance: formatMoney(dueAmt + overdueAmt),
      });
    }
    return Array.from(map.values());
  }, [invoices]);

  const activeTab = section === 'dashboard' ? tab : meta.tab;
  const rows =
    activeTab === 'invoices'
      ? invoices
      : activeTab === 'plans'
        ? feePlans
        : activeTab === 'payments'
          ? payments
          : balances;

  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase()) &&
          (status === 'All' || ('status' in row && row.status === status)),
      ),
    [rows, search, status],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalFor = (target: string) =>
    formatMoney(
      invoices
        .filter((item) => item.status === target)
        .reduce((sum, item) => sum + money(item.amount), 0),
    );
  const outstanding = formatMoney(
    invoices
      .filter((item) => item.status !== 'Paid')
      .reduce((sum, item) => sum + money(item.amount), 0),
  );

  const saveInvoice = () => {
    if (!form.family.trim() || !form.student.trim()) return;
    setInvoices((items) => [
      {
        id: `inv${Date.now()}`,
        family: form.family,
        student: form.student,
        amount: form.amount ? `₹${Number(form.amount).toLocaleString('en-IN')}` : '₹0',
        due: form.due || '05 Aug 2026',
        status: 'Due',
      },
      ...items,
    ]);
    setModalOpen(false);
    if (section === 'dashboard') setTab('invoices');
  };
  const markPaid = (id: string) =>
    setInvoices((items) => items.map((item) => (item.id === id ? { ...item, status: 'Paid' } : item)));
  const remove = (id: string) => {
    if (activeTab === 'plans') setFeePlans((items) => items.filter((item) => item.id !== id));
    else if (activeTab === 'balances') return;
    else setInvoices((items) => items.filter((item) => item.id !== id));
  };

  const isBalances = activeTab === 'balances';
  const isPlans = activeTab === 'plans';
  const isPayments = activeTab === 'payments';

  return (
    <div className="mod-page">
      <PageHeader
        title={meta.title}
        description={meta.description}
        crumbs={['Panacea', 'Billing & Accounting', meta.title]}
        actions={
          <button
            className="ui-btn ui-btn-primary"
            type="button"
            onClick={() => {
              setForm({ family: '', student: '', amount: '', due: '' });
              setModalOpen(true);
            }}
          >
            + Create invoice
          </button>
        }
      />
      <StatCards
        stats={[
          { label: 'Due', value: totalFor('Due'), icon: '🧾', tone: 'lavender' },
          { label: 'Paid', value: totalFor('Paid'), icon: '✓', tone: 'mint' },
          { label: 'Overdue', value: totalFor('Overdue'), icon: '!', tone: 'blush' },
          {
            label: isBalances ? 'Outstanding' : 'Fee plans',
            value: isBalances ? outstanding : feePlans.length,
            icon: '₹',
            tone: 'beige',
          },
        ]}
      />
      {meta.showTabs && (
        <Tabs
          tabs={[
            { id: 'invoices', label: 'Invoices' },
            { id: 'plans', label: 'Fee Plans' },
            { id: 'payments', label: 'Payments' },
          ]}
          active={tab}
          onChange={(id) => {
            setTab(id as TabId);
            setPage(1);
            setStatus('All');
            setSearch('');
          }}
        />
      )}
      <div className="mod-panel">
        <div className="ui-table-toolbar">
          <div className="ui-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${activeTab}...`}
            />
          </div>
          {activeTab === 'invoices' && (
            <select
              className="ui-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All</option>
              <option>Due</option>
              <option>Paid</option>
              <option>Overdue</option>
            </select>
          )}
        </div>
        {pageRows.length === 0 ? (
          <EmptyState
            title="No billing records"
            description="Adjust your filters or create a new invoice."
            action={
              <button className="ui-btn ui-btn-primary" type="button" onClick={() => setModalOpen(true)}>
                Create invoice
              </button>
            }
          />
        ) : (
          <div className="mod-scroll">
            <table className="ui-table">
              <thead>
                <tr>
                  {isPlans ? (
                    <>
                      <th>Fee plan</th>
                      <th>Amount</th>
                      <th>Cycle</th>
                      <th>Programs</th>
                    </>
                  ) : isBalances ? (
                    <>
                      <th>Student</th>
                      <th>Family</th>
                      <th>Due</th>
                      <th>Overdue</th>
                      <th>Balance</th>
                    </>
                  ) : (
                    <>
                      <th>Family</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>{isPayments ? 'Paid on' : 'Due date'}</th>
                      <th>Status</th>
                    </>
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id}>
                    {'name' in row ? (
                      <>
                        <td>{row.name}</td>
                        <td>{row.amount}</td>
                        <td>{row.cycle}</td>
                        <td>{row.programs}</td>
                      </>
                    ) : 'balance' in row ? (
                      <>
                        <td>{row.student}</td>
                        <td>{row.family}</td>
                        <td>{row.due}</td>
                        <td>{row.overdue}</td>
                        <td>{row.balance}</td>
                      </>
                    ) : (
                      <>
                        <td>{row.family}</td>
                        <td>{row.student}</td>
                        <td>{row.amount}</td>
                        <td>{'paidOn' in row ? String(row.paidOn) : row.due}</td>
                        <td>
                          <span className={badgeClass(row.status)}>{row.status}</span>
                        </td>
                      </>
                    )}
                    <td>
                      <div className="mod-action-btns">
                        <button
                          className="mod-icon-btn"
                          type="button"
                          title="View"
                          onClick={() => setSelected(row)}
                        >
                          👁
                        </button>
                        {activeTab === 'invoices' &&
                          'status' in row &&
                          row.status !== 'Paid' && (
                            <button
                              className="ui-btn ui-btn-secondary"
                              type="button"
                              onClick={() => markPaid(row.id)}
                            >
                              Mark paid
                            </button>
                          )}
                        {!isBalances && (
                          <button
                            className="mod-icon-btn danger"
                            type="button"
                            title="Remove"
                            onClick={() => remove(row.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
      <Modal
        open={modalOpen}
        title="Create invoice"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="ui-btn ui-btn-outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="ui-btn ui-btn-primary" type="button" onClick={saveInvoice}>
              Create invoice
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label">Family</label>
          <input
            className="ui-input"
            value={form.family}
            onChange={(e) => setForm({ ...form, family: e.target.value })}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">Student</label>
          <input
            className="ui-input"
            value={form.student}
            onChange={(e) => setForm({ ...form, student: e.target.value })}
          />
        </div>
        <div className="mod-grid-2">
          <div className="ui-field">
            <label className="ui-label">Amount (₹)</label>
            <input
              className="ui-input"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Due date</label>
            <input
              className="ui-input"
              type="date"
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
            />
          </div>
        </div>
      </Modal>
      <Drawer open={Boolean(selected)} title="Billing details" onClose={() => setSelected(null)}>
        <div className="mod-list">
          {selected &&
            Object.entries(selected)
              .filter(([k]) => k !== 'id')
              .map(([k, v]) => (
                <div className="mod-toggle-row" key={k}>
                  <div>
                    <strong style={{ textTransform: 'capitalize' }}>{k}</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{v}</p>
                  </div>
                </div>
              ))}
        </div>
      </Drawer>
    </div>
  );
}
