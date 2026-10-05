import { loadFormBuilderSchema } from '../formBuilderSchemaStore';
import type { CanvasField } from '../builderFieldData';
import type { FormStyleSettings } from '../FormStylesSidebar';
import type { AdmissionProcess } from './types';

function safeFileName(name: string) {
  return name.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'admission';
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

type PdfCtx = {
  doc: import('jspdf').jsPDF;
  pageW: number;
  pageH: number;
  margin: number;
  contentW: number;
  y: number;
  accent: [number, number, number];
  labelRgb: [number, number, number];
  borderRgb: [number, number, number];
  styles?: FormStyleSettings;
};

function newPageIfNeeded(ctx: PdfCtx, need = 48) {
  if (ctx.y + need > ctx.pageH - ctx.margin) {
    ctx.doc.addPage();
    ctx.y = ctx.margin;
  }
}

function drawCover(ctx: PdfCtx, process: AdmissionProcess) {
  const { doc, pageW, margin, contentW, accent } = ctx;
  const formCount = process.steps.reduce((n, s) => n + s.forms.length, 0);

  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(margin, ctx.y, contentW, 120, 14, 14, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('Panacea | Childcare', margin + 22, ctx.y + 28);

  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(process.name, contentW - 44);
  doc.text(titleLines, margin + 22, ctx.y + 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const meta = [
    process.status,
    process.dueDate ? `Due ${process.dueDate}` : null,
    `${process.steps.length} step${process.steps.length === 1 ? '' : 's'}`,
    `${formCount} form${formCount === 1 ? '' : 's'}`,
  ]
    .filter(Boolean)
    .join(' · ');
  doc.text(meta, margin + 22, ctx.y + 56 + titleLines.length * 18 + 8);

  ctx.y += 140;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const intro = doc.splitTextToSize(
    'Blank admission packet for offline completion. Complete each step’s forms in order, then return the packet to the center.',
    contentW,
  );
  doc.text(intro, margin, ctx.y);
  ctx.y += intro.length * 13 + 18;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(margin, ctx.y, pageW - margin, ctx.y);
  ctx.y += 22;
}

function drawLabel(ctx: PdfCtx, text: string) {
  const { doc, margin, labelRgb, styles } = ctx;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(Math.min(styles?.labelFontSize ?? 11, 13));
  doc.setTextColor(labelRgb[0], labelRgb[1], labelRgb[2]);
  doc.text(text, margin, ctx.y);
  ctx.y += 15;
}

function drawFieldBox(ctx: PdfCtx, height = 32, placeholder?: string) {
  const { doc, margin, contentW, borderRgb, styles } = ctx;
  const radius = styles?.fieldBorderRadius ?? 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
  doc.setLineWidth(0.7);
  doc.roundedRect(margin, ctx.y, contentW, height, radius, radius, 'FD');
  if (placeholder) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(placeholder, margin + 10, ctx.y + height / 2 + 3);
  }
  ctx.y += height + 12;
}

function drawFields(ctx: PdfCtx, fields: CanvasField[]) {
  const { doc, margin, contentW, accent, borderRgb } = ctx;

  for (const field of fields) {
    if (field.kind === 'pagebreak') {
      doc.addPage();
      ctx.y = ctx.margin;
      continue;
    }

    if (field.kind === 'section') {
      newPageIfNeeded(ctx, 36);
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.roundedRect(margin, ctx.y, 4, 16, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(ctx.styles?.sectionFontSize ?? 13);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(field.label, margin + 12, ctx.y + 12);
      ctx.y += 26;
      continue;
    }

    if (field.kind === 'instruction') {
      newPageIfNeeded(ctx, 28);
      doc.setFillColor(232, 242, 255);
      doc.roundedRect(margin, ctx.y, contentW, 26, 8, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(field.label, contentW - 24);
      doc.text(lines, margin + 12, ctx.y + 16);
      ctx.y += 26 + Math.max(0, lines.length - 1) * 10 + 8;
      continue;
    }

    newPageIfNeeded(ctx, 70);
    drawLabel(ctx, field.label);

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
        newPageIfNeeded(ctx, 18);
        const isRadio = field.kind === 'radio' || field.kind === 'consent';
        doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
        if (isRadio) doc.circle(margin + 6, ctx.y - 3, 5, 'S');
        else doc.rect(margin + 1, ctx.y - 8, 10, 10, 'S');
        doc.text(opt, margin + 18, ctx.y);
        ctx.y += 18;
      }
      ctx.y += 6;
      continue;
    }

    if (field.kind === 'dropdown') {
      drawFieldBox(ctx, 32, 'Select…');
      continue;
    }

    if (field.kind === 'signature' || field.kind === 'upload' || field.kind === 'attachment') {
      newPageIfNeeded(ctx, 56);
      drawFieldBox(
        ctx,
        48,
        field.kind === 'signature' ? 'Sign here' : 'Attach files here',
      );
      continue;
    }

    if (field.kind === 'table') {
      const cols = field.columns?.length ? field.columns : ['Column 1'];
      const colW = contentW / cols.length;
      cols.forEach((col, i) => {
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.rect(margin + i * colW, ctx.y, colW, 22, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(col, margin + i * colW + 6, ctx.y + 14);
      });
      ctx.y += 22;
      const rows = Math.min(field.maxRows ?? 3, 4);
      for (let r = 0; r < rows; r += 1) {
        cols.forEach((_, i) => {
          doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
          doc.rect(margin + i * colW, ctx.y, colW, 20, 'S');
        });
        ctx.y += 20;
      }
      ctx.y += 10;
      continue;
    }

    if (field.kind === 'rating' || field.kind === 'emoji') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text(
        field.kind === 'emoji' ? '😞  😕  😐  🙂  😄' : '☆  ☆  ☆  ☆  ☆',
        margin,
        ctx.y,
      );
      ctx.y += 22;
      continue;
    }

    if (field.kind === 'fee') {
      doc.setFillColor(254, 249, 195);
      doc.roundedRect(margin, ctx.y, contentW, 28, 8, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 90, 10);
      doc.text(
        `Payment: ${(field.paymentMode ?? 'offline').replace(/^\w/, (c) => c.toUpperCase())} · ${field.feeLabel ?? 'Fee'}`,
        margin + 12,
        ctx.y + 17,
      );
      ctx.y += 38;
      continue;
    }

    const placeholder =
      field.kind === 'date'
        ? 'dd-mm-yyyy'
        : field.kind === 'phone'
          ? '+91 XXXXX XXXXX'
          : field.label;
    drawFieldBox(ctx, 32, placeholder);
  }
}

/**
 * Download a blank PDF packet for an admission process —
 * cover page + every form attached to each step.
 */
export async function downloadAdmissionBlankPdf(process: AdmissionProcess) {
  const forms = process.steps.flatMap((step, stepIndex) =>
    step.forms.map((form) => ({
      stepIndex,
      stepName: step.name,
      stepCategory: step.category,
      formId: form.formId,
      formName: form.formName,
    })),
  );

  if (!forms.length) {
    throw new Error('No forms attached to this admission process yet.');
  }

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 42;
  const accent = hexToRgb('#5D5FEF');

  const ctx: PdfCtx = {
    doc,
    pageW,
    pageH,
    margin,
    contentW: pageW - margin * 2,
    y: margin,
    accent,
    labelRgb: [51, 65, 85],
    borderRgb: [226, 232, 240],
  };

  drawCover(ctx, process);

  let lastStepId = '';
  for (const item of forms) {
    const stepKey = `${item.stepIndex}-${item.stepName}`;
    if (stepKey !== lastStepId) {
      newPageIfNeeded(ctx, 56);
      if (lastStepId) ctx.y += 8;
      doc.setFillColor(232, 242, 255);
      doc.roundedRect(margin, ctx.y, ctx.contentW, 36, 10, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(`Step ${item.stepIndex + 1}: ${item.stepName}`, margin + 14, ctx.y + 22);
      if (item.stepCategory) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(item.stepCategory, pageW - margin - 14, ctx.y + 22, { align: 'right' });
      }
      ctx.y += 48;
      lastStepId = stepKey;
    }

    const schema = loadFormBuilderSchema(item.formId, {
      seedDemoIfEmpty: true,
      formName: item.formName,
    });
    ctx.styles = schema.styles;
    ctx.labelRgb = hexToRgb(schema.styles.labelColor ?? '#334155');
    ctx.borderRgb = hexToRgb(schema.styles.fieldBorderColor ?? '#E2E8F0');
    ctx.accent = hexToRgb(schema.styles.sectionColor ?? '#5D5FEF');

    newPageIfNeeded(ctx, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(item.formName, margin, ctx.y);
    ctx.y += 18;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, ctx.y, pageW - margin, ctx.y);
    ctx.y += 16;

    drawFields(ctx, schema.fields);
    ctx.y += 10;
  }

  // Footer on last page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Panacea Childcare · ${process.name}`, margin, pageH - 24);
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.text('Blank admission packet', pageW - margin, pageH - 24, { align: 'right' });

  doc.save(`${safeFileName(process.name)}-blank-packet.pdf`);
}
