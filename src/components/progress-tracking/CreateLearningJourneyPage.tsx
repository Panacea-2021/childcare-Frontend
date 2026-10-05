'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDownUp, CalendarDays, ChevronDown, Route } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  DEFAULT_PDF_SETTINGS,
  loadLearningJourneys,
  saveLearningJourneys,
  type LearningJourney,
  type PdfSettings,
} from '@/lib/mock/mockLearningJourney';
import { loadObservations } from '@/lib/mock/mockObservations';
import { resolveLessonTitle } from '@/lib/mock/lessonResolve';
import {
  PROGRESS_STUDENTS,
  STATUS_META,
} from '@/lib/mock/mockProgressTracking';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

type SortBy = 'created' | 'date';
type StatusFilter = 'all' | 'introduced' | 'practiced' | 'mastered';

const SORT_OPTIONS = [
  { value: 'created', label: 'Created date' },
  { value: 'date', label: 'Observation date' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'introduced', label: 'Introduced' },
  { value: 'practiced', label: 'Practiced' },
  { value: 'mastered', label: 'Mastered' },
];

function todayKey() {
  return '2026-08-03';
}

function yearAgoKey() {
  return '2025-08-03';
}

function formatRangeLabel(from: string, to: string) {
  const fmt = (k: string) => {
    const d = new Date(`${k}T12:00:00`);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  return `${fmt(from)} - ${fmt(to)}`;
}

function DateRangeField({
  dateFrom,
  dateTo,
  onChangeFrom,
  onChangeTo,
}: {
  dateFrom: string;
  dateTo: string;
  onChangeFrom: (v: string) => void;
  onChangeTo: (v: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const width = Math.max(r.width, 280);
      const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
      setPos({ top: r.bottom + 6, left, width });
    };
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="ui-field lj-date-field" ref={wrapRef}>
      <span className="ui-label">Observation Date Range</span>
      <button
        type="button"
        className={`lj-date-trigger${open ? ' is-open' : ''}`}
        aria-label="Observation date range"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarDays size={16} aria-hidden />
        <span>{formatRangeLabel(dateFrom, dateTo)}</span>
        <ChevronDown size={16} className="lj-date-chevron" aria-hidden />
      </button>

      {mounted &&
        open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            className="lj-date-panel"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="ui-field">
              <label className="ui-label" htmlFor="lj-from">
                From
              </label>
              <input
                id="lj-from"
                className="ui-input"
                type="date"
                value={dateFrom}
                max={dateTo}
                onChange={(e) => onChangeFrom(e.target.value)}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="lj-to">
                To
              </label>
              <input
                id="lj-to"
                className="ui-input"
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={(e) => onChangeTo(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => setOpen(false)}
            >
              Apply
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function CreateLearningJourneyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [studentId, setStudentId] = useState(PROGRESS_STUDENTS[0]?.id ?? '');
  const [dateFrom, setDateFrom] = useState(yearAgoKey());
  const [dateTo, setDateTo] = useState(todayKey());
  const [sortBy, setSortBy] = useState<SortBy>('created');
  const [sortAsc, setSortAsc] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [includeStaffOnly, setIncludeStaffOnly] = useState(true);
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>(DEFAULT_PDF_SETTINGS);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState<LearningJourney | null>(null);

  useEffect(() => {
    if (!editId) return;
    const found = loadLearningJourneys().find((j) => j.id === editId) ?? null;
    if (!found) return;
    setEditing(found);
    setStudentId(found.studentId);
    setDateFrom(found.dateFrom);
    setDateTo(found.dateTo);
    setIncludeStaffOnly(found.includeStaffOnly);
    setPdfSettings({
      showNextSteps: found.pdfShowNextSteps,
      showMilestones: found.pdfShowMilestones,
      useObservationRange: found.pdfUseObservationRange,
    });
  }, [editId]);

  const student = PROGRESS_STUDENTS.find((s) => s.id === studentId);

  const studentOptions = useMemo(
    () =>
      PROGRESS_STUDENTS.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [],
  );

  const observations = useMemo(() => {
    const all = loadObservations();
    let list = all.filter((o) => o.studentIds.includes(studentId));
    list = list.filter((o) => o.date >= dateFrom && o.date <= dateTo);
    if (statusFilter !== 'all') list = list.filter((o) => o.stage === statusFilter);
    if (!includeStaffOnly) list = list.filter((o) => !o.hiddenFromParents);
    list = [...list].sort((a, b) => {
      const cmp =
        sortBy === 'date'
          ? a.date.localeCompare(b.date)
          : a.createdAt.localeCompare(b.createdAt);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [studentId, dateFrom, dateTo, statusFilter, includeStaffOnly, sortBy, sortAsc]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const back = () => router.push('/progress-tracking/learning-journey');

  const buildJourney = (status: LearningJourney['status']): LearningJourney => {
    const name = `${student?.name ?? 'Student'} Learning Journey`;
    return {
      id: editing?.id ?? `lj-${Date.now()}`,
      name,
      studentId,
      studentName: student?.name ?? 'Student',
      createdBy: editing?.createdBy ?? 'Malika Thimisetty',
      updatedOn: new Date().toISOString(),
      status,
      dateFrom,
      dateTo,
      includeStaffOnly,
      pdfShowNextSteps: pdfSettings.showNextSteps,
      pdfShowMilestones: pdfSettings.showMilestones,
      pdfUseObservationRange: pdfSettings.useObservationRange,
    };
  };

  const persist = (journey: LearningJourney) => {
    const prev = loadLearningJourneys();
    const next = prev.some((j) => j.id === journey.id)
      ? prev.map((j) => (j.id === journey.id ? journey : j))
      : [journey, ...prev];
    saveLearningJourneys(next);
  };

  const saveDraft = () => {
    persist(buildJourney('draft'));
    flash('Saved as draft');
    window.setTimeout(back, 600);
  };

  const sharePdf = () => {
    persist(buildJourney('shared'));
    flash('PDF ready to share');
    window.setTimeout(back, 700);
  };

  return (
    <div className="pt-page">
      <ProgressTrackingPageHeader
        title={editing ? 'Edit Learning Journey' : 'Create Learning Journey'}
        description="Select observations and assemble a shareable journey PDF."
        icon={<Route size={22} strokeWidth={2.1} />}
        actions={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={back}>
              Back
            </button>
            <button type="button" className="ui-btn ui-btn-outline" onClick={saveDraft}>
              Save As Draft
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={sharePdf}>
              Share PDF
            </button>
          </>
        }
      />

      <div className="pt-shell lj-create-shell">
        {toast ? <p className="lj-toast">{toast}</p> : null}

        <div className="lj-create-filters">
          <div className="ui-field lj-student-field">
            <span className="ui-label">Student</span>
            <OdFilterDropdown
              className="lj-dd-student"
              value={studentId}
              onChange={setStudentId}
              options={studentOptions}
              ariaLabel="Student"
            />
          </div>

          <DateRangeField
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChangeFrom={setDateFrom}
            onChangeTo={setDateTo}
          />

          <div className="ui-field lj-sort-field">
            <span className="ui-label">Sort by</span>
            <div className="lj-sort-row">
              <OdFilterDropdown
                className="lj-dd-sort"
                value={sortBy}
                onChange={(v) => setSortBy(v as SortBy)}
                options={SORT_OPTIONS}
                ariaLabel="Sort by"
              />
              <button
                type="button"
                className="lj-sort-dir"
                aria-label="Toggle sort direction"
                onClick={() => setSortAsc((v) => !v)}
              >
                <ArrowDownUp size={16} />
              </button>
            </div>
          </div>

          <div className="ui-field lj-status-field">
            <span className="ui-label">Progress status</span>
            <OdFilterDropdown
              className="lj-dd-status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
              options={STATUS_OPTIONS}
              ariaLabel="Progress status"
            />
          </div>

          <div className="ui-field lj-toggle-field">
            <span className="ui-label">Include Staff Only</span>
            <button
              type="button"
              role="switch"
              aria-checked={includeStaffOnly}
              className={`pt-switch ${includeStaffOnly ? 'is-on' : ''}`}
              onClick={() => setIncludeStaffOnly((v) => !v)}
            />
          </div>

          <button
            type="button"
            className="ui-btn ui-btn-outline lj-pdf-settings-btn"
            onClick={() => setPdfOpen(true)}
          >
            PDF Settings
          </button>
        </div>

        <section className="lj-obs-panel">
          {observations.length === 0 ? (
            <p className="lj-obs-empty">
              No observations for this student in the selected date range
            </p>
          ) : (
            <ul className="lj-obs-list">
              {observations.map((o) => {
                const meta = STATUS_META[o.stage];
                const lesson =
                  o.lessonIds.map((id) => resolveLessonTitle(id)).find((t) => t && t !== 'Lesson') ??
                  'Observation';
                return (
                  <li key={o.id} className={`lj-obs-card is-${o.stage}`}>
                    <div className="lj-obs-head">
                      <span className={`pb-stage-badge is-${o.stage}`}>{meta.code}</span>
                      <div>
                        <strong>{meta.label}</strong>
                        <span>{o.date}</span>
                      </div>
                    </div>
                    <p className="lj-obs-title">{lesson}</p>
                    {o.note ? <p className="lj-obs-note">{o.note}</p> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Modal
        open={pdfOpen}
        title="PDF Settings"
        onClose={() => setPdfOpen(false)}
        footer={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => setPdfOpen(false)}
          >
            Done
          </button>
        }
      >
        <div className="lj-pdf-options">
          {(
            [
              ['showNextSteps', 'Show next steps in PDF'],
              ['showMilestones', 'Show milestones in PDF'],
              ['useObservationRange', 'Use Observations for Learning Journey Date Range'],
            ] as const
          ).map(([key, label]) => {
            const checked = pdfSettings[key];
            return (
              <button
                key={key}
                type="button"
                className={`lj-pdf-option${checked ? ' is-checked' : ''}`}
                onClick={() =>
                  setPdfSettings((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                role="checkbox"
                aria-checked={checked}
              >
                <span className="lj-pdf-check" aria-hidden>
                  {checked ? '✓' : ''}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
