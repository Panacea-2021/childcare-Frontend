'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { getSession } from '@/lib/auth';
import { badgeClass } from '@/lib/moduleData';
import '@/components/ui/module.css';

export function ProfilePage() {
  const [tab, setTab] = useState('profile');
  const [identifier, setIdentifier] = useState('admin@panacea.care');
  const [profile, setProfile] = useState({ name: 'Center Administrator', email: 'admin@panacea.care', phone: '+91 98765 43210', role: 'Administrator' });
  const [saved, setSaved] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  useEffect(() => { const session = getSession(); if (session?.identifier) { setIdentifier(session.identifier); setProfile((p) => ({ ...p, email: session.identifier })); } }, []);
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2000); };

  return <div className="mod-page">
    <PageHeader title="My profile" description="Keep your personal details and account preferences current." crumbs={['Panacea', 'Profile']} actions={<button className="ui-btn ui-btn-primary" onClick={save}>{saved ? '✓ Saved' : 'Save profile'}</button>} />
    <section className="mod-profile-hero"><div className="mod-profile-avatar">{profile.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</div><div style={{ flex: 1 }}><h2>{profile.name}</h2><p>{profile.role} · {identifier}</p><div className="mod-meta"><span className={badgeClass('Active')}>Active account</span><span className="ui-badge">Joined Jan 2025</span></div></div><button className="ui-btn ui-btn-outline" onClick={() => setTab('profile')}>Edit profile</button></section>
    <StatCards stats={[
      { label: 'Centers managed', value: 1, icon: '🏫', tone: 'lavender' },
      { label: 'Team members', value: 4, icon: '👥', tone: 'mint' },
      { label: 'Actions this week', value: 28, icon: '↗', tone: 'beige' },
      { label: 'Profile complete', value: '92%', icon: '✓', tone: 'blush' },
    ]} />
    <Tabs tabs={[{ id: 'profile', label: 'Profile details' }, { id: 'security', label: 'Password & security' }, { id: 'activity', label: 'Activity' }]} active={tab} onChange={setTab} />
    {tab === 'profile' && <section className="mod-form-card"><h2>Edit profile</h2><p>These details identify you to other center administrators.</p><div className="mod-grid-2"><div className="ui-field"><label className="ui-label">Full name</label><input className="ui-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div><div className="ui-field"><label className="ui-label">Role</label><input className="ui-input" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} /></div><div className="ui-field"><label className="ui-label">Email or account identifier</label><input className="ui-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div><div className="ui-field"><label className="ui-label">Phone</label><input className="ui-input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div></div><button className="ui-btn ui-btn-primary" onClick={save}>{saved ? '✓ Saved' : 'Save changes'}</button></section>}
    {tab === 'security' && <section className="mod-form-card"><h2>Password & security</h2><p>Update your password and review account safeguards.</p><div className="mod-toggle-row"><div><strong>Password</strong><p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Last changed 45 days ago</p></div><button className="ui-btn ui-btn-outline" onClick={() => { setPasswordModal(true); setPasswordSaved(false); }}>Change password</button></div><div className="mod-toggle-row"><div><strong>Two-factor authentication</strong><p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Extra protection for administrator access.</p></div><span className={badgeClass('Active')}>Enabled</span></div></section>}
    {tab === 'activity' && <section className="mod-panel"><div className="mod-panel-head"><h2>Recent activity</h2></div><div className="mod-list">{['Updated center settings', 'Generated Attendance Summary', 'Added a staff member', 'Reviewed a form submission'].map((x, i) => <div className="mod-list-item" key={x}><div className={`mod-avatar ${i % 2 ? 'mint' : 'lavender'}`}>✓</div><div className="mod-list-body"><h3>{x}</h3><p>{i + 1} day{i ? 's' : ''} ago · {identifier}</p></div></div>)}</div></section>}
    <Modal open={passwordModal} title={passwordSaved ? 'Password updated' : 'Change password'} onClose={() => setPasswordModal(false)} footer={passwordSaved ? <button className="ui-btn ui-btn-primary" onClick={() => setPasswordModal(false)}>Done</button> : <><button className="ui-btn ui-btn-outline" onClick={() => setPasswordModal(false)}>Cancel</button><button className="ui-btn ui-btn-primary" onClick={() => setPasswordSaved(true)}>Update password</button></>}>{passwordSaved ? <p>Your password change was confirmed in this UI preview.</p> : <><div className="ui-field"><label className="ui-label">Current password</label><input type="password" className="ui-input" /></div><div className="ui-field"><label className="ui-label">New password</label><input type="password" className="ui-input" /></div><div className="ui-field"><label className="ui-label">Confirm new password</label><input type="password" className="ui-input" /></div></>}</Modal>
  </div>;
}
