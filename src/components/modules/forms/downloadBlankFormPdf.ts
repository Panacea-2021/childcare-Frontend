import type { CanvasField } from './builderFieldData';
import type { FormStyleSettings } from './FormStylesSidebar';

function safeFileName(name: string) {
  return name.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'blank-form';
}

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return [93, 95, 239];
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

/** Download a blank printable PDF — form fields only, no app chrome. */
export async function downloadBlankFormPdf(opts: {
  title: string;
  fields: CanvasField[];
  styles?: FormStyleSettings;
  fileName?: string;
}) {
  const { jsPDF } = await import('jspdf');
  const styles = opts.styles;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const accent = hexToRgb(styles?.sectionColor ?? '#5D5FEF');
  const labelRgb = hexToRgb(styles?.labelColor ?? '#333333');
  const borderRgb = hexToRgb(styles?.fieldBorderColor ?? '#D9D9D9');

  const newPageIfNeeded = (need = 48) => {
    if (y + need > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Brand header
  if (styles?.showSchoolLogo !== false) {
    doc.setDrawColor(accent[0], accent[1], accent[2]);
    doc.setLineWidth(1.5);
    doc.line(margin + 20, y + 4, margin + 36, y + 20);
    doc.line(margin + 36, y + 20, margin + 28, y + 36);
    doc.line(margin + 28, y + 36, margin + 12, y + 36);
    doc.line(margin + 12, y + 36, margin + 20, y + 4);
  }
  if (styles?.showSchoolName !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text('Panacea | Childcare', margin + (styles?.showSchoolLogo !== false ? 48 : 0), y + 22);
  }
  y += 44;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(opts.title, margin, y);
  y += 28;

  const drawFieldBox = (height = 32) => {
    doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
    doc.setLineWidth(0.75);
    doc.roundedRect(margin, y, contentW, height, styles?.fieldBorderRadius ?? 4, styles?.fieldBorderRadius ?? 4, 'S');
    y += height + 14;
  };

  const drawLabel = (text: string, size = styles?.labelFontSize ?? 11) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(Math.min(size, 14));
    doc.setTextColor(labelRgb[0], labelRgb[1], labelRgb[2]);
    doc.text(text, margin, y);
    y += 16;
  };

  for (const field of opts.fields) {
    if (field.kind === 'pagebreak') {
      doc.addPage();
      y = margin;
      continue;
    }

    if (field.kind === 'section') {
      newPageIfNeeded(36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(styles?.sectionFontSize ?? 14);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(field.label, margin, y);
      y += 22;
      continue;
    }

    if (field.kind === 'instruction') {
      newPageIfNeeded(24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const lines = doc.splitTextToSize(field.label, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 12 + 8;
      continue;
    }

    newPageIfNeeded(70);
    drawLabel(field.label);

    if (field.kind === 'radio' || field.kind === 'consent' || field.kind === 'checkbox') {
      const options =
        field.options ??
        (field.kind === 'consent'
          ? ['I accept', "I don't accept"]
          : field.kind === 'checkbox'
            ? ['Option A', 'Option B']
            : ['Option 1', 'Option 2']);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      for (const opt of options) {
        newPageIfNeeded(18);
        const isRadio = field.kind === 'radio' || field.kind === 'consent';
        if (isRadio) {
          doc.circle(margin + 6, y - 3, 5, 'S');
        } else {
          doc.rect(margin + 1, y - 8, 10, 10, 'S');
        }
        doc.text(opt, margin + 18, y);
        y += 18;
      }
      y += 6;
      continue;
    }

    if (field.kind === 'dropdown') {
      drawFieldBox(32);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Select…', margin + 10, y - 22);
      continue;
    }

    if (field.kind === 'signature' || field.kind === 'upload' || field.kind === 'attachment') {
      newPageIfNeeded(56);
      doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
      doc.roundedRect(margin, y, contentW, 48, 6, 6, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(
        field.kind === 'signature' ? 'Sign here' : 'Attach files here',
        margin + 10,
        y + 28,
      );
      y += 62;
      continue;
    }

    if (field.kind === 'table') {
      const cols = field.columns?.length ? field.columns : ['Column 1'];
      const colW = contentW / cols.length;
      doc.setFillColor(248, 250, 252);
      cols.forEach((col, i) => {
        doc.rect(margin + i * colW, y, colW, 24, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(col, margin + i * colW + 6, y + 15);
      });
      y += 24;
      const rows = Math.min(field.maxRows ?? 3, 4);
      for (let r = 0; r < rows; r += 1) {
        cols.forEach((_, i) => {
          doc.rect(margin + i * colW, y, colW, 22, 'S');
        });
        y += 22;
      }
      y += 8;
      continue;
    }

    if (field.kind === 'rating' || field.kind === 'emoji') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(field.kind === 'emoji' ? '☐ Unsatisfied  ☐ Bad  ☐ Neutral  ☐ Good  ☐ Satisfied' : '☆ ☆ ☆ ☆ ☆', margin, y);
      y += 24;
      continue;
    }

    if (field.kind === 'fee') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Payment: ${(field.paymentMode ?? 'offline').replace(/^\w/, (c) => c.toUpperCase())} · ${field.feeLabel ?? 'Fee'}`,
        margin,
        y,
      );
      y += 20;
      continue;
    }

    drawFieldBox(32);
  }

  const base = opts.fileName ?? safeFileName(opts.title);
  doc.save(`${base}-blank.pdf`);
}
