/** Opens a clean print window containing only the form sheet (no app shell). */

const PRINT_STYLES = `
  @page { margin: 14mm; size: auto; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #111827;
    font-family: Poppins, "Segoe UI", sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { padding: 8px 12px 16px; }
  .fb-preview-sheet, .fps-live-sheet {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 8px 4px !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    background: #fff !important;
  }
  .fps-blank-ribbon,
  .fb-preview-banner,
  .fb-preview-actions,
  .fb-preview-actions-row,
  .fps-sheet-meta {
    display: none !important;
  }
  .fps-sheet-head h1 {
    margin: 0 0 16px;
    font-size: 22px;
    font-weight: 700;
  }
  .fb-preview-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .fb-preview-brand p {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }
  .fb-preview-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .fb-preview-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .fb-preview-field > label {
    font-weight: 600;
  }
  .fb-preview-field input,
  .fb-preview-field select {
    width: 100%;
    min-height: 40px;
    padding: 8px 10px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    font: inherit;
  }
  .fb-preview-opts {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .fb-opt {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .fb-preview-section {
    margin: 8px 0 4px;
    font-weight: 700;
  }
  .fb-preview-break {
    text-align: center;
    color: #94a3b8;
    margin: 12px 0;
  }
  .fb-preview-help {
    margin: 0;
    color: #64748b;
    font-size: 13px;
  }
  .fb-preview-sign,
  .fb-preview-upload,
  .fb-preview-table {
    min-height: 56px;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    padding: 12px;
    color: #64748b;
  }
  .fb-preview-rating { letter-spacing: 0.04em; }
`;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printFormSheetOnly(sheetEl: HTMLElement | null, documentTitle: string) {
  if (!sheetEl || typeof window === 'undefined') return false;

  const clone = sheetEl.cloneNode(true) as HTMLElement;
  // Strip interactive chrome from the blank sheet
  clone
    .querySelectorAll(
      '.fps-blank-ribbon, .fb-preview-banner, .fb-preview-actions, .fb-preview-actions-row, .fps-sheet-meta',
    )
    .forEach((node) => node.remove());

  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');
  if (!win) return false;

  const title = escapeHtml(documentTitle || 'Blank Form');
  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`);
  win.document.close();

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* ignore */
    }
  };

  // Wait for layout/fonts before printing
  if (win.document.readyState === 'complete') {
    window.setTimeout(triggerPrint, 200);
  } else {
    win.addEventListener('load', () => window.setTimeout(triggerPrint, 200), { once: true });
  }

  return true;
}
