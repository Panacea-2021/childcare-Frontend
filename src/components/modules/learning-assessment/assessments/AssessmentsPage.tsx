'use client';

import { useMemo, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { LearningAssessmentPageHeader } from '../LearningAssessmentPageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { badgeClass } from '@/lib/moduleData';
import { MOCK_STUDENTS } from '@/lib/mock/mockStudents';
import type { StudentAssessment, AssessmentScore, PortfolioEntry } from '@/types/assessment';
import { loadAssessments, saveAssessments, loadPortfolio, savePortfolio } from './store';
import { AssessmentModal } from './AssessmentModal';
import { PortfolioModal } from './PortfolioModal';
import './assessments.css';

const AREA_OPTIONS = [
  'Language',
  'Mathematics',
  'Motor Skills',
  'Social-Emotional',
  'Cognitive',
  'Practical Life',
  'Sensorial',
  'Cultural Studies',
];

const SCORE_ORDER: Record<AssessmentScore, number> = {
  Emerging: 0,
  Developing: 1,
  Proficient: 2,
  Mastered: 3,
};

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[Number(m) - 1]} ${y}`;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<StudentAssessment[]>(() => loadAssessments());
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>(() => loadPortfolio());
  const [tab, setTab] = useState<'assessments' | 'progress' | 'portfolios'>('assessments');
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('All');
  const [score, setScore] = useState<AssessmentScore | 'All'>('All');
  const [room, setRoom] = useState('All');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; editing: StudentAssessment | null }>({
    open: false,
    editing: null,
  });
  const [portfolioModal, setPortfolioModal] = useState(false);
  const [viewing, setViewing] = useState<StudentAssessment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentAssessment | null>(null);
  const [deletePortfolioTarget, setDeletePortfolioTarget] = useState<PortfolioEntry | null>(null);

  const rooms = useMemo(() => Array.from(new Set(assessments.map((a) => a.roomName).filter(Boolean))).sort(), [assessments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assessments.filter((a) => {
      if (q && !`${a.studentName} ${a.area} ${a.roomName}`.toLowerCase().includes(q)) return false;
      if (area !== 'All' && a.area !== area) return false;
      if (score !== 'All' && a.score !== score) return false;
      if (room !== 'All' && a.roomName !== room) return false;
      return true;
    });
  }, [assessments, search, area, score, room]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const stats = useMemo(() => {
    const total = assessments.length;
    const proficient = assessments.filter((a) => a.score === 'Proficient' || a.score === 'Mastered').length;
    const areas = new Set(assessments.map((a) => a.area)).size;
    return [
      { label: 'Assessments', value: total, icon: '📝', tone: 'lavender' as const },
      { label: 'Proficient+', value: proficient, icon: '★', tone: 'mint' as const },
      { label: 'Learning areas', value: areas, icon: '◈', tone: 'beige' as const },
      { label: 'Portfolio entries', value: portfolio.length, icon: '🖼', tone: 'blush' as const },
    ];
  }, [assessments, portfolio]);

  const handleSave = (item: StudentAssessment, isEdit: boolean) => {
    let next: StudentAssessment[];
    if (isEdit) {
      next = assessments.map((a) => (a.id === item.id ? item : a));
    } else {
      next = [item, ...assessments];
    }
    setAssessments(next);
    saveAssessments(next);
    setModal({ open: false, editing: null });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const next = assessments.filter((a) => a.id !== deleteTarget.id);
    setAssessments(next);
    saveAssessments(next);
    setDeleteTarget(null);
  };

  const handleAddPortfolio = (entry: PortfolioEntry) => {
    const next = [entry, ...portfolio];
    setPortfolio(next);
    savePortfolio(next);
    setPortfolioModal(false);
  };

  const handleDeletePortfolio = () => {
    if (!deletePortfolioTarget) return;
    const next = portfolio.filter((p) => p.id !== deletePortfolioTarget.id);
    setPortfolio(next);
    savePortfolio(next);
    setDeletePortfolioTarget(null);
  };

  const progressRows = useMemo(() => {
    const byStudent = new Map<string, { name: string; room: string; latest: StudentAssessment[] }>();
    for (const a of assessments) {
      const entry = byStudent.get(a.studentId) ?? {
        name: a.studentName,
        room: a.roomName,
        latest: [],
      };
      entry.latest.push(a);
      byStudent.set(a.studentId, entry);
    }
    return Array.from(byStudent.values()).map((s) => {
      const best = s.latest.reduce<AssessmentScore>((acc, a) =>
        SCORE_ORDER[a.score] > SCORE_ORDER[acc] ? a.score : acc,
      'Emerging');
      const avg = Math.round(
        s.latest.reduce((sum, a) => sum + SCORE_ORDER[a.score], 0) / s.latest.length,
      );
      const label =
        avg <= 0 ? 'Emerging' : avg === 1 ? 'Developing' : avg === 2 ? 'Proficient' : 'Mastered';
      return { ...s, best, label };
    });
  }, [assessments]);

  const tabs = [
    { id: 'assessments' as const, label: 'Assessments' },
    { id: 'progress' as const, label: 'Progress' },
    { id: 'portfolios' as const, label: 'Portfolios' },
  ];

  return (
    <div className="mod-page as-page">
      <LearningAssessmentPageHeader
        title="Learning & Assessment"
        description="Capture observations and celebrate each child's developmental progress."
        icon={<ClipboardCheck size={22} strokeWidth={2.1} />}
        actions={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPortfolioModal(true)}>
              + Portfolio
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => setModal({ open: true, editing: null })}
            >
              + Add assessment
            </button>
          </>
        }
      />

      <StatCards stats={stats} />

      <div className="as-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`as-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'assessments' ? (
        <div className="mod-panel as-panel">
          <div className="ui-table-toolbar">
            <div className="ui-search">
              <span aria-hidden>⌕</span>
              <input
                placeholder="Search students, areas, rooms…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                aria-label="Search assessments"
              />
            </div>
            <select className="ui-filter" value={area} onChange={(e) => { setArea(e.target.value); setPage(1); }}>
              <option>All</option>
              {AREA_OPTIONS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select className="ui-filter" value={score} onChange={(e) => { setScore(e.target.value as AssessmentScore | 'All'); setPage(1); }}>
              <option>All</option>
              <option>Emerging</option>
              <option>Developing</option>
              <option>Proficient</option>
              <option>Mastered</option>
            </select>
            <select className="ui-filter" value={room} onChange={(e) => { setRoom(e.target.value); setPage(1); }}>
              <option>All</option>
              {rooms.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No assessments found" description="Try a different filter or add a new assessment." />
          ) : (
            <>
              <div className="mod-scroll">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Room</th>
                      <th>Learning area</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Updated by</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="as-student-cell">
                            <span className="as-avatar">{initials(a.studentName)}</span>
                            <span className="as-student-name">{a.studentName}</span>
                          </div>
                        </td>
                        <td>{a.roomName}</td>
                        <td>{a.area}</td>
                        <td>
                          <span className={badgeClass(a.score)}>{a.score}</span>
                        </td>
                        <td>{formatDate(a.date)}</td>
                        <td>{a.updatedBy ?? '—'}</td>
                        <td>
                          <div className="as-row-actions">
                            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setViewing(a)}>
                              View
                            </button>
                            <button
                              type="button"
                              className="ui-btn ui-btn-outline"
                              onClick={() => setModal({ open: true, editing: a })}
                            >
                              Edit
                            </button>
                            <button type="button" className="ui-btn ui-btn-danger" onClick={() => setDeleteTarget(a)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={pageSafe} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      ) : null}

      {tab === 'progress' ? (
        <div className="mod-panel as-panel">
          {progressRows.length === 0 ? (
            <EmptyState title="No progress yet" description="Add assessments to see student progress summaries." />
          ) : (
            <div className="mod-scroll">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Room</th>
                    <th>Assessments</th>
                    <th>Best score</th>
                    <th>Overall level</th>
                  </tr>
                </thead>
                <tbody>
                  {progressRows.map((s) => (
                    <tr key={s.name}>
                      <td>
                        <div className="as-student-cell">
                          <span className="as-avatar">{initials(s.name)}</span>
                          <span className="as-student-name">{s.name}</span>
                        </div>
                      </td>
                      <td>{s.room}</td>
                      <td>{s.latest.length}</td>
                      <td>
                        <span className={badgeClass(s.best)}>{s.best}</span>
                      </td>
                      <td>
                        <span className={badgeClass(s.label)}>{s.label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {tab === 'portfolios' ? (
        <div className="mod-panel as-panel">
          {portfolio.length === 0 ? (
            <EmptyState title="No portfolio entries" description="Add portfolio highlights to showcase each child's learning." />
          ) : (
            <div className="as-portfolio-grid">
              {portfolio.map((p) => (
                <article key={p.id} className="as-portfolio-card">
                  <div className="as-portfolio-head">
                    <span className="as-avatar">{initials(p.studentName)}</span>
                    <div>
                      <strong>{p.studentName}</strong>
                      <span>{p.roomName} · {p.area}</span>
                    </div>
                  </div>
                  <p className="as-portfolio-summary">{p.summary}</p>
                  <div className="as-portfolio-foot">
                    <span>{formatDate(p.date)}</span>
                    <button
                      type="button"
                      className="ui-btn ui-btn-danger"
                      onClick={() => setDeletePortfolioTarget(p)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <AssessmentModal
        open={modal.open}
        editing={modal.editing}
        students={MOCK_STUDENTS}
        defaultArea={area !== 'All' ? area : 'Language'}
        onClose={() => setModal({ open: false, editing: null })}
        onSave={handleSave}
      />

      <PortfolioModal
        open={portfolioModal}
        students={MOCK_STUDENTS}
        areas={AREA_OPTIONS}
        onClose={() => setPortfolioModal(false)}
        onSave={handleAddPortfolio}
      />

      <Drawer open={viewing !== null} title={viewing?.studentName ?? 'Assessment'} onClose={() => setViewing(null)}>
        {viewing ? (
          <div className="as-drawer">
            <div className="as-drawer-row">
              <span>Learning area</span>
              <strong>{viewing.area}</strong>
            </div>
            <div className="as-drawer-row">
              <span>Score</span>
              <strong>
                <span className={badgeClass(viewing.score)}>{viewing.score}</span>
              </strong>
            </div>
            <div className="as-drawer-row">
              <span>Room</span>
              <strong>{viewing.roomName}</strong>
            </div>
            <div className="as-drawer-row">
              <span>Date</span>
              <strong>{formatDate(viewing.date)}</strong>
            </div>
            <div className="as-drawer-row">
              <span>Updated by</span>
              <strong>{viewing.updatedBy ?? '—'}</strong>
            </div>
            {viewing.notes ? (
              <div className="as-drawer-notes">
                <span>Notes</span>
                <p>{viewing.notes}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={deleteTarget !== null}
        title="Delete assessment"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </>
        }
      >
        <p>Delete the {deleteTarget?.area} assessment for <strong>{deleteTarget?.studentName}</strong>?</p>
      </Modal>

      <Modal
        open={deletePortfolioTarget !== null}
        title="Delete portfolio entry"
        onClose={() => setDeletePortfolioTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeletePortfolioTarget(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={handleDeletePortfolio}>
              Delete
            </button>
          </>
        }
      >
        <p>Delete this portfolio entry for <strong>{deletePortfolioTarget?.studentName}</strong>?</p>
      </Modal>
    </div>
  );
}
