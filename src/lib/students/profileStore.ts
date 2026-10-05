import {
  getStudentProfile,
  seedDocuments,
  seedForms,
  seedInvoices,
} from './profileMockData';
import type {
  ProfileDocument,
  SharedForm,
  StudentInvoice,
  StudentProfile,
} from './profileTypes';

const DOCS_KEY = 'panacea.studentProfile.docs.v1';
const FORMS_KEY = 'panacea.studentProfile.forms.v1';
const FOLDERS_KEY = 'panacea.studentProfile.folderMeta.v1';

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readMap<T>(key: string): Record<string, T> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, T>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, map: Record<string, T>) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(map));
}

export function loadStudentProfile(studentId: string): StudentProfile | null {
  return getStudentProfile(studentId);
}

export function loadDocuments(studentId: string): ProfileDocument[] {
  const map = readMap<ProfileDocument[]>(DOCS_KEY);
  if (map[studentId]) return map[studentId];
  const seeded = seedDocuments(studentId);
  map[studentId] = seeded;
  writeMap(DOCS_KEY, map);
  return seeded;
}

export function saveDocuments(studentId: string, docs: ProfileDocument[]) {
  const map = readMap<ProfileDocument[]>(DOCS_KEY);
  map[studentId] = docs;
  writeMap(DOCS_KEY, map);
}

export function addFolder(studentId: string, name: string): ProfileDocument[] {
  const docs = loadDocuments(studentId);
  const next: ProfileDocument = {
    id: `fld-${Date.now()}`,
    kind: 'folder',
    name: name.trim() || 'New Folder',
    uploadedAt: new Date().toISOString().slice(0, 10),
    uploadedBy: 'You',
    fileCount: 0,
    parentId: null,
  };
  const list = [next, ...docs];
  saveDocuments(studentId, list);
  const meta = readMap<number>(FOLDERS_KEY);
  meta[studentId] = (meta[studentId] ?? 0) + 1;
  writeMap(FOLDERS_KEY, meta);
  return list;
}

export function addDocumentPlaceholder(studentId: string, name?: string): ProfileDocument[] {
  const docs = loadDocuments(studentId);
  const next: ProfileDocument = {
    id: `doc-${Date.now()}`,
    kind: 'file',
    name: name?.trim() || `Uploaded Document ${docs.filter((d) => d.kind === 'file').length + 1}.pdf`,
    uploadedAt: new Date().toISOString().slice(0, 10),
    uploadedBy: 'You',
    size: '256 KB',
    parentId: null,
  };
  const list = [next, ...docs];
  saveDocuments(studentId, list);
  return list;
}

export function loadSharedForms(studentId: string): SharedForm[] {
  const map = readMap<SharedForm[]>(FORMS_KEY);
  if (map[studentId]) return map[studentId];
  const seeded = seedForms(studentId);
  map[studentId] = seeded;
  writeMap(FORMS_KEY, map);
  return seeded;
}

export function saveSharedForms(studentId: string, forms: SharedForm[]) {
  const map = readMap<SharedForm[]>(FORMS_KEY);
  map[studentId] = forms;
  writeMap(FORMS_KEY, map);
}

export function shareForm(
  studentId: string,
  formName: string,
  sharedBy = 'You',
  sourceFormId?: string,
): SharedForm[] {
  const forms = loadSharedForms(studentId);
  const next: SharedForm = {
    id: `sf-${Date.now()}`,
    formName,
    sharedDate: new Date().toISOString().slice(0, 10),
    sharedBy,
    status: 'Shared',
    sourceFormId,
  };
  const list = [next, ...forms];
  saveSharedForms(studentId, list);
  return list;
}

export function updateFormStatus(
  studentId: string,
  formId: string,
  status: SharedForm['status'],
): SharedForm[] {
  const list = loadSharedForms(studentId).map((f) =>
    f.id === formId ? { ...f, status } : f,
  );
  saveSharedForms(studentId, list);
  return list;
}

export function removeSharedForm(studentId: string, formId: string): SharedForm[] {
  const list = loadSharedForms(studentId).filter((f) => f.id !== formId);
  saveSharedForms(studentId, list);
  return list;
}

export function loadInvoices(studentId: string): StudentInvoice[] {
  return seedInvoices(studentId);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDisplayDate(iso: string) {
  if (!iso || iso === '—') return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
