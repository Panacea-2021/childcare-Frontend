'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Inbox, Sparkles } from 'lucide-react';
import type { Student } from '@/lib/center-management/types';
import { loadStudents, roomName } from '@/lib/center-management/studentsStore';
import {
  buildStudentProgressView,
  subscribeStudentProgress,
  type StudentProgress,
} from '@/lib/center-management/progressStore';
import {
  deleteProgressRecord,
  loadProgressRecords,
  saveProgressRecords,
} from '@/lib/center-management/progressRecordsStore';
import type { ProgressRecord, ProgressRecordKind } from '@/types/progressRecord';
import { AppSelect, StatusBadge } from './ui';
import { ProgressRecordsList } from './progress-records/ProgressRecordsList';
import './progress.css';
import './progress-records/progress-records.css';

type SubTab = 'progress' | 'observations' | 'reflections' | 'concerns';

type Props = {
  student: Student;
  ageLabel?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function tabLabel(tab: SubTab) {
  if (tab === 'progress') return 'Progress';
  if (tab === 'observations') return 'Observations';
  if (tab === 'reflections') return 'Reflections';
  return 'Concerns';
}

function parseSubTab(raw: string | null): SubTab | null {
  if (raw === 'progress' || raw === 'observations' || raw === 'reflections' || raw === 'concerns') {
    return raw;
  }
  return null;
}

function kindForTab(tab: SubTab): ProgressRecordKind | null {
  if (tab === 'observations') return 'observation';
  if (tab === 'reflections') return 'reflection';
  if (tab === 'concerns') return 'concern';
  return null;
}

const SUB_TABS: SubTab[] = ['progress', 'observations', 'reflections', 'concerns'];
const ease = [0.22, 1, 0.36, 1] as const;

export function ProgressTab({ student, ageLabel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const progressParam = searchParams.get('progress');

  const [subTab, setSubTab] = useState<SubTab>(() => parseSubTab(progressParam) ?? 'progress');
  const [progress, setProgress] = useState<StudentProgress>(() => buildStudentProgressView(student.id));
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [recordsReady, setRecordsReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [peers, setPeers] = useState<Student[]>([]);

  useEffect(() => {
    const refresh = () => setProgress(buildStudentProgressView(student.id));
    refresh();
    return subscribeStudentProgress(refresh);
  }, [student.id]);

  useEffect(() => {
    setRecords(loadProgressRecords());
    setRecordsReady(true);
  }, []);

  useEffect(() => {
    if (!recordsReady) return;
    saveProgressRecords(records);
  }, [records, recordsReady]);

  useEffect(() => {
    const next = parseSubTab(searchParams.get('progress'));
    if (next) setSubTab(next);
    else if (!searchParams.get('progress')) setSubTab('progress');
  }, [searchParams]);

  useEffect(() => {
    setPeers(loadStudents().filter((s) => s.id !== student.id));
  }, [student.id]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const assessedCount = progress.areas.filter((a) => a.scaleLevel || a.level).length;
  const secureCount = progress.areas.filter((a) => a.level === 'Secure').length;
  const emergingCount = progress.areas.filter((a) => a.level === 'Emerging').length;

  const profileHref = (id: string, tab: SubTab) => {
    const qs = new URLSearchParams({ tab: 'Progress' });
    if (tab !== 'progress') qs.set('progress', tab);
    return `/center-management/students/${id}?${qs.toString()}`;
  };

  const createHref = (kind: ProgressRecordKind, recordId?: string) => {
    const qs = new URLSearchParams({ kind });
    if (recordId) qs.set('recordId', recordId);
    return `/center-management/students/${encodeURIComponent(student.id)}/progress/create?${qs.toString()}`;
  };

  const selectSubTab = (tab: SubTab) => {
    setSubTab(tab);
    router.replace(profileHref(student.id, tab), { scroll: false });
  };

  const openCreate = (kind: ProgressRecordKind, editing: ProgressRecord | null = null) => {
    router.push(createHref(kind, editing?.id));
  };

  const openAssess = () => {
    router.push(
      `/center-management/students/${encodeURIComponent(student.id)}/progress/create-assessment`,
    );
  };

  const room =
    student.roomIds.map(roomName).filter(Boolean).join(', ') || 'Unassigned';

  return (
    <motion.div
      className="prog-root"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      {toast ? <div className="prog-toast">{toast}</div> : null}

      <motion.div
        className="prog-hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.4, ease }}
      >
        <div className="prog-hero-glow" aria-hidden />
        <div className="prog-hero-main">
          <div className="prog-avatar" aria-hidden>
            {student.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.photoUrl} alt="" />
            ) : (
              initials(student.name)
            )}
          </div>
          <div className="prog-hero-copy">
            <div className="prog-hero-name-row">
              <h3>{student.name}</h3>
              <StatusBadge status={student.status} />
            </div>
            <div className="prog-hero-meta">
              <span className="prog-chip">
                Room: <strong>{room}</strong>
              </span>
              <span className="prog-chip">
                Age:{' '}
                <strong>
                  {student.dob || '—'}
                  {ageLabel ? ` (${ageLabel})` : ''}
                </strong>
              </span>
            </div>
          </div>
        </div>
        <button type="button" className="ui-btn ui-btn-outline prog-assess-btn" onClick={openAssess}>
          <Sparkles size={15} />
          Create Assessment
        </button>
      </motion.div>

      <div className="prog-subnav">
        <div className="prog-pills" role="tablist">
          {SUB_TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={subTab === t}
              className={`prog-pill${subTab === t ? ' is-on' : ''}`}
              onClick={() => selectSubTab(t)}
            >
              {subTab === t ? (
                <motion.span
                  className="prog-pill-glow"
                  layoutId="prog-pill-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              ) : null}
              <span className="prog-pill-label">{tabLabel(t)}</span>
            </button>
          ))}
        </div>
        <div className="prog-toggle-wrap">
          <AppSelect
            value=""
            placeholder="Toggle Student"
            options={peers.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(id) => {
              if (id) router.push(profileHref(id, subTab));
            }}
            className="prog-toggle-dd"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'progress' ? (
          <motion.section
            key="progress"
            className="prog-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            <div className="prog-tracker-head">
              <div className="prog-tracker-title">
                <span className="prog-tracker-ico" aria-hidden>
                  <BarChart3 size={18} />
                </span>
                <div>
                  <strong>Progress Tracker</strong>
                  <p>
                    {assessedCount
                      ? `${assessedCount} of ${progress.areas.length} areas assessed`
                      : 'Track developmental milestones across key areas'}
                  </p>
                </div>
              </div>
              <div className="prog-legend">
                <span className="prog-legend-item">
                  <i className="tone-secure" /> Secure
                </span>
                <span className="prog-legend-item">
                  <i className="tone-emerging" /> Emerging
                </span>
              </div>
            </div>

            {assessedCount === 0 ? (
              <div className="prog-empty">
                <motion.div
                  className="prog-empty-visual"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Inbox size={36} strokeWidth={1.4} />
                </motion.div>
                <strong>No Data</strong>
                <p>Create an assessment to start tracking development areas.</p>
                <button type="button" className="ui-btn ui-btn-primary" onClick={openAssess}>
                  Create Assessment
                </button>
              </div>
            ) : (
              <>
                <div className="prog-stats">
                  <motion.div
                    className="prog-stat"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 }}
                  >
                    <em>{secureCount}</em>
                    <span>Secure</span>
                  </motion.div>
                  <motion.div
                    className="prog-stat emerging"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <em>{emergingCount}</em>
                    <span>Emerging</span>
                  </motion.div>
                  <motion.div
                    className="prog-stat muted"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <em>{progress.areas.length - assessedCount}</em>
                    <span>Pending</span>
                  </motion.div>
                </div>

                <div className="prog-table-shell">
                  <div className="prog-table-head">Development Areas</div>
                  <ul className="prog-area-list">
                    {progress.areas.map((area, i) => (
                      <motion.li
                        key={area.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.28, ease }}
                      >
                        <div className="prog-area-name">{area.name}</div>
                        <div className="prog-area-level">
                          {area.scaleLevel || area.level ? (
                            <span
                              className={`prog-level is-${(area.level ?? 'emerging').toLowerCase()}`}
                            >
                              {area.scaleLevel ?? area.level}
                            </span>
                          ) : (
                            <span className="prog-level is-none">Not assessed</span>
                          )}
                        </div>
                        <div className="prog-area-bar" aria-hidden>
                          <span
                            className={`prog-area-fill${
                              area.level === 'Secure'
                                ? ' is-secure'
                                : area.level === 'Emerging'
                                  ? ' is-emerging'
                                  : ''
                            }`}
                            style={{
                              width:
                                area.level === 'Secure'
                                  ? '100%'
                                  : area.level === 'Emerging'
                                    ? '55%'
                                    : '0%',
                            }}
                          />
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </motion.section>
        ) : (
          <motion.section
            key={subTab}
            className="prog-panel prog-panel-records"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            <ProgressRecordsList
              kind={kindForTab(subTab)!}
              studentId={student.id}
              records={records}
              onAdd={() => openCreate(kindForTab(subTab)!)}
              onEdit={(r) => openCreate(r.kind, r)}
              onDelete={(id) => {
                setRecords((prev) => deleteProgressRecord(prev, id));
                setToast('Entry deleted');
              }}
            />
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
