'use client';

import {
  memo,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  CalendarDays,
  CalendarPlus,
  Mail,
  MoreHorizontal,
  Phone,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { EnquiryRecord } from '../types';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { initialsOf } from '../mockData';
import { cardHoverLift, softInteractiveBtn } from '../animations';
import { EnquiryActions } from './enquiry-actions';
import { useEffect, useId, useRef, useState } from 'react';

export type LeadCardInfoRow = {
  label: string;
  value: ReactNode;
};

export type LeadCardProps = {
  accentColor?: string;
  displayName: string;
  avatarText: string;
  dateLabel: string;
  timeLabel?: string;
  email?: string;
  phone?: string;
  infoRows: LeadCardInfoRow[];
  actions: ReactNode;
  menu?: ReactNode;
  className?: string;
  style?: CSSProperties;
  dragRef?: Ref<HTMLElement>;
  bodyDragProps?: Record<string, unknown>;
  isDragging?: boolean;
  isDragOverlay?: boolean;
  onCardClick?: () => void;
};

/** Shared lead-style card shell (enquiry + appointment). Matches board card design. */
export const LeadCard = memo(function LeadCard({
  accentColor,
  displayName,
  avatarText,
  dateLabel,
  timeLabel,
  email,
  phone,
  infoRows,
  actions,
  menu,
  className,
  style,
  dragRef,
  bodyDragProps,
  isDragging,
  isDragOverlay,
  onCardClick,
}: LeadCardProps) {
  const mailHref = email ? `mailto:${email}` : undefined;
  const telHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined;

  return (
    <motion.article
      ref={dragRef as Ref<HTMLElement>}
      className={`enq-kcard${isDragging ? ' is-dragging' : ''}${isDragOverlay ? ' is-overlay' : ''}${className ? ` ${className}` : ''}`}
      style={{
        ...style,
        ['--enq-card-accent' as string]: accentColor ?? 'var(--color-accent)',
      }}
      whileHover={isDragOverlay || isDragging ? undefined : cardHoverLift}
      layout={!isDragOverlay}
      onClick={onCardClick}
    >
      <div className="enq-kcard-strip" aria-hidden />
      <div
        className={`enq-kcard-body${bodyDragProps ? ' is-draggable' : ''}`}
        {...(bodyDragProps ?? {})}
      >
        <div className="enq-kcard-top">
          <span className="enq-kcard-avatar" aria-hidden>
            {avatarText}
          </span>
          <div className="enq-kcard-identity">
            <div className="enq-kcard-name-row">
              <h3 className="enq-kcard-name">{displayName}</h3>
              <div className="enq-kcard-quick" onClick={(e) => e.stopPropagation()}>
                {mailHref ? (
                  <a
                    href={mailHref}
                    className="enq-kcard-quick-btn"
                    aria-label={`Email ${displayName}`}
                    title="Email"
                  >
                    <Mail size={14} aria-hidden />
                  </a>
                ) : (
                  <span className="enq-kcard-quick-btn is-disabled" aria-hidden>
                    <Mail size={14} />
                  </span>
                )}
                {telHref ? (
                  <a
                    href={telHref}
                    className="enq-kcard-quick-btn"
                    aria-label={`Call ${displayName}`}
                    title="Call"
                  >
                    <Phone size={14} aria-hidden />
                  </a>
                ) : (
                  <span className="enq-kcard-quick-btn is-disabled" aria-hidden>
                    <Phone size={14} />
                  </span>
                )}
              </div>
            </div>
            <p className="enq-kcard-date-line">
              <CalendarDays size={13} aria-hidden />
              <span>
                {dateLabel}
                {timeLabel ? ` · ${timeLabel}` : ''}
              </span>
            </p>
          </div>
          {menu ? <div className="enq-kcard-menu">{menu}</div> : null}
        </div>

        <div className="enq-kcard-info">
          {infoRows.map((row) => (
            <div className="enq-kcard-info-row" key={row.label}>
              <span className="enq-kcard-info-label">{row.label}</span>
              <span className="enq-kcard-info-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {actions}
    </motion.article>
  );
});

type CardMenuProps = {
  onView: () => void;
  onEdit: () => void;
  onTour: () => void;
  onQuickMove?: (stageName: string) => void;
  stages?: EnquiryStageConfig[];
  currentStage?: string;
};

function EnquiryCardMenu({
  onView,
  onEdit,
  onTour,
  onQuickMove,
  stages = [],
  currentStage,
}: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  const stop = (e: MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  const activeStages = stages.filter((s) => s.active).sort((a, b) => a.order - b.order);

  return (
    <div className="enq-actions enq-inline-menu enq-kcard-menu-wrap" ref={ref} onClick={(e) => e.stopPropagation()}>
      <motion.button
        type="button"
        className="enq-kcard-menu-btn"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        {...softInteractiveBtn}
      >
        <MoreHorizontal size={18} aria-hidden />
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            id={menuId}
            role="menu"
            className="enq-actions-menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={(e) =>
                  stop(e, () => {
                    setOpen(false);
                    onView();
                  })
                }
              >
                View details
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={(e) =>
                  stop(e, () => {
                    setOpen(false);
                    onEdit();
                  })
                }
              >
                Edit enquiry
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="enq-actions-item"
                onClick={(e) =>
                  stop(e, () => {
                    setOpen(false);
                    onTour();
                  })
                }
              >
                Open tour
              </button>
            </li>
            {onQuickMove && activeStages.length
              ? activeStages.map((stage) => (
                  <li role="none" key={stage.id}>
                    <button
                      type="button"
                      role="menuitem"
                      className="enq-actions-item"
                      disabled={stage.name === currentStage}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        if (stage.name !== currentStage) onQuickMove(stage.name);
                      }}
                    >
                      Move to {stage.name}
                    </button>
                  </li>
                ))
              : null}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type Props = {
  item: EnquiryRecord;
  stageColor?: string;
  stages: EnquiryStageConfig[];
  onView: (item: EnquiryRecord) => void;
  onEdit: (item: EnquiryRecord) => void;
  onTour: (item: EnquiryRecord) => void;
  onQuickMove: (item: EnquiryRecord, toStage: string) => void;
  isDragOverlay?: boolean;
};

export const EnquiryCard = memo(function EnquiryCard({
  item,
  stageColor,
  stages,
  onView,
  onEdit,
  onTour,
  onQuickMove,
  isDragOverlay,
}: Props) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: item.id,
    data: { enquiry: item, type: 'enquiry' },
    disabled: isDragOverlay,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: `card:${item.id}`,
    data: { enquiry: item, stageName: item.stage, type: 'card' },
    disabled: isDragOverlay,
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const email = item.motherEmail || item.fatherEmail;
  const phone = item.motherPhone || item.fatherPhone;
  const ownerUnassigned = !item.assignedTo || item.assignedTo === 'Unassigned';

  return (
    <LeadCard
      accentColor={stageColor}
      displayName={item.studentName}
      avatarText={initialsOf(item.studentName)}
      dateLabel={formatDisplayDate(item.createdOn)}
      email={email}
      phone={phone}
      dragRef={isDragOverlay ? undefined : setNodeRef}
      bodyDragProps={isDragOverlay ? undefined : { ...listeners, ...attributes }}
      isDragging={isDragging}
      isDragOverlay={isDragOverlay}
      style={isDragOverlay ? undefined : { opacity: isDragging ? 0.4 : 1 }}
      infoRows={[
        {
          label: 'Enquiry Owner',
          value: ownerUnassigned ? (
            <button
              type="button"
              className="enq-kcard-link"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              Assign
            </button>
          ) : (
            item.assignedTo
          ),
        },
        {
          label: 'Next Follow Up',
          value: item.expectedStartDate ? (
            formatDisplayDate(item.expectedStartDate)
          ) : (
            <button
              type="button"
              className="enq-kcard-link enq-kcard-icon-link"
              aria-label="Schedule follow up"
              onClick={(e) => {
                e.stopPropagation();
                onTour(item);
              }}
            >
              <CalendarPlus size={16} aria-hidden />
            </button>
          ),
        },
      ]}
      menu={
        !isDragOverlay ? (
          <EnquiryCardMenu
            onView={() => onView(item)}
            onEdit={() => onEdit(item)}
            onTour={() => onTour(item)}
            onQuickMove={(toStage) => onQuickMove(item, toStage)}
            stages={stages}
            currentStage={item.stage}
          />
        ) : null
      }
      actions={
        !isDragOverlay ? (
          <EnquiryActions
            variant="enquiry"
            email={email}
            phone={phone}
            onEmail={() => {
              if (email) window.location.href = `mailto:${email}`;
            }}
            onTour={() => onTour(item)}
          />
        ) : null
      }
    />
  );
});

function formatDisplayDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}
