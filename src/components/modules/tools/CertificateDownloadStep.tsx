'use client';

import { Download } from 'lucide-react';
import { CertificatePreview } from './CertificatePreview';
import type { CertificateStyleState } from './certificateStyles';
import type { CertificateTemplate, MockStudent } from './toolsData';

type Props = {
  template: CertificateTemplate;
  styles: CertificateStyleState;
  students: MockStudent[];
  onPrevious: () => void;
  onDownloadOne: (student: MockStudent) => void;
  onDownloadAll: () => void;
};

export function CertificateDownloadStep({
  template,
  styles,
  students,
  onPrevious,
  onDownloadOne,
  onDownloadAll,
}: Props) {
  const list = students.length ? students : [];

  return (
    <section className="tools-section cert-download-step">
      <div className="cert-download-header">
        <div>
          <h2>Certificate Preview</h2>
          <p>
            {list.length
              ? `${list.length} certificate${list.length === 1 ? '' : 's'} ready to download`
              : 'Select students to preview certificates'}
          </p>
        </div>
        <div className="cert-download-actions-top">
          <button type="button" className="ui-btn ui-btn-outline cert-nav-btn" onClick={onPrevious}>
            « Previous
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary cert-nav-btn"
            disabled={!list.length}
            onClick={onDownloadAll}
          >
            <Download size={15} />
            Download All
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="cert-download-empty">
          <p>No students selected.</p>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onPrevious}>
            Go back to Select Student
          </button>
        </div>
      ) : (
        <div className="cert-download-grid">
          {list.map((s) => (
            <article key={s.id} className="cert-download-card">
              <CertificatePreview
                template={template}
                styles={styles}
                studentName={s.name}
                size="lg"
              />
              <div className="cert-download-card-foot">
                <div className="cert-download-card-meta">
                  <strong>{s.name}</strong>
                  <span>
                    {s.room}
                    {s.admissionNo ? ` · ${s.admissionNo}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="ui-btn ui-btn-outline cert-nav-btn"
                  onClick={() => onDownloadOne(s)}
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
