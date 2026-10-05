import { DEFAULT_SCHOOL_BRANDING, type SchoolBranding } from './branding';
import type { FormField } from './types';

function safeName(title: string) {
  return title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'form';
}

/** Client-side official PDF download matching the paper form layout. */
export async function exportOfficialPdf(opts: {
  title: string;
  description?: string;
  fields: FormField[];
  branding?: SchoolBranding;
  fileName?: string;
}) {
  const { jsPDF } = await import('jspdf');
  const branding = opts.branding ?? DEFAULT_SCHOOL_BRANDING;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const newPageIfNeeded = (need = 40) => {
    if (y + need > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Logo circle
  doc.setFillColor(93, 95, 239);
  doc.circle(margin + 22, y + 22, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('P', margin + 22, y + 27, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(branding.affiliation.toUpperCase(), margin + 56, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(branding.schoolName, margin + 56, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(branding.tagline, margin + 56, y + 40);
  doc.text(`${branding.address}`, margin + 56, y + 52);
  doc.text(`Tel: ${branding.phone}  |  ${branding.email}`, margin + 56, y + 64);
  y += 82;

  doc.setDrawColor(93, 95, 239);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageW - margin, y);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 3, pageW - margin, y + 3);
  y += 22;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(opts.title.toUpperCase(), pageW / 2, y, { align: 'center' });
  y += 14;
  if (opts.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(opts.description, pageW - margin * 2);
    doc.text(lines, pageW / 2, y, { align: 'center' });
    y += lines.length * 11 + 4;
  }

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Academic Year: ${branding.academicYear}`, margin, y);
  doc.text('Form No.: PEL/STU/______', pageW / 2, y, { align: 'center' });
  doc.text('Date: ____________', pageW - margin, y, { align: 'right' });
  y += 16;

  opts.fields.forEach((f) => {
    if (f.type === 'hidden' || f.type === 'spacer' || f.type === 'progress' || f.type === 'multi-step' || f.type === 'columns') return;

    if (f.type === 'heading') {
      newPageIfNeeded(28);
      y += 6;
      doc.setFillColor(222, 236, 255);
      doc.rect(margin, y - 10, pageW - margin * 2, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(f.label, margin + 6, y + 2);
      y += 18;
      return;
    }

    if (f.type === 'paragraph') {
      newPageIfNeeded(36);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(f.label, pageW - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 11 + 6;
      return;
    }

    if (f.type === 'divider') {
      newPageIfNeeded(12);
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageW - margin, y);
      y += 10;
      return;
    }

    if (f.type === 'terms') {
      newPageIfNeeded(24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`☐  ${f.label}${f.required ? ' *' : ''}`, margin, y);
      y += 16;
      return;
    }

    if (f.type === 'signature') {
      newPageIfNeeded(40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${f.label}${f.required ? ' *' : ''}:`, margin, y);
      y += 8;
      doc.setDrawColor(148, 163, 184);
      doc.rect(margin, y, 180, 28);
      y += 40;
      return;
    }

    if (f.type === 'radio' || f.type === 'checkbox') {
      newPageIfNeeded(28);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${f.label}${f.required ? ' *' : ''}:`, margin, y);
      y += 12;
      const optsText = (f.options ?? []).map((o) => `☐ ${o}`).join('    ');
      const lines = doc.splitTextToSize(optsText, pageW - margin * 2);
      doc.text(lines, margin + 8, y);
      y += lines.length * 11 + 8;
      return;
    }

    if (f.type === 'textarea' || f.type === 'address') {
      newPageIfNeeded(48);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${f.label}${f.required ? ' *' : ''}:`, margin, y);
      y += 10;
      doc.setDrawColor(148, 163, 184);
      for (let i = 0; i < 3; i++) {
        doc.line(margin, y, pageW - margin, y);
        y += 12;
      }
      y += 6;
      return;
    }

    newPageIfNeeded(22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const label = `${f.label}${f.required ? ' *' : ''}: `;
    doc.text(label, margin, y);
    const labelW = doc.getTextWidth(label);
    doc.setDrawColor(148, 163, 184);
    doc.line(margin + labelW, y + 1, pageW - margin, y + 1);
    y += 16;
  });

  newPageIfNeeded(70);
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageW - margin, y);
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('For Office Use Only', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 14;
  doc.text('Application received on: _______________', margin, y);
  y += 12;
  doc.text('Admission status: ☐ Accepted   ☐ Waitlist   ☐ Denied', margin, y);
  y += 12;
  doc.text('Verified by: _______________   Sign: ________', margin, y);
  doc.setDrawColor(148, 163, 184);
  doc.rect(pageW - margin - 70, y - 40, 70, 50);
  doc.setFontSize(7);
  doc.text('School Seal', pageW - margin - 35, y - 12, { align: 'center' });

  y = pageH - 28;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Official document of ${branding.schoolName}. Fields marked * are mandatory.`,
    pageW / 2,
    y,
    { align: 'center' },
  );

  doc.save(`${opts.fileName ?? safeName(opts.title)}.pdf`);
}
