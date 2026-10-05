'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Plus, Search, Trash2 } from 'lucide-react';
import { ModulePageHeader } from '@/components/ui/ModulePageHeader';
import { AppSelect, DayDatePicker } from '@/components/modules/center-management/ui';
import { BillingPeriodRangePicker } from './BillingPeriodRangePicker';
import { CreateItemModal } from './CreateDiscountModal';
import {
  CATALOG_ITEMS,
  addCenterInvoice,
  formatInr,
  getCenterInvoiceById,
  nextDebitId,
  updateCenterInvoice,
  type CatalogItem,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import {
  GROUP_OPTIONS,
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  loadStudents,
  roomName,
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

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
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

type DebitLine = {
  id: string;
  typeId: string;
  typeLabel: string;
  description: string;
  gross: string;
  discount: string;
  discountUnit: '%' | 'amount';
  discountDescription: string;
};

function emptyLine(): DebitLine {
  return {
    id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    typeId: '',
    typeLabel: '',
    description: '',
    gross: '',
    discount: '0',
    discountUnit: '%',
    discountDescription: '',
  };
}

function lineNet(line: DebitLine) {
  const gross = Math.max(0, Number(line.gross) || 0);
  const disc = Math.max(0, Number(line.discount) || 0);
  const off = line.discountUnit === '%' ? (gross * disc) / 100 : disc;
  return Math.max(0, gross - off);
}

/** Searchable type picker — Create New Item + catalog */
function DebitTypeSelect({
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
          placeholder="Select type"
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

export type CreateDebitNotePageProps = {
  /** Inside Student Profile Billing — no Billing header, stay on Students nav */
  embedInStudent?: boolean;
  studentId?: string;
  editId?: string;
  onClose?: () => void;
  onSaved?: () => void;
};

export function CreateDebitNotePage({
  embedInStudent = false,
  studentId: embedStudentId,
  editId: embedEditId,
  onClose,
  onSaved,
}: CreateDebitNotePageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = (embedEditId || searchParams.get('edit') || '').trim();
  const [editing, setEditing] = useState<CenterInvoice | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [ready, setReady] = useState(false);
  const [room, setRoom] = useState('All Classroom');
  const [group, setGroup] = useState('All Group');
  const [program, setProgram] = useState('All Programs');
  const [studentQ, setStudentQ] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [debitDate, setDebitDate] = useState(todayInput());
  const [dueDays, setDueDays] = useState('7');
  const [periodStart, setPeriodStart] = useState(todayInput());
  const [periodEnd, setPeriodEnd] = useState(addDays(todayInput(), 6));
  const [emailParent, setEmailParent] = useState('yes');
  const [taxMode, setTaxMode] = useState<'inclusive' | 'exclusive'>('inclusive');
  const [tax, setTax] = useState('0');
  const [lines, setLines] = useState<DebitLine[]>([emptyLine()]);
  const [catalog, setCatalog] = useState(CATALOG_ITEMS);
  const [itemModal, setItemModal] = useState(false);
  const [itemModalLineId, setItemModalLineId] = useState<string | null>(null);
  const [schoolNotes, setSchoolNotes] = useState('');
  const [parentNotes, setParentNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    setStudents(loadStudents());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || editParam) return;
    const sid = (embedStudentId || searchParams.get('studentId') || '').trim();
    if (sid) setSelectedIds([sid]);
  }, [ready, editParam, searchParams, embedStudentId]);

  useEffect(() => {
    if (!ready || !editParam) return;
    const row = getCenterInvoiceById(editParam);
    if (!row || row.kind !== 'debit') {
      setToast({ type: 'err', msg: 'Debit note not found' });
      return;
    }
    setEditing(row);
    setSelectedIds([row.studentId]);
    setDebitDate(row.invoiceDate);
    setPeriodStart(row.billingPeriodStart || row.invoiceDate);
    setPeriodEnd(row.billingPeriodEnd || row.dueDate);
    setEmailParent(row.emailParent ? 'yes' : 'no');
    setSchoolNotes(row.schoolNotes || '');
    setParentNotes(row.parentNotes || '');
    setLines(
      (row.lines ?? []).map((l) => ({
        id: l.id,
        typeId: CATALOG_ITEMS.find((c) => c.name === l.typeLabel)?.id || '',
        typeLabel: l.typeLabel || l.name,
        description: l.name,
        gross: String(l.grossAmount ?? l.unitPrice ?? l.amount),
        discount: String(l.discountPercent ?? l.discountAmount ?? 0),
        discountUnit: (l.discountPercent != null ? '%' : 'amount') as '%' | 'amount',
        discountDescription: l.discountDescription || '',
      })),
    );
  }, [ready, editParam]);

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
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !(s.preferredName || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [students, room, group, program, studentQ]);

  const fromParam = embedInStudent ? 'student' : searchParams.get('from')?.trim() || '';
  const studentIdParam = (embedStudentId || searchParams.get('studentId') || '').trim();

  /** Hide multi-select only while editing an existing debit. */
  const studentLocked = Boolean(editing);

  const lockedStudent = useMemo(() => {
    const sid = editing?.studentId || selectedIds[0] || '';
    return students.find((s) => s.id === sid) || null;
  }, [editing?.studentId, selectedIds, students]);

  const lockedRoomLabel = useMemo(() => {
    if (!lockedStudent?.roomIds?.length) return '—';
    return roomName(lockedStudent.roomIds[0]) || '—';
  }, [lockedStudent]);

  const studentPanelPath = (sid: string) =>
    `/center-management/students/${encodeURIComponent(sid)}?tab=Billing&billing=debit`;

  const resolveExitPath = () => {
    const sid = editing?.studentId || studentIdParam || selectedIds[0] || '';
    if (fromParam === 'student' && sid) return studentPanelPath(sid);
    if (editing) return `/billing-accounting/invoices/${editing.id}`;
    if (fromParam === 'balances') return '/billing-accounting/student-balances';
    if (fromParam === 'payments') return '/billing-accounting/payments';
    if (fromParam === 'invoices') return '/billing-accounting/invoices';
    return '/billing-accounting/invoices?tab=debit';
  };

  const goBack = () => {
    if (embedInStudent) {
      onClose?.();
      return;
    }
    router.push(resolveExitPath());
  };

  const afterSave = () => {
    if (embedInStudent) {
      onSaved?.();
      onClose?.();
      return;
    }
    router.push(resolveExitPath());
  };

  const backLabel =
    embedInStudent || fromParam === 'student'
      ? 'Back to Student'
      : editing
        ? 'Back to debit note'
        : fromParam === 'balances'
          ? 'Back to Student Balances'
          : fromParam === 'payments'
            ? 'Back to Payments'
            : fromParam === 'invoices'
              ? 'Back to Invoices'
              : 'Back to Debit Notes';

  const subTotal = lines.reduce((s, l) => s + lineNet(l), 0);
  const taxValue = Math.max(0, Number(tax) || 0);
  const total = taxMode === 'exclusive' ? subTotal + taxValue : subTotal;

  const patchLine = (id: string, patch: Partial<DebitLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const applyItemToLine = (lineId: string, item: CatalogItem, description?: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        return {
          ...l,
          typeId: item.id,
          typeLabel: item.name,
          description: description?.trim() || item.name,
          gross: item.unitPrice > 0 ? String(item.unitPrice) : l.gross,
        };
      }),
    );
  };

  const toggleStudent = (id: string) => {
    if (studentLocked) return;
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const selectAll = () => {
    if (studentLocked) return;
    const ids = filteredStudents.map((s) => s.id);
    const all = ids.every((id) => selectedIds.includes(id));
    setSelectedIds(all ? selectedIds.filter((id) => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])]);
  };

  const save = () => {
    if (!selectedIds.length && !editing) {
      setToast({ type: 'err', msg: 'Select at least one student' });
      return;
    }
    if (!lines.some((l) => lineNet(l) > 0)) {
      setToast({ type: 'err', msg: 'Add at least one debit line with amount' });
      return;
    }
    setSaving(true);
    const due = addDays(debitDate, Number(dueDays) || 0);
    const nextLines = lines
      .filter((l) => lineNet(l) > 0 || (Number(l.gross) || 0) > 0)
      .map((l) => {
        const gross = Math.max(0, Number(l.gross) || 0);
        const discRaw = Math.max(0, Number(l.discount) || 0);
        const discountAmount = l.discountUnit === '%' ? (gross * discRaw) / 100 : discRaw;
        const amount = Math.max(0, gross - discountAmount);
        return {
          id: l.id,
          name: l.description || l.typeLabel || 'Debit item',
          typeLabel: l.typeLabel || CATALOG_ITEMS.find((c) => c.id === l.typeId)?.name,
          quantity: 1,
          unitPrice: gross,
          taxPercent: 0,
          amount,
          grossAmount: gross,
          discountAmount,
          discountPercent: l.discountUnit === '%' ? discRaw : undefined,
          discountDescription: l.discountDescription,
        };
      });
    const raisedAgainst = nextLines[0]?.name || 'Debit';

    if (editing) {
      updateCenterInvoice(editing.id, {
        studentId: selectedIds[0] || editing.studentId,
        studentName:
          students.find((s) => s.id === (selectedIds[0] || editing.studentId))?.name ||
          editing.studentName,
        billingPlan: raisedAgainst,
        raisedAgainst,
        dueDate: due,
        invoicedAmount: total,
        pendingAmount: Math.max(0, total - editing.paidAmount),
        status:
          Math.max(0, total - editing.paidAmount) <= 0
            ? 'Paid'
            : editing.status === 'Paid'
              ? 'Due'
              : editing.status,
        invoiceDate: debitDate,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        schoolNotes,
        parentNotes,
        emailParent: emailParent === 'yes',
        lines: nextLines,
      });
      setSaving(false);
      setToast({ type: 'ok', msg: `${editing.invoiceId} updated` });
      setTimeout(() => afterSave(), 700);
      return;
    }

    selectedIds.forEach((sid) => {
      const student = students.find((s) => s.id === sid);
      if (!student) return;
      addCenterInvoice({
        id: `deb-${Date.now()}-${sid}`,
        invoiceId: nextDebitId(),
        studentId: sid,
        studentName: student.name,
        billingPlan: raisedAgainst,
        raisedAgainst,
        dueDate: due,
        invoicedAmount: total,
        paidAmount: 0,
        pendingAmount: total,
        status: 'Due',
        invoiceDate: debitDate,
        kind: 'debit',
        photoUrl: student.photoUrl,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        createdBy: 'Malika Thimisetty',
        createdOn: debitDate,
        schoolNotes,
        parentNotes,
        emailParent: emailParent === 'yes',
        lines: nextLines,
        comments: [],
        payments: [],
      });
    });

    setSaving(false);
    setToast({ type: 'ok', msg: 'Debit note saved successfully' });
    setTimeout(() => afterSave(), 700);
  };

  return (
    <div className={`bi-root${embedInStudent ? ' is-student-embed' : ''}`}>
      {toast ? (
        <div className={`bi-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`} role="status">
          {toast.msg}
        </div>
      ) : null}

      {!embedInStudent ? (
        <ModulePageHeader
          section="BILLING & ACCOUNTING"
          title={editing ? `Edit Debit · ${editing.invoiceId}` : 'Issue Debit Note'}
          description="Raise a debit note against a student balance."
          icon={<Plus size={20} />}
        />
      ) : null}

      <div className="bi-header-back">
        <button type="button" className="bi-back bi-back-highlight" onClick={goBack}>
          ← {backLabel}
        </button>
      </div>

      <div className={`bi-create${studentLocked ? ' is-student-locked' : ''}`}>
        {!studentLocked ? (
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
              <button type="button" className="bi-link-btn" onClick={selectAll}>
                Select All
              </button>
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
                      className={`bi-stud${on ? ' is-selected' : ''}`}
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
        ) : null}

        <section className="bi-card" style={{ animationDelay: '100ms' }}>
          <div className="bi-card-body">
            {studentLocked ? (
              <div className="bi-debit-student-lock">
                <span className="bi-avatar bi-debit-student-avatar">
                  {lockedStudent?.photoUrl || editing?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={lockedStudent?.photoUrl || editing?.photoUrl} alt="" />
                  ) : (
                    initials(lockedStudent?.name || editing?.studentName || 'Student')
                  )}
                </span>
                <div className="bi-debit-student-meta">
                  <strong>{lockedStudent?.name || editing?.studentName || 'Student'}</strong>
                  <span>{lockedRoomLabel}</span>
                  {editing?.invoiceId ? <em>{editing.invoiceId}</em> : null}
                </div>
              </div>
            ) : null}

            <div className="bi-form-grid-aligned">
              <div className="bi-field-stack">
                <label className="ui-label">Debit Date</label>
                <DayDatePicker value={debitDate} onChange={setDebitDate} />
              </div>
              <div className="bi-field-stack">
                <label className="ui-label">After how many days debit will be due</label>
                <AppSelect
                  value={dueDays}
                  onChange={setDueDays}
                  searchable
                  options={Array.from({ length: 90 }, (_, i) => {
                    const n = i + 1;
                    return { value: String(n), label: n === 1 ? '1 day' : `${n} days` };
                  })}
                />
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
                <span className="ui-label">Send debit via email to parent</span>
                <div className="bi-radio-row" role="radiogroup">
                  <label>
                    <input
                      type="radio"
                      name="deb-email"
                      checked={emailParent === 'yes'}
                      onChange={() => setEmailParent('yes')}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="deb-email"
                      checked={emailParent === 'no'}
                      onChange={() => setEmailParent('no')}
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="bi-field-stack">
                <label className="ui-label">Amounts are</label>
                <AppSelect
                  value={taxMode}
                  onChange={(v) => setTaxMode(v as 'inclusive' | 'exclusive')}
                  options={[
                    { value: 'inclusive', label: 'Inclusive of tax' },
                    { value: 'exclusive', label: 'Exclusive of tax' },
                  ]}
                />
              </div>
            </div>

            <div className="bi-table-wrap bi-debit-lines-wrap" style={{ marginTop: 18 }}>
              <table className="ui-table bi-debit-create-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Item Description</th>
                    <th>Gross Amount</th>
                    <th>Discount</th>
                    <th>Discount Description</th>
                    <th>Amount</th>
                    <th style={{ width: 44 }} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        <DebitTypeSelect
                          value={line.typeLabel}
                          catalog={catalog}
                          onPick={(item) => applyItemToLine(line.id, item)}
                          onCreate={() => {
                            setItemModalLineId(line.id);
                            setItemModal(true);
                          }}
                        />
                      </td>
                      <td>
                        {line.typeId ? (
                          <input
                            className="ui-input"
                            value={line.description}
                            onChange={(e) => patchLine(line.id, { description: e.target.value })}
                            placeholder="Enter item description"
                          />
                        ) : (
                          <span className="bi-debit-desc-placeholder">Select a type first</span>
                        )}
                      </td>
                      <td>
                        <input
                          className="ui-input"
                          inputMode="decimal"
                          value={line.gross}
                          onChange={(e) => patchLine(line.id, { gross: e.target.value })}
                          placeholder="0.00"
                        />
                      </td>
                      <td>
                        <div className="bi-debit-disc-combo">
                          <input
                            className="ui-input"
                            inputMode="decimal"
                            value={line.discount}
                            onChange={(e) => patchLine(line.id, { discount: e.target.value })}
                          />
                          <AppSelect
                            value={line.discountUnit}
                            onChange={(val) =>
                              patchLine(line.id, { discountUnit: val as '%' | 'amount' })
                            }
                            options={[
                              { value: '%', label: '%' },
                              { value: 'amount', label: '₹' },
                            ]}
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          className="ui-input"
                          value={line.discountDescription}
                          onChange={(e) =>
                            patchLine(line.id, { discountDescription: e.target.value })
                          }
                          placeholder="Optional"
                        />
                      </td>
                      <td>
                        <strong className="bi-debit-line-amount">{formatInr(lineNet(line))}</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="mod-icon-btn"
                          aria-label="Remove line"
                          onClick={() =>
                            setLines((prev) =>
                              prev.length === 1
                                ? [emptyLine()]
                                : prev.filter((l) => l.id !== line.id),
                            )
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bi-add-line-wrap">
              <button
                type="button"
                className="ui-btn ui-btn-primary bi-add-line-btn"
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
              >
                + Add new line
              </button>
            </div>

            <div className="bi-debit-totals">
              <div className="bi-debit-totals-meta">
                <div>
                  <span>Sub Total</span>
                  <strong>{formatInr(subTotal)}</strong>
                </div>
                <div className="ui-field" style={{ margin: 0 }}>
                  <label className="ui-label">Tax</label>
                  <input
                    className="ui-input"
                    inputMode="decimal"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                  />
                </div>
                <div className="bi-debit-total-strong">
                  <span>Total</span>
                  <strong>{formatInr(total)}</strong>
                </div>
              </div>
            </div>

            <div className="bi-form-grid-aligned" style={{ marginTop: 18 }}>
              <div className="bi-field-stack">
                <label className="ui-label">School Notes (Not visible to parents*)</label>
                <textarea
                  className="ui-textarea"
                  rows={4}
                  value={schoolNotes}
                  onChange={(e) => setSchoolNotes(e.target.value)}
                />
              </div>
              <div className="bi-field-stack">
                <label className="ui-label">Parent Notes (Visible to parents*)</label>
                <textarea
                  className="ui-textarea"
                  rows={4}
                  value={parentNotes}
                  onChange={(e) => setParentNotes(e.target.value)}
                />
              </div>
            </div>

            <div
              className="bi-create-footer"
              style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}
            >
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={goBack}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </section>
      </div>

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
            applyItemToLine(itemModalLineId, created, item.description || item.name);
          }
          setToast({ type: 'ok', msg: 'Item created' });
          setTimeout(() => setToast(null), 1800);
        }}
      />
    </div>
  );
}
