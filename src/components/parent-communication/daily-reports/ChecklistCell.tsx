'use client';

import { motion } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';

type Props = {
  completed: boolean;
  isIncident?: boolean;
  label: string;
  onToggle: () => void;
};

export function ChecklistCell({ completed, isIncident, label, onToggle }: Props) {
  return (
    <motion.button
      type="button"
      className={`dr-check${completed ? ' is-done' : ''}${
        isIncident && completed ? ' is-incident-on' : ''
      }`}
      aria-label={`${label}: ${completed ? 'completed' : 'pending'}`}
      aria-pressed={completed}
      onClick={onToggle}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.15 }}
    >
      {isIncident && completed ? (
        <AlertTriangle size={12} strokeWidth={2.25} />
      ) : completed ? (
        <Check size={12} strokeWidth={2.5} />
      ) : null}
    </motion.button>
  );
}
