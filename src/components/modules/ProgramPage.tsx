'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { staff as seedStaff, students as seedStudents, badgeClass } from '@/lib/moduleData';
import { useCenterCatalog } from '@/lib/center-management/programCatalog';
import {
  addProgram,
  getProgramKpis,
  getPrograms,
  removeProgram,
  subscribePrograms,
  updateProgram,
  type ProgramRecord,
  type ProgramStatus,
} from '@/lib/programsStore';
import {
  getAssignmentInsightStudents,
  removeProgramAssignments,
  subscribeProgramAssignments,
} from '@/lib/programAssignmentsStore';
import { ProgramAddWizard } from '@/components/modules/ProgramAddWizard';
import { ProgramViewPage } from '@/components/modules/ProgramViewPage';
import { ProgramPageHeader } from '@/components/modules/ProgramPageHeader';
import { ProgramReveal } from '@/components/modules/ProgramReveal';
import { FieldDatePicker } from '@/components/modules/view-profile/FieldDatePicker';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import { Layers } from 'lucide-react';
import '@/components/ui/module.css';
import '@/components/modules/view-profile/field-picker.css';
import styles from './ProgramPage.module.css';
import motion from './programMotion.module.css';

type StudentInsightKind = 'starting' | 'leaving' | 'without';
type InsightStudent = { id: string; name: string; date?: string };

type ExportReportType = 'student' | 'program';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const STATUS_OPTIONS = ['All Status', 'Active', 'Expired', 'Upcoming'] as const;

const STATUS_FILTER_OPTIONS = STATUS_OPTIONS.map((s) => ({
  value: s,
  label: s === 'All Status' ? 'All statuses' : s,
}));

function programRoomNames(p: ProgramRecord): string[] {
  return [...new Set([p.room, ...(p.rooms ?? [])].filter(Boolean))];
}

export function ProgramPage() {
  const [view, setView] = useState<'list' | 'add' | 'view'>('list');
  const [programs, setProgramsState] = useState<ProgramRecord[]>(() => getPrograms());
  const [insights, setInsights] = useState(() => getAssignmentInsightStudents());

  useEffect(() => {
    const refresh = () => {
      setProgramsState(getPrograms());
      setInsights(getAssignmentInsightStudents());
    };
    const unsubP = subscribePrograms(refresh);
    const unsubA = subscribeProgramAssignments(refresh);
    return () => {
      unsubP();
      unsubA();
    };
  }, []);
  const [nameFilter, setNameFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('All Rooms');
  const [labelFilter, setLabelFilter] = useState('All Labels');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ bottom: number; right: number } | null>(null);
  const [selected, setSelected] = useState<ProgramRecord | null>(null);
  const [viewing, setViewing] = useState<ProgramRecord | null>(null);
  const [assignIntent, setAssignIntent] = useState<'students' | 'staff' | null>(null);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'staff' | 'students'>('edit');
  const [studentInsight, setStudentInsight] = useState<StudentInsightKind | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState<ExportReportType>('student');
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState('');
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    programId: '',
    startDate: '',
    endDate: '',
    days: [] as string[],
    for: 'Student' as 'Student' | 'Staff',
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuId) return;
    const close = () => {
      setMenuId(null);
      setMenuPos(null);
    };
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if ((t as HTMLElement).closest?.(`[data-program-menu-btn="${menuId}"]`)) return;
      close();
    };
    const onScroll = () => close();
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [menuId]);

  const { roomNames: centerRoomNames, labelNames: programLabelNames } = useCenterCatalog();
  const roomNames = useMemo(() => {
    const names = [...centerRoomNames];
    if (selected?.room && !names.includes(selected.room)) names.push(selected.room);
    selected?.rooms?.forEach((r) => {
      if (r && !names.includes(r)) names.push(r);
    });
    return names;
  }, [centerRoomNames, selected]);

  const roomFilterOptions = useMemo(
    () => [
      { value: 'All Rooms', label: 'All rooms' },
      ...centerRoomNames.map((r) => ({ value: r, label: r })),
    ],
    [centerRoomNames],
  );

  const labelFilterOptions = useMemo(
    () => [
      { value: 'All Labels', label: 'All labels' },
      ...programLabelNames.map((l) => ({ value: l, label: l })),
    ],
    [programLabelNames],
  );

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(nameFilter.trim().toLowerCase());
      const matchesRoom = roomFilter === 'All Rooms' || programRoomNames(p).includes(roomFilter);
      const matchesLabel =
        labelFilter === 'All Labels' || p.labels.includes(labelFilter);
      const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter;
      return matchesName && matchesRoom && matchesLabel && matchesStatus;
    });
  }, [programs, nameFilter, roomFilter, labelFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, filtered.length);

  const startingCount = insights.starting.length;
  const leavingCount = insights.leaving.length;
  const withoutProgramCount = insights.without.length;

  const stats: Array<{
    label: string;
    value: number;
    icon: string;
    tone: string;
    hint: string;
    insight?: StudentInsightKind;
  }> = [
    {
      label: 'Total programs',
      value: programs.length || getProgramKpis().totalPrograms,
      icon: '📚',
      tone: styles.kpiPurple,
      hint: 'Active catalog',
    },
    {
      label: 'Students starting this week',
      value: startingCount,
      icon: '🌱',
      tone: styles.kpiGreen,
      hint: 'New joiners',
      insight: 'starting',
    },
    {
      label: 'Students leaving this week',
      value: leavingCount,
      icon: '👋',
      tone: styles.kpiPink,
      hint: 'Transitions',
      insight: 'leaving',
    },
    {
      label: 'Students without program',
      value: withoutProgramCount,
      icon: '🧩',
      tone: styles.kpiCoral,
      hint: 'Needs assignment',
      insight: 'without',
    },
  ];

  const openStudentInsight = (kind: StudentInsightKind) => {
    setSelected(null);
    setStudentInsight(kind);
  };

  const insightMeta: Record<StudentInsightKind, { label: string; students: InsightStudent[] }> = {
    starting: { label: 'Students starting this week', students: insights.starting },
    leaving: { label: 'Students leaving this week', students: insights.leaving },
    without: { label: 'Students without program', students: insights.without },
  };
  const insightStudents = studentInsight ? insightMeta[studentInsight].students : [];
  const insightTitle = studentInsight ? insightMeta[studentInsight].label : '';

  const openAdd = () => setView('add');

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const downloadCsv = (filename: string, header: string[], lines: string[]) => {
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    if (exportType === 'student') {
      const header = [
        'Student Name',
        'Program Name',
        'Room',
        'Start Date',
        'End Date',
        'Status',
        "Today's Occupancy",
      ];
      // Temporary mock: pair seed students with filtered programs until API exists.
      const lines =
        filtered.length === 0
          ? []
          : seedStudents.flatMap((student) =>
              filtered.map((p) =>
                [
                  student.name,
                  p.name,
                  p.room,
                  p.startDate,
                  p.endDate,
                  p.status,
                  `${p.occupancy} students`,
                ]
                  .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                  .join(','),
              ),
            );
      downloadCsv('program-student-report.csv', header, lines);
    } else {
      const header = [
        'Program Name',
        'Start Date',
        'End Date',
        'Start Time',
        'End Time',
        'Duration',
        'Days',
        'Room',
        'Fee Plan Count',
        'Status',
        "Today's Occupancy",
      ];
      const lines = filtered.map((p) =>
        [
          p.name,
          p.startDate,
          p.endDate,
          p.startTime,
          p.endTime,
          p.durationLabel,
          p.days.join(' '),
          p.room,
          p.feePlanCount,
          p.status,
          `${p.occupancy} students`,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      );
      downloadCsv('program-report.csv', header, lines);
    }

    setExportOpen(false);
    setToast({ message: 'Report generated successfully', tone: 'success' });
  };

  const closeExportModal = () => setExportOpen(false);

  const handleRemoveProgram = (id: string) => {
    removeProgramAssignments(id);
    removeProgram(id);
    setMenuId(null);
    setMenuPos(null);
    if (selected?.id === id) setSelected(null);
    if (viewing?.id === id) {
      setViewing(null);
      setView('list');
    }
  };

  const programCapacity = (prog: ProgramRecord, forWhom: 'Student' | 'Staff') => {
    if (forWhom === 'Student') {
      return (
        (prog.maxStudents ?? 24) + (prog.allowExtraStudents ? prog.extraStudents ?? 0 : 0)
      );
    }
    return (prog.maxStaff ?? 12) + (prog.allowExtraStaff ? prog.extraStaff ?? 0 : 0);
  };

  const runAvailabilityCheck = () => {
    if (!availabilityForm.programId || !availabilityForm.startDate || availabilityForm.days.length === 0) {
      return;
    }
    const prog = programs.find((p) => p.id === availabilityForm.programId);
    if (!prog) return;

    const dayOk = availabilityForm.days.some((d) => prog.days.includes(d));
    const baseCap = programCapacity(prog, availabilityForm.for);
    const used =
      availabilityForm.for === 'Student'
        ? prog.occupancy
        : Math.min(prog.occupancy, prog.maxStaff ?? 12);
    const capacity = dayOk && prog.status === 'Active' ? Math.max(0, baseCap - used) : 0;

    if (capacity > 0) {
      setAvailabilityResult(`Available Capacity : ${capacity}`);
      setToast({ message: `Available capacity is ${capacity}`, tone: 'success' });
    } else {
      setAvailabilityResult('Available Capacity : 0');
      setToast({
        message: dayOk
          ? 'No available capacity for the selected details'
          : 'Not available for the selected day(s)',
        tone: 'error',
      });
    }
  };

  const toggleAvailabilityDay = (day: string) => {
    setAvailabilityForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  };

  const openRowAction = (row: ProgramRecord, mode: 'view' | 'edit' | 'staff' | 'students') => {
    setStudentInsight(null);
    setMenuId(null);
    setMenuPos(null);
    // View and Edit Program both open the same program detail screen.
    // Edit/Delete operations are done via ✎ / 🗑 on Overview.
    if (mode === 'view' || mode === 'edit' || mode === 'staff' || mode === 'students') {
      setSelected(null);
      setViewing(row);
      setAssignIntent(mode === 'staff' || mode === 'students' ? mode : null);
      setView('view');
    }
  };

  const openRowMenu = (rowId: string, btn: HTMLElement) => {
    if (menuId === rowId) {
      setMenuId(null);
      setMenuPos(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      bottom: window.innerHeight - rect.top + 6,
      right: Math.max(8, window.innerWidth - rect.right),
    });
    setMenuId(rowId);
  };

  const activeMenuRow = menuId ? pageRows.find((r) => r.id === menuId) ?? null : null;

  if (view === 'add') {
    return (
      <ProgramAddWizard
        onBack={() => setView('list')}
        onCreated={(record) => {
          addProgram(record);
          setView('list');
          setPage(1);
          setStatusFilter('Active');
          setToast({ message: 'Program created successfully', tone: 'success' });
        }}
      />
    );
  }

  if (view === 'view' && viewing) {
    const liveProgram = programs.find((p) => p.id === viewing.id) ?? viewing;
    return (
      <ProgramViewPage
        program={liveProgram}
        initialAssign={assignIntent}
        onBack={() => {
          setViewing(null);
          setAssignIntent(null);
          setView('list');
        }}
        onDeleted={() => {
          handleRemoveProgram(liveProgram.id);
          setAssignIntent(null);
          setView('list');
        }}
      />
    );
  }


  return (
    <div className={`mod-page ${styles.page}`}>
      <div className={styles.ambient} aria-hidden />
      {toast ? (
        <div
          className={`${styles.toast} ${toast.tone === 'error' ? styles.toastError : styles.toastSuccess}`}
          role="status"
        >
          <span className={styles.toastIcon} aria-hidden>
            {toast.tone === 'error' ? '!' : '✓'}
          </span>
          <span>{toast.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}

      <ProgramPageHeader
        title="Program"
        description="Plan schedules, rooms, and enrollment at a glance."
        icon={<Layers />}
        actions={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => {
                setExportType('student');
                setExportOpen(true);
              }}
              title="Export"
            >
              ⇩ Export
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
              + Add Program
            </button>
          </>
        }
      />

      <div className={styles.stats} role="list" aria-label="Program statistics">
        {stats.map((item, index) => {
          const content = (
            <>
              <div className={styles.kpiLeft}>
                <span className={styles.kpiIcon} aria-hidden>
                  {item.icon}
                </span>
                <div className={styles.kpiCopy}>
                  <span className={styles.kpiLabel}>{item.label}</span>
                  <span className={styles.kpiHint}>{item.hint}</span>
                </div>
              </div>
              <div className={styles.kpiRight}>
                <strong>{item.value}</strong>
              </div>
            </>
          );

          if (item.insight) {
            return (
              <button
                key={item.label}
                type="button"
                className={`${styles.kpi} ${styles.kpiClickable} ${item.tone}`}
                style={{ '--stagger': `${index * 70}ms` } as CSSProperties}
                role="listitem"
                onClick={() => openStudentInsight(item.insight!)}
                aria-label={`View ${item.label}`}
              >
                {content}
              </button>
            );
          }

          return (
            <article
              key={item.label}
              className={`${styles.kpi} ${item.tone}`}
              style={{ '--stagger': `${index * 70}ms` } as CSSProperties}
              role="listitem"
            >
              {content}
            </article>
          );
        })}
      </div>

      <ProgramReveal delayMs={120} className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <p className={styles.panelEyebrow}>Directory</p>
            <h2 className={styles.panelTitle}>Programs overview</h2>
          </div>
        </div>
        <div className={styles.filters}>
          <div className={styles.filterField}>
            <label htmlFor="program-name-filter">Program name</label>
            <div className="ui-search">
              <span>⌕</span>
              <input
                id="program-name-filter"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
              />
            </div>
          </div>
          <div className={styles.filterField}>
            <label htmlFor="program-room-filter">Rooms</label>
            <div className={styles.programFilterDd} id="program-room-filter">
              <SearchableSelect
                value={roomFilter}
                onChange={(value) => {
                  setRoomFilter(value);
                  setPage(1);
                }}
                options={roomFilterOptions}
                searchable
                searchPlaceholder="Search rooms…"
                placeholder="All rooms"
                ariaLabel="Filter by room"
              />
            </div>
          </div>
          <div className={styles.filterField}>
            <label htmlFor="program-label-filter">Labels</label>
            <div className={styles.programFilterDd} id="program-label-filter">
              <SearchableSelect
                value={labelFilter}
                onChange={(value) => {
                  setLabelFilter(value);
                  setPage(1);
                }}
                options={labelFilterOptions}
                searchable
                searchPlaceholder="Search labels…"
                placeholder="All labels"
                ariaLabel="Filter by label"
              />
            </div>
          </div>
          <div className={styles.filterField}>
            <label htmlFor="program-status-filter">Status</label>
            <div className={styles.programFilterDd} id="program-status-filter">
              <SearchableSelect
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as ProgramStatus | 'All Status');
                  setPage(1);
                }}
                options={STATUS_FILTER_OPTIONS}
                searchable={false}
                placeholder="All statuses"
                ariaLabel="Filter by status"
              />
            </div>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => {
              setAvailabilityForm({
                programId: programs[0]?.id || '',
                startDate: '',
                endDate: '',
                days: [],
                for: 'Student',
              });
              setAvailabilityResult('');
              setAvailabilityOpen(true);
            }}
          >
            Check Availability
          </button>
        </div>

        {pageRows.length === 0 ? (
          <EmptyState
            title="No programs found"
            description="Adjust filters or add a new program."
            action={
              <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
                + Add Program
              </button>
            }
          />
        ) : (
          <div className={styles.tableScroll}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Duration</th>
                  <th>Room</th>
                  <th>Fee Plan Count</th>
                  <th>Status</th>
                  <th>Today&apos;s Occupancy</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={motion.rowEnter}
                    style={{ '--stagger': `${index * 45}ms` } as CSSProperties}
                  >
                    <td>
                      <div className={styles.nameCell}>
                        <strong>{row.name}</strong>
                        <span className={styles.metaRow}>
                          <span aria-hidden>📅</span>
                          {row.endDate ? `${row.startDate} - ${row.endDate}` : row.startDate}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.durationCell}>
                        <span className={styles.metaRow}>
                          <span aria-hidden>🕒</span>
                          {row.startTime} - {row.endTime}
                          <span>· {row.durationLabel}</span>
                        </span>
                        <div className={styles.dayPills}>
                          {row.days.map((d) => (
                            <span key={d} className={styles.dayPill} data-day={d}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>{row.room}</td>
                    <td>{row.feePlanCount}</td>
                    <td>
                      <span className={badgeClass(row.status)}>{row.status}</span>
                    </td>
                    <td>
                      {row.occupancy} student{row.occupancy === 1 ? '' : 's'}
                    </td>
                    <td>
                      <div className={styles.rowMenuWrap}>
                        <button
                          type="button"
                          className="mod-icon-btn"
                          title="Actions"
                          aria-label={`Actions for ${row.name}`}
                          data-program-menu-btn={row.id}
                          onClick={(e) => openRowMenu(row.id, e.currentTarget)}
                        >
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.pager}>
          <div className={styles.pagerInfo}>
            Showing {from}-{to} of {filtered.length} results
          </div>
          <div className={styles.pagerControls}>
            <button
              type="button"
              className="ui-page-btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            <button type="button" className="ui-page-btn is-active">
              {safePage}
            </button>
            <button
              type="button"
              className="ui-page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
            <select
              className="ui-filter"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </ProgramReveal>

      {activeMenuRow && menuPos
        ? createPortal(
            <div
              ref={menuRef}
              className={`${styles.menu} ${styles.menuFixed}`}
              role="menu"
              style={{ bottom: menuPos.bottom, right: menuPos.right }}
            >
              <button type="button" role="menuitem" onClick={() => openRowAction(activeMenuRow, 'view')}>
                View Program
              </button>
              <button type="button" role="menuitem" onClick={() => openRowAction(activeMenuRow, 'edit')}>
                Edit Program
              </button>
              <button type="button" role="menuitem" onClick={() => openRowAction(activeMenuRow, 'staff')}>
                Assign Staff
              </button>
              <button type="button" role="menuitem" onClick={() => openRowAction(activeMenuRow, 'students')}>
                Assign Students
              </button>
              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={() => handleRemoveProgram(activeMenuRow.id)}
              >
                Delete Program
              </button>
            </div>,
            document.body,
          )
        : null}

      <Modal
        open={exportOpen}
        title="Export"
        onClose={closeExportModal}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={closeExportModal}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={generateReport}>
              Generate Report
            </button>
          </>
        }
      >
        <div className={styles.exportOptions} role="radiogroup" aria-label="Export report type">
          <label
            className={`${styles.exportOption} ${exportType === 'student' ? styles.exportOptionActive : ''}`}
          >
            <input
              className="ui-radio"
              type="radio"
              name="export-report-type"
              checked={exportType === 'student'}
              onChange={() => setExportType('student')}
            />
            <span className={styles.exportOptionCopy}>
              <strong>Program Student Report</strong>
              <span>Download student profile metadata and the associated program details.</span>
            </span>
          </label>
          <label
            className={`${styles.exportOption} ${exportType === 'program' ? styles.exportOptionActive : ''}`}
          >
            <input
              className="ui-radio"
              type="radio"
              name="export-report-type"
              checked={exportType === 'program'}
              onChange={() => setExportType('program')}
            />
            <span className={styles.exportOptionCopy}>
              <strong>Program Report</strong>
              <span>Download program related information.</span>
            </span>
          </label>
        </div>
      </Modal>

      <Modal
        open={availabilityOpen}
        title="Check Availability"
        onClose={() => setAvailabilityOpen(false)}
        footer={
          <div className={styles.availabilityFooter}>
            <button type="button" className="ui-btn ui-btn-primary" onClick={runAvailabilityCheck}>
              Check Availability
            </button>
            {availabilityResult ? (
              <p className={styles.availabilityCapacity}>{availabilityResult}</p>
            ) : null}
          </div>
        }
      >
        <div className="ui-field">
          <label className="ui-label">
            Program <span className="req">*</span>
          </label>
          <select
            className="ui-select"
            value={availabilityForm.programId}
            onChange={(e) => setAvailabilityForm({ ...availabilityForm, programId: e.target.value })}
          >
            <option value="">Select program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Start Date <span className="req">*</span>
            </label>
            <FieldDatePicker
              value={availabilityForm.startDate}
              onChange={(startDate) => setAvailabilityForm({ ...availabilityForm, startDate })}
              ariaLabel="Availability start date"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">End Date</label>
            <FieldDatePicker
              value={availabilityForm.endDate}
              onChange={(endDate) => setAvailabilityForm({ ...availabilityForm, endDate })}
              ariaLabel="Availability end date"
            />
          </div>
        </div>
        <div className="ui-field">
          <label className="ui-label">
            Day Of Week <span className="req">*</span>
          </label>
          <div className={styles.dayToggles}>
            {WEEK_DAYS.map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.dayToggle} ${availabilityForm.days.includes(d) ? styles.dayToggleActive : ''}`}
                onClick={() => toggleAvailabilityDay(d)}
              >
                {d}
              </button>
            ))}
          </div>
          {availabilityForm.days.length > 0 ? (
            <div className={styles.chips} style={{ marginTop: 8 }}>
              {availabilityForm.days.map((d) => (
                <span key={d} className={styles.chip}>
                  {d === 'Mon'
                    ? 'Monday'
                    : d === 'Tue'
                      ? 'Tuesday'
                      : d === 'Wed'
                        ? 'Wednesday'
                        : d === 'Thu'
                          ? 'Thursday'
                          : d === 'Fri'
                            ? 'Friday'
                            : d === 'Sat'
                              ? 'Saturday'
                              : 'Sunday'}
                  <button type="button" aria-label={`Remove ${d}`} onClick={() => toggleAvailabilityDay(d)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="ui-field">
          <label className="ui-label">Check Availability For</label>
          <div className={styles.radioRow}>
            {(['Student', 'Staff'] as const).map((opt) => (
              <label key={opt} className={styles.radioOption}>
                <input
                  className="ui-radio"
                  type="radio"
                  name="availability-for"
                  checked={availabilityForm.for === opt}
                  onChange={() => setAvailabilityForm({ ...availabilityForm, for: opt })}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <Drawer
        open={Boolean(studentInsight)}
        title={insightTitle}
        meta={`${insightStudents.length} student${insightStudents.length === 1 ? '' : 's'}`}
        plainHeader
        onClose={() => setStudentInsight(null)}
      >
        {insightStudents.length === 0 ? (
          <EmptyState title="No Data" description="No students in this list right now." />
        ) : (
          <ul className={styles.insightList}>
            {insightStudents.map((student) => (
              <li key={student.id} className={styles.insightRow}>
                <span className={styles.insightAvatar} aria-hidden>
                  {student.name.charAt(0).toUpperCase()}
                </span>
                <span className={styles.insightName}>{student.name}</span>
                {'date' in student && student.date ? (
                  <span className={styles.insightDate}>{student.date}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Drawer>

      <Drawer
        open={Boolean(selected)}
        title={
          drawerMode === 'edit' ? 'Edit Program' : drawerMode === 'staff' ? 'Assign Staff' : 'Assign Students'
        }
        onClose={() => setSelected(null)}
      >
        {selected && drawerMode === 'edit' && (
          <div>
            <div className="ui-field">
              <label className="ui-label">Program Name</label>
              <input
                className="ui-input"
                value={selected.name}
                onChange={(e) => setSelected({ ...selected, name: e.target.value })}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Room</label>
              <select
                className="ui-select"
                value={selected.room}
                onChange={(e) => setSelected({ ...selected, room: e.target.value })}
              >
                {roomNames.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="ui-field">
              <label className="ui-label">Status</label>
              <select
                className="ui-select"
                value={selected.status}
                onChange={(e) => setSelected({ ...selected, status: e.target.value as ProgramStatus })}
              >
                {(['Active', 'Expired', 'Upcoming'] as const).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                updateProgram(selected.id, {
                  name: selected.name,
                  room: selected.room,
                  rooms: selected.rooms?.length ? selected.rooms : [selected.room],
                  status: selected.status,
                });
                setSelected(null);
                setToast({ message: 'Program updated', tone: 'success' });
              }}
            >
              Save
            </button>
          </div>
        )}

        {selected && drawerMode === 'staff' && (
          <div className={styles.assignList}>
            {seedStaff.map((s) => (
              <div key={s.id} className={styles.assignRow}>
                <strong>{s.name}</strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto', fontSize: '0.85rem' }}>
                  {s.role}
                </span>
              </div>
            ))}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Staff assignment is saved locally for this demo.
            </p>
          </div>
        )}

        {selected && drawerMode === 'students' && (
          <div className={styles.assignList}>
            {seedStudents.map((s) => (
              <div key={s.id} className={styles.assignRow}>
                <strong>{s.name}</strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto', fontSize: '0.85rem' }}>
                  {s.room}
                </span>
              </div>
            ))}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Student assignment is saved locally for this demo.
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
