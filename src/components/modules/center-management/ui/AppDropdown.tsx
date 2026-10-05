'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useFloatingPosition, type FloatAlign } from './useFloatingPosition';

export type DropdownOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type BaseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  align?: FloatAlign;
  minWidth?: number | 'trigger';
  maxHeight?: number;
  className?: string;
  menuClassName?: string;
  children: ReactNode;
};

/** Portal menu shell with flip/clamp positioning */
export function FloatingMenu({
  open,
  onOpenChange,
  align = 'start',
  minWidth = 'trigger',
  maxHeight = 320,
  className = '',
  menuClassName = '',
  children,
  trigger,
}: BaseProps & { trigger: ReactNode }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { pos } = useFloatingPosition({
    open,
    triggerRef,
    contentRef,
    align,
    minWidth,
    maxHeight,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || contentRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, [open, onOpenChange]);

  return (
    <div className={`cm-dd ${className}`} ref={triggerRef}>
      {trigger}
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={contentRef}
                  className={`cm-dd-menu ${menuClassName}`}
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    maxHeight,
                  }}
                  initial={{ opacity: 0, scale: 0.95, y: pos.placement === 'top' ? 4 : -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: pos.placement === 'top' ? 4 : -4 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  role="listbox"
                >
                  {children}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  align?: FloatAlign;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  maxHeight?: number;
};

/** Enterprise select replacing native <select> */
export function AppSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchable = false,
  searchPlaceholder = 'Search…',
  disabled = false,
  align = 'start',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  maxHeight = 280,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <FloatingMenu
      open={open}
      onOpenChange={(v) => {
        if (disabled) return;
        setOpen(v);
        if (!v) setQ('');
      }}
      align={align}
      className={className}
      menuClassName={menuClassName}
      maxHeight={maxHeight}
      trigger={
        <button
          type="button"
          className={`cm-dd-trigger ${triggerClassName}${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={selected ? '' : 'is-placeholder'}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown size={16} className="cm-dd-chevron" />
        </button>
      }
    >
      <div id={listId}>
        {searchable ? (
          <div className="cm-dd-search">
            <Search size={14} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
        ) : null}
        <div className="cm-dd-list">
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              disabled={opt.disabled}
              className={`cm-dd-item${opt.value === value ? ' is-selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                setQ('');
              }}
            >
              {opt.icon ? <span className="cm-dd-item-icon">{opt.icon}</span> : null}
              <span className="cm-dd-item-label">{opt.label}</span>
              {opt.value === value ? <Check size={15} className="cm-dd-check" /> : null}
            </button>
          ))}
          {!filtered.length ? <div className="cm-dd-empty">No matches</div> : null}
        </div>
      </div>
    </FloatingMenu>
  );
}

type MenuProps = {
  items: {
    id: string;
    label: string;
    icon?: ReactNode;
    danger?: boolean;
    disabled?: boolean;
    hint?: string;
    tone?: 'default' | 'list' | 'health' | 'qr' | 'bulk' | 'danger';
    onSelect: () => void;
  }[];
  align?: FloatAlign;
  trigger: (props: {
    open: boolean;
    toggle: () => void;
    buttonProps: ButtonHTMLAttributes<HTMLButtonElement>;
  }) => ReactNode;
  minWidth?: number | 'trigger';
  maxHeight?: number;
  menuClassName?: string;
  /** Optional header label shown above items (Actions menus). */
  title?: string;
};

export function AppMenu({
  items,
  align = 'end',
  trigger,
  minWidth = 200,
  maxHeight = 320,
  menuClassName = '',
  title,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const fancy = menuClassName.includes('cm-actions-menu');

  return (
    <FloatingMenu
      open={open}
      onOpenChange={setOpen}
      align={align}
      minWidth={minWidth}
      maxHeight={maxHeight}
      menuClassName={menuClassName}
      trigger={trigger({
        open,
        toggle: () => setOpen((v) => !v),
        buttonProps: {
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          onClick: () => setOpen((v) => !v),
        },
      })}
    >
      {fancy ? <div className="cm-actions-glow" aria-hidden /> : null}
      {title ? (
        <div className="cm-actions-head">
          <strong>{title}</strong>
        </div>
      ) : null}
      <div className={`cm-dd-list${fancy ? ' cm-actions-list' : ''}`} role="menu">
        {items.map((item, i) => {
          const tone = item.tone || (item.danger ? 'danger' : 'default');
          const body = (
            <>
              {item.icon ? (
                <span className={`cm-dd-item-icon${fancy ? ' cm-actions-ico' : ''}`} aria-hidden>
                  {item.icon}
                </span>
              ) : null}
              <span className="cm-dd-item-label">
                {item.label}
                {item.hint ? <em className="cm-dd-item-hint">{item.hint}</em> : null}
              </span>
              {fancy && !item.disabled ? (
                <span className="cm-actions-go" aria-hidden>
                  ›
                </span>
              ) : null}
            </>
          );

          const cls = `cm-dd-item${item.danger ? ' is-danger' : ''}${
            item.disabled ? ' is-disabled' : ''
          }${fancy ? ` cm-actions-item tone-${tone}` : ''}`;

          if (fancy) {
            return (
              <motion.button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cls}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.035 * i, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                whileHover={item.disabled ? undefined : { x: 3 }}
                whileTap={item.disabled ? undefined : { scale: 0.985 }}
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect();
                  setOpen(false);
                }}
              >
                {body}
              </motion.button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cls}
              onClick={() => {
                if (item.disabled) return;
                item.onSelect();
                setOpen(false);
              }}
            >
              {body}
            </button>
          );
        })}
      </div>
    </FloatingMenu>
  );
}
