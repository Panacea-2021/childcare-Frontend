'use client';

import { CalendarDays, EyeOff, FileText, Pencil } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { resolveLessonTitle } from '@/lib/mock/lessonResolve';
import { loadStudents } from '@/lib/center-management/studentsStore';
import { kindLabel } from '@/lib/center-management/progressRecordsStore';
import type { ProgressRecord } from '@/types/progressRecord';

type Props = {
  record: ProgressRecord | null;
  onClose: () => void;
  onEdit: (record: ProgressRecord) => void;
};

function formatDisplayDate(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function ProgressRecordDetailDrawer({ record, onClose, onEdit }: Props) {
  const open = Boolean(record);
  const students = record
    ? loadStudents().filter((s) => record.studentIds.includes(s.id))
    : [];
  const lessons = record
    ? record.lessonIds
        .map((id) => resolveLessonTitle(id))
        .filter((t) => t && t !== 'Lesson')
    : [];

  return (
    <Drawer
      open={open}
      title={record ? kindLabel(record.kind) : 'Details'}
      plainHeader
      onClose={onClose}
      headerActions={
        record ? (
          <button
            type="button"
            className="ui-btn ui-btn-primary pr-edit-btn"
            onClick={() => onEdit(record)}
          >
            <Pencil size={14} />
            Edit {record.kind}
          </button>
        ) : null
      }
    >
      {record ? (
        <div className="pr-detail">
          <div className="pr-detail-badges">
            <span className={`pr-kind-pill is-${record.kind}`}>{kindLabel(record.kind)}</span>
            {record.hiddenFromParents ? (
              <span className="pr-staff-only">
                <EyeOff size={13} />
                Staff only
              </span>
            ) : null}
          </div>

          <h2 className="pr-detail-title">{kindLabel(record.kind)}</h2>
          <p className="pr-detail-by">by {record.authorName}</p>
          <div className="pr-detail-dates">
            <span>
              <CalendarDays size={13} />
              RECORDED FOR {formatDisplayDate(record.date)}
            </span>
            <span>
              <CalendarDays size={13} />
              POSTED ON {formatDisplayDate(record.createdAt)}
            </span>
          </div>

          <section className="pr-detail-block">
            <h3>Labels</h3>
            <div className="pr-tags">
              {record.ageBands.map((a) => (
                <span key={a} className="pr-tag is-age">
                  {a.replace(/^.*\((.+)\).*$/, '$1') || a}
                </span>
              ))}
              {students.map((s) => (
                <span key={s.id} className="pr-tag is-student">
                  @{s.name}
                </span>
              ))}
              {lessons.map((l) => (
                <span key={l} className="pr-tag is-lesson">
                  #{l}
                </span>
              ))}
              {record.developmentAreas.map((a) => (
                <span key={a} className="pr-tag is-area">
                  {a}
                </span>
              ))}
            </div>
          </section>

          <section className="pr-detail-block">
            <h3>Notes</h3>
            <div className="pr-detail-note">
              {record.description || <em>No description</em>}
            </div>
          </section>

          {record.nextSteps ? (
            <section className="pr-detail-block">
              <h3>Next steps</h3>
              <div className="pr-next">{record.nextSteps}</div>
            </section>
          ) : null}

          <section className="pr-detail-dev">
            {record.developmentAreas.length ? (
              <ul>
                {record.developmentAreas.map((a) => (
                  <li key={a}>
                    <FileText size={14} />
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No development areas tagged for this lesson.</p>
            )}
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
