'use client';

import { memo } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { useCountUp } from '@/components/app/dashboard/useCountUp';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import type { EnquiryRecord } from '../types';
import { getStageIcon } from '../stage-icon';
import { boardColumnMotion, boardCardMotion, softInteractiveBtn } from '../animations';
import { EnquiryCard } from './enquiry-card';
import { EmptyStage } from './empty-stage';

type Props = {
  stage: EnquiryStageConfig;
  items: EnquiryRecord[];
  stages: EnquiryStageConfig[];
  onView: (item: EnquiryRecord) => void;
  onEdit: (item: EnquiryRecord) => void;
  onTour: (item: EnquiryRecord) => void;
  onQuickMove: (item: EnquiryRecord, toStage: string) => void;
  onAdd: (stageName: string) => void;
};

export const EnquiryColumn = memo(function EnquiryColumn({
  stage,
  items,
  stages,
  onView,
  onEdit,
  onTour,
  onQuickMove,
  onAdd,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage:${stage.name}`,
    data: { stageName: stage.name, type: 'stage' },
  });

  const count = useCountUp(items.length, 500, true);
  const Icon = getStageIcon(stage.icon);

  return (
    <motion.section
      className={`enq-column${isOver ? ' is-over' : ''}`}
      style={{ ['--enq-col-accent' as string]: stage.color }}
      variants={boardColumnMotion}
    >
      <header className="enq-column-header">
        <div className="enq-column-title-row">
          <span className="enq-column-icon" aria-hidden>
            <Icon size={15} />
          </span>
          <h3 className="enq-column-title">{stage.name}</h3>
          <span className="enq-column-count">{count}</span>
        </div>
        <motion.button
          type="button"
          className="enq-column-add"
          onClick={() => onAdd(stage.name)}
          {...softInteractiveBtn}
        >
          <Plus size={14} aria-hidden />
          Add Enquiry
        </motion.button>
      </header>

      <div ref={setNodeRef} className="enq-column-body">
        {!items.length ? (
          <EmptyStage stageName={stage.name} />
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div key={item.id} layout {...boardCardMotion}>
                <EnquiryCard
                  item={item}
                  stageColor={stage.color}
                  stages={stages}
                  onView={onView}
                  onEdit={onEdit}
                  onTour={onTour}
                  onQuickMove={onQuickMove}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.section>
  );
});
