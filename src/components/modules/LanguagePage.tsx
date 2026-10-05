'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import { LanguagesPageHeader } from '@/components/modules/LanguagesPageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { EmptyState } from '@/components/ui/EmptyState';
import { badgeClass } from '@/lib/moduleData';
import '@/components/ui/module.css';

const languages = [
  ['English', 'English'], ['Hindi', 'हिन्दी'], ['Tamil', 'தமிழ்'], ['Telugu', 'తెలుగు'],
  ['Kannada', 'ಕನ್ನಡ'], ['Marathi', 'मराठी'], ['Bengali', 'বাংলা'], ['Gujarati', 'ગુજરાતી'],
  ['Malayalam', 'മലയാളം'], ['Punjabi', 'ਪੰਜਾਬੀ'], ['Urdu', 'اردو'], ['Odia', 'ଓଡ଼ିଆ'],
];

export function LanguagePage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('English');
  const [saved, setSaved] = useState('English');
  const filtered = languages.filter((x) => x.join(' ').toLowerCase().includes(search.toLowerCase()));
  return <div className="mod-page">
    <LanguagesPageHeader
      title="Language"
      description="Choose the preferred display language for your account."
      icon={<Languages size={22} strokeWidth={2.1} />}
      actions={
        <button className="ui-btn ui-btn-primary" onClick={() => setSaved(selected)}>
          {saved === selected ? '✓ Preference saved' : 'Save preference'}
        </button>
      }
    />
    <StatCards stats={[
      { label: 'Languages', value: languages.length, icon: '文', tone: 'lavender' },
      { label: 'Selected', value: selected, icon: '✓', tone: 'mint' },
      { label: 'Saved preference', value: saved, icon: '★', tone: 'beige' },
      { label: 'Regional options', value: languages.length - 1, icon: '◎', tone: 'blush' },
    ]} />
    <section className="mod-form-card"><h2>Display language</h2><p>This frontend preference updates locally for demonstration purposes.</p><div className="ui-search" style={{ marginBottom: 20 }}><span>⌕</span><input placeholder="Search languages..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {!filtered.length ? <EmptyState title="No languages found" description="Try a different search." action={<button className="ui-btn ui-btn-outline" onClick={() => setSearch('')}>Clear search</button>} /> : <div className="mod-lang-grid">{filtered.map(([name, native]) => <button key={name} className={`mod-lang-option ${selected === name ? 'is-active' : ''}`} onClick={() => setSelected(name)}><strong>{name} {selected === name && '✓'}</strong><span>{native}</span></button>)}</div>}
      <div className="mod-toggle-row" style={{ marginTop: 20 }}><div><strong>Current preference</strong><p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{saved} is saved for this session.</p></div><span className={badgeClass(saved === selected ? 'Active' : 'Pending')}>{saved === selected ? 'Saved' : 'Unsaved changes'}</span></div>
    </section>
  </div>;
}
