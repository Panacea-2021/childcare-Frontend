'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Mail } from 'lucide-react';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import styles from './SettingsEmailTemplatesSection.module.css';

type Category =
  | 'Invoice'
  | 'Birthday'
  | 'Assessment'
  | 'Enquiry'
  | 'Student Forms'
  | 'Staff Forms';

type Audience = 'student' | 'staff';

type EmailTemplate = {
  id: string;
  title: string;
  category: Category;
  audience: Audience;
  trigger: string;
  tags: string[];
  tagNote?: string;
  subject: string;
  body: string;
  instructions: string;
};

type ToastState = { type: 'ok' | 'err'; message: string } | null;

const CATEGORY_CLASS: Record<Category, string> = {
  Invoice: 'tagInvoice',
  Birthday: 'tagBirthday',
  Assessment: 'tagAssessment',
  Enquiry: 'tagEnquiry',
  'Student Forms': 'tagStudentForms',
  'Staff Forms': 'tagStaffForms',
};

const SEED: EmailTemplate[] = [
  {
    id: 'feeReminderEmail',
    title: 'Fee reminder email',
    category: 'Invoice',
    audience: 'student',
    trigger: 'Sent automatically when a student has an outstanding fee payment approaching or past the due date.',
    tags: ['{{schoolName}}', '{{studentName}}', '{{invoiceNumber}}', '{{dueDate}}', '{{pendingAmount}}', '{{lateFee}}'],
    tagNote: 'NOTE: lateFee is optional and only used if you have configured late fee in your school.',
    instructions: 'Make sure you use each of these tags in your email.',
    subject: 'Gentle reminder of Fee by {{schoolName}} of amount {{pendingAmount}} for {{studentName}}',
    body: `Dear Parent,

This is a gentle reminder regarding the fee payment of {{studentName}} which is due on {{dueDate}} for Invoice No: {{invoiceNumber}}.

We request you pay outstanding fees on time.
The total due amount is {{pendingAmount}}.

Thank you for your co-operation.
Best Regards,
{{schoolName}}`,
  },
  {
    id: 'studentBirthdayEmail',
    title: 'Student birthday email',
    category: 'Birthday',
    audience: 'student',
    trigger: 'Sent on the student’s birthday to parents.',
    tags: ['{{schoolName}}', '{{studentName}}', '{{androidAppUrl}}', '{{iosAppUrl}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Birthday wishes from {{schoolName}}',
    body: `Dear Parent,

Wishing {{studentName}} a very happy birthday from all of us at {{schoolName}}!

Best Regards,
{{schoolName}}`,
  },
  {
    id: 'receiptEmail',
    title: 'Receipt email',
    category: 'Invoice',
    audience: 'student',
    trigger: 'Sent when a fee payment receipt is generated.',
    tags: [
      '{{schoolName}}',
      '{{studentName}}',
      '{{dueDate}}',
      '{{invoiceNumber}}',
      '{{openingAmount}}',
      '{{paidAmount}}',
      '{{currency}}',
      '{{replyTo}}',
      '{{androidAppUrl}}',
      '{{iosAppUrl}}',
    ],
    instructions: 'You can use these tags in your email.',
    subject: 'Successful payment received by {{schoolName}} for {{studentName}}!',
    body: `Dear Parent,

Please find your attached payment receipt. You can also find it inside Illumine. Click here or install the app below for payment history.
{{androidAppUrl}} {{iosAppUrl}}

Thanks
{{schoolName}}`,
  },
  {
    id: 'invoiceEmail',
    title: 'Invoice email',
    category: 'Invoice',
    audience: 'student',
    trigger: 'Sent when a new invoice is created for a student.',
    tags: ['{{schoolName}}', '{{studentName}}', '{{invoiceNumber}}', '{{dueDate}}', '{{pendingAmount}}', '{{replyTo}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Invoice from {{schoolName}} for {{studentName}}',
    body: `Dear Parent,

Please find the invoice for {{studentName}}. Invoice No: {{invoiceNumber}}. Amount due: {{pendingAmount}} by {{dueDate}}.

Thanks
{{schoolName}}`,
  },
  {
    id: 'debitReceiptEmail',
    title: 'Debit receipt email',
    category: 'Invoice',
    audience: 'student',
    trigger: 'Sent when a debit note payment receipt is generated.',
    tags: ['{{schoolName}}', '{{studentName}}', '{{androidAppUrl}}', '{{iosAppUrl}}', '{{replyTo}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Debit receipt from {{schoolName}} for {{studentName}}',
    body: `Dear Parent,

Please find your attached debit receipt.

Thanks
{{schoolName}}`,
  },
  {
    id: 'debitInvoiceEmail',
    title: 'Debit invoice email',
    category: 'Invoice',
    audience: 'student',
    trigger: 'Sent when a debit note/invoice is issued.',
    tags: ['{{schoolName}}', '{{studentName}}', '{{androidAppUrl}}', '{{iosAppUrl}}', '{{replyTo}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Debit note from {{schoolName}} for {{studentName}}',
    body: `Dear Parent,

We hope this email finds you well.
Please find your attached debit note. We appreciate your prompt attention to this matter. You can view the debit note details in Illumine also.
{{androidAppUrl}} {{iosAppUrl}}

Thanks
{{schoolName}}

This is a system-generated email. For assistance, please contact at {{replyTo}}`,
  },
  {
    id: 'assessmentEmail',
    title: 'Assessment email',
    category: 'Assessment',
    audience: 'student',
    trigger: 'Sent when an assessment report is shared with parents.',
    tags: ['{{studentName}}', '{{parentOneName}}', '{{parentTwoName}}', '{{senderName}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Assessment update for {{studentName}} from {{schoolName}}',
    body: '',
  },
  {
    id: 'assessmentMessageEmail',
    title: 'Assessment message',
    category: 'Assessment',
    audience: 'student',
    trigger: 'Sent when an assessment message is shared with parents.',
    tags: ['{{studentName}}', '{{parentOneName}}', '{{parentTwoName}}', '{{senderName}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: '',
    body: '',
  },
  {
    id: 'learningJourneyEmail',
    title: 'Learning journey email',
    category: 'Assessment',
    audience: 'student',
    trigger: 'Sent when a learning journey report is shared.',
    tags: ['{{studentName}}', '{{parentOneName}}', '{{parentTwoName}}', '{{senderName}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Learning journey update for {{studentName}}',
    body: '',
  },
  {
    id: 'learningJourneyMessage',
    title: 'Learning journey message',
    category: 'Assessment',
    audience: 'student',
    trigger: 'Sent when a learning journey message is shared.',
    tags: ['{{studentName}}', '{{parentOneName}}', '{{parentTwoName}}', '{{senderName}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: '',
    body: '',
  },
  {
    id: 'enquiryApplicationEmail',
    title: 'Enquiry application email',
    category: 'Enquiry',
    audience: 'student',
    trigger: 'Sent when an enquiry application form is submitted or shared.',
    tags: [
      '{{studentName}}',
      '{{parentOneName}}',
      '{{parentTwoName}}',
      '{{shortFormLink}}',
      '{{schoolName}}',
      '{{androidAppUrl}}',
      '{{iosAppUrl}}',
    ],
    instructions: 'You can use these tags in your email.',
    subject: 'Enquiry application from {{schoolName}}',
    body: '',
  },
  {
    id: 'studentApplicationEmail',
    title: 'Student Application email',
    category: 'Student Forms',
    audience: 'student',
    trigger: 'Sent when a student application form link is shared with parents.',
    tags: [
      '{{studentName}}',
      '{{parentOneName}}',
      '{{parentTwoName}}',
      '{{shortFormLink}}',
      '{{schoolName}}',
      '{{androidAppUrl}}',
      '{{iosAppUrl}}',
    ],
    instructions: 'You can use these tags in your email.',
    subject: 'Student application from {{schoolName}}',
    body: '',
  },
  {
    id: 'enquiryApplicationReminderEmail',
    title: 'Enquiry application reminder email',
    category: 'Enquiry',
    audience: 'student',
    trigger: 'Sent as a reminder to complete an enquiry application.',
    tags: ['{{studentName}}', '{{parentOneName}}', '{{shortFormLink}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Reminder: Enquiry application from {{schoolName}}',
    body: '',
  },
  {
    id: 'studentApplicationReminderEmail',
    title: 'Student Application reminder email',
    category: 'Student Forms',
    audience: 'student',
    trigger: 'Sent as a reminder to complete a student application form.',
    tags: ['{{studentName}}', '{{parentOneName}}', '{{shortFormLink}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Reminder: Student application from {{schoolName}}',
    body: '',
  },
  {
    id: 'staffBirthdayEmail',
    title: 'Staff birthday email',
    category: 'Birthday',
    audience: 'staff',
    trigger: 'Sent on a staff member’s birthday.',
    tags: ['{{schoolName}}', '{{staffName}}', '{{androidAppUrl}}', '{{iosAppUrl}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Birthday wishes from {{schoolName}}',
    body: '',
  },
  {
    id: 'staffApplicationEmail',
    title: 'Staff application email',
    category: 'Staff Forms',
    audience: 'staff',
    trigger: 'Sent when a staff application form is shared.',
    tags: ['{{staffName}}', '{{shortFormLink}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Staff application from {{schoolName}}',
    body: '',
  },
  {
    id: 'staffApplicationReminderEmail',
    title: 'Staff application reminder email',
    category: 'Staff Forms',
    audience: 'staff',
    trigger: 'Sent as a reminder to complete a staff application form.',
    tags: ['{{staffName}}', '{{shortFormLink}}', '{{schoolName}}'],
    instructions: 'You can use these tags in your email.',
    subject: 'Reminder: Staff application from {{schoolName}}',
    body: '',
  },
];

const TOOLBAR = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'List', 'Bold', 'Italic', 'Underline'] as const;

function insertAtCursor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insert: string,
) {
  const next = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
  const caret = selectionStart + insert.length;
  return { next, caret };
}

function wrapSelection(value: string, start: number, end: number, before: string, after: string) {
  const selected = value.slice(start, end) || 'text';
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  return { next, caret: start + before.length + selected.length + after.length };
}

export function SettingsEmailTemplatesSection() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(SEED);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [focusField, setFocusField] = useState<'subject' | 'body'>('body');
  const [toast, setToast] = useState<ToastState>(null);

  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const selected = templates.find((t) => t.id === selectedId) ?? null;
  const defaults = SEED.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter(
      (t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [templates, query]);

  const studentTemplates = filtered.filter((t) => t.audience === 'student');
  const staffTemplates = filtered.filter((t) => t.audience === 'staff');

  const openEditor = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSelectedId(id);
    setSubject(t.subject);
    setBody(t.body);
    setTriggerOpen(false);
    setFocusField('body');
  };

  const closeEditor = () => {
    setSelectedId(null);
    setTriggerOpen(false);
  };

  const insertTag = (tag: string) => {
    if (focusField === 'subject' && subjectRef.current) {
      const el = subjectRef.current;
      const start = el.selectionStart ?? subject.length;
      const end = el.selectionEnd ?? subject.length;
      const { next, caret } = insertAtCursor(subject, start, end, tag);
      setSubject(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(caret, caret);
      });
      return;
    }
    if (bodyRef.current) {
      const el = bodyRef.current;
      const start = el.selectionStart ?? body.length;
      const end = el.selectionEnd ?? body.length;
      const { next, caret } = insertAtCursor(body, start, end, tag);
      setBody(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(caret, caret);
      });
    }
  };

  const applyFormat = (action: (typeof TOOLBAR)[number]) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    let result = { next: body, caret: end };
    switch (action) {
      case 'Bold':
        result = wrapSelection(body, start, end, '**', '**');
        break;
      case 'Italic':
        result = wrapSelection(body, start, end, '_', '_');
        break;
      case 'Underline':
        result = wrapSelection(body, start, end, '<u>', '</u>');
        break;
      case 'Blockquote':
        result = wrapSelection(body, start, end, '> ', '');
        break;
      case 'List':
        result = wrapSelection(body, start, end, '- ', '');
        break;
      default: {
        const level = action.replace('H', '');
        result = wrapSelection(body, start, end, `<h${level}>`, `</h${level}>`);
      }
    }
    setBody(result.next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.caret, result.caret);
    });
  };

  const insertEmoji = () => {
    insertTag(' 🙂');
    setFocusField('body');
  };

  const restoreDefault = () => {
    if (!defaults) return;
    setSubject(defaults.subject);
    setBody(defaults.body);
    setToast({ type: 'ok', message: 'Default email restored' });
  };

  const save = () => {
    if (!selectedId) return;
    setTemplates((list) =>
      list.map((t) => (t.id === selectedId ? { ...t, subject, body } : t)),
    );
    setToast({ type: 'ok', message: 'Saved' });
  };

  if (selected) {
    return (
      <div className={styles.root}>
        <section className={styles.editorCard}>
          <div className={styles.editorHeader}>
            <h1 className={styles.editorTitle}>{selected.title}</h1>
            <button type="button" className={`ui-btn ui-btn-outline ${styles.topCancel}`} onClick={closeEditor}>
              Cancel
            </button>
          </div>

          <button
            type="button"
            className={styles.triggerToggle}
            onClick={() => setTriggerOpen((v) => !v)}
            aria-expanded={triggerOpen}
          >
            <span className={`${styles.triggerChevron} ${triggerOpen ? styles.triggerOpen : ''}`} aria-hidden>
              ›
            </span>
            When does this email gets triggered?
          </button>
          {triggerOpen ? <p className={styles.triggerBody}>{selected.trigger}</p> : null}

          <div className={styles.divider} aria-hidden>
            <span />
          </div>

          <div className={styles.instructions}>
            <h2 className={styles.instructionsTitle}>Instructions :</h2>
            <p className={styles.instructionsHint}>{selected.instructions}</p>
            <div className={styles.tagRow}>
              {selected.tags.map((tag) => (
                <button key={tag} type="button" className={styles.tag} onClick={() => insertTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
            {selected.tagNote ? <p className={styles.tagNote}>{selected.tagNote}</p> : null}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="email-subject">
              Email Subject:
            </label>
            <input
              id="email-subject"
              ref={subjectRef}
              className={`ui-input ${styles.subjectInput}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={() => setFocusField('subject')}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="email-body">
              Email Body:
            </label>
            <p className={styles.bodyNote}>
              Note : Please type your custom email body below to replace the default email content. If you prefer to
              use the default email, you can leave this field empty.
            </p>
            <div className={styles.editorShell}>
              <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
                {TOOLBAR.map((item) => (
                  <button key={item} type="button" className={styles.toolBtn} onClick={() => applyFormat(item)}>
                    {item}
                  </button>
                ))}
                <button type="button" className={styles.toolBtn} onClick={insertEmoji} aria-label="Insert emoji">
                  🙂
                </button>
              </div>
              <textarea
                id="email-body"
                ref={bodyRef}
                className={styles.bodyArea}
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onFocus={() => setFocusField('body')}
              />
              <div className={styles.restoreRow}>
                <button type="button" className={styles.restoreBtn} onClick={restoreDefault}>
                  RESTORE DEFAULT EMAIL
                </button>
              </div>
            </div>
          </div>

          <div className={styles.footerActions}>
            <button type="button" className="ui-btn ui-btn-outline" onClick={closeEditor}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={save}>
              Save
            </button>
          </div>
        </section>

        {toast ? (
          <div className={styles.toast} role="status">
            <span className={styles.toastOk} aria-hidden>
              ✓
            </span>
            <span>{toast.message}</span>
            <button type="button" className={styles.toastClose} onClick={() => setToast(null)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Email Templates"
      description="Customize system emails for students and staff."
      icon={<Mail />}
    >
    <div className={styles.root}>
      <div className={styles.listHeader}>
        <div className={styles.searchWrap}>
          <input
            className={`ui-input ${styles.search}`}
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search email templates"
          />
          <span className={styles.searchIcon} aria-hidden>
            ⌕
          </span>
        </div>
      </div>

      {studentTemplates.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Student Emails</h2>
          <div className={styles.grid}>
            {studentTemplates.map((t) => (
              <button key={t.id} type="button" className={styles.card} onClick={() => openEditor(t.id)}>
                <span className={styles.cardTitle}>{t.title}</span>
                <span className={`${styles.badge} ${styles[CATEGORY_CLASS[t.category]]}`}>{t.category}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {staffTemplates.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Staff Emails</h2>
          <div className={styles.grid}>
            {staffTemplates.map((t) => (
              <button key={t.id} type="button" className={styles.card} onClick={() => openEditor(t.id)}>
                <span className={styles.cardTitle}>{t.title}</span>
                <span className={`${styles.badge} ${styles[CATEGORY_CLASS[t.category]]}`}>{t.category}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {filtered.length === 0 ? <div className={styles.empty}>No templates match your search.</div> : null}

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={styles.toastOk} aria-hidden>
            ✓
          </span>
          <span>{toast.message}</span>
          <button type="button" className={styles.toastClose} onClick={() => setToast(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ) : null}
    </div>
    </SettingsSectionShell>
  );
}
