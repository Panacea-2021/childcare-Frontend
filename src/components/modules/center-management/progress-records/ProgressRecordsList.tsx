'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Clock3,
  EyeOff,
  FileText,
  MessageCircle,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { resolveLessonTitle } from '@/lib/mock/lessonResolve';
import { loadStudents } from '@/lib/center-management/studentsStore';
import { kindLabel, kindPlural } from '@/lib/center-management/progressRecordsStore';
import type { ProgressRecord, ProgressRecordKind } from '@/types/progressRecord';
import { ProgressRecordDetailDrawer } from './ProgressRecordDetailDrawer';

type Props = {
  kind: ProgressRecordKind;
  studentId: string;
  records: ProgressRecord[];
  onAdd: () => void;
  onEdit: (record: ProgressRecord) => void;
  onDelete: (id: string) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function formatShortDate(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function shortAge(label: string) {
  const m = label.match(/\(([^)]+)\)/);
  return m?.[1] ?? label;
}

export function ProgressRecordsList({
  kind,
  studentId,
  records,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [query, setQuery] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ProgressRecord | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuId) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuId]);

  const studentsById = useMemo(() => {
    const map = new Map(loadStudents().map((s) => [s.id, s]));
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((r) => r.kind === kind && r.studentIds.includes(studentId))
      .filter((r) => {
        if (!q) return true;
        const lessons = r.lessonIds.map((id) => resolveLessonTitle(id)).join(' ');
        const hay = `${r.description} ${r.nextSteps} ${r.authorName} ${r.developmentAreas.join(' ')} ${lessons}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [records, kind, studentId, query]);

  return (
    <div className="pr-list">
      <div className="pr-list-toolbar">
        <label className="pr-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title name"
          />
        </label>
        <motion.button
          type="button"
          className="pr-add-btn"
          aria-label={`Add ${kindLabel(kind)}`}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAdd}
        >
          <Plus size={18} />
        </motion.button>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          className="pr-empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="pr-empty-ico">
            <FileText size={28} strokeWidth={1.4} />
          </div>
          <strong>No {kindPlural(kind).toLowerCase()} yet</strong>
          <p>Create the first {kindLabel(kind).toLowerCase()} for this student.</p>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onAdd}>
            <Plus size={15} />
            Add {kindLabel(kind)}
          </button>
        </motion.div>
      ) : (
        <ul className="pr-cards">
          <AnimatePresence initial={false}>
            {filtered.map((record, i) => {
              const primary =
                studentsById.get(record.studentIds[0] ?? '') ??
                studentsById.get(studentId);
              const shortName = primary?.name.split(/\s+/)[0] ?? 'Student';
              const lessons = record.lessonIds
                .map((id) => resolveLessonTitle(id))
                .filter((t) => t && t !== 'Lesson');
              const title =
                record.description.trim().split('\n')[0]?.slice(0, 80) ||
                kindLabel(record.kind);

              return (
                <motion.li
                  key={record.id}
                  className={`pr-card-item is-${record.kind}`}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: Math.min(i * 0.05, 0.25), duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                >
                  <div className="pr-card-item-head">
                    <span className="pr-avatar tone-rose" aria-hidden>
                      {initials(primary?.name ?? 'ST')}
                    </span>
                    <div className="pr-card-meta">
                      <strong>{shortName}</strong>
                      <span>
                        {formatShortDate(record.date)}
                        <i>·</i>
                        {record.authorName}
                        {record.hiddenFromParents ? (
                          <>
                            <i>·</i>
                            <em className="pr-staff-chip">
                              <EyeOff size={12} /> Staff Only
                            </em>
                          </>
                        ) : null}
                      </span>
                    </div>
                    <span className={`pr-kind-pill is-${record.kind}`}>
                      {kindLabel(record.kind)}
                    </span>
                    <div className="pr-menu-wrap" ref={menuId === record.id ? menuRef : undefined}>
                      <button
                        type="button"
                        className="pr-icon-btn"
                        aria-label="More actions"
                        onClick={() => setMenuId((id) => (id === record.id ? null : record.id))}
                      >
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {menuId === record.id ? (
                          <motion.div
                            className="pr-menu"
                            initial={{ opacity: 0, y: -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.96 }}
                            transition={{ duration: 0.16 }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setMenuId(null);
                                onEdit(record);
                              }}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              className="is-danger"
                              onClick={() => {
                                setMenuId(null);
                                onDelete(record.id);
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>

                  <h4 className="pr-card-title">{kindLabel(record.kind)}</h4>
                  <p className="pr-card-sub">{title}</p>

                  {record.nextSteps ? (
                    <div className="pr-next">
                      <strong>Next steps</strong>
                      <span>{record.nextSteps}</span>
                    </div>
                  ) : null}

                  <div className="pr-tags">
                    {record.developmentAreas.map((a) => (
                      <span key={a} className="pr-tag is-area">
                        {a}
                      </span>
                    ))}
                    {record.ageBands.map((a) => (
                      <span key={a} className="pr-tag is-age">
                        {shortAge(a)}
                      </span>
                    ))}
                    {lessons.map((l) => (
                      <span key={l} className="pr-tag is-lesson">
                        <FileText size={12} />
                        {l}
                      </span>
                    ))}
                  </div>

                  <div className="pr-card-foot">
                    <span>
                      <MessageCircle size={14} /> {record.commentCount} Comments
                    </span>
                    <span>
                      <Clock3 size={14} /> {formatShortDate(record.createdAt)}
                    </span>
                    <button
                      type="button"
                      className="pr-view-link"
                      onClick={() => setViewing(record)}
                    >
                      View details <span aria-hidden>›</span>
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <ProgressRecordDetailDrawer
        record={viewing}
        onClose={() => setViewing(null)}
        onEdit={(r) => {
          setViewing(null);
          onEdit(r);
        }}
      />
    </div>
  );
}
