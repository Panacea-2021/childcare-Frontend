'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DailyReportsHeader } from '@/components/parent-communication/daily-reports/DailyReportsHeader';
import { DailyReportsStats } from '@/components/parent-communication/daily-reports/DailyReportsStats';
import { DailyReportsFilters } from '@/components/parent-communication/daily-reports/DailyReportsFilters';
import { DailyReportsTable } from '@/components/parent-communication/daily-reports/DailyReportsTable';
import { BulkActionsBar } from '@/components/parent-communication/daily-reports/BulkActionsBar';
import { ConfigureChecklistModal } from '@/components/parent-communication/daily-reports/ConfigureChecklistModal';
import { GenerateReportModal } from '@/components/parent-communication/daily-reports/GenerateReportModal';
import { AddActivityModal } from '@/components/parent-communication/daily-reports/AddActivityModal';
import { ReportViewSheet } from '@/components/parent-communication/daily-reports/ReportViewSheet';
import { WhatsAppPreviewModal } from '@/components/parent-communication/daily-reports/WhatsAppPreviewModal';
import { ReportPreviewModal } from '@/components/parent-communication/daily-reports/ReportPreviewModal';
import { ClassroomReportModal } from '@/components/parent-communication/daily-reports/ClassroomReportModal';
import { EmptyState } from '@/components/parent-communication/daily-reports/EmptyState';
import { LoadingSkeleton } from '@/components/parent-communication/daily-reports/LoadingSkeleton';
import { ToastStack } from '@/components/parent-communication/daily-reports/ToastStack';
import type { RowAction } from '@/components/parent-communication/daily-reports/ActionMenu';
import {
  computeStats,
  enabledChecklist,
  filterReports,
  nowTimeLabel,
} from '@/components/parent-communication/daily-reports/utils';
import {
  DEFAULT_CHECKLIST,
  MOCK_ROOM_DAILY_REPORTS,
  recalculateReport,
} from '@/lib/mock/mockDailyReports';
import type {
  ChecklistItemDef,
  DailyReportFilterState,
  DailyReportToast,
  RoomDailyReport,
} from '@/types/dailyReport';
import '@/components/modules/calendar/calendar.css';
import '@/components/modules/enquiries/enquiries.css';
import '@/components/parent-communication/parent-communication-page.css';
import '@/components/parent-communication/daily-reports/daily-reports.css';

const INITIAL_FILTERS: DailyReportFilterState = {
  room: 'all',
  search: '',
};

export default function DailyReportsPage() {
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<ChecklistItemDef[]>(DEFAULT_CHECKLIST);
  const [reports, setReports] = useState<RoomDailyReport[]>(MOCK_ROOM_DAILY_REPORTS);
  const [filters, setFilters] = useState<DailyReportFilterState>(INITIAL_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<DailyReportToast[]>([]);

  const [configureOpen, setConfigureOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [classroomOpen, setClassroomOpen] = useState(false);
  const [viewReport, setViewReport] = useState<RoomDailyReport | null>(null);
  const [editingReport, setEditingReport] = useState<RoomDailyReport | null>(null);
  const [addActivityReport, setAddActivityReport] = useState<RoomDailyReport | null>(null);
  const [whatsappReport, setWhatsappReport] = useState<RoomDailyReport | null>(null);
  const [previewReport, setPreviewReport] = useState<RoomDailyReport | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  const pushToast = (
    type: DailyReportToast['type'],
    title: string,
    message: string,
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  };

  const filtered = useMemo(() => filterReports(reports, filters), [reports, filters]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const hasEnabledChecklist = enabledChecklist(checklist).length > 0;
  const liveViewReport = viewReport
    ? (reports.find((r) => r.id === viewReport.id) ?? viewReport)
    : null;

  const upsertReport = (report: RoomDailyReport) => {
    setReports((prev) => {
      const exists = prev.some((r) => r.id === report.id);
      if (exists) return prev.map((r) => (r.id === report.id ? report : r));
      return [report, ...prev];
    });
  };

  const handleToggleItem = (reportId: string, itemId: string) => {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== reportId) return report;
        const items = report.items.map((item) => {
          if (item.itemId !== itemId) return item;
          const completed = !item.completed;
          return {
            ...item,
            completed,
            completedAt: completed ? nowTimeLabel() : undefined,
            completedBy: completed ? 'Ms. Ananya' : undefined,
            incident:
              completed && itemId === 'cl-incident'
                ? item.incident ?? {
                    type: 'Minor Injury',
                    description: 'Minor scratch while playing.',
                    severity: 'low' as const,
                    notifyParent: true,
                  }
                : completed
                  ? item.incident
                  : undefined,
          };
        });
        return recalculateReport({ ...report, items }, checklist);
      }),
    );
  };

  const handleChecklistSave = (next: ChecklistItemDef[]) => {
    setChecklist(next);
    setReports((prev) => prev.map((r) => recalculateReport(r, next)));
    pushToast('success', 'Checklist updated', 'Room columns now match the configured checklist.');
  };

  const handleRowAction = (report: RoomDailyReport, action: RowAction) => {
    switch (action) {
      case 'view':
        setViewReport(report);
        break;
      case 'edit':
        setEditingReport(report);
        setGenerateOpen(true);
        break;
      case 'add_activity':
        setAddActivityReport(report);
        break;
      case 'duplicate': {
        const copy: RoomDailyReport = {
          ...report,
          id: `room-dr-dup-${Date.now()}`,
          status: 'draft',
          extraItems: report.extraItems.map((e) => ({ ...e })),
          items: report.items.map((i) => ({ ...i })),
        };
        setReports((prev) => [copy, ...prev]);
        pushToast('success', 'Report duplicated', `${report.room} report was copied.`);
        break;
      }
      case 'download':
      case 'print':
        setPreviewReport(report);
        break;
      case 'whatsapp':
        setWhatsappReport(report);
        break;
      case 'email':
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, status: 'sent' } : r)),
        );
        pushToast('success', 'Email sent', `Daily report emailed for ${report.room}.`);
        break;
      case 'app':
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, status: 'sent' } : r)),
        );
        pushToast('success', 'App notification sent', `Parents of ${report.room} were notified.`);
        break;
      case 'delete':
        setReports((prev) => prev.filter((r) => r.id !== report.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(report.id);
          return next;
        });
        pushToast('info', 'Report deleted', `${report.room} report was removed.`);
        break;
      default:
        break;
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (filtered.length > 0 && filtered.every((r) => prev.has(r.id))) return new Set();
      return new Set(filtered.map((r) => r.id));
    });
  };

  return (
    <div className="pc-page pc-page--daily-reports dr-container">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <DailyReportsHeader
            onGenerate={() => {
              setEditingReport(null);
              setGenerateOpen(true);
            }}
            onConfigure={() => setConfigureOpen(true)}
            onDownload={async () => {
              pushToast(
                'success',
                'Download started',
                `${filtered.length} room report PDFs prepared (demo).`,
              );
            }}
            onClassroomSend={() => setClassroomOpen(true)}
          />

          <DailyReportsStats
            totalRooms={stats.totalRooms}
            completed={stats.completed}
            pending={stats.pending}
            sent={stats.sent}
            attendance={stats.attendance}
            incidents={stats.incidents}
          />

          <DailyReportsFilters
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
          />

          <AnimatePresence>
            {selectedIds.size > 0 ? (
              <BulkActionsBar
                key="bulk"
                count={selectedIds.size}
                onClear={() => setSelectedIds(new Set())}
                onMarkCompleted={() => {
                  setReports((prev) =>
                    prev.map((r) => {
                      if (!selectedIds.has(r.id)) return r;
                      const items = r.items.map((i) =>
                        i.itemId === 'cl-incident'
                          ? i
                          : {
                              ...i,
                              completed: true,
                              completedAt: i.completedAt || nowTimeLabel(),
                              completedBy: i.completedBy || 'Ms. Ananya',
                            },
                      );
                      return recalculateReport({ ...r, items, status: 'completed' }, checklist);
                    }),
                  );
                  pushToast(
                    'success',
                    'Marked completed',
                    `${selectedIds.size} reports completed.`,
                  );
                  setSelectedIds(new Set());
                }}
                onDelete={() => {
                  setReports((prev) => prev.filter((r) => !selectedIds.has(r.id)));
                  pushToast('info', 'Deleted', `${selectedIds.size} reports removed.`);
                  setSelectedIds(new Set());
                }}
              />
            ) : null}
          </AnimatePresence>

          {!hasEnabledChecklist ? (
            <EmptyState
              variant="checklist"
              actionLabel="Configure Checklist"
              onAction={() => setConfigureOpen(true)}
            />
          ) : filtered.length === 0 ? (
              <EmptyState
                variant={reports.length === 0 ? 'reports' : 'students'}
                onAction={() => {
                  setEditingReport(null);
                  setGenerateOpen(true);
                }}
              />
            ) : (
              <DailyReportsTable
                reports={filtered}
                checklist={checklist}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onToggleItem={handleToggleItem}
                onRowAction={handleRowAction}
              />
            )}
          </>
        )}

      <ConfigureChecklistModal
        open={configureOpen}
        checklist={checklist}
        onClose={() => setConfigureOpen(false)}
        onSave={handleChecklistSave}
      />

      <GenerateReportModal
        open={generateOpen}
        checklist={checklist}
        editing={editingReport}
        onClose={() => {
          setGenerateOpen(false);
          setEditingReport(null);
        }}
        onSaveDraft={(report) => {
          upsertReport({ ...report, status: 'draft' });
          setGenerateOpen(false);
          setEditingReport(null);
          pushToast('success', 'Draft saved', `${report.room} report saved as draft.`);
        }}
        onPublish={(report) => {
          upsertReport(report);
          setGenerateOpen(false);
          setEditingReport(null);
          pushToast('success', 'Report published', `${report.room} daily report is ready.`);
        }}
      />

      <AddActivityModal
        open={Boolean(addActivityReport)}
        report={addActivityReport}
        onClose={() => setAddActivityReport(null)}
        onAdd={({ reportId, item, time, remarks }) => {
          setReports((prev) =>
            prev.map((r) => {
              if (r.id !== reportId) return r;
              const next: RoomDailyReport = {
                ...r,
                extraItems: [...r.extraItems, item],
                items: [
                  ...r.items,
                  {
                    itemId: item.id,
                    completed: true,
                    completedAt: time || nowTimeLabel(),
                    completedBy: 'Ms. Ananya',
                    remarks,
                  },
                ],
              };
              return recalculateReport(next, checklist);
            }),
          );
          pushToast(
            'success',
            'Activity added',
            `${item.name} added for this room and is now a checklist column.`,
          );
        }}
      />

      <ReportViewSheet
        open={Boolean(liveViewReport)}
        report={liveViewReport}
        checklist={checklist}
        onClose={() => setViewReport(null)}
        onEdit={() => {
          if (!liveViewReport) return;
          setEditingReport(liveViewReport);
          setViewReport(null);
          setGenerateOpen(true);
        }}
        onSendWhatsApp={() => {
          if (!liveViewReport) return;
          setWhatsappReport(liveViewReport);
        }}
      />

      <WhatsAppPreviewModal
        open={Boolean(whatsappReport)}
        report={whatsappReport}
        checklist={checklist}
        onClose={() => setWhatsappReport(null)}
        onSend={() => {
          if (!whatsappReport) return;
          setReports((prev) =>
            prev.map((r) =>
              r.id === whatsappReport.id ? { ...r, status: 'sent', notifyParent: true } : r,
            ),
          );
          setWhatsappReport(null);
          pushToast(
            'success',
            'WhatsApp sent',
            `Classroom update sent for ${whatsappReport.room} (demo).`,
          );
        }}
      />

      <ReportPreviewModal
        open={Boolean(previewReport)}
        report={previewReport}
        checklist={checklist}
        onClose={() => setPreviewReport(null)}
        onDownload={() =>
          pushToast('success', 'PDF downloaded', 'Classroom report PDF saved (demo).')
        }
        onPrint={() => {
          pushToast('info', 'Printing', 'Opening print dialog…');
          window.setTimeout(() => window.print(), 300);
        }}
      />

      <ClassroomReportModal
        open={classroomOpen}
        reports={filtered}
        onClose={() => setClassroomOpen(false)}
        onSend={(room, ids) => {
          setReports((prev) =>
            prev.map((r) =>
              ids.includes(r.id) ? { ...r, status: 'sent', notifyParent: true } : r,
            ),
          );
          setClassroomOpen(false);
          pushToast(
            'success',
            'Classroom report sent',
            `Parents in ${room} were notified.`,
          );
        }}
      />

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />
    </div>
  );
}
