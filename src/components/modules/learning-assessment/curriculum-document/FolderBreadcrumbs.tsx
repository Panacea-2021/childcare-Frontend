'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import type { CurriculumFolder } from './types';

type Props = {
  path: CurriculumFolder[];
  onNavigate: (folderId: string | null) => void;
};

export function FolderBreadcrumbs({ path, onNavigate }: Props) {
  return (
    <nav className="cd-breadcrumbs" aria-label="Folder path">
      <button
        type="button"
        className={`cd-crumb${path.length === 0 ? ' is-current' : ''}`}
        onClick={() => onNavigate(null)}
        aria-current={path.length === 0 ? 'page' : undefined}
      >
        <Home size={14} aria-hidden />
        Library
      </button>
      <AnimatePresence initial={false}>
        {path.map((folder, index) => {
          const isLast = index === path.length - 1;
          return (
            <motion.span
              key={folder.id}
              className="cd-crumb-wrap"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="cd-crumb-sep" aria-hidden />
              <button
                type="button"
                className={`cd-crumb${isLast ? ' is-current' : ''}`}
                onClick={() => onNavigate(folder.id)}
                aria-current={isLast ? 'page' : undefined}
                disabled={isLast}
              >
                {folder.name}
              </button>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </nav>
  );
}
