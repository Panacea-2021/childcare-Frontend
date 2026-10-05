'use client';

import { memo, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  LayoutList,
  Table2,
} from 'lucide-react';
import {
  exportEnquiriesToCsv,
  exportEnquiriesToExcel,
  exportEnquiriesToPdf,
} from '@/lib/enquiries/excel';
import type { EnquiryRecord } from './types';
import { dropdownMotion, interactiveBtn } from './animations';

export type ExportScope = 'current' | 'filtered' | 'all';

type Props = {
  currentViewItems: EnquiryRecord[];
  filteredItems: EnquiryRecord[];
  allItems: EnquiryRecord[];
};

export const ExportDropdown = memo(function ExportDropdown({
  currentViewItems,
  filteredItems,
  allItems,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = (fn: () => void | Promise<void>) => {
    setOpen(false);
    void fn();
  };

  return (
    <div className="enq-actions" ref={rootRef}>
      <motion.button
        type="button"
        className="ui-btn ui-btn-outline enq-interactive-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        {...interactiveBtn}
      >
        <Download size={16} aria-hidden />
        Export
        <motion.span
          className="enq-chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <ChevronDown size={15} aria-hidden />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            id={menuId}
            role="menu"
            className="enq-actions-menu enq-actions-menu-wide"
            {...dropdownMotion}
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => run(() => exportEnquiriesToExcel(currentViewItems))}
              >
                <LayoutList size={16} aria-hidden />
                Export Current View
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => run(() => exportEnquiriesToExcel(filteredItems))}
              >
                <Filter size={16} aria-hidden />
                Export Filtered Records
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => run(() => exportEnquiriesToExcel(allItems))}
              >
                <Table2 size={16} aria-hidden />
                Export All Records
              </button>
            </li>
            <li className="enq-actions-sep" role="separator" aria-hidden />
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => run(() => exportEnquiriesToExcel(filteredItems))}
              >
                <FileSpreadsheet size={16} aria-hidden />
                Export Excel
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => run(() => exportEnquiriesToCsv(filteredItems))}
              >
                <FileText size={16} aria-hidden />
                Export CSV
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => run(() => exportEnquiriesToPdf(filteredItems))}
              >
                <Download size={16} aria-hidden />
                Export PDF
              </button>
            </li>
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
});
