'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import type { EnquiryRecord, PendingStageMove } from '../types';
import { staggerContainer } from '../animations';
import { EnquiryColumn } from './enquiry-column';
import { EnquiryDragOverlay } from './drag-overlay';

type Props = {
  stages: EnquiryStageConfig[];
  items: EnquiryRecord[];
  onView: (item: EnquiryRecord) => void;
  onEdit: (item: EnquiryRecord) => void;
  onTour: (item: EnquiryRecord) => void;
  onAdd: (stageName?: string) => void;
  onRequestMove: (move: PendingStageMove) => void;
};

export const EnquiryBoard = memo(function EnquiryBoard({
  stages,
  items,
  onView,
  onEdit,
  onTour,
  onAdd,
  onRequestMove,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const activeStages = useMemo(
    () => stages.filter((s) => s.active).sort((a, b) => a.order - b.order),
    [stages],
  );

  const byStage = useMemo(() => {
    const map = new Map<string, EnquiryRecord[]>();
    for (const stage of activeStages) map.set(stage.name, []);
    for (const item of items) {
      const list = map.get(item.stage);
      if (list) list.push(item);
      else {
        // orphan stage (inactive/renamed) — skip board columns
      }
    }
    return map;
  }, [activeStages, items]);

  const stageColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stages) map.set(s.name, s.color);
    return map;
  }, [stages]);

  const activeItem = useMemo(
    () => (activeId ? items.find((i) => i.id === activeId) ?? null : null),
    [activeId, items],
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const enquiry = items.find((i) => i.id === active.id);
      if (!enquiry) return;

      let toStage: string | null = null;
      const overId = String(over.id);
      const overData = over.data.current as
        | { stageName?: string; enquiry?: EnquiryRecord; type?: string }
        | undefined;

      if (overId.startsWith('stage:')) {
        toStage = overId.slice('stage:'.length);
      } else if (overData?.stageName) {
        toStage = overData.stageName;
      } else if (overId.startsWith('card:')) {
        const overEnquiry = items.find((i) => i.id === overId.slice('card:'.length));
        toStage = overEnquiry?.stage ?? null;
      } else {
        const overEnquiry = items.find((i) => i.id === overId);
        toStage = overEnquiry?.stage ?? null;
      }

      if (!toStage || toStage === enquiry.stage) return;

      onRequestMove({
        enquiryId: enquiry.id,
        studentName: enquiry.studentName,
        fromStage: enquiry.stage,
        toStage,
      });
    },
    [items, onRequestMove],
  );

  const onDragCancel = useCallback(() => setActiveId(null), []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      autoScroll={{ threshold: { x: 0.15, y: 0.15 } }}
    >
      <motion.div
        className="enq-board"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {activeStages.map((stage) => (
          <EnquiryColumn
            key={stage.id}
            stage={stage}
            items={byStage.get(stage.name) ?? []}
            stages={stages}
            onView={onView}
            onEdit={onEdit}
            onTour={onTour}
            onQuickMove={(item, toStage) =>
              onRequestMove({
                enquiryId: item.id,
                studentName: item.studentName,
                fromStage: item.stage,
                toStage,
              })
            }
            onAdd={onAdd}
          />
        ))}
      </motion.div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        <EnquiryDragOverlay
          item={activeItem}
          stages={stages}
          stageColor={activeItem ? stageColorMap.get(activeItem.stage) : undefined}
        />
      </DragOverlay>
    </DndContext>
  );
});
