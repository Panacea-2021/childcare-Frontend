'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Eye,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { ModulePageHeader } from '@/components/ui/ModulePageHeader';
import { Modal } from '@/components/ui/Modal';
import {
  AppSelect,
  AppMultiSelect,
  DayDatePicker,
  selectionRange,
  addDateDays,
  type DateSelectionMode,
} from '@/components/modules/center-management/ui';
import { FeePlanMonthField } from './FeePlanMonthField';
import { FeeComponentModal } from './FeeComponentModal';
import { loadLabels } from '@/lib/center-management/labelsStore';
import {
  loadFeeComponents,
  type FeeComponent,
} from '@/lib/billing-accounting/feeComponentsStore';
import { loadDiscounts, type DiscountDef } from '@/lib/billing-accounting/invoiceStore';
import { loadTaxRates } from '@/lib/billing-accounting/taxRatesStore';
import {
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  GROUP_OPTIONS,
  loadStudents,
} from '@/lib/center-management/studentsStore';
import {
  FREQUENCY_OPTIONS,
  emptyCustomTerm,
  emptyFeePlanDraft,
  emptyPlanLine,
  formatInrAmount,
  formatPlanDate,
  getFeePlanById,
  lineTaxAmount,
  lineTaxPercent,
  summarizePlanLines,
  upsertFeePlan,
  type BillingPeriodKind,
  type FeePlanCondition,
  type FeePlanCustomTerm,
  type FeePlanInput,
  type FeePlanLine,
  type FeePlanStudent,
  type PlanFrequency,
  type TaxAmountMode,
} from '@/lib/billing-accounting/feePlansStore';
import {
  buildSchedulePreview,
  getDueAfterOptions,
  getGenerationOptions,
  selectionModeForFrequency,
  validateWeeklySchedule,
} from '@/lib/billing-accounting/billingSchedule';
import { loadInvoicePdfSettings } from '@/lib/billing-accounting/invoicePdfSettingsStore';
import {
  InvoicePdfPreviewSheet,
  type InvoicePdfPreviewData,
} from './InvoicePdfPreviewSheet';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import '@/components/modules/attendance-leaves/student-attendance.css';
import './fee-plan.css';
import './create-fee-plan.css';

const STEPS = [
  { id: 0, label: 'Create Plan Schedule' },
  { id: 1, label: 'Add Fee Component' },
  { id: 2, label: 'Assign Students' },
] as const;

const CONDITION_FIELDS = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'program', label: 'Program' },
  { value: 'age', label: 'Age' },
  { value: 'label', label: 'Label' },
  { value: 'status', label: 'Status' },
];

const CONDITION_OPS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'is greater than' },
  { value: 'lt', label: 'is less than' },
];

const CUSTOM_TERM_DUE_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const ease = [0.22, 1, 0.36, 1] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function emptyCondition(): FeePlanCondition {
  return {
    id: `cond-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    attribute: '',
    operator: '',
    value: '',
  };
}

function formatPreviewLongDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function discountAmountFor(def: DiscountDef | undefined, gross: number) {
  if (!def || gross <= 0) return 0;
  const raw = def.unit === 'percent' ? (gross * def.value) / 100 : def.value;
  return Math.min(gross, Math.max(0, raw));
}

/** Searchable Item Name — Create New Item + fee components */
function ItemNameSelect({
  value,
  catalog,
  onPick,
  onCreate,
}: {
  value: string;
  catalog: FeeComponent[];
  onPick: (item: FeeComponent) => void;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return catalog.filter(
      (o) =>
        o.name.toLowerCase().includes(qq) ||
        o.itemCode.toLowerCase().includes(qq),
    );
  }, [catalog, q]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const display =
    catalog.find((c) => `${c.name} (${c.itemCode})` === value || c.name === value)?.name ||
    value;

  return (
    <div className={`cfp-combo${open ? ' is-open' : ''}`} ref={rootRef}>
      <div className="cfp-combo-trigger" onClick={() => setOpen(true)}>
        <input
          value={open ? q : display}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => {
            setOpen(true);
            setQ('');
          }}
          placeholder="Select Item"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <Search size={15} className="cfp-combo-ico" aria-hidden />
      </div>
      {open ? (
        <div className="cfp-combo-menu" role="listbox">
          <button
            type="button"
            className={`cfp-combo-item is-create${active === 0 ? ' is-active' : ''}`}
            onClick={() => {
              onCreate();
              setOpen(false);
            }}
          >
            Create New Item
          </button>
          {filtered.length === 0 ? (
            <div className="cfp-combo-empty">No results found</div>
          ) : (
            filtered.map((o, i) => {
              const label = `${o.name} (${o.itemCode})`;
              const selected = value === label || value === o.name;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`cfp-combo-item${selected || active === i + 1 ? ' is-active' : ''}`}
                  onClick={() => {
                    onPick(o);
                    setQ('');
                    setOpen(false);
                  }}
                >
                  <span>{label}</span>
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

export function CreateFeePlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit')?.trim() || '';

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<FeePlanInput>(() => emptyFeePlanDraft());
  const [error, setError] = useState('');
  const [pickOpen, setPickOpen] = useState(false);
  const [pickIds, setPickIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [pickRoom, setPickRoom] = useState('All Classroom');
  const [pickGroup, setPickGroup] = useState('All Group');
  const [pickProgram, setPickProgram] = useState('All Programs');
  const [components, setComponents] = useState<FeeComponent[]>([]);
  const [discounts, setDiscounts] = useState<DiscountDef[]>([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalLineId, setItemModalLineId] = useState<string | null>(null);
  const [conditionLineId, setConditionLineId] = useState<string | null>(null);
  const [conditionDraft, setConditionDraft] = useState<FeePlanCondition[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  /** null = plan-level preview; student id = that student's discounted invoice */
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);
  const [pdfSettings, setPdfSettings] = useState(() => loadInvoicePdfSettings());

  const taxes = useMemo(() => loadTaxRates(), []);
  const students = useMemo(() => loadStudents(), []);
  const labels = useMemo(
    () =>
      loadLabels().filter(
        (l) => l.status === 'Active' && (l.feature === 'Fee Plan' || l.feature === 'Program'),
      ),
    [],
  );

  useEffect(() => {
    setComponents(loadFeeComponents());
    setDiscounts(loadDiscounts());
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    setPdfSettings(loadInvoicePdfSettings());
    window.history.pushState({ feePlanInvoicePreview: true }, '');
    const onPop = () => {
      setPreviewOpen(false);
      setPreviewStudentId(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [previewOpen]);

  const closeInvoicePreview = () => {
    if (typeof window !== 'undefined' && window.history.state?.feePlanInvoicePreview) {
      window.history.back();
      return;
    }
    setPreviewOpen(false);
    setPreviewStudentId(null);
  };

  useEffect(() => {
    if (!editId) return;
    const existing = getFeePlanById(editId);
    if (!existing) return;
    const { id: _id, createdAt: _c, updatedAt: _u, nextInvoiceDate: _n, ...rest } = existing;
    setDraft({
      ...rest,
      terms:
        rest.customTerms && (!Array.isArray(rest.terms) || rest.terms.length === 0)
          ? [emptyCustomTerm(1), emptyCustomTerm(2)]
          : Array.isArray(rest.terms)
            ? rest.terms
            : [],
      lines: rest.lines.map((l) => ({
        ...l,
        showDescription: Boolean(l.description),
        optionsOpen: l.optionsOpen ?? true,
        discountAmount: l.discountAmount ?? 0,
      })),
    });
  }, [editId]);

  const patch = (partial: Partial<FeePlanInput>) =>
    setDraft((d) => ({ ...d, ...partial }));

  const dateSelectionMode: DateSelectionMode = selectionModeForFrequency(
    draft.frequency,
    draft.customTerms,
  );

  const periodMode = draft.customTerms
    ? 'date'
    : draft.frequency === 'Weekly' || draft.frequency === 'Bi-Weekly'
      ? 'week'
      : 'month';

  const generationOptions = useMemo(
    () =>
      getGenerationOptions(
        draft.frequency,
        draft.customTerms,
        draft.periodStart,
        draft.periodEnd,
      ),
    [draft.frequency, draft.customTerms, draft.periodStart, draft.periodEnd],
  );

  const dueAfterOptions = useMemo(
    () =>
      getDueAfterOptions(
        draft.frequency,
        draft.customTerms,
        draft.periodStart,
        draft.periodEnd,
      ),
    [draft.frequency, draft.customTerms, draft.periodStart, draft.periodEnd],
  );

  // THREE independent calcs: plan cycles (start/end) · invoice schedule (today) · billing period radio.
  const nextPreview = useMemo(
    () =>
      buildSchedulePreview({
        frequency: draft.frequency,
        customTerms: draft.customTerms,
        generationDay: draft.invoiceGenerationDay,
        dueAfter: draft.invoiceDueAfter,
        billingPeriod: draft.billingPeriod,
        periodStart: draft.periodStart,
        periodEnd: draft.periodEnd,
      }),
    [
      draft.frequency,
      draft.customTerms,
      draft.invoiceGenerationDay,
      draft.invoiceDueAfter,
      draft.billingPeriod,
      draft.periodStart,
      draft.periodEnd,
    ],
  );
  const readyPreview = nextPreview.status === 'ready' ? nextPreview : null;

  // Keep generation / due-after valid when frequency or period length changes.
  useEffect(() => {
    if (draft.customTerms) return;
    const genOk = generationOptions.some((o) => o.value === draft.invoiceGenerationDay);
    const dueOk = dueAfterOptions.some((o) => o.value === String(draft.invoiceDueAfter));
    if (genOk && dueOk) return;
    patch({
      ...(genOk ? {} : { invoiceGenerationDay: generationOptions[0]?.value || '' }),
      ...(dueOk ? {} : { invoiceDueAfter: Number(dueAfterOptions[0]?.value) || 1 }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.frequency, draft.customTerms, draft.periodStart, draft.periodEnd, generationOptions, dueAfterOptions]);

  const startPeriodLabel =
    periodMode === 'week' ? 'Start week' : periodMode === 'month' ? 'Start Month' : 'Start Date';
  const endPeriodLabel =
    periodMode === 'week' ? 'End week' : periodMode === 'month' ? 'End Month' : 'End Date';
  const startPlaceholder =
    periodMode === 'week'
      ? 'Select week'
      : periodMode === 'month'
        ? 'Select month'
        : 'Please select date';
  const endPlaceholder = startPlaceholder;
  const endRequired = periodMode !== 'week';

  // End week may equal Start week — only block weeks *before* start.
  const startRangeStart = draft.periodStart
    ? selectionRange(draft.periodStart, dateSelectionMode).start
    : '';
  const endMinDate = startRangeStart || undefined;
  const endBlockedUntil = startRangeStart
    ? addDateDays(startRangeStart, -1)
    : undefined;

  const setPeriodStart = (v: string) => {
    const nextEnd =
      draft.periodEnd &&
      ((periodMode === 'month' && draft.periodEnd < v) ||
        (periodMode === 'week' &&
          selectionRange(draft.periodEnd, dateSelectionMode).start <
            selectionRange(v, dateSelectionMode).start) ||
        (periodMode === 'date' && draft.periodEnd < v))
        ? ''
        : draft.periodEnd;
    patch({ periodStart: v, periodEnd: nextEnd });
  };

  const setPeriodEnd = (v: string) => {
    patch({ periodEnd: v });
  };

  const totals = useMemo(
    () => summarizePlanLines(draft.lines, draft.taxMode, draft.discountId),
    [draft.lines, draft.taxMode, draft.discountId],
  );

  const invoicePreviewData = useMemo((): InvoicePdfPreviewData => {
    const issued = readyPreview?.generationDate || '';
    const due = readyPreview?.dueDate || '';
    const periodLabel = readyPreview
      ? `${formatPreviewLongDate(readyPreview.periodStart)} - ${formatPreviewLongDate(readyPreview.periodEnd)}`
      : '—';
    const programName =
      PROGRAM_OPTIONS.find((p) => p.id === draft.programId)?.name ||
      draft.programName ||
      '—';
    const previewStudent = draft.students.find((s) => s.studentId === previewStudentId);
    const effectiveDiscountId =
      previewStudent?.discountId || draft.discountId;
    const previewTotals = summarizePlanLines(
      draft.lines,
      draft.taxMode,
      effectiveDiscountId,
    );
    const taxMap = new Map<string, { name: string; rate: number; amount: number }>();
    for (const line of draft.lines) {
      for (const tid of line.taxRateIds) {
        const t = taxes.find((x) => x.id === tid);
        if (!t) continue;
        const amt = lineTaxAmount({ ...line, taxRateIds: [tid] }, draft.taxMode);
        const prev = taxMap.get(tid);
        if (prev) prev.amount += amt;
        else taxMap.set(tid, { name: t.name, rate: t.rate, amount: amt });
      }
    }
    return {
      dueAmount: previewTotals.total,
      dueDateLabel: formatPreviewLongDate(due),
      studentName: previewStudent?.studentName || 'Sample Student',
      className: programName,
      motherName: '—',
      fatherName: '—',
      invoiceNumber: previewStudent ? `PREVIEW-${previewStudent.studentId.slice(-4)}` : 'PREVIEW',
      dateIssued: formatPreviewLongDate(issued),
      dueDate: formatPreviewLongDate(due),
      billingPeriod: periodLabel,
      lines: draft.lines.map((line) => {
        const comp = components.find((c) => c.id === line.componentId);
        return {
          name: line.name || 'Item',
          description:
            line.description ||
            `${line.category}${readyPreview ? ` · ${formatPreviewLongDate(readyPreview.periodStart)}` : ''}`,
          itemCode: comp?.itemCode,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxPercent: lineTaxPercent(line),
          amount: line.quantity * line.unitPrice,
        };
      }),
      taxRows: taxMap.size
        ? [...taxMap.values()]
        : [{ name: 'GST', rate: 0, amount: 0 }],
      subtotal: previewTotals.subTotal,
      discount: previewTotals.itemsDiscount + previewTotals.invoiceDiscount,
      total: previewTotals.total,
    };
  }, [
    components,
    draft.discountId,
    draft.lines,
    draft.programId,
    draft.programName,
    draft.students,
    draft.taxMode,
    readyPreview,
    previewStudentId,
    taxes,
  ]);

  const studentEstimate = (studentDiscountId?: string) =>
    summarizePlanLines(
      draft.lines,
      draft.taxMode,
      studentDiscountId || draft.discountId,
    );

  const validateStep = (s: number) => {
    if (s === 0) {
      if (!draft.name.trim()) return 'Please enter a fee plan name.';
      if (!draft.programId) return 'Please select a program.';
      if (!draft.periodStart) return `Please select ${startPeriodLabel.toLowerCase()}.`;
      if (endRequired && !draft.periodEnd) return `Please select ${endPeriodLabel.toLowerCase()}.`;
      if (draft.periodEnd && draft.periodEnd < draft.periodStart) {
        return 'End period cannot be before start period.';
      }

      if (draft.customTerms) {
        if (!draft.terms.length) return 'Add at least one custom term.';
        for (const term of draft.terms) {
          if (!term.startDate || !term.endDate) {
            return `Please complete start and end dates for ${term.name}.`;
          }
          if (term.endDate < term.startDate) {
            return `${term.name}: end date cannot be before start date.`;
          }
          if (!term.invoiceGenerationDate) {
            return `Please select an invoice generation date for ${term.name}.`;
          }
          if (
            term.invoiceGenerationDate < term.startDate ||
            term.invoiceGenerationDate > term.endDate
          ) {
            return `${term.name}: invoice generation date should fall within the term period.`;
          }
          if (!term.invoiceDueAfter || term.invoiceDueAfter < 1) {
            return `Please select invoice due after for ${term.name}.`;
          }
        }
      } else if (draft.frequency === 'Weekly') {
        const msg = validateWeeklySchedule({
          periodStart: draft.periodStart,
          periodEnd: draft.periodEnd,
          generationDay: draft.invoiceGenerationDay,
          dueAfter: draft.invoiceDueAfter,
        });
        if (msg) return msg;
      } else if (!draft.invoiceGenerationDay) {
        return 'Please select an invoice generation date.';
      }
    }
    if (s === 1) {
      if (!draft.lines.length || draft.lines.some((l) => !l.componentId || l.unitPrice < 0)) {
        return 'Add at least one valid fee component.';
      }
    }
    return '';
  };

  const patchTerm = (id: string, partial: Partial<FeePlanCustomTerm>) => {
    setDraft((d) => ({
      ...d,
      terms: d.terms.map((t) => (t.id === id ? { ...t, ...partial } : t)),
    }));
  };

  const addCustomTerm = () => {
    setDraft((d) => ({
      ...d,
      terms: [...d.terms, emptyCustomTerm(d.terms.length + 1)],
    }));
  };

  const removeCustomTerm = (id: string) => {
    setDraft((d) => {
      if (d.terms.length <= 1) return d;
      return { ...d, terms: d.terms.filter((t) => t.id !== id) };
    });
  };

  const goNext = () => {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setStep((s) => Math.min(2, s + 1));
  };

  const goPrev = () => {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  };

  const save = () => {
    const msg = validateStep(0) || validateStep(1);
    if (msg) {
      setError(msg);
      return;
    }
    const programName =
      PROGRAM_OPTIONS.find((p) => p.id === draft.programId)?.name || draft.programName;
    const saved = upsertFeePlan({
      ...draft,
      id: editId || draft.id,
      programName,
      status: draft.status === 'Draft' ? 'Active' : draft.status,
    });
    router.push(`/billing-accounting/fee-plan/${saved.id}`);
  };

  const updateLine = (id: string, partial: Partial<FeePlanLine>) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...partial };
        if (('quantity' in partial || 'unitPrice' in partial) && next.discountId) {
          const disc = discounts.find((x) => x.id === next.discountId);
          next.discountAmount = discountAmountFor(
            disc,
            next.quantity * next.unitPrice,
          );
        }
        return next;
      }),
    }));
  };

  const applyComponent = (lineId: string, comp: FeeComponent) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) =>
        l.id === lineId
          ? {
              ...l,
              componentId: comp.id,
              name: comp.name,
              category: comp.category,
              unitPrice: comp.unitPrice,
              refundable: comp.refundable,
              description: undefined,
              showDescription: false,
              discountAmount:
                l.discountId && discounts.find((x) => x.id === l.discountId)
                  ? discountAmountFor(
                      discounts.find((x) => x.id === l.discountId),
                      l.quantity * comp.unitPrice,
                    )
                  : l.discountAmount || 0,
            }
          : l,
      ),
    }));
  };

  const applyDiscountToLine = (lineId: string, discountId: string) => {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) => {
        if (l.id !== lineId) return l;
        const disc = discounts.find((x) => x.id === discountId);
        if (!disc) return { ...l, discountId: undefined, discountAmount: 0 };
        return {
          ...l,
          discountId,
          discountAmount: discountAmountFor(disc, l.quantity * l.unitPrice),
        };
      }),
    }));
  };

  const openConditionModal = (lineId: string) => {
    const line = draft.lines.find((l) => l.id === lineId);
    setConditionLineId(lineId);
    setConditionDraft(
      line?.conditions?.length ? line.conditions.map((c) => ({ ...c })) : [],
    );
  };

  const saveConditions = () => {
    if (!conditionLineId) return;
    const valid = conditionDraft.filter(
      (c) => c.attribute && c.operator && c.value.trim(),
    );
    updateLine(conditionLineId, {
      conditions: valid,
      applyRule: valid.length ? 'conditional' : 'always',
    });
    setConditionLineId(null);
    setConditionDraft([]);
  };

  const conditionLine = draft.lines.find((l) => l.id === conditionLineId);

  const addPickedStudents = () => {
    const existing = new Set(draft.students.map((s) => s.studentId));
    const added: FeePlanStudent[] = pickIds
      .filter((id) => !existing.has(id))
      .map((id) => {
        const st = students.find((s) => s.id === id);
        return {
          studentId: id,
          studentName: st?.name || 'Student',
          startDate: draft.periodStart,
          endDate: draft.periodEnd,
        };
      });
    patch({ students: [...draft.students, ...added] });
    setPickOpen(false);
    setPickIds([]);
    setStudentSearch('');
    setPickRoom('All Classroom');
    setPickGroup('All Group');
    setPickProgram('All Programs');
  };

  const filteredPick = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (pickRoom !== 'All Classroom') {
        const roomOpt = ROOM_OPTIONS.find((r) => r.name === pickRoom);
        if (roomOpt && !s.roomIds.includes(roomOpt.id)) return false;
      }
      if (pickGroup !== 'All Group') {
        const g = GROUP_OPTIONS.find((x) => x.name === pickGroup);
        if (g && !s.groupIds.includes(g.id)) return false;
      }
      if (pickProgram !== 'All Programs') {
        const p = PROGRAM_OPTIONS.find((x) => x.name === pickProgram);
        if (p && !s.programIds.includes(p.id)) return false;
      }
      if (q && !`${s.name} ${s.preferredName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, pickRoom, pickGroup, pickProgram, studentSearch]);

  const selectablePick = filteredPick.filter(
    (s) => !draft.students.some((x) => x.studentId === s.id),
  );

  const openPlanPreview = () => {
    setPreviewStudentId(null);
    setPreviewOpen(true);
  };

  const openStudentPreview = (studentId: string) => {
    setPreviewStudentId(studentId);
    setPreviewOpen(true);
  };

  const selectAllPickable = () => {
    setPickIds(selectablePick.map((s) => s.id));
  };

  const previewStudentName =
    draft.students.find((s) => s.studentId === previewStudentId)?.studentName || null;

  if (previewOpen) {
    return (
      <div className="cfp-root cfp-preview-root">
        <ModulePageHeader
          section="BILLING & ACCOUNTING"
          title="Preview Invoice"
          description={
            previewStudentName
              ? `${previewStudentName} · ${draft.name || 'Fee Plan'}`
              : draft.name || 'Fee Plan draft preview'
          }
          icon={<CalendarDays size={20} />}
          actions={
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={closeInvoicePreview}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          }
        />
        <div className="bip-preview-pane cfp-preview-pane">
          <div className="bip-preview-stage">
            <InvoicePdfPreviewSheet settings={pdfSettings} data={invoicePreviewData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cfp-root">
      <ModulePageHeader
        section="BILLING & ACCOUNTING"
        title={editId ? 'Edit Fee Plan' : 'Create Fee Plan'}
        description="Schedule billing, attach fee components, and assign students."
        icon={<CalendarDays size={20} />}
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => router.push('/billing-accounting/fee-plan')}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        }
      />

      <div className="cfp-top">
        <div className="cfp-stepper" role="tablist" aria-label="Fee plan steps">
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            const upcoming = step < s.id;
            return (
              <motion.button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-current={active ? 'step' : undefined}
                className={`cfp-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}${upcoming ? ' is-upcoming' : ''}`}
                onClick={() => {
                  if (s.id < step || !validateStep(step)) {
                    setError('');
                    setStep(s.id);
                  } else {
                    const msg = validateStep(step);
                    if (msg) setError(msg);
                    else setStep(s.id);
                  }
                }}
                whileHover={{ y: -1, transition: { duration: 0.35 } }}
                whileTap={{ scale: 0.99, transition: { duration: 0.2 } }}
                transition={{ duration: 0.55, ease }}
              >
                <span className="cfp-step-shade cfp-step-shade-base" aria-hidden />
                <span className="cfp-step-shade cfp-step-shade-done" aria-hidden />
                <span className="cfp-step-shade cfp-step-shade-active" aria-hidden />
                <motion.span
                  className="cfp-step-num"
                  aria-hidden
                  key={done ? `done-${s.id}` : `num-${s.id}-${active}`}
                  initial={{ scale: 0.88, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  {done ? <Check size={13} strokeWidth={3} /> : s.id + 1}
                </motion.span>
                <span className="cfp-step-label">{s.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="cfp-top-actions">
          {step === 0 ? (
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.push('/billing-accounting/fee-plan')}
            >
              Cancel
            </button>
          ) : (
            <button type="button" className="ui-btn ui-btn-outline" onClick={goPrev}>
              Previous
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="ui-btn ui-btn-primary" onClick={goNext}>
              Next
            </button>
          ) : (
            <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
              Save
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p className="ui-error-text" role="alert">
          {error}
        </p>
      ) : null}

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="s0"
            className="cfp-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
          >
            <h3>Create Plan Schedule</h3>
            <div className="cfp-stack">
              <div className="ui-field">
                <label className="ui-label">
                  Fee Plan Name <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Enter fee plan name"
                />
              </div>

              <div className="cfp-grid-2">
                <div className="ui-field">
                  <label className="ui-label">
                    Select program <span className="req">*</span>
                  </label>
                  <AppSelect
                    value={draft.programId}
                    onChange={(v) =>
                      patch({
                        programId: v,
                        programName: PROGRAM_OPTIONS.find((p) => p.id === v)?.name || '',
                      })
                    }
                    options={[
                      { value: '', label: 'Select program' },
                      ...PROGRAM_OPTIONS.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                    searchable
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Select label</label>
                  <AppMultiSelect
                    values={draft.labelIds}
                    onChange={(ids) => patch({ labelIds: ids })}
                    options={labels.map((l) => ({ value: l.id, label: l.name }))}
                    placeholder="Select label"
                  />
                </div>
              </div>

              <div className="ui-field">
                <label className="ui-label">
                  How often do you want to generate the invoice? <span className="req">*</span>
                </label>
                  <AppSelect
                  value={draft.customTerms ? '__custom__' : draft.frequency}
                  onChange={(v) => {
                    if (draft.customTerms) return;
                    const next = v as PlanFrequency;
                    const modeOf = (f: PlanFrequency) =>
                      f === 'Weekly' ? 'week' : f === 'Bi-Weekly' ? 'biweek' : 'other';
                    const changed = modeOf(draft.frequency) !== modeOf(next);
                    patch({
                      frequency: next,
                      ...(changed ? { periodStart: '', periodEnd: '' } : {}),
                    });
                  }}
                  options={
                    draft.customTerms
                      ? [{ value: '__custom__', label: 'Custom Terms' }]
                      : FREQUENCY_OPTIONS.map((f) => ({ value: f, label: f }))
                  }
                  searchable={!draft.customTerms}
                  disabled={draft.customTerms}
                />
              </div>

              <div className="cfp-toggle-row is-inline">
                <button
                  type="button"
                  className={`cfp-switch${draft.customTerms ? ' is-on' : ''}`}
                  aria-pressed={draft.customTerms}
                  onClick={() => {
                    const next = !draft.customTerms;
                    patch({
                      customTerms: next,
                      // Keep prior frequency when turning off custom.
                      periodStart: '',
                      periodEnd: '',
                      terms: next
                        ? draft.terms.length
                          ? draft.terms
                          : [emptyCustomTerm(1), emptyCustomTerm(2)]
                        : draft.terms,
                    });
                  }}
                >
                  <i />
                </button>
                <div>
                  <strong>Run on custom terms</strong>
                  <p>Only enable if you want billing to run on a custom schedule</p>
                </div>
              </div>

              <div className="cfp-period-block">
                <h4 className="cfp-period-title">Fee Plan Period</h4>
                <div className="cfp-grid-2">
                  <div className="ui-field">
                    <label className="ui-label">
                      {startPeriodLabel} <span className="req">*</span>
                    </label>
                    {periodMode === 'month' ? (
                      <FeePlanMonthField
                        value={draft.periodStart}
                        onChange={setPeriodStart}
                        placeholder={startPlaceholder}
                      />
                    ) : (
                      <DayDatePicker
                        value={draft.periodStart}
                        onChange={setPeriodStart}
                        placeholder={startPlaceholder}
                        selectionMode={dateSelectionMode}
                      />
                    )}
                  </div>
                  <div className="ui-field">
                    <label className="ui-label">
                      {endPeriodLabel}
                      {endRequired ? (
                        <>
                          {' '}
                          <span className="req">*</span>
                        </>
                      ) : null}
                    </label>
                    {periodMode === 'month' ? (
                      <FeePlanMonthField
                        value={draft.periodEnd}
                        onChange={setPeriodEnd}
                        placeholder={endPlaceholder}
                        minValue={draft.periodStart || undefined}
                      />
                    ) : (
                      <DayDatePicker
                        value={draft.periodEnd}
                        onChange={setPeriodEnd}
                        placeholder={endPlaceholder}
                        selectionMode={dateSelectionMode}
                        minDate={endMinDate}
                        blockedUntil={endBlockedUntil}
                      />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {draft.customTerms ? (
                  <motion.div
                    key="custom-terms"
                    className="cfp-ct-panel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="cfp-ct-card">
                      <div className="cfp-ct-card-head">
                        <h4>Billing Details</h4>
                        <span className="cfp-ct-badge">{draft.terms.length} terms</span>
                      </div>

                      <div className="cfp-ct-table-wrap">
                        <table className="cfp-ct-table">
                          <thead>
                            <tr>
                              <th>Term Name</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Invoice Generation Date</th>
                              <th>Invoice Due After</th>
                              <th aria-label="Actions" />
                            </tr>
                          </thead>
                          <tbody>
                            <AnimatePresence initial={false}>
                              {draft.terms.map((term) => {
                                const termEndMin = term.startDate || undefined;
                                const termEndBlocked = term.startDate
                                  ? addDateDays(term.startDate, -1)
                                  : undefined;
                                return (
                                  <motion.tr
                                    key={term.id}
                                    layout
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                    className="cfp-ct-row"
                                  >
                                    <td>
                                      <input
                                        className="ui-input cfp-ct-name"
                                        value={term.name}
                                        onChange={(e) =>
                                          patchTerm(term.id, { name: e.target.value })
                                        }
                                        placeholder="Custom term"
                                      />
                                    </td>
                                    <td>
                                      <DayDatePicker
                                        value={term.startDate}
                                        onChange={(v) => {
                                          patchTerm(term.id, {
                                            startDate: v,
                                            ...(term.endDate && v && term.endDate < v
                                              ? { endDate: '' }
                                              : {}),
                                            ...(term.invoiceGenerationDate &&
                                            v &&
                                            term.invoiceGenerationDate < v
                                              ? { invoiceGenerationDate: '' }
                                              : {}),
                                          });
                                        }}
                                        placeholder="Select date"
                                        selectionMode="day"
                                      />
                                    </td>
                                    <td>
                                      <DayDatePicker
                                        value={term.endDate}
                                        onChange={(v) => {
                                          patchTerm(term.id, {
                                            endDate: v,
                                            ...(term.invoiceGenerationDate &&
                                            v &&
                                            term.invoiceGenerationDate > v
                                              ? { invoiceGenerationDate: '' }
                                              : {}),
                                          });
                                        }}
                                        placeholder="Select date"
                                        selectionMode="day"
                                        minDate={termEndMin}
                                        blockedUntil={termEndBlocked}
                                      />
                                    </td>
                                    <td>
                                      <DayDatePicker
                                        value={term.invoiceGenerationDate}
                                        onChange={(v) =>
                                          patchTerm(term.id, { invoiceGenerationDate: v })
                                        }
                                        placeholder="Select date"
                                        selectionMode="day"
                                        minDate={term.startDate || undefined}
                                        blockedUntil={
                                          term.startDate
                                            ? addDateDays(term.startDate, -1)
                                            : undefined
                                        }
                                      />
                                    </td>
                                    <td>
                                      <AppSelect
                                        value={String(term.invoiceDueAfter)}
                                        onChange={(v) =>
                                          patchTerm(term.id, {
                                            invoiceDueAfter: Number(v) || 1,
                                          })
                                        }
                                        options={CUSTOM_TERM_DUE_OPTIONS}
                                        searchable
                                        placeholder="Select"
                                      />
                                    </td>
                                    <td className="cfp-ct-actions">
                                      <button
                                        type="button"
                                        className="cfp-ct-trash"
                                        aria-label={`Remove ${term.name}`}
                                        disabled={draft.terms.length <= 1}
                                        onClick={() => removeCustomTerm(term.id)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>

                      <button
                        type="button"
                        className="cfp-ct-add"
                        onClick={addCustomTerm}
                      >
                        <Plus size={16} strokeWidth={2.5} />
                        Add custom term
                      </button>
                    </div>

                    <div className="cfp-ct-preview">
                      {draft.terms.map((term) => {
                        const ready =
                          term.startDate &&
                          term.endDate &&
                          term.invoiceGenerationDate &&
                          term.invoiceDueAfter >= 1;
                        const dueDate = ready
                          ? addDateDays(
                              term.invoiceGenerationDate,
                              Math.max(0, term.invoiceDueAfter),
                            )
                          : '';
                        return (
                          <div key={term.id} className="cfp-ct-preview-item">
                            <strong>{term.name || 'Custom term'}</strong>
                            {ready ? (
                              <p>
                                Your invoice will be generated on{' '}
                                <em>{formatPlanDate(term.invoiceGenerationDate)}</em> due on{' '}
                                <em>{formatPlanDate(dueDate)}</em> for the period of{' '}
                                <em>{formatPlanDate(term.startDate)}</em> to{' '}
                                <em>{formatPlanDate(term.endDate)}</em>.
                              </p>
                            ) : (
                              <p className="cfp-ct-preview-empty">—</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="standard-schedule"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="cfp-grid-2">
                      <div className="ui-field">
                        <label className="ui-label">
                          Invoice Generation Date <span className="req">*</span>
                        </label>
                        <AppSelect
                          value={draft.invoiceGenerationDay}
                          onChange={(v) => patch({ invoiceGenerationDay: v })}
                          options={generationOptions}
                          searchable
                          placeholder="Select"
                        />
                      </div>
                      <div className="ui-field">
                        <label className="ui-label">
                          Invoice Due After <span className="req">*</span>
                        </label>
                        <AppSelect
                          value={String(draft.invoiceDueAfter)}
                          onChange={(v) => patch({ invoiceDueAfter: Number(v) || 1 })}
                          options={dueAfterOptions}
                          searchable
                          placeholder="Select"
                        />
                      </div>
                    </div>

                    <div className="cfp-billing-block">
                      <div className="cfp-billing-row">
                        <span className="ui-label">Billing Period</span>
                        <div
                          className="cfp-radios is-native"
                          role="radiogroup"
                          aria-label="Billing Period"
                        >
                          {(['Previous', 'Current', 'Next'] as BillingPeriodKind[]).map((b) => (
                            <label key={b}>
                              <input
                                type="radio"
                                name="billing-period"
                                checked={draft.billingPeriod === b}
                                onChange={() => patch({ billingPeriod: b })}
                              />
                              {b}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="cfp-preview-box">
                        <h5>Next Invoice Details</h5>
                        {readyPreview ? (
                          <>
                            Your invoice will be generated on{' '}
                            <strong>{formatPlanDate(readyPreview.generationDate)}</strong> due
                            on <strong>{formatPlanDate(readyPreview.dueDate)}</strong> for the
                            period of{' '}
                            <strong>{formatPlanDate(readyPreview.periodStart)}</strong> to{' '}
                            <strong>{formatPlanDate(readyPreview.periodEnd)}</strong>.
                          </>
                        ) : (
                          nextPreview.message
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="cfp-checks">
                <label className="cfp-check">
                  <input
                    type="checkbox"
                    checked={draft.emailParent}
                    onChange={(e) => patch({ emailParent: e.target.checked })}
                  />
                  <span>Send invoice via email to parent</span>
                </label>
                <label className="cfp-check">
                  <input
                    type="checkbox"
                    checked={draft.settleWithCredit}
                    onChange={(e) => patch({ settleWithCredit: e.target.checked })}
                  />
                  <span>Settle with credit</span>
                </label>
                <label className="cfp-check">
                  <input
                    type="checkbox"
                    checked={draft.generateOnJoin}
                    onChange={(e) => patch({ generateOnJoin: e.target.checked })}
                  />
                  <span>
                    Generate first invoice on the joining date for ongoing billing period if a
                    student joins after invoice generation date.
                  </span>
                </label>
              </div>

              <div className="cfp-grid-2">
                <div className="ui-field">
                  <label className="ui-label">School Notes (Not visible to parents*)</label>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    value={draft.schoolNotes}
                    onChange={(e) => patch({ schoolNotes: e.target.value })}
                    placeholder="Enter a note..."
                  />
                </div>
                <div className="ui-field">
                  <label className="ui-label">Parent Notes (Visible to parents*)</label>
                  <textarea
                    className="ui-textarea"
                    rows={3}
                    value={draft.parentNotes}
                    onChange={(e) => patch({ parentNotes: e.target.value })}
                    placeholder="Enter a note..."
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        {step === 1 ? (
          <motion.div
            key="s1"
            className="cfp-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="cfp-comp-toolbar">
              <div>
                <h4>
                  {draft.name || 'Fee Plan'} — {draft.frequency} Billing, {draft.billingPeriod}{' '}
                  Period
                </h4>
                {readyPreview ? (
                  <p>
                    Next invoice: {formatPlanDate(readyPreview.generationDate)} · due{' '}
                    {formatPlanDate(readyPreview.dueDate)} ·{' '}
                    {formatPlanDate(readyPreview.periodStart)} to{' '}
                    {formatPlanDate(readyPreview.periodEnd)}
                  </p>
                ) : nextPreview.status === 'empty' && nextPreview.code !== 'incomplete' ? (
                  <p>{nextPreview.message}</p>
                ) : null}
              </div>
              <div className="cfp-comp-toolbar-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-outline cfp-preview-btn"
                  onClick={openPlanPreview}
                >
                  Preview invoice
                </button>
                <div className="ui-field cfp-tax-mode-field">
                  <label className="ui-label">Amounts are:</label>
                  <AppSelect
                    value={draft.taxMode}
                    onChange={(v) => patch({ taxMode: v as TaxAmountMode })}
                    options={[
                      { value: 'inclusive', label: 'Inclusive of tax' },
                      { value: 'exclusive', label: 'Exclusive of tax' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {draft.lines.map((line) => {
              const taxPct = lineTaxPercent(line);
              const itemLabel = (() => {
                const c = components.find((x) => x.id === line.componentId);
                return c ? `${c.name} (${c.itemCode})` : line.name;
              })();
              return (
                <div key={line.id} className="cfp-line">
                  <div className="cfp-line-grid">
                    <div className="ui-field">
                      <label className="ui-label">Item Name</label>
                      <ItemNameSelect
                        value={itemLabel}
                        catalog={components}
                        onPick={(item) => applyComponent(line.id, item)}
                        onCreate={() => {
                          setItemModalLineId(line.id);
                          setItemModalOpen(true);
                        }}
                      />
                    </div>
                    <div className="ui-field">
                      <label className="ui-label">Category</label>
                      <input className="ui-input" value={line.category} disabled />
                    </div>
                    <div className="ui-field">
                      <label className="ui-label">Qty</label>
                      <input
                        className="ui-input"
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(line.id, {
                            quantity: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                      />
                    </div>
                    <div className="ui-field">
                      <label className="ui-label">Unit Price</label>
                      <input
                        className="ui-input"
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLine(line.id, {
                            unitPrice: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </div>
                    <div className="ui-field">
                      <label className="ui-label">Tax</label>
                      <div className="cfp-readonly">{taxPct ? `${taxPct} %` : '—'}</div>
                    </div>
                    <div className="ui-field">
                      <label className="ui-label">Amount</label>
                      <div className="cfp-readonly">
                        {formatInrAmount(line.quantity * line.unitPrice)}
                      </div>
                    </div>
                    <div className="ui-field cfp-line-del-col">
                      <label className="ui-label">&nbsp;</label>
                      <button
                        type="button"
                        className="cfp-del-btn"
                        aria-label="Remove item"
                        disabled={draft.lines.length <= 1}
                        onClick={() =>
                          patch({ lines: draft.lines.filter((l) => l.id !== line.id) })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="cfp-line-meta">
                    {line.showDescription ? null : (
                      <button
                        type="button"
                        className="cfp-link"
                        onClick={() =>
                          updateLine(line.id, { showDescription: true, description: '' })
                        }
                      >
                        + Add description
                      </button>
                    )}
                    <label className="cfp-check">
                      <input
                        type="checkbox"
                        checked={line.refundable}
                        onChange={(e) =>
                          updateLine(line.id, { refundable: e.target.checked })
                        }
                      />
                      <span>Refundable</span>
                    </label>
                    <button
                      type="button"
                      className="cfp-always-btn"
                      onClick={() => openConditionModal(line.id)}
                    >
                      <Settings2 size={14} />
                      {line.applyRule === 'conditional' && line.conditions.length
                        ? `Conditional (${line.conditions.length})`
                        : 'Always Apply'}
                    </button>
                  </div>

                  {line.showDescription ? (
                    <div className="ui-field cfp-desc-field">
                      <textarea
                        className="ui-textarea"
                        rows={2}
                        value={line.description || ''}
                        onChange={(e) =>
                          updateLine(line.id, { description: e.target.value })
                        }
                        placeholder="Item description"
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="cfp-options-toggle"
                    onClick={() =>
                      updateLine(line.id, { optionsOpen: !line.optionsOpen })
                    }
                  >
                    Item options
                    <ChevronDown
                      size={15}
                      style={{
                        transform: line.optionsOpen ? 'rotate(180deg)' : undefined,
                        transition: 'transform 180ms',
                      }}
                    />
                  </button>

                  {line.optionsOpen ? (
                    <div className="cfp-item-options">
                      <div className="cfp-opt-row">
                        <span className="ui-label">Discount</span>
                        {line.discountId ? (
                          <span className="cfp-chip">
                            {discounts.find((d) => d.id === line.discountId)?.name ||
                              'Discount'}{' '}
                            − {formatInrAmount(line.discountAmount || 0)}
                            <button
                              type="button"
                              aria-label="Remove discount"
                              onClick={() => applyDiscountToLine(line.id, '')}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ) : (
                          <AppSelect
                            value=""
                            onChange={(v) => applyDiscountToLine(line.id, v)}
                            options={[
                              { value: '', label: 'Select discount' },
                              ...discounts.map((d) => ({
                                value: d.id,
                                label: d.name,
                              })),
                            ]}
                          />
                        )}
                      </div>
                      <div className="cfp-opt-row cfp-opt-tax">
                        <span className="ui-label">Tax</span>
                        <div className="cfp-opt-tax-body">
                          {line.taxRateIds.map((tid) => {
                            const t = taxes.find((x) => x.id === tid);
                            if (!t) return null;
                            const amt = lineTaxAmount(
                              { ...line, taxRateIds: [tid] },
                              draft.taxMode,
                            );
                            return (
                              <span key={tid} className="cfp-chip">
                                {t.name} ( {t.rate} % ){' '}
                                <em>+ {formatInrAmount(amt)}</em>
                                <button
                                  type="button"
                                  aria-label={`Remove ${t.name}`}
                                  onClick={() =>
                                    updateLine(line.id, {
                                      taxRateIds: line.taxRateIds.filter((x) => x !== tid),
                                    })
                                  }
                                >
                                  <X size={13} />
                                </button>
                              </span>
                            );
                          })}
                          <AppSelect
                            value=""
                            onChange={(v) => {
                              if (!v || line.taxRateIds.includes(v)) return;
                              updateLine(line.id, {
                                taxRateIds: [...line.taxRateIds, v],
                              });
                            }}
                            options={[
                              { value: '', label: 'Select tax' },
                              ...taxes
                                .filter((t) => !line.taxRateIds.includes(t.id))
                                .map((t) => ({
                                  value: t.id,
                                  label: `${t.name} (${t.rate}%)`,
                                })),
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            <button
              type="button"
              className="cfp-link cfp-add-item"
              onClick={() => patch({ lines: [...draft.lines, emptyPlanLine()] })}
            >
              <Plus size={14} style={{ verticalAlign: -2 }} /> Add Invoice Item
            </button>

            <div className="cfp-totals">
              <div>
                <span>Sub Total</span>
                <strong>{formatInrAmount(totals.subTotal)}</strong>
              </div>
              <div>
                <span>Items Discount</span>
                <span>− {formatInrAmount(totals.itemsDiscount)}</span>
              </div>
              <div className="cfp-totals-discount">
                <span>Discount</span>
                {draft.discountId ? (
                  <span className="cfp-chip">
                    {discounts.find((d) => d.id === draft.discountId)?.name || 'Discount'}{' '}
                    − {formatInrAmount(totals.invoiceDiscount)}
                    <button
                      type="button"
                      aria-label="Remove plan discount"
                      onClick={() => patch({ discountId: undefined })}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ) : (
                  <AppSelect
                    value=""
                    onChange={(v) => patch({ discountId: v || undefined })}
                    options={[
                      { value: '', label: 'Select discount' },
                      ...discounts.map((d) => ({ value: d.id, label: d.name })),
                    ]}
                  />
                )}
              </div>
              <div>
                <span>Total without tax</span>
                <strong>{formatInrAmount(totals.withoutTax)}</strong>
              </div>
              {totals.taxTotal > 0 || draft.taxMode === 'exclusive' ? (
                <div>
                  <span>Tax</span>
                  <span>+ {formatInrAmount(totals.taxTotal)}</span>
                </div>
              ) : null}
              <div className="is-strong">
                <span>Total</span>
                <span>{formatInrAmount(totals.total)}</span>
              </div>
              <p className="cfp-round-note">Values are rounded to two decimal places.</p>
            </div>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div
            key="s2"
            className="cfp-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="cfp-students-bar">
              <div className="cfp-students-count">
                <span className="cfp-students-ico" aria-hidden>
                  <Users size={16} />
                </span>
                <strong>
                  {draft.students.length} student
                  {draft.students.length === 1 ? '' : 's'} selected
                </strong>
              </div>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={() => setPickOpen(true)}
              >
                <Plus size={15} />
                Add Students
              </button>
            </div>

            {draft.students.length === 0 ? (
              <motion.div
                className="cfp-stud-empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, ease }}
              >
                <Users size={28} />
                <h3>No students assigned</h3>
                <p>Add students to this fee plan. Each can get a discount and their own invoice preview.</p>
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  onClick={() => setPickOpen(true)}
                >
                  <Plus size={15} />
                  Add Students
                </button>
              </motion.div>
            ) : (
              <div className="cfp-stud-table">
                <div className="cfp-stud-head" role="row">
                  <span>Student Name</span>
                  <span>Start Date</span>
                  <span>End Date</span>
                  <span>Discount</span>
                  <span>Est. Invoice</span>
                  <span>Preview</span>
                </div>
                <AnimatePresence initial={false}>
                  {draft.students.map((st, idx) => {
                    const est = studentEstimate(st.discountId);
                    return (
                      <motion.div
                        key={st.studentId}
                        className="cfp-stud-row"
                        role="row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.24, delay: idx * 0.03, ease }}
                      >
                        <div className="cfp-stud-cell cfp-stud-cell-who">
                          <span className="cfp-avatar">{initials(st.studentName)}</span>
                          <strong>{st.studentName}</strong>
                        </div>
                        <div className="cfp-stud-cell">
                          <DayDatePicker
                            value={st.startDate}
                            onChange={(v) =>
                              patch({
                                students: draft.students.map((s) =>
                                  s.studentId === st.studentId ? { ...s, startDate: v } : s,
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="cfp-stud-cell">
                          <DayDatePicker
                            value={st.endDate}
                            onChange={(v) =>
                              patch({
                                students: draft.students.map((s) =>
                                  s.studentId === st.studentId ? { ...s, endDate: v } : s,
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="cfp-stud-cell cfp-stud-cell-disc">
                          <AppSelect
                            value={st.discountId || ''}
                            onChange={(v) =>
                              patch({
                                students: draft.students.map((s) =>
                                  s.studentId === st.studentId
                                    ? { ...s, discountId: v || undefined }
                                    : s,
                                ),
                              })
                            }
                            options={[
                              { value: '', label: 'None' },
                              ...discounts.map((d) => ({ value: d.id, label: d.name })),
                            ]}
                          />
                          <em
                            className={`cfp-stud-disc-hint${st.discountId ? ' is-on' : ''}`}
                          >
                            {st.discountId
                              ? `− ${formatInrAmount(est.invoiceDiscount)} applied`
                              : '\u00a0'}
                          </em>
                        </div>
                        <div className="cfp-stud-cell cfp-stud-cell-est">
                          <strong>{formatInrAmount(est.total)}</strong>
                          <span>
                            {draft.taxMode === 'inclusive' ? 'Incl. tax' : 'Excl. tax'}
                          </span>
                        </div>
                        <div className="cfp-stud-cell cfp-stud-cell-action">
                          <button
                            type="button"
                            className="cfp-preview-stud-btn"
                            aria-label={`Preview invoice for ${st.studentName}`}
                            title="Preview invoice"
                            onClick={() => openStudentPreview(st.studentId)}
                          >
                            <Eye size={16} />
                            <span>Preview</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {draft.students.length > 0 ? (
              <button
                type="button"
                className="cfp-link cfp-add-stud-link"
                onClick={() => setPickOpen(true)}
              >
                <Plus size={14} style={{ verticalAlign: -2 }} /> Add Students
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal
        open={pickOpen}
        title="Select Students"
        onClose={() => {
          setPickOpen(false);
          setPickIds([]);
        }}
        wide
        icon={<Users size={18} />}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setPickOpen(false);
                setPickIds([]);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!pickIds.length}
              onClick={addPickedStudents}
            >
              Apply{pickIds.length ? ` (${pickIds.length})` : ''}
            </button>
          </>
        }
      >
        <div className="cfp-pick">
          <div className="cfp-pick-filters">
            <AppSelect
              value={pickRoom}
              onChange={setPickRoom}
              searchable
              options={[
                { value: 'All Classroom', label: 'All Classroom' },
                ...ROOM_OPTIONS.map((r) => ({ value: r.name, label: r.name })),
              ]}
            />
            <div className="cfp-pick-filters-2">
              <AppSelect
                value={pickGroup}
                onChange={setPickGroup}
                options={[
                  { value: 'All Group', label: 'All Group' },
                  ...GROUP_OPTIONS.map((g) => ({ value: g.name, label: g.name })),
                ]}
              />
              <AppSelect
                value={pickProgram}
                onChange={setPickProgram}
                searchable
                options={[
                  { value: 'All Programs', label: 'All Programs' },
                  ...PROGRAM_OPTIONS.map((p) => ({ value: p.name, label: p.name })),
                ]}
              />
            </div>
            <div className="cfp-pick-search">
              <Search size={16} aria-hidden />
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name"
                aria-label="Search students"
              />
            </div>
          </div>

          <div className="cfp-pick-sticky">
            <span className="cfp-pick-badge">{pickIds.length} selected</span>
            <button
              type="button"
              className="cfp-link"
              disabled={!selectablePick.length}
              onClick={selectAllPickable}
            >
              Select All
            </button>
          </div>

          {filteredPick.length === 0 ? (
            <div className="cfp-pick-empty">
              <h3>No students</h3>
              <p>Try another classroom, group, program, or search term.</p>
            </div>
          ) : (
            <div className="cfp-pick-list" role="listbox" aria-multiselectable>
              <AnimatePresence initial={false}>
                {filteredPick.map((s, idx) => {
                  const on = pickIds.includes(s.id);
                  const already = draft.students.some((x) => x.studentId === s.id);
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={on}
                      disabled={already}
                      className={`cfp-pick-row${on ? ' is-on' : ''}${already ? ' is-assigned' : ''}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2), ease }}
                      onClick={() => {
                        if (already) return;
                        setPickIds((ids) =>
                          on ? ids.filter((x) => x !== s.id) : [...ids, s.id],
                        );
                      }}
                    >
                      <span className="cfp-avatar">
                        {s.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.photoUrl} alt="" />
                        ) : (
                          initials(s.name)
                        )}
                      </span>
                      <span className="cfp-pick-name">
                        <strong>{s.name}</strong>
                        {already ? <em>Already assigned</em> : null}
                      </span>
                      <span className="cfp-pick-check" aria-hidden>
                        {on || already ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Modal>

      <FeeComponentModal
        open={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setItemModalLineId(null);
        }}
        onSaved={(row) => {
          const next = loadFeeComponents();
          setComponents(next);
          if (itemModalLineId) applyComponent(itemModalLineId, row);
          setItemModalOpen(false);
          setItemModalLineId(null);
        }}
      />

      <Modal
        open={Boolean(conditionLineId)}
        title="Add Condition"
        onClose={() => {
          setConditionLineId(null);
          setConditionDraft([]);
        }}
        wide
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setConditionLineId(null);
                setConditionDraft([]);
              }}
            >
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveConditions}>
              Save
            </button>
          </>
        }
      >
        <p className="cfp-cond-fee">
          Fee Component : <strong>{conditionLine?.name || 'Item'}</strong>
        </p>
        {conditionDraft.length === 0 ? (
          <div className="cfp-cond-empty">
            <p>You can specify conditions under which the item value will be applied.</p>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setConditionDraft([emptyCondition()])}
            >
              Add Condition
            </button>
          </div>
        ) : (
          <div className="cfp-cond-list">
            {conditionDraft.map((cond, idx) => (
              <div key={cond.id} className="cfp-cond-card">
                <div className="cfp-cond-card-head">
                  <strong>Condition {idx + 1}</strong>
                  <button
                    type="button"
                    className="cfp-del-btn is-soft"
                    aria-label={`Remove condition ${idx + 1}`}
                    onClick={() =>
                      setConditionDraft((rows) => rows.filter((r) => r.id !== cond.id))
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="cfp-cond-row">
                  <span>When</span>
                  <AppSelect
                    value={cond.attribute}
                    onChange={(v) =>
                      setConditionDraft((rows) =>
                        rows.map((r) => (r.id === cond.id ? { ...r, attribute: v } : r)),
                      )
                    }
                    options={[
                      { value: '', label: 'Select field' },
                      ...CONDITION_FIELDS,
                    ]}
                  />
                  <span>is</span>
                  <AppSelect
                    value={cond.operator}
                    onChange={(v) =>
                      setConditionDraft((rows) =>
                        rows.map((r) => (r.id === cond.id ? { ...r, operator: v } : r)),
                      )
                    }
                    options={[
                      { value: '', label: 'Select condition' },
                      ...CONDITION_OPS,
                    ]}
                  />
                  <input
                    className="ui-input"
                    value={cond.value}
                    onChange={(e) =>
                      setConditionDraft((rows) =>
                        rows.map((r) =>
                          r.id === cond.id ? { ...r, value: e.target.value } : r,
                        ),
                      )
                    }
                    placeholder="Enter value"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setConditionDraft((rows) => [...rows, emptyCondition()])}
            >
              Add Condition
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
