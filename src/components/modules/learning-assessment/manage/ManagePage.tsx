'use client';

import { useEffect, useState } from 'react';
import { LearningAssessmentPageHeader } from '../LearningAssessmentPageHeader';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Settings2 } from 'lucide-react';
import type { DevelopmentArea, ScoringScale, LearningSettings } from '@/types/learningManage';
import {
  loadAreas,
  saveAreas,
  loadScales,
  saveScales,
  loadSettings,
  saveSettings,
} from './store';
import './manage.css';

const COLOR_OPTIONS = [
  '#5D5FEF',
  '#2563EB',
  '#0891B2',
  '#0D9488',
  '#059669',
  '#D97706',
  '#DB2777',
  '#7C3AED',
];

type Tab = 'areas' | 'scales' | 'settings';

export default function ManagePage() {
  const [tab, setTab] = useState<Tab>('areas');
  const [areas, setAreas] = useState<DevelopmentArea[]>(() => loadAreas());
  const [scales, setScales] = useState<ScoringScale[]>(() => loadScales());
  const [settings, setSettings] = useState<LearningSettings>(() => loadSettings());

  const [areaModal, setAreaModal] = useState<{ open: boolean; editing: DevelopmentArea | null }>({
    open: false,
    editing: null,
  });
  const [scaleModal, setScaleModal] = useState<{ open: boolean; editing: ScoringScale | null }>({
    open: false,
    editing: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<DevelopmentArea | ScoringScale | null>(null);

  const activeScale = scales.find((s) => s.id === settings.defaultScaleId) ?? scales[0];

  const handleSaveArea = (item: DevelopmentArea, isEdit: boolean) => {
    let next: DevelopmentArea[];
    if (isEdit) {
      next = areas.map((a) => (a.id === item.id ? item : a));
    } else {
      next = [...areas, item];
    }
    setAreas(next);
    saveAreas(next);
    setAreaModal({ open: false, editing: null });
  };

  const handleSaveScale = (item: ScoringScale, isEdit: boolean) => {
    let next: ScoringScale[];
    if (isEdit) {
      next = scales.map((s) => (s.id === item.id ? item : s));
    } else {
      next = [...scales, item];
    }
    setScales(next);
    saveScales(next);
    setScaleModal({ open: false, editing: null });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if ('levels' in deleteTarget) {
      const next = scales.filter((s) => s.id !== deleteTarget.id);
      setScales(next);
      saveScales(next);
      if (settings.defaultScaleId === deleteTarget.id) {
        const s = { ...settings, defaultScaleId: next[0]?.id ?? '' };
        setSettings(s);
        saveSettings(s);
      }
    } else {
      const next = areas.filter((a) => a.id !== deleteTarget.id);
      setAreas(next);
      saveAreas(next);
      if (settings.defaultAreaId === deleteTarget.id) {
        const s = { ...settings, defaultAreaId: next[0]?.id ?? '' };
        setSettings(s);
        saveSettings(s);
      }
    }
    setDeleteTarget(null);
  };

  const updateSettings = (patch: Partial<LearningSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'areas', label: 'Development Areas' },
    { id: 'scales', label: 'Scoring Scales' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="mod-page mg-page">
      <LearningAssessmentPageHeader
        title="Manage"
        description="Configure learning areas, scoring scales, and assessment settings."
        icon={<Settings2 size={22} strokeWidth={2.1} />}
        actions={
          tab === 'areas' ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => setAreaModal({ open: true, editing: null })}
            >
              <Plus size={16} /> Add Area
            </button>
          ) : tab === 'scales' ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => setScaleModal({ open: true, editing: null })}
            >
              <Plus size={16} /> Add Scale
            </button>
          ) : null
        }
      />

      <div className="mg-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`mg-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'areas' ? (
        <div className="mod-panel mg-panel">
          {areas.length === 0 ? (
            <p className="mg-empty">No development areas yet. Add one to get started.</p>
          ) : (
            <div className="mg-list">
              {areas.map((a) => (
                <div key={a.id} className="mg-row">
                  <span className="mg-dot" style={{ background: a.color }} aria-hidden />
                  <div className="mg-row-main">
                    <strong>{a.name}</strong>
                    <span className={`mg-status${a.active ? ' is-on' : ''}`}>
                      {a.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mg-row-actions">
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline"
                      onClick={() => setAreaModal({ open: true, editing: a })}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="ui-btn ui-btn-danger"
                      onClick={() => setDeleteTarget(a)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === 'scales' ? (
        <div className="mod-panel mg-panel">
          {scales.length === 0 ? (
            <p className="mg-empty">No scoring scales yet. Add one to get started.</p>
          ) : (
            <div className="mg-list">
              {scales.map((s) => (
                <div key={s.id} className="mg-row">
                  <div className="mg-row-main">
                    <strong>{s.name}</strong>
                    <div className="mg-levels">
                      {s.levels.map((lvl, i) => (
                        <span key={lvl} className="mg-level">
                          {i > 0 ? ' → ' : ''}
                          {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mg-row-actions">
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline"
                      onClick={() => setScaleModal({ open: true, editing: s })}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="ui-btn ui-btn-danger"
                      onClick={() => setDeleteTarget(s)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === 'settings' ? (
        <div className="mod-panel mg-panel mg-settings">
          <div className="mg-setting-row">
            <div>
              <strong>Default development area</strong>
              <p>Pre-selected when a new assessment is created.</p>
            </div>
            <select
              className="ui-filter"
              value={settings.defaultAreaId}
              onChange={(e) => updateSettings({ defaultAreaId: e.target.value })}
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mg-setting-row">
            <div>
              <strong>Default scoring scale</strong>
              <p>Levels offered when recording a score.</p>
            </div>
            <select
              className="ui-filter"
              value={settings.defaultScaleId}
              onChange={(e) => updateSettings({ defaultScaleId: e.target.value })}
            >
              {scales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.levels.length} levels)
                </option>
              ))}
            </select>
          </div>

          <div className="mg-setting-row">
            <div>
              <strong>Parents can view assessments</strong>
              <p>Let families see their child's progress and portfolio.</p>
            </div>
            <label className="mg-toggle">
              <input
                type="checkbox"
                checked={settings.allowParentViews}
                onChange={(e) => updateSettings({ allowParentViews: e.target.checked })}
              />
              <span aria-hidden />
            </label>
          </div>

          <div className="mg-setting-row">
            <div>
              <strong>Require approval for assessments</strong>
              <p>New assessments are marked pending until a reviewer approves.</p>
            </div>
            <label className="mg-toggle">
              <input
                type="checkbox"
                checked={settings.requireApproval}
                onChange={(e) => updateSettings({ requireApproval: e.target.checked })}
              />
              <span aria-hidden />
            </label>
          </div>

          <p className="mg-settings-hint">
            Active scale: <strong>{activeScale?.name ?? '—'}</strong> ·{' '}
            {activeScale?.levels.join(' → ') ?? 'No scale configured'}
          </p>
        </div>
      ) : null}

      <AreaModal
        open={areaModal.open}
        editing={areaModal.editing}
        onClose={() => setAreaModal({ open: false, editing: null })}
        onSave={handleSaveArea}
      />

      <ScaleModal
        open={scaleModal.open}
        editing={scaleModal.editing}
        onClose={() => setScaleModal({ open: false, editing: null })}
        onSave={handleSaveScale}
      />

      <Modal
        open={deleteTarget !== null}
        title="Delete"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </>
        }
      >
        <p>
          Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

/* ---------- AreaModal ---------- */

function AreaModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: DevelopmentArea | null;
  onClose: () => void;
  onSave: (item: DevelopmentArea, isEdit: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setColor(editing.color);
      setActive(editing.active);
    } else {
      setName('');
      setColor(COLOR_OPTIONS[0]);
      setActive(true);
    }
    setError('');
  }, [open, editing]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    onSave(
      {
        id: editing?.id ?? `area-${Date.now()}`,
        name: name.trim(),
        color,
        active,
      },
      Boolean(editing),
    );
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Edit development area' : 'Add development area'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave}>
            {editing ? 'Save changes' : 'Add area'}
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label">Name</label>
        <input
          className="ui-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Music & Rhythm"
        />
      </div>

      <div className="ui-field">
        <label className="ui-label">Color</label>
        <div className="mg-colors">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              className={`mg-color${color === c ? ' is-selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="ui-field">
        <label className="mg-check">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span>Active</span>
        </label>
      </div>

      {error ? <p className="ui-field-error">{error}</p> : null}
    </Modal>
  );
}

/* ---------- ScaleModal ---------- */

function ScaleModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: ScoringScale | null;
  onClose: () => void;
  onSave: (item: ScoringScale, isEdit: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [levels, setLevels] = useState<string[]>(['Emerging', 'Developing', 'Proficient']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setLevels([...editing.levels]);
    } else {
      setName('');
      setLevels(['Emerging', 'Developing', 'Proficient']);
    }
    setError('');
  }, [open, editing]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    const clean = levels.map((l) => l.trim()).filter(Boolean);
    if (clean.length < 2) {
      setError('A scale needs at least two levels.');
      return;
    }
    onSave(
      {
        id: editing?.id ?? `scale-${Date.now()}`,
        name: name.trim(),
        levels: clean,
        active: editing?.active ?? true,
      },
      Boolean(editing),
    );
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Edit scoring scale' : 'Add scoring scale'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave}>
            {editing ? 'Save changes' : 'Add scale'}
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label">Name</label>
        <input
          className="ui-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 4-Level Scale"
        />
      </div>

      <div className="ui-field">
        <label className="ui-label">Levels</label>
        {levels.map((lvl, i) => (
          <div key={i} className="mg-level-row">
            <input
              className="ui-input"
              value={lvl}
              onChange={(e) => {
                const next = [...levels];
                next[i] = e.target.value;
                setLevels(next);
              }}
              placeholder={`Level ${i + 1}`}
            />
            <button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={() => setLevels(levels.filter((_, idx) => idx !== i))}
              disabled={levels.length <= 2}
              aria-label={`Remove level ${i + 1}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="ui-btn ui-btn-outline mg-add-level"
          onClick={() => setLevels([...levels, ''])}
        >
          <Plus size={14} /> Add level
        </button>
      </div>

      {error ? <p className="ui-field-error">{error}</p> : null}
    </Modal>
  );
}
