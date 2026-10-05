'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarCheck,
  CheckSquare,
  ClipboardList,
  FilePlus2,
  FileText,
  GraduationCap,
  Handshake,
  Hourglass,
  MessageSquare,
  PartyPopper,
  Plus,
  Search,
  Sparkles,
  Star,
  UserPlus,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FORM_TEMPLATES } from './mockData';
import type { Audience, FormTemplate, StartingPoint } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    audience: Audience;
    startingPoint: StartingPoint;
    template: FormTemplate | null;
  }) => void;
};

function TemplateIcon({ icon }: { icon: FormTemplate['icon'] }) {
  const common = { size: 20, strokeWidth: 1.75 } as const;
  switch (icon) {
    case 'rsvp':
      return <PartyPopper {...common} color="#d97706" />;
    case 'feedback':
      return <Star {...common} color="#eab308" />;
    case 'volunteer':
      return <Handshake {...common} color="#0d9488" />;
    case 'attendance':
      return <CalendarCheck {...common} color="#2563eb" />;
    case 'incident':
      return <AlertTriangle {...common} color="#ea580c" />;
    case 'document':
      return <FileText {...common} color="#6366f1" />;
    case 'onboarding':
      return <UserPlus {...common} color="#0284c7" />;
    case 'staff-feedback':
      return <MessageSquare {...common} color="#7c3aed" />;
    case 'training':
      return <GraduationCap {...common} color="#4f46e5" />;
    case 'checklist':
      return <CheckSquare {...common} color="#059669" />;
    case 'registration':
      return <ClipboardList {...common} color="#2563eb" />;
    case 'waitlist':
      return <Hourglass {...common} color="#ca8a04" />;
    default:
      return <FileText {...common} />;
  }
}

export function CreateFormModal({ open, onClose, onCreate }: Props) {
  const [audience, setAudience] = useState<Audience>('Student');
  const [startingPoint, setStartingPoint] = useState<StartingPoint>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [tplSearch, setTplSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setAudience('Student');
    setStartingPoint(null);
    setTemplateId(null);
    setTplSearch('');
  }, [open]);

  const templates = useMemo(() => {
    const q = tplSearch.trim().toLowerCase();
    return FORM_TEMPLATES.filter((t) => {
      if (t.audience !== audience) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    });
  }, [audience, tplSearch]);

  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;
  const canCreate = Boolean(startingPoint) || Boolean(selectedTemplate);

  return (
    <Modal
      open={open}
      title="Create a New Form"
      subtitle="Choose an audience, starting point, or template"
      icon={<FilePlus2 size={18} />}
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
            className="ui-btn ui-btn-primary"
            disabled={!canCreate}
            onClick={() =>
              onCreate({
                audience,
                startingPoint,
                template: selectedTemplate,
              })
            }
          >
            Create Form
          </button>
        </>
      }
    >
      <div className="cfm-body">
        <motion.section
          className="cfm-section-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <header className="cfm-section-head">
            <span className="cfm-section-ico" aria-hidden>
              <ClipboardList size={15} />
            </span>
            <h3>Audience</h3>
          </header>
          <div className="cfm-pills" role="radiogroup" aria-label="Audience">
            {(['Student', 'Staff', 'Enquiry'] as Audience[]).map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={audience === a}
                className={`cfm-pill ${audience === a ? 'is-active' : ''}`}
                onClick={() => {
                  setAudience(a);
                  setTemplateId(null);
                  setStartingPoint(null);
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="cfm-section-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
        >
          <header className="cfm-section-head">
            <span className="cfm-section-ico" aria-hidden>
              <Plus size={15} />
            </span>
            <h3>Starting point</h3>
          </header>
          <div className="cfm-starts">
            <button
              type="button"
              className={`cfm-start ${startingPoint === 'scratch' ? 'is-active' : ''}`}
              onClick={() => {
                setStartingPoint('scratch');
                setTemplateId(null);
              }}
            >
              <span className="cfm-start-icon">
                <Plus size={18} />
              </span>
              Start from scratch
            </button>
            <button
              type="button"
              className={`cfm-start ${startingPoint === 'pdf' ? 'is-active' : ''}`}
              onClick={() => {
                setStartingPoint('pdf');
                setTemplateId(null);
              }}
            >
              <span className="cfm-start-icon">
                <FileText size={18} />
              </span>
              Fillable PDF form
            </button>
            <button
              type="button"
              className={`cfm-start ${startingPoint === 'ai' ? 'is-active is-ai' : ''}`}
              onClick={() => {
                setStartingPoint('ai');
                setTemplateId(null);
              }}
            >
              <span className="cfm-start-icon cfm-ai">
                <Sparkles size={16} />
              </span>
              AI Form Creator
            </button>
          </div>
        </motion.section>

        <motion.section
          className="cfm-section-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.28 }}
        >
          <header className="cfm-section-head cfm-tpl-head">
            <div className="cfm-section-head-left">
              <span className="cfm-section-ico" aria-hidden>
                <Sparkles size={15} />
              </span>
              <h3>Or choose a template</h3>
            </div>
            <label className="cfm-tpl-search">
              <Search size={14} aria-hidden />
              <input
                value={tplSearch}
                onChange={(e) => setTplSearch(e.target.value)}
                placeholder="Search"
                aria-label="Search templates"
              />
            </label>
          </header>
          <div className="cfm-tpl-grid">
            {templates.length === 0 ? (
              <p className="cfm-tpl-empty">No templates match your search.</p>
            ) : (
              templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  className={`cfm-tpl ${templateId === tpl.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setTemplateId(tpl.id);
                    setStartingPoint(null);
                  }}
                >
                  <span className="cfm-tpl-icon" aria-hidden>
                    <TemplateIcon icon={tpl.icon} />
                  </span>
                  <span className="cfm-tpl-text">
                    <strong>{tpl.title}</strong>
                    <span>{tpl.description}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </Modal>
  );
}
