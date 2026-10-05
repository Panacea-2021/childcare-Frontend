'use client';

import { motion } from 'framer-motion';
import { FileText, LayoutTemplate, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { btnMotion, cardHover } from './animations';
import type { CreateMode } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (mode: CreateMode) => void;
};

const OPTIONS: Array<{
  mode: CreateMode;
  title: string;
  description: string;
  button: string;
  icon: React.ReactNode;
  className: string;
}> = [
  {
    mode: 'scratch',
    title: 'Create From Scratch',
    description: 'Build a completely custom form using drag-and-drop components.',
    button: 'Start Building',
    icon: <LayoutTemplate size={24} strokeWidth={1.75} />,
    className: '',
  },
  {
    mode: 'pdf',
    title: 'Fillable PDF',
    description: 'Upload an existing PDF and convert it into a fillable digital form.',
    button: 'Upload PDF',
    icon: <FileText size={24} strokeWidth={1.75} />,
    className: 'is-pdf',
  },
  {
    mode: 'ai',
    title: 'AI Form Creator',
    description: 'Generate a complete form automatically using AI or an uploaded image.',
    button: 'Generate with AI',
    icon: <Sparkles size={24} strokeWidth={1.75} />,
    className: 'is-ai',
  },
];

export function CreateOptionsModal({ open, onClose, onSelect }: Props) {
  return (
    <Modal open={open} title="Create Form" subtitle="Choose how you want to start" onClose={onClose} wide>
      <div className="sf-create-grid">
        {OPTIONS.map((opt, i) => (
          <motion.div
            key={opt.mode}
            className={`sf-option-card ${opt.className}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            {...cardHover}
          >
            <div className="sf-option-icon">{opt.icon}</div>
            <h3>{opt.title}</h3>
            <p>{opt.description}</p>
            <motion.button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => onSelect(opt.mode)}
              {...btnMotion}
            >
              {opt.button}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </Modal>
  );
}
