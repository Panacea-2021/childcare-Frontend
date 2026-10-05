'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileSpreadsheet, ShieldAlert, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  importRowsToEnquiries,
  matchEnquiryTemplate,
  parseEnquiryFile,
  validateImportRows,
} from '@/lib/enquiries/excel';
import type {
  EnquirySource,
  ImportValidationSummary,
  ParsedImportRow,
} from '@/lib/enquiries/types';
import type { EnquiryRecord } from './types';
import { ImportPreviewTable } from './import-preview-table';
import { ImportProgress } from './import-progress';
import { SampleTemplateDownload } from './sample-template-download';
import { UploadDropzone } from './upload-dropzone';
import { ValidationSummary } from './validation-summary';

type Props = {
  open: boolean;
  sources: EnquirySource[];
  existingNames: string[];
  onClose: () => void;
  onImported: (rows: EnquiryRecord[]) => void;
  onToast: (toast: { type: 'ok' | 'err'; message: string }) => void;
};

type UploadState = 'idle' | 'uploading' | 'ready' | 'error' | 'invalid-template';

export const EnquiryImportDialog = memo(function EnquiryImportDialog({
  open,
  sources,
  existingNames,
  onClose,
  onImported,
  onToast,
}: Props) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{ name: string; sizeStr: string } | null>(null);
  const [rows, setRows] = useState<ParsedImportRow[]>([]);
  const [summary, setSummary] = useState<ImportValidationSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [templateIssues, setTemplateIssues] = useState<{
    missing: string[];
    extra: string[];
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setUploadState('idle');
      setProgress(0);
      setFileInfo(null);
      setRows([]);
      setSummary(null);
      setErrorMsg('');
      setTemplateIssues(null);
    }
  }, [open]);

  const canImport = useMemo(() => {
    if (uploadState !== 'ready') return false;
    if (!summary || !rows.length) return false;
    if (summary.missingColumns.length) return false;
    if (summary.extraColumns.length) return false;
    const importable = summary.valid + summary.warnings;
    return importable > 0;
  }, [rows.length, summary, uploadState]);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setUploadState('error');
        setErrorMsg('Please upload a valid .xlsx, .xls, or .csv file.');
        setTemplateIssues(null);
        setRows([]);
        setSummary(null);
        return;
      }

      setFileInfo({
        name: file.name,
        sizeStr: `${(file.size / 1024).toFixed(1)} KB`,
      });
      setUploadState('uploading');
      setProgress(12);
      setErrorMsg('');
      setTemplateIssues(null);
      setRows([]);
      setSummary(null);

      try {
        const tick = window.setInterval(() => {
          setProgress((p) => Math.min(p + 18, 88));
        }, 120);

        const parsed = await parseEnquiryFile(file);
        const match = matchEnquiryTemplate(parsed.headers);

        window.clearInterval(tick);
        setProgress(100);

        if (!match.ok) {
          setUploadState('invalid-template');
          setErrorMsg(match.message);
          setTemplateIssues({
            missing: match.missingColumns,
            extra: match.extraColumns,
          });
          onToast({ type: 'err', message: 'Only the official enquiry template is accepted.' });
          return;
        }

        const validated = validateImportRows(
          parsed.headers,
          parsed.rows,
          sources,
          existingNames,
        );

        setRows(validated.rows);
        setSummary(validated.summary);
        setUploadState('ready');

        if (!validated.rows.length) {
          setErrorMsg('Template columns match, but the file has no data rows to import.');
        } else if (validated.summary.invalid > 0) {
          setErrorMsg(
            `${validated.summary.invalid} invalid row(s) will be skipped. Review the preview, then import valid rows.`,
          );
        }
      } catch (err) {
        console.error(err);
        setUploadState('error');
        setErrorMsg('Could not parse the file. Check the format and try again.');
        setRows([]);
        setSummary(null);
      }
    },
    [existingNames, onToast, sources],
  );

  const clearFile = useCallback(() => {
    setUploadState('idle');
    setProgress(0);
    setFileInfo(null);
    setRows([]);
    setSummary(null);
    setErrorMsg('');
    setTemplateIssues(null);
  }, []);

  const handleImport = useCallback(() => {
    if (!canImport) return;
    const imported = importRowsToEnquiries(rows);
    onImported(imported);
    onToast({
      type: 'ok',
      message: `Imported ${imported.length} enquir${imported.length === 1 ? 'y' : 'ies'} successfully`,
    });
    onClose();
  }, [canImport, onClose, onImported, onToast, rows]);

  const showDropzone =
    uploadState === 'idle' ||
    uploadState === 'error' ||
    uploadState === 'invalid-template';

  return (
    <Modal
      open={open}
      title="Import Enquiries"
      subtitle="Upload the official sample template only. You’ll review a tabular preview before importing."
      onClose={onClose}
      xl
      autoHeight
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!canImport}
            onClick={handleImport}
            title={
              canImport
                ? 'Import validated rows'
                : 'Upload a valid template and fix issues before importing'
            }
          >
            Import{summary ? ` (${summary.valid + summary.warnings})` : ''}
          </button>
        </>
      }
    >
      <div className="enq-import-body">
        <div className="enq-import-tools">
          <SampleTemplateDownload
            onDownloaded={() =>
              onToast({ type: 'ok', message: 'Sample template downloaded' })
            }
          />
          {uploadState !== 'idle' && uploadState !== 'uploading' ? (
            <button type="button" className="ui-btn ui-btn-outline" onClick={clearFile}>
              Choose another file
            </button>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          {showDropzone ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <UploadDropzone onFile={processFile} />
              <p className="enq-import-hint">
                Accepted: official template as <strong>.xlsx</strong>, <strong>.xls</strong>, or{' '}
                <strong>.csv</strong>. Other spreadsheets are rejected.
              </p>
            </motion.div>
          ) : null}

          {uploadState === 'uploading' ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ImportProgress progress={progress} label="Validating template & reading rows…" />
            </motion.div>
          ) : null}

          {uploadState === 'ready' ? (
            <motion.div
              key="ready"
              className="enq-import-ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {fileInfo ? (
                <div className="enq-file-chip is-success">
                  <div className="enq-file-chip-main">
                    <FileSpreadsheet size={20} aria-hidden />
                    <div>
                      <strong>{fileInfo.name}</strong>
                      <span>
                        Template matched · {fileInfo.sizeStr} · {rows.length} row
                        {rows.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    aria-label="Remove file"
                    onClick={clearFile}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : null}

              <ValidationSummary summary={summary} />

              {errorMsg ? <p className="enq-alert is-warn">{errorMsg}</p> : null}

              <ImportPreviewTable rows={rows} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {(uploadState === 'error' || uploadState === 'invalid-template') && errorMsg ? (
          <div className="enq-template-reject" role="alert">
            <div className="enq-template-reject-title">
              <ShieldAlert size={18} aria-hidden />
              <strong>
                {uploadState === 'invalid-template'
                  ? 'Template not accepted'
                  : 'Upload failed'}
              </strong>
            </div>
            <p>{errorMsg}</p>
            {templateIssues?.missing.length ? (
              <p className="enq-template-reject-list">
                <span>Missing:</span> {templateIssues.missing.join(', ')}
              </p>
            ) : null}
            {templateIssues?.extra.length ? (
              <p className="enq-template-reject-list">
                <span>Extra:</span> {templateIssues.extra.join(', ')}
              </p>
            ) : null}
            {fileInfo ? (
              <div className="enq-file-chip is-error">
                <div className="enq-file-chip-main">
                  <FileSpreadsheet size={20} aria-hidden />
                  <div>
                    <strong>{fileInfo.name}</strong>
                    <span>{fileInfo.sizeStr} · rejected</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
});
