'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from 'framer-motion';
import {
  CheckCircle2,
  Download,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import type {
  EmailTemplate,
  ExportOptions,
  FilterValues,
  InstallationRecord,
  SortDir,
  SortKey,
  ToastState,
} from './types';
import {
  DEFAULT_EMAIL_TEMPLATE,
  MOCK_INSTALLATION_RECORDS,
  computeSummary,
  defaultFilters,
  filterRecords,
} from './mockData';
import { downloadParentInstallationExport } from './exportUtils';
import { HeaderAtmosphere } from './HeaderAtmosphere';
import { SummaryCards } from './SummaryCards';
import { FilterSection } from './FilterSection';
import { InstallationTable } from './InstallationTable';
import { ViewDetailsModal } from './ViewDetailsModal';
import { EditParentEmailModal } from './EditParentEmailModal';
import { InviteModal } from './InviteModal';
import { ExportDialog } from './ExportDialog';
import './parent-installation.css';

const PAGE_SIZE = 5;

export function ParentInstallationDashboard() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<InstallationRecord[]>(MOCK_INSTALLATION_RECORDS);
  const [draftFilters, setDraftFilters] = useState<FilterValues>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>(defaultFilters);
  const [sortKey, setSortKey] = useState<SortKey>('studentName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  const [detailsRecord, setDetailsRecord] = useState<InstallationRecord | null>(null);
  const [editRecord, setEditRecord] = useState<InstallationRecord | null>(null);
  const [inviteRecord, setInviteRecord] = useState<InstallationRecord | null>(null);
  const [inviteMode, setInviteMode] = useState<'send' | 'resend'>('send');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
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

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!overflowRef.current?.contains(e.target as Node)) setOverflowOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

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

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openInvite = (record: InstallationRecord | null, mode: 'send' | 'resend') => {
    setInviteRecord(record);
    setInviteMode(mode);
    setInviteOpen(true);
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
              inviteLink: r.inviteLink ?? `https://app.panacea.school/invite/${r.id}`,
            }
          : r,
      ),
    );
  };

  const handleSaveEmail = (
    motherEmail: string,
    fatherEmail: string,
    _notes: string,
    sendInvite: boolean,
  ) => {
    if (!editRecord) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === editRecord.id
          ? {
              ...r,
              mother: { ...r.mother, email: motherEmail },
              father: { ...r.father, email: fatherEmail },
            }
          : r,
      ),
    );
    const id = editRecord.id;
    setEditRecord(null);
    showToast('Email Updated');
    if (sendInvite) {
      markInvited(id);
      showToast('Invitation Sent');
    }
  };

  const handleExport = (options: ExportOptions) => {
    const rows =
      options.scope === 'current_page'
        ? pageRows
        : options.scope === 'filtered'
          ? sorted
          : records;
    downloadParentInstallationExport(rows, options);
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
    setOverflowOpen(false);
    window.setTimeout(() => {
      setRecords([...MOCK_INSTALLATION_RECORDS]);
      setLoading(false);
      showToast('Report refreshed');
    }, 700);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="pai-page"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <header className="pai-header">
          <HeaderAtmosphere />
          <m.div
            className="pai-header-copy"
            initial={reduce ? false : { opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          >
            <h1>Parent App Installation Report</h1>
            <p>Monitor parent invitations and track successful Parent App installations.</p>
          </m.div>
          <div className="pai-header-actions">
            <m.button
              type="button"
              className="ui-btn ui-btn-primary pai-export-btn transition-all duration-200"
              onClick={() => setExportOpen(true)}
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              <Download size={16} className="pai-export-ico" style={{ marginRight: 8 }} />
              Export Excel
            </m.button>
            <div className="pai-overflow" ref={overflowRef}>
              <button
                type="button"
                className="pai-icon-btn pai-icon-btn-lg transition duration-150"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={overflowOpen}
                onClick={() => setOverflowOpen((o) => !o)}
              >
                <MoreHorizontal size={18} />
              </button>
              <AnimatePresence>
                {overflowOpen ? (
                  <m.div
                    className="pai-overflow-menu"
                    role="menu"
                    initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="transition duration-150"
                      onClick={refresh}
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </m.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <SummaryCards summary={summary} loading={loading} />

        <FilterSection
          values={draftFilters}
          onChange={setDraftFilters}
          loading={loading}
          onSearch={() => {
            setAppliedFilters(draftFilters);
            setPage(1);
            window.setTimeout(scrollToTable, 80);
          }}
          onReset={() => {
            const next = defaultFilters();
            setDraftFilters(next);
            setAppliedFilters(next);
            setPage(1);
          }}
        />

        <div ref={tableRef}>
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
              const link = row.inviteLink ?? '';
              if (link && navigator.clipboard?.writeText) {
                void navigator.clipboard.writeText(link);
              }
              showToast('Invitation link copied');
            }}
            onDownloadInvite={() => showToast('Export Started')}
            onEmptyInvite={() => openInvite(null, 'send')}
          />
        </div>

        <ViewDetailsModal
          open={!!detailsRecord}
          record={detailsRecord}
          onClose={() => setDetailsRecord(null)}
          onEditEmail={() => {
            if (detailsRecord) setEditRecord(detailsRecord);
          }}
          onResendInvite={() => {
            if (!detailsRecord) return;
            const row = detailsRecord;
            setDetailsRecord(null);
            openInvite(row, 'resend');
          }}
        />

        <EditParentEmailModal
          open={!!editRecord}
          record={editRecord}
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
          onClose={() => setExportOpen(false)}
          onExport={handleExport}
        />

        <AnimatePresence>
          {toast ? (
            <m.div
              className={`pai-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}
              role="status"
              aria-live="polite"
              initial={reduce ? false : { opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {toast.type === 'ok' ? (
                <m.span
                  className="pai-toast-check"
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                >
                  <CheckCircle2 size={18} />
                </m.span>
              ) : (
                <strong>! </strong>
              )}
              {toast.message}
            </m.div>
          ) : null}
        </AnimatePresence>
      </m.div>
    </LazyMotion>
  );
}
