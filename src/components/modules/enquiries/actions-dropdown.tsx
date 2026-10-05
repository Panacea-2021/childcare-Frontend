'use client';

import { memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Download, Upload } from 'lucide-react';

type Props = {
  onExport: () => void;
  onImport: () => void;
};

export const EnquiryActionsDropdown = memo(function EnquiryActionsDropdown({
  onExport,
  onImport,
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

  const select = useCallback(
    (action: 'export' | 'import') => {
      setOpen(false);
      if (action === 'export') onExport();
      else onImport();
    },
    [onExport, onImport],
  );

  return (
    <div className="enq-actions" ref={rootRef}>
      <button
        type="button"
        className="ui-btn ui-btn-outline"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        Actions
        <ChevronDown size={16} aria-hidden />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            id={menuId}
            role="menu"
            className="enq-actions-menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => select('export')}
              >
                <Download size={16} aria-hidden />
                Export
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={() => select('import')}
              >
                <Upload size={16} aria-hidden />
                Import
              </button>
            </li>
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
});
