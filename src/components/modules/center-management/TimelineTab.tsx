'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Camera,
  ChevronDown,
  Clock3,
  ImageIcon,
  LayoutGrid,
  Megaphone,
  Play,
  Search,
  Smile,
  Sparkles,
  Video,
} from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import {
  activityDayKey,
  formatDayLabel,
  formatTimelineWhen,
  loadTimeline,
  subscribeTimeline,
  TIMELINE_FILTERS,
  type TimelineActivity,
  type TimelineActivityType,
} from '@/lib/center-management/timelineStore';
import { ProfileTablePagination, useClientPagination } from './ui';
import './timeline.css';

type Props = { student: Student };
type ViewMode = 'auto' | 'calendar';
type CalMode = 'month' | 'year';
type FilterId = 'all' | TimelineActivityType;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const ease = [0.22, 1, 0.36, 1] as const;

function FilterIcon({ id }: { id: FilterId }) {
  if (id === 'all') return <LayoutGrid size={15} />;
  if (id === 'playing') return <Sparkles size={15} />;
  if (id === 'dancing') return <Sparkles size={15} />;
  if (id === 'name-to-face') return <Smile size={15} />;
  if (id === 'announcement') return <Megaphone size={15} />;
  if (id === 'photo') return <Camera size={15} />;
  if (id === 'video') return <Video size={15} />;
  return <BookOpen size={15} />;
}

function typeTone(type: TimelineActivityType) {
  return `tone-${type}`;
}

function daysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate();
}

function startWeekday(year: number, month0: number) {
  return new Date(year, month0, 1).getDay();
}

export function TimelineTab({ student }: Props) {
  const now = new Date();
  const [view, setView] = useState<ViewMode>('auto');
  const [filter, setFilter] = useState<FilterId>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterQ, setFilterQ] = useState('');
  const [items, setItems] = useState<TimelineActivity[]>([]);
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [calMode, setCalMode] = useState<CalMode>('month');
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [pageDir, setPageDir] = useState(1);

  const filterRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => setItems(loadTimeline(student.id));
    refresh();
    return subscribeTimeline(refresh);
  }, [student.id]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (filterRef.current && !filterRef.current.contains(t)) setFilterOpen(false);
      if (yearRef.current && !yearRef.current.contains(t)) setYearOpen(false);
      if (monthRef.current && !monthRef.current.contains(t)) setMonthOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const list = filter === 'all' ? items : items.filter((i) => i.type === filter);
    return [...list].sort((a, b) => b.at.localeCompare(a.at));
  }, [items, filter]);

  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(filtered, 30, `${filter}|${view}|${student.id}`);

  const onPageChange = (next: number) => {
    setPageDir(next > page ? 1 : -1);
    setPage(next);
  };

  const filterOptions = useMemo(() => {
    const q = filterQ.trim().toLowerCase();
    if (!q) return TIMELINE_FILTERS;
    return TIMELINE_FILTERS.filter((f) => f.label.toLowerCase().includes(q));
  }, [filterQ]);

  const activeFilterLabel =
    TIMELINE_FILTERS.find((f) => f.id === filter)?.label ?? 'Show All';

  const selectedKey = `${year}-${String(month0 + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const panelItems = useMemo(() => {
    if (calMode === 'year') {
      return filtered.filter((i) => {
        const d = new Date(i.at);
        return d.getFullYear() === year && d.getMonth() === month0;
      });
    }
    return filtered.filter((i) => activityDayKey(i.at) === selectedKey);
  }, [filtered, calMode, year, month0, selectedKey]);

  const daysWithActivity = useMemo(() => {
    const set = new Set<number>();
    for (const i of filtered) {
      const d = new Date(i.at);
      if (d.getFullYear() === year && d.getMonth() === month0) set.add(d.getDate());
    }
    return set;
  }, [filtered, year, month0]);

  const monthActivityCounts = useMemo(() => {
    const counts = Array.from({ length: 12 }, () => 0);
    for (const i of filtered) {
      const d = new Date(i.at);
      if (d.getFullYear() === year) counts[d.getMonth()] += 1;
    }
    return counts;
  }, [filtered, year]);

  /** Year view: select month only — stay on year grid and show that month's activities below */
  const selectYearMonth = (idx: number) => {
    setMonth0(idx);
    setYearOpen(false);
  };

  /** Month dropdown while already in Month view */
  const jumpToMonthInMonthView = (idx: number) => {
    const max = daysInMonth(year, idx);
    setMonth0(idx);
    setSelectedDay((day) => (day > max ? max : day < 1 ? 1 : day));
    setMonthOpen(false);
  };

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, i) => y - 5 + i);
  }, []);

  const gridCells = useMemo(() => {
    const total = daysInMonth(year, month0);
    const start = startWeekday(year, month0);
    const cells: (number | null)[] = [];
    for (let i = 0; i < start; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month0]);

  return (
    <motion.section
      className="tl-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      <div className="tl-head">
        <div className="tl-title">
          <span className="tl-title-ico" aria-hidden>
            <Clock3 size={17} />
          </span>
          <strong>Timeline</strong>
        </div>

        <div className="tl-controls">
          <div className="tl-mode" role="tablist" aria-label="Timeline view">
            {(['auto', 'calendar'] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={view === m}
                className={`tl-mode-btn${view === m ? ' is-on' : ''}`}
                onClick={() => setView(m)}
              >
                {m === 'auto' ? 'Auto' : 'Calendar'}
              </button>
            ))}
          </div>

          <div className="tl-filter" ref={filterRef}>
            <button
              type="button"
              className={`tl-filter-btn${filterOpen ? ' is-open' : ''}`}
              onClick={() => setFilterOpen((v) => !v)}
            >
              <FilterIcon id={filter} />
              <span>{activeFilterLabel}</span>
              <ChevronDown size={15} />
            </button>

            <AnimatePresence>
              {filterOpen ? (
                <motion.div
                  className="tl-filter-menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.2, ease }}
                >
                  <label className="tl-filter-search">
                    <FilterIcon id="all" />
                    <input
                      value={filterQ}
                      onChange={(e) => setFilterQ(e.target.value)}
                      placeholder="Show All"
                    />
                    <Search size={15} />
                  </label>
                  <ul>
                    {filterOptions.map((f, i) => (
                      <motion.li key={f.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                        <button
                          type="button"
                          className={`tl-filter-item tone-${f.id}${filter === f.id ? ' is-on' : ''}`}
                          onClick={() => {
                            setFilter(f.id);
                            setFilterOpen(false);
                            setFilterQ('');
                          }}
                        >
                          <span className="tl-filter-ico">
                            <FilterIcon id={f.id} />
                          </span>
                          {f.label}
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'auto' ? (
          <motion.div
            key="auto"
            className="tl-body"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            {filtered.length === 0 ? (
              <div className="tl-empty">
                <motion.div
                  className="tl-empty-orb"
                  animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ImageIcon size={28} strokeWidth={1.4} />
                </motion.div>
                <strong>No activities posted.</strong>
                <p>Posts for this student will appear here as they are shared.</p>
              </div>
            ) : (
              <div className="tl-auto">
                <div className="tl-auto-stage">
                  <AnimatePresence mode="wait" custom={pageDir}>
                    <motion.div
                      key={page}
                      className="tl-story"
                      custom={pageDir}
                      initial={{ opacity: 0, x: pageDir * 36 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: pageDir * -36 }}
                      transition={{ duration: 0.32, ease }}
                    >
                      <div className="tl-story-rail" aria-hidden />
                      <ul className="tl-story-list">
                        {pageItems.map((item, i) => (
                          <motion.li
                            key={item.id}
                            className={`tl-story-item ${typeTone(item.type)}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.3, ease }}
                          >
                            <span className="tl-story-node" aria-hidden>
                              <FilterIcon id={item.type} />
                            </span>
                            <article className="tl-story-card">
                              <div className="tl-story-head">
                                <span className={`tl-type-chip ${typeTone(item.type)}`}>
                                  {TIMELINE_FILTERS.find((f) => f.id === item.type)?.label}
                                </span>
                                <time dateTime={item.at}>{formatTimelineWhen(item.at)}</time>
                              </div>
                              <h4>{item.title}</h4>
                              <p>{item.body}</p>
                              <footer>
                                <span>By {item.author}</span>
                                {item.type === 'video' ? (
                                  <span className="tl-media-tag">
                                    <Play size={12} /> Video
                                  </span>
                                ) : null}
                                {item.type === 'photo' ? (
                                  <span className="tl-media-tag">
                                    <Camera size={12} /> Photo
                                  </span>
                                ) : null}
                              </footer>
                            </article>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <ProfileTablePagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            className="tl-body"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            <div className="tl-cal-shell">
              <div className="tl-cal-glow" aria-hidden />
              <div className="tl-cal-toolbar">
                <div className="tl-cal-pickers">
                  <div className="tl-mini-dd" ref={yearRef}>
                    <button
                      type="button"
                      className={`tl-mini-btn${yearOpen ? ' is-open' : ''}`}
                      onClick={() => {
                        setYearOpen((v) => !v);
                        setMonthOpen(false);
                      }}
                    >
                      {year} <ChevronDown size={14} />
                    </button>
                    <AnimatePresence>
                      {yearOpen ? (
                        <motion.ul
                          className="tl-mini-menu"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          {years.map((y) => (
                            <li key={y}>
                              <button
                                type="button"
                                className={y === year ? 'is-on' : ''}
                                onClick={() => {
                                  setYear(y);
                                  setYearOpen(false);
                                }}
                              >
                                {y}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {calMode === 'month' ? (
                    <div className="tl-mini-dd" ref={monthRef}>
                      <button
                        type="button"
                        className={`tl-mini-btn${monthOpen ? ' is-open' : ''}`}
                        onClick={() => {
                          setMonthOpen((v) => !v);
                          setYearOpen(false);
                        }}
                      >
                        {MONTHS[month0]} <ChevronDown size={14} />
                      </button>
                      <AnimatePresence>
                        {monthOpen ? (
                          <motion.ul
                            className="tl-mini-menu"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {MONTHS.map((m, idx) => (
                              <li key={m}>
                                <button
                                  type="button"
                                  className={idx === month0 ? 'is-on' : ''}
                                  onClick={() => jumpToMonthInMonthView(idx)}
                                >
                                  {m}
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <span className="tl-year-hint">Select a month to view its activities</span>
                  )}
                </div>

                <div className="tl-mode tl-cal-mode" role="tablist">
                  {(['month', 'year'] as CalMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`tl-mode-btn${calMode === m ? ' is-on' : ''}`}
                      onClick={() => setCalMode(m)}
                    >
                      {m === 'month' ? 'Month' : 'Year'}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {calMode === 'month' ? (
                  <motion.div
                    key={`month-${year}-${month0}`}
                    className="tl-month-page"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease }}
                  >
                    <div className="tl-month-banner">
                      <strong>
                        {MONTHS[month0]} {year}
                      </strong>
                      <span>
                        {daysWithActivity.size} day{daysWithActivity.size === 1 ? '' : 's'} with activity
                      </span>
                    </div>
                    <div className="tl-dow">
                      {DOW.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="tl-grid">
                      {gridCells.map((day, idx) => {
                        if (day == null) return <span key={`e-${idx}`} className="tl-cell is-empty" />;
                        const isSelected = day === selectedDay;
                        const has = daysWithActivity.has(day);
                        return (
                          <motion.button
                            key={day}
                            type="button"
                            className={`tl-cell${isSelected ? ' is-selected' : ''}${has ? ' has-dot' : ''}`}
                            onClick={() => setSelectedDay(day)}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {day}
                            {has ? <i aria-hidden /> : null}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`year-${year}`}
                    className="tl-year-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease }}
                  >
                    {MONTHS.map((m, idx) => {
                      const count = monthActivityCounts[idx];
                      return (
                        <motion.button
                          key={m}
                          type="button"
                          className={`tl-month-chip${idx === month0 ? ' is-on' : ''}${count ? ' has-activity' : ''}`}
                          onClick={() => selectYearMonth(idx)}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02, duration: 0.22 }}
                        >
                          <strong>{m}</strong>
                          <em>{count ? `${count} post${count === 1 ? '' : 's'}` : 'No posts'}</em>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="tl-day-panel">
              <AnimatePresence mode="wait">
                {panelItems.length === 0 ? (
                  <motion.div
                    key={`empty-${calMode}-${month0}-${selectedDay}`}
                    className="tl-day-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p>
                      {calMode === 'year'
                        ? `No activities posted in ${MONTHS[month0]} ${year}.`
                        : `No activity posted on ${formatDayLabel(year, month0, selectedDay)}.`}
                    </p>
                    <span>No activities posted</span>
                  </motion.div>
                ) : (
                  <motion.ul
                    key={`list-${calMode}-${month0}-${selectedDay}`}
                    className="tl-day-list"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {calMode === 'year' ? (
                      <li className="tl-month-list-label">
                        Activities in {MONTHS[month0]} {year}
                      </li>
                    ) : null}
                    {panelItems.map((item, i) => (
                      <motion.li
                        key={item.id}
                        className={`tl-day-item ${typeTone(item.type)}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <span className="tl-day-ico">
                          <FilterIcon id={item.type} />
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <p>{item.body}</p>
                          <em>
                            {formatTimelineWhen(item.at)} · {item.author}
                          </em>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
