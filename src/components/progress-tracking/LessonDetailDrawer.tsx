'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Download,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { resolveLessonDetail } from '@/lib/mock/mockProgressBoard';
import { PROGRESS_STUDENTS, STATUS_META } from '@/lib/mock/mockProgressTracking';
import type { BoardCard, BoardStage } from '@/types/progressBoard';
import { OdFilterDropdown } from './OdFilterDropdown';

type ObsFilter = 'all' | 'introduced' | 'practiced' | 'mastered';

type Props = {
  open: boolean;
  card: BoardCard | null;
  observations: BoardCard[];
  onClose: () => void;
  onEditObservation?: (card: BoardCard) => void;
  onEditLesson?: (card: BoardCard) => void;
  onDeleteLesson?: (card: BoardCard) => void;
};

export function LessonDetailDrawer({
  open,
  card,
  observations,
  onClose,
  onEditObservation,
  onEditLesson,
  onDeleteLesson,
}: Props) {
  const [areasOpen, setAreasOpen] = useState(true);
  const [obsFilter, setObsFilter] = useState<ObsFilter>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAreasOpen(true);
    setObsFilter('all');
    setSortNewest(true);
    setMenuOpen(false);
    setToast(null);
  }, [open, card?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuOpen]);

  const detail = useMemo(() => (card ? resolveLessonDetail(card) : null), [card]);

  const filteredObs = useMemo(() => {
    let list = observations.filter((o) => o.stage !== 'planned');
    if (obsFilter !== 'all') list = list.filter((o) => o.stage === obsFilter);
    if (!sortNewest) list = [...list].reverse();
    return list;
  }, [observations, obsFilter, sortNewest]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  return (
    <Drawer
      open={open && Boolean(card && detail)}
      title={detail?.title ?? 'Lesson'}
      subtitle={detail?.updatedLabel}
      wide
      onClose={onClose}
      headerActions={
        <div className="pb-lesson-menu-wrap">
          <button
            type="button"
            className="pb-icon-btn"
            aria-label="Lesson actions"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && card ? (
            <div className="pb-lesson-menu" role="menu" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEditLesson?.(card);
                }}
              >
                <Pencil size={15} aria-hidden />
                Edit lesson
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  flash('Share link copied');
                }}
              >
                <Share2 size={15} aria-hidden />
                Share with students
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  flash('PDF download started');
                }}
              >
                <Download size={15} aria-hidden />
                Download PDF
              </button>
              <button
                type="button"
                role="menuitem"
                className="is-danger"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteLesson?.(card);
                }}
              >
                <Trash2 size={15} aria-hidden />
                Delete lesson
              </button>
            </div>
          ) : null}
        </div>
      }
    >
      {detail ? (
        <div className="pb-lesson">
          {toast ? <p className="pb-toast">{toast}</p> : null}
          <p className="pb-lesson-eyebrow">Lesson</p>
          <span className="pb-pill">{detail.category}</span>

          <section className="pb-lesson-section">
            <h4>Description</h4>
            {detail.description ? (
              <pre className="pb-lesson-desc">{detail.description}</pre>
            ) : (
              <>
                <div className="pb-lesson-block">
                  <strong>What is it?</strong>
                  <p>{detail.whatIsIt}</p>
                </div>
                <div className="pb-lesson-block">
                  <strong>Why do we do it?</strong>
                  <ul>
                    {detail.why.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="pb-lesson-block">
                  <strong>Supporting interest at home</strong>
                  <ul>
                    {detail.atHome.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </section>

          <dl className="pb-lesson-dl">
            <div>
              <dt>Lesson sets</dt>
              <dd>{detail.lessonSets?.join(', ') || detail.lessonSet}</dd>
            </div>
            <div>
              <dt>Ages</dt>
              <dd>{detail.ageBands?.join(', ') || detail.ages}</dd>
            </div>
            <div>
              <dt>Groups</dt>
              <dd>{detail.groups?.join(', ') || detail.group}</dd>
            </div>
          </dl>

          <section className="pb-lesson-section">
            <h4>
              Media &amp; files
              <span className="pb-count-badge">0</span>
            </h4>
            <div className="pb-media-empty">No media attached.</div>
          </section>

          <section className="pb-lesson-section">
            <h4>
              Areas
              <span className="pb-count-badge">
                {detail.developmentAreas?.length || (detail.category ? 1 : 0)}
              </span>
            </h4>
            <div className="pb-area-card">
              <button
                type="button"
                className="pb-area-head"
                onClick={() => setAreasOpen((v) => !v)}
                aria-expanded={areasOpen}
              >
                <ChevronDown size={16} className={areasOpen ? 'is-open' : ''} aria-hidden />
                <strong>{detail.category}</strong>
                <span>
                  {(detail.groups?.length || (detail.group ? 1 : 0))} Group
                  {(detail.groups?.length ?? 1) === 1 ? '' : 's'}
                </span>
              </button>
              {areasOpen ? (
                <ul className="pb-area-list">
                  {(detail.groups?.length ? detail.groups : [detail.group]).map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>

          <section className="pb-lesson-section">
            <h4>
              Observations
              <span className="pb-count-badge">{filteredObs.length}</span>
            </h4>
            <div className="pb-obs-toolbar">
              <div className="pb-obs-filters" role="group" aria-label="Observation stage">
                {(['all', 'introduced', 'practiced', 'mastered'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`pb-obs-chip${obsFilter === key ? ' is-active' : ''}`}
                    onClick={() => setObsFilter(key)}
                  >
                    {key === 'all' ? 'All' : STATUS_META[key as BoardStage].label}
                  </button>
                ))}
              </div>
              <OdFilterDropdown
                className="pb-obs-sort"
                value={sortNewest ? 'newest' : 'oldest'}
                onChange={(v) => setSortNewest(v === 'newest')}
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                ]}
                ariaLabel="Sort observations"
              />
            </div>

            <div className="pb-obs-list">
              {filteredObs.length === 0 ? (
                <p className="pb-obs-empty">No observations for this filter.</p>
              ) : (
                filteredObs.map((obs) => {
                  const student = PROGRESS_STUDENTS.find((s) => s.id === obs.studentId);
                  const meta = STATUS_META[obs.stage];
                  return (
                    <article key={obs.id} className={`pb-obs-card is-${obs.stage}`}>
                      <div className="pb-obs-card-head">
                        <span className={`pb-stage-badge is-${obs.stage}`} aria-hidden>
                          {meta.code}
                        </span>
                        <div className="pb-obs-card-title">
                          <strong className={`is-${obs.stage}`}>{meta.label}</strong>
                          <span>
                            {obs.date || obs.updatedLabel || 'Recently'} — by {obs.author}
                          </span>
                        </div>
                        {onEditObservation ? (
                          <button
                            type="button"
                            className="pb-obs-edit"
                            onClick={() => onEditObservation(obs)}
                          >
                            <Pencil size={14} aria-hidden />
                            Edit
                          </button>
                        ) : null}
                      </div>
                      <p className="pb-obs-lesson">{obs.lessonTitle}</p>
                      {student ? (
                        <span className="pb-student-tag">@{student.shortName}</span>
                      ) : null}
                      {obs.note ? <p className="pb-obs-note">{obs.note}</p> : null}
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
