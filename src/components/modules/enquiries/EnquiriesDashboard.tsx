'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type {
  EnquiryFilters,
  EnquiryRecord,
  EnquiryViewMode,
  ListColumnKey,
  PendingStageMove,
} from './types';
import type { EnquiryStageConfig, EnquirySource, LostReason } from '@/lib/enquiries/types';
import {
  DEFAULT_STAGES,
  DEFAULT_LOST_REASONS,
  loadStages,
  saveStages,
  loadLostReasons,
  saveLostReasons,
} from '@/lib/enquiries/stagesStore';
import {
  DEFAULT_SOURCES,
  loadSources,
  saveSources,
} from '@/lib/enquiries/sourcesStore';
import {
  SEED_ENQUIRIES,
  buildEnquiryStats,
  DEFAULT_ENQUIRY_FILTERS,
  filterEnquiries,
} from './mockData';
import { EnquiryStats } from './EnquiryStats';
import { EnquiriesHeader } from './EnquiriesHeader';
import { pageMotion } from './animations';
import { DEFAULT_VISIBLE_COLUMNS } from './columns-dropdown';
import {
  BoardFilters,
  BoardHeader,
  EnquiryBoard,
  EnquiryList,
  MoveConfirmDialog,
} from './board';
import '@/components/ui/module.css';
import './enquiries.css';

const AddEnquiryModal = dynamic(
  () => import('./AddEnquiryModal').then((m) => m.AddEnquiryModal),
  { ssr: false },
);

const StageManagementDialog = dynamic(
  () => import('./stage-management-dialog').then((m) => m.StageManagementDialog),
  { ssr: false },
);

const SourceManagementDialog = dynamic(
  () => import('./source-management-dialog').then((m) => m.SourceManagementDialog),
  { ssr: false },
);

const EnquiryImportDialog = dynamic(
  () => import('./enquiry-import-dialog').then((m) => m.EnquiryImportDialog),
  { ssr: false },
);

type ModalMode = 'create' | 'edit' | 'view';

export const EnquiriesDashboard = memo(function EnquiriesDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<EnquiryRecord[]>(SEED_ENQUIRIES);
  const [filters, setFilters] = useState<EnquiryFilters>({ ...DEFAULT_ENQUIRY_FILTERS });
  const [viewMode, setViewMode] = useState<EnquiryViewMode>('board');
  const [visibleColumns, setVisibleColumns] =
    useState<Record<ListColumnKey, boolean>>(DEFAULT_VISIBLE_COLUMNS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingEnquiry, setEditingEnquiry] = useState<EnquiryRecord | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [defaultStage, setDefaultStage] = useState<string | undefined>();
  const [stagesOpen, setStagesOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingStageMove | null>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const [stages, setStages] = useState<EnquiryStageConfig[]>(DEFAULT_STAGES);
  const [lostReasons, setLostReasons] = useState<LostReason[]>(DEFAULT_LOST_REASONS);
  const [sources, setSources] = useState<EnquirySource[]>(DEFAULT_SOURCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStages(loadStages());
    setLostReasons(loadLostReasons());
    setSources(loadSources());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const onChangeStages = useCallback((next: EnquiryStageConfig[]) => {
    const ordered = next.map((s, i) => ({ ...s, order: i }));
    setStages(ordered);
    saveStages(ordered);
  }, []);

  const onChangeLostReasons = useCallback((next: LostReason[]) => {
    const ordered = next.map((r, i) => ({ ...r, order: i }));
    setLostReasons(ordered);
    saveLostReasons(ordered);
  }, []);

  const onChangeSources = useCallback((next: EnquirySource[]) => {
    setSources(next);
    saveSources(next);
  }, []);

  const stats = useMemo(() => buildEnquiryStats(items, stages), [items, stages]);

  const stageColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stages) map.set(s.name, s.color);
    return map;
  }, [stages]);

  const sourceNames = useMemo(() => {
    const fromStore = sources
      .filter((s) => s.status === 'Active')
      .map((s) => s.name);
    const fromItems = items.map((i) => i.source);
    return Array.from(new Set([...fromStore, ...fromItems])).sort();
  }, [sources, items]);

  const filtered = useMemo(() => filterEnquiries(items, filters), [items, filters]);

  const onFilterChange = useCallback((patch: Partial<EnquiryFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const onFilterReset = useCallback(() => {
    setFilters({ ...DEFAULT_ENQUIRY_FILTERS });
  }, []);

  const onCreate = useCallback((record: EnquiryRecord) => {
    setItems((prev) => [record, ...prev]);
    setFilters((prev) => ({ ...prev, search: '', stage: 'All' }));
    setDefaultStage(undefined);
  }, []);

  const onUpdate = useCallback((record: EnquiryRecord) => {
    setItems((prev) => prev.map((item) => (item.id === record.id ? record : item)));
  }, []);

  const onImported = useCallback((rows: EnquiryRecord[]) => {
    setItems((prev) => [...rows, ...prev]);
    setImportOpen(false);
  }, []);

  const applyStageMove = useCallback((enquiryId: string, toStage: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== enquiryId || item.stage === toStage) return item;
        const activity = {
          id: `act-${Date.now()}`,
          type: 'stage' as const,
          title: `Moved to ${toStage}`,
          description: `From ${item.stage}`,
          at: new Date().toISOString(),
        };
        return {
          ...item,
          stage: toStage,
          activities: [activity, ...(item.activities ?? [])],
        };
      }),
    );
  }, []);

  const onRequestMove = useCallback((move: PendingStageMove) => {
    if (move.fromStage === move.toStage) return;
    setPendingMove(move);
  }, []);

  const onConfirmMove = useCallback(() => {
    if (!pendingMove) return;
    applyStageMove(pendingMove.enquiryId, pendingMove.toStage);
    setPendingMove(null);
  }, [pendingMove, applyStageMove]);

  const onCancelMove = useCallback(() => setPendingMove(null), []);

  const onView = useCallback((item: EnquiryRecord) => {
    setModalMode('view');
    setEditingEnquiry(item);
    setModalOpen(true);
  }, []);

  const onEdit = useCallback((item: EnquiryRecord) => {
    setModalMode('edit');
    setEditingEnquiry(item);
    setModalOpen(true);
  }, []);

  const onTour = useCallback(
    (item: EnquiryRecord) => {
      const params = new URLSearchParams({
        enquiryId: item.id,
        student: item.studentName,
        parent: item.motherName || item.fatherName || '',
        phone: item.motherPhone || item.fatherPhone || '',
        email: item.motherEmail || item.fatherEmail || '',
        gender: item.gender || '',
        faculty: item.assignedTo && item.assignedTo !== 'Unassigned' ? item.assignedTo : '',
        audience: 'enquiry',
        child: item.studentName,
      });
      router.push(`/enquiries/tour?${params.toString()}`);
    },
    [router],
  );

  const onQuickMove = useCallback(
    (item: EnquiryRecord, toStage: string) => {
      onRequestMove({
        enquiryId: item.id,
        studentName: item.studentName,
        fromStage: item.stage,
        toStage,
      });
    },
    [onRequestMove],
  );

  const openModal = useCallback((stageName?: string) => {
    setModalMode('create');
    setEditingEnquiry(null);
    setDefaultStage(stageName);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalMode('create');
    setEditingEnquiry(null);
    setDefaultStage(undefined);
  }, []);

  return (
    <motion.div
      className="enq-page mod-page"
      initial={pageMotion.initial}
      animate={pageMotion.animate}
      transition={pageMotion.transition}
    >
      <div className="enq-ambient" aria-hidden>
        <span className="enq-blob b1" />
        <span className="enq-blob b2" />
        <span className="enq-blob b3" />
      </div>

      <EnquiriesHeader
        onManageStages={() => setStagesOpen(true)}
        onManageSources={() => setSourcesOpen(true)}
        onAdd={() => openModal()}
      />

      <EnquiryStats stats={stats} />

      <motion.div
        className="enq-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <BoardFilters
          filters={filters}
          stages={stages}
          sources={sourceNames}
          viewMode={viewMode}
          visibleColumns={visibleColumns}
          currentViewItems={filtered}
          filteredItems={filtered}
          allItems={items}
          onChange={onFilterChange}
          onReset={onFilterReset}
          onViewModeChange={setViewMode}
          onColumnsChange={setVisibleColumns}
          onImport={() => setImportOpen(true)}
          onAdd={() => openModal()}
        />

        <BoardHeader
          mode={viewMode}
          onModeChange={setViewMode}
          total={items.length}
          filtered={filtered.length}
          showToggle={false}
        />

        {viewMode === 'list' ? (
          <EnquiryList
            items={filtered}
            stages={stages}
            stageColorMap={stageColorMap}
            visible={visibleColumns}
            onView={onView}
            onEdit={onEdit}
            onTour={onTour}
            onQuickMove={onQuickMove}
            onAdd={() => openModal()}
          />
        ) : (
          <div className="enq-board-wrap">
            <EnquiryBoard
              stages={stages}
              items={filtered}
              onView={onView}
              onEdit={onEdit}
              onTour={onTour}
              onAdd={openModal}
              onRequestMove={onRequestMove}
            />
          </div>
        )}
      </motion.div>

      {hydrated ? (
        <>
          <AddEnquiryModal
            open={modalOpen}
            onClose={closeModal}
            onCreate={onCreate}
            onUpdate={onUpdate}
            stages={stages}
            sources={sources}
            lostReasons={lostReasons}
            onManageSources={() => setSourcesOpen(true)}
            defaultStage={defaultStage}
            mode={modalMode}
            editing={editingEnquiry}
          />
          <StageManagementDialog
            open={stagesOpen}
            stages={stages}
            lostReasons={lostReasons}
            onClose={() => setStagesOpen(false)}
            onChangeStages={onChangeStages}
            onChangeLostReasons={onChangeLostReasons}
          />
          <SourceManagementDialog
            open={sourcesOpen}
            sources={sources}
            onClose={() => setSourcesOpen(false)}
            onChange={onChangeSources}
          />
          <EnquiryImportDialog
            open={importOpen}
            sources={sources}
            existingNames={items.map((i) => i.studentName)}
            onClose={() => setImportOpen(false)}
            onImported={onImported}
            onToast={setToast}
          />
        </>
      ) : null}

      <MoveConfirmDialog
        open={!!pendingMove}
        studentName={pendingMove?.studentName ?? ''}
        fromStage={pendingMove?.fromStage ?? ''}
        toStage={pendingMove?.toStage ?? ''}
        fromColor={
          pendingMove ? stageColorMap.get(pendingMove.fromStage) : undefined
        }
        toColor={pendingMove ? stageColorMap.get(pendingMove.toStage) : undefined}
        onCancel={onCancelMove}
        onConfirm={onConfirmMove}
      />

      {toast ? (
        <div className={`enq-toast ${toast.type}`} role="status">
          {toast.message}
        </div>
      ) : null}
    </motion.div>
  );
});
