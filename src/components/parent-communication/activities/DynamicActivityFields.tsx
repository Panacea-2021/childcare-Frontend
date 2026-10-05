'use client';

import { motion } from 'framer-motion';
import type { ActivityCustomField } from '@/types/activityDefinition';
import { parseFieldValues } from '@/types/activityDefinition';

type Props = {
  fields: ActivityCustomField[];
  values: Record<string, string | string[] | boolean>;
  onChange: (fieldId: string, value: string | string[] | boolean) => void;
};

export function DynamicActivityFields({ fields, values, onChange }: Props) {
  if (!fields.length) return null;

  return (
    <motion.div
      className="pap-form-card pap-dynamic-fields"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="pap-eyebrow">Activity fields</span>
      <h3>Details for this activity</h3>
      <div className="pap-dynamic-grid">
        {fields.map((field, i) => {
          const label = (
            <>
              {field.name}
              {field.mandatory ? <em className="pap-req">*</em> : null}
            </>
          );
          const val = values[field.id];

          return (
            <motion.div
              key={field.id}
              className="ui-field pap-dynamic-field"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.28) }}
            >
              <label className="ui-label" htmlFor={`dyn-${field.id}`}>
                {label}
              </label>

              {field.type === 'Text' ? (
                <input
                  id={`dyn-${field.id}`}
                  className="ui-input"
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.name}
                />
              ) : null}

              {field.type === 'Number' ? (
                <input
                  id={`dyn-${field.id}`}
                  type="number"
                  className="ui-input"
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder="0"
                />
              ) : null}

              {field.type === 'Date' ? (
                <input
                  id={`dyn-${field.id}`}
                  type="date"
                  className="ui-input"
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                />
              ) : null}

              {field.type === 'Time' ? (
                <input
                  id={`dyn-${field.id}`}
                  type="time"
                  className="ui-input"
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                />
              ) : null}

              {field.type === 'Yes/No' ? (
                <label className={`pap-yn${val === true ? ' is-on' : ''}`}>
                  <input
                    id={`dyn-${field.id}`}
                    type="checkbox"
                    checked={val === true}
                    onChange={(e) => onChange(field.id, e.target.checked)}
                  />
                  <span>{val === true ? 'Yes' : 'No'}</span>
                </label>
              ) : null}

              {field.type === 'Dropdown' ? (
                <select
                  id={`dyn-${field.id}`}
                  className="ui-select"
                  value={typeof val === 'string' ? val : ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                >
                  <option value="">Select…</option>
                  {parseFieldValues(field.values).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : null}

              {field.type === 'Multi Select' ? (
                <div className="pap-multi-options">
                  {parseFieldValues(field.values).map((opt) => {
                    const selected = Array.isArray(val) && val.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`pap-multi-chip${selected ? ' is-on' : ''}`}
                        onClick={() => {
                          const prev = Array.isArray(val) ? val : [];
                          onChange(
                            field.id,
                            selected ? prev.filter((x) => x !== opt) : [...prev, opt],
                          );
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
