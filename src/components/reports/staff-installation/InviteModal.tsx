'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Mail,
  Underline,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { EmailTemplate, StaffInstallationRecord } from './types';
import { DEFAULT_EMAIL_TEMPLATE, TEMPLATE_VARIABLES } from './mockData';

type Props = {
  open: boolean;
  mode: 'send' | 'resend';
  record: StaffInstallationRecord | null;
  template: EmailTemplate;
  onClose: () => void;
  onSaveTemplate: (template: EmailTemplate) => void;
  onSend: (template: EmailTemplate) => void;
};

export function InviteModal({
  open,
  mode,
  record,
  template,
  onClose,
  onSaveTemplate,
  onSend,
}: Props) {
  const [draft, setDraft] = useState<EmailTemplate>(template);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(template);
  }, [open, template]);

  const preview = useMemo(() => {
    const map: Record<string, string> = {
      'Staff Name': record?.staffName ?? 'Staff Name',
      'Employee ID': record?.employeeId ?? 'Employee ID',
      Campus: record?.campus ?? 'Campus',
      Department: record?.department ?? 'Department',
      Designation: record?.designation ?? 'Designation',
      'Invitation Link': record?.inviteLink ?? 'https://app.panacea.school/staff-invite/…',
      'School Name': 'Panacea Childcare',
      'Current Date': 'August 5, 2026',
    };
    let subject = draft.subject;
    let body = draft.body;
    for (const [k, v] of Object.entries(map)) {
      const token = `{{${k}}}`;
      subject = subject.split(token).join(v);
      body = body.split(token).join(v);
    }
    return { subject, body };
  }, [draft, record]);

  const wrapSelection = (before: string, after = before) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = draft.body;
    const selected = value.slice(start, end) || 'text';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    setDraft((d) => ({ ...d, body: next }));
  };

  const insertVariable = (name: string) => {
    const token = `{{${name}}}`;
    const el = bodyRef.current;
    if (!el) {
      setDraft((d) => ({ ...d, body: `${d.body}${token}` }));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setDraft((d) => ({
      ...d,
      body: d.body.slice(0, start) + token + d.body.slice(end),
    }));
  };

  const title = mode === 'resend' ? 'Resend Invitation' : 'Send Invitation';

  return (
    <Modal
      open={open}
      title={title}
      subtitle="Standard staff invitation email — edit template and send."
      icon={<Mail size={18} />}
      xl
      autoHeight
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => setDraft(DEFAULT_EMAIL_TEMPLATE)}
          >
            Restore Default
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={() => onSaveTemplate(draft)}>
            Save Template
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => onSend(draft)}>
            Send Invitation
          </button>
        </>
      }
    >
      <motion.div
        className="pai-invite-layout"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
      >
        <div className="pai-invite-editor">
          {record ? (
            <p className="pai-invite-target">
              To: <strong>{record.staffName}</strong> · {record.email}
            </p>
          ) : null}

          <div className="ui-field">
            <label className="ui-label" htmlFor="sai-invite-subject">
              Subject
            </label>
            <input
              id="sai-invite-subject"
              className="ui-input"
              value={draft.subject}
              onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
            />
          </div>

          <div className="pai-rte-toolbar" role="toolbar" aria-label="Formatting">
            <button type="button" className="pai-icon-btn" aria-label="Bold" onClick={() => wrapSelection('**')}>
              <Bold size={15} />
            </button>
            <button type="button" className="pai-icon-btn" aria-label="Italic" onClick={() => wrapSelection('_')}>
              <Italic size={15} />
            </button>
            <button
              type="button"
              className="pai-icon-btn"
              aria-label="Underline"
              onClick={() => wrapSelection('<u>', '</u>')}
            >
              <Underline size={15} />
            </button>
            <button type="button" className="pai-icon-btn" aria-label="Bullet list" onClick={() => wrapSelection('\n- ', '')}>
              <List size={15} />
            </button>
            <button
              type="button"
              className="pai-icon-btn"
              aria-label="Numbered list"
              onClick={() => wrapSelection('\n1. ', '')}
            >
              <ListOrdered size={15} />
            </button>
            <button type="button" className="pai-icon-btn" aria-label="Align left" onClick={() => wrapSelection('\n', '')}>
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              className="pai-icon-btn"
              aria-label="Align center"
              onClick={() => wrapSelection('\n[center]', '[/center]\n')}
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              className="pai-icon-btn"
              aria-label="Align right"
              onClick={() => wrapSelection('\n[right]', '[/right]\n')}
            >
              <AlignRight size={15} />
            </button>
            <button
              type="button"
              className="pai-icon-btn"
              aria-label="Insert link"
              onClick={() => wrapSelection('[', '](https://)')}
            >
              <Link2 size={15} />
            </button>
            <label className="pai-var-select">
              <span className="sr-only">Insert Variables</span>
              <select
                className="ui-select"
                defaultValue=""
                aria-label="Insert Variables"
                onChange={(e) => {
                  if (e.target.value) insertVariable(e.target.value);
                  e.target.value = '';
                }}
              >
                <option value="" disabled>
                  Insert Variables
                </option>
                {TEMPLATE_VARIABLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="sai-invite-body">
              Body
            </label>
            <textarea
              id="sai-invite-body"
              ref={bodyRef}
              className="ui-textarea pai-tpl-body"
              rows={12}
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            />
          </div>
        </div>

        <aside className="pai-invite-preview">
          <h4>Live Preview</h4>
          <div className="pai-email-frame pai-email-frame-desktop">
            <div className="pai-email-frame-chrome">
              <span />
              <span />
              <span />
            </div>
            <div className="pai-email-frame-body">
              <p className="pai-email-from">From: invites@panacea.school</p>
              <h5>{preview.subject}</h5>
              <pre>{preview.body}</pre>
            </div>
          </div>
        </aside>
      </motion.div>
    </Modal>
  );
}
