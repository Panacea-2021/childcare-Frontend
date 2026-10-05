export type DocType = 'PDF' | 'DOC' | 'DOCX' | 'PPT' | 'PPTX' | 'XLS' | 'Image' | 'Other';

export type DocStatus = 'Active' | 'Archived';

export type FolderIconKey = 'folder' | 'book' | 'star' | 'flag' | 'briefcase' | 'palette';

export type ViewMode = 'grid' | 'list';

export type CurriculumFilter =
  | 'all'
  | 'documents'
  | 'folders'
  | 'archived'
  | 'recent'
  | 'mine'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'images';

export type CurriculumSort =
  | 'newest'
  | 'oldest'
  | 'az'
  | 'za'
  | 'largest'
  | 'smallest';

export type CurriculumFolder = {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  color: string;
  icon: FolderIconKey;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CurriculumDocument = {
  id: string;
  name: string;
  folderId: string;
  description: string;
  type: DocType;
  size: string;
  sizeBytes: number;
  tags: string[];
  status: DocStatus;
  fileName: string;
  fileUrl: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  uploadedAt: string;
};

export type FolderFormState = {
  name: string;
  parentId: string;
  description: string;
  color: string;
  icon: FolderIconKey;
};

export type DocumentFormState = {
  name: string;
  folderId: string;
  description: string;
  type: DocType;
  tags: string;
  status: DocStatus;
  fileName: string;
  fileUrl: string;
  size: string;
  sizeBytes: number;
};

export type DeleteTarget =
  | { kind: 'folder'; item: CurriculumFolder }
  | { kind: 'document'; item: CurriculumDocument };

export type MoveTarget =
  | { kind: 'folder'; item: CurriculumFolder; mode: 'move' | 'copy' }
  | { kind: 'document'; item: CurriculumDocument; mode: 'move' | 'copy' };

export type RenameTarget =
  | { kind: 'folder'; item: CurriculumFolder }
  | { kind: 'document'; item: CurriculumDocument };

export const emptyFolderForm = (parentId = ''): FolderFormState => ({
  name: '',
  parentId,
  description: '',
  color: '#5D5FEF',
  icon: 'folder',
});

export const emptyDocumentForm = (folderId = ''): DocumentFormState => ({
  name: '',
  folderId,
  description: '',
  type: 'PDF',
  tags: '',
  status: 'Active',
  fileName: '',
  fileUrl: '',
  size: '',
  sizeBytes: 0,
});
