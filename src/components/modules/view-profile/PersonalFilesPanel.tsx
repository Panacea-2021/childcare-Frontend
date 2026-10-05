'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  FilePlus2,
  FileText,
  FolderPlus,
  Info,
  MoreVertical,
  Pencil,
  Search,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { MultiSelectDropdown } from '@/components/modules/view-profile/MultiSelectDropdown';
import { buildZip, downloadBlob } from '@/components/modules/view-profile/zipDownload';
import './personal-files.css';

type FileNode = {
  id: string;
  type: 'folder' | 'document';
  name: string;
  parentId: string | null;
  uploadedBy: string;
  createdAt: string;
  /** Website URL or object URL for uploaded file */
  url?: string;
  /** Original file name when uploaded from device */
  fileName?: string;
  /** Stored bytes for ZIP (base64) */
  dataBase64?: string;
  mimeType?: string;
  /** Color theme index for folders */
  colorTone?: number;
};

type ExpirySettings = {
  enabled: boolean;
  notifyStaff: string[];
  daysBefore: number;
};

type StoredPayload = {
  nodes: FileNode[];
  settings: ExpirySettings;
};

type Props = {
  ownerName: string;
  storageKey?: string;
  staffOptions?: string[];
  /** Return true to handle open (e.g. fullscreen image viewer). */
  onPreviewDocument?: (node: FileNode) => boolean;
};

const FOLDER_TONES = ['violet', 'coral', 'amber', 'emerald', 'sky', 'rose'] as const;

function formatDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function normalizeDate(value: string) {
  return value.replace(/\//g, '-');
}

function storageId(ownerName: string, storageKey?: string) {
  const raw = (storageKey || ownerName || 'default').trim().toLowerCase().replace(/\s+/g, '-');
  return `panacea.personalFiles.${raw || 'default'}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function blobUrlFromBase64(b64: string, mimeType?: string) {
  const bytes = base64ToBytes(b64);
  const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType || 'application/octet-stream' });
  return URL.createObjectURL(blob);
}

function hydrateNodes(nodes: FileNode[]): FileNode[] {
  return nodes.map((n) => {
    const createdAt = normalizeDate(n.createdAt);
    if (n.type === 'document' && n.dataBase64) {
      return {
        ...n,
        createdAt,
        url: blobUrlFromBase64(n.dataBase64, n.mimeType),
      };
    }
    return { ...n, createdAt };
  });
}

function serializeNodes(nodes: FileNode[]): FileNode[] {
  return nodes.map((n) => {
    if (n.type === 'document' && n.dataBase64) {
      return {
        id: n.id,
        type: n.type,
        name: n.name,
        parentId: n.parentId,
        uploadedBy: n.uploadedBy,
        createdAt: n.createdAt,
        fileName: n.fileName,
        dataBase64: n.dataBase64,
        mimeType: n.mimeType,
      };
    }
    return n;
  });
}

function pathForNode(node: FileNode, all: FileNode[]): string {
  const parts = [node.name];
  let parentId = node.parentId;
  while (parentId) {
    const parent = all.find((n) => n.id === parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    parentId = parent.parentId;
  }
  return parts.join('/');
}

function ColorfulFolderIcon() {
  return (
    <span className="pf-folderIcon" aria-hidden>
      <svg viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 28c0-6.627 5.373-12 12-12h22.5c3.6 0 7 1.6 9.2 4.3L58 28h42c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12H20c-6.627 0-12-5.373-12-12V28Z"
          fill="var(--pf-folder-tab)"
        />
        <path
          d="M6 36c0-5.523 4.477-10 10-10h88c5.523 0 10 4.477 10 10v42c0 5.523-4.477 10-10 10H16c-5.523 0-10-4.477-10-10V36Z"
          fill="var(--pf-folder-paper)"
        />
        <path
          d="M4 42c0-5.523 4.477-10 10-10h92c5.523 0 10 4.477 10 10v40c0 5.523-4.477 10-10 10H14c-5.523 0-10-4.477-10-10V42Z"
          fill="var(--pf-folder-base)"
        />
        <path
          d="M14 42h92c2.2 0 4 1.8 4 4v8c-18 10-40 16-50 16S28 64 10 54v-8c0-2.2 1.8-4 4-4Z"
          fill="var(--pf-folder-mid)"
          opacity="0.55"
        />
        <path
          d="M22 58h40"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M22 68h28"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function PersonalFilesPanel({
  ownerName,
  storageKey,
  staffOptions = [],
  onPreviewDocument,
}: Props) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const persistKey = storageId(ownerName, storageKey);

  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moreOpen, setMoreOpen] = useState(false);
  const [itemMenuId, setItemMenuId] = useState<string | null>(null);

  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const [docOpen, setDocOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'document' | 'url'>('document');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [editTarget, setEditTarget] = useState<FileNode | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<FileNode | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ExpirySettings>({
    enabled: true,
    notifyStaff: ownerName ? [ownerName] : [],
    daysBefore: 3,
  });
  const [settingsDraft, setSettingsDraft] = useState<ExpirySettings>(settings);

  const moreRef = useRef<HTMLDivElement>(null);
  const itemMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredPayload;
        setNodes(hydrateNodes(Array.isArray(parsed.nodes) ? parsed.nodes : []));
        if (parsed.settings) {
          setSettings(parsed.settings);
        }
      } else {
        setNodes([]);
      }
    } catch {
      setNodes([]);
    }
    setCurrentFolderId(null);
    setSelected(new Set());
    setLoadedKey(persistKey);
  }, [persistKey]);

  useEffect(() => {
    if (loadedKey !== persistKey) return;
    try {
      const payload: StoredPayload = {
        nodes: serializeNodes(nodes),
        settings,
      };
      localStorage.setItem(persistKey, JSON.stringify(payload));
    } catch {
      /* quota / private mode */
    }
  }, [nodes, settings, persistKey, loadedKey]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [moreOpen]);

  useEffect(() => {
    if (!itemMenuId) return;
    const onDown = (e: MouseEvent) => {
      if (!itemMenuRef.current?.contains(e.target as Node)) setItemMenuId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [itemMenuId]);

  const openDocument = (node: FileNode) => {
    if (onPreviewDocument?.(node)) return;
    if (node.url) {
      window.open(node.url, '_blank', 'noopener,noreferrer');
    }
  };

  const openEdit = (node: FileNode) => {
    setItemMenuId(null);
    setEditTarget(node);
    setEditName(node.name);
    setEditUrl(!node.dataBase64 && node.url ? node.url : '');
  };

  const saveEdit = () => {
    if (!editTarget) return;
    const name = editName.trim();
    if (!name) return;
    const nextUrl = editUrl.trim();
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== editTarget.id) return n;
        if (n.type === 'document' && !n.dataBase64 && nextUrl) {
          return { ...n, name, url: nextUrl };
        }
        return { ...n, name };
      }),
    );
    setEditTarget(null);
    setEditName('');
    setEditUrl('');
  };

  const goBack = () => {
    if (!currentFolderId) return;
    const current = nodes.find((n) => n.id === currentFolderId);
    setCurrentFolderId(current?.parentId ?? null);
    setSelected(new Set());
  };

  const folderTrail = useMemo(() => {
    const trail: FileNode[] = [];
    let id = currentFolderId;
    while (id) {
      const folder = nodes.find((n) => n.id === id && n.type === 'folder');
      if (!folder) break;
      trail.unshift(folder);
      id = folder.parentId;
    }
    return trail;
  }, [currentFolderId, nodes]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return nodes
      .filter((n) => n.parentId === currentFolderId)
      .filter((n) => !q || n.name.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [nodes, currentFolderId, search]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((n) => selected.has(n.id));

  const openFolderModal = () => {
    setFolderName('');
    setFolderOpen(true);
  };

  const openDocModal = () => {
    setUploadType('document');
    setWebsiteUrl('');
    setPendingFile(null);
    setDragActive(false);
    setDocOpen(true);
  };

  const openSettings = () => {
    setSettingsDraft(settings);
    setSettingsOpen(true);
  };

  const saveFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    setNodes((prev) => [
      ...prev,
      {
        id: uid(),
        type: 'folder',
        name,
        parentId: currentFolderId,
        uploadedBy: ownerName,
        createdAt: formatDate(new Date()),
        colorTone: prev.filter((n) => n.type === 'folder').length % FOLDER_TONES.length,
      },
    ]);
    setFolderOpen(false);
    setFolderName('');
  };

  const saveDocument = async () => {
    if (uploadType === 'url') {
      const url = websiteUrl.trim();
      if (!url) return;
      let label = url;
      try {
        label = new URL(url).hostname.replace(/^www\./, '') || url;
      } catch {
        /* keep raw */
      }
      setNodes((prev) => [
        ...prev,
        {
          id: uid(),
          type: 'document',
          name: label,
          parentId: currentFolderId,
          uploadedBy: ownerName,
          createdAt: formatDate(new Date()),
          url,
        },
      ]);
      setDocOpen(false);
      return;
    }

    if (!pendingFile) return;
    const dataBase64 = await fileToBase64(pendingFile);
    setNodes((prev) => [
      ...prev,
      {
        id: uid(),
        type: 'document',
        name: pendingFile.name,
        parentId: currentFolderId,
        uploadedBy: ownerName,
        createdAt: formatDate(new Date()),
        fileName: pendingFile.name,
        mimeType: pendingFile.type || 'application/octet-stream',
        dataBase64,
        url: URL.createObjectURL(pendingFile),
      },
    ]);
    setDocOpen(false);
    setPendingFile(null);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((n) => next.delete(n.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((n) => next.add(n.id));
        return next;
      });
    }
  };

  const collectDescendants = (rootIds: string[]): FileNode[] => {
    const result: FileNode[] = [];
    const queue = [...rootIds];
    const seen = new Set<string>();
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const node = nodes.find((n) => n.id === id);
      if (!node) continue;
      result.push(node);
      if (node.type === 'folder') {
        nodes.filter((n) => n.parentId === id).forEach((child) => queue.push(child.id));
      }
    }
    return result;
  };

  const removeNode = (id: string) => {
    const doomed = new Set(collectDescendants([id]).map((n) => n.id));
    setNodes((prev) => prev.filter((n) => !doomed.has(n.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      doomed.forEach((x) => next.delete(x));
      return next;
    });
    setItemMenuId(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    removeNode(target.id);
    if (currentFolderId === target.id) {
      setCurrentFolderId(target.parentId);
    }
    setDeleteTarget(null);
  };

  const downloadAsZip = async (ids: string[], filename: string) => {
    const tree = collectDescendants(ids);
    const entries: { path: string; data: Uint8Array }[] = [];

    for (const node of tree) {
      if (node.type === 'folder') {
        const folderPath = `${pathForNode(node, nodes)}/`;
        entries.push({ path: folderPath, data: new Uint8Array(0) });
        continue;
      }
      const path = pathForNode(node, nodes);
      if (node.dataBase64) {
        entries.push({ path, data: base64ToBytes(node.dataBase64) });
      } else if (node.url) {
        const text = `Website link: ${node.url}\n`;
        entries.push({ path: path.endsWith('.txt') ? path : `${path}.url.txt`, data: new TextEncoder().encode(text) });
      } else {
        entries.push({ path, data: new TextEncoder().encode(node.name) });
      }
    }

    if (entries.length === 0) {
      entries.push({
        path: 'empty.txt',
        data: new TextEncoder().encode('No files selected.'),
      });
    }

    downloadBlob(buildZip(entries), filename);
  };

  const onDropFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setPendingFile(files[0]);
    setUploadType('document');
  };

  const notifyOptions = useMemo(() => {
    const set = new Set([ownerName, ...staffOptions].filter(Boolean));
    return Array.from(set);
  }, [ownerName, staffOptions]);

  const isRootEmpty = nodes.length === 0 && currentFolderId === null && !search.trim();

  const moreMenu = (
    <div className="pf-moreWrap" ref={moreRef}>
      <button
        type="button"
        className="pf-iconBtn"
        aria-label="More actions"
        aria-expanded={moreOpen}
        onClick={() => setMoreOpen((v) => !v)}
      >
        <MoreVertical size={18} />
      </button>
      {moreOpen ? (
        <div className="pf-moreMenu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMoreOpen(false);
              void downloadAsZip(Array.from(selected), 'selected-files.zip');
            }}
          >
            Download selected (ZIP)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMoreOpen(false);
              const roots = nodes.filter((n) => n.parentId === null).map((n) => n.id);
              void downloadAsZip(roots, 'personal-files.zip');
            }}
          >
            Download everything (ZIP)
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <section className="pf-panel" aria-label="Personal Files">
      {isRootEmpty ? (
        <div className="pf-empty">
          <div className="pf-emptyIcon" aria-hidden>
            <FilePlus2 size={32} />
          </div>
          <h3>No Documents Added</h3>
          <p>Start Adding Folders And Documents</p>
          <div className="pf-emptyActions">
            <button type="button" className="pf-iconBtn" aria-label="Settings" onClick={openSettings}>
              <Settings size={18} />
            </button>
            <button type="button" className="ui-btn ui-btn-outline" onClick={openDocModal}>
              Add Document
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openFolderModal}>
              Add Folder
            </button>
            {moreMenu}
          </div>
        </div>
      ) : (
        <>
          <div className="pf-toolbar">
            <label className="pf-search">
              <Search size={16} aria-hidden />
              <input
                type="search"
                placeholder="Search a file or folder..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="pf-toolbarActions">
              <button type="button" className="pf-iconBtn" aria-label="Settings" onClick={openSettings}>
                <Settings size={18} />
              </button>
              <button type="button" className="ui-btn ui-btn-outline" onClick={openDocModal}>
                Add Document
              </button>
              <button type="button" className="ui-btn ui-btn-primary" onClick={openFolderModal}>
                Add Folder
              </button>
              {moreMenu}
            </div>
          </div>

          {currentFolderId ? (
            <div className="pf-navRow">
              <button type="button" className="pf-backBtn" onClick={goBack} aria-label="Go back">
                <ArrowLeft size={18} />
              </button>
              <nav className="pf-crumb" aria-label="Folder path">
                <button type="button" onClick={() => setCurrentFolderId(null)}>
                  Personal Files
                </button>
                {folderTrail.map((f, i) => (
                  <span key={f.id}>
                    <span className="pf-crumb__sep" aria-hidden>
                      {' '}
                      {'>>'}{' '}
                    </span>
                    {i === folderTrail.length - 1 ? (
                      <span className="pf-crumb__current">{f.name}</span>
                    ) : (
                      <button type="button" onClick={() => setCurrentFolderId(f.id)}>
                        {f.name}
                      </button>
                    )}
                  </span>
                ))}
              </nav>
            </div>
          ) : null}

          <div className="pf-selectBar">
            <label className="pf-selectAll">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
              Select All
            </label>
          </div>

          {visible.length === 0 ? (
            <div className="pf-empty" style={{ padding: '32px 16px', minHeight: 200 }}>
              <h3>{search.trim() ? 'No matches' : 'This folder is empty'}</h3>
              <p>
                {search.trim() ? 'Try a different search.' : 'Add a document or nested folder here.'}
              </p>
              {!search.trim() ? (
                <div className="pf-emptyActions">
                  <button type="button" className="ui-btn ui-btn-outline" onClick={openDocModal}>
                    Add Document
                  </button>
                  <button type="button" className="ui-btn ui-btn-primary" onClick={openFolderModal}>
                    Add Folder
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              {visible.some((n) => n.type === 'folder') ? (
                <>
                  <p className="pf-sectionLabel">Folders</p>
                  <div className="pf-folderGrid">
                    {visible
                      .filter((n) => n.type === 'folder')
                      .map((node, index) => {
                        const childCount = nodes.filter((n) => n.parentId === node.id).length;
                        const tone =
                          FOLDER_TONES[
                            (node.colorTone ?? index) % FOLDER_TONES.length
                          ];
                        return (
                          <div key={node.id} className={`pf-folderItem pf-folderItem--${tone}`}>
                            <input
                              type="checkbox"
                              className="pf-itemCheck"
                              checked={selected.has(node.id)}
                              onChange={() => toggleSelect(node.id)}
                              aria-label={`Select ${node.name}`}
                            />
                            <div className="pf-folderCardWrap">
                              <div
                                className="pf-itemMenuWrap pf-itemMenuWrap--folder"
                                ref={itemMenuId === node.id ? itemMenuRef : undefined}
                              >
                                <button
                                  type="button"
                                  className="pf-itemMenuBtn"
                                  aria-label={`Actions for ${node.name}`}
                                  aria-expanded={itemMenuId === node.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemMenuId((id) => (id === node.id ? null : node.id));
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {itemMenuId === node.id ? (
                                  <div className="pf-itemMenu" role="menu">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setItemMenuId(null);
                                        setCurrentFolderId(node.id);
                                      }}
                                    >
                                      Open
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => openEdit(node)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="is-danger"
                                      onClick={() => {
                                        setItemMenuId(null);
                                        setDeleteTarget(node);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                className="pf-folderCard"
                                onClick={() => setCurrentFolderId(node.id)}
                                aria-label={`Open folder ${node.name}`}
                              >
                                <div className="pf-folderVisual">
                                  <ColorfulFolderIcon />
                                  <div className="pf-folderVisual__pocket">
                                    <p className="pf-folderVisual__name">{node.name}</p>
                                    <p className="pf-folderVisual__count">
                                      {childCount} {childCount === 1 ? 'File' : 'Files'}
                                    </p>
                                  </div>
                                </div>
                                <p className="pf-folderCard__meta">
                                  {node.uploadedBy} · {node.createdAt}
                                </p>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : null}

              {visible.some((n) => n.type === 'document') ? (
                <>
                  <p className="pf-sectionLabel">Documents</p>
                  <div className="pf-docGrid">
                    {visible
                      .filter((n) => n.type === 'document')
                      .map((node, index) => {
                        const tone = (index % 4) + 1;
                        return (
                          <div key={node.id} className="pf-docItem">
                            <input
                              type="checkbox"
                              className="pf-itemCheck"
                              checked={selected.has(node.id)}
                              onChange={() => toggleSelect(node.id)}
                              aria-label={`Select ${node.name}`}
                            />
                            <article className={`pf-docCard pf-docCard--tone${tone}`}>
                              <div
                                className="pf-itemMenuWrap"
                                ref={itemMenuId === node.id ? itemMenuRef : undefined}
                              >
                                <button
                                  type="button"
                                  className="pf-itemMenuBtn"
                                  aria-label={`Actions for ${node.name}`}
                                  aria-expanded={itemMenuId === node.id}
                                  onClick={() =>
                                    setItemMenuId((id) => (id === node.id ? null : node.id))
                                  }
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {itemMenuId === node.id ? (
                                  <div className="pf-itemMenu" role="menu">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setItemMenuId(null);
                                        openDocument(node);
                                      }}
                                    >
                                      Open
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => openEdit(node)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setItemMenuId(null);
                                        void downloadAsZip([node.id], `${node.name}.zip`);
                                      }}
                                    >
                                      Download
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="is-danger"
                                      onClick={() => {
                                        setItemMenuId(null);
                                        setDeleteTarget(node);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </div>

                              <span className="pf-docCard__avatar" aria-hidden>
                                <FileText size={30} strokeWidth={1.8} />
                              </span>
                              <h3 className="pf-docCard__name" title={node.name}>
                                {node.name}
                              </h3>
                              <p className="pf-docCard__date">{node.createdAt}</p>
                              {node.url ? (
                                <a
                                  className="pf-docCard__action"
                                  href={node.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  className="pf-docCard__action"
                                  onClick={() => openDocument(node)}
                                >
                                  Open
                                </button>
                              )}
                            </article>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : null}
            </>
          )}
        </>
      )}

      {/* Add Folder */}
      <Modal
        open={folderOpen}
        title="Folder Name"
        onClose={() => setFolderOpen(false)}
        icon={<FolderPlus size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setFolderOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveFolder} disabled={!folderName.trim()}>
              Save
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label" htmlFor="pf-folder-name">
            Name
          </label>
          <input
            id="pf-folder-name"
            className="ui-input"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveFolder();
            }}
          />
        </div>
      </Modal>

      {/* Upload Document */}
      <Modal
        open={docOpen}
        title="Upload Document"
        onClose={() => setDocOpen(false)}
        wide
        icon={<Upload size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDocOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => void saveDocument()}
              disabled={uploadType === 'document' ? !pendingFile : !websiteUrl.trim()}
            >
              Submit
            </button>
          </>
        }
      >
        <p className="ui-label" style={{ marginBottom: 10 }}>
          Select type to upload
        </p>
        <div className="pf-typeRow">
          <label className="pf-radio">
            <input
              type="radio"
              name="pf-upload-type"
              checked={uploadType === 'document'}
              onChange={() => setUploadType('document')}
            />
            Document
          </label>
          <label className="pf-radio">
            <input
              type="radio"
              name="pf-upload-type"
              checked={uploadType === 'url'}
              onChange={() => setUploadType('url')}
            />
            Website Url
          </label>
        </div>

        {uploadType === 'document' ? (
          <div
            className={`pf-dropzone${dragActive ? ' is-active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              onDropFiles(e.dataTransfer.files);
            }}
          >
            <Upload size={28} aria-hidden />
            <p>{pendingFile ? pendingFile.name : 'Drop document here to upload'}</p>
            <input
              ref={fileInputRef}
              id={fileInputId}
              className="pf-hidden"
              type="file"
              onChange={(e) => onDropFiles(e.target.files)}
            />
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Select from device
            </button>
          </div>
        ) : (
          <div className="ui-field">
            <label className="ui-label" htmlFor="pf-website-url">
              Website URL
            </label>
            <input
              id="pf-website-url"
              className="ui-input"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com/document"
            />
          </div>
        )}
      </Modal>

      {/* Expiry reminders settings */}
      <Modal
        open={settingsOpen}
        title="Document expiry reminders"
        onClose={() => setSettingsOpen(false)}
        icon={<Settings size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => {
                setSettings(settingsDraft);
                setSettingsOpen(false);
              }}
            >
              Save
            </button>
          </>
        }
      >
        <div className="pf-infoBanner">
          <Info size={18} aria-hidden />
          <span>
            These settings apply to all student and staff documents that have an expiry date. Reminders are
            sent by email.
          </span>
        </div>

        <label className="pf-checkRow">
          <input
            type="checkbox"
            checked={settingsDraft.enabled}
            onChange={(e) => setSettingsDraft((s) => ({ ...s, enabled: e.target.checked }))}
          />
          Send document expiry reminders
        </label>

        <div className="ui-field">
          <span className="ui-label">Notify staff</span>
          <MultiSelectDropdown
            label="Notify staff"
            options={notifyOptions}
            value={settingsDraft.notifyStaff}
            onChange={(notifyStaff) => setSettingsDraft((s) => ({ ...s, notifyStaff }))}
            placeholder="Select staff…"
          />
          <p className="pf-help">
            The document owner (the parent or staff member) is always emailed. Add staff here to notify them as
            well.
          </p>
        </div>

        <div className="pf-remindRow" style={{ marginTop: 18 }}>
          <span>Remind</span>
          <input
            className="ui-input"
            type="number"
            min={1}
            max={365}
            value={settingsDraft.daysBefore}
            onChange={(e) =>
              setSettingsDraft((s) => ({
                ...s,
                daysBefore: Math.max(1, Number(e.target.value) || 1),
              }))
            }
            aria-label="Days before expiry"
          />
          <span>day(s) before a document expires</span>
        </div>
      </Modal>

      {/* Edit folder / document */}
      <Modal
        open={Boolean(editTarget)}
        title={editTarget?.type === 'folder' ? 'Edit Folder' : 'Edit Document'}
        onClose={() => setEditTarget(null)}
        icon={<Pencil size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEditTarget(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={saveEdit}
              disabled={!editName.trim()}
            >
              Save
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label" htmlFor="pf-edit-name">
            Name
          </label>
          <input
            id="pf-edit-name"
            className="ui-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
            }}
          />
        </div>
        {editTarget?.type === 'document' && !editTarget.dataBase64 ? (
          <div className="ui-field" style={{ marginTop: 14 }}>
            <label className="ui-label" htmlFor="pf-edit-url">
              Website URL
            </label>
            <input
              id="pf-edit-url"
              className="ui-input"
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://example.com/document"
            />
          </div>
        ) : null}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'folder' ? 'Delete Folder' : 'Delete Document'}
        onClose={() => setDeleteTarget(null)}
        icon={<Trash2 size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>
          {deleteTarget?.type === 'folder' ? ' and everything inside it' : ''}?
        </p>
      </Modal>
    </section>
  );
}
