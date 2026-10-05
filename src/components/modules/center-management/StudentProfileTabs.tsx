'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  ImageIcon,
  MoreVertical,
  Plus,
  Search,
} from 'lucide-react';
import type { Student, StudentNote, WeekDay } from '@/lib/center-management/types';
import { STAFF_OPTIONS } from '@/lib/center-management/studentsStore';
import {
  listActivityMediaForStudent,
  subscribeActivityPosts,
} from '@/lib/parent-communication/activitiesPostsStore';
import { AppMenu, AppSelect, MonthPicker, ProfileTablePagination, useClientPagination } from './ui';
import { AddNoteModal } from './AddNoteModal';

const DAY_TONE: Record<WeekDay, string> = {
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

type TabProps = {
  student: Student;
  onUpdate: (next: Student) => void;
};

export function ProgramsTab({ student }: { student: Student }) {
  const [q, setQ] = useState('');
  const [label, setLabel] = useState('all');
  const [sortKey, setSortKey] = useState<'name' | 'date'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    let list = [...(student.programEnrollments ?? [])];
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((r) => r.programName.toLowerCase().includes(needle));
    }
    if (label !== 'all') {
      list = list.filter((r) => r.labels.includes(label));
    }
    list.sort((a, b) => {
      const av = sortKey === 'name' ? a.programName : a.startDate;
      const bv = sortKey === 'name' ? b.programName : b.startDate;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [student.programEnrollments, q, label, sortKey, sortDir]);

  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(rows, 30, `${q}|${label}|${sortKey}|${sortDir}`);

  const toggleSort = (key: 'name' | 'date') => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <section className="cm-tab-card">
      <div className="cm-tab-card-head cm-tab-card-head-tight">
        <div className="cm-tab-card-title">
          <ClipboardList size={16} />
          <strong>
            Programs <em>({rows.length})</em>
          </strong>
        </div>
        <div className="cm-tab-toolbar cm-tab-toolbar-inline">
          <span className="cm-tab-status-label">
            Program status: <span className="cm-pill-ok">Assigned</span>
          </span>
          <label className="cm-search cm-search-sm">
            <Search size={14} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" />
          </label>
          <div className="cm-toolbar-select">
            <AppSelect
              value={label}
              onChange={setLabel}
              options={[
                { value: 'all', label: 'All Labels' },
                { value: 'Sample', label: 'Sample' },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="cm-table-wrap">
        <table className="ui-table cm-tab-table">
          <thead>
            <tr>
              <th>
                <button type="button" className="cm-th-btn" onClick={() => toggleSort('name')}>
                  Programs
                </button>
              </th>
              <th>Program Stage</th>
              <th>
                <button type="button" className="cm-th-btn" onClick={() => toggleSort('date')}>
                  Date Range
                </button>
              </th>
              <th>Days Of Week</th>
              <th>Labels</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length ? (
              pageItems.map((r) => (
                <tr key={r.id}>
                  <td>{r.programName}</td>
                  <td>{r.stage}</td>
                  <td>
                    {r.startDate} - {r.endDate}
                  </td>
                  <td>
                    <div className="cm-day-row">
                      {r.days.map((d) => (
                        <span key={d} className={`cm-day cm-day-${DAY_TONE[d]}`}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{r.labels.length ? r.labels.join(', ') : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="cm-td-empty">
                  No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ProfileTablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </section>
  );
}

export function AttendanceTab({ student }: { student: Student }) {
  const [month, setMonth] = useState({ year: 2026, month: 7 }); // August
  const records = student.attendanceRecords ?? [];
  const present = records.filter((r) => !r.markedAbsent && !r.leave).length;
  const absent = records.filter((r) => r.markedAbsent).length;
  const leaves = records.filter((r) => r.leave).length;
  const pct = records.length ? Math.round((present / records.length) * 100) : 0;
  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(records, 30, `${month.year}-${month.month}`);

  return (
    <div className="cm-tab-stack">
      <div className="cm-att-stats">
        {[
          { label: 'Attendance %', value: `${pct}%`, tone: 'pct' },
          { label: 'Days Present', value: String(present), tone: 'present' },
          { label: 'Days Absent', value: String(absent), tone: 'absent' },
          { label: 'Leaves count', value: String(leaves), tone: 'leave' },
        ].map((s) => (
          <div key={s.label} className={`cm-att-stat cm-att-stat-${s.tone}`}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <section className="cm-tab-card">
        <div className="cm-tab-card-head cm-tab-card-head-tight">
          <div className="cm-tab-card-title">
            <CalendarDays size={16} />
            <strong>Attendance records</strong>
          </div>
          <MonthPicker value={month} onChange={setMonth} />
        </div>
        <div className="cm-table-wrap">
          <table className="ui-table cm-tab-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Marked Absent</th>
                <th>Leave</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length ? (
                pageItems.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.room}</td>
                    <td>{r.checkIn || '—'}</td>
                    <td>{r.checkOut || '—'}</td>
                    <td>{r.markedAbsent ? 'Yes' : '—'}</td>
                    <td>{r.leave ? 'Yes' : '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="cm-td-empty">
                    No attendance record found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ProfileTablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </div>
  );
}

export function NotesTab({ student, onUpdate }: TabProps) {
  const [createdBy, setCreatedBy] = useState('all');
  const [open, setOpen] = useState(false);
  const notes = student.notes ?? [];
  const staffNames = useMemo(() => {
    const fromNotes = notes.map((n) => n.createdBy).filter(Boolean);
    return [...new Set([...STAFF_OPTIONS.map((s) => s.name), ...fromNotes])];
  }, [notes]);
  const filtered =
    createdBy === 'all' ? notes : notes.filter((n) => n.createdBy === createdBy);
  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(filtered, 30, createdBy);

  return (
    <div className="cm-tab-stack">
      <div className="cm-notes-bar">
        <div className="cm-notes-filter">
          <span>Created By</span>
          <div className="cm-toolbar-select cm-toolbar-select-md">
            <AppSelect
              searchable
              searchPlaceholder="Search staff"
              value={createdBy}
              onChange={setCreatedBy}
              options={[
                { value: 'all', label: 'All' },
                ...staffNames.map((name) => ({ value: name, label: name })),
              ]}
            />
          </div>
        </div>
        <button type="button" className="ui-btn ui-btn-primary" onClick={() => setOpen(true)}>
          <Plus size={15} /> Add note
        </button>
      </div>
      <section className="cm-tab-card cm-tab-card-fill">
        {pageItems.length ? (
          <div className="cm-notes-list">
            {pageItems.map((n) => (
              <article key={n.id} className="cm-note-card">
                <p>{n.description}</p>
                <footer>
                  <span>{n.createdBy}</span>
                  <span>{n.createdAt}</span>
                  {n.mediaName ? <em>{n.mediaName}</em> : null}
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <p className="cm-empty-msg">No Notes Found</p>
        )}
        <ProfileTablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>
      <AddNoteModal
        open={open}
        staffNames={staffNames}
        onClose={() => setOpen(false)}
        onSave={({ description, mediaName, createdBy: by }) => {
          const note: StudentNote = {
            id: `note-${Date.now()}`,
            description,
            mediaName,
            createdBy: by,
            createdAt: new Date().toLocaleString('en-GB'),
          };
          onUpdate({ ...student, notes: [note, ...notes] });
          setOpen(false);
        }}
      />
    </div>
  );
}

export function FormsTab({ student }: { student: Student }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [process, setProcess] = useState('all');
  const forms = useMemo(() => {
    let list = [...(student.forms ?? [])];
    if (q.trim()) list = list.filter((f) => f.title.toLowerCase().includes(q.toLowerCase()));
    if (status !== 'all') list = list.filter((f) => f.status === status);
    if (process !== 'all') list = list.filter((f) => f.process === process);
    return list;
  }, [student.forms, q, status, process]);
  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(forms, 30, `${q}|${status}|${process}`);

  return (
    <section className="cm-tab-card">
      <div className="cm-forms-head">
        <div className="cm-tab-card-title">
          <FileText size={16} />
          <strong>Forms</strong>
        </div>
        <div className="cm-forms-toolbar">
          <label className="cm-search cm-search-sm cm-forms-search">
            <Search size={14} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name"
            />
          </label>
          <div className="cm-toolbar-select">
            <AppSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'Search By Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
          </div>
          <div className="cm-toolbar-select">
            <AppSelect
              value={process}
              onChange={setProcess}
              options={[
                { value: 'all', label: 'All Process' },
                { value: 'Enrollment', label: 'Enrollment' },
                { value: 'Medical', label: 'Medical' },
              ]}
            />
          </div>
          <AppMenu
            align="end"
            minWidth={180}
            items={[
              {
                id: 'xlsx',
                label: 'Download Excel',
                icon: <Download size={15} />,
                onSelect: () => undefined,
              },
            ]}
            trigger={({ buttonProps }) => (
              <button type="button" className="cm-icon-btn" aria-label="Actions" {...buttonProps}>
                <MoreVertical size={16} />
              </button>
            )}
          />
        </div>
      </div>
      <div className="cm-table-wrap">
        <table className="ui-table cm-tab-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Expiry Schedule</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length ? (
              pageItems.map((f) => (
                <tr
                  key={f.id}
                  className={f.sourceFormId ? 'cm-row-clickable' : undefined}
                  style={f.sourceFormId ? { cursor: 'pointer' } : undefined}
                  onClick={() => {
                    if (!f.sourceFormId) return;
                    window.location.href = `/forms/fill/${encodeURIComponent(f.sourceFormId)}`;
                  }}
                >
                  <td>
                    {f.sourceFormId ? (
                      <a
                        href={`/forms/fill/${encodeURIComponent(f.sourceFormId)}`}
                        className="forms-name-link"
                        style={{ fontWeight: 600 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {f.title}
                      </a>
                    ) : (
                      f.title
                    )}
                  </td>
                  <td>{f.date}</td>
                  <td>{f.status}</td>
                  <td>{f.expiryDate || '—'}</td>
                  <td>{f.expirySchedule || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="cm-td-empty">
                  No Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ProfileTablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </section>
  );
}

export function GalleryTab({ student }: { student: Student }) {
  const [filter, setFilter] = useState('all');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    bump();
    return subscribeActivityPosts(bump);
  }, [student.id]);

  const items = useMemo(() => {
    void tick;
    const fromProfile = (student.gallery ?? []).map((g) => ({
      id: g.id,
      type: g.type,
      name: g.name,
      url: g.url || '',
      favourite: Boolean(g.favourite),
      postTitle: g.name,
      activityTypeName: 'Profile',
      source: 'profile' as const,
    }));

    const fromActivities = listActivityMediaForStudent(student.id).map((m) => ({
      id: m.id,
      type: m.type,
      name: m.name,
      url: m.url,
      thumbnail: m.thumbnail,
      favourite: false,
      postTitle: m.postTitle,
      activityTypeName: m.activityTypeName,
      source: 'activity' as const,
    }));

    // Prefer activity media; dedupe profile entries that share the same id suffix
    const seen = new Set(fromActivities.map((i) => i.id));
    const merged = [
      ...fromActivities,
      ...fromProfile.filter((p) => {
        if (seen.has(p.id)) return false;
        // also skip profile clones of activity media: gal-{studentId}-{attId}
        const suffix = p.id.replace(`gal-${student.id}-`, '');
        if (fromActivities.some((a) => a.id.endsWith(suffix) || a.id.includes(suffix))) {
          return false;
        }
        return true;
      }),
    ];
    return merged.filter((i) => Boolean(i.url) && i.url !== '#');
  }, [student.id, student.gallery, tick]);

  const filtered = useMemo(() => {
    if (filter === 'Favourite') return items.filter((g) => g.favourite);
    if (filter === 'Photo') return items.filter((g) => g.type === 'Photo');
    if (filter === 'Video') return items.filter((g) => g.type === 'Video');
    return items;
  }, [items, filter]);

  const { page, setPage, pageSize, setPageSize, total, totalPages, pageItems } =
    useClientPagination(filtered, 30, filter);

  return (
    <section className="cm-tab-card cm-tab-card-fill">
      <div className="cm-forms-head">
        <div className="cm-tab-card-title">
          <ImageIcon size={16} />
          <strong>
            Gallery <em>({filtered.length})</em>
          </strong>
        </div>
        <div className="cm-forms-toolbar">
          <div className="cm-toolbar-select">
            <AppSelect
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All Media' },
                { value: 'Favourite', label: 'Favourite' },
                { value: 'Photo', label: 'Photo' },
                { value: 'Video', label: 'Video' },
              ]}
            />
          </div>
          <button
            type="button"
            className="cm-icon-btn"
            aria-label="Download"
            title="Download"
            onClick={() => {
              const current = pageItems[0];
              if (!current?.url) return;
              const a = document.createElement('a');
              a.href = current.url;
              a.download = current.name || 'gallery-media';
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.click();
            }}
          >
            <ArrowDownToLine size={16} />
          </button>
        </div>
      </div>
      {pageItems.length ? (
        <div className="cm-gallery-grid">
          {pageItems.map((g) => (
            <a
              key={g.id}
              className="cm-gallery-tile cm-gallery-tile--media"
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              title={g.postTitle}
            >
              <span className="cm-gallery-media">
                {g.type === 'Video' ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={'thumbnail' in g && g.thumbnail ? g.thumbnail : g.url} alt="" />
                    <span className="cm-gallery-play" aria-hidden>
                      ▶
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.url} alt="" loading="lazy" />
                )}
              </span>
              <strong>{g.postTitle || g.name}</strong>
              <span>
                {g.type}
                {g.activityTypeName ? ` · ${g.activityTypeName}` : ''}
                {g.favourite ? ' · Favourite' : ''}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="cm-empty-msg">No photos and videos available from activity posts yet.</p>
      )}
      <ProfileTablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </section>
  );
}

export function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="cm-empty-tab">
      <strong>{title}</strong>
      <p style={{ margin: '8px 0 0' }}>This tab will be implemented in a later step.</p>
    </div>
  );
}
