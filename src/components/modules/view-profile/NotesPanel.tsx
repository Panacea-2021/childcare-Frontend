'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FilePlus2, Lock, Paperclip, Pencil, StickyNote, Trash2, Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { MultiSelectDropdown } from '@/components/modules/view-profile/MultiSelectDropdown';
import { staff as staffSeed } from '@/lib/moduleData';
import '@/components/ui/module.css';
import './notes-panel.css';

type NoteAttachment = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

type StaffNote = {
  id: string;
  description: string;
  isPrivate: boolean;
  /** Staff members this note is about */
  staffNames: string[];
  createdBy: string;
  createdAt: string; // ISO
  attachment?: NoteAttachment;
};

type StoredPayload = { notes: StaffNote[] };

type Props = {
  ownerName: string;
  storageKey?: string;
};

function storageId(ownerName: string, storageKey?: string) {
  const raw = (storageKey || ownerName || 'default').trim().toLowerCase().replace(/\s+/g, '-');
  return `panacea.staffNotes.${raw || 'default'}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function initialOf(name: string) {
  return (name.trim().charAt(0) || '?').toUpperCase();
}

function formatStamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${time} · ${dd}-${mm}-${yyyy}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function attachmentDataUrl(file: NoteAttachment) {
  return `data:${file.mimeType || 'application/octet-stream'};base64,${file.dataBase64}`;
}

function openAttachment(file: NoteAttachment) {
  const binary = atob(file.dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const blob = new Blob([buffer], { type: file.mimeType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function NotesPanel({ ownerName, storageKey }: Props) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const persistKey = storageId(ownerName, storageKey);

  const staffOptions = useMemo(() => {
    const names = new Set<string>([ownerName, ...staffSeed.map((s) => s.name)].filter(Boolean));
    return Array.from(names);
  }, [ownerName]);

  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [createdByFilter, setCreatedByFilter] = useState<string>('All authors');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<NoteAttachment | undefined>();
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StaffNote | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredPayload;
        setNotes(Array.isArray(parsed.notes) ? parsed.notes : []);
      } else {
        setNotes([]);
      }
    } catch {
      setNotes([]);
    }
    setLoadedKey(persistKey);
  }, [persistKey]);

  useEffect(() => {
    if (loadedKey !== persistKey) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify({ notes } satisfies StoredPayload));
    } catch {
      /* quota */
    }
  }, [notes, persistKey, loadedKey]);

  const creatorOptions = useMemo(() => {
    const set = new Set(notes.map((n) => n.createdBy).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const visibleNotes = useMemo(() => {
    const list =
      createdByFilter === 'All authors'
        ? notes
        : notes.filter((n) => n.createdBy === createdByFilter);
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notes, createdByFilter]);

  const openAdd = () => {
    setEditingId(null);
    setDescription('');
    setIsPrivate(false);
    setSelectedStaff([]);
    setPendingFile(null);
    setExistingAttachment(undefined);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (note: StaffNote) => {
    setEditingId(note.id);
    setDescription(note.description);
    setIsPrivate(note.isPrivate);
    setSelectedStaff([...note.staffNames]);
    setPendingFile(null);
    setExistingAttachment(note.attachment);
    setError('');
    setModalOpen(true);
  };

  const saveNote = async () => {
    if (!description.trim()) {
      setError('Please add a description.');
      return;
    }

    if (isPrivate && selectedStaff.length === 0) {
      setError('Please select at least one employee for a private note.');
      return;
    }

    let attachment = existingAttachment;
    if (pendingFile) {
      try {
        attachment = {
          name: pendingFile.name,
          mimeType: pendingFile.type || 'application/octet-stream',
          dataBase64: await fileToBase64(pendingFile),
        };
      } catch {
        setError('Could not read the attachment. Try another file.');
        return;
      }
    }

    const staffNames = isPrivate ? selectedStaff : [];

    if (editingId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? {
                ...n,
                description: description.trim(),
                isPrivate,
                staffNames,
                attachment,
              }
            : n,
        ),
      );
    } else {
      const note: StaffNote = {
        id: uid(),
        description: description.trim(),
        isPrivate,
        staffNames,
        createdBy: ownerName || 'Staff',
        createdAt: new Date().toISOString(),
        attachment,
      };
      setNotes((prev) => [note, ...prev]);
    }

    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const attachLabel = pendingFile
    ? pendingFile.name
    : existingAttachment
      ? existingAttachment.name
      : null;

  return (
    <section className="nt-panel" aria-label="Notes">
      <div className="nt-toolbar">
        <div className="nt-filters">
          <span className="nt-filterLabel">Filter by author</span>
          <div className="nt-createdBy">
            <MultiSelectDropdown
              label="Filter notes by author"
              options={['All authors', ...creatorOptions]}
              value={[createdByFilter]}
              onChange={(next) => setCreatedByFilter(next[0] || 'All authors')}
              placeholder="All authors"
              searchPlaceholder="Search author…"
              multiple={false}
            />
          </div>
          {visibleNotes.length > 0 ? (
            <span className="nt-count">
              {visibleNotes.length} {visibleNotes.length === 1 ? 'note' : 'notes'}
            </span>
          ) : null}
        </div>

        <div className="nt-actions">
          <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
            <FilePlus2 size={16} aria-hidden />
            Add note
          </button>
        </div>
      </div>

      <div className="nt-contentCard">
        {visibleNotes.length === 0 ? (
          <div className="nt-empty">
            <div className="nt-emptyIcon" aria-hidden>
              <StickyNote size={26} />
            </div>
            <p className="nt-emptyTitle">No notes yet</p>
            <p className="nt-emptyText">
              Capture observations, reminders, or follow-ups for this staff member.
            </p>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
              <FilePlus2 size={16} aria-hidden />
              Add note
            </button>
          </div>
        ) : (
          <div className="nt-list">
            {visibleNotes.map((note) => {
              const isImage = Boolean(note.attachment?.mimeType?.startsWith('image/'));
              return (
                <article
                  key={note.id}
                  className={`nt-card${note.isPrivate ? ' is-private' : ''}`}
                >
                  <div className="nt-cardHead">
                    <div className="nt-author">
                      <span className="nt-avatar" aria-hidden>
                        {initialOf(note.createdBy)}
                      </span>
                      <div className="nt-authorMeta">
                        <p className="nt-authorName">{note.createdBy}</p>
                        <div className="nt-metaRow">
                          <p className="nt-authorTime">{formatStamp(note.createdAt)}</p>
                          {note.isPrivate ? (
                            <span className="nt-privateBadge">
                              <Lock size={11} aria-hidden />
                              Private
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="nt-cardActions">
                      <button
                        type="button"
                        className="nt-iconBtn"
                        aria-label="Edit note"
                        onClick={() => openEdit(note)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="nt-iconBtn is-danger"
                        aria-label="Delete note"
                        onClick={() => setDeleteTarget(note)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="nt-body">{note.description}</p>

                  {note.attachment && isImage ? (
                    <button
                      type="button"
                      className="nt-thumbBtn"
                      onClick={() => openAttachment(note.attachment!)}
                      aria-label={`Open ${note.attachment.name}`}
                    >
                      <img
                        className="nt-thumb"
                        src={attachmentDataUrl(note.attachment)}
                        alt=""
                      />
                    </button>
                  ) : null}

                  {note.staffNames.length > 0 || note.attachment ? (
                    <div className="nt-footer">
                      {note.staffNames.length > 0 ? (
                        <div className="nt-staffTags" aria-label="Related staff">
                          <span className="nt-aboutLabel">About</span>
                          {note.staffNames.map((name) => (
                            <span key={name} className="nt-tag">
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span />
                      )}

                      {note.attachment ? (
                        <button
                          type="button"
                          className="nt-attachChip"
                          onClick={() => openAttachment(note.attachment!)}
                        >
                          <Paperclip size={14} aria-hidden />
                          <span>{note.attachment.name}</span>
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit note' : 'Add note'}
        onClose={() => setModalOpen(false)}
        wide
        icon={editingId ? <Pencil size={18} /> : <FilePlus2 size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => void saveNote()}>
              {editingId ? 'Save' : 'Submit'}
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label" htmlFor="nt-description">
            Description
          </label>
          <textarea
            id="nt-description"
            className="ui-textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a note about this staff member…"
          />
        </div>

        <label className="nt-checkRow">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsPrivate(checked);
              setError('');
              if (!checked) {
                setSelectedStaff([]);
              } else if (selectedStaff.length === 0 && ownerName) {
                setSelectedStaff([ownerName]);
              }
            }}
          />
          Mark private for selected employee
        </label>

        {isPrivate ? (
          <div className="ui-field">
            <span className="ui-label">Select employee</span>
            <MultiSelectDropdown
              label="Select employee"
              options={staffOptions}
              value={selectedStaff}
              onChange={(next) => {
                setSelectedStaff(next);
                setError('');
              }}
              placeholder="Select employee"
              multiple
            />
            <p className="nt-help">Only the selected employees can see this private note.</p>
          </div>
        ) : null}

        <div className="ui-field">
          <button
            type="button"
            className="nt-attach"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} aria-hidden />
            {attachLabel ? (
              <span className="nt-attachName">{attachLabel}</span>
            ) : (
              <>
                <span>Click to attach media</span>
                <span className="nt-attachHint">Images, video, or documents</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            id={fileInputId}
            className="nt-hidden"
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setPendingFile(file);
              if (file) setExistingAttachment(undefined);
            }}
          />
        </div>

        {error ? <p className="nt-error">{error}</p> : null}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete note"
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
          Are you sure you want to delete this note
          {deleteTarget ? (
            <>
              {' '}
              by <strong>{deleteTarget.createdBy}</strong>
            </>
          ) : null}
          ?
        </p>
      </Modal>
    </section>
  );
}
