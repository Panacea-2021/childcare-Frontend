import { DEFAULT_SCHOOL_BRANDING, type SchoolBranding } from './branding';
import type { FormField } from './types';

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fieldHtml(field: FormField): string {
  if (field.type === 'hidden' || field.type === 'spacer' || field.type === 'progress' || field.type === 'multi-step' || field.type === 'columns') {
    return '';
  }
  if (field.type === 'heading') {
    return `<h3 class="ofd-section-title">${escapeHtml(field.label)}</h3>`;
  }
  if (field.type === 'paragraph') {
    return `<p class="ofd-paragraph">${escapeHtml(field.label)}</p>`;
  }
  if (field.type === 'divider') {
    return `<hr class="ofd-divider" />`;
  }
  if (field.type === 'terms') {
    return `<div class="ofd-field ofd-w-full"><label class="ofd-check ofd-terms"><span class="box"></span><span>${escapeHtml(field.label)}${field.required ? ' *' : ''}</span></label></div>`;
  }

  const w = field.width === 'half' ? 'half' : field.width === 'third' ? 'third' : 'full';
  const req = field.required ? '<em>*</em>' : '';
  let fill = '';

  if (field.type === 'textarea' || field.type === 'address') {
    fill = `<div class="ofd-lines"><span class="ofd-line"></span><span class="ofd-line"></span><span class="ofd-line short"></span></div>`;
  } else if (field.type === 'radio' || field.type === 'checkbox') {
    fill = `<div class="ofd-checks">${(field.options ?? []).map((o) => `<span class="ofd-check"><span class="box"></span>${escapeHtml(o)}</span>`).join('')}</div>`;
  } else if (field.type === 'signature') {
    fill = `<div class="ofd-sign"></div>`;
  } else if (field.type === 'upload' || field.type === 'image-upload') {
    fill = `<div class="ofd-upload">[ Attach / paste documents here ]</div>`;
  } else if (field.type === 'rating') {
    fill = `<div class="ofd-rating">★ ★ ★ ★ ★ &nbsp; (circle one)</div>`;
  } else if (field.type === 'dropdown' || field.type === 'country' || field.type === 'state' || field.type === 'city') {
    const opts = (field.options ?? []).slice(0, 4).join(' / ') || '________________';
    fill = `<span class="ofd-dropdown-line">${escapeHtml(opts)}</span>`;
  } else {
    fill = `<span class="ofd-line"></span>`;
  }

  return `<div class="ofd-field ofd-w-${w}"><div class="ofd-label-row"><span class="ofd-label">${escapeHtml(field.label)}${req}</span><div class="ofd-fill">${fill}</div></div></div>`;
}

const PRINT_CSS = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Poppins, 'Segoe UI', sans-serif;
    color: #0f172a;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .ofd-sheet {
    background: #fff;
    width: 100%;
    max-width: 780px;
    margin: 0 auto;
    padding: 22px 26px 18px;
    border: 1px solid #cbd5e1;
    position: relative;
  }
  .ofd-sheet::before {
    content: '';
    position: absolute;
    inset: 8px;
    border: 1px solid #e2e8f0;
    pointer-events: none;
  }
  .ofd-header { display: flex; gap: 14px; align-items: center; position: relative; z-index: 1; }
  .ofd-logo {
    width: 64px; height: 64px; border-radius: 50%;
    background: #5D5FEF; color: #fff; display: grid; place-items: center;
    font-weight: 800; font-size: 22px; flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.85); box-shadow: inset 0 0 0 3px #5D5FEF;
  }
  .ofd-school { flex: 1; text-align: center; padding-right: 64px; }
  .ofd-affiliation { margin: 0; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b; font-weight: 600; }
  .ofd-school-name { margin: 4px 0 2px; font-size: 20px; font-weight: 750; color: #1e1b4b; }
  .ofd-tagline { margin: 0; font-size: 11px; color: #5D5FEF; font-weight: 600; }
  .ofd-contact { margin: 6px 0 0; font-size: 10px; color: #475569; line-height: 1.45; }
  .ofd-double-rule { margin: 12px 0 10px; border-top: 2px solid #5D5FEF; border-bottom: 1px solid #5D5FEF; height: 5px; position: relative; z-index: 1; }
  .ofd-title-block { text-align: center; margin-bottom: 12px; position: relative; z-index: 1; }
  .ofd-form-title { margin: 0; font-size: 15px; font-weight: 750; letter-spacing: 0.06em; text-transform: uppercase; }
  .ofd-form-desc { margin: 6px 0 0; font-size: 11px; color: #64748b; }
  .ofd-meta-row {
    display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px;
    margin-top: 10px; padding: 7px 9px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 10px; color: #475569;
  }
  .ofd-body { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px 14px; }
  .ofd-section-title {
    width: 100%; margin: 10px 0 4px; padding: 6px 9px; background: #deecff;
    border-left: 3px solid #5D5FEF; font-size: 12px; font-weight: 700;
  }
  .ofd-paragraph { width: 100%; margin: 4px 0 8px; font-size: 11px; line-height: 1.5; color: #334155; font-style: italic; }
  .ofd-divider { width: 100%; border: 0; border-top: 1px dashed #cbd5e1; margin: 8px 0; }
  .ofd-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .ofd-w-full { width: 100%; flex: 0 0 100%; }
  .ofd-w-half { width: calc(50% - 7px); flex: 0 0 calc(50% - 7px); }
  .ofd-w-third { width: calc(33.333% - 10px); flex: 0 0 calc(33.333% - 10px); }
  .ofd-label { font-size: 11px; font-weight: 650; color: #1e293b; }
  .ofd-label em { color: #e53935; font-style: normal; }
  .ofd-line { display: block; border-bottom: 1px solid #94a3b8; min-height: 20px; width: 100%; }
  .ofd-line.short { width: 70%; }
  .ofd-lines { display: flex; flex-direction: column; gap: 9px; }
  .ofd-checks { display: flex; flex-wrap: wrap; gap: 8px 14px; padding-top: 2px; }
  .ofd-check { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #334155; }
  .ofd-check .box { width: 12px; height: 12px; border: 1px solid #64748b; display: inline-block; flex-shrink: 0; }
  .ofd-terms { width: 100%; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; }
  .ofd-sign { height: 44px; border: 1px solid #94a3b8; }
  .ofd-upload { border: 1px dashed #94a3b8; padding: 10px; text-align: center; font-size: 10px; color: #64748b; }
  .ofd-rating { font-size: 13px; letter-spacing: 2px; color: #475569; }
  .ofd-dropdown-line { display: block; border-bottom: 1px solid #94a3b8; min-height: 20px; font-size: 11px; color: #64748b; }
  .ofd-footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #cbd5e1; position: relative; z-index: 1; }
  .ofd-footer-grid { display: grid; grid-template-columns: 1fr 90px; gap: 16px; }
  .ofd-footer-label { margin: 0 0 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .ofd-office-line { margin: 0 0 6px; font-size: 10px; color: #475569; }
  .ofd-stamp {
    height: 90px; border: 1.5px dashed #94a3b8; border-radius: 50%;
    display: grid; place-items: center; font-size: 9px; color: #94a3b8; text-transform: uppercase;
  }
  .ofd-footnote { margin: 12px 0 0; font-size: 9px; color: #64748b; text-align: center; line-height: 1.4; }
  .no-print { margin: 16px auto; text-align: center; max-width: 780px; }
  .no-print button {
    font: inherit; font-weight: 600; padding: 10px 18px; border-radius: 10px; border: none;
    background: #5D5FEF; color: #fff; cursor: pointer; margin: 0 6px;
  }
  .no-print button.secondary { background: #fff; color: #5D5FEF; border: 1px solid #5D5FEF; }
  @media print {
    .no-print { display: none !important; }
    .ofd-sheet { border: none; max-width: none; }
    .ofd-sheet::before { display: none; }
  }
`;

/** Opens the exact on-screen official form HTML and triggers Save as PDF / Print. */
export function printOfficialForm(opts: {
  title: string;
  description?: string;
  fields: FormField[];
  branding?: SchoolBranding;
}) {
  const branding = opts.branding ?? DEFAULT_SCHOOL_BRANDING;
  const fieldsMarkup = opts.fields.map(fieldHtml).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(opts.title)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <div class="no-print">
    <p>This matches the official form preview. Use <strong>Save as PDF</strong> in the print dialog.</p>
    <button type="button" onclick="window.print()">Download / Print PDF</button>
    <button type="button" class="secondary" onclick="window.close()">Close</button>
  </div>
  <article class="ofd-sheet">
    <header class="ofd-header">
      <div class="ofd-logo">P</div>
      <div class="ofd-school">
        <p class="ofd-affiliation">${escapeHtml(branding.affiliation)}</p>
        <h1 class="ofd-school-name">${escapeHtml(branding.schoolName)}</h1>
        <p class="ofd-tagline">${escapeHtml(branding.tagline)}</p>
        <p class="ofd-contact">
          ${escapeHtml(branding.address)}<br/>
          Tel: ${escapeHtml(branding.phone)} · ${escapeHtml(branding.email)} · ${escapeHtml(branding.website)}
        </p>
      </div>
    </header>
    <div class="ofd-double-rule"></div>
    <div class="ofd-title-block">
      <h2 class="ofd-form-title">${escapeHtml(opts.title)}</h2>
      ${opts.description ? `<p class="ofd-form-desc">${escapeHtml(opts.description)}</p>` : ''}
      <div class="ofd-meta-row">
        <span>Academic Year: <strong>${escapeHtml(branding.academicYear)}</strong></span>
        <span>Form No.: <strong>PEL/STU/______</strong></span>
        <span>Date: <strong>____________</strong></span>
      </div>
    </div>
    <div class="ofd-body">${fieldsMarkup}</div>
    <footer class="ofd-footer">
      <div class="ofd-footer-grid">
        <div>
          <p class="ofd-footer-label">For Office Use Only</p>
          <p class="ofd-office-line">Application received on: _______________</p>
          <p class="ofd-office-line">Admission status: ☐ Accepted &nbsp; ☐ Waitlist &nbsp; ☐ Denied</p>
          <p class="ofd-office-line">Verified by: _______________ &nbsp; Sign: ________</p>
        </div>
        <div class="ofd-stamp">School Seal</div>
      </div>
      <p class="ofd-footnote">This is an official document of ${escapeHtml(branding.schoolName)}. Fields marked * are mandatory.</p>
    </footer>
  </article>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    });
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'noopener,noreferrer,width=920,height=1100');
  if (!win) {
    // popup blocked — fallback: open blob URL
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
