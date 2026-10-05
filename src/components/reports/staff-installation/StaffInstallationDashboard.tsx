'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  EmailTemplate,
  ExportFormat,
  ExportOptions,
  FilterValues,
  SortDir,
  SortKey,
  StaffInstallationRecord,
  ToastState,
} from './types';
import {
  DEFAULT_EMAIL_TEMPLATE,
  MOCK_STAFF_INSTALLATION_RECORDS,
  computeSummary,
  defaultFilters,
  filterRecords,
} from './mockData';
import { downloadStaffInstallationExport } from './exportUtils';
import { HeaderActions } from './HeaderActions';
import { StaffHeroIllustration } from './StaffHeroIllustration';
import { SummaryCards } from './SummaryCards';
import { FilterSection } from './FilterSection';
import { InstallationTable } from './InstallationTable';
import { ViewDetailsModal } from './ViewDetailsModal';
import { EditStaffEmailModal } from './EditStaffEmailModal';
import { InviteModal } from './InviteModal';
import { ExportDialog } from './ExportDialog';
import '../parent-installation/parent-installation.css';
import './staff-installation.css';

const PAGE_SIZE = 5;

export function StaffInstallationDashboard() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<StaffInstallationRecord[]>(MOCK_STAFF_INSTALLATION_RECORDS);
  const [draftFilters, setDraftFilters] = useState<FilterValues>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(defaultFilters);
  const [sortKey, setSortKey] = useState<SortKey>('staffName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const [detailsRecord, setDetailsRecord] = useState<StaffInstallationRecord | null>(null);
  const [editRecord, setEditRecord] = useState<StaffInstallationRecord | null>(null);
  const [inviteRecord, setInviteRecord] = useState<StaffInstallationRecord | null>(null);
  const [inviteMode, setInviteMode] = useState<'send' | 'resend'>('send');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [template, setTemplate] = useState<EmailTemplate>(DEFAULT_EMAIL_TEMPLATE);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(
    () => filterRecords(records, appliedFilters),
    [records, appliedFilters],
  );

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const summary = useMemo(() => computeSummary(filtered), [filtered]);

  const showToast = (message: string, type: 'ok' | 'err' = 'ok') => setToast({ message, type });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openInvite = (record: StaffInstallationRecord | null, mode: 'send' | 'resend') => {
    setInviteRecord(record);
    setInviteMode(mode);
    setInviteOpen(true);
  };

  const openExport = (format: ExportFormat = 'excel') => {
    setExportFormat(format);
    setExportOpen(true);
  };

  const markInvited = (id: string | undefined) => {
    if (!id) return;
    const today = '2026-08-05';
    const time = '10:00 AM';
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              invitationStatus: 'sent',
              lastInviteSent: today,
              lastInviteTime: time,
              inviteLink: r.inviteLink ?? `https://app.panacea.school/staff-invite/${r.id}`,
            }
          : r,
      ),
    );
  };

  const handleSaveEmail = (email: string, _notes: string, sendInvite: boolean) => {
    if (!editRecord) return;
    setRecords((prev) =>
      prev.map((r) => (r.id === editRecord.id ? { ...r, email } : r)),
    );
    const id = editRecord.id;
    setEditRecord(null);
    showToast('Email Updated');
    if (sendInvite) {
      markInvited(id);
      showToast('Invitation Sent');
    }
  };

  const buildExportRows = (options: ExportOptions) => {
    if (options.scope === 'current_page') return pageRows;
    if (options.scope === 'filtered') return sorted;
    return records;
  };

  const handleExport = (options: ExportOptions) => {
    const rows = buildExportRows(options);
    downloadStaffInstallationExport(rows, options);
    setExportOpen(false);
    showToast(
      options.format === 'csv'
        ? 'CSV downloaded'
        : options.format === 'pdf'
          ? 'PDF downloaded'
          : 'Excel downloaded',
    );
  };

  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => {
      setRecords([...MOCK_STAFF_INSTALLATION_RECORDS]);
      setLoading(false);
      showToast('Report refreshed');
    }, 700);
  };

  return (
    <motion.div
      className="pai-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="sai-hero">
        <div className="sai-hero-top">
          <div className="sai-hero-copy">
            <h1>Staff Installation Report</h1>
            <p>Monitor staff invitation status and track successful Staff App installations.</p>
          </div>
          <HeaderActions
            onExportExcel={() => openExport('excel')}
            onRefresh={refresh}
          />
        </div>
        <StaffHeroIllustration />
      </header>

      <SummaryCards summary={summary} loading={loading} />

      <FilterSection
        values={draftFilters}
        onChange={setDraftFilters}
        loading={loading}
        onSearch={() => {
          setAppliedFilters(draftFilters);
          setPage(1);
        }}
        onReset={() => {
          const next = defaultFilters();
          setDraftFilters(next);
          setAppliedFilters(next);
          setPage(1);
        }}
      />

      <InstallationTable
        rows={pageRows}
        loading={loading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        page={safePage}
        pageSize={PAGE_SIZE}
        total={sorted.length}
        onPageChange={setPage}
        onView={setDetailsRecord}
        onEditEmail={setEditRecord}
        onInvite={(row, mode) => openInvite(row, mode)}
        onCopyLink={(row) => {
          const link =
            row.inviteLink ?? `https://app.panacea.school/staff-invite/${row.id}`;
          if (navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(link).then(
              () => showToast('Invitation link copied'),
              () => showToast('Could not copy link', 'err'),
            );
          } else {
            showToast('Clipboard unavailable', 'err');
          }
        }}
        onDownloadInvite={(row) => {
          const link =
            row.inviteLink ?? `https://app.panacea.school/staff-invite/${row.id}`;
          const content = [
            'Staff App Invitation',
            `Staff: ${row.staffName}`,
            `Employee ID: ${row.employeeId}`,
            `Email: ${row.email}`,
            `Campus: ${row.campus}`,
            `Department: ${row.department}`,
            `Designation: ${row.designation}`,
            '',
            `Invitation Link: ${link}`,
          ].join('\n');
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `staff-invitation-${row.employeeId.toLowerCase()}.txt`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          showToast('Invitation downloaded');
        }}
        onEmptyInvite={() => openInvite(null, 'send')}
      />

      <ViewDetailsModal
        open={!!detailsRecord}
        record={detailsRecord}
        onClose={() => setDetailsRecord(null)}
        onEditEmail={() => {
          if (!detailsRecord) return;
          const row = detailsRecord;
          setDetailsRecord(null);
          setEditRecord(row);
        }}
        onResendInvite={() => {
          if (!detailsRecord) return;
          const row = detailsRecord;
          setDetailsRecord(null);
          openInvite(row, 'resend');
        }}
      />

      <EditStaffEmailModal
        open={!!editRecord}
        record={editRecord}
        allRecords={records}
        onClose={() => setEditRecord(null)}
        onSave={handleSaveEmail}
      />

      <InviteModal
        open={inviteOpen}
        mode={inviteMode}
        record={inviteRecord}
        template={template}
        onClose={() => setInviteOpen(false)}
        onSaveTemplate={(tpl) => {
          setTemplate(tpl);
          showToast('Template Saved');
        }}
        onSend={(tpl) => {
          setTemplate(tpl);
          markInvited(inviteRecord?.id);
          setInviteOpen(false);
          showToast(inviteMode === 'resend' ? 'Invitation Resent' : 'Invitation Sent');
        }}
      />

      <ExportDialog
        open={exportOpen}
        initialFormat={exportFormat}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`pai-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <strong>{toast.type === 'ok' ? '✓' : '!'} </strong>
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
