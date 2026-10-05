'use client';

import { AUDIENCE_OPTIONS, type AudienceFilters } from './types';
import { audienceLabel, estimateRecipients } from './mockData';

type Props = {
  value: AudienceFilters;
  onChange: (next: AudienceFilters) => void;
  onViewRecipients: () => void;
};

export function AudienceSelector({ value, onChange, onViewRecipients }: Props) {
  const count = estimateRecipients(value);
  const set = <K extends keyof AudienceFilters>(key: K, v: AudienceFilters[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div>
      <div className="ui-grid-2">
        <div className="ui-field">
          <label className="ui-label">To</label>
          <select
            className="ui-select"
            value={value.audienceType}
            onChange={(e) =>
              set('audienceType', e.target.value as AudienceFilters['audienceType'])
            }
          >
            <option value="">Select Audience</option>
            {AUDIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ui-field">
          <label className="ui-label">Class</label>
          <select
            className="ui-select"
            value={value.className}
            onChange={(e) => set('className', e.target.value)}
          >
            <option value="">All classes</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
          </select>
        </div>
        <div className="ui-field">
          <label className="ui-label">Section</label>
          <select
            className="ui-select"
            value={value.section}
            onChange={(e) => set('section', e.target.value)}
          >
            <option value="">All sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div className="ui-field">
          <label className="ui-label">Campus</label>
          <select
            className="ui-select"
            value={value.campus}
            onChange={(e) => set('campus', e.target.value)}
          >
            <option value="">All campuses</option>
            <option value="Main Campus">Main Campus</option>
            <option value="East Wing">East Wing</option>
          </select>
        </div>
        <div className="ui-field">
          <label className="ui-label">Admission Status</label>
          <select
            className="ui-select"
            value={value.admissionStatus}
            onChange={(e) => set('admissionStatus', e.target.value)}
          >
            <option value="">Any</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>
      {value.audienceType ? (
        <div className="ec-recipient-count">
          <span>
            {count.toLocaleString()} recipients selected
            <span className="ec-muted" style={{ marginLeft: 8, fontWeight: 400 }}>
              ({audienceLabel(value)})
            </span>
          </span>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onViewRecipients}>
            View Recipients
          </button>
        </div>
      ) : null}
    </div>
  );
}
