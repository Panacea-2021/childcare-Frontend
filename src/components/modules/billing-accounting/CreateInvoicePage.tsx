'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Plus, Search, Trash2 } from 'lucide-react';
import { ModulePageHeader } from '@/components/ui/ModulePageHeader';
import {
  AppMultiSelect,
  AppSelect,
  DayDatePicker,
} from '@/components/modules/center-management/ui';
import { BillingPeriodRangePicker } from './BillingPeriodRangePicker';
import { CreateDiscountModal, CreateItemModal } from './CreateDiscountModal';
import {
  CATALOG_ITEMS,
  FEE_PLAN_OPTIONS,
  addCenterInvoice,
  formatInr,
  getCenterInvoiceById,
  lineAmount,
  lineTaxAmount,
  loadDiscounts,
  nextInvoiceId,
  resolveCenterInvoiceStatus,
  summarizeLines,
  updateCenterInvoice,
  type CatalogItem,
  type CenterInvoice,
  type DiscountDef,
  type InvoiceLineDraft,
} from '@/lib/billing-accounting/invoiceStore';
import {
  GROUP_OPTIONS,
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  loadStudents,
} from '@/lib/center-management/studentsStore';
import type { Student } from '@/lib/center-management/types';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import '@/components/modules/attendance-leaves/student-attendance.css';
/* billing-invoices.css loaded from billing-accounting/layout.tsx */

function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function CreateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3.5h7l4.5 4.5V19A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M12 11v5M9.5 13.5h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function emptyLine(): InvoiceLineDraft {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itemId: '',
    name: '',
    description: '',
    showDescription: false,
    quantity: 1,
    unitPrice: 0,
    taxPercent: 0,
    discountAmount: 0,
    refundable: false,
    optionsOpen: true,
  };
}

function linesFromInvoice(invoice: CenterInvoice): InvoiceLineDraft[] {
  const source = invoice.lines?.length
    ? invoice.lines
    : [
        {
          id: `${invoice.id}-line-1`,
          name: invoice.billingPlan || 'Fee',
          quantity: 1,
          unitPrice: invoice.invoicedAmount,
          taxPercent: 0,
          amount: invoice.invoicedAmount,
        },
      ];

  return source.map((line, index) => {
    const catalogMatch =
      CATALOG_ITEMS.find((c) => c.name === line.name) ||
      CATALOG_ITEMS.find((c) => c.unitPrice === line.unitPrice) ||
      CATALOG_ITEMS[0];
    return {
      id: line.id || `line-edit-${index}`,
      itemId: catalogMatch?.id || `custom-${index}`,
      name: line.name,
      description: '',
      showDescription: false,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxPercent: line.taxPercent,
      discountAmount: 0,
      refundable: false,
      optionsOpen: true,
    } satisfies InvoiceLineDraft;
  });
}

function matchFeePlanIds(billingPlan: string) {
  const names = billingPlan
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  return FEE_PLAN_OPTIONS.filter((plan) => names.includes(plan.name.toLowerCase())).map((p) => p.id);
}

/** Searchable item picker — Create New Item + catalog options */
function ItemNameSelect({
  value,
  catalog,
  onPick,
  onCreate,
}: {
  value: string;
  catalog: CatalogItem[];
  onPick: (item: CatalogItem) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return catalog.filter((o) => o.name.toLowerCase().includes(qq));
  }, [catalog, q]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (active === 0) {
        onCreate();
        setOpen(false);
        return;
      }
      const item = filtered[active - 1];
      if (item) {
        onPick(item);
        setQ('');
        setOpen(false);
      }
    }
  };

  return (
    <div className={`bi-combo ${open ? 'is-open' : ''}`} ref={rootRef}>
      <div className="bi-combo-trigger" onClick={() => setOpen(true)}>
        <input
          value={open ? q : value}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => {
            setOpen(true);
            setQ('');
          }}
          onKeyDown={onKey}
          placeholder="Select Item"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <Search size={15} className="bi-combo-ico" aria-hidden />
      </div>
      {open ? (
        <div className="bi-menu" role="listbox">
          <button
            type="button"
            className={`bi-menu-item is-create ${active === 0 ? 'is-active' : ''}`}
            onClick={() => {
              onCreate();
              setOpen(false);
            }}
          >
            Create New Item
          </button>
          {filtered.length === 0 ? (
            <div className="bi-menu-empty">No results found</div>
          ) : (
            filtered.map((o, i) => {
              const selected = value === o.name;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`bi-menu-item ${selected || active === i + 1 ? 'is-active' : ''}`}
                  onClick={() => {
                    onPick(o);
                    setQ('');
                    setOpen(false);
                  }}
                >
                  <span>{o.name}</span>
                  {selected ? <Check size={14} /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

export function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get('edit')?.trim() || '';
  const cloneParam = searchParams.get('clone')?.trim() || '';
  const [editingInvoice, setEditingInvoice] = useState<CenterInvoice | null>(null);
  const [cloneSource, setCloneSource] = useState<CenterInvoice | null>(null);
  const isEdit = Boolean(editingInvoice);
  const isClone = Boolean(cloneSource);
  const sourceInvoice = editingInvoice || cloneSource;
  const [students, setStudents] = useState<Student[]>([]);
  const [ready, setReady] = useState(false);
  const [room, setRoom] = useState('All Classroom');
  const [group, setGroup] = useState('All Group');
  const [program, setProgram] = useState('All Programs');
  const [studentQ, setStudentQ] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [invoiceDate, setInvoiceDate] = useState(todayInput());
  const [dueDays, setDueDays] = useState('7');
  const [dueImmediate, setDueImmediate] = useState(true);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [emailParent, setEmailParent] = useState('yes');
  const [feePlanIds, setFeePlanIds] = useState<string[]>([]);
  const [taxMode, setTaxMode] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [lines, setLines] = useState<InvoiceLineDraft[]>([]);
  const [discounts, setDiscounts] = useState<DiscountDef[]>([]);
  const [invoiceDiscountId, setInvoiceDiscountId] = useState('');
  const [discountModal, setDiscountModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [itemModalLineId, setItemModalLineId] = useState<string | null>(null);
  const [settleCredit, setSettleCredit] = useState(false);
  const [schoolNotes, setSchoolNotes] = useState('');
  const [parentNotes, setParentNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [catalog, setCatalog] = useState(CATALOG_ITEMS);

  useEffect(() => {
    setStudents(loadStudents());
    setDiscounts(loadDiscounts());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const sourceId = editParam || cloneParam;
    if (!sourceId) {
      setEditingInvoice(null);
      setCloneSource(null);
      return;
    }

    const row = getCenterInvoiceById(sourceId);
    if (!row) {
      setToast({
        type: 'err',
        msg: editParam ? 'Invoice not found for editing' : 'Invoice not found to clone',
      });
      setTimeout(() => {
        setToast(null);
        router.replace('/billing-accounting/invoices/create');
      }, 1600);
      return;
    }

    if (editParam) {
      setEditingInvoice(row);
      setCloneSource(null);
    } else {
      setEditingInvoice(null);
      setCloneSource(row);
    }

    const matchedStudent =
      students.find((s) => s.id === row.studentId) ||
      students.find((s) => s.name.toLowerCase() === row.studentName.toLowerCase());
    setSelectedIds([matchedStudent?.id || row.studentId]);
    setInvoiceDate(cloneParam ? todayInput() : row.invoiceDate || todayInput());
    setDueImmediate(row.dueDate === row.invoiceDate);
    setDueDays('7');
    setPeriodStart(row.billingPeriodStart || row.invoiceDate || '');
    setPeriodEnd(row.billingPeriodEnd || row.dueDate || '');
    setEmailParent(row.emailParent ? 'yes' : 'no');
    setSchoolNotes(row.schoolNotes || '');
    setParentNotes(row.parentNotes || '');
    setFeePlanIds(matchFeePlanIds(row.billingPlan || ''));
    const nextLines = linesFromInvoice(row);
    setLines(
      cloneParam
        ? nextLines.map((line, i) => ({
            ...line,
            id: `line-clone-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          }))
        : nextLines,
    );
    setStudentQ(matchedStudent?.name || row.studentName || '');
  }, [ready, editParam, cloneParam, router, students]);

  const filteredStudents = useMemo(() => {
    const q = studentQ.trim().toLowerCase();
    return students.filter((s) => {
      if (room !== 'All Classroom') {
        const roomOpt = ROOM_OPTIONS.find((r) => r.name === room);
        if (roomOpt && !s.roomIds.includes(roomOpt.id)) return false;
      }
      if (group !== 'All Group') {
        const g = GROUP_OPTIONS.find((x) => x.name === group);
        if (g && !s.groupIds.includes(g.id)) return false;
      }
      if (program !== 'All Programs') {
        const p = PROGRAM_OPTIONS.find((x) => x.name === program);
        if (p && !s.programIds.includes(p.id)) return false;
      }
      if (q && !s.name.toLowerCase().includes(q) && !s.preferredName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, room, group, program, studentQ]);

  const invoiceDiscount = useMemo(() => {
    const d = discounts.find((x) => x.id === invoiceDiscountId);
    if (!d) return 0;
    const base = lines.reduce((s, l) => s + l.quantity * l.unitPrice - l.discountAmount, 0);
    return d.unit === 'percent' ? (base * d.value) / 100 : d.value;
  }, [discounts, invoiceDiscountId, lines]);

  const summary = useMemo(
    () => summarizeLines(lines.filter((l) => l.itemId), taxMode, invoiceDiscount),
    [lines, taxMode, invoiceDiscount],
  );

  const taxIndex = taxMode === 'inclusive' ? 0 : 1;

  const fromParam = searchParams.get('from')?.trim() || '';
  const billingParam = searchParams.get('billing')?.trim() || 'generated';
  const studentIdParam = searchParams.get('studentId')?.trim() || '';

  const studentPanelPath = (sid: string) =>
    `/center-management/students/${encodeURIComponent(sid)}?tab=Billing&billing=${
      billingParam === 'debit' ? 'debit' : 'generated'
    }`;

  const invoiceDetailPath = (id: string) => {
    const q = new URLSearchParams();
    if (fromParam) q.set('from', fromParam);
    if (fromParam === 'student') {
      q.set('billing', billingParam === 'debit' ? 'debit' : 'generated');
      const sid = studentIdParam || editingInvoice?.studentId || cloneSource?.studentId || '';
      if (sid) q.set('studentId', sid);
    }
    const qs = q.toString();
    return `/billing-accounting/invoices/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`;
  };

  const exitPath = (() => {
    const sid =
      studentIdParam ||
      editingInvoice?.studentId ||
      cloneSource?.studentId ||
      selectedIds[0] ||
      '';
    if (fromParam === 'student' && sid) return studentPanelPath(sid);
    if (isEdit && editingInvoice?.id) return invoiceDetailPath(editingInvoice.id);
    if (isClone && cloneSource?.id) return invoiceDetailPath(cloneSource.id);
    if (fromParam === 'balances') return '/billing-accounting/student-balances';
    if (fromParam === 'payments') return '/billing-accounting/payments';
    if (fromParam === 'debit') return '/billing-accounting/invoices?tab=debit';
    return '/billing-accounting/invoices';
  })();

  const backLabel =
    fromParam === 'student'
      ? 'Back to Student'
      : isEdit || isClone
        ? 'Back to invoice'
        : fromParam === 'balances'
          ? 'Back to Student Balances'
          : fromParam === 'payments'
            ? 'Back to Payments'
            : fromParam === 'debit'
              ? 'Back to Debit Notes'
              : 'Back to Invoices';

  const toggleStudent = (id: string) => {
    if (isEdit) {
      // Edit mode stays locked to the invoice's student
      setSelectedIds([id]);
      return;
    }
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const selectAll = () => {
    if (isEdit) return;
    const ids = filteredStudents.map((s) => s.id);
    const all = ids.every((id) => selectedIds.includes(id));
    setSelectedIds(all ? selectedIds.filter((id) => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])]);
  };

  const syncFeePlans = (ids: string[]) => {
    setFeePlanIds(ids);
    const fromPlans = ids
      .map((id) => FEE_PLAN_OPTIONS.find((p) => p.id === id))
      .filter(Boolean)
      .map((plan) => {
        const match = catalog.find((c) => c.unitPrice === plan!.amount) ?? catalog[0];
        return {
          id: `line-fp-${plan!.id}`,
          itemId: match?.id ?? '',
          name: match?.name ?? plan!.name,
          description: '',
          showDescription: false,
          quantity: 1,
          unitPrice: plan!.amount,
          taxPercent: match?.taxPercent ?? 0,
          discountAmount: 0,
          refundable: false,
          optionsOpen: true,
        } satisfies InvoiceLineDraft;
      });

    setLines((prev) => {
      const custom = prev.filter((l) => !l.id.startsWith('line-fp-'));
      return [...fromPlans, ...custom];
    });
  };

  const addEmptyLine = () => setLines((prev) => [...prev, emptyLine()]);

  const updateLine = (id: string, patch: Partial<InvoiceLineDraft>) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (('quantity' in patch || 'unitPrice' in patch) && next.discountId) {
          const d = discounts.find((x) => x.id === next.discountId);
          if (d) {
            const gross = next.quantity * next.unitPrice;
            next.discountAmount = d.unit === 'percent' ? (gross * d.value) / 100 : Math.min(d.value, gross);
          }
        }
        return next;
      }),
    );
  };

  const applyItemToLine = (lineId: string, item: CatalogItem) => {
    updateLine(lineId, {
      itemId: item.id,
      name: item.name,
      unitPrice: item.unitPrice,
      taxPercent: item.taxPercent,
    });
  };

  const applyDiscountToLine = (lineId: string, discountId: string) => {
    const d = discounts.find((x) => x.id === discountId);
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        if (!d) return { ...l, discountId: undefined, discountAmount: 0 };
        const gross = l.quantity * l.unitPrice;
        const discountAmount = d.unit === 'percent' ? (gross * d.value) / 100 : Math.min(d.value, gross);
        return { ...l, discountId, discountAmount };
      }),
    );
  };

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const save = async () => {
    if (!selectedIds.length) {
      setToast({ type: 'err', msg: 'Select at least one student' });
      setTimeout(() => setToast(null), 2400);
      return;
    }
    const filled = lines.filter((l) => l.itemId);
    if (!filled.length) {
      setToast({ type: 'err', msg: 'Add at least one invoice item' });
      setTimeout(() => setToast(null), 2400);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 450));
    const total = summarizeLines(filled, taxMode, invoiceDiscount).total;
    const due = dueImmediate
      ? invoiceDate
      : (() => {
          const d = new Date(`${invoiceDate}T00:00:00`);
          d.setDate(d.getDate() + Number(dueDays || 0));
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })();

    const planLabel =
      feePlanIds
        .map((id) => FEE_PLAN_OPTIONS.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .join(', ') ||
      sourceInvoice?.billingPlan ||
      'Custom';

    const nextLines = filled.map((l) => ({
      id: l.id,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxPercent: l.taxPercent,
      amount: lineAmount(l, taxMode) + (taxMode === 'exclusive' ? lineTaxAmount(l, taxMode) : 0),
    }));

    if (isEdit && editingInvoice) {
      const studentId = selectedIds[0] || editingInvoice.studentId;
      const student = students.find((s) => s.id === studentId);
      const paidAmount = editingInvoice.paidAmount || 0;
      const pendingAmount = Math.max(0, total - paidAmount);
      const status = resolveCenterInvoiceStatus({
        kind: editingInvoice.kind,
        status: editingInvoice.status,
        dueDate: due,
        pendingAmount,
        paidAmount,
      });

      const updated = updateCenterInvoice(editingInvoice.id, {
        studentId,
        studentName: student?.name || editingInvoice.studentName,
        billingPlan: planLabel,
        dueDate: due,
        invoicedAmount: total,
        paidAmount,
        pendingAmount,
        status,
        invoiceDate,
        photoUrl: student?.photoUrl || editingInvoice.photoUrl,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        schoolNotes,
        parentNotes,
        emailParent: emailParent === 'yes',
        lines: nextLines,
      });

      setSaving(false);
      const nextStatus = updated?.status ?? status;
      setToast({
        type: 'ok',
        msg: `Update done successfully — ${editingInvoice.invoiceId} is now ${nextStatus}`,
      });
      setTimeout(() => router.push(exitPath), 1400);
      return;
    }

    selectedIds.forEach((sid) => {
      const student = students.find((s) => s.id === sid);
      if (!student) return;
      addCenterInvoice({
        id: `inv-${Date.now()}-${sid}`,
        invoiceId: nextInvoiceId(),
        studentId: sid,
        studentName: student.name,
        billingPlan: planLabel,
        dueDate: due,
        invoicedAmount: total,
        paidAmount: 0,
        pendingAmount: total,
        status: resolveCenterInvoiceStatus({
          kind: 'invoice',
          status: 'Due',
          dueDate: due,
          pendingAmount: total,
          paidAmount: 0,
        }),
        invoiceDate,
        kind: 'invoice',
        photoUrl: student.photoUrl,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        createdBy: 'Malika Thimisetty',
        createdOn: invoiceDate,
        schoolNotes,
        parentNotes,
        emailParent: emailParent === 'yes',
        lines: nextLines,
        comments: [],
      });
    });

    setSaving(false);
    setToast({
      type: 'ok',
      msg: isClone ? 'Cloned invoice saved successfully' : 'Invoice saved successfully',
    });
    setTimeout(() => router.push(exitPath), 700);
  };

  const discountOptions = [
    { value: '', label: 'Select discount' },
    ...discounts.map((d) => ({
      value: d.id,
      label: `${d.name} (${d.unit === 'percent' ? `${d.value}%` : formatInr(d.value)})`,
    })),
  ];

  return (
    <div className="bi-root">
      {toast ? (
        <div className={`bi-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`} role="status">
          {toast.msg}
        </div>
      ) : null}

      <ModulePageHeader
        section="BILLING & ACCOUNTING"
        title={
          isEdit
            ? `Edit Invoice · ${editingInvoice?.invoiceId ?? ''}`
            : isClone
              ? `Clone Invoice · ${cloneSource?.invoiceId ?? ''}`
              : 'Create Invoice'
        }
        description={
          isEdit
            ? `Update billing details for ${editingInvoice?.studentName ?? 'this student'}.`
            : isClone
              ? `Create a new invoice from ${cloneSource?.invoiceId ?? 'this invoice'} for ${cloneSource?.studentName ?? 'this student'}.`
              : 'Select students, apply fee plans, and compose invoice line items.'
        }
        icon={<CreateIcon />}
      />
      <div className="bi-header-back">
        <button
          type="button"
          className="bi-back bi-back-highlight"
          onClick={() => router.push(exitPath)}
        >
          ← {backLabel}
        </button>
      </div>

      <div className="bi-create">
        <aside className="bi-card" style={{ animationDelay: '40ms' }}>
          <div className="bi-card-head">
            <h2>Select Students</h2>
          </div>
          <div className="bi-card-body">
            <AppSelect
              value={room}
              onChange={setRoom}
              searchable
              options={[
                { value: 'All Classroom', label: 'All Classroom' },
                ...ROOM_OPTIONS.map((r) => ({ value: r.name, label: r.name })),
              ]}
            />
            <AppSelect
              value={group}
              onChange={setGroup}
              options={[
                { value: 'All Group', label: 'All Group' },
                ...GROUP_OPTIONS.map((g) => ({ value: g.name, label: g.name })),
              ]}
            />
            <AppSelect
              value={program}
              onChange={setProgram}
              searchable
              options={[
                { value: 'All Programs', label: 'All Programs' },
                ...PROGRAM_OPTIONS.map((p) => ({ value: p.name, label: p.name })),
              ]}
            />

            <div className="bi-search">
              <Search size={16} aria-hidden />
              <input
                value={studentQ}
                onChange={(e) => setStudentQ(e.target.value)}
                placeholder="Search by name"
                aria-label="Search students"
              />
            </div>

            <div className="bi-stud-sticky">
              <span className="bi-count-badge">{selectedIds.length} selected</span>
              {!isEdit ? (
                <button type="button" className="bi-link-btn" onClick={selectAll}>
                  Select All
                </button>
              ) : (
                <span className="bi-link-btn" style={{ cursor: 'default', opacity: 0.75 }}>
                  Editing this student
                </span>
              )}
            </div>

            {!ready ? (
              <>
                <div className="bi-skeleton" />
                <div className="bi-skeleton" />
              </>
            ) : filteredStudents.length === 0 ? (
              <div className="bi-empty" style={{ padding: '28px 8px' }}>
                <h3>No students</h3>
                <p>Try another classroom, group, or search term.</p>
              </div>
            ) : (
              <div className="bi-stud-list" role="listbox" aria-multiselectable>
                {filteredStudents.map((s) => {
                  const on = selectedIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={`bi-stud ${on ? 'is-selected' : ''}`}
                      onClick={() => toggleStudent(s.id)}
                    >
                      <span className="bi-avatar">
                        {s.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.photoUrl} alt="" />
                        ) : (
                          initials(s.name)
                        )}
                      </span>
                      <span className="bi-stud-name">{s.name}</span>
                      <span className="bi-check" aria-hidden>
                        {on ? <Check size={12} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="bi-card" style={{ animationDelay: '100ms' }}>
          <div className="bi-card-body">
            <div className="bi-form-grid-aligned">
              <div className="bi-field-stack">
                <label className="ui-label">Invoice date</label>
                <DayDatePicker value={invoiceDate} onChange={setInvoiceDate} />
              </div>
              <div className="bi-field-stack">
                <label className="ui-label">After how many days invoice will be due</label>
                <div className="bi-inline">
                  <div className="bi-days">
                    <input
                      className="ui-input"
                      type="number"
                      min={0}
                      max={365}
                      value={dueImmediate ? '0' : dueDays}
                      disabled={dueImmediate}
                      onChange={(e) => setDueDays(e.target.value)}
                    />
                    <span className="bi-days-suffix">days</span>
                  </div>
                  <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: '0.86rem' }}>
                    <input
                      type="checkbox"
                      checked={dueImmediate}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setDueImmediate(on);
                        if (!on && (!dueDays || dueDays === '0')) setDueDays('7');
                      }}
                    />
                    Set due as immediately
                  </label>
                </div>
                <p className="bi-hint-inline">
                  <span aria-hidden>i</span> Upto to 365 days
                </p>
              </div>

              <div className="bi-field-stack span-2">
                <label className="ui-label">Billing Period</label>
                <BillingPeriodRangePicker
                  start={periodStart}
                  end={periodEnd}
                  onChange={({ start, end }) => {
                    setPeriodStart(start);
                    setPeriodEnd(end);
                  }}
                />
              </div>

              <div className="bi-field-stack span-2">
                <label className="ui-label">Send invoice via email to parent</label>
                <div className="bi-radio-row">
                  <label>
                    <input
                      type="radio"
                      name="emailParent"
                      checked={emailParent === 'yes'}
                      onChange={() => setEmailParent('yes')}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="emailParent"
                      checked={emailParent === 'no'}
                      onChange={() => setEmailParent('no')}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="bi-field-stack span-2">
                <label className="ui-label">Select Fee Plan</label>
                <AppMultiSelect
                  values={feePlanIds}
                  onChange={syncFeePlans}
                  searchable
                  placeholder="Choose fee plan to create invoice"
                  searchPlaceholder="Search fee plans…"
                  options={FEE_PLAN_OPTIONS.map((p) => ({ value: p.id, label: p.name }))}
                />
              </div>
            </div>

            <div className="bi-create-top" style={{ marginTop: 18 }}>
              <strong style={{ fontSize: '0.95rem' }}>Invoice items</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Amounts are</span>
                <div className="bi-seg">
                  <span
                    className="bi-seg-pill"
                    style={{ left: taxIndex === 0 ? 3 : '50%', width: 'calc(50% - 3px)' }}
                    aria-hidden
                  />
                  <button
                    type="button"
                    className={taxMode === 'inclusive' ? 'is-active' : ''}
                    onClick={() => setTaxMode('inclusive')}
                  >
                    Inclusive of tax
                  </button>
                  <button
                    type="button"
                    className={taxMode === 'exclusive' ? 'is-active' : ''}
                    onClick={() => setTaxMode('exclusive')}
                  >
                    Exclusive of tax
                  </button>
                </div>
              </div>
            </div>

            <div className="bi-lines">
              {lines.map((line) => (
                <div key={line.id} className="bi-line">
                  <div className="bi-line-grid">
                    <div className="bi-line-col">
                      <label>Item Name</label>
                      <ItemNameSelect
                        value={line.name}
                        catalog={catalog}
                        onPick={(item) => applyItemToLine(line.id, item)}
                        onCreate={() => {
                          setItemModalLineId(line.id);
                          setItemModal(true);
                        }}
                      />
                      {line.itemId ? (
                        <div className="bi-line-desc">
                          {line.showDescription ? (
                            <textarea
                              className="ui-textarea"
                              rows={2}
                              placeholder="Description"
                              value={line.description ?? ''}
                              onChange={(e) => updateLine(line.id, { description: e.target.value })}
                            />
                          ) : (
                            <button
                              type="button"
                              className="bi-link-btn"
                              onClick={() => updateLine(line.id, { showDescription: true, description: '' })}
                            >
                              + Add description
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <div className="bi-line-col">
                      <label>Quantity</label>
                      <input
                        className="ui-input"
                        type="number"
                        min={1}
                        value={line.quantity}
                        disabled={!line.itemId}
                        onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="bi-line-col">
                      <label>Unit Price</label>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        disabled={!line.itemId}
                        onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="bi-line-col">
                      <label>Tax</label>
                      <div className="bi-line-amount" style={{ paddingTop: 10 }}>
                        {line.taxPercent > 0 ? `${line.taxPercent}%` : '—'}
                      </div>
                    </div>
                    <div className="bi-line-col">
                      <label>Amount</label>
                      <div className="bi-line-amount" style={{ paddingTop: 10 }}>
                        {formatInr(line.itemId ? lineAmount(line, taxMode) : 0)}
                      </div>
                    </div>
                    <div className="bi-line-col">
                      <label>&nbsp;</label>
                      <button
                        type="button"
                        className="mod-icon-btn danger"
                        onClick={() => removeLine(line.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="bi-line-meta">
                    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: '0.86rem' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(line.refundable)}
                        onChange={(e) => updateLine(line.id, { refundable: e.target.checked })}
                      />
                      Refundable
                    </label>
                    <button
                      type="button"
                      className="bi-link-btn"
                      onClick={() => updateLine(line.id, { optionsOpen: !line.optionsOpen })}
                    >
                      Item options{' '}
                      <ChevronDown
                        size={14}
                        style={{
                          transform: line.optionsOpen ? 'rotate(180deg)' : undefined,
                          transition: 'transform 200ms',
                        }}
                      />
                    </button>
                  </div>

                  {line.optionsOpen ? (
                    <div className="bi-acc is-open" style={{ marginTop: 10, border: 'none', background: '#f8fafc' }}>
                      <div className="bi-acc-body" style={{ gridTemplateRows: '1fr' }}>
                        <div className="bi-acc-inner" style={{ opacity: 1, transform: 'none', padding: 12 }}>
                          <div className="bi-opt-row">
                            <span className="ui-label" style={{ margin: 0 }}>
                              Discount
                            </span>
                            {line.discountId ? (
                              <span className="bi-chip">
                                {discounts.find((d) => d.id === line.discountId)?.name ?? 'Discount'} −{' '}
                                {formatInr(line.discountAmount)}
                                <button
                                  type="button"
                                  aria-label="Remove discount"
                                  onClick={() => applyDiscountToLine(line.id, '')}
                                >
                                  ×
                                </button>
                              </span>
                            ) : (
                              <AppSelect
                                value=""
                                onChange={(v) => applyDiscountToLine(line.id, v)}
                                options={discountOptions}
                              />
                            )}
                            <button
                              type="button"
                              className="bi-icon-btn"
                              aria-label="Create discount"
                              onClick={() => setDiscountModal(true)}
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                          <div className="bi-opt-row">
                            <span className="ui-label" style={{ margin: 0 }}>
                              Tax
                            </span>
                            {line.taxPercent > 0 ? (
                              <span className="bi-chip">
                                GST {line.taxPercent}%
                                <button
                                  type="button"
                                  aria-label="Remove tax"
                                  onClick={() => updateLine(line.id, { taxPercent: 0 })}
                                >
                                  ×
                                </button>
                              </span>
                            ) : (
                              <AppSelect
                                value="0"
                                onChange={(v) => {
                                  const taxPercent = Number(v) || 0;
                                  updateLine(line.id, { taxPercent });
                                  if (taxPercent > 0) setTaxMode('exclusive');
                                }}
                                options={[
                                  { value: '0', label: 'Select tax' },
                                  { value: '5', label: 'GST 5%' },
                                  { value: '12', label: 'GST 12%' },
                                  { value: '18', label: 'GST 18%' },
                                ]}
                              />
                            )}
                            {line.taxPercent > 0 ? (
                              <button
                                type="button"
                                className="bi-icon-btn is-remove"
                                aria-label="Remove tax"
                                onClick={() => updateLine(line.id, { taxPercent: 0 })}
                                title="Remove tax"
                              >
                                ×
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {lines.length === 0 ? (
              <div className="bi-add-wrap">
                <button type="button" className="bi-add-item" onClick={addEmptyLine}>
                  <span className="bi-add-ico">
                    <Plus size={18} />
                  </span>
                  Add Invoice Item
                </button>
              </div>
            ) : (
              <div className="bi-add-wrap">
                <button type="button" className="bi-add-link" onClick={addEmptyLine}>
                  <Plus size={16} /> Add Invoice Item
                </button>
              </div>
            )}

            <div className="bi-summary">
              <div className="bi-sum-row">
                <span>Sub Total</span>
                <strong>{formatInr(summary.subTotal)}</strong>
              </div>
              <div className="bi-sum-row">
                <span>Items Discount</span>
                <strong>- {formatInr(summary.itemsDiscount)}</strong>
              </div>
              <div className="bi-sum-row is-discount">
                <div className="bi-sum-discount-top">
                  <span>Invoice Discount</span>
                  <strong>- {formatInr(summary.invoiceDiscount)}</strong>
                </div>
                {invoiceDiscountId ? (
                  <div className="bi-sum-discount-applied">
                    <span className="bi-chip bi-chip-block">
                      {discounts.find((d) => d.id === invoiceDiscountId)?.name ?? 'Discount'}
                      {(() => {
                        const d = discounts.find((x) => x.id === invoiceDiscountId);
                        if (!d) return null;
                        return (
                          <em>
                            ({d.unit === 'percent' ? `${d.value}%` : formatInr(d.value)})
                          </em>
                        );
                      })()}
                      <button
                        type="button"
                        aria-label="Remove invoice discount"
                        onClick={() => setInvoiceDiscountId('')}
                      >
                        ×
                      </button>
                    </span>
                  </div>
                ) : (
                  <div className="bi-sum-discount-controls">
                    <AppSelect
                      value=""
                      onChange={setInvoiceDiscountId}
                      placeholder="Select discount"
                      options={discountOptions.filter((o) => o.value)}
                    />
                    <button
                      type="button"
                      className="bi-icon-btn"
                      aria-label="Create invoice discount"
                      onClick={() => setDiscountModal(true)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="bi-sum-row">
                <span>Total without tax</span>
                <strong>{formatInr(summary.withoutTax)}</strong>
              </div>
              {summary.tax > 0 || taxMode === 'exclusive' ? (
                <div className="bi-sum-row">
                  <span>Tax</span>
                  <strong>{formatInr(summary.tax)}</strong>
                </div>
              ) : null}
              <div className="bi-sum-row is-total">
                <span>Total</span>
                <strong>{formatInr(summary.total)}</strong>
              </div>
              <p className="bi-round-note">The values are rounded to two decimal places.</p>
            </div>

            <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: '0.9rem', marginTop: 8 }}>
              <input type="checkbox" checked={settleCredit} onChange={(e) => setSettleCredit(e.target.checked)} />
              Settle with credit
            </label>

            <div className="bi-notes-grid">
              <div className="ui-field bi-ta-wrap">
                <label className="ui-label">School Notes (Not visible to parents*)</label>
                <textarea
                  className="ui-textarea"
                  value={schoolNotes}
                  maxLength={500}
                  onChange={(e) => setSchoolNotes(e.target.value)}
                />
                <span className="bi-char">{schoolNotes.length}/500</span>
              </div>
              <div className="ui-field bi-ta-wrap">
                <label className="ui-label">Parent Notes (Visible to parents*)</label>
                <textarea
                  className="ui-textarea"
                  value={parentNotes}
                  maxLength={500}
                  onChange={(e) => setParentNotes(e.target.value)}
                />
                <span className="bi-char">{parentNotes.length}/500</span>
              </div>
            </div>

            <div className="bi-create-footer">
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => router.push(exitPath)}>
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={save} disabled={saving}>
                {saving ? <span className="bi-btn-spinner" aria-hidden /> : null}
                {saving ? 'Saving…' : isEdit ? 'Update Invoice' : isClone ? 'Save Clone' : 'Save'}
              </button>
            </div>
          </div>
        </section>
      </div>

      <CreateDiscountModal
        open={discountModal}
        onClose={() => setDiscountModal(false)}
        onCreated={(d) => {
          setDiscounts(loadDiscounts());
          setToast({ type: 'ok', msg: `Discount “${d.name}” created` });
          setTimeout(() => setToast(null), 2000);
        }}
      />

      <CreateItemModal
        open={itemModal}
        onClose={() => {
          setItemModal(false);
          setItemModalLineId(null);
        }}
        onCreated={(item) => {
          const created: CatalogItem = {
            id: item.id,
            name: item.name,
            unitPrice: item.unitPrice,
            taxPercent: 0,
          };
          setCatalog((c) => [created, ...c]);
          if (itemModalLineId) {
            applyItemToLine(itemModalLineId, created);
            if (item.description) {
              updateLine(itemModalLineId, { description: item.description, showDescription: true });
            }
          }
          setToast({ type: 'ok', msg: 'Item created' });
          setTimeout(() => setToast(null), 1800);
        }}
      />
    </div>
  );
}
