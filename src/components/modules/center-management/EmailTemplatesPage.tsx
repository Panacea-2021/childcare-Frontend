'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  BellRing,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  FileText,
  Mail,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { BillingAccountingPageHeader } from '@/components/modules/billing-accounting/BillingAccountingPageHeader';
import { CenterManagementPageHeader } from './CenterManagementPageHeader';
import { AppMenu, AppSelect, AppTooltip, TableActionMenu } from './ui';
import { SimpleRichEditor } from './SimpleRichEditor';
import { loadLabels } from '@/lib/center-management/labelsStore';
import {
  GENERATE_FOR_OPTIONS,
  TEMPLATE_TYPE_LABELS,
  WHEN_OPTIONS,
  createEmailId,
  formatDisplayDate,
  generateForBadgeLabel,
  loadEmailTemplates,
  loadFeeAutomations,
  saveEmailTemplates,
  saveFeeAutomations,
  tagsForType,
  whenBadgeLabel,
  type AutomationStatus,
  type AutomationWhen,
  type EmailTemplate,
  type EmailTemplateType,
  type FeeAutomation,
  type GenerateFor,
} from '@/lib/center-management/emailTemplatesStore';
import './students.css';
import './email-templates.css';

type TabId = 'templates' | 'automation';
type ViewMode = 'list' | 'template-form' | 'automation-form' | 'template-preview';
type SortKey = 'name' | 'subject' | 'label' | 'type' | 'updated' | 'status';
type SortDir = 'asc' | 'desc';
type PageContext = 'billing' | 'center';

type Toast = { type: 'ok' | 'err'; message: string } | null;

function StatusDropdownCell({
  status,
  onChange,
  align = 'left',
}: {
  status: AutomationStatus;
  onChange: (next: AutomationStatus) => void;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`cm-status-pill ${status === 'Active' ? 'mint' : 'blush'}`}
        style={{
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
        }}
      >
        <span>{status}</span>
        <ChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              ...(align === 'right' ? { right: 0 } : { left: 0 }),
              minWidth: '130px',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid var(--border, #e2e8f0)',
              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.18)',
              zIndex: 100,
              padding: '6px',
              textAlign: 'left',
            }}
          >
            {(['Active', 'Inactive'] as AutomationStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(s);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: status === s ? (s === 'Active' ? '#f0fdf4' : '#fef2f2') : 'transparent',
                  color: s === 'Active' ? '#15803d' : '#b91c1c',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: s === 'Active' ? '#22c55e' : '#ef4444',
                  }}
                />
                {s}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const emptyTemplateDraft = (): Omit<EmailTemplate, 'id' | 'updatedAt' | 'updatedBy' | 'isSystem'> => ({
  name: '',
  replyTo: '',
  subject: '',
  labelId: null,
  type: 'enquiry',
  bodyHtml: '',
  status: 'Active',
  attachments: [],
});

const emptyAutomationDraft = (): Omit<FeeAutomation, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: '',
  templateId: null,
  replyTo: '',
  subject: '',
  descriptionHtml: '',
  when: 'immediate',
  generateFor: 'invoice_creation_date',
  sendPush: false,
  status: 'Active',
});

export function EmailTemplatesPage({ context = 'billing' }: { context?: PageContext }) {
  const isBilling = context === 'billing';
  const [ready, setReady] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<FeeAutomation[]>([]);
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [emailLabels, setEmailLabels] = useState<{ label: string; value: string }[]>([]);

  const [tab, setTab] = useState<TabId>(isBilling ? 'automation' : 'templates');
  const [view, setView] = useState<ViewMode>('list');
  const [toast, setToast] = useState<Toast>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Template');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [autoSearch, setAutoSearch] = useState('');
  const [autoPage, setAutoPage] = useState(1);
  const [autoPageSize, setAutoPageSize] = useState(10);

  const [previewTarget, setPreviewTarget] = useState<EmailTemplate | null>(null);
  const [deleteTemplateOpen, setDeleteTemplateOpen] = useState(false);
  const [deleteAutomationOpen, setDeleteAutomationOpen] = useState(false);
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState<EmailTemplate | null>(null);
  const [deleteAutomationTarget, setDeleteAutomationTarget] = useState<FeeAutomation | null>(null);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [typeLocked, setTypeLocked] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(emptyTemplateDraft());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [automationDraft, setAutomationDraft] = useState(emptyAutomationDraft());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const templatesTabRef = useRef<HTMLButtonElement>(null);
  const automationTabRef = useRef<HTMLButtonElement>(null);
  const [pill, setPill] = useState({ left: 4, width: 140 });

  useEffect(() => {
    const t = loadEmailTemplates();
    const a = loadFeeAutomations();
    const labels = loadLabels().filter(
      (l) => l.feature === 'Email Templates' && l.status === 'Active',
    );
    setTemplates(t);
    setAutomations(a);
    setEmailLabels(labels.map((l) => ({ label: l.name, value: l.id })));
    setLabelMap(Object.fromEntries(labels.map((l) => [l.id, l.name])));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveEmailTemplates(templates);
  }, [templates, ready]);

  useEffect(() => {
    if (!ready) return;
    saveFeeAutomations(automations);
  }, [automations, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const el = tab === 'templates' ? templatesTabRef.current : automationTabRef.current;
    if (!el) return;
    setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab, view]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, pageSize]);

  useEffect(() => {
    setAutoPage(1);
  }, [autoSearch, autoPageSize]);

  const filteredTemplates = useMemo(() => {
    let rows = [...templates];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          TEMPLATE_TYPE_LABELS[t.type].toLowerCase().includes(q),
      );
    }
    if (typeFilter === 'Automated fee reminder') {
      rows = rows.filter((t) => t.type === 'automated_fee_reminder');
    } else if (typeFilter === 'Enquiry') {
      rows = rows.filter((t) => t.type === 'enquiry');
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const labelA = a.labelId ? labelMap[a.labelId] ?? '' : '';
      const labelB = b.labelId ? labelMap[b.labelId] ?? '' : '';
      const map: Record<SortKey, string> = {
        name: a.name,
        subject: a.subject,
        label: labelA,
        type: TEMPLATE_TYPE_LABELS[a.type],
        updated: a.updatedAt,
        status: a.status,
      };
      const mapB: Record<SortKey, string> = {
        name: b.name,
        subject: b.subject,
        label: labelB,
        type: TEMPLATE_TYPE_LABELS[b.type],
        updated: b.updatedAt,
        status: b.status,
      };
      return map[sortKey].localeCompare(mapB[sortKey]) * dir;
    });
    return rows;
  }, [templates, search, typeFilter, sortKey, sortDir, labelMap]);

  const latestAutomations = useMemo(
    () =>
      [...automations]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [automations],
  );

  const filteredAutomations = useMemo(() => {
    const q = autoSearch.trim().toLowerCase();
    if (!q) return [...automations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return automations
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          whenBadgeLabel(a.when).toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [automations, autoSearch]);

  const autoTotalPages = Math.max(1, Math.ceil(filteredAutomations.length / autoPageSize));
  const paginatedAutomations = useMemo(() => {
    const start = (autoPage - 1) * autoPageSize;
    return filteredAutomations.slice(start, start + autoPageSize);
  }, [filteredAutomations, autoPage, autoPageSize]);

  useEffect(() => {
    if (autoPage > autoTotalPages) setAutoPage(autoTotalPages);
  }, [autoPage, autoTotalPages]);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, currentPage, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const showToast = (type: 'ok' | 'err', message: string) => setToast({ type, message });

  const backToList = (nextTab?: TabId) => {
    if (nextTab) setTab(nextTab);
    setView('list');
    setPreviewTarget(null);
  };

  const openAddTemplate = () => {
    setEditingTemplateId(null);
    setTypeLocked(false);
    setTemplateDraft(emptyTemplateDraft());
    setTab('templates');
    setView('template-form');
  };

  const openUseIt = (tpl: EmailTemplate) => {
    setEditingTemplateId(null);
    setTypeLocked(tpl.type === 'automated_fee_reminder');
    setTemplateDraft({
      name: tpl.name,
      replyTo: tpl.replyTo,
      subject: tpl.subject,
      labelId: tpl.labelId,
      type: tpl.type,
      bodyHtml: tpl.bodyHtml,
      status: 'Active',
      attachments: [],
    });
    setTab('templates');
    setView('template-form');
  };

  const openEditTemplate = (tpl: EmailTemplate) => {
    if (tpl.isSystem) return;
    setEditingTemplateId(tpl.id);
    setTypeLocked(false);
    setTemplateDraft({
      name: tpl.name,
      replyTo: tpl.replyTo,
      subject: tpl.subject,
      labelId: tpl.labelId,
      type: tpl.type,
      bodyHtml: tpl.bodyHtml,
      status: tpl.status || 'Active',
      attachments: [...tpl.attachments],
    });
    setTab('templates');
    setView('template-form');
  };

  const openPreview = (tpl: EmailTemplate) => {
    setPreviewTarget(tpl);
    setTab('templates');
    setView('template-preview');
  };

  const saveTemplate = async () => {
    if (!templateDraft.name.trim()) {
      showToast('err', 'Template name is required');
      return;
    }
    if (!templateDraft.replyTo.trim()) {
      showToast('err', 'Reply-to email is required');
      return;
    }
    if (!templateDraft.subject.trim()) {
      showToast('err', 'Subject is required');
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();

    if (editingTemplateId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplateId
            ? {
                ...t,
                ...templateDraft,
                name: templateDraft.name.trim(),
                replyTo: templateDraft.replyTo.trim(),
                subject: templateDraft.subject.trim(),
                updatedAt: now,
                updatedBy: 'You',
              }
            : t,
        ),
      );
      showToast('ok', 'Template updated');
    } else {
      const created: EmailTemplate = {
        id: createEmailId(),
        ...templateDraft,
        name: templateDraft.name.trim(),
        replyTo: templateDraft.replyTo.trim(),
        subject: templateDraft.subject.trim(),
        isSystem: false,
        updatedBy: 'You',
        updatedAt: now,
      };
      setTemplates((prev) => [created, ...prev]);
      showToast('ok', 'Template saved');
    }

    setIsSubmitting(false);
    backToList('templates');
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteTemplateTarget) return;
    setIsSubmitting(true);
    setTemplates((prev) => prev.filter((t) => t.id !== deleteTemplateTarget.id));
    setIsSubmitting(false);
    setDeleteTemplateOpen(false);
    showToast('ok', `Template "${deleteTemplateTarget.name}" deleted`);
    setDeleteTemplateTarget(null);
  };

  const copyTag = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      showToast('ok', 'Copied to clipboard!');
    } catch {
      showToast('err', 'Could not copy tag');
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).map((f) => ({
      id: createEmailId('att'),
      name: f.name,
      size: f.size,
    }));
    setTemplateDraft((d) => ({ ...d, attachments: [...d.attachments, ...next] }));
  };

  const openAddAutomation = () => {
    setEditingAutomationId(null);
    setAutomationDraft(emptyAutomationDraft());
    setTab('automation');
    setView('automation-form');
  };

  const openEditAutomation = (item: FeeAutomation) => {
    setEditingAutomationId(item.id);
    setAutomationDraft({
      title: item.title,
      templateId: item.templateId,
      replyTo: item.replyTo,
      subject: item.subject,
      descriptionHtml: item.descriptionHtml,
      when: item.when,
      generateFor: item.generateFor,
      sendPush: item.sendPush,
      status: item.status,
    });
    setTab('automation');
    setView('automation-form');
  };

  const applyTemplateToAutomation = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    setAutomationDraft((d) => ({
      ...d,
      templateId: templateId || null,
      replyTo: tpl?.replyTo || d.replyTo,
      subject: tpl?.subject || d.subject,
      descriptionHtml: tpl?.bodyHtml || d.descriptionHtml,
    }));
  };

  const saveAutomation = async () => {
    if (!automationDraft.title.trim()) {
      showToast('err', 'Title is required');
      return;
    }
    if (!automationDraft.replyTo.trim()) {
      showToast('err', 'Reply To is required');
      return;
    }
    if (!automationDraft.subject.trim()) {
      showToast('err', 'Subject is required');
      return;
    }
    if (!automationDraft.descriptionHtml.trim() || automationDraft.descriptionHtml === '<br>') {
      showToast('err', 'Description is required');
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();

    if (editingAutomationId) {
      setAutomations((prev) =>
        prev.map((a) =>
          a.id === editingAutomationId
            ? {
                ...a,
                ...automationDraft,
                title: automationDraft.title.trim(),
                replyTo: automationDraft.replyTo.trim(),
                subject: automationDraft.subject.trim(),
                updatedAt: now,
              }
            : a,
        ),
      );
      showToast('ok', 'Automation updated');
    } else {
      const created: FeeAutomation = {
        id: createEmailId('fa'),
        ...automationDraft,
        title: automationDraft.title.trim(),
        replyTo: automationDraft.replyTo.trim(),
        subject: automationDraft.subject.trim(),
        createdAt: now,
        updatedAt: now,
      };
      setAutomations((prev) => [created, ...prev]);
      showToast('ok', 'Automation saved');
    }

    setIsSubmitting(false);
    backToList('automation');
  };

  const toggleTemplateStatus = (tpl: EmailTemplate, next: AutomationStatus) => {
    if (tpl.status === next) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === tpl.id ? { ...t, status: next, updatedAt: new Date().toISOString() } : t,
      ),
    );
    showToast('ok', `"${tpl.name}" marked as ${next}`);
  };

  const toggleAutomationStatus = (item: FeeAutomation, next: AutomationStatus) => {
    if (item.status === next) return;
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === item.id ? { ...a, status: next, updatedAt: new Date().toISOString() } : a,
      ),
    );
    showToast('ok', 'Status changed');
  };

  const confirmDeleteAutomation = async () => {
    if (!deleteAutomationTarget) return;
    setIsSubmitting(true);
    setAutomations((prev) => prev.filter((a) => a.id !== deleteAutomationTarget.id));
    setIsSubmitting(false);
    setDeleteAutomationOpen(false);
    showToast('ok', `Deleted "${deleteAutomationTarget.title}"`);
    setDeleteAutomationTarget(null);
  };

  const tagType: EmailTemplateType | 'all' =
    templateDraft.type === 'automated_fee_reminder' ? 'automated_fee_reminder' : 'enquiry';

  const toastNode =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {toast ? (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={`et-toast ${toast.type}`}
                role="status"
              >
                <span className="et-toast-icon" aria-hidden>
                  {toast.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                </span>
                <span className="et-toast-msg">{toast.message}</span>
                <button type="button" className="et-toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
                  <X size={13} />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  /* ——— Template form (in-page, no route change) ——— */
  if (view === 'template-form') {
    return (
      <div className="cm-page et-form-shell">
        {toastNode}
        <header className="et-design-topbar">
          <button
            type="button"
            className="et-back-btn"
            onClick={() => backToList('templates')}
            aria-label="Back to Fee Reminders"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="et-design-title">
            <span className="et-design-ico" aria-hidden>
              <Mail size={18} />
            </span>
            <div>
              <h1>Email Template / {editingTemplateId ? 'Edit' : 'Add'}</h1>
              <p>Design your reminder email. Back returns to Fee Reminders.</p>
            </div>
          </div>
        </header>

        <div className="et-form-card">
          <div className="et-form-grid">
            <div className="ui-field">
              <label className="ui-label">
                Template name <span className="req">*</span>
              </label>
              <input
                className="ui-input"
                placeholder="Template Name"
                value={templateDraft.name}
                onChange={(e) => setTemplateDraft((d) => ({ ...d, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Set email address where parents will send their replies <span className="req">*</span>
              </label>
              <input
                className="ui-input"
                type="email"
                placeholder="Reply To"
                value={templateDraft.replyTo}
                onChange={(e) => setTemplateDraft((d) => ({ ...d, replyTo: e.target.value }))}
              />
            </div>
            <div className="ui-field span-2">
              <label className="ui-label">
                Subject <span className="req">*</span>
              </label>
              <input
                className="ui-input"
                placeholder="Subject"
                value={templateDraft.subject}
                onChange={(e) => setTemplateDraft((d) => ({ ...d, subject: e.target.value }))}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Label</label>
              <AppSelect
                value={templateDraft.labelId ?? ''}
                onChange={(v) => setTemplateDraft((d) => ({ ...d, labelId: v || null }))}
                placeholder="Label"
                options={[{ label: 'No label', value: '' }, ...emailLabels]}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Type <span className="req">*</span>
              </label>
              <AppSelect
                value={templateDraft.type}
                onChange={(v) =>
                  setTemplateDraft((d) => ({ ...d, type: v as EmailTemplateType }))
                }
                disabled={typeLocked}
                options={[
                  { label: 'Automated fee reminder', value: 'automated_fee_reminder' },
                  { label: 'Enquiry', value: 'enquiry' },
                ]}
              />
            </div>
            <div className="ui-field span-2">
              <label className="ui-label">Body</label>
              <SimpleRichEditor
                value={templateDraft.bodyHtml}
                onChange={(html) => setTemplateDraft((d) => ({ ...d, bodyHtml: html }))}
                variant="full"
                minHeight={180}
                placeholder="Write your email body…"
              />
            </div>

            {templateDraft.type !== 'automated_fee_reminder' ? (
              <div className="ui-field span-2">
                <label className="ui-label">Attachments</label>
                <div
                  className={`et-drop${dragging ? ' is-drag' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addFiles(e.dataTransfer.files);
                  }}
                >
                  <Upload size={22} />
                  <strong>Click or drag attachment to this area to upload</strong>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                {templateDraft.attachments.length ? (
                  <div className="et-attach-list">
                    {templateDraft.attachments.map((a) => (
                      <span key={a.id} className="et-attach-chip">
                        <Paperclip size={13} />
                        {a.name}
                        <button
                          type="button"
                          aria-label={`Remove ${a.name}`}
                          onClick={() =>
                            setTemplateDraft((d) => ({
                              ...d,
                              attachments: d.attachments.filter((x) => x.id !== a.id),
                            }))
                          }
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="span-2 et-tags-block">
              <h4>Instructions</h4>
              <p>
                {templateDraft.type === 'automated_fee_reminder'
                  ? 'Make sure you use each of these tags in your email.'
                  : 'You can use these tags for dynamic replacement of the values'}
              </p>
              <div className="et-tags">
                {tagsForType(tagType).map((tag) => (
                  <button key={tag} type="button" className="et-tag" onClick={() => copyTag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
              {templateDraft.type === 'automated_fee_reminder' ? (
                <p className="et-note">
                  NOTE: lateFee is optional and only used if you have configured late fee in your school.
                </p>
              ) : null}
            </div>
          </div>

          <div className="et-form-actions">
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => backToList('templates')} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveTemplate} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ——— Automation form ——— */
  if (view === 'automation-form') {
    return (
      <div className="cm-page et-form-shell">
        {toastNode}
        <header className="et-design-topbar">
          <button
            type="button"
            className="et-back-btn"
            onClick={() => backToList('automation')}
            aria-label="Back to Fee Reminders"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="et-design-title">
            <span className="et-design-ico" aria-hidden>
              <Mail size={18} />
            </span>
            <div>
              <h1>
                Fee automation / {editingAutomationId ? automationDraft.title || 'Edit' : 'Send Email'}
              </h1>
              <p>Configure automation without leaving Fee Reminders.</p>
            </div>
          </div>
        </header>

        <div className="et-form-card">
          <div className="et-form-grid">
            <div className="ui-field">
              <label className="ui-label">
                Title <span className="req">*</span>
              </label>
              <input
                className="ui-input"
                placeholder="Email name"
                value={automationDraft.title}
                onChange={(e) => setAutomationDraft((d) => ({ ...d, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Choose Template</label>
              <AppSelect
                value={automationDraft.templateId ?? ''}
                onChange={applyTemplateToAutomation}
                placeholder="Select Template"
                searchable
                options={[
                  { label: 'Select Template', value: '' },
                  ...templates.map((t) => ({ label: t.name, value: t.id })),
                ]}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Reply To <span className="req">*</span>
              </label>
              <input
                className="ui-input"
                type="email"
                placeholder="Reply To"
                value={automationDraft.replyTo}
                onChange={(e) => setAutomationDraft((d) => ({ ...d, replyTo: e.target.value }))}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">
                Subject <span className="req">*</span>
              </label>
              <input
                className="ui-input"
                placeholder="Subject"
                value={automationDraft.subject}
                onChange={(e) => setAutomationDraft((d) => ({ ...d, subject: e.target.value }))}
              />
            </div>
            <div className="ui-field span-2">
              <label className="ui-label">
                Description <span className="req">*</span>
              </label>
              <SimpleRichEditor
                value={automationDraft.descriptionHtml}
                onChange={(html) => setAutomationDraft((d) => ({ ...d, descriptionHtml: html }))}
                variant="simple"
                minHeight={160}
              />
              <p className="et-note">Add {'{{pendingAmount}}'} to specify the invoice amount in the email</p>
            </div>
            <div className="ui-field">
              <label className="ui-label">
                When <span className="req">*</span>
              </label>
              <AppSelect
                value={String(automationDraft.when)}
                onChange={(v) =>
                  setAutomationDraft((d) => ({
                    ...d,
                    when: (v === 'immediate' ? 'immediate' : Number(v)) as AutomationWhen,
                  }))
                }
                searchable
                searchPlaceholder="Creation Day"
                options={WHEN_OPTIONS.map((o) => ({
                  label: o.label,
                  value: String(o.value),
                }))}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label">Generate For</label>
              <AppSelect
                value={automationDraft.generateFor}
                onChange={(v) =>
                  setAutomationDraft((d) => ({ ...d, generateFor: v as GenerateFor }))
                }
                options={GENERATE_FOR_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
              />
            </div>
            <div className="ui-field span-2">
              <label className="et-check">
                <input
                  type="checkbox"
                  checked={automationDraft.sendPush}
                  onChange={(e) => setAutomationDraft((d) => ({ ...d, sendPush: e.target.checked }))}
                />
                Send push notification
              </label>
            </div>
          </div>

          <div className="et-form-actions center">
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveAutomation} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ——— Template preview (in-page) ——— */
  if (view === 'template-preview' && previewTarget) {
    return (
      <div className="cm-page et-form-shell">
        {toastNode}
        <header className="et-design-topbar">
          <button
            type="button"
            className="et-back-btn"
            onClick={() => backToList('templates')}
            aria-label="Back to Fee Reminders"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="et-design-title">
            <span className="et-design-ico" aria-hidden>
              <Eye size={18} />
            </span>
            <div>
              <h1>Email Template / Preview</h1>
              <p>{previewTarget.name}</p>
            </div>
          </div>
        </header>

        <div className="et-form-card">
          <div className="et-preview-meta">
            <div className="et-preview-row">
              <strong>Subject</strong>
              <span>{previewTarget.subject}</span>
            </div>
            <div className="et-preview-row">
              <strong>Reply To</strong>
              <span>{previewTarget.replyTo || '—'}</span>
            </div>
          </div>
          <div
            className="et-preview-body"
            dangerouslySetInnerHTML={{ __html: previewTarget.bodyHtml }}
          />
        </div>
      </div>
    );
  }

  /* ——— List view ——— */
  return (
    <div className="cm-page cm-page--email">
      {toastNode}

      {isBilling ? (
        <BillingAccountingPageHeader
          title="Fee Reminders"
          description="Craft email templates and automate fee reminder delivery."
          icon={<Mail />}
          actions={
            tab === 'templates' ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="ui-btn ui-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={openAddTemplate}
              >
                <Plus size={16} /> Add Template
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="ui-btn ui-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={openAddAutomation}
              >
                <Plus size={16} /> Add Email
              </motion.button>
            )
          }
        />
      ) : (
        <CenterManagementPageHeader
          title="Email Templates"
          description="Create and manage reusable email templates."
          icon={<Mail />}
          actions={
            tab === 'templates' ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="ui-btn ui-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={openAddTemplate}
              >
                <Plus size={16} /> Add Template
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="ui-btn ui-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={openAddAutomation}
              >
                <Plus size={16} /> Add Email
              </motion.button>
            )
          }
        />
      )}

      {isBilling ? (
        <div className="et-overview" aria-label="Fee reminder overview">
          <article className="et-overview-card is-lavender">
            <span className="et-overview-shine" aria-hidden />
            <div className="et-overview-icon" aria-hidden>
              <FileText size={20} />
            </div>
            <div className="et-overview-meta">
              <span className="et-overview-label">Email Templates</span>
              <strong className="et-overview-value">{templates.length}</strong>
            </div>
          </article>
          <article className="et-overview-card is-mint">
            <span className="et-overview-shine" aria-hidden />
            <div className="et-overview-icon" aria-hidden>
              <Sparkles size={20} />
            </div>
            <div className="et-overview-meta">
              <span className="et-overview-label">Active Templates</span>
              <strong className="et-overview-value">
                {templates.filter((t) => (t.status || 'Active') === 'Active').length}
              </strong>
            </div>
          </article>
          <article className="et-overview-card is-blush">
            <span className="et-overview-shine" aria-hidden />
            <div className="et-overview-icon" aria-hidden>
              <Zap size={20} />
            </div>
            <div className="et-overview-meta">
              <span className="et-overview-label">Automations</span>
              <strong className="et-overview-value">{automations.length}</strong>
            </div>
          </article>
          <article className="et-overview-card is-amber">
            <span className="et-overview-shine" aria-hidden />
            <div className="et-overview-icon" aria-hidden>
              <BellRing size={20} />
            </div>
            <div className="et-overview-meta">
              <span className="et-overview-label">Active Automations</span>
              <strong className="et-overview-value">
                {automations.filter((a) => a.status === 'Active').length}
              </strong>
            </div>
          </article>
        </div>
      ) : null}

      <div className="et-tabs" role="tablist" aria-label="Fee Reminders tabs">
        <motion.span
          className="et-tab-pill"
          animate={{ left: pill.left, width: pill.width }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
        <button
          ref={automationTabRef}
          type="button"
          role="tab"
          aria-selected={tab === 'automation'}
          className={`et-tab${tab === 'automation' ? ' is-active' : ''}`}
          onClick={() => setTab('automation')}
        >
          Setup Automation
        </button>
        <button
          ref={templatesTabRef}
          type="button"
          role="tab"
          aria-selected={tab === 'templates'}
          className={`et-tab${tab === 'templates' ? ' is-active' : ''}`}
          onClick={() => setTab('templates')}
        >
          Email Templates
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'templates' ? (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div className="et-toolbar">
              <div className="et-toolbar-left">
                <div className="cm-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
                <div style={{ width: 220 }}>
                  <AppSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { label: 'All Template', value: 'All Template' },
                      { label: 'Automated fee reminder', value: 'Automated fee reminder' },
                      { label: 'Enquiry', value: 'Enquiry' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="cm-panel et-panel">
              <div className="cm-table-wrap et-table-wrap">
                <table className="cm-table">
                  <thead>
                    <tr>
                      {(
                        [
                          ['name', 'Template Name'],
                          ['subject', 'Subject'],
                          ['label', 'Label'],
                          ['type', 'Template Type'],
                          ['updated', 'Updated By'],
                          ['status', 'Status'],
                        ] as [SortKey, string][]
                      ).map(([key, label]) => (
                        <th key={key}>
                          <AppTooltip
                            content={
                              sortKey === key
                                ? sortDir === 'asc'
                                  ? 'Click to sort descending'
                                  : 'Click to sort ascending'
                                : 'Click to sort ascending'
                            }
                            side="bottom"
                          >
                            <button
                              type="button"
                              className={`et-sort-btn${sortKey === key ? ' is-active' : ''}`}
                              onClick={() => toggleSort(key)}
                            >
                              <span>{label}</span>
                              <span className="et-sort-icon" aria-hidden>
                                {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
                              </span>
                            </button>
                          </AppTooltip>
                        </th>
                      ))}
                      <th style={{ width: 70, textAlign: 'right', paddingRight: 20 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length ? (
                      paginated.map((tpl, idx) => (
                        <motion.tr
                          key={tpl.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <td>
                            <button
                              type="button"
                              className="et-name-link"
                              onClick={() => (tpl.isSystem ? openPreview(tpl) : openEditTemplate(tpl))}
                            >
                              {tpl.name}
                            </button>
                          </td>
                          <td>{tpl.subject}</td>
                          <td>
                            {tpl.labelId && labelMap[tpl.labelId] ? (
                              labelMap[tpl.labelId]
                            ) : (
                              <span className="et-muted">—</span>
                            )}
                          </td>
                          <td>
                            <span className="et-type-pill">{TEMPLATE_TYPE_LABELS[tpl.type]}</span>
                          </td>
                          <td>
                            <div className="et-updated">
                              <strong>{tpl.updatedBy}</strong>
                              <span>{formatDisplayDate(tpl.updatedAt)}</span>
                            </div>
                          </td>
                          <td>
                            <StatusDropdownCell
                              status={tpl.status || 'Active'}
                              onChange={(next) => toggleTemplateStatus(tpl, next)}
                            />
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: 12 }}>
                            {tpl.isSystem ? (
                              <AppMenu
                                align="end"
                                minWidth={170}
                                items={[
                                  {
                                    id: 'use',
                                    label: 'Use it',
                                    icon: <Copy size={15} />,
                                    onSelect: () => openUseIt(tpl),
                                  },
                                  {
                                    id: 'preview',
                                    label: 'Preview',
                                    icon: <Eye size={15} />,
                                    onSelect: () => openPreview(tpl),
                                  },
                                  {
                                    id: 'delete',
                                    label: 'Delete',
                                    icon: <Trash2 size={15} />,
                                    danger: true,
                                    onSelect: () => {
                                      setDeleteTemplateTarget(tpl);
                                      setDeleteTemplateOpen(true);
                                    },
                                  },
                                ]}
                                trigger={({ open, buttonProps }) => (
                                  <button
                                    type="button"
                                    className={`cm-row-action${open ? ' is-open' : ''}`}
                                    aria-label="Row actions"
                                    {...buttonProps}
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                )}
                              />
                            ) : (
                              <TableActionMenu
                                onEdit={() => openEditTemplate(tpl)}
                                onDelete={() => {
                                  setDeleteTemplateTarget(tpl);
                                  setDeleteTemplateOpen(true);
                                }}
                                extra={[
                                  {
                                    id: 'preview',
                                    label: 'Preview',
                                    icon: <Eye size={15} />,
                                    onSelect: () => openPreview(tpl),
                                  },
                                  {
                                    id: 'use',
                                    label: 'Use it',
                                    icon: <Copy size={15} />,
                                    onSelect: () => openUseIt(tpl),
                                  },
                                ]}
                              />
                            )}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                          No templates match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredTemplates.length > 0 ? (
                <div className="cm-pagination">
                  <span className="cm-page-info">
                    Showing {Math.min(filteredTemplates.length, (currentPage - 1) * pageSize + 1)} to{' '}
                    {Math.min(filteredTemplates.length, currentPage * pageSize)} of {filteredTemplates.length}{' '}
                    results
                  </span>
                  <div className="cm-page-btns">
                    <button
                      type="button"
                      className="cm-page-nav"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`cm-page-num${page === currentPage ? ' is-active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="cm-page-nav"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      ›
                    </button>
                  </div>
                  <div className="cm-page-size">
                    <AppSelect
                      value={String(pageSize)}
                      onChange={(val) => {
                        setPageSize(Number(val));
                        setCurrentPage(1);
                      }}
                      options={[
                        { label: '10 / page', value: '10' },
                        { label: '30 / page', value: '30' },
                        { label: '50 / page', value: '50' },
                      ]}
                      align="end"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="automation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {automations.length === 0 ? (
              <div className="et-empty">
                <div className="et-empty-orb" aria-hidden>
                  <Mail size={28} />
                </div>
                <h3>No Data</h3>
                <p>Create your first fee reminder automation to send emails on invoice schedules.</p>
              </div>
            ) : (
              <>
                {latestAutomations.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        margin: 0,
                      }}
                    >
                      Latest Created Emails
                    </h3>
                    <div className="cm-cards-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                      <AnimatePresence>
                        {latestAutomations.map((item, idx) => (
                          <motion.article
                            key={item.id}
                            className="et-auto-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ delay: idx * 0.04 }}
                            whileHover={{ y: -3 }}
                          >
                            <div className="et-auto-top">
                              <div className="et-auto-identity">
                                <span className="et-auto-icon" aria-hidden>
                                  <Mail size={18} />
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <p className="et-auto-kicker">EMAIL</p>
                                  <button
                                    type="button"
                                    className="et-auto-title et-name-link"
                                    style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}
                                    onClick={() => openEditAutomation(item)}
                                  >
                                    {item.title}
                                  </button>
                                  <p className="et-auto-subject">{item.subject}</p>
                                </div>
                              </div>
                              <TableActionMenu
                                onEdit={() => openEditAutomation(item)}
                                onDelete={() => {
                                  setDeleteAutomationTarget(item);
                                  setDeleteAutomationOpen(true);
                                }}
                              />
                            </div>
                            <div className="et-auto-badges">
                              <span className="et-badge">
                                <Clock size={13} /> {whenBadgeLabel(item.when)}
                              </span>
                              <span className="et-badge">
                                <Calendar size={13} /> {generateForBadgeLabel(item.generateFor)}
                              </span>
                            </div>
                            <div className="et-auto-foot">
                              <StatusDropdownCell
                                status={item.status}
                                onChange={(next) => toggleAutomationStatus(item, next)}
                                align="right"
                              />
                            </div>
                          </motion.article>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 24,
                    borderTop: '2px dashed #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      All Emails{' '}
                      <span
                        style={{
                          background: '#eef2ff',
                          color: '#5d5fef',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          border: '1px solid #c7d2fe',
                        }}
                      >
                        {filteredAutomations.length} Total
                      </span>
                    </h2>
                    <div className="cm-search" style={{ minWidth: 220, minHeight: 'auto', height: 40 }}>
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search emails..."
                        value={autoSearch}
                        onChange={(e) => setAutoSearch(e.target.value)}
                      />
                      {autoSearch ? (
                        <button
                          type="button"
                          onClick={() => setAutoSearch('')}
                          style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                          aria-label="Clear search"
                        >
                          <X size={14} />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="cm-panel et-panel">
                    <div className="cm-table-wrap et-table-wrap">
                      <table className="cm-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Subject</th>
                            <th>When</th>
                            <th>Generate For</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right', paddingRight: 20 }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAutomations.length ? (
                            paginatedAutomations.map((item, idx) => (
                              <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                              >
                                <td>
                                  <button
                                    type="button"
                                    className="et-name-link"
                                    onClick={() => openEditAutomation(item)}
                                  >
                                    {item.title}
                                  </button>
                                </td>
                                <td>{item.subject}</td>
                                <td>
                                  <span className="et-badge">
                                    <Clock size={12} /> {whenBadgeLabel(item.when)}
                                  </span>
                                </td>
                                <td>
                                  <span className="et-badge">
                                    <Calendar size={12} /> {generateForBadgeLabel(item.generateFor)}
                                  </span>
                                </td>
                                <td>
                                  <StatusDropdownCell
                                    status={item.status}
                                    onChange={(next) => toggleAutomationStatus(item, next)}
                                  />
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: 12 }}>
                                  <TableActionMenu
                                    onEdit={() => openEditAutomation(item)}
                                    onDelete={() => {
                                      setDeleteAutomationTarget(item);
                                      setDeleteAutomationOpen(true);
                                    }}
                                  />
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                                No emails match your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {filteredAutomations.length > 0 ? (
                      <div className="cm-pagination">
                        <span className="cm-page-info">
                          Showing{' '}
                          {Math.min(filteredAutomations.length, (autoPage - 1) * autoPageSize + 1)} to{' '}
                          {Math.min(filteredAutomations.length, autoPage * autoPageSize)} of{' '}
                          {filteredAutomations.length} results
                        </span>
                        <div className="cm-page-btns">
                          <button
                            type="button"
                            className="cm-page-nav"
                            disabled={autoPage === 1}
                            onClick={() => setAutoPage((p) => Math.max(1, p - 1))}
                          >
                            ‹
                          </button>
                          {Array.from({ length: autoTotalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              type="button"
                              className={`cm-page-num${page === autoPage ? ' is-active' : ''}`}
                              onClick={() => setAutoPage(page)}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="cm-page-nav"
                            disabled={autoPage === autoTotalPages}
                            onClick={() => setAutoPage((p) => Math.min(autoTotalPages, p + 1))}
                          >
                            ›
                          </button>
                        </div>
                        <div className="cm-page-size">
                          <AppSelect
                            value={String(autoPageSize)}
                            onChange={(val) => {
                              setAutoPageSize(Number(val));
                              setAutoPage(1);
                            }}
                            options={[
                              { label: '10 / page', value: '10' },
                              { label: '30 / page', value: '30' },
                              { label: '50 / page', value: '50' },
                            ]}
                            align="end"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={deleteTemplateOpen}
        title="Delete Template"
        elevated
        onClose={() => !isSubmitting && setDeleteTemplateOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteTemplateOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDeleteTemplate} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, lineHeight: 1.55 }}>
          Delete template <strong>{deleteTemplateTarget?.name}</strong>? This cannot be undone.
        </p>
      </Modal>

      <Modal
        open={deleteAutomationOpen}
        title="Delete Automation"
        elevated
        onClose={() => !isSubmitting && setDeleteAutomationOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDeleteAutomationOpen(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-danger" onClick={confirmDeleteAutomation} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, lineHeight: 1.55 }}>
          Delete automation <strong>{deleteAutomationTarget?.title}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
