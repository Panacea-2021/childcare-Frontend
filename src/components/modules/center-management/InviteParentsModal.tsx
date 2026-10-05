'use client';

import { useEffect, useState } from 'react';
import { Check, Mail, Send, UserRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { StudentParent } from '@/lib/center-management/types';

type Props = {
  open: boolean;
  parents: StudentParent[];
  onClose: () => void;
  onSend: (parentIds: string[]) => void;
};

export function InviteParentsModal({ open, parents, onClose, onSend }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelected(parents.map((p) => p.id));
  }, [open, parents]);

  return (
    <Modal
      open={open}
      title="Send Parent Invite"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!selected.length}
            onClick={() => onSend(selected)}
          >
            <Send size={15} /> Send
          </button>
        </>
      }
    >
      <div className="cm-invite-list">
        {parents.length ? (
          parents.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`cm-invite-card${on ? ' is-selected' : ''}`}
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                  )
                }
              >
                <span className="cm-invite-avatar">
                  <UserRound size={18} />
                </span>
                <span className="cm-invite-meta">
                  <strong>
                    {p.name} <em>({p.role})</em>
                  </strong>
                  <span>
                    <Mail size={13} /> {p.email || 'No email on file'}
                  </span>
                </span>
                <span className={`cm-invite-check${on ? ' is-on' : ''}`}>
                  {on ? <Check size={14} /> : null}
                </span>
              </button>
            );
          })
        ) : (
          <p className="cm-muted" style={{ margin: 0 }}>
            No parents available to invite.
          </p>
        )}
      </div>
    </Modal>
  );
}
