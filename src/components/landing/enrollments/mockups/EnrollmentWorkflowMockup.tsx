'use client';

import { useEffect, useState } from 'react';
import { GripVertical, Check } from 'lucide-react';

const TABS = ['Profile', 'Process Steps', 'Documents', 'Forms', 'Timelines'] as const;

export function EnrollmentWorkflowMockup() {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setDone((d) => (d + 1) % 4), 1400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="en-mock en-workflow">
      <div className="en-mockHeader">
        <strong>Admission Process</strong>
      </div>
      <div className="en-familyBody compact">
        <div className="en-avatar" aria-hidden="true">
          JA
        </div>
        <div>
          <h4>Jacob Anderson</h4>
          <span className="en-pill en-pill-mint">Active</span>
        </div>
      </div>
      <div className="en-wfTabs" role="tablist" aria-label="Admission sections">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={tab === 'Process Steps'}
            className={tab === 'Process Steps' ? 'is-active' : undefined}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="en-wfSection">
        <span className="en-wfLabel blue">Enrollment Forms</span>
        <div className={`en-wfItem${done >= 1 ? ' is-done' : ''}`}>
          <GripVertical size={14} /> Student Registration Form {done >= 1 ? <Check size={14} /> : null}
        </div>
        <div className={`en-wfItem${done >= 2 ? ' is-done' : ''}`}>
          <GripVertical size={14} /> Health & Medical Consent Form {done >= 2 ? <Check size={14} /> : null}
        </div>
      </div>
      <div className="en-wfSection">
        <span className="en-wfLabel pink">Required Documents</span>
        <div className={`en-wfItem${done >= 3 ? ' is-done' : ''}`}>
          <GripVertical size={14} /> Child&apos;s Birth Certificate {done >= 3 ? <Check size={14} /> : null}
        </div>
      </div>
    </div>
  );
}
