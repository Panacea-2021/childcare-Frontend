'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  ChevronDown,
  LayoutGrid,
  Search,
  Sparkles,
} from 'lucide-react';
import { ACTIVITY_ICON_MAP } from '@/components/parent-communication/activities/ActivitySelector';
import { useParentStudent } from '../ParentStudentContext';
import { ParentModuleIcon } from '../ParentModuleIcon';
import { ParentPageHeader } from '../shared';
import {
  dayActivityMetaMap,
  dayKeyFromIso,
  ensureParentTimelineSeed,
  formatTimelineDateLabel,
  listParentTimelinePosts,
  monthActivityCounts,
  subscribeParentTimeline,
  type ParentTimelinePost,
} from '@/lib/parent/parentTimelineStore';
import { listPostableActivities } from '@/lib/parent-communication/activityDefinitionsStore';
import { TimelineActivityCard } from './TimelineActivityCard';
import { TimelineCalendar } from './TimelineCalendar';
import { TimelineMediaViewer } from './TimelineMediaViewer';
import type { ActivityAttachment } from '@/types/activity';
import './parent-timeline.css';

type Mode = 'auto' | 'calendar';
const ease = [0.22, 1, 0.36, 1] as const;

export function ParentTimelinePage() {
  const { selectedStudent, displayName, session } = useParentStudent();
  const parentId = session?.email || displayName || 'parent';
  const studentId = selectedStudent?.id || '';

  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<Mode>('auto');
  const [filterId, setFilterId] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(() => dayKeyFromIso(new Date().toISOString()));
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calMode, setCalMode] = useState<'month' | 'year'>('month');
  const [viewer, setViewer] = useState<{
    items: ActivityAttachment[];
    index: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeParentTimeline(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    if (!studentId) return;
    ensureParentTimelineSeed(studentId);
    setTick((t) => t + 1);
  }, [studentId]);

  // Only show skeleton on real view changes — never on like/comment tick updates
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(t);
  }, [studentId, filterId, selectedDay, mode]);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const onDoc = (e: MouseEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) setFilterOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  const posts = useMemo(() => {
    if (!studentId) return [] as ParentTimelinePost[];
    void tick;
    let list = listParentTimelinePosts(studentId);
    if (filterId !== 'all') list = list.filter((p) => p.activityTypeId === filterId);
    if (mode === 'calendar') {
      list = list.filter((p) => dayKeyFromIso(p.createdAt) === selectedDay);
    }
    return list;
  }, [studentId, tick, filterId, mode, selectedDay]);

  /** Activity types from Admin Activity Settings (active definitions). */
  const typeOptions = useMemo(() => {
    void tick;
    const defs = listPostableActivities().filter((a) => !a.staffOnly);
    const counts = new Map<string, number>();
    if (studentId) {
      for (const p of listParentTimelinePosts(studentId)) {
        counts.set(p.activityTypeId, (counts.get(p.activityTypeId) || 0) + 1);
      }
    }
    return defs
      .map((d) => ({
        id: d.id,
        name: d.name,
        icon: d.icon,
        color: d.color,
        bgColor: d.bgColor,
        count: counts.get(d.id) || 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [studentId, tick]);

  const filteredTypes = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return typeOptions;
    return typeOptions.filter((t) => t.name.toLowerCase().includes(q));
  }, [typeOptions, filterQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, ParentTimelinePost[]>();
    for (const p of posts) {
      const key = dayKeyFromIso(p.createdAt);
      const arr = map.get(key) || [];
      arr.push(p);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [posts]);

  const dayMeta = useMemo(() => {
    if (!studentId) return {};
    void tick;
    return dayActivityMetaMap(studentId, filterId);
  }, [studentId, tick, filterId]);

  const yearCounts = useMemo(() => {
    if (!studentId) return {};
    void tick;
    return monthActivityCounts(studentId, calYear, filterId);
  }, [studentId, tick, calYear, filterId]);

  const selectedFilterLabel =
    filterId === 'all'
      ? 'Show All'
      : typeOptions.find((t) => t.id === filterId)?.name || 'Show All';

  return (
    <div className="ptl-page">
      <ParentPageHeader
        title="Timeline"
        description={
          selectedStudent
            ? `Your child’s daily moments, activities & updates for ${selectedStudent.name}`
            : 'Your child’s daily moments, activities & updates'
        }
        icon={<ParentModuleIcon id="timeline" />}
      />

      <div className="ptl-toolbar">
        <div className="ptl-seg" role="group" aria-label="Timeline view mode">
          <button
            type="button"
            className={`ptl-seg-btn${mode === 'auto' ? ' is-active' : ''}`}
            aria-pressed={mode === 'auto'}
            onClick={() => setMode('auto')}
          >
            <Sparkles size={14} />
            Auto
          </button>
          <button
            type="button"
            className={`ptl-seg-btn${mode === 'calendar' ? ' is-active' : ''}`}
            aria-pressed={mode === 'calendar'}
            onClick={() => setMode('calendar')}
          >
            <CalendarDays size={14} />
            Calendar
          </button>
        </div>

        <div className="ptl-filter" ref={filterRef}>
          <button
            type="button"
            className={`ptl-filter-trigger${filterOpen ? ' is-open' : ''}`}
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((v) => !v)}
          >
            <LayoutGrid size={15} />
            <span>{selectedFilterLabel}</span>
            <ChevronDown size={15} className="ptl-filter-chevron" />
          </button>
          <AnimatePresence>
            {filterOpen ? (
              <motion.div
                className="ptl-filter-menu"
                role="listbox"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease }}
              >
                <label className="ptl-filter-search">
                  <Search size={14} aria-hidden />
                  <input
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search activity..."
                    aria-label="Search activity types"
                  />
                </label>
                <button
                  type="button"
                  role="option"
                  aria-selected={filterId === 'all'}
                  className={`ptl-filter-option${filterId === 'all' ? ' is-selected' : ''}`}
                  onClick={() => {
                    setFilterId('all');
                    setFilterOpen(false);
                    setFilterQuery('');
                  }}
                >
                  <span className="ptl-filter-ico" aria-hidden>
                    <Sparkles size={14} />
                  </span>
                  <span>Show All</span>
                  {filterId === 'all' ? <Check size={14} /> : null}
                </button>
                {filteredTypes.map((t) => {
                  const Icon = ACTIVITY_ICON_MAP[t.icon] ?? LayoutGrid;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="option"
                      aria-selected={filterId === t.id}
                      className={`ptl-filter-option${filterId === t.id ? ' is-selected' : ''}`}
                      onClick={() => {
                        setFilterId(t.id);
                        setFilterOpen(false);
                        setFilterQuery('');
                      }}
                    >
                      <span
                        className="ptl-filter-ico"
                        style={{ background: t.bgColor, color: t.color }}
                        aria-hidden
                      >
                        <Icon size={14} />
                      </span>
                      <span>{t.name}</span>
                      {t.count > 0 ? <em>{t.count}</em> : <em className="is-zero">0</em>}
                      {filterId === t.id ? <Check size={14} /> : null}
                    </button>
                  );
                })}
                {filteredTypes.length === 0 ? (
                  <p className="ptl-filter-empty">No matching activity types</p>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'calendar' ? (
          <motion.div
            key="cal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease }}
          >
            <TimelineCalendar
              year={calYear}
              month={calMonth}
              mode={calMode}
              selectedDay={selectedDay}
              dayMeta={dayMeta}
              yearCounts={yearCounts}
              onYearChange={setCalYear}
              onMonthChange={setCalMonth}
              onModeChange={setCalMode}
              onSelectDay={(day) => {
                setSelectedDay(day);
                window.setTimeout(() => {
                  feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="ptl-feed" ref={feedRef}>
        {loading ? (
          <div className="ptl-skeletons" aria-busy="true" aria-label="Loading timeline">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ptl-skel-card" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="ptl-empty">
            <span aria-hidden>{mode === 'calendar' ? '🌤' : '✨'}</span>
            <h3>{mode === 'calendar' ? 'A quiet day' : 'No activities yet'}</h3>
            <p>
              {mode === 'calendar'
                ? 'No activities were posted on this date.'
                : 'Your child’s latest updates will appear here when the school posts them.'}
            </p>
          </div>
        ) : (
          grouped.map(([day, dayPosts]) => (
            <section key={day} className="ptl-day-group">
              <div className="ptl-day-pill">
                <strong>{formatTimelineDateLabel(dayPosts[0].createdAt)}</strong>
                <span>{day.split('-').reverse().join('/')}</span>
              </div>
              <div className="ptl-day-rail" aria-hidden />
              <div className="ptl-day-cards">
                {dayPosts.map((post, i) => (
                  <TimelineActivityCard
                    key={post.id}
                    post={post}
                    parentId={parentId}
                    index={i}
                    onOpenMedia={(items, index) => setViewer({ items, index })}
                    onChanged={() => setTick((t) => t + 1)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {viewer ? (
        <TimelineMediaViewer
          items={viewer.items}
          startIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      ) : null}
    </div>
  );
}
