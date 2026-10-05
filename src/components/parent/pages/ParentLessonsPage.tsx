'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  filterParentLessons,
  formatDisplayDate,
  PARENT_LESSON_DATE_PRESETS,
  PARENT_LESSON_SEED,
  PARENT_LESSON_STATUS_OPTIONS,
  resolveDateRange,
  statusLabel,
  toIsoDate,
  weekRangeFromOffset,
  type ParentLessonAssignment,
  type ParentLessonDatePreset,
  type ParentLessonStatus,
} from '@/lib/parent-lessons/assignments';
import { ParentModuleIcon } from '../ParentModuleIcon';
import { ParentEmptyState, ParentPageHeader, ParentSkeleton } from '../shared';
import '../shared/parent-shared.css';
import './parent-lessons-page.css';

type StatusFilter = 'all' | ParentLessonStatus;

const ease = [0.22, 1, 0.36, 1] as const;

const SUBJECT_META: Record<
  string,
  { subject: string; teacher: string; priority: 'Normal' | 'High' }
> = {
  'pla-1': { subject: 'Practical Life', teacher: 'Ms. Rivera', priority: 'Normal' },
  'pla-2': { subject: 'Sensorial', teacher: 'Ms. Rivera', priority: 'Normal' },
  'pla-3': { subject: 'Language', teacher: 'Mr. Chen', priority: 'High' },
  'pla-4': { subject: 'Math', teacher: 'Ms. Patel', priority: 'Normal' },
  'pla-5': { subject: 'Culture', teacher: 'Mr. Chen', priority: 'Normal' },
};

function statusTone(status: ParentLessonStatus): string {
  if (status === 'completed' || status === 'stars') return 'completed';
  if (status === 'pending') return 'pending';
  if (status === 'weekly-plan') return 'upcoming';
  return 'neutral';
}

function StatusIcon({ status }: { status: ParentLessonStatus }) {
  if (status === 'stars') return <Star size={15} />;
  if (status === 'completed') return <Sparkles size={15} />;
  if (status === 'weekly-plan') return <CalendarDays size={15} />;
  return <Clock3 size={15} />;
}

export function ParentLessonsPage() {
  const [booting, setBooting] = useState(true);
  const [datePreset, setDatePreset] = useState<ParentLessonDatePreset>('this-month');
  const [customStart, setCustomStart] = useState(() => toIsoDate(new Date()));
  const [customEnd, setCustomEnd] = useState(() => toIsoDate(new Date()));
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [dateOpen, setDateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusQuery, setStatusQuery] = useState('');
  const [statusDirty, setStatusDirty] = useState(false);
  const [detail, setDetail] = useState<ParentLessonAssignment | null>(null);
  const dateRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const statusSearchRef = useRef<HTMLInputElement | null>(null);

  const isWeeklyPlan = status === 'weekly-plan';

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 500);
    return () => window.clearTimeout(t);
  }, []);

  const range = useMemo(() => {
    if (isWeeklyPlan) return weekRangeFromOffset(weekOffset);
    return resolveDateRange(datePreset, customStart, customEnd);
  }, [customEnd, customStart, datePreset, isWeeklyPlan, weekOffset]);

  const dateTriggerLabel = useMemo(() => {
    const preset = PARENT_LESSON_DATE_PRESETS.find((p) => p.id === datePreset)?.label ?? 'Today';
    return `${preset} (${formatDisplayDate(range.start)} - ${formatDisplayDate(range.end)})`;
  }, [datePreset, range.end, range.start]);

  const weekLabel = `${formatDisplayDate(range.start)} - ${formatDisplayDate(range.end)}`;

  const statusLabelText =
    PARENT_LESSON_STATUS_OPTIONS.find((o) => o.id === status)?.label ?? 'All';

  const filteredStatusOptions = useMemo(() => {
    if (!statusDirty) return PARENT_LESSON_STATUS_OPTIONS;
    const q = statusQuery.trim().toLowerCase();
    return PARENT_LESSON_STATUS_OPTIONS.filter((o) => !q || o.label.toLowerCase().includes(q));
  }, [statusDirty, statusQuery]);

  const assignments = useMemo(
    () =>
      filterParentLessons(PARENT_LESSON_SEED, {
        start: range.start,
        end: range.end,
        status: isWeeklyPlan ? 'weekly-plan' : status,
        query: isWeeklyPlan ? '' : query,
      }),
    [isWeeklyPlan, query, range.end, range.start, status],
  );

  const summary = useMemo(() => {
    const all = PARENT_LESSON_SEED;
    return {
      total: all.length,
      pending: all.filter((a) => a.status === 'pending').length,
      completed: all.filter((a) => a.status === 'completed' || a.status === 'stars').length,
      weekly: all.filter((a) => a.status === 'weekly-plan').length,
    };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (dateRef.current && !dateRef.current.contains(t)) setDateOpen(false);
      if (statusRef.current && !statusRef.current.contains(t)) {
        setStatusOpen(false);
        setStatusQuery('');
        setStatusDirty(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!statusOpen) return;
    statusSearchRef.current?.focus();
    statusSearchRef.current?.select();
  }, [statusOpen]);

  const openStatusMenu = () => {
    setDateOpen(false);
    setStatusQuery(statusLabelText);
    setStatusDirty(false);
    setStatusOpen(true);
  };

  const pickStatus = (id: StatusFilter) => {
    setStatus(id);
    setStatusOpen(false);
    setStatusQuery('');
    setStatusDirty(false);
    if (id === 'weekly-plan') setWeekOffset(0);
  };

  const statusDropdown = (
    <div className={`pln-dd${isWeeklyPlan ? ' pln-dd--weekly' : ''}`} ref={statusRef}>
      {statusOpen ? (
        <div className="pln-ddTrigger is-open is-search" role="combobox" aria-expanded>
          <input
            ref={statusSearchRef}
            className="pln-ddTriggerInput"
            value={statusQuery}
            onChange={(e) => {
              setStatusDirty(true);
              setStatusQuery(e.target.value);
            }}
            aria-label="Filter status"
          />
          <span className="pln-ddChevron" aria-hidden>
            <Search size={15} />
          </span>
        </div>
      ) : (
        <button
          type="button"
          className="pln-ddTrigger"
          aria-expanded={false}
          aria-haspopup="listbox"
          onClick={openStatusMenu}
        >
          <span>{statusLabelText}</span>
          <span className="pln-ddChevron" aria-hidden>
            <ChevronDown size={16} />
          </span>
        </button>
      )}

      {statusOpen ? (
        <div className="pln-ddMenu" role="listbox">
          <div className="pln-ddList">
            {filteredStatusOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={status === opt.id}
                className={`pln-ddOption${status === opt.id ? ' is-active' : ''}`}
                onClick={() => pickStatus(opt.id)}
              >
                {opt.label}
              </button>
            ))}
            {filteredStatusOptions.length === 0 ? (
              <p className="pln-ddEmpty">No matches</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );

  const detailMeta = detail ? SUBJECT_META[detail.id] : null;

  const summaryCards = [
    {
      key: 'total',
      tone: 'accent',
      label: 'Assignments',
      value: summary.total,
      hint: 'In your lesson library',
      icon: <BookOpen size={18} />,
    },
    {
      key: 'pending',
      tone: 'pending',
      label: 'Pending',
      value: summary.pending,
      hint: 'Awaiting completion',
      icon: <Clock3 size={18} />,
    },
    {
      key: 'completed',
      tone: 'success',
      label: 'Completed',
      value: summary.completed,
      hint: 'Finished & starred',
      icon: <Sparkles size={18} />,
    },
    {
      key: 'weekly',
      tone: 'info',
      label: 'Weekly plans',
      value: summary.weekly,
      hint: 'Shared by teachers',
      icon: <CalendarDays size={18} />,
    },
  ] as const;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="psh-page pln-page">
          <ParentPageHeader
            title="Lessons"
            description="Track weekly plans, due dates and completed classroom work."
            icon={<ParentModuleIcon id="lessons" />}
          />

          {booting ? (
            <>
              <ParentSkeleton variant="stats" />
              <ParentSkeleton variant="cards" rows={3} />
            </>
          ) : (
            <>
              <div className="psh-stats pln-summary">
                {summaryCards.map((card, idx) => (
                  <m.article
                    key={card.key}
                    className={`psh-stat psh-stat--${card.tone} pln-stat`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, delay: 0.08 + idx * 0.06, ease }}
                    whileHover={{ y: -3 }}
                  >
                    <span className="psh-stat-icon" aria-hidden>
                      {card.icon}
                    </span>
                    <div className="psh-stat-body">
                      <span className="psh-stat-label">{card.label}</span>
                      <span className="psh-stat-value">{card.value}</span>
                      <span className="psh-stat-hint">{card.hint}</span>
                    </div>
                  </m.article>
                ))}
              </div>

              <m.section
                className="pln-shell"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.22, ease }}
              >
                {isWeeklyPlan ? (
                  <div className="pln-weeklyHead">
                    {statusDropdown}
                    <div className="pln-weekNav" aria-label="Week navigator">
                      <button
                        type="button"
                        className="pln-weekBtn"
                        aria-label="Previous week"
                        onClick={() => setWeekOffset((v) => v - 1)}
                      >
                        <ChevronLeft size={18} strokeWidth={2.25} />
                      </button>
                      <span className="pln-weekLabel">{weekLabel}</span>
                      <button
                        type="button"
                        className="pln-weekBtn"
                        aria-label="Next week"
                        onClick={() => setWeekOffset((v) => v + 1)}
                      >
                        <ChevronRight size={18} strokeWidth={2.25} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pln-filters">
                    <div className="pln-filtersLeft">
                      <div className="pln-dd" ref={dateRef}>
                        <button
                          type="button"
                          className={`pln-ddTrigger${dateOpen ? ' is-open' : ''}`}
                          aria-expanded={dateOpen}
                          aria-haspopup="listbox"
                          onClick={() => {
                            setDateOpen((v) => !v);
                            setStatusOpen(false);
                          }}
                        >
                          <span>{dateTriggerLabel}</span>
                          <span className="pln-ddChevron" aria-hidden>
                            <ChevronDown size={16} />
                          </span>
                        </button>

                        {dateOpen ? (
                          <div className="pln-ddMenu" role="listbox">
                            <div className="pln-ddList">
                              {PARENT_LESSON_DATE_PRESETS.map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  role="option"
                                  aria-selected={datePreset === preset.id}
                                  className={`pln-ddOption${datePreset === preset.id ? ' is-active' : ''}`}
                                  onClick={() => {
                                    setDatePreset(preset.id);
                                    if (preset.id !== 'custom') setDateOpen(false);
                                  }}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                            {datePreset === 'custom' ? (
                              <div className="pln-customDates">
                                <label>
                                  Start
                                  <input
                                    className="ui-input"
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                  />
                                </label>
                                <label>
                                  End
                                  <input
                                    className="ui-input"
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                  />
                                </label>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      {statusDropdown}
                    </div>

                    <div className="pln-searchWrap">
                      <input
                        className="pln-search"
                        type="search"
                        placeholder="Search by name or description"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search by name or description"
                      />
                      <span className="pln-searchIcon" aria-hidden>
                        <Search size={16} strokeWidth={2} />
                      </span>
                      {query ? (
                        <button
                          type="button"
                          className="pln-searchClear"
                          aria-label="Clear search"
                          onClick={() => setQuery('')}
                        >
                          <X size={14} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="pln-body">
                  <AnimatePresence mode="wait">
                    {assignments.length === 0 ? (
                      <m.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28, ease }}
                      >
                        <ParentEmptyState
                          icon={<BookOpen size={26} />}
                          title={isWeeklyPlan ? 'No weekly plan shared' : 'No assignments found'}
                          description={
                            isWeeklyPlan
                              ? 'Your child’s teacher hasn’t shared a weekly plan for this week yet.'
                              : 'Try a wider date range or clear your search to see more lesson work.'
                          }
                          action={
                            !isWeeklyPlan ? (
                              <button
                                type="button"
                                className="ui-btn ui-btn-outline"
                                onClick={() => {
                                  setQuery('');
                                  setStatus('all');
                                  setDatePreset('this-year');
                                }}
                              >
                                Show all this year
                              </button>
                            ) : undefined
                          }
                        />
                      </m.div>
                    ) : (
                      <m.ul
                        key="list"
                        className="pln-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        {assignments.map((item, idx) => {
                          const meta = SUBJECT_META[item.id] ?? {
                            subject: 'Classroom',
                            teacher: 'Teacher',
                            priority: 'Normal' as const,
                          };
                          return (
                            <m.li
                              key={item.id}
                              className="pln-card"
                              initial={{ opacity: 0, y: 14 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.34,
                                delay: Math.min(idx * 0.05, 0.28),
                                ease,
                              }}
                              whileHover={{ y: -3 }}
                            >
                              <button
                                type="button"
                                className="pln-cardBtn"
                                onClick={() => setDetail(item)}
                              >
                                <span className="pln-cardIcon" aria-hidden>
                                  <StatusIcon status={item.status} />
                                </span>
                                <span className="pln-cardMain">
                                  <span className="pln-cardSubject">{meta.subject}</span>
                                  <span className="pln-cardName">{item.name}</span>
                                  <span className="pln-cardDesc">{item.description}</span>
                                  <span className="pln-cardMeta">
                                    <span className={`psh-badge psh-badge--${statusTone(item.status)}`}>
                                      {statusLabel(item.status)}
                                    </span>
                                    {meta.priority === 'High' ? (
                                      <span className="psh-badge psh-badge--danger">High priority</span>
                                    ) : null}
                                    <span className="pln-dateChip">
                                      <CalendarDays size={12} aria-hidden />
                                      {formatDisplayDate(new Date(`${item.date}T00:00:00`))}
                                    </span>
                                    <span className="pln-dateChip">
                                      <UserRound size={12} aria-hidden />
                                      {meta.teacher}
                                    </span>
                                  </span>
                                </span>
                              </button>
                            </m.li>
                          );
                        })}
                      </m.ul>
                    )}
                  </AnimatePresence>
                </div>
              </m.section>
            </>
          )}

          <Modal
            open={!!detail}
            title={detail?.name ?? 'Assignment'}
            onClose={() => setDetail(null)}
            footer={
              <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDetail(null)}>
                Close
              </button>
            }
          >
            {detail ? (
              <div className="pln-detail">
                <div className="pln-detail-row">
                  <span>Subject</span>
                  <strong>{detailMeta?.subject ?? 'Classroom'}</strong>
                </div>
                <div className="pln-detail-row">
                  <span>Teacher</span>
                  <strong>{detailMeta?.teacher ?? '—'}</strong>
                </div>
                <div className="pln-detail-row">
                  <span>Date</span>
                  <strong>{formatDisplayDate(new Date(`${detail.date}T00:00:00`))}</strong>
                </div>
                <div className="pln-detail-row">
                  <span>Status</span>
                  <strong>
                    <span className={`psh-badge psh-badge--${statusTone(detail.status)}`}>
                      {statusLabel(detail.status)}
                    </span>
                  </strong>
                </div>
                <p className="pln-detail-desc">{detail.description}</p>
              </div>
            ) : null}
          </Modal>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
