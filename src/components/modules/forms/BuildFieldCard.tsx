'use client';

import type { ReactNode } from 'react';
import {
  Calculator,
  Calendar,
  CheckSquare,
  CircleDot,
  Clock,
  Copy,
  FileText,
  GripVertical,
  Info,
  Link2,
  List,
  MoreVertical,
  Paperclip,
  Pencil,
  Phone,
  ShieldCheck,
  Signature,
  Smile,
  SquareSplitVertical,
  Star,
  Table2,
  Trash2,
  Type,
  Upload,
  X,
  DollarSign,
} from 'lucide-react';
import type { BuilderFieldKind, CanvasField } from './builderFieldData';

type Props = {
  field: CanvasField;
  selected: boolean;
  onSelect: () => void;
  onChange: (next: CanvasField) => void;
  onRemove: () => void;
};

const EMOJI_RATINGS = [
  { emoji: '😞', label: 'Unsatisfied' },
  { emoji: '😕', label: 'Bad' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😄', label: 'Satisfied' },
];

function TypeBadge({ kind }: { kind: BuilderFieldKind }) {
  const p = { size: 14, strokeWidth: 1.8 } as const;
  const map: Partial<Record<BuilderFieldKind, ReactNode>> = {
    number: <Calculator {...p} />,
    date: <Calendar {...p} />,
    time: <Clock {...p} />,
    phone: <Phone {...p} />,
    radio: <CircleDot {...p} />,
    checkbox: <CheckSquare {...p} />,
    dropdown: <List {...p} />,
    table: <Table2 {...p} />,
    rating: <Star {...p} />,
    emoji: <Smile {...p} />,
    section: <SquareSplitVertical {...p} />,
    pagebreak: <FileText {...p} />,
    signature: <Signature {...p} />,
    upload: <Upload {...p} />,
    attachment: <Paperclip {...p} />,
    fee: <DollarSign {...p} />,
    consent: <ShieldCheck {...p} />,
    instruction: <Info {...p} />,
    text: <Type {...p} />,
    system: <Type {...p} />,
  };
  return (
    <span className={`fb-type-badge kind-${kind}`} aria-hidden>
      {map[kind] ?? <Type {...p} />}
    </span>
  );
}

function ChoiceOptions({
  field,
  selected,
  onChange,
}: {
  field: CanvasField;
  selected: boolean;
  onChange: (next: CanvasField) => void;
}) {
  const options = field.options ?? ['Option 1', 'Option 2'];
  const isMulti = field.kind === 'checkbox';

  function updateOpt(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    onChange({ ...field, options: next });
  }

  function removeOpt(index: number) {
    if (options.length <= 1) return;
    onChange({ ...field, options: options.filter((_, i) => i !== index) });
  }

  function addOpt() {
    onChange({ ...field, options: [...options, `Option ${options.length + 1}`] });
  }

  return (
    <div className="fb-choice-block">
      {options.map((opt, oi) => (
        <div key={`${field.uid}-opt-${oi}`} className="fb-choice-row">
          <GripVertical size={13} className="fb-grip" aria-hidden />
          {isMulti ? (
            <span className="fb-choice-box" aria-hidden />
          ) : (
            <span className="fb-choice-radio" aria-hidden />
          )}
          {selected ? (
            <input
              className="fb-choice-input"
              value={opt}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => updateOpt(oi, e.target.value)}
            />
          ) : (
            <span className="fb-choice-label">{opt}</span>
          )}
          {selected ? (
            <button
              type="button"
              className="fb-opt-x"
              aria-label="Remove option"
              onClick={(e) => {
                e.stopPropagation();
                removeOpt(oi);
              }}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      ))}
      {selected && field.kind !== 'consent' ? (
        <button
          type="button"
          className="fb-add-opt"
          onClick={(e) => {
            e.stopPropagation();
            addOpt();
          }}
        >
          + Add Option
        </button>
      ) : null}
    </div>
  );
}

function FieldPreviewBody({
  field,
  selected,
  onChange,
}: {
  field: CanvasField;
  selected: boolean;
  onChange: (next: CanvasField) => void;
}) {
  if (field.kind === 'phone') {
    return (
      <div className="fb-preview-phone">
        <button type="button" className="fb-phone-cc" tabIndex={-1}>
          <span aria-hidden>🇮🇳</span>
          <span>+91</span>
          <span className="fb-caret">▾</span>
        </button>
        <div className="fb-field-answer soft">Phone Number</div>
      </div>
    );
  }
  if (field.kind === 'time') {
    return (
      <div className="fb-preview-time">
        <span>hh : mm</span>
        <Clock size={15} aria-hidden />
      </div>
    );
  }
  if (field.kind === 'date') {
    return (
      <div className="fb-preview-time">
        <span>Select date</span>
        <Calendar size={15} aria-hidden />
      </div>
    );
  }
  if (field.kind === 'number') {
    return <div className="fb-field-answer soft">Enter number</div>;
  }
  if (field.kind === 'radio' || field.kind === 'checkbox' || field.kind === 'dropdown') {
    return <ChoiceOptions field={field} selected={selected} onChange={onChange} />;
  }
  if (field.kind === 'rating') {
    return (
      <div className="fb-rating-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="fb-rating-item">
            <Star size={22} strokeWidth={1.5} />
            <span>{n}</span>
          </div>
        ))}
      </div>
    );
  }
  if (field.kind === 'emoji') {
    return (
      <div className="fb-emoji-row">
        {EMOJI_RATINGS.map((item) => (
          <div key={item.label} className="fb-emoji-item">
            <span className="fb-emoji">{item.emoji}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (field.kind === 'table') {
    const cols = field.columns ?? [];
    if (!selected) {
      return (
        <p className="fb-table-hint" style={{ padding: '8px 0' }}>
          {cols.length ? `${cols.length} column(s) · ${field.minRows ?? 1}–${field.maxRows ?? 5} rows` : 'Click to configure table columns.'}
        </p>
      );
    }
    return (
      <div className="fb-table-cfg">
        <div className="fb-table-limits">
          <label>
            Minimum rows
            <input
              type="number"
              min={0}
              value={field.minRows ?? 1}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...field, minRows: Number(e.target.value) || 0 })}
            />
          </label>
          <label>
            Maximum rows
            <input
              type="number"
              min={1}
              value={field.maxRows ?? 5}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...field, maxRows: Number(e.target.value) || 1 })}
            />
          </label>
        </div>
        <div className="fb-table-cols">
          <div className="fb-table-cols-head">
            <span>Configure Column</span>
            <button
              type="button"
              className="fb-add-col"
              onClick={(e) => {
                e.stopPropagation();
                onChange({
                  ...field,
                  columns: [...cols, `Column ${cols.length + 1}`],
                });
              }}
            >
              + Add Column
            </button>
          </div>
          {cols.length === 0 ? (
            <p className="fb-table-hint">Click to configure table columns.</p>
          ) : (
            <ul>
              {cols.map((c, i) => (
                <li key={`${field.uid}-col-${i}`}>
                  <input
                    value={c}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const next = [...cols];
                      next[i] = e.target.value;
                      onChange({ ...field, columns: next });
                    }}
                  />
                  <button
                    type="button"
                    className="fb-opt-x"
                    aria-label="Remove column"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...field, columns: cols.filter((_, idx) => idx !== i) });
                    }}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
  if (field.kind === 'section') {
    return <div className="fb-section-bar" />;
  }
  if (field.kind === 'pagebreak') {
    return <div className="fb-pagebreak-line">Page Break</div>;
  }
  if (field.kind === 'signature') {
    return (
      <div className="fb-sign-pad">
        <Signature size={28} strokeWidth={1.4} aria-hidden />
        <p>Sign using your finger, stylus, or mouse</p>
      </div>
    );
  }
  if (field.kind === 'upload') {
    return (
      <div className="fb-upload-zone">
        <Upload size={28} strokeWidth={1.5} aria-hidden />
        <p>Upload Files (Respondents will be able to upload files)</p>
      </div>
    );
  }
  if (field.kind === 'attachment') {
    return (
      <div className="fb-upload-zone">
        <Upload size={28} strokeWidth={1.5} aria-hidden />
        <p>Upload Files</p>
      </div>
    );
  }
  if (field.kind === 'fee') {
    const mode = field.paymentMode ?? 'offline';
    return (
      <div className="fb-payments">
        <div className="fb-pay-modes">
          <span className="fb-pay-label">Select Payment Mode</span>
          {(
            [
              ['online', 'Online'],
              ['offline', 'Offline'],
              ['both', 'Both'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="fb-pay-radio">
              <input
                type="radio"
                name={`${field.uid}-pay`}
                checked={mode === value}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onChange({ ...field, paymentMode: value })}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="fb-pay-amount">
          <span>Amount:</span>
          {selected ? (
            <input
              className="fb-pay-fee-input"
              value={field.feeLabel ?? 'Add Registration Fee'}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChange({ ...field, feeLabel: e.target.value })}
            />
          ) : (
            <span className="fb-pay-fee-text">{field.feeLabel ?? 'Add Registration Fee'}</span>
          )}
          <Pencil size={14} className="fb-pay-edit" aria-hidden />
        </div>
      </div>
    );
  }
  if (field.kind === 'consent') {
    return (
      <ChoiceOptions
        field={{
          ...field,
          options: field.options?.length ? field.options : ['I accept', "I don't accept"],
        }}
        selected={selected}
        onChange={onChange}
      />
    );
  }
  if (field.kind === 'instruction') {
    return null;
  }
  return <div className="fb-field-answer soft">Respondent&apos;s Answer</div>;
}

export function BuildFieldCard({ field, selected, onSelect, onChange, onRemove }: Props) {
  const isSimple = field.kind === 'section' || field.kind === 'pagebreak' || field.kind === 'instruction';
  const mediaLike = ['signature', 'upload', 'attachment', 'fee'].includes(field.kind);
  const showDisable = !['rating', 'emoji', 'table', 'section', 'pagebreak', 'fee', 'signature', 'upload', 'attachment', 'instruction'].includes(
    field.kind,
  );
  const showDependant = !['table', 'section', 'pagebreak', 'fee', 'signature', 'upload', 'attachment', 'instruction'].includes(
    field.kind,
  );

  if (isSimple) {
    return (
      <div
        className={`fb-build-card fb-simple-card ${selected ? 'is-selected' : ''}`}
        onClick={onSelect}
        role="listitem"
      >
        <div className="fb-build-top">
          <span className="fb-field-handle" aria-hidden>
            <GripVertical size={16} />
          </span>
          <span className="fb-simple-label">
            {field.kind === 'pagebreak' ? 'Page Break' : field.label || (field.kind === 'instruction' ? 'Instruction' : 'Section')}
          </span>
          <TypeBadge kind={field.kind} />
          {field.kind === 'section' ? (
            <button type="button" className="fb-icon-btn" aria-label="Duplicate" title="Duplicate">
              <Copy size={14} />
            </button>
          ) : null}
          <button
            type="button"
            className="fb-icon-btn"
            aria-label={`Delete ${field.label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
        {field.kind !== 'instruction' ? (
          <div className="fb-build-mid">
            <FieldPreviewBody field={field} selected={selected} onChange={onChange} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`fb-build-card ${selected ? 'is-selected' : ''} ${field.disabled ? 'is-disabled' : ''}`}
      onClick={onSelect}
      role="listitem"
    >
      <div className="fb-build-top">
        <span className="fb-field-handle" aria-hidden>
          <GripVertical size={16} />
        </span>
        <input
          className="fb-field-label-input"
          value={field.label}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
        />
        <TypeBadge kind={field.kind === 'system' ? 'text' : field.kind} />
      </div>

      <div className="fb-build-mid">
        <FieldPreviewBody field={field} selected={selected} onChange={onChange} />
      </div>

      {selected || mediaLike ? (
        <div className={`fb-build-foot ${mediaLike && !selected ? 'is-compact' : ''}`} onClick={(e) => e.stopPropagation()}>
          {selected && showDependant ? (
            <button type="button" className="fb-dependant">
              + Add Dependant Field
            </button>
          ) : (
            <span />
          )}
          <div className="fb-build-tools">
            {selected && !mediaLike ? (
              <label className="fb-mini-toggle">
                Required
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!field.required}
                  className={`fps-switch sm ${field.required ? 'is-on' : ''}`}
                  onClick={() => onChange({ ...field, required: !field.required })}
                >
                  <i />
                </button>
              </label>
            ) : null}
            {selected && showDisable ? (
              <label className="fb-mini-toggle">
                Disable
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!field.disabled}
                  className={`fps-switch sm ${field.disabled ? 'is-on' : ''}`}
                  onClick={() => onChange({ ...field, disabled: !field.disabled })}
                >
                  <i />
                </button>
              </label>
            ) : null}
            {selected && showDependant ? (
              <button type="button" className="fb-icon-btn" aria-label="Link field" title="Link">
                <Link2 size={15} />
              </button>
            ) : null}
            <button type="button" className="fb-icon-btn" aria-label={`Delete ${field.label}`} onClick={onRemove}>
              <Trash2 size={15} />
            </button>
            {selected && !mediaLike ? (
              <button type="button" className="fb-icon-btn" aria-label="More" title="More">
                <MoreVertical size={15} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
