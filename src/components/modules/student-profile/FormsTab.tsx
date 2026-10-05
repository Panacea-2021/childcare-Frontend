'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, MoreHorizontal, RefreshCw, Share2, Trash2 } from 'lucide-react';
import type { FormShareStatus, SharedForm } from '@/lib/students/profileTypes';
import { formatDisplayDate } from '@/lib/students/profileStore';
import { btnMotion, tableMotion } from './animations';

type Props = {
  forms: SharedForm[];
  onShare: () => void;
  onResend: (form: SharedForm) => void;
  onRemove: (form: SharedForm) => void;
};

const STATUS_CLASS: Record<FormShareStatus, string> = {
  Shared: 'sky',
  Pending: 'amber',
  Completed: 'mint',
  Expired: 'coral',
};

function openSharedForm(form: SharedForm, router: ReturnType<typeof useRouter>) {
  if (form.sourceFormId) {
    router.push(`/forms/fill/${encodeURIComponent(form.sourceFormId)}`);
    return;
  }
  router.push(`/forms?q=${encodeURIComponent(form.formName)}`);
}

export function FormsTab({ forms, onShare, onResend, onRemove }: Props) {
  const router = useRouter();
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setMenuFor(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className="sp-panel">
      <div className="sp-panel-toolbar">
        <div>
          <h3 className="sp-panel-title">Shared Forms</h3>
          <p className="sp-panel-sub">Forms shared with this student and their current status</p>
        </div>
        <motion.button type="button" className="ui-btn ui-btn-primary" onClick={onShare} {...btnMotion}>
          <Share2 size={15} /> Share Form
        </motion.button>
      </div>

      {forms.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-art" aria-hidden>
            <Share2 size={34} />
          </div>
          <h4>No forms shared yet</h4>
          <p>Share an admission, medical, or consent form with this student.</p>
          <motion.button type="button" className="ui-btn ui-btn-primary" onClick={onShare} {...btnMotion}>
            <Share2 size={15} /> Share Form
          </motion.button>
        </div>
      ) : (
        <motion.div className="sp-table-wrap" {...tableMotion}>
          <table className="ui-table sp-table">
            <thead>
              <tr>
                <th>Form Name</th>
                <th>Shared Date</th>
                <th>Shared By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr
                  key={form.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openSharedForm(form, router)}
                >
                  <td>
                    <strong>{form.formName}</strong>
                  </td>
                  <td>{formatDisplayDate(form.sharedDate)}</td>
                  <td>{form.sharedBy}</td>
                  <td>
                    <span className={`sp-status-pill ${STATUS_CLASS[form.status]}`}>
                      {form.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="sp-inline-actions">
                      <button
                        type="button"
                        className="tm-icon-btn"
                        data-tip="View"
                        aria-label="View"
                        onClick={() => openSharedForm(form, router)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="tm-icon-btn"
                        data-tip="Resend"
                        aria-label="Resend"
                        onClick={() => onResend(form)}
                      >
                        <RefreshCw size={15} />
                      </button>
                      <div className="sp-more-wrap">
                        <button
                          type="button"
                          className="tm-icon-btn"
                          data-tip="More"
                          aria-label="More"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuFor((id) => (id === form.id ? null : form.id));
                          }}
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        <AnimatePresence>
                          {menuFor === form.id ? (
                            <motion.div
                              className="sp-more-menu"
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                            >
                              <button type="button" onClick={() => onResend(form)}>
                                <RefreshCw size={14} /> Resend
                              </button>
                              <button
                                type="button"
                                className="is-danger"
                                onClick={() => onRemove(form)}
                              >
                                <Trash2 size={14} /> Remove
                              </button>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
