'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  ArrowLeft,
  Copy,
  Download,
  Eye,
  FilePlus2,
  FolderInput,
  FolderPlus,
  LayoutGrid,
  Library,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { LearningAssessmentPageHeader } from '../LearningAssessmentPageHeader';
import { ActionsMenu } from './ActionsMenu';
import { DocumentCard } from './DocumentCard';
import { FolderBreadcrumbs } from './FolderBreadcrumbs';
import { FolderCard } from './FolderCard';
import { DocumentGlyph, FolderGlyph, docTypeTone } from './icons';
import { CURRENT_USER, FILTER_OPTIONS, SORT_OPTIONS } from './constants';
import {
  formatDate,
  loadDocuments,
  loadFolders,
  saveDocuments,
  saveFolders,
  uid,
} from './store';
import {
  cloneFolderTree,
  countFolderItems,
  folderHasChildren,
  getBreadcrumbPath,
  getChildFolders,
  getDescendantFolderIds,
  getFolderDocuments,
  matchesFilter,
  matchesSearch,
  sortDocuments,
  sortFolders,
} from './utils';
import type {
  CurriculumDocument,
  CurriculumFilter,
  CurriculumFolder,
  CurriculumSort,
  DeleteTarget,
  DocumentFormState,
  FolderFormState,
  MoveTarget,
  RenameTarget,
  ViewMode,
} from './types';
import '@/components/ui/module.css';
import '@/components/modules/calendar/calendar.css';
import '@/components/modules/calendar/school/school-calendar.css';
import './curriculum-document.css';

const FolderFormModal = dynamic(
  () => import('./FolderFormModal').then((m) => m.FolderFormModal),
  { ssr: false },
);
const DocumentFormModal = dynamic(
  () => import('./DocumentFormModal').then((m) => m.DocumentFormModal),
  { ssr: false },
);
const DeleteConfirmDialog = dynamic(
  () => import('./DeleteConfirmDialog').then((m) => m.DeleteConfirmDialog),
  { ssr: false },
);
const RenameDialog = dynamic(() => import('./RenameDialog').then((m) => m.RenameDialog), {
  ssr: false,
});
const MoveCopyDialog = dynamic(
  () => import('./MoveCopyDialog').then((m) => m.MoveCopyDialog),
  { ssr: false },
);
const DocumentViewModal = dynamic(
  () => import('./DocumentViewModal').then((m) => m.DocumentViewModal),
  { ssr: false },
);

type Toast = { type: 'ok' | 'err'; message: string };

export function CurriculumDocumentsPage() {
  const [ready, setReady] = useState(false);
  const [folders, setFolders] = useState<CurriculumFolder[]>([]);
  const [documents, setDocuments] = useState<CurriculumDocument[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CurriculumFilter>('all');
  const [sort, setSort] = useState<CurriculumSort>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [folderFormMode, setFolderFormMode] = useState<'create' | 'edit'>('create');
  const [editingFolder, setEditingFolder] = useState<CurriculumFolder | null>(null);
  const [defaultParentId, setDefaultParentId] = useState('');

  const [docFormOpen, setDocFormOpen] = useState(false);
  const [docFormMode, setDocFormMode] = useState<'create' | 'edit'>('create');
  const [editingDoc, setEditingDoc] = useState<CurriculumDocument | null>(null);
  const [defaultFolderId, setDefaultFolderId] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null);
  const [viewDoc, setViewDoc] = useState<CurriculumDocument | null>(null);

  useEffect(() => {
    setFolders(loadFolders());
    setDocuments(loadDocuments());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'ok') => {
    setToast({ message, type });
  }, []);

  const persistFolders = useCallback((next: CurriculumFolder[]) => {
    setFolders(next);
    saveFolders(next);
  }, []);

  const persistDocuments = useCallback((next: CurriculumDocument[]) => {
    setDocuments(next);
    saveDocuments(next);
  }, []);

  const breadcrumb = useMemo(
    () => getBreadcrumbPath(folders, currentFolderId),
    [folders, currentFolderId],
  );

  const folderMap = useMemo(() => new Map(folders.map((f) => [f.id, f])), [folders]);

  const display = useMemo(() => {
    const q = search.trim();
    const deepFilters: CurriculumFilter[] = [
      'documents',
      'archived',
      'recent',
      'mine',
      'pdf',
      'word',
      'excel',
      'images',
    ];
    const useDeep = Boolean(q) || deepFilters.includes(filter);

    if (useDeep) {
      const scopeIds =
        currentFolderId == null
          ? null
          : getDescendantFolderIds(folders, currentFolderId);

      const deepFolders = folders.filter((f) => {
        if (currentFolderId && f.id === currentFolderId) return false;
        if (scopeIds && !scopeIds.has(f.id)) return false;
        return matchesSearch(q, f, null) && matchesFilter(filter, f, null);
      });

      const deepDocs = documents.filter((d) => {
        if (scopeIds && !scopeIds.has(d.folderId)) return false;
        return matchesSearch(q, null, d) && matchesFilter(filter, null, d);
      });

      return {
        folders: sortFolders(deepFolders, sort),
        documents: sortDocuments(deepDocs, sort),
      };
    }

    const childFolders = getChildFolders(folders, currentFolderId);
    const childDocs = currentFolderId
      ? getFolderDocuments(documents, currentFolderId)
      : [];

    return {
      folders: sortFolders(
        childFolders.filter((f) => matchesFilter(filter, f, null)),
        sort,
      ),
      documents: sortDocuments(
        childDocs.filter((d) => matchesFilter(filter, null, d)),
        sort,
      ),
    };
  }, [folders, documents, currentFolderId, search, filter, sort]);

  const excludeForEdit = useMemo(() => {
    if (!editingFolder) return undefined;
    return getDescendantFolderIds(folders, editingFolder.id);
  }, [editingFolder, folders]);

  const openCreateFolder = (parentId?: string) => {
    setFolderFormMode('create');
    setEditingFolder(null);
    setDefaultParentId(parentId ?? currentFolderId ?? '');
    setFolderFormOpen(true);
  };

  const openEditFolder = (folder: CurriculumFolder) => {
    setFolderFormMode('edit');
    setEditingFolder(folder);
    setDefaultParentId(folder.parentId ?? '');
    setFolderFormOpen(true);
  };

  const openCreateDoc = (folderId?: string) => {
    setDocFormMode('create');
    setEditingDoc(null);
    setDefaultFolderId(folderId ?? currentFolderId ?? 'fld-curriculum');
    setDocFormOpen(true);
  };

  const openEditDoc = (doc: CurriculumDocument) => {
    setDocFormMode('edit');
    setEditingDoc(doc);
    setDefaultFolderId(doc.folderId);
    setDocFormOpen(true);
  };

  const handleSaveFolder = async (form: FolderFormState) => {
    const now = new Date().toISOString();
    if (folderFormMode === 'edit' && editingFolder) {
      persistFolders(
        folders.map((f) =>
          f.id === editingFolder.id
            ? {
                ...f,
                name: form.name.trim(),
                parentId: form.parentId || null,
                description: form.description.trim(),
                color: form.color,
                icon: form.icon,
                updatedAt: now,
              }
            : f,
        ),
      );
      showToast('Folder updated successfully');
      return;
    }
    const created: CurriculumFolder = {
      id: uid('fld'),
      name: form.name.trim(),
      parentId: form.parentId || null,
      description: form.description.trim(),
      color: form.color,
      icon: form.icon,
      createdBy: CURRENT_USER,
      createdAt: now,
      updatedAt: now,
    };
    persistFolders([...folders, created]);
    showToast('Folder created successfully');
  };

  const handleSaveDocument = async (form: DocumentFormState) => {
    const now = new Date().toISOString();
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (docFormMode === 'edit' && editingDoc) {
      persistDocuments(
        documents.map((d) =>
          d.id === editingDoc.id
            ? {
                ...d,
                name: form.name.trim(),
                folderId: form.folderId,
                description: form.description.trim(),
                type: form.type,
                tags,
                status: form.status,
                fileName: form.fileName || d.fileName,
                fileUrl: form.fileUrl || d.fileUrl,
                size: form.size || d.size,
                sizeBytes: form.sizeBytes || d.sizeBytes,
                updatedAt: now,
              }
            : d,
        ),
      );
      showToast('Document updated successfully');
      return;
    }

    const created: CurriculumDocument = {
      id: uid('doc'),
      name: form.name.trim(),
      folderId: form.folderId,
      description: form.description.trim(),
      type: form.type,
      size: form.size || '0 B',
      sizeBytes: form.sizeBytes || 0,
      tags,
      status: form.status,
      fileName: form.fileName,
      fileUrl: form.fileUrl || '#',
      createdBy: CURRENT_USER,
      createdAt: now,
      updatedAt: now,
      uploadedAt: now,
    };
    persistDocuments([...documents, created]);
    if (form.folderId !== currentFolderId) {
      setCurrentFolderId(form.folderId);
    }
    showToast('Document uploaded successfully');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const now = new Date().toISOString();
    if (deleteTarget.kind === 'folder') {
      const ids = getDescendantFolderIds(folders, deleteTarget.item.id);
      persistFolders(folders.filter((f) => !ids.has(f.id)));
      persistDocuments(documents.filter((d) => !ids.has(d.folderId)));
      if (currentFolderId && ids.has(currentFolderId)) {
        setCurrentFolderId(deleteTarget.item.parentId);
      }
      showToast('Folder deleted');
      return;
    }
    persistDocuments(documents.filter((d) => d.id !== deleteTarget.item.id));
    // touch parent updatedAt
    persistFolders(
      folders.map((f) =>
        f.id === deleteTarget.item.folderId ? { ...f, updatedAt: now } : f,
      ),
    );
    showToast('Document deleted');
  };

  const handleRename = async (name: string) => {
    if (!renameTarget) return;
    const now = new Date().toISOString();
    if (renameTarget.kind === 'folder') {
      persistFolders(
        folders.map((f) =>
          f.id === renameTarget.item.id ? { ...f, name, updatedAt: now } : f,
        ),
      );
      showToast('Folder renamed');
      return;
    }
    persistDocuments(
      documents.map((d) =>
        d.id === renameTarget.item.id ? { ...d, name, updatedAt: now } : d,
      ),
    );
    showToast('Document renamed');
  };

  const handleMoveCopy = async (destinationFolderId: string | null) => {
    if (!moveTarget) return;
    const now = new Date().toISOString();

    if (moveTarget.kind === 'folder') {
      if (moveTarget.mode === 'copy') {
        const cloned = cloneFolderTree(
          folders,
          documents,
          moveTarget.item.id,
          destinationFolderId,
          CURRENT_USER,
          now,
        );
        persistFolders([...folders, ...cloned.folders]);
        persistDocuments([...documents, ...cloned.documents]);
        showToast('Folder copied');
        return;
      }
      persistFolders(
        folders.map((f) =>
          f.id === moveTarget.item.id
            ? { ...f, parentId: destinationFolderId, updatedAt: now }
            : f,
        ),
      );
      showToast('Folder moved');
      return;
    }

    if (moveTarget.mode === 'copy') {
      const copy: CurriculumDocument = {
        ...moveTarget.item,
        id: uid('doc'),
        folderId: destinationFolderId || moveTarget.item.folderId,
        name: `${moveTarget.item.name.replace(/(\.[^.]+)?$/, ' (Copy)$1')}`,
        createdAt: now,
        updatedAt: now,
        uploadedAt: now,
        createdBy: CURRENT_USER,
      };
      persistDocuments([...documents, copy]);
      showToast('Document duplicated');
      return;
    }

    if (!destinationFolderId) return;
    persistDocuments(
      documents.map((d) =>
        d.id === moveTarget.item.id
          ? { ...d, folderId: destinationFolderId, updatedAt: now }
          : d,
      ),
    );
    showToast('Document moved');
  };

  const downloadDoc = (doc: CurriculumDocument) => {
    if (doc.fileUrl && doc.fileUrl !== '#') {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.fileName || doc.name;
      a.click();
    }
    showToast(`Download started for ${doc.name}`);
  };

  const archiveDoc = (doc: CurriculumDocument) => {
    const now = new Date().toISOString();
    const nextStatus = doc.status === 'Archived' ? 'Active' : 'Archived';
    persistDocuments(
      documents.map((d) =>
        d.id === doc.id ? { ...d, status: nextStatus, updatedAt: now } : d,
      ),
    );
    showToast(nextStatus === 'Archived' ? 'Document archived' : 'Document restored');
  };

  const goBack = () => {
    if (!currentFolderId) return;
    const current = folderMap.get(currentFolderId);
    setCurrentFolderId(current?.parentId ?? null);
  };

  const listRows = useMemo(() => {
    const rows: Array<
      | { kind: 'folder'; item: CurriculumFolder }
      | { kind: 'document'; item: CurriculumDocument }
    > = [
      ...display.folders.map((item) => ({ kind: 'folder' as const, item })),
      ...display.documents.map((item) => ({ kind: 'document' as const, item })),
    ];
    return rows;
  }, [display]);

  const allSelected =
    listRows.length > 0 &&
    listRows.every((r) => selectedIds.includes(`${r.kind}:${r.item.id}`));
  const someSelected = listRows.some((r) => selectedIds.includes(`${r.kind}:${r.item.id}`));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(listRows.map((r) => `${r.kind}:${r.item.id}`));
  };

  if (!ready) {
    return (
      <div className="mod-page cal-page cd-page">
        <div className="cal-ambient" aria-hidden>
          <span className="cal-blob b1" />
          <span className="cal-blob b2" />
          <span className="cal-blob b3" />
          <span className="cal-mesh" />
        </div>
        <div className="cal-page-inner">
          <div className="cd-skeleton" aria-busy="true" aria-label="Loading curriculum documents">
            <div className="cd-skel-bar" />
            <div className="cd-skel-bar short" />
            <div className="cd-skel-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cd-skel-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !display.folders.length && !display.documents.length;

  return (
    <motion.div
      className="mod-page cal-page cd-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="cal-ambient" aria-hidden>
        <span className="cal-blob b1" />
        <span className="cal-blob b2" />
        <span className="cal-blob b3" />
        <span className="cal-mesh" />
        <motion.span
          className="cd-float-orb o1"
          animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="cd-float-orb o2"
          animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <div className="cal-page-inner">
        <LearningAssessmentPageHeader
          title="Curriculum Documents"
          description="Organize curriculum folders and learning frameworks like a cloud drive."
          icon={<Library size={22} strokeWidth={2.1} />}
          actions={
            <>
              <motion.button
                type="button"
                className="ui-btn ui-btn-outline cd-btn-anim"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openCreateFolder()}
              >
                <FolderPlus size={16} aria-hidden />
                Add Folder
              </motion.button>
              <motion.button
                type="button"
                className="ui-btn ui-btn-primary cd-btn-anim"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openCreateDoc()}
              >
                <Plus size={16} aria-hidden />
                Add Document
              </motion.button>
            </>
          }
        />

        <motion.div
          className="mod-panel cd-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="ui-table-toolbar cd-toolbar">
            <div className="ui-search">
              <Search size={15} aria-hidden />
              <input
                placeholder="Search folders, documents, tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search curriculum documents"
              />
            </div>
            <PremiumSelect
              placeholder="Filter"
              value={filter}
              onChange={(v) => setFilter(v as CurriculumFilter)}
              options={FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <PremiumSelect
              placeholder="Sort"
              value={sort}
              onChange={(v) => setSort(v as CurriculumSort)}
              options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <div className="cd-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={viewMode === 'grid' ? 'is-on' : ''}
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'is-on' : ''}
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="cd-nav-row">
            {currentFolderId ? (
              <button type="button" className="cd-back-btn" onClick={goBack} aria-label="Go back">
                <ArrowLeft size={16} />
                Back
              </button>
            ) : null}
            <FolderBreadcrumbs path={breadcrumb} onNavigate={setCurrentFolderId} />
          </div>

          {isEmpty ? (
            <motion.div
              className="cd-empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="cd-empty-art" aria-hidden>
                <Library size={40} />
              </div>
              <EmptyState
                title="No curriculum documents found."
                description="Create a folder or upload a document to start building your curriculum library."
                action={
                  <div className="cd-empty-actions">
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline"
                      onClick={() => openCreateFolder()}
                    >
                      <FolderPlus size={16} /> Create Folder
                    </button>
                    <button
                      type="button"
                      className="ui-btn ui-btn-primary"
                      onClick={() => openCreateDoc()}
                    >
                      <FilePlus2 size={16} /> Upload Document
                    </button>
                  </div>
                }
              />
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key={currentFolderId ?? 'library'}
              className="cd-grid"
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence mode="popLayout">
                {display.folders.map((folder, index) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    index={index}
                    itemCount={countFolderItems(folders, documents, folder.id)}
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onEdit={openEditFolder}
                    onDelete={(f) => setDeleteTarget({ kind: 'folder', item: f })}
                    onAddSubfolder={(f) => openCreateFolder(f.id)}
                    onAddDocument={(f) => openCreateDoc(f.id)}
                    onRename={(f) => setRenameTarget({ kind: 'folder', item: f })}
                    onMove={(f) => setMoveTarget({ kind: 'folder', item: f, mode: 'move' })}
                    onCopy={(f) => setMoveTarget({ kind: 'folder', item: f, mode: 'copy' })}
                  />
                ))}
                {display.documents.map((doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    index={display.folders.length + index}
                    onView={setViewDoc}
                    onDownload={downloadDoc}
                    onRename={(d) => setRenameTarget({ kind: 'document', item: d })}
                    onMove={(d) => setMoveTarget({ kind: 'document', item: d, mode: 'move' })}
                    onDuplicate={(d) =>
                      setMoveTarget({ kind: 'document', item: d, mode: 'copy' })
                    }
                    onArchive={archiveDoc}
                    onDelete={(d) => setDeleteTarget({ kind: 'document', item: d })}
                    onEdit={openEditDoc}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="mod-scroll cd-table-wrap">
              <table className="ui-table cd-table">
                <thead>
                  <tr>
                    <th className="cd-th-check">
                      <label className="cd-check">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = !allSelected && someSelected;
                          }}
                          onChange={toggleSelectAll}
                          aria-label="Select all items"
                        />
                      </label>
                    </th>
                    <th>Name</th>
                    <th>Folder</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded By</th>
                    <th>Updated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {listRows.map((row, index) => {
                      const key = `${row.kind}:${row.item.id}`;
                      const checked = selectedIds.includes(key);
                      if (row.kind === 'folder') {
                        const folder = row.item;
                        const parentName = folder.parentId
                          ? folderMap.get(folder.parentId)?.name
                          : 'Library';
                        return (
                          <motion.tr
                            key={key}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.2) }}
                            className={checked ? 'is-selected' : ''}
                          >
                            <td>
                              <label className="cd-check">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setSelectedIds((ids) =>
                                      checked ? ids.filter((id) => id !== key) : [...ids, key],
                                    )
                                  }
                                  aria-label={`Select ${folder.name}`}
                                />
                              </label>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="cd-name-link"
                                onClick={() => setCurrentFolderId(folder.id)}
                              >
                                <span className="cd-table-ico folder" style={{ color: folder.color }}>
                                  <FolderGlyph icon={folder.icon} size={16} color={folder.color} />
                                </span>
                                {folder.name}
                              </button>
                            </td>
                            <td>{parentName}</td>
                            <td>Folder</td>
                            <td>
                              {countFolderItems(folders, documents, folder.id)} items
                            </td>
                            <td>{folder.createdBy}</td>
                            <td>{formatDate(folder.updatedAt)}</td>
                            <td>
                              <span className="cd-status is-active">Active</span>
                            </td>
                            <td>
                              <ActionsMenu
                                label={`Actions for ${folder.name}`}
                                items={[
                                  {
                                    id: 'edit',
                                    label: 'Edit Folder',
                                    icon: <Pencil size={14} />,
                                    onSelect: () => openEditFolder(folder),
                                  },
                                  {
                                    id: 'rename',
                                    label: 'Rename',
                                    icon: <Pencil size={14} />,
                                    onSelect: () =>
                                      setRenameTarget({ kind: 'folder', item: folder }),
                                  },
                                  {
                                    id: 'sub',
                                    label: 'Add Subfolder',
                                    icon: <FolderPlus size={14} />,
                                    onSelect: () => openCreateFolder(folder.id),
                                  },
                                  {
                                    id: 'doc',
                                    label: 'Add Document',
                                    icon: <FilePlus2 size={14} />,
                                    onSelect: () => openCreateDoc(folder.id),
                                  },
                                  {
                                    id: 'move',
                                    label: 'Move Folder',
                                    icon: <FolderInput size={14} />,
                                    onSelect: () =>
                                      setMoveTarget({
                                        kind: 'folder',
                                        item: folder,
                                        mode: 'move',
                                      }),
                                  },
                                  {
                                    id: 'copy',
                                    label: 'Copy Folder',
                                    icon: <Copy size={14} />,
                                    onSelect: () =>
                                      setMoveTarget({
                                        kind: 'folder',
                                        item: folder,
                                        mode: 'copy',
                                      }),
                                  },
                                  {
                                    id: 'delete',
                                    label: 'Delete Folder',
                                    icon: <Trash2 size={14} />,
                                    danger: true,
                                    onSelect: () =>
                                      setDeleteTarget({ kind: 'folder', item: folder }),
                                  },
                                ]}
                              />
                            </td>
                          </motion.tr>
                        );
                      }

                      const doc = row.item;
                      const folderName = folderMap.get(doc.folderId)?.name ?? '—';
                      return (
                        <motion.tr
                          key={key}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.03, 0.2) }}
                          className={checked ? 'is-selected' : ''}
                        >
                          <td>
                            <label className="cd-check">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedIds((ids) =>
                                    checked ? ids.filter((id) => id !== key) : [...ids, key],
                                  )
                                }
                                aria-label={`Select ${doc.name}`}
                              />
                            </label>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="cd-name-link"
                              onClick={() => setViewDoc(doc)}
                            >
                              <span className={`cd-table-ico tone-${docTypeTone(doc.type)}`}>
                                <DocumentGlyph type={doc.type} size={16} />
                              </span>
                              {doc.name}
                            </button>
                          </td>
                          <td>{folderName}</td>
                          <td>{doc.type}</td>
                          <td>{doc.size}</td>
                          <td>{doc.createdBy}</td>
                          <td>{formatDate(doc.updatedAt)}</td>
                          <td>
                            <span
                              className={`cd-status ${
                                doc.status === 'Active' ? 'is-active' : 'is-archived'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td>
                            <ActionsMenu
                              label={`Actions for ${doc.name}`}
                              items={[
                                {
                                  id: 'view',
                                  label: 'View',
                                  icon: <Eye size={14} />,
                                  onSelect: () => setViewDoc(doc),
                                },
                                {
                                  id: 'download',
                                  label: 'Download',
                                  icon: <Download size={14} />,
                                  onSelect: () => downloadDoc(doc),
                                },
                                {
                                  id: 'rename',
                                  label: 'Rename',
                                  icon: <Pencil size={14} />,
                                  onSelect: () =>
                                    setRenameTarget({ kind: 'document', item: doc }),
                                },
                                {
                                  id: 'move',
                                  label: 'Move',
                                  icon: <FolderInput size={14} />,
                                  onSelect: () =>
                                    setMoveTarget({
                                      kind: 'document',
                                      item: doc,
                                      mode: 'move',
                                    }),
                                },
                                {
                                  id: 'dup',
                                  label: 'Duplicate',
                                  icon: <Copy size={14} />,
                                  onSelect: () =>
                                    setMoveTarget({
                                      kind: 'document',
                                      item: doc,
                                      mode: 'copy',
                                    }),
                                },
                                {
                                  id: 'archive',
                                  label: doc.status === 'Archived' ? 'Restore' : 'Archive',
                                  icon: <Archive size={14} />,
                                  onSelect: () => archiveDoc(doc),
                                },
                                {
                                  id: 'delete',
                                  label: 'Delete',
                                  icon: <Trash2 size={14} />,
                                  danger: true,
                                  onSelect: () =>
                                    setDeleteTarget({ kind: 'document', item: doc }),
                                },
                              ]}
                            />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <FolderFormModal
        open={folderFormOpen}
        mode={folderFormMode}
        folders={folders}
        initial={editingFolder}
        defaultParentId={defaultParentId}
        excludeFolderIds={excludeForEdit}
        onClose={() => setFolderFormOpen(false)}
        onSave={handleSaveFolder}
      />
      <DocumentFormModal
        open={docFormOpen}
        mode={docFormMode}
        folders={folders}
        initial={editingDoc}
        defaultFolderId={defaultFolderId}
        onClose={() => setDocFormOpen(false)}
        onSave={handleSaveDocument}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        target={deleteTarget}
        hasChildren={
          deleteTarget?.kind === 'folder'
            ? folderHasChildren(folders, documents, deleteTarget.item.id)
            : false
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <RenameDialog
        open={Boolean(renameTarget)}
        target={renameTarget}
        onClose={() => setRenameTarget(null)}
        onSave={handleRename}
      />
      <MoveCopyDialog
        open={Boolean(moveTarget)}
        target={moveTarget}
        folders={folders}
        onClose={() => setMoveTarget(null)}
        onConfirm={handleMoveCopy}
      />
      <DocumentViewModal
        open={Boolean(viewDoc)}
        document={viewDoc}
        folderName={viewDoc ? folderMap.get(viewDoc.folderId)?.name : undefined}
        onClose={() => setViewDoc(null)}
        onDownload={downloadDoc}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`cd-toast ${toast.type === 'ok' ? 'is-ok' : 'is-err'}`}
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
