'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export type AsrOption = {
  value: string;
  label: string;
  meta?: string;
  leading?: ReactNode;
};

type BaseProps = {
  label: ReactNode;
  ariaLabel?: string;
  placeholder: string;
  options: AsrOption[];
  searchPlaceholder?: string;
  error?: string;
};

type MultiProps = BaseProps & {
  multiple: true;
  value: string[];
  onChange: (next: string[]) => void;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value: string | null;
  onChange: (next: string | null) => void;
};

type Props = MultiProps | SingleProps;

const MENU_Z = 15050;

export function AsrDropdown(props: Props) {
  const {
    label,
    ariaLabel,
    placeholder,
    options,
    searchPlaceholder = 'Search…',
    error,
    multiple = false,
  } = props;

  const accessibleLabel =
    ariaLabel ?? (typeof label === 'string' ? label : placeholder);

  const fieldId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const selectedValues = multiple
    ? (props as MultiProps).value
    : (props as SingleProps).value
      ? [(props as SingleProps).value as string]
      : [];

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedValues.includes(o.value)),
    [options, selectedValues],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(query) ||
        (o.meta?.toLowerCase().includes(query) ?? false) ||
        o.value.toLowerCase().includes(query),
    );
  }, [options, q]);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const place = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.max(rect.width, 280);
      const spaceBelow = window.innerHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;
      const maxHeight = Math.min(320, Math.max(160, openUp ? spaceAbove : spaceBelow));
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);

      // Prefer bottom-anchoring when flipping up so short menus stay glued to the trigger
      // (top = rect.top - maxHeight left a large gap for compact option lists).
      if (openUp) {
        const panelHeight = panelRef.current?.offsetHeight;
        if (panelHeight && panelHeight > 0) {
          setPos({
            top: Math.max(12, rect.top - panelHeight - 8),
            left,
            width,
            maxHeight,
          });
        } else {
          setPos({
            bottom: Math.max(12, window.innerHeight - rect.top + 8),
            left,
            width,
            maxHeight,
          });
        }
      } else {
        setPos({
          top: rect.bottom + 8,
          left,
          width,
          maxHeight,
        });
      }
    };

    place();
    // Remeasure after paint once the panel height is known (upward open).
    const raf = window.requestAnimationFrame(place);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, filtered.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      setQ('');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setQ('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = (value: string) => {
    if (multiple) {
      const current = (props as MultiProps).value;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      (props as MultiProps).onChange(next);
      return;
    }
    const current = (props as SingleProps).value;
    (props as SingleProps).onChange(current === value ? null : value);
    setOpen(false);
    setQ('');
  };

  const removeChip = (value: string) => {
    if (multiple) {
      (props as MultiProps).onChange((props as MultiProps).value.filter((v) => v !== value));
      return;
    }
    (props as SingleProps).onChange(null);
  };

  const summary =
    selectedOptions.length === 0
      ? placeholder
      : multiple
        ? selectedOptions.length === 1
          ? selectedOptions[0].label
          : `${selectedOptions.length} selected`
        : selectedOptions[0]?.label ?? placeholder;

  const menu =
    mounted && pos ? (
      <AnimatePresence onExitComplete={() => setPos(null)}>
        {open ? (
          <motion.div
            key="asr-dd-menu"
            ref={panelRef}
            className="asr-dd-menu"
            role="listbox"
            aria-multiselectable={multiple}
            aria-label={accessibleLabel}
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              zIndex: MENU_Z,
            }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="asr-dd-search">
              <Search size={15} aria-hidden />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
            </div>
            <div className="asr-dd-list">
              {filtered.map((option) => {
                const selected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`asr-dd-item${selected ? ' is-selected' : ''}`}
                    onClick={() => toggle(option.value)}
                  >
                    {multiple ? (
                      <span className={`asr-dd-checkbox${selected ? ' is-on' : ''}`} aria-hidden>
                        {selected ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                    ) : null}
                    {option.leading}
                    <span className="asr-dd-item-text">
                      <strong>{option.label}</strong>
                      {option.meta ? <span>{option.meta}</span> : null}
                    </span>
                    {!multiple && selected ? <Check size={16} className="asr-dd-tick" aria-hidden /> : null}
                  </button>
                );
              })}
              {!filtered.length ? <div className="asr-dd-empty">No matches found</div> : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null;

  return (
    <div className="asr-field">
      <label className="ui-label" htmlFor={fieldId}>
        {label}
      </label>
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        className={`asr-dd-trigger${open ? ' is-open' : ''}${selectedOptions.length ? '' : ' is-empty'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (open) setQ('');
        }}
      >
        <span className="asr-dd-trigger-label">{summary}</span>
        <ChevronDown size={17} aria-hidden />
      </button>

      {selectedOptions.length > 0 ? (
        <div className="asr-chips" aria-live="polite">
          {selectedOptions.map((option) => (
            <span key={option.value} className="asr-chip">
              {option.leading ? <span className="asr-chip-leading">{option.leading}</span> : null}
              {multiple && selectedOptions.length ? `✓ ${option.label}` : option.label}
              <button type="button" aria-label={`Remove ${option.label}`} onClick={() => removeChip(option.value)}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {error ? <p className="asr-error">{error}</p> : null}
      {mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}
