export type ParentHandbookKind = 'folder' | 'file';

export type ParentHandbookFileType = 'image' | 'pdf' | 'doc' | 'link' | 'other';

export type ParentHandbookItem = {
  id: string;
  kind: ParentHandbookKind;
  name: string;
  uploadedBy: string;
  date: string;
  fileType?: ParentHandbookFileType;
  /** Preview / open URL for files */
  url?: string;
  children?: ParentHandbookItem[];
};

/** Seed matches Panacea_ResourceCenter reference (parentHandbook). */
export const PARENT_HANDBOOK_SEED: ParentHandbookItem[] = [
  {
    id: 'folder-new',
    kind: 'folder',
    name: 'New Folder',
    uploadedBy: 'Malika Thimisetty',
    date: '12/08/26',
    children: [
      {
        id: 'file-students-shot',
        kind: 'file',
        name: 'screencapture-localhost-3001-center-management-students-2026-08-06-19_26_43.png',
        uploadedBy: 'Malika Thimisetty',
        date: '12/08/26',
        fileType: 'image',
        url: '/parent-resources/students-capture.svg',
      },
      {
        id: 'file-qr',
        kind: 'file',
        name: 'Vikram-Bose-kiosk-qr.png',
        uploadedBy: 'Malika Thimisetty',
        date: '12/08/26',
        fileType: 'image',
        url: '/parent-resources/kiosk-qr.svg',
      },
    ],
  },
];

export function flattenHandbookFiles(items: ParentHandbookItem[]): ParentHandbookItem[] {
  const out: ParentHandbookItem[] = [];
  for (const item of items) {
    if (item.kind === 'file') out.push(item);
    if (item.children?.length) out.push(...flattenHandbookFiles(item.children));
  }
  return out;
}

export function filterHandbookTree(
  items: ParentHandbookItem[],
  query: string,
): ParentHandbookItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  const walk = (nodes: ParentHandbookItem[]): ParentHandbookItem[] => {
    const result: ParentHandbookItem[] = [];
    for (const node of nodes) {
      const selfMatch = node.name.toLowerCase().includes(q);
      const kids = node.children ? walk(node.children) : [];
      if (selfMatch || kids.length) {
        result.push({
          ...node,
          children: node.kind === 'folder' ? (selfMatch ? node.children : kids) : undefined,
        });
      }
    }
    return result;
  };

  return walk(items);
}
