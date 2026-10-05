'use client';

import { memo, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ArrowRight } from 'lucide-react';

type Props = {
  open: boolean;
  studentName: string;
  fromStage: string;
  toStage: string;
  fromColor?: string;
  toColor?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const MoveConfirmDialog = memo(function MoveConfirmDialog({
  open,
  studentName,
  fromStage,
  toStage,
  fromColor,
  toColor,
  onCancel,
  onConfirm,
}: Props) {
  const footer = useMemo(
    () => (
      <>
        <button type="button" className="ui-btn ui-btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="ui-btn ui-btn-primary" onClick={onConfirm}>
          Confirm
        </button>
      </>
    ),
    [onCancel, onConfirm],
  );

  return (
    <Modal
      open={open}
      title="Move Enquiry?"
      onClose={onCancel}
      elevated
      autoHeight
      footer={footer}
    >
      <div className="enq-move-dialog">
        <p className="enq-move-copy">
          Are you sure you want to move <strong>{studentName}</strong> from
        </p>
        <div className="enq-move-stages">
          <span
            className="enq-badge"
            style={
              fromColor
                ? {
                    background: `color-mix(in srgb, ${fromColor} 16%, #fff)`,
                    color: fromColor,
                    borderColor: `color-mix(in srgb, ${fromColor} 30%, transparent)`,
                  }
                : undefined
            }
          >
            {fromStage}
          </span>
          <ArrowRight size={16} aria-hidden className="enq-move-arrow" />
          <span
            className="enq-badge"
            style={
              toColor
                ? {
                    background: `color-mix(in srgb, ${toColor} 16%, #fff)`,
                    color: toColor,
                    borderColor: `color-mix(in srgb, ${toColor} 30%, transparent)`,
                  }
                : undefined
            }
          >
            {toStage}
          </span>
        </div>
      </div>
    </Modal>
  );
});
