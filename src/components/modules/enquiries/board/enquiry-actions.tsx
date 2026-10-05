'use client';

import { memo, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import {
  ArrowRightLeft,
  CalendarCheck2,
  CalendarPlus,
  ClipboardList,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { dropdownMotion, softInteractiveBtn, tooltipMotion } from '../animations';

type Props = {
  variant?: 'enquiry' | 'appointment';
  compact?: boolean;
  email?: string;
  phone?: string;
  onEmail?: () => void;
  /** Appointment cards only — not used on enquiry cards/list. */
  onTask?: () => void;
  onTour?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onAppointment?: () => void;
  onQuickMove?: (stageName: string) => void;
  stages?: EnquiryStageConfig[];
  currentStage?: string;
};

function ActionTip({ label, children }: { label: string; children: ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="enq-action-tip-wrap"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show ? (
          <motion.span className="enq-action-tip" role="tooltip" {...tooltipMotion}>
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

export const EnquiryActions = memo(function EnquiryActions(props: Props) {
  const stop = (e: MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  if (props.variant === 'appointment') {
    return (
      <div className={`enq-card-actions${props.compact ? ' is-compact' : ''}`}>
        <ActionTip label="Appointment">
          <motion.button
            type="button"
            className="ui-btn ui-btn-outline enq-card-action-btn"
            aria-label="Open appointment"
            onClick={(e) => stop(e, () => props.onAppointment?.())}
            {...softInteractiveBtn}
          >
            <CalendarPlus size={14} aria-hidden />
            {!props.compact ? 'Appointment' : null}
          </motion.button>
        </ActionTip>
        <ActionTip label="Task">
          <motion.button
            type="button"
            className="ui-btn ui-btn-outline enq-card-action-btn"
            aria-label="Create task"
            onClick={(e) => stop(e, () => props.onTask?.())}
            {...softInteractiveBtn}
          >
            <ClipboardList size={14} aria-hidden />
            {!props.compact ? 'Task' : null}
          </motion.button>
        </ActionTip>
      </div>
    );
  }

  /* List / compact toolbar */
  if (props.compact && props.onView && props.onEdit && props.onAppointment) {
    return (
      <LegacyCompactActions
        onView={props.onView}
        onEdit={props.onEdit}
        onAppointment={props.onAppointment}
        onQuickMove={props.onQuickMove}
        stages={props.stages}
        currentStage={props.currentStage}
        compact
      />
    );
  }

  /* Board / list card: Email · Tour (+ optional overflow for list) */
  return (
    <div className="enq-card-actions">
      <ActionTip label="Email">
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline enq-card-action-btn"
          aria-label="Email"
          onClick={(e) => stop(e, () => props.onEmail?.())}
          {...softInteractiveBtn}
        >
          <Mail size={14} aria-hidden />
          Email
        </motion.button>
      </ActionTip>
      <ActionTip label="Tour">
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline enq-card-action-btn"
          aria-label="Tour"
          onClick={(e) => stop(e, () => props.onTour?.())}
          {...softInteractiveBtn}
        >
          <CalendarCheck2 size={14} aria-hidden />
          Tour
        </motion.button>
      </ActionTip>
      {props.onView && props.onEdit ? (
        <ListOverflowMenu onView={props.onView} onEdit={props.onEdit} onTour={props.onTour} />
      ) : null}
    </div>
  );
});

function ListOverflowMenu({
  onView,
  onEdit,
  onTour,
}: {
  onView: () => void;
  onEdit: () => void;
  onTour?: () => void;
}) {
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

  return (
    <div className="enq-actions enq-inline-menu" ref={ref}>
      <ActionTip label="More actions">
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline enq-card-action-btn enq-more-btn"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          {...softInteractiveBtn}
        >
          <MoreHorizontal size={16} aria-hidden />
        </motion.button>
      </ActionTip>
      <AnimatePresence>
        {open ? (
          <motion.ul
            id={menuId}
            role="menu"
            className="enq-actions-menu enq-actions-menu-up"
            {...dropdownMotion}
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
                <Eye size={16} aria-hidden />
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
                <Pencil size={16} aria-hidden />
                Edit enquiry
              </button>
            </li>
            {onTour ? (
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
                  <CalendarCheck2 size={16} aria-hidden />
                  Open tour
                </button>
              </li>
            ) : null}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
function LegacyCompactActions({
  onView,
  onEdit,
  onAppointment,
  onQuickMove,
  stages = [],
  currentStage,
  compact,
}: {
  onView: () => void;
  onEdit: () => void;
  onAppointment: () => void;
  onQuickMove?: (stageName: string) => void;
  stages?: EnquiryStageConfig[];
  currentStage?: string;
  compact?: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<HTMLDivElement>(null);
  const moreId = useId();
  const moveId = useId();

  useEffect(() => {
    if (!moreOpen && !moveOpen) return;
    const onDoc = (e: globalThis.MouseEvent) => {
      const t = e.target as Node;
      if (moreOpen && moreRef.current && !moreRef.current.contains(t)) setMoreOpen(false);
      if (moveOpen && moveRef.current && !moveRef.current.contains(t)) setMoveOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setMoveOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, moveOpen]);

  const activeStages = stages.filter((s) => s.active).sort((a, b) => a.order - b.order);

  const stop = (e: MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className={`enq-card-actions${compact ? ' is-compact' : ''}`}>
      <ActionTip label="View">
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline enq-card-action-btn"
          aria-label="View enquiry"
          onClick={(e) => stop(e, onView)}
          {...softInteractiveBtn}
        >
          <Eye size={14} aria-hidden />
          {!compact ? 'View' : null}
        </motion.button>
      </ActionTip>
      <ActionTip label="Edit">
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline enq-card-action-btn"
          aria-label="Edit enquiry"
          onClick={(e) => stop(e, onEdit)}
          {...softInteractiveBtn}
        >
          <Pencil size={14} aria-hidden />
          {!compact ? 'Edit' : null}
        </motion.button>
      </ActionTip>
      <ActionTip label="Appointment">
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary enq-card-action-btn"
          aria-label="Add appointment"
          onClick={(e) => stop(e, onAppointment)}
          {...softInteractiveBtn}
        >
          <CalendarPlus size={14} aria-hidden />
          {!compact ? 'Appointment' : null}
        </motion.button>
      </ActionTip>
      {onQuickMove && activeStages.length ? (
        <div className="enq-actions enq-inline-menu" ref={moveRef}>
          <ActionTip label="Quick Move">
            <motion.button
              type="button"
              className="ui-btn ui-btn-outline enq-card-action-btn"
              aria-label="Quick move stage"
              aria-haspopup="menu"
              aria-expanded={moveOpen}
              aria-controls={moveId}
              onClick={(e) => {
                e.stopPropagation();
                setMoveOpen((v) => !v);
                setMoreOpen(false);
              }}
              {...softInteractiveBtn}
            >
              <ArrowRightLeft size={14} aria-hidden />
              {!compact ? 'Move' : null}
            </motion.button>
          </ActionTip>
          <AnimatePresence>
            {moveOpen ? (
              <motion.ul
                id={moveId}
                role="menu"
                className="enq-actions-menu enq-actions-menu-up"
                {...dropdownMotion}
              >
                {activeStages.map((stage) => (
                  <li role="none" key={stage.id}>
                    <button
                      type="button"
                      role="menuitem"
                      className="enq-actions-item"
                      disabled={stage.name === currentStage}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMoveOpen(false);
                        if (stage.name !== currentStage) onQuickMove(stage.name);
                      }}
                    >
                      <span
                        className="enq-stage-dot"
                        style={{ background: stage.color }}
                        aria-hidden
                      />
                      {stage.name}
                    </button>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
      <div className="enq-actions enq-inline-menu" ref={moreRef}>
        <ActionTip label="More actions">
          <motion.button
            type="button"
            className="ui-btn ui-btn-outline enq-card-action-btn enq-more-btn"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            aria-controls={moreId}
            onClick={(e) => {
              e.stopPropagation();
              setMoreOpen((v) => !v);
              setMoveOpen(false);
            }}
            {...softInteractiveBtn}
          >
            <MoreHorizontal size={16} aria-hidden />
          </motion.button>
        </ActionTip>
        <AnimatePresence>
          {moreOpen ? (
            <motion.ul
              id={moreId}
              role="menu"
              className="enq-actions-menu enq-actions-menu-up"
              {...dropdownMotion}
            >
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="enq-actions-item"
                  onClick={(e) =>
                    stop(e, () => {
                      setMoreOpen(false);
                      onView();
                    })
                  }
                >
                  <Eye size={16} aria-hidden />
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
                      setMoreOpen(false);
                      onEdit();
                    })
                  }
                >
                  <Pencil size={16} aria-hidden />
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
                      setMoreOpen(false);
                      onAppointment();
                    })
                  }
                >
                  <CalendarPlus size={16} aria-hidden />
                  Schedule appointment
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="enq-actions-item is-danger"
                  disabled
                  title="Delete is unavailable in this preview"
                >
                  <Trash2 size={16} aria-hidden />
                  Delete
                </button>
              </li>
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
