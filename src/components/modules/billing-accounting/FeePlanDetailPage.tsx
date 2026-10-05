'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileStack,
  Layers,
  Mail,
  MoreVertical,
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { ModulePageHeader } from '@/components/ui/ModulePageHeader';
import { Modal } from '@/components/ui/Modal';
import { AppMenu, AppSelect, DayDatePicker } from '@/components/modules/center-management/ui';
import {
  InvoicePdfPreviewSheet,
  type InvoicePdfPreviewData,
} from './InvoicePdfPreviewSheet';
import { loadInvoicePdfSettings } from '@/lib/billing-accounting/invoicePdfSettingsStore';
import { loadLabels } from '@/lib/center-management/labelsStore';
import {
  PROGRAM_OPTIONS,
  ROOM_OPTIONS,
  loadStudents,
  roomName,
} from '@/lib/center-management/studentsStore';
import type { Student } from '@/lib/center-management/types';
import {
  formatInr,
  loadCenterInvoices,
  loadDiscounts,
  resolveCenterInvoiceStatus,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { loadTaxRates } from '@/lib/billing-accounting/taxRatesStore';
import {
  deleteFeePlans,
  formatInrAmount,
  formatPlanDate,
  formatPlanPeriod,
  getFeePlanById,
  lineAmount,
  lineTaxAmount,
  lineTaxPercent,
  previewNextInvoice,
  summarizePlanLines,
  upsertFeePlan,
  type FeePlan,
  type FeePlanStudent,
} from '@/lib/billing-accounting/feePlansStore';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import '@/components/modules/attendance-leaves/student-attendance.css';
import './fee-plan-detail.css';
import './create-fee-plan.css';

type DetailTab = 'components' | 'students' | 'generated' | 'upcoming';

const ease = [0.22, 1, 0.36, 1] as const;

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'components', label: 'Fee Component Detail' },
  { id: 'students', label: 'Assigned Students' },
  { id: 'generated', label: 'Generated Invoices' },
  { id: 'upcoming', label: 'Upcoming Invoices' },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function statusBadgeClass(status: FeePlan['status']) {
  if (status === 'Active') return '';
  if (status === 'Completed') return ' is-done';
  if (status === 'Paused') return ' is-paused';
  return ' is-draft';
}

export function FeePlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = String(params?.id || '');

  const from = searchParams.get('from');
  const studentIdParam = searchParams.get('studentId')?.trim() || '';
  const billingTab = searchParams.get('billing') || 'fee-plan';

  const backTarget = useMemo(() => {
    if (from === 'student' && studentIdParam) {
      const billing = billingTab === 'fee-plan' || billingTab === 'upcoming' ? billingTab : 'fee-plan';
      return {
        href: `/center-management/students/${encodeURIComponent(studentIdParam)}?tab=Billing&billing=${billing}`,
        label: 'Back to Student',
      };
    }
    return {
      href: '/billing-accounting/fee-plan',
      label: 'Back to Fee Plan',
    };
  }, [from, studentIdParam, billingTab]);

  const returnQs = useMemo(() => {
    if (from !== 'student' || !studentIdParam) return '';
    const qs = new URLSearchParams({
      from: 'student',
      studentId: studentIdParam,
      billing: billingTab === 'upcoming' ? 'upcoming' : 'fee-plan',
    });
    return `?${qs.toString()}`;
  }, [from, studentIdParam, billingTab]);

  const [plan, setPlan] = useState<FeePlan | null>(null);
  const [tab, setTab] = useState<DetailTab>('components');
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupStudents, setSetupStudents] = useState<FeePlanStudent[]>([]);
  const [setupSelected, setSetupSelected] = useState<Set<string>>(new Set());
  const [pickOpen, setPickOpen] = useState(false);
  const [discountEditId, setDiscountEditId] = useState<string | null>(null);
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [studentQ, setStudentQ] = useState('');
  const [roomFilter, setRoomFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const [invQ, setInvQ] = useState('');
  const [invRoom, setInvRoom] = useState('All');
  const [invPage, setInvPage] = useState(1);

  const [pickerQ, setPickerQ] = useState('');
  const [pickerSelected, setPickerSelected] = useState<Set<string>>(new Set());
  const [pickerRoom, setPickerRoom] = useState('All');
  const [pickerStatus, setPickerStatus] = useState('All');
  const [pickerProgram, setPickerProgram] = useState('All');
  const [setupPage, setSetupPage] = useState(1);
  const [setupPageSize, setSetupPageSize] = useState(20);

  const allStudents = useMemo(() => loadStudents(), []);
  const studentMap = useMemo(() => {
    const m = new Map<string, Student>();
    for (const s of allStudents) m.set(s.id, s);
    return m;
  }, [allStudents]);

  const labels = useMemo(() => loadLabels(), []);
  const taxes = useMemo(() => loadTaxRates(), []);
  const discounts = useMemo(() => loadDiscounts(), []);

  const refresh = () => setPlan(getFeePlanById(id) || null);

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!plan) return;
    if (searchParams.get('assign') !== '1') return;
    setTab('students');
    setSetupStudents(plan.students.map((s) => ({ ...s })));
    setSetupSelected(new Set());
    setSetupPage(1);
    setSetupOpen(true);
    router.replace(`/billing-accounting/fee-plan/${id}${returnQs}`, { scroll: false });
  }, [plan, searchParams, id, router, returnQs]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const preview = useMemo(() => (plan ? previewNextInvoice(plan) : null), [plan]);
  const readyPreview = preview?.status === 'ready' ? preview : null;

  const totals = useMemo(
    () =>
      plan
        ? summarizePlanLines(plan.lines, plan.taxMode, plan.discountId)
        : {
            subTotal: 0,
            itemsDiscount: 0,
            invoiceDiscount: 0,
            withoutTax: 0,
            taxTotal: 0,
            tax: 0,
            total: 0,
          },
    [plan],
  );

  const enrichedStudents = useMemo(() => {
    if (!plan) return [];
    const q = studentQ.trim().toLowerCase();
    return plan.students
      .map((ps) => {
        const stu = studentMap.get(ps.studentId);
        const roomIds = stu?.roomIds ?? [];
        const status = stu?.status ?? 'Active';
        const nextDue = readyPreview?.dueDate || '';
        const nextInv = readyPreview?.generationDate || plan.nextInvoiceDate || '';
        const amount = totals.total;
        return { ...ps, roomIds, status, nextDue, nextInv, amount, photoUrl: stu?.photoUrl };
      })
      .filter((s) => {
        if (statusFilter !== 'All' && s.status !== statusFilter) return false;
        if (roomFilter !== 'All' && !s.roomIds.includes(roomFilter)) return false;
        if (!q) return true;
        return s.studentName.toLowerCase().includes(q);
      });
  }, [plan, studentMap, studentQ, roomFilter, statusFilter, readyPreview, totals.total]);

  const totalStudentPages = Math.max(1, Math.ceil(enrichedStudents.length / pageSize));
  const safeStudentPage = Math.min(page, totalStudentPages);
  const pageStudents = enrichedStudents.slice(
    (safeStudentPage - 1) * pageSize,
    safeStudentPage * pageSize,
  );

  const generatedInvoices = useMemo(() => {
    if (!plan) return [] as CenterInvoice[];
    const ids = new Set(plan.students.map((s) => s.studentId));
    const names = new Set(plan.students.map((s) => s.studentName.toLowerCase()));
    return loadCenterInvoices()
      .map((inv) => ({ ...inv, status: resolveCenterInvoiceStatus(inv) }))
      .filter((inv) => {
        if (inv.kind === 'upcoming') return false;
        const byId = ids.has(inv.studentId);
        const byName = names.has(inv.studentName.toLowerCase());
        return byId || byName;
      })
      .filter((inv) => {
        const q = invQ.trim().toLowerCase();
        if (q && !inv.studentName.toLowerCase().includes(q)) return false;
        if (invRoom !== 'All') {
          const stu = studentMap.get(inv.studentId);
          if (!stu?.roomIds.includes(invRoom)) return false;
        }
        return true;
      })
      .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  }, [plan, invQ, invRoom, studentMap]);

  const upcomingRows = useMemo(() => {
    if (!plan || !readyPreview) return [];
    const q = invQ.trim().toLowerCase();
    return plan.students
      .map((ps) => {
        const stu = studentMap.get(ps.studentId);
        return {
          ...ps,
          roomIds: stu?.roomIds ?? [],
          upcomingDate: readyPreview.generationDate,
          dueDate: readyPreview.dueDate,
          pending: totals.total,
          total: totals.total,
        };
      })
      .filter((r) => {
        if (q && !r.studentName.toLowerCase().includes(q)) return false;
        if (invRoom !== 'All' && !r.roomIds.includes(invRoom)) return false;
        return true;
      });
  }, [plan, readyPreview, invQ, invRoom, studentMap, totals.total]);

  const pickerRows = useMemo(() => {
    if (!plan) return [];
    const assigned = new Set(
      (setupOpen ? setupStudents : plan.students).map((s) => s.studentId),
    );
    const q = pickerQ.trim().toLowerCase();
    return allStudents.filter((s) => {
      if (assigned.has(s.id)) return false;
      if (pickerRoom !== 'All' && !s.roomIds.includes(pickerRoom)) return false;
      if (pickerStatus !== 'All' && s.status !== pickerStatus) return false;
      if (pickerProgram !== 'All' && !s.programIds?.includes(pickerProgram)) return false;
      if (!q) return true;
      return `${s.name} ${s.preferredName || ''}`.toLowerCase().includes(q);
    });
  }, [
    allStudents,
    plan,
    pickerQ,
    setupOpen,
    setupStudents,
    pickerRoom,
    pickerStatus,
    pickerProgram,
  ]);

  const pickerAllSelected =
    pickerRows.length > 0 && pickerRows.every((s) => pickerSelected.has(s.id));

  const togglePickerSelectAll = () => {
    if (pickerAllSelected) {
      setPickerSelected(new Set());
      return;
    }
    setPickerSelected(new Set(pickerRows.map((s) => s.id)));
  };

  const setupTotalPages = Math.max(1, Math.ceil(setupStudents.length / setupPageSize));
  const safeSetupPage = Math.min(setupPage, setupTotalPages);
  const setupPageRows = setupStudents.slice(
    (safeSetupPage - 1) * setupPageSize,
    safeSetupPage * setupPageSize,
  );

  const formatPreviewLongDate = (iso: string) => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const invoicePreviewData = useMemo((): InvoicePdfPreviewData | null => {
    if (!plan || !previewOpen) return null;
    const stu = setupStudents.find((s) => s.studentId === previewStudentId);
    const effectiveDiscountId = stu?.discountId || plan.discountId;
    const previewTotals = summarizePlanLines(plan.lines, plan.taxMode, effectiveDiscountId);
    const taxMap = new Map<string, { name: string; rate: number; amount: number }>();
    for (const line of plan.lines) {
      for (const tid of line.taxRateIds) {
        const t = taxes.find((x) => x.id === tid);
        if (!t) continue;
        const amt = lineTaxAmount({ ...line, taxRateIds: [tid] }, plan.taxMode);
        const prev = taxMap.get(tid);
        if (prev) prev.amount += amt;
        else taxMap.set(tid, { name: t.name, rate: t.rate, amount: amt });
      }
    }
    return {
      dueAmount: previewTotals.total,
      dueDateLabel: formatPreviewLongDate(readyPreview?.dueDate || ''),
      studentName: stu?.studentName || 'Sample Student',
      className: plan.programName || '—',
      motherName: '—',
      fatherName: '—',
      invoiceNumber: stu ? `PREVIEW-${stu.studentId.slice(-4)}` : 'PREVIEW',
      dateIssued: formatPreviewLongDate(readyPreview?.generationDate || ''),
      dueDate: formatPreviewLongDate(readyPreview?.dueDate || ''),
      billingPeriod: readyPreview
        ? `${formatPreviewLongDate(readyPreview.periodStart)} - ${formatPreviewLongDate(readyPreview.periodEnd)}`
        : '—',
      lines: plan.lines.map((line) => ({
        name: line.name || 'Item',
        description: line.description || line.category,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxPercent: lineTaxPercent(line),
        amount: line.quantity * line.unitPrice,
      })),
      taxRows: taxMap.size
        ? [...taxMap.values()]
        : [{ name: 'GST', rate: 0, amount: 0 }],
      subtotal: previewTotals.subTotal,
      discount: previewTotals.itemsDiscount + previewTotals.invoiceDiscount,
      total: previewTotals.total,
    };
  }, [plan, previewOpen, previewStudentId, readyPreview, setupStudents, taxes]);

  if (!plan) {
    return (
      <div className="fpd">
        <ModulePageHeader
          section="BILLING & ACCOUNTING"
          title="Fee Plan"
          description="Plan not found."
          icon={<Receipt size={20} />}
          actions={
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => router.push(backTarget.href)}
            >
              <ArrowLeft size={15} />
              {backTarget.label}
            </button>
          }
        />
      </div>
    );
  }

  const labelNames = plan.labelIds
    .map((lid) => labels.find((l) => l.id === lid)?.name)
    .filter(Boolean) as string[];

  if (previewOpen && invoicePreviewData) {
    const previewStudentName =
      setupStudents.find((s) => s.studentId === previewStudentId)?.studentName || null;
    return (
      <div className="fpd fpd-preview-root">
        <ModulePageHeader
          section="BILLING & ACCOUNTING"
          title="Preview Invoice"
          description={
            previewStudentName
              ? `${previewStudentName} · ${plan.name}`
              : `${plan.name} preview`
          }
          icon={<Receipt size={20} />}
          actions={
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setPreviewOpen(false);
                setPreviewStudentId(null);
              }}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          }
        />
        <InvoicePdfPreviewSheet
          settings={loadInvoicePdfSettings()}
          data={invoicePreviewData}
        />
      </div>
    );
  }

  const toggleSelectAll = () => {
    const ids = pageStudents.map((s) => s.studentId);
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      const allOn = ids.length > 0 && ids.every((id) => next.has(id));
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const removeSelected = () => {
    if (!selectedStudents.size) return;
    const nextStudents = plan.students.filter((s) => !selectedStudents.has(s.studentId));
    upsertFeePlan({ ...plan, students: nextStudents });
    setSelectedStudents(new Set());
    refresh();
    setToast('Students unassigned');
  };

  const studentEstimate = (studentDiscountId?: string) =>
    summarizePlanLines(plan.lines, plan.taxMode, studentDiscountId || plan.discountId);

  const openStudentPreview = (studentId: string) => {
    setPreviewStudentId(studentId);
    setPreviewOpen(true);
  };

  const openAssignSetup = () => {
    setTab('students');
    setSetupStudents(plan.students.map((s) => ({ ...s })));
    setSetupSelected(new Set());
    setSetupPage(1);
    setSetupOpen(true);
  };

  const closeAssignSetup = () => {
    setSetupOpen(false);
    setSetupSelected(new Set());
    setPickOpen(false);
    setDiscountEditId(null);
    setPreviewOpen(false);
    setPreviewStudentId(null);
  };

  const saveAssignSetup = () => {
    if (!plan) return;
    upsertFeePlan({ ...plan, students: setupStudents });
    refresh();
    closeAssignSetup();
    setToast('Assigned students saved');
  };

  const patchSetupStudent = (studentId: string, patch: Partial<FeePlanStudent>) => {
    setSetupStudents((rows) =>
      rows.map((s) => (s.studentId === studentId ? { ...s, ...patch } : s)),
    );
  };

  const removeSetupSelected = () => {
    if (!setupSelected.size) return;
    setSetupStudents((rows) => rows.filter((s) => !setupSelected.has(s.studentId)));
    setSetupSelected(new Set());
  };

  const openStudentPicker = () => {
    setPickerSelected(new Set());
    setPickerQ('');
    setPickerRoom('All');
    setPickerStatus('All');
    setPickerProgram('All');
    setPickOpen(true);
  };

  const addPickedToSetup = () => {
    if (!plan || !pickerSelected.size) return;
    const additions: FeePlanStudent[] = [...pickerSelected].map((sid) => {
      const stu = studentMap.get(sid);
      const name = stu?.name?.trim() || 'Student';
      return {
        studentId: sid,
        studentName: name,
        startDate: plan.periodStart || todayIso(),
        endDate: plan.periodEnd || plan.periodStart || todayIso(),
      };
    });
    setSetupStudents((rows) => [...rows, ...additions]);
    setPickOpen(false);
    setPickerSelected(new Set());
    setPickerQ('');
    setToast(
      additions.length === 1
        ? 'Student added'
        : `${additions.length} students added`,
    );
  };

  const toastNode =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {toast ? (
              <motion.div
                className="fpd-toast"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.22, ease }}
                role="status"
              >
                <CheckCircle2 size={18} />
                {toast}
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  const invoiceFilters = (
    <div className="fpd-toolbar">
      <div className="fpd-field">
        <label>Search</label>
        <div className="fpd-search">
          <Search size={16} aria-hidden />
          <input
            value={invQ}
            onChange={(e) => {
              setInvQ(e.target.value);
              setInvPage(1);
            }}
            placeholder="Search By Student Name"
            aria-label="Search by student name"
          />
        </div>
      </div>
      <div className="fpd-field" style={{ maxWidth: 200 }}>
        <label>Room</label>
        <AppSelect
          value={invRoom}
          onChange={(v) => {
            setInvRoom(v);
            setInvPage(1);
          }}
          options={[
            { value: 'All', label: 'All Rooms' },
            ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
          ]}
        />
      </div>
    </div>
  );

  return (
    <div className="fpd">
      {toastNode}
      <div className="fpd-atmosphere" aria-hidden>
        <span className="fpd-atmosphere__blob fpd-atmosphere__blob--a" />
        <span className="fpd-atmosphere__blob fpd-atmosphere__blob--b" />
        <span className="fpd-atmosphere__blob fpd-atmosphere__blob--c" />
      </div>

      <AnimatePresence mode="wait">
        {setupOpen ? (
          <motion.div
            key="assign-setup"
            className="fpd-setup"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.38, ease }}
          >
            <div className="fpd-setup__head">
              <div className="fpd-setup__title-block">
                <button
                  type="button"
                  className="fpd-setup__back"
                  onClick={closeAssignSetup}
                  aria-label="Back to fee plan detail"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h2>Edit Fee Plan</h2>
                  <p>
                    <Users size={14} />
                    {setupSelected.size > 0
                      ? `${setupSelected.size} student${setupSelected.size === 1 ? '' : 's'} selected`
                      : `${setupStudents.length} student${setupStudents.length === 1 ? '' : 's'} assigned`}
                  </p>
                </div>
              </div>
              <div className="fpd-setup__actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  onClick={openStudentPicker}
                >
                  <Plus size={15} />
                  Add Students
                </button>
                <AppMenu
                  align="end"
                  minWidth={180}
                  items={[
                    {
                      id: 'remove',
                      label: 'Remove selected',
                      icon: <Trash2 size={15} />,
                      danger: true,
                      disabled: setupSelected.size === 0,
                      onSelect: removeSetupSelected,
                    },
                  ]}
                  trigger={({ buttonProps }) => (
                    <button type="button" className="ui-btn ui-btn-outline" {...buttonProps}>
                      Actions
                      <ChevronDown size={15} />
                    </button>
                  )}
                />
                <button type="button" className="ui-btn ui-btn-outline" onClick={closeAssignSetup}>
                  Cancel
                </button>
                <button type="button" className="ui-btn ui-btn-primary" onClick={saveAssignSetup}>
                  Save
                </button>
              </div>
            </div>

            <motion.div
              className="fpd-setup__panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.32 }}
            >
              {setupStudents.length === 0 ? (
                <div className="fpd-empty fpd-setup__empty">
                  <div className="fpd-empty__art">
                    <Users size={26} />
                  </div>
                  <h3>No students assigned</h3>
                  <p>Add students to this fee plan. Set start/end dates and optional discounts.</p>
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={openStudentPicker}
                  >
                    <Plus size={15} />
                    Add Students
                  </button>
                </div>
              ) : (
                <>
                  <div className="fpd-setup__select-bar">
                    <label className="fpd-pick__select-all">
                      <input
                        type="checkbox"
                        checked={
                          setupPageRows.length > 0 &&
                          setupPageRows.every((s) => setupSelected.has(s.studentId))
                        }
                        onChange={() => {
                          const ids = setupPageRows.map((s) => s.studentId);
                          setSetupSelected((prev) => {
                            const next = new Set(prev);
                            const allOn = ids.every((id) => next.has(id));
                            if (allOn) ids.forEach((id) => next.delete(id));
                            else ids.forEach((id) => next.add(id));
                            return next;
                          });
                        }}
                      />
                      <span>Select All</span>
                      <em>
                        {setupSelected.size
                          ? `${setupSelected.size} selected`
                          : `${setupStudents.length} assigned`}
                      </em>
                    </label>
                  </div>

                  <div className="cfp-stud-table fpd-setup-stud-table">
                    <div className="cfp-stud-head" role="row">
                      <span aria-hidden />
                      <span>Student Name</span>
                      <span>Start Date</span>
                      <span>End Date</span>
                      <span>Discount</span>
                      <span>Est. Invoice</span>
                      <span>Preview</span>
                    </div>
                    <AnimatePresence initial={false}>
                      {setupPageRows.map((s, i) => {
                        const est = studentEstimate(s.discountId);
                        const selected = setupSelected.has(s.studentId);
                        return (
                          <motion.div
                            key={s.studentId}
                            className={`cfp-stud-row${selected ? ' is-selected' : ''}`}
                            role="row"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{
                              delay: Math.min(i * 0.04, 0.24),
                              duration: 0.28,
                              ease,
                            }}
                            layout
                          >
                            <div className="cfp-stud-cell fpd-setup-check">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  setSetupSelected((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(s.studentId)) next.delete(s.studentId);
                                    else next.add(s.studentId);
                                    return next;
                                  })
                                }
                                aria-label={`Select ${s.studentName}`}
                              />
                            </div>
                            <div className="cfp-stud-cell cfp-stud-cell-who">
                              <span className="cfp-avatar">{initials(s.studentName)}</span>
                              <strong>{s.studentName}</strong>
                            </div>
                            <div className="cfp-stud-cell">
                              <DayDatePicker
                                value={s.startDate}
                                onChange={(v) =>
                                  patchSetupStudent(s.studentId, { startDate: v })
                                }
                              />
                            </div>
                            <div className="cfp-stud-cell">
                              <DayDatePicker
                                value={s.endDate}
                                onChange={(v) =>
                                  patchSetupStudent(s.studentId, { endDate: v })
                                }
                              />
                            </div>
                            <div className="cfp-stud-cell cfp-stud-cell-disc">
                              <AppSelect
                                value={s.discountId || ''}
                                onChange={(v) =>
                                  patchSetupStudent(s.studentId, {
                                    discountId: v || undefined,
                                  })
                                }
                                options={[
                                  { value: '', label: 'None' },
                                  ...discounts.map((d) => ({ value: d.id, label: d.name })),
                                ]}
                              />
                              <em
                                className={`cfp-stud-disc-hint${s.discountId ? ' is-on' : ''}`}
                              >
                                {s.discountId
                                  ? `− ${formatInrAmount(est.invoiceDiscount)} applied`
                                  : '\u00a0'}
                              </em>
                            </div>
                            <div className="cfp-stud-cell cfp-stud-cell-est">
                              <strong>{formatInrAmount(est.total)}</strong>
                              <span>
                                {plan.taxMode === 'inclusive' ? 'Incl. tax' : 'Excl. tax'}
                              </span>
                            </div>
                            <div className="cfp-stud-cell cfp-stud-cell-action">
                              <button
                                type="button"
                                className="cfp-preview-stud-btn"
                                aria-label={`Preview invoice for ${s.studentName}`}
                                title="Preview invoice"
                                onClick={() => openStudentPreview(s.studentId)}
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
                  <div className="fpd-footer fpd-setup__footer">
                    <span>
                      Showing{' '}
                      {setupStudents.length === 0
                        ? 0
                        : (safeSetupPage - 1) * setupPageSize + 1}
                      –{Math.min(safeSetupPage * setupPageSize, setupStudents.length)} of{' '}
                      {setupStudents.length} results
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline"
                        disabled={safeSetupPage <= 1}
                        onClick={() => setSetupPage((p) => Math.max(1, p - 1))}
                      >
                        ‹
                      </button>
                      <span className="fpd-setup__page-pill">{safeSetupPage}</span>
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline"
                        disabled={safeSetupPage >= setupTotalPages}
                        onClick={() => setSetupPage((p) => Math.min(setupTotalPages, p + 1))}
                      >
                        ›
                      </button>
                      <AppSelect
                        value={String(setupPageSize)}
                        onChange={(v) => {
                          setSetupPageSize(Number(v));
                          setSetupPage(1);
                        }}
                        options={[
                          { value: '10', label: '10 / page' },
                          { value: '20', label: '20 / page' },
                          { value: '30', label: '30 / page' },
                        ]}
                        align="end"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="fpd-setup__add-link"
                    onClick={openStudentPicker}
                  >
                    <Plus size={15} />
                    Add Students
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease }}
            className="fpd-detail-view"
          >
      <ModulePageHeader
        section="BILLING & ACCOUNTING"
        title={plan.name}
        description="Fee Plan › Fee Plan Detail"
        icon={<Layers size={20} />}
        actions={
          <div className="fpd-actions">
            <span className={`fpd-title-badge${statusBadgeClass(plan.status)}`}>
              <i aria-hidden />
              Plan {plan.status}
            </span>
            <AppMenu
              align="end"
              minWidth={200}
              items={[
                {
                  id: 'one-time',
                  label: 'One-time invoice',
                  icon: <FileStack size={15} />,
                  onSelect: () =>
                    router.push(`/billing-accounting/invoices/create?planId=${plan.id}`),
                },
                {
                  id: 'recurring',
                  label: 'Recurring invoice',
                  icon: <RefreshCw size={15} />,
                  onSelect: () =>
                    router.push(
                      `/billing-accounting/invoices/create?planId=${plan.id}&mode=recurring`,
                    ),
                },
                {
                  id: 'customize',
                  label: 'Customize invoice',
                  icon: <Sparkles size={15} />,
                  onSelect: () => router.push('/billing-accounting/invoices/customize-pdf'),
                },
              ]}
              trigger={({ buttonProps }) => (
                <button type="button" className="ui-btn ui-btn-primary fpd-preview-btn" {...buttonProps}>
                  Preview Invoice
                  <ChevronDown size={15} />
                </button>
              )}
            />
            <AppMenu
              align="end"
              minWidth={170}
              items={[
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: <Pencil size={15} />,
                  onSelect: () =>
                    router.push(`/billing-accounting/fee-plan/create?edit=${plan.id}`),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: <Trash2 size={15} />,
                  danger: true,
                  onSelect: () => setDeleteOpen(true),
                },
              ]}
              trigger={({ buttonProps }) => (
                <button
                  type="button"
                  className="fpd-icon-btn fpd-icon-btn--lg"
                  aria-label="Plan actions"
                  {...buttonProps}
                >
                  <MoreVertical size={16} />
                </button>
              )}
            />
            <button
              type="button"
              className="ui-btn ui-btn-outline fpd-back-btn"
              onClick={() => router.push(backTarget.href)}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>
        }
      />

      <motion.section
        className="fpd-card fpd-overview"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <button
          type="button"
          className="fpd-overview-toggle"
          onClick={() => setOverviewOpen((v) => !v)}
          aria-expanded={overviewOpen}
        >
          <strong>Fee Plan Overview</strong>
          <span className="fpd-overview-hide">
            {overviewOpen ? 'Hide' : 'Show'}
            <ChevronDown
              size={15}
              className={overviewOpen ? 'is-open' : undefined}
              aria-hidden
            />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {overviewOpen ? (
            <motion.div
              className="fpd-overview-body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="fpd-chips">
                <span className="fpd-chip">
                  <CalendarRange size={14} />
                  {formatPlanPeriod(plan.periodStart, plan.periodEnd)}
                </span>
                <span className="fpd-chip">
                  <RefreshCw size={14} />
                  {plan.frequency} Billing
                </span>
                <span className="fpd-chip">Billing Period : {plan.billingPeriod}</span>
                <span className="fpd-chip">{plan.programName || '—'}</span>
                {plan.emailParent ? (
                  <span className="fpd-chip">
                    <Mail size={14} />
                    Send invoice via email to parent
                  </span>
                ) : null}
                {labelNames.map((n) => (
                  <span key={n} className="fpd-chip">
                    {n}
                  </span>
                ))}
              </div>
              <p className="fpd-next">
                Next Invoice Details:{' '}
                {readyPreview ? (
                  <>
                    Your invoice will be generated on{' '}
                    <strong>{formatPlanDate(readyPreview.generationDate)}</strong> due on{' '}
                    <strong>{formatPlanDate(readyPreview.dueDate)}</strong> for the period of{' '}
                    <strong>{formatPlanDate(readyPreview.periodStart)}</strong> to{' '}
                    <strong>{formatPlanDate(readyPreview.periodEnd)}</strong>.
                  </>
                ) : (
                  preview?.message || 'No upcoming invoices.'
                )}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.section>

      <motion.section
        className="fpd-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease, delay: 0.06 }}
      >
        <div className="fpd-tabs" role="tablist" aria-label="Fee plan detail sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`fpd-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {tab === t.id ? (
                <motion.span
                  className="fpd-tab__ink"
                  layoutId="fpd-tab-ink"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <div className="fpd-panel">
          <AnimatePresence mode="wait">
            {tab === 'components' ? (
              <motion.div
                key="components"
                className="fpd-components"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                <div className="fpd-table-wrap">
                  <table className="fpd-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Tax</th>
                        <th>
                          Amount {plan.taxMode === 'inclusive' ? '(Incl. Tax)' : '(Excl. Tax)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.lines.map((line, i) => (
                        <motion.tr
                          key={line.id}
                          className="fpd-row"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <td>
                            <strong>{line.name}</strong>
                            {line.description ? (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                                {line.description}
                              </div>
                            ) : null}
                          </td>
                          <td>{line.category}</td>
                          <td>{line.quantity}</td>
                          <td>{formatInrAmount(line.unitPrice)}</td>
                          <td>{lineTaxPercent(line) ? `${lineTaxPercent(line)} %` : '—'}</td>
                          <td className="fpd-amt">{formatInrAmount(lineAmount(line, plan.taxMode))}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="fpd-comp-footer">
                  <div className="fpd-totals" aria-label="Fee component totals">
                    {taxes.filter((t) => plan.lines.some((l) => l.taxRateIds.includes(t.id)))
                      .length > 0 ? (
                      <>
                        <div className="fpd-totals__section">
                          <span className="fpd-totals__kicker">Taxes</span>
                          {taxes
                            .filter((t) => plan.lines.some((l) => l.taxRateIds.includes(t.id)))
                            .map((t) => {
                              const amt = plan.lines.reduce((s, line) => {
                                if (!line.taxRateIds.includes(t.id)) return s;
                                return (
                                  s +
                                  lineTaxAmount({ ...line, taxRateIds: [t.id] }, plan.taxMode)
                                );
                              }, 0);
                              return (
                                <div key={t.id} className="fpd-totals__row">
                                  <span>
                                    {t.name} ({t.rate}%)
                                  </span>
                                  <strong>+ {formatInrAmount(amt)}</strong>
                                </div>
                              );
                            })}
                        </div>
                        <div className="fpd-totals__row">
                          <span>Sub Total</span>
                          <strong>{formatInrAmount(totals.subTotal)}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="fpd-totals__row">
                          <span>Sub Total</span>
                          <strong>{formatInrAmount(totals.subTotal)}</strong>
                        </div>
                        <div className="fpd-totals__row">
                          <span>Items Discount</span>
                          <strong>{formatInrAmount(totals.itemsDiscount)}</strong>
                        </div>
                      </>
                    )}
                    {totals.invoiceDiscount > 0 ? (
                      <div className="fpd-totals__row">
                        <span>Discount</span>
                        <strong>− {formatInrAmount(totals.invoiceDiscount)}</strong>
                      </div>
                    ) : null}
                    <div className="fpd-totals__row is-total">
                      <span>Total Amount</span>
                      <strong>{formatInrAmount(totals.total)}</strong>
                    </div>
                  </div>
                </div>

                <div className="fpd-notes">
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="fpd-school-notes">
                      School Notes (Not visible to parents*)
                    </label>
                    <textarea
                      id="fpd-school-notes"
                      className="ui-textarea"
                      rows={2}
                      value={plan.schoolNotes || ''}
                      placeholder="Add school notes…"
                      onChange={(e) => {
                        const schoolNotes = e.target.value;
                        setPlan({ ...plan, schoolNotes });
                      }}
                      onBlur={(e) => {
                        upsertFeePlan({ ...plan, schoolNotes: e.target.value });
                        refresh();
                      }}
                    />
                  </div>
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="fpd-parent-notes">
                      Parent Notes (Visible to parents*)
                    </label>
                    <textarea
                      id="fpd-parent-notes"
                      className="ui-textarea"
                      rows={2}
                      value={plan.parentNotes || ''}
                      placeholder="No notes added"
                      onChange={(e) => {
                        const parentNotes = e.target.value;
                        setPlan({ ...plan, parentNotes });
                      }}
                      onBlur={(e) => {
                        upsertFeePlan({ ...plan, parentNotes: e.target.value });
                        refresh();
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}

            {tab === 'students' ? (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                <div className="fpd-toolbar">
                  <div className="fpd-field">
                    <label>Search</label>
                    <div className="fpd-search">
                      <Search size={16} aria-hidden />
                      <input
                        value={studentQ}
                        onChange={(e) => {
                          setStudentQ(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search By Student Name"
                      />
                    </div>
                  </div>
                  <div className="fpd-field" style={{ maxWidth: 180 }}>
                    <label>Room</label>
                    <AppSelect
                      value={roomFilter}
                      onChange={(v) => {
                        setRoomFilter(v);
                        setPage(1);
                      }}
                      options={[
                        { value: 'All', label: 'All Rooms' },
                        ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
                      ]}
                    />
                  </div>
                  <div className="fpd-field" style={{ maxWidth: 160 }}>
                    <label>Status</label>
                    <AppSelect
                      value={statusFilter}
                      onChange={(v) => {
                        setStatusFilter(v);
                        setPage(1);
                      }}
                      options={[
                        { value: 'All', label: 'All' },
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' },
                        { value: 'On Hold', label: 'On Hold' },
                      ]}
                    />
                  </div>
                  <div className="fpd-toolbar__actions">
                    <AppMenu
                      align="end"
                      minWidth={180}
                      items={[
                        {
                          id: 'unassign',
                          label: 'Unassign selected',
                          icon: <Trash2 size={15} />,
                          danger: true,
                          disabled: selectedStudents.size === 0,
                          onSelect: removeSelected,
                        },
                      ]}
                      trigger={({ buttonProps }) => (
                        <button type="button" className="ui-btn ui-btn-outline" {...buttonProps}>
                          Actions
                          <ChevronDown size={15} />
                        </button>
                      )}
                    />
                    <button
                      type="button"
                      className="ui-btn ui-btn-primary"
                      onClick={openAssignSetup}
                    >
                      <Plus size={15} />
                      Assign Students
                    </button>
                  </div>
                </div>

                {pageStudents.length === 0 ? (
                  <div className="fpd-empty">
                    <div className="fpd-empty__art">
                      <Users size={24} />
                    </div>
                    <h3>No Data</h3>
                    <p>No students match these filters. Assign students to this fee plan.</p>
                  </div>
                ) : (
                  <>
                    <div className="fpd-table-wrap">
                      <table className="fpd-table">
                        <thead>
                          <tr>
                            <th style={{ width: 44 }}>
                              <input
                                type="checkbox"
                                checked={
                                  pageStudents.length > 0 &&
                                  pageStudents.every((s) => selectedStudents.has(s.studentId))
                                }
                                onChange={toggleSelectAll}
                                aria-label="Select all on page"
                              />
                            </th>
                            <th>Student Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Next Invoice Date</th>
                            <th>Next Due Date</th>
                            <th>Next Due Amount</th>
                            <th aria-label="Actions" />
                          </tr>
                        </thead>
                        <tbody>
                          {pageStudents.map((s, i) => {
                            const open = expandedId === s.studentId;
                            return (
                              <AnimatePresence key={s.studentId} initial={false}>
                                <motion.tr
                                  className={`fpd-row${open ? ' is-open' : ''}`}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: Math.min(i * 0.04, 0.24) }}
                                >
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.has(s.studentId)}
                                      onChange={() =>
                                        setSelectedStudents((prev) => {
                                          const next = new Set(prev);
                                          if (next.has(s.studentId)) next.delete(s.studentId);
                                          else next.add(s.studentId);
                                          return next;
                                        })
                                      }
                                      aria-label={`Select ${s.studentName}`}
                                    />
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="fpd-student"
                                      style={{
                                        border: 0,
                                        background: 'transparent',
                                        padding: 0,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        font: 'inherit',
                                      }}
                                      onClick={() =>
                                        setExpandedId((cur) =>
                                          cur === s.studentId ? null : s.studentId,
                                        )
                                      }
                                    >
                                      <span className="fpd-avatar">{initials(s.studentName)}</span>
                                      <span>
                                        <strong>{s.studentName}</strong>
                                        <em>
                                          <i />
                                          {s.status}
                                        </em>
                                      </span>
                                    </button>
                                  </td>
                                  <td>{formatPlanDate(s.startDate)}</td>
                                  <td>{formatPlanDate(s.endDate)}</td>
                                  <td>{formatPlanDate(s.nextInv)}</td>
                                  <td>{formatPlanDate(s.nextDue)}</td>
                                  <td className="fpd-amt">{formatInrAmount(s.amount)}</td>
                                  <td>
                                    <div className="fpd-row-actions">
                                      <button
                                        type="button"
                                        className="fpd-icon-btn"
                                        aria-label={`Edit ${s.studentName}`}
                                        onClick={() =>
                                          router.push(
                                            `/billing-accounting/fee-plan/create?edit=${plan.id}`,
                                          )
                                        }
                                      >
                                        <Pencil size={14} />
                                      </button>
                                      <AppMenu
                                        align="end"
                                        minWidth={160}
                                        items={[
                                          {
                                            id: 'expand',
                                            label: open ? 'Hide components' : 'View components',
                                            onSelect: () =>
                                              setExpandedId((cur) =>
                                                cur === s.studentId ? null : s.studentId,
                                              ),
                                          },
                                          {
                                            id: 'remove',
                                            label: 'Unassign',
                                            danger: true,
                                            icon: <Trash2 size={15} />,
                                            onSelect: () => {
                                              upsertFeePlan({
                                                ...plan,
                                                students: plan.students.filter(
                                                  (x) => x.studentId !== s.studentId,
                                                ),
                                              });
                                              refresh();
                                              setToast('Student unassigned');
                                            },
                                          },
                                        ]}
                                        trigger={({ buttonProps }) => (
                                          <button
                                            type="button"
                                            className="fpd-icon-btn"
                                            aria-label={`More for ${s.studentName}`}
                                            {...buttonProps}
                                          >
                                            <MoreVertical size={14} />
                                          </button>
                                        )}
                                      />
                                    </div>
                                  </td>
                                </motion.tr>
                                {open ? (
                                  <tr key={`${s.studentId}-exp`}>
                                    <td colSpan={8} className="fpd-expand">
                                      <motion.div
                                        className="fpd-expand__inner"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        <table>
                                          <thead>
                                            <tr>
                                              <th>Item Name</th>
                                              <th>Category</th>
                                              <th>Qty</th>
                                              <th>Unit Price</th>
                                              <th>Tax</th>
                                              <th>Amount</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {plan.lines.map((line) => (
                                              <tr key={line.id}>
                                                <td>
                                                  <strong>{line.name}</strong>
                                                  {discounts.find((d) => d.id === s.discountId)
                                                    ?.name ? (
                                                    <div
                                                      style={{
                                                        fontSize: 11,
                                                        color: '#94a3b8',
                                                        marginTop: 2,
                                                      }}
                                                    >
                                                      Discount:{' '}
                                                      {
                                                        discounts.find((d) => d.id === s.discountId)
                                                          ?.name
                                                      }
                                                    </div>
                                                  ) : null}
                                                </td>
                                                <td>{line.category}</td>
                                                <td>{line.quantity}</td>
                                                <td>{formatInrAmount(line.unitPrice)}</td>
                                                <td>
                                                  {lineTaxPercent(line)
                                                    ? `${lineTaxPercent(line)} %`
                                                    : '—'}
                                                </td>
                                                <td>
                                                  {formatInrAmount(lineAmount(line, plan.taxMode))}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        <div className="fpd-expand__flags">
                                          {plan.lines.some((l) => l.refundable) ? (
                                            <span>✓ Refundable items included</span>
                                          ) : (
                                            <span>Non-refundable components</span>
                                          )}
                                          <span>
                                            {plan.lines.every((l) => l.applyRule === 'always')
                                              ? 'Always Apply'
                                              : 'Conditional apply rules'}
                                          </span>
                                        </div>
                                      </motion.div>
                                    </td>
                                  </tr>
                                ) : null}
                              </AnimatePresence>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="fpd-footer">
                      <span>
                        Showing{' '}
                        {enrichedStudents.length === 0
                          ? 0
                          : (safeStudentPage - 1) * pageSize + 1}
                        –{Math.min(safeStudentPage * pageSize, enrichedStudents.length)} of{' '}
                        {enrichedStudents.length} results
                      </span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="ui-btn ui-btn-outline"
                          disabled={safeStudentPage <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          ‹
                        </button>
                        <span>
                          {safeStudentPage} / {totalStudentPages}
                        </span>
                        <button
                          type="button"
                          className="ui-btn ui-btn-outline"
                          disabled={safeStudentPage >= totalStudentPages}
                          onClick={() => setPage((p) => Math.min(totalStudentPages, p + 1))}
                        >
                          ›
                        </button>
                        <AppSelect
                          value={String(pageSize)}
                          onChange={(v) => {
                            setPageSize(Number(v));
                            setPage(1);
                          }}
                          options={[
                            { value: '10', label: '10 / page' },
                            { value: '30', label: '30 / page' },
                            { value: '50', label: '50 / page' },
                          ]}
                          align="end"
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : null}

            {tab === 'generated' ? (
              <motion.div
                key="generated"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                {invoiceFilters}
                {generatedInvoices.length === 0 ? (
                  <div className="fpd-empty">
                    <div className="fpd-empty__art">
                      <Receipt size={24} />
                    </div>
                    <h3>No Data</h3>
                    <p>Generated invoices for this plan will appear here.</p>
                  </div>
                ) : (
                  <div className="fpd-table-wrap">
                    <table className="fpd-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Invoice Date</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Pending</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedInvoices
                          .slice((invPage - 1) * pageSize, invPage * pageSize)
                          .map((inv, i) => (
                            <motion.tr
                              key={inv.id}
                              className="fpd-row"
                              style={{ cursor: 'pointer' }}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              onClick={() =>
                                router.push(`/billing-accounting/invoices/${inv.id}`)
                              }
                            >
                              <td>
                                <div className="fpd-student">
                                  <span className="fpd-avatar">
                                    {initials(inv.studentName)}
                                  </span>
                                  <strong>{inv.studentName}</strong>
                                </div>
                              </td>
                              <td>{formatPlanDate(inv.invoiceDate)}</td>
                              <td>{formatPlanDate(inv.dueDate)}</td>
                              <td>{inv.status}</td>
                              <td className="fpd-amt">{formatInr(inv.pendingAmount)}</td>
                              <td className="fpd-amt">{formatInr(inv.invoicedAmount)}</td>
                            </motion.tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : null}

            {tab === 'upcoming' ? (
              <motion.div
                key="upcoming"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease }}
              >
                {invoiceFilters}
                {upcomingRows.length === 0 ? (
                  <div className="fpd-empty">
                    <div className="fpd-empty__art">
                      <CalendarRange size={24} />
                    </div>
                    <h3>No Data</h3>
                    <p>Upcoming invoices for this plan will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div className="fpd-table-wrap">
                      <table className="fpd-table">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Upcoming Date</th>
                            <th>Due Date</th>
                            <th>Pending</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingRows.map((row, i) => (
                            <motion.tr
                              key={row.studentId}
                              className="fpd-row"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                            >
                              <td>
                                <div className="fpd-student">
                                  <span className="fpd-avatar">
                                    {initials(row.studentName)}
                                  </span>
                                  <strong>{row.studentName}</strong>
                                </div>
                              </td>
                              <td>{formatPlanDate(row.upcomingDate)}</td>
                              <td>{formatPlanDate(row.dueDate)}</td>
                              <td className="fpd-amt">{formatInrAmount(row.pending)}</td>
                              <td className="fpd-amt">{formatInrAmount(row.total)}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="fpd-footer">
                      <span>
                        Showing 1–{upcomingRows.length} of {upcomingRows.length} results
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={pickOpen}
        title="Assign Students"
        onClose={() => {
          setPickOpen(false);
          setPickerSelected(new Set());
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
                setPickerSelected(new Set());
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!pickerSelected.size}
              onClick={addPickedToSetup}
            >
              Assign {pickerSelected.size ? `(${pickerSelected.size})` : ''}
            </button>
          </>
        }
      >
        <div className="fpd-pick">
          <div className="fpd-pick__filters">
            <div className="fpd-pick__search">
              <Search size={16} aria-hidden />
              <input
                value={pickerQ}
                onChange={(e) => setPickerQ(e.target.value)}
                placeholder="Search students…"
                aria-label="Search students to assign"
              />
            </div>
            <AppSelect
              value={pickerRoom}
              onChange={setPickerRoom}
              searchable
              options={[
                { value: 'All', label: 'All Rooms' },
                ...ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
            <AppSelect
              value={pickerStatus}
              onChange={setPickerStatus}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'On Hold', label: 'On Hold' },
              ]}
            />
            <AppSelect
              value={pickerProgram}
              onChange={setPickerProgram}
              searchable
              options={[
                { value: 'All', label: 'All Programs' },
                ...PROGRAM_OPTIONS.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>

          <div className="fpd-pick__toolbar">
            <label className="fpd-pick__select-all">
              <input
                type="checkbox"
                checked={pickerAllSelected}
                onChange={togglePickerSelectAll}
                disabled={!pickerRows.length}
              />
              <span>Select All</span>
              <em>{pickerRows.length} available</em>
            </label>
            <motion.span
              key={pickerSelected.size}
              className="fpd-pick__badge"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {pickerSelected.size} selected
            </motion.span>
          </div>

          {pickerRows.length === 0 ? (
            <div className="fpd-empty" style={{ padding: '2rem 0.5rem' }}>
              <div className="fpd-empty__art">
                <Users size={22} />
              </div>
              <h3>No students found</h3>
              <p>Try another room, status, program, or search term.</p>
            </div>
          ) : (
            <div className="fpd-pick__grid" role="listbox" aria-multiselectable>
              <AnimatePresence initial={false}>
                {pickerRows.slice(0, 48).map((s, i) => {
                  const name = s.name.trim();
                  const on = pickerSelected.has(s.id);
                  const rooms =
                    s.roomIds.map((rid) => roomName(rid)).filter(Boolean).join(', ') ||
                    'No room';
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={`fpd-pick__card${on ? ' is-on' : ''}`}
                      initial={{ opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        delay: Math.min(i * 0.03, 0.28),
                        type: 'spring',
                        stiffness: 280,
                        damping: 24,
                      }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setPickerSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(s.id)) next.delete(s.id);
                          else next.add(s.id);
                          return next;
                        })
                      }
                    >
                      <span className="fpd-pick__check" aria-hidden>
                        {on ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                      <span className="fpd-pick__avatar">
                        {s.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.photoUrl} alt="" />
                        ) : (
                          initials(name)
                        )}
                      </span>
                      <span className="fpd-pick__meta">
                        <strong>{name}</strong>
                        <em>
                          {rooms} · {s.status}
                        </em>
                      </span>
                      <span className="fpd-pick__glow" aria-hidden />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(discountEditId)}
        title="Edit Discount"
        onClose={() => setDiscountEditId(null)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDiscountEditId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => setDiscountEditId(null)}
            >
              Done
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label">Discount</label>
          <AppSelect
            value={
              setupStudents.find((s) => s.studentId === discountEditId)?.discountId || ''
            }
            onChange={(v) => {
              if (!discountEditId) return;
              patchSetupStudent(discountEditId, { discountId: v || undefined });
            }}
            options={[
              { value: '', label: 'None' },
              ...discounts.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        title="Delete Fee Plan"
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={() => {
                deleteFeePlans([plan.id]);
                router.push(backTarget.href);
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Delete “{plan.name}”? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
