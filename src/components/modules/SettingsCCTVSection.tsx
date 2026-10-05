'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Video } from 'lucide-react';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import { Modal } from '@/components/ui/Modal';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';
import '@/components/ui/module.css';
import styles from './SettingsCCTVSection.module.css';

type Camera = {
  id: string;
  name: string;
  url: string;
  roomIds: string[];
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

const PAGE_SIZE = 8;

function roomOptions() {
  return loadActiveCenterRooms().map((room) => ({ id: room.id, name: room.name }));
}

const SEED: Camera[] = [
  {
    id: 'cam-lobby',
    name: 'Lobby Entrance',
    url: 'rtsp://cameras.panacea.local/lobby',
    roomIds: ['sunshine'],
  },
  {
    id: 'cam-sunshine',
    name: 'Sunshine Classroom',
    url: 'rtsp://cameras.panacea.local/sunshine',
    roomIds: ['sunshine', 'rainbow'],
  },
  {
    id: 'cam-playground',
    name: 'Outdoor Playground',
    url: 'rtsp://cameras.panacea.local/playground',
    roomIds: ['tiny-tots', 'play-group'],
  },
  {
    id: 'cam-nursery',
    name: 'Nursery Corridor',
    url: 'rtsp://cameras.panacea.local/nursery',
    roomIds: ['nursery-a', 'nursery-b'],
  },
  {
    id: 'cam-pickup',
    name: 'Pickup Zone',
    url: 'rtsp://cameras.panacea.local/pickup',
    roomIds: [],
  },
];

function roomName(id: string) {
  return roomOptions().find((r) => r.id === id)?.name ?? id;
}

function SearchIcon() {
  return (
    <svg className={styles.fieldIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className={styles.fieldIcon} width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path d="M3 5.5 7 9.5 11 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M17 10l4-2v8l-4-2V10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="10" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function SettingsCCTVSection() {
  const [cameras, setCameras] = useState<Camera[]>(SEED);
  const [page, setPage] = useState(1);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({ name: '', url: '', roomIds: [] as string[] });
  const [addRoomsOpen, setAddRoomsOpen] = useState(false);
  const [addRoomQuery, setAddRoomQuery] = useState('');

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ cameraId: '', roomIds: [] as string[] });
  const [assignCamOpen, setAssignCamOpen] = useState(false);
  const [assignCamQuery, setAssignCamQuery] = useState('');
  const [assignRoomsOpen, setAssignRoomsOpen] = useState(false);
  const [assignRoomQuery, setAssignRoomQuery] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);
  const addRoomsRef = useRef<HTMLDivElement | null>(null);
  const assignCamRef = useRef<HTMLDivElement | null>(null);
  const assignRoomsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuId(null);
      if (addRoomsRef.current && !addRoomsRef.current.contains(target)) setAddRoomsOpen(false);
      if (assignCamRef.current && !assignCamRef.current.contains(target)) setAssignCamOpen(false);
      if (assignRoomsRef.current && !assignRoomsRef.current.contains(target)) setAssignRoomsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const totalPages = Math.max(1, Math.ceil(cameras.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return cameras.slice(start, start + PAGE_SIZE);
  }, [cameras, pageSafe]);

  const filteredAddRooms = useMemo(() => {
    const q = addRoomQuery.trim().toLowerCase();
    const rooms = roomOptions();
    if (!q) return rooms;
    return rooms.filter((r) => r.name.toLowerCase().includes(q));
  }, [addRoomQuery]);

  const filteredAssignCams = useMemo(() => {
    const q = assignCamQuery.trim().toLowerCase();
    if (!q) return cameras;
    return cameras.filter((c) => c.name.toLowerCase().includes(q));
  }, [assignCamQuery, cameras]);

  const filteredAssignRooms = useMemo(() => {
    const q = assignRoomQuery.trim().toLowerCase();
    const rooms = roomOptions();
    if (!q) return rooms;
    return rooms.filter((r) => r.name.toLowerCase().includes(q));
  }, [assignRoomQuery]);

  const selectedAssignCamera = cameras.find((c) => c.id === assignForm.cameraId);

  const openAdd = () => {
    setEditingId(null);
    setAddForm({ name: '', url: '', roomIds: [] });
    setAddRoomsOpen(false);
    setAddRoomQuery('');
    setAddOpen(true);
  };

  const openEdit = (cam: Camera) => {
    setEditingId(cam.id);
    setAddForm({ name: cam.name, url: cam.url, roomIds: [...cam.roomIds] });
    setMenuId(null);
    setAddRoomsOpen(false);
    setAddRoomQuery('');
    setAddOpen(true);
  };

  const saveAdd = () => {
    if (!addForm.name.trim() || !addForm.url.trim() || addForm.roomIds.length === 0) {
      setToast({ type: 'err', message: 'Please fill out all details' });
      return;
    }
    if (editingId) {
      setCameras((list) =>
        list.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: addForm.name.trim(),
                url: addForm.url.trim(),
                roomIds: [...addForm.roomIds],
              }
            : c,
        ),
      );
    } else {
      setCameras((list) => [
        {
          id: `cam-${Date.now()}`,
          name: addForm.name.trim(),
          url: addForm.url.trim(),
          roomIds: [...addForm.roomIds],
        },
        ...list,
      ]);
      setPage(1);
    }
    setAddOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const openAssign = () => {
    setAssignForm({ cameraId: '', roomIds: [] });
    setAssignCamOpen(false);
    setAssignCamQuery('');
    setAssignRoomsOpen(false);
    setAssignRoomQuery('');
    setAssignOpen(true);
  };

  const saveAssign = () => {
    if (!assignForm.cameraId || assignForm.roomIds.length === 0) {
      setToast({ type: 'err', message: 'Please fill out all details' });
      return;
    }
    setCameras((list) =>
      list.map((c) =>
        c.id === assignForm.cameraId
          ? { ...c, roomIds: Array.from(new Set([...c.roomIds, ...assignForm.roomIds])) }
          : c,
      ),
    );
    setAssignOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const deleteCamera = (id: string) => {
    setCameras((list) => list.filter((c) => c.id !== id));
    setMenuId(null);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const toggleRoom = (list: string[], id: string, setter: (next: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const renderRoomChips = (
    roomIds: string[],
    onRemove: (id: string) => void,
    placeholder: string,
  ) => {
    if (roomIds.length === 0) {
      return <span className={styles.placeholder}>{placeholder}</span>;
    }
    return roomIds.map((id) => (
      <span key={id} className={styles.chip}>
        {roomName(id)}
        <button
          type="button"
          className={styles.chipRemove}
          aria-label={`Remove ${roomName(id)}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          ×
        </button>
      </span>
    ));
  };

  return (
    <SettingsSectionShell
      title="CCTV"
      description="Configure live streaming cameras and room assignments."
      icon={<Video />}
      actions={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={openAssign}>
            Assign Camera
          </button>
          <button type="button" className={`ui-btn ui-btn-primary ${styles.addBtn}`} onClick={openAdd}>
            <CameraIcon />
            Add CCTV
          </button>
        </>
      }
    >
    <div className={styles.root}>
      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Camera Name</th>
                <th>Url</th>
                <th>Classes</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className={styles.empty}>No cameras configured</div>
                  </td>
                </tr>
              ) : (
                pageRows.map((cam) => (
                  <tr key={cam.id}>
                    <td>{cam.name}</td>
                    <td className={styles.urlCell}>{cam.url}</td>
                    <td>{cam.roomIds.length}</td>
                    <td className={styles.actionsCell}>
                      <div ref={menuId === cam.id ? menuRef : undefined}>
                        <button
                          type="button"
                          className={styles.menuBtn}
                          aria-label={`Actions for ${cam.name}`}
                          aria-expanded={menuId === cam.id}
                          onClick={() => setMenuId((id) => (id === cam.id ? null : cam.id))}
                        >
                          ⋮
                        </button>
                        {menuId === cam.id ? (
                          <div className={styles.menu} role="menu">
                            <button
                              type="button"
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => openEdit(cam)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${styles.menuItem} ${styles.menuItemDanger}`}
                              role="menuitem"
                              onClick={() => deleteCamera(cam.id)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={pageSafe <= 1}
            aria-label="Previous page"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.pageBtn} ${n === pageSafe ? styles.pageBtnActive : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className={styles.pageBtn}
            disabled={pageSafe >= totalPages}
            aria-label="Next page"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
        </div>
      </section>

      <Modal
        open={addOpen}
        title={editingId ? 'Edit CCTV' : 'Add CCTV'}
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveAdd}>
              {editingId ? 'Save' : 'Add'}
            </button>
          </>
        }
      >
        <div className={styles.formRow}>
          <label className={styles.formLabel} htmlFor="cctv-name">
            <span className={styles.req}>*</span> Display Name
          </label>
          <input
            id="cctv-name"
            className="ui-input"
            value={addForm.name}
            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Display Name"
          />
        </div>
        <div className={styles.formRow}>
          <label className={styles.formLabel} htmlFor="cctv-url">
            <span className={styles.req}>*</span> Camera URL
          </label>
          <input
            id="cctv-url"
            className="ui-input"
            value={addForm.url}
            onChange={(e) => setAddForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="rtsp://..."
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formLabel}>
            <span className={styles.req}>*</span> Select Room
          </div>
          <div className={styles.multiSelect} ref={addRoomsRef}>
            <button
              type="button"
              className={styles.multiTrigger}
              aria-expanded={addRoomsOpen}
              onClick={() => {
                setAddRoomsOpen((v) => !v);
                setAddRoomQuery('');
              }}
            >
              {renderRoomChips(
                addForm.roomIds,
                (id) =>
                  toggleRoom(addForm.roomIds, id, (next) => setAddForm((f) => ({ ...f, roomIds: next }))),
                'Select a camera',
              )}
            </button>
            {addRoomsOpen ? <SearchIcon /> : <ChevronIcon />}
            {addRoomsOpen ? (
              <div className={styles.multiMenu} role="listbox">
                <input
                  className={`ui-input ${styles.searchInput}`}
                  placeholder="Search"
                  value={addRoomQuery}
                  onChange={(e) => setAddRoomQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {filteredAddRooms.length === 0 ? (
                  <div className={styles.multiEmpty}>No rooms found</div>
                ) : (
                  filteredAddRooms.map((r) => {
                    const on = addForm.roomIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="option"
                        aria-selected={on}
                        className={`${styles.multiOption} ${on ? styles.multiOptionOn : ''}`}
                        onClick={() =>
                          toggleRoom(addForm.roomIds, r.id, (next) =>
                            setAddForm((f) => ({ ...f, roomIds: next })),
                          )
                        }
                      >
                        <span>{r.name}</span>
                        {on ? <span className={styles.check}>✓</span> : null}
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Modal>

      <Modal
        open={assignOpen}
        title="Assign camera to classroom"
        onClose={() => setAssignOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveAssign}>
              Add
            </button>
          </>
        }
      >
        <div className={styles.formRow}>
          <div className={styles.formLabel}>
            <span className={styles.req}>*</span> Camera
          </div>
          <div className={styles.multiSelect} ref={assignCamRef}>
            <button
              type="button"
              className={styles.multiTrigger}
              aria-expanded={assignCamOpen}
              onClick={() => {
                setAssignCamOpen((v) => !v);
                setAssignRoomsOpen(false);
                setAssignCamQuery('');
              }}
            >
              {selectedAssignCamera ? (
                <span>{selectedAssignCamera.name}</span>
              ) : (
                <span className={styles.placeholder}>Select a camera</span>
              )}
            </button>
            <SearchIcon />
            {assignCamOpen ? (
              <div className={styles.multiMenu} role="listbox">
                <input
                  className={`ui-input ${styles.searchInput}`}
                  placeholder="Search"
                  value={assignCamQuery}
                  onChange={(e) => setAssignCamQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {filteredAssignCams.length === 0 ? (
                  <div className={styles.multiEmpty}>No cameras found</div>
                ) : (
                  filteredAssignCams.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="option"
                      aria-selected={assignForm.cameraId === c.id}
                      className={`${styles.multiOption} ${
                        assignForm.cameraId === c.id ? styles.multiOptionOn : ''
                      }`}
                      onClick={() => {
                        setAssignForm((f) => ({ ...f, cameraId: c.id }));
                        setAssignCamOpen(false);
                        setAssignCamQuery('');
                      }}
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formLabel}>
            <span className={styles.req}>*</span> Room
          </div>
          <div className={styles.multiSelect} ref={assignRoomsRef}>
            <button
              type="button"
              className={styles.multiTrigger}
              aria-expanded={assignRoomsOpen}
              onClick={() => {
                setAssignRoomsOpen((v) => !v);
                setAssignCamOpen(false);
                setAssignRoomQuery('');
              }}
            >
              {renderRoomChips(
                assignForm.roomIds,
                (id) =>
                  toggleRoom(assignForm.roomIds, id, (next) =>
                    setAssignForm((f) => ({ ...f, roomIds: next })),
                  ),
                'Select a camera',
              )}
            </button>
            {assignRoomsOpen ? <SearchIcon /> : <ChevronIcon />}
            {assignRoomsOpen ? (
              <div className={styles.multiMenu} role="listbox">
                <input
                  className={`ui-input ${styles.searchInput}`}
                  placeholder="Search"
                  value={assignRoomQuery}
                  onChange={(e) => setAssignRoomQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {filteredAssignRooms.length === 0 ? (
                  <div className={styles.multiEmpty}>No rooms found</div>
                ) : (
                  filteredAssignRooms.map((r) => {
                    const on = assignForm.roomIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="option"
                        aria-selected={on}
                        className={`${styles.multiOption} ${on ? styles.multiOptionOn : ''}`}
                        onClick={() =>
                          toggleRoom(assignForm.roomIds, r.id, (next) =>
                            setAssignForm((f) => ({ ...f, roomIds: next })),
                          )
                        }
                      >
                        <span>{r.name}</span>
                        {on ? <span className={styles.check}>✓</span> : null}
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={toast.type === 'ok' ? styles.toastOk : styles.toastErr} aria-hidden>
            {toast.type === 'ok' ? '✓' : '×'}
          </span>
          <span>{toast.message}</span>
          <button type="button" className={styles.toastClose} aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
    </SettingsSectionShell>
  );
}
