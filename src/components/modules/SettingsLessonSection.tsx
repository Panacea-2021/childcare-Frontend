'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';
import '@/components/ui/module.css';
import styles from './SettingsLessonSection.module.css';

type LibraryOption = 'foundation' | 'ams' | 'ami' | 'none';

type LessonSet = {
  id: string;
  name: string;
  suffix: string;
  classroomIds: string[];
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

const CENTER_NAME = 'Hams Kids Home | Daycare';

const LIBRARY_OPTIONS: {
  id: LibraryOption;
  title: string;
  description: string;
  enabledCopy: string;
  seedSets: Omit<LessonSet, 'classroomIds'>[];
}[] = [
  {
    id: 'foundation',
    title: 'Montessori Foundation',
    description: 'Prefills the ready-to-use Montessori steps and foundations lessons.',
    enabledCopy:
      'Montessori Foundation lessons are loaded and available to teachers in the lesson library for this center.',
    seedSets: [
      { id: 'ls-f1', name: 'Practical Life', suffix: 'Foundation' },
      { id: 'ls-f2', name: 'Sensorial', suffix: 'Foundation' },
      { id: 'ls-f3', name: 'Language', suffix: 'Foundation' },
    ],
  },
  {
    id: 'ams',
    title: 'AMS',
    description: 'Prefills the ready-to-use AMS curriculum lessons.',
    enabledCopy: 'AMS lessons are loaded and available to teachers in the lesson library for this center.',
    seedSets: [
      { id: 'ls-1', name: 'Elementary (6-12)', suffix: '6-12' },
      { id: 'ls-2', name: 'Elementary (6-9)', suffix: '6-9' },
      { id: 'ls-3', name: 'Elementary (9-12)', suffix: '9-12' },
      { id: 'ls-4', name: 'Primary (3-6)', suffix: '3-6' },
      { id: 'ls-5', name: 'Toddler (1.5-3)', suffix: '1.5-3' },
    ],
  },
  {
    id: 'ami',
    title: 'AMI',
    description: 'Prefills the ready-to-use AMI curriculum lessons.',
    enabledCopy: 'AMI lessons are loaded and available to teachers in the lesson library for this center.',
    seedSets: [
      { id: 'ls-a1', name: 'Primary (3-6)', suffix: '3-6' },
      { id: 'ls-a2', name: 'Elementary (6-12)', suffix: '6-12' },
      { id: 'ls-a3', name: 'Toddler (0-3)', suffix: '0-3' },
    ],
  },
  {
    id: 'none',
    title: 'No lessons',
    description: 'The lesson library starts empty — teachers build it themselves.',
    enabledCopy:
      'The Montessori Framework is enabled. The lesson library starts empty for this center.',
    seedSets: [],
  },
];

function classroomOptions() {
  return loadActiveCenterRooms().map((room) => ({ id: room.id, name: room.name }));
}

function CircleCheck({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className={styles.check} htmlFor={id}>
      <input
        id={id}
        className={styles.checkInput}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.circle} ${checked ? styles.circleOn : ''}`} aria-hidden>
        {checked ? (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.5"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span>{label}</span>
    </label>
  );
}

export function SettingsLessonSection() {
  const [view, setView] = useState<'settings' | 'mapping'>('settings');
  const [loadingMap, setLoadingMap] = useState(false);

  const [shareToParents, setShareToParents] = useState(true);
  const [disableWeekly, setDisableWeekly] = useState(false);
  const [disableAssignment, setDisableAssignment] = useState(false);
  const [noObservation, setNoObservation] = useState(false);

  const [frameworkEnabled, setFrameworkEnabled] = useState(false);
  const [library, setLibrary] = useState<LibraryOption>('foundation');
  const [enableOpen, setEnableOpen] = useState(false);
  const [pickedLibrary, setPickedLibrary] = useState<LibraryOption>('foundation');
  const [successOpen, setSuccessOpen] = useState(false);

  const [lessonSets, setLessonSets] = useState<LessonSet[]>([]);
  const [sortAsc, setSortAsc] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<LessonSet | null>(null);
  const [editName, setEditName] = useState('');
  const [editRooms, setEditRooms] = useState<string[]>([]);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const roomsRef = useRef<HTMLDivElement | null>(null);

  const [toast, setToast] = useState<ToastState>(null);
  const [lockedTip, setLockedTip] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (roomsRef.current && !roomsRef.current.contains(e.target as Node)) setRoomsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const libraryMeta = LIBRARY_OPTIONS.find((o) => o.id === library) ?? LIBRARY_OPTIONS[0];

  const sortedSets = useMemo(() => {
    const list = [...lessonSets];
    list.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [lessonSets, sortAsc]);

  const saveSettings = () => {
    setToast({ type: 'ok', message: 'Settings saved' });
  };

  const openEnable = () => {
    setPickedLibrary('foundation');
    setEnableOpen(true);
  };

  const confirmEnable = () => {
    const meta = LIBRARY_OPTIONS.find((o) => o.id === pickedLibrary) ?? LIBRARY_OPTIONS[0];
    setLibrary(pickedLibrary);
    setFrameworkEnabled(true);
    setDisableWeekly(true);
    setDisableAssignment(true);
    setShareToParents(true);
    setLessonSets(
      meta.seedSets.map((s) => ({
        ...s,
        classroomIds: [],
      })),
    );
    setEnableOpen(false);
    setSuccessOpen(true);
  };

  const goToMapping = () => {
    setSuccessOpen(false);
    setLoadingMap(true);
    setView('mapping');
    window.setTimeout(() => setLoadingMap(false), 500);
  };

  const openAdd = () => {
    setAddName('');
    setAddOpen(true);
  };

  const submitAdd = () => {
    if (!addName.trim()) return;
    const name = addName.trim();
    setLessonSets((list) => [
      { id: `ls-${Date.now()}`, name, suffix: name, classroomIds: [] },
      ...list,
    ]);
    setAddOpen(false);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const openEdit = (set: LessonSet) => {
    setEditing(set);
    setEditName(set.name);
    setEditRooms([...set.classroomIds]);
    setRoomsOpen(false);
    setEditOpen(true);
  };

  const submitEdit = () => {
    if (!editing || !editName.trim()) return;
    setLessonSets((list) =>
      list.map((s) =>
        s.id === editing.id
          ? { ...s, name: editName.trim(), classroomIds: [...editRooms] }
          : s,
      ),
    );
    setEditOpen(false);
    setEditing(null);
    setToast({ type: 'ok', message: 'Saved' });
  };

  const roomLabel = (id: string) => classroomOptions().find((r) => r.id === id)?.name ?? id;

  const classroomsDisplay = (ids: string[]) => {
    if (ids.length === 0) return 'No classrooms';
    return ids.map(roomLabel).join(', ');
  };

  if (view === 'mapping') {
    return (
      <SettingsSectionShell
        title="Lesson Set Mapping"
        description="Which classrooms each lesson set applies to — drives the classroom filters across Progress Tracking."
        icon={<BookOpen />}
        actions={
          !loadingMap ? (
            <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
              + Add lesson set
            </button>
          ) : undefined
        }
      >
        <div className={styles.root}>
          {loadingMap ? (
            <div className={styles.loading} role="status" aria-label="Loading">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          ) : (
            <>
              <button type="button" className={styles.backLink} onClick={() => setView('settings')}>
                ← Back to Lesson Settings
              </button>

              <section className={styles.tableCard}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>
                          <button
                            type="button"
                            className={styles.sortBtn}
                            onClick={() => setSortAsc((v) => !v)}
                          >
                            Lesson Set
                            <span className={styles.sortIcon} aria-hidden>
                              {sortAsc ? '↑↓' : '↓↑'}
                            </span>
                          </button>
                        </th>
                        <th>Classrooms</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSets.length === 0 ? (
                        <tr>
                          <td colSpan={3}>
                            <div className={styles.empty}>No lesson sets yet. Add one to get started.</div>
                          </td>
                        </tr>
                      ) : (
                        sortedSets.map((set) => (
                          <tr key={set.id}>
                            <td>
                              <span className={styles.setName}>{set.name}</span>
                              {set.suffix ? (
                                <span className={styles.setSuffix}> · {set.suffix}</span>
                              ) : null}
                            </td>
                            <td
                              className={
                                set.classroomIds.length === 0 ? styles.noRooms : styles.roomsCell
                              }
                            >
                              {classroomsDisplay(set.classroomIds)}
                            </td>
                            <td className={styles.editCell}>
                              <button
                                type="button"
                                className="ui-btn ui-btn-outline"
                                onClick={() => openEdit(set)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          <Modal
            open={addOpen}
            title="Add lesson set"
            onClose={() => setAddOpen(false)}
            footer={
              <>
                <button type="button" className="ui-btn ui-btn-outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  disabled={!addName.trim()}
                  onClick={submitAdd}
                >
                  Add
                </button>
              </>
            }
          >
            <p className={styles.modalLead}>
              Creates the lesson set and its matching category. You can map classrooms to it afterwards
              with Edit.
            </p>
            <div className="ui-field">
              <input
                className="ui-input"
                placeholder="Lesson set name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                autoFocus
              />
            </div>
          </Modal>

          <Modal
            open={editOpen}
            title="Edit lesson set"
            onClose={() => setEditOpen(false)}
            footer={
              <>
                <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  disabled={!editName.trim()}
                  onClick={submitEdit}
                >
                  Save
                </button>
              </>
            }
          >
            <div className={styles.modalStack}>
              <div className="ui-field">
                <label className="ui-label" htmlFor="edit-set-name">
                  Lesson set name
                </label>
                <input
                  id="edit-set-name"
                  className="ui-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="ui-field">
                <div className="ui-label">Classrooms</div>
                <div className={styles.multiSelect} ref={roomsRef}>
                  <button
                    type="button"
                    className={styles.multiTrigger}
                    aria-expanded={roomsOpen}
                    onClick={() => setRoomsOpen((v) => !v)}
                  >
                    {editRooms.length === 0 ? (
                      <span className={styles.placeholder}>Select classrooms</span>
                    ) : (
                      editRooms.map((id) => (
                        <span key={id} className={styles.chip}>
                          {roomLabel(id)}
                          <button
                            type="button"
                            className={styles.chipRemove}
                            aria-label={`Remove ${roomLabel(id)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditRooms((list) => list.filter((x) => x !== id));
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </button>
                  {roomsOpen ? (
                    <div className={styles.multiMenu} role="listbox">
                      {classroomOptions().map((r) => {
                        const on = editRooms.includes(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            role="option"
                            aria-selected={on}
                            className={`${styles.multiOption} ${on ? styles.multiOptionOn : ''}`}
                            onClick={() =>
                              setEditRooms((list) =>
                                on ? list.filter((x) => x !== r.id) : [...list, r.id],
                              )
                            }
                          >
                            {r.name}
                            {on ? ' ✓' : ''}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Modal>

          {toast ? (
            <div className={styles.toast} role="status">
              <span className={styles.toastOk} aria-hidden>
                ✓
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

  return (
    <SettingsSectionShell
      title="Lesson"
      description="Enable learning frameworks and map lesson sets to classrooms."
      icon={<BookOpen />}
    >
    <div className={styles.root}>
      <section className={styles.card}>
        <div className={styles.checks}>
          <CircleCheck
            id="lesson-share"
            label="Automatically share lesson to parents"
            checked={shareToParents}
            onChange={setShareToParents}
          />
          <CircleCheck
            id="lesson-weekly"
            label="Disable submission for weekly plan"
            checked={disableWeekly}
            onChange={setDisableWeekly}
          />
          <CircleCheck
            id="lesson-assignment"
            label="Disable submission for assignment"
            checked={disableAssignment}
            onChange={setDisableAssignment}
          />
          {frameworkEnabled ? (
            <CircleCheck
              id="lesson-observation"
              label="Don't create an observation when a lesson plan status changes"
              checked={noObservation}
              onChange={setNoObservation}
            />
          ) : null}
        </div>
        <div className={styles.saveWrap}>
          <button type="button" className={`ui-btn ui-btn-primary ${styles.saveBtn}`} onClick={saveSettings}>
            SAVE
          </button>
        </div>
      </section>

      <section className={styles.frameworkCard}>
        <div className={styles.frameworkMain}>
          <div className={styles.frameworkTitleRow}>
            <h2 className={styles.frameworkTitle}>Montessori Framework</h2>
            {frameworkEnabled ? (
              <span className={styles.enabledBadge}>
                <span aria-hidden>✓</span> ENABLED
              </span>
            ) : null}
          </div>
          <p className={styles.frameworkDesc}>
            {frameworkEnabled
              ? libraryMeta.enabledCopy
              : 'Turns on the Montessori framework, with an optional ready-to-use lesson library (Montessori Foundation, AMS or AMI) for this center.'}
          </p>
          {!frameworkEnabled ? (
            <p className={styles.frameworkLockNote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M8 11V8a4 4 0 0 1 8 0v3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              One-time setup cannot be turned off from settings later.
            </p>
          ) : (
            <button
              type="button"
              className={styles.mapLink}
              onClick={() => {
                setLoadingMap(true);
                setView('mapping');
                window.setTimeout(() => setLoadingMap(false), 400);
              }}
            >
              Open Lesson Set Mapping →
            </button>
          )}
        </div>

        {!frameworkEnabled ? (
          <button type="button" className={`ui-btn ui-btn-outline ${styles.enableBtn}`} onClick={openEnable}>
            Enable Framework
          </button>
        ) : (
          <div className={styles.lockedWrap}>
            <span className={styles.lockedLabel}>Locked</span>
            <button
              type="button"
              className={styles.infoBtn}
              aria-label="About locked framework"
              onClick={() => setLockedTip((v) => !v)}
            >
              i
            </button>
            {lockedTip ? (
              <div className={styles.lockedTip} role="tooltip">
                Once enabled, the Montessori Framework stays on for this center. Reverting requires
                contacting support.
              </div>
            ) : null}
          </div>
        )}
      </section>

      <Modal
        open={enableOpen}
        title="Enable Montessori Framework"
        onClose={() => setEnableOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setEnableOpen(false)}>
              Cancel
            </button>
            <button type="button" className={`ui-btn ui-btn-primary ${styles.enablePrimary}`} onClick={confirmEnable}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3v4M12 17v4M3 12h4M17 12h4M6.2 6.2l2.8 2.8M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Enable Framework
            </button>
          </>
        }
      >
        <p className={styles.modalLead}>
          This will turn on the Montessori curriculum for <strong>{CENTER_NAME}</strong>. Please review
          before continuing.
        </p>
        <div className={styles.warningBox}>
          <div className={styles.warningTitle}>This action cannot be undone</div>
          <div className={styles.warningText}>
            Once enabled, the Montessori Framework stays on for this center. Reverting requires contacting
            Illumine support.
          </div>
        </div>
        <div className={styles.radioBlock}>
          <div className={styles.radioHeading}>Prefill the lesson library from</div>
          <div className={styles.radioList}>
            {LIBRARY_OPTIONS.map((opt) => (
              <label key={opt.id} className={styles.radioRow}>
                <input
                  type="radio"
                  name="lesson-library"
                  className={styles.radioInput}
                  checked={pickedLibrary === opt.id}
                  onChange={() => setPickedLibrary(opt.id)}
                />
                <span className={`${styles.radioDot} ${pickedLibrary === opt.id ? styles.radioDotOn : ''}`} aria-hidden />
                <span className={styles.radioCopy}>
                  <span className={styles.radioTitle}>{opt.title}</span>
                  <span className={styles.radioDesc}>{opt.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={successOpen}
        title="Montessori Framework enabled"
        onClose={() => setSuccessOpen(false)}
        footer={
          <button type="button" className={`ui-btn ui-btn-primary ${styles.successBtn}`} onClick={goToMapping}>
            Continue to Lesson Set Mapping
          </button>
        }
      >
        <div className={styles.successBody}>
          <div className={styles.successIcon} aria-hidden>
            ✓
          </div>
          <p className={styles.successText}>
            The {libraryMeta.title === 'No lessons' ? 'Montessori' : libraryMeta.title} lessons are now
            available in the lesson library for <strong>{CENTER_NAME}</strong>. Teachers can start using them
            right away.
          </p>
        </div>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={styles.toastOk} aria-hidden>
            ✓
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
