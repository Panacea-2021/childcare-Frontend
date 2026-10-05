'use client';

export function ParentInvoiceSkeleton() {
  return (
    <div className="pi-skeleton-wrap" aria-busy="true" aria-label="Loading invoices">
      <div className="pi-summary pi-summary--skeleton">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`sum-${i}`} className="pi-summary-card pi-skel-block" />
        ))}
      </div>
      <div className="pi-toolbar pi-toolbar--skeleton">
        <div className="pi-skel-line pi-skel-search" />
        <div className="pi-skel-line pi-skel-select" />
        <div className="pi-skel-line pi-skel-select" />
      </div>
      <div className="pi-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`card-${i}`} className="pi-card pi-card--skeleton">
            <div className="pi-skel-row">
              <div className="pi-skel-line pi-skel-id" />
              <div className="pi-skel-line pi-skel-view" />
            </div>
            <div className="pi-skel-row">
              <div className="pi-skel-line pi-skel-title" />
              <div className="pi-skel-line pi-skel-amount" />
            </div>
            <div className="pi-skel-row">
              <div className="pi-skel-line pi-skel-meta" />
              <div className="pi-skel-line pi-skel-meta" />
            </div>
            <div className="pi-skel-line pi-skel-btn" />
          </div>
        ))}
      </div>
    </div>
  );
}
