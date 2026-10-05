'use client';

import { FormEvent, useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { conversations as seedConversations, badgeClass } from '@/lib/moduleData';
import '@/components/ui/module.css';

type Conversation = (typeof seedConversations)[number];
type Message = { id: string; text: string; mine: boolean; time: string };

const initialThreads: Record<string, Message[]> = Object.fromEntries(seedConversations.map((item) => [item.id, [
  { id: `${item.id}-1`, text: item.preview, mine: false, time: item.time },
  { id: `${item.id}-2`, text: 'Thank you for checking in. We will share an update with you shortly.', mine: true, time: 'Now' },
]]));

export function MessagesPage() {
  const [conversations, setConversations] = useState(seedConversations);
  const [selectedId, setSelectedId] = useState(seedConversations[0]?.id ?? '');
  const [threads, setThreads] = useState(initialThreads);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', message: '' });
  const selected = conversations.find((item) => item.id === selectedId);
  const visible = useMemo(() => conversations.filter((item) => Object.values(item).join(' ').toLowerCase().includes(search.toLowerCase())), [conversations, search]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setConversations((items) => items.map((item) => item.id === id ? { ...item, unread: 0 } : item));
  };
  const send = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !selectedId) return;
    const message = { id: `m${Date.now()}`, text: draft.trim(), mine: true, time: 'Now' };
    setThreads((items) => ({ ...items, [selectedId]: [...(items[selectedId] ?? []), message] }));
    setConversations((items) => items.map((item) => item.id === selectedId ? { ...item, preview: draft.trim(), time: 'Now' } : item));
    setDraft('');
  };
  const createConversation = () => {
    if (!newForm.name.trim() || !newForm.message.trim()) return;
    const id = `c${Date.now()}`;
    const item: Conversation = { id, name: newForm.name, preview: newForm.message, time: 'Now', unread: 0 };
    setConversations((items) => [item, ...items]);
    setThreads((items) => ({ ...items, [id]: [{ id: `m${Date.now()}`, text: newForm.message, mine: true, time: 'Now' }] }));
    setSelectedId(id);
    setNewOpen(false);
  };
  const removeSelected = () => {
    setConversations((items) => {
      const next = items.filter((item) => item.id !== selectedId);
      setSelectedId(next[0]?.id ?? '');
      return next;
    });
    setDetailsOpen(false);
  };

  return (
    <div className="mod-page">
      <PageHeader title="Messages" description="Stay connected with parents and caregivers in one shared inbox." crumbs={['Panacea', 'Messages']} actions={<button className="ui-btn ui-btn-primary" type="button" onClick={() => { setNewForm({ name: '', message: '' }); setNewOpen(true); }}>+ New message</button>} />
      <StatCards stats={[
        { label: 'Conversations', value: conversations.length, icon: '💬', tone: 'lavender' },
        { label: 'Unread', value: conversations.reduce((sum, item) => sum + item.unread, 0), icon: '✉', tone: 'blush' },
        { label: 'Families reached', value: conversations.length, icon: '👪', tone: 'mint' },
        { label: 'Response rate', value: '98%', icon: '✓', tone: 'beige' },
      ]} />
      <div className="mod-chat-layout">
        <aside className="mod-chat-sidebar">
          <div className="ui-table-toolbar"><div className="ui-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." /></div></div>
          <div className="mod-list">
            {visible.length === 0 ? <EmptyState title="No conversations found" description="Try a different family name." /> : visible.map((item) => (
              <button key={item.id} type="button" className="mod-list-item" style={{ border: 0, width: '100%', textAlign: 'left', background: item.id === selectedId ? 'var(--color-lavender)' : 'transparent' }} onClick={() => selectConversation(item.id)}>
                <span className="mod-avatar">{item.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
                <span className="mod-list-body"><h3>{item.name}</h3><p>{item.preview}</p><span className="mod-meta"><small>{item.time}</small>{item.unread > 0 && <span className={badgeClass('Pending')}>{item.unread} unread</span>}</span></span>
              </button>
            ))}
          </div>
        </aside>
        <section className="mod-chat-thread">
          {selected ? <>
            <div className="mod-panel-head"><div><h2>{selected.name}</h2><small style={{ color: 'var(--text-secondary)' }}>Family conversation</small></div><div className="mod-actions"><button className="ui-btn ui-btn-outline" type="button" onClick={() => setDetailsOpen(true)}>View details</button></div></div>
            <div className="mod-chat-messages">{(threads[selectedId] ?? []).map((message) => <div key={message.id} className={`mod-bubble ${message.mine ? 'mine' : 'theirs'}`}>{message.text}<div style={{ marginTop: 5, fontSize: '0.72rem', opacity: 0.65 }}>{message.time}</div></div>)}</div>
            <form className="mod-chat-compose" onSubmit={send}><input className="ui-input" aria-label="Message" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message..." /><button className="ui-btn ui-btn-primary" type="submit">Send</button></form>
          </> : <EmptyState title="Select a conversation" description="Choose a family from the inbox or start a new message." action={<button className="ui-btn ui-btn-primary" type="button" onClick={() => setNewOpen(true)}>New message</button>} />}
        </section>
      </div>
      <Modal open={newOpen} title="New message" onClose={() => setNewOpen(false)} footer={<><button className="ui-btn ui-btn-outline" type="button" onClick={() => setNewOpen(false)}>Cancel</button><button className="ui-btn ui-btn-primary" type="button" onClick={createConversation}>Start conversation</button></>}>
        <div className="ui-field"><label className="ui-label">Recipient</label><input className="ui-input" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} /></div>
        <div className="ui-field"><label className="ui-label">Message</label><textarea className="ui-input" rows={4} value={newForm.message} onChange={(e) => setNewForm({ ...newForm, message: e.target.value })} /></div>
      </Modal>
      <Drawer open={detailsOpen} title="Conversation details" onClose={() => setDetailsOpen(false)} footer={<button className="ui-btn ui-btn-danger" type="button" onClick={removeSelected}>Remove conversation</button>}>
        {selected && <div className="mod-list"><div className="mod-toggle-row"><div><strong>Family contact</strong><p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{selected.name}</p></div></div><div className="mod-toggle-row"><div><strong>Last activity</strong><p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{selected.time}</p></div></div><div className="mod-toggle-row"><div><strong>Messages</strong><p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{threads[selectedId]?.length ?? 0} in this thread</p></div></div></div>}
      </Drawer>
    </div>
  );
}
