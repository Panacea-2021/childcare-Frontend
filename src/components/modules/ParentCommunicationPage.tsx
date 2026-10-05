'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { announcements as seedAnnouncements, dailyReports as seedReports, badgeClass } from '@/lib/moduleData';
import '@/components/ui/module.css';

const PAGE_SIZE = 5;
const seedNewsletters = [
  { id: 'nl1', title: 'July Family Newsletter', audience: 'All Families', date: '30 Jul 2026', status: 'Published' },
  { id: 'nl2', title: 'August Learning Preview', audience: 'All Families', date: '31 Jul 2026', status: 'Draft' },
];
type Communication = { id: string; title: string; audience: string; date: string; status: string };
type Report = (typeof seedReports)[number];

export function ParentCommunicationPage() {
  const [tab, setTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState<Communication[]>(seedAnnouncements);
  const [reports, setReports] = useState(seedReports);
  const [newsletters, setNewsletters] = useState<Communication[]>(seedNewsletters);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Communication | Report | null>(null);
  const [form, setForm] = useState({ title: '', audience: 'All Parents', status: 'Draft' });
  const rows = tab === 'announcements' ? announcements : tab === 'reports' ? reports : newsletters;
  const filtered = useMemo(() => rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase()) && (status === 'All' || ('status' in row && row.status === status))), [rows, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const save = () => {
    if (!form.title.trim()) return;
    const item = { id: `an${Date.now()}`, title: form.title, audience: form.audience, date: '31 Jul 2026', status: form.status };
    if (tab === 'newsletters') setNewsletters((items) => [item, ...items]);
    else setAnnouncements((items) => [item, ...items]);
    setModalOpen(false);
  };
  const remove = (id: string) => {
    if (tab === 'announcements') setAnnouncements((items) => items.filter((item) => item.id !== id));
    if (tab === 'reports') setReports((items) => items.filter((item) => item.id !== id));
    if (tab === 'newsletters') setNewsletters((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="mod-page">
      <PageHeader title="Parent Communication" description="Keep families informed with timely updates and daily reports." crumbs={['Panacea', 'Parent Communication']} actions={<button className="ui-btn ui-btn-primary" type="button" onClick={() => { setForm({ title: '', audience: 'All Parents', status: 'Draft' }); setModalOpen(true); }}>+ Compose</button>} />
      <StatCards stats={[
        { label: 'Published', value: [...announcements, ...newsletters].filter((item) => item.status === 'Published').length, icon: '📣', tone: 'mint' },
        { label: 'Drafts', value: [...announcements, ...newsletters].filter((item) => item.status === 'Draft').length, icon: '✎', tone: 'lavender' },
        { label: 'Daily reports', value: reports.length, icon: '📝', tone: 'beige' },
        { label: 'Family reach', value: '96%', icon: '💌', tone: 'blush' },
      ]} />
      <Tabs tabs={[{ id: 'announcements', label: 'Announcements' }, { id: 'reports', label: 'Daily Reports' }, { id: 'newsletters', label: 'Newsletters' }]} active={tab} onChange={(id) => { setTab(id); setStatus('All'); setSearch(''); setPage(1); }} />
      <div className="mod-panel">
        <div className="ui-table-toolbar">
          <div className="ui-search"><span>⌕</span><input placeholder={`Search ${tab}...`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          {tab !== 'reports' && <select className="ui-filter" value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Published</option><option>Draft</option></select>}
        </div>
        {pageRows.length === 0 ? <EmptyState title="No communications found" description="Adjust your filters or compose a new update." action={<button className="ui-btn ui-btn-primary" type="button" onClick={() => setModalOpen(true)}>Compose</button>} /> : <div className="mod-scroll"><table className="ui-table">
          <thead><tr>{tab === 'reports' ? <><th>Student</th><th>Mood</th><th>Meals</th><th>Naps</th><th>Notes</th></> : <><th>Title</th><th>Audience</th><th>Date</th><th>Status</th><th>Delivery</th></>}<th>Actions</th></tr></thead>
          <tbody>{pageRows.map((row) => <tr key={row.id}>
            {'student' in row ? <><td>{row.student}</td><td>{row.mood}</td><td>{row.meals}</td><td>{row.naps}</td><td>{row.notes}</td></> : <><td>{row.title}</td><td>{row.audience}</td><td>{row.date}</td><td><span className={badgeClass(row.status)}>{row.status}</span></td><td>{row.status === 'Published' ? 'Sent to families' : 'Not sent'}</td></>}
            <td><div className="mod-action-btns"><button className="mod-icon-btn" type="button" title="View" onClick={() => setSelected(row)}>👁</button><button className="mod-icon-btn danger" type="button" title="Remove" onClick={() => remove(row.id)}>✕</button></div></td>
          </tr>)}</tbody>
        </table></div>}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
      <Modal open={modalOpen} title={tab === 'newsletters' ? 'Create newsletter' : 'Compose announcement'} onClose={() => setModalOpen(false)} footer={<><button className="ui-btn ui-btn-outline" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="ui-btn ui-btn-primary" type="button" onClick={save}>Save</button></>}>
        <div className="ui-field"><label className="ui-label">Title</label><input className="ui-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="ui-field"><label className="ui-label">Audience</label><select className="ui-select" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}><option>All Parents</option><option>Pre-K Parents</option><option>Staff & Families</option></select></div>
        <div className="ui-field"><label className="ui-label">Publication</label><select className="ui-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Draft</option><option>Published</option></select></div>
      </Modal>
      <Drawer open={Boolean(selected)} title="Communication details" onClose={() => setSelected(null)}><div className="mod-list">{selected && Object.entries(selected).filter(([k]) => k !== 'id').map(([k, v]) => <div className="mod-toggle-row" key={k}><div><strong style={{ textTransform: 'capitalize' }}>{k}</strong><p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{v}</p></div></div>)}</div></Drawer>
    </div>
  );
}
