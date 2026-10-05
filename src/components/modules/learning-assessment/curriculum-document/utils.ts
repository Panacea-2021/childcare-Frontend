import { CURRENT_USER } from './constants';
import type {
  CurriculumDocument,
  CurriculumFilter,
  CurriculumFolder,
  CurriculumSort,
  DocType,
} from './types';

export function getChildFolders(
  folders: CurriculumFolder[],
  parentId: string | null,
): CurriculumFolder[] {
  return folders.filter((f) => f.parentId === parentId);
}

export function getFolderDocuments(
  documents: CurriculumDocument[],
  folderId: string,
): CurriculumDocument[] {
  return documents.filter((d) => d.folderId === folderId);
}

export function countFolderItems(
  folders: CurriculumFolder[],
  documents: CurriculumDocument[],
  folderId: string,
): number {
  const childFolders = folders.filter((f) => f.parentId === folderId).length;
  const childDocs = documents.filter((d) => d.folderId === folderId).length;
  return childFolders + childDocs;
}

export function getBreadcrumbPath(
  folders: CurriculumFolder[],
  folderId: string | null,
): CurriculumFolder[] {
  if (!folderId) return [];
  const byId = new Map(folders.map((f) => [f.id, f]));
  const path: CurriculumFolder[] = [];
  let current = byId.get(folderId);
  const guard = new Set<string>();
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

export function getDescendantFolderIds(
  folders: CurriculumFolder[],
  folderId: string,
): Set<string> {
  const ids = new Set<string>([folderId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of folders) {
      if (f.parentId && ids.has(f.parentId) && !ids.has(f.id)) {
        ids.add(f.id);
        changed = true;
      }
    }
  }
  return ids;
}

export function folderHasChildren(
  folders: CurriculumFolder[],
  documents: CurriculumDocument[],
  folderId: string,
): boolean {
  return countFolderItems(folders, documents, folderId) > 0;
}

export function isWordType(type: DocType) {
  return type === 'DOC' || type === 'DOCX';
}

export function isExcelType(type: DocType) {
  return type === 'XLS';
}

export function matchesFilter(
  filter: CurriculumFilter,
  folder: CurriculumFolder | null,
  doc: CurriculumDocument | null,
): boolean {
  const recentCutoff = Date.now() - 1000 * 60 * 60 * 24 * 30;

  if (filter === 'all') return true;
  if (filter === 'folders') return Boolean(folder);
  if (filter === 'documents') return Boolean(doc);
  if (filter === 'archived') return Boolean(doc && doc.status === 'Archived');
  if (filter === 'mine') {
    if (folder) return folder.createdBy === CURRENT_USER;
    if (doc) return doc.createdBy === CURRENT_USER;
    return false;
  }
  if (filter === 'recent') {
    const iso = folder?.updatedAt ?? doc?.updatedAt;
    return iso ? new Date(iso).getTime() >= recentCutoff : false;
  }
  if (filter === 'pdf') return Boolean(doc && doc.type === 'PDF');
  if (filter === 'word') return Boolean(doc && isWordType(doc.type));
  if (filter === 'excel') return Boolean(doc && isExcelType(doc.type));
  if (filter === 'images') return Boolean(doc && doc.type === 'Image');
  return true;
}

export function matchesSearch(
  query: string,
  folder: CurriculumFolder | null,
  doc: CurriculumDocument | null,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (folder) {
    return `${folder.name} ${folder.description}`.toLowerCase().includes(q);
  }
  if (doc) {
    return `${doc.name} ${doc.description} ${doc.tags.join(' ')}`.toLowerCase().includes(q);
  }
  return false;
}

export function sortFolders(items: CurriculumFolder[], sort: CurriculumSort): CurriculumFolder[] {
  const next = [...items];
  next.sort((a, b) => {
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'za') return b.name.localeCompare(a.name);
    if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sort === 'largest' || sort === 'smallest') return a.name.localeCompare(b.name);
    return b.createdAt.localeCompare(a.createdAt);
  });
  return next;
}

export function sortDocuments(
  items: CurriculumDocument[],
  sort: CurriculumSort,
): CurriculumDocument[] {
  const next = [...items];
  next.sort((a, b) => {
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'za') return b.name.localeCompare(a.name);
    if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sort === 'largest') return b.sizeBytes - a.sizeBytes;
    if (sort === 'smallest') return a.sizeBytes - b.sizeBytes;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return next;
}

export function inferDocType(file: File): DocType {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'PDF';
  if (name.endsWith('.docx')) return 'DOCX';
  if (name.endsWith('.doc')) return 'DOC';
  if (name.endsWith('.pptx')) return 'PPTX';
  if (name.endsWith('.ppt')) return 'PPT';
  if (name.endsWith('.xls') || name.endsWith('.xlsx') || mime.includes('sheet')) return 'XLS';
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) return 'Image';
  return 'Other';
}

export function cloneFolderTree(
  folders: CurriculumFolder[],
  documents: CurriculumDocument[],
  sourceFolderId: string,
  newParentId: string | null,
  createdBy: string,
  now: string,
): { folders: CurriculumFolder[]; documents: CurriculumDocument[] } {
  const idMap = new Map<string, string>();
  const descendants = getDescendantFolderIds(folders, sourceFolderId);
  const sourceFolders = folders.filter((f) => descendants.has(f.id));
  let n = 0;

  const newFolders: CurriculumFolder[] = sourceFolders.map((f) => {
    const newId = `fld-copy-${Date.now()}-${n++}-${Math.random().toString(36).slice(2, 7)}`;
    idMap.set(f.id, newId);
    return { ...f, id: newId };
  });

  for (const f of newFolders) {
    if (f.id === idMap.get(sourceFolderId)) {
      f.parentId = newParentId;
      f.name = `${f.name} (Copy)`;
    } else if (f.parentId && idMap.has(f.parentId)) {
      f.parentId = idMap.get(f.parentId)!;
    }
    f.createdAt = now;
    f.updatedAt = now;
    f.createdBy = createdBy;
  }

  const newDocs: CurriculumDocument[] = documents
    .filter((d) => descendants.has(d.folderId))
    .map((d) => ({
      ...d,
      id: `doc-copy-${Date.now()}-${n++}-${Math.random().toString(36).slice(2, 7)}`,
      folderId: idMap.get(d.folderId) ?? d.folderId,
      name: d.name,
      createdAt: now,
      updatedAt: now,
      uploadedAt: now,
      createdBy,
    }));

  return { folders: newFolders, documents: newDocs };
}
