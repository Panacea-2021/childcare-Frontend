'use client';

import { memo } from 'react';
import { FolderOpen, FileSpreadsheet, Star } from 'lucide-react';
import { motion } from 'framer-motion';

function EmptyFavoritesBase() {
  return (
    <div className="rp-empty-fav">
      <div className="rp-empty-stage" aria-hidden>
        <motion.span
          className="rp-empty-float"
          style={{ left: 18, top: 18 }}
          animate={{ y: [0, -8, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star size={20} fill="currentColor" color="#f5b301" />
        </motion.span>
        <motion.span
          className="rp-empty-float"
          style={{ right: 22, top: 8 }}
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <FolderOpen size={20} />
        </motion.span>
        <motion.span
          className="rp-empty-float"
          style={{ left: 58, bottom: 4 }}
          animate={{ y: [0, -7, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        >
          <FileSpreadsheet size={20} />
        </motion.span>
      </div>
      <h3>No favourite reports yet.</h3>
      <p>Click the star on any report to save it here.</p>
    </div>
  );
}

export const EmptyFavorites = memo(EmptyFavoritesBase);
