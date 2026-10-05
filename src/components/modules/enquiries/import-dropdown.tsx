'use client';

import { memo, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FileSpreadsheet, Upload } from 'lucide-react';
import { downloadSampleTemplate } from '@/lib/enquiries/excel';
import { dropdownMotion, interactiveBtn } from './animations';

type Props = {
  onImportEnquiries: () => void;
};

export const ImportDropdown = memo(function ImportDropdown({ onImportEnquiries }: Props) {
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
        <Upload size={16} aria-hidden />
        Import
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
            className="enq-actions-menu"
            {...dropdownMotion}
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => {
                  setOpen(false);
                  onImportEnquiries();
                }}
              >
                <Upload size={16} aria-hidden />
                Import Enquiries
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => {
                  setOpen(false);
                  downloadSampleTemplate();
                }}
              >
                <FileSpreadsheet size={16} aria-hidden />
                Download Sample Excel
              </button>
            </li>
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
});
