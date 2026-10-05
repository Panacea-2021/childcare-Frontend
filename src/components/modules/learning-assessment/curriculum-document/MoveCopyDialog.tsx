'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, FolderInput } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { getDescendantFolderIds } from './utils';
import type { CurriculumFolder, MoveTarget } from './types';

type Props = {
  open: boolean;
  target: MoveTarget | null;
  folders: CurriculumFolder[];
  onClose: () => void;
  onConfirm: (destinationFolderId: string | null) => Promise<void> | void;
};

export function MoveCopyDialog({ open, target, folders, onClose, onConfirm }: Props) {
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const excluded = useMemo(() => {
    if (!target || target.kind !== 'folder') return new Set<string>();
    return getDescendantFolderIds(folders, target.item.id);
  }, [target, folders]);

  const options = useMemo(
    () => folders.filter((f) => !excluded.has(f.id)),
    [folders, excluded],
  );

  useEffect(() => {
    if (!open || !target) return;
    setBusy(false);
    setError('');
    if (target.kind === 'document') {
      setDestination(target.item.folderId);
    } else {
      setDestination(target.item.parentId ?? '');
    }
  }, [open, target]);

  const submit = async () => {
    if (target?.kind === 'document' && !destination) {
      setError('Select a destination folder');
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm(destination || null);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const isCopy = target?.mode === 'copy';
  const title =
    target?.kind === 'folder'
      ? isCopy
        ? 'Copy Folder'
        : 'Move Folder'
      : isCopy
        ? 'Duplicate Document'
        : 'Move Document';

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      icon={isCopy ? <Copy size={18} /> : <FolderInput size={18} />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Working…' : isCopy ? 'Copy' : 'Move'}
          </button>
        </>
      }
    >
      <div className={`ui-field${error ? ' ui-field-error' : ''}`}>
        <label className="ui-label" htmlFor="cd-move-dest">
          Destination Folder {target?.kind === 'document' ? <span className="req">*</span> : null}
        </label>
        <select
          id="cd-move-dest"
          className="ui-select"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          {target?.kind === 'folder' ? <option value="">Library root</option> : null}
          {options.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        {error ? <p className="ui-error-text">{error}</p> : null}
      </div>
      {target ? (
        <p className="cd-move-hint">
          {isCopy ? 'Copy' : 'Move'} <strong>{target.item.name}</strong> to the selected location.
        </p>
      ) : null}
    </Modal>
  );
}
