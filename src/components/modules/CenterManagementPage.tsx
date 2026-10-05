'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCards } from '@/components/ui/StatCards';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { rooms as seedRooms, staff as seedStaff, students as seedStudents, badgeClass } from '@/lib/moduleData';
import '@/components/ui/module.css';

const PAGE_SIZE = 5;

export function CenterManagementPage() {
  const [tab, setTab] = useState('rooms');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rooms, setRooms] = useState(seedRooms);
  const [staff, setStaff] = useState(seedStaff);
  const [students, setStudents] = useState(seedStudents);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string | number> | null>(null);
  const [form, setForm] = useState({
    name: '',
    secondary: '',
    tertiary: '',
    minAgeYrs: '0',
    minAgeMonths: '0',
    maxAgeYrs: '0',
    maxAgeMonths: '0',
  });

  const rows = tab === 'rooms' ? rooms : tab === 'staff' ? staff : students;

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const hay = Object.values(row).join(' ').toLowerCase();
      const matchesSearch = hay.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        ('status' in row && String(row.status).toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const emptyForm = {
    name: '',
    secondary: '',
    tertiary: '',
    minAgeYrs: '0',
    minAgeMonths: '0',
    maxAgeYrs: '0',
    maxAgeMonths: '0',
  };

  const openAdd = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const roomAgeLabel = () => {
    const minY = form.minAgeYrs || '0';
    const maxY = form.maxAgeYrs || '0';
    if (minY === '0' && maxY === '0') return 'All ages';
    return `${minY}–${maxY} yrs`;
  };

  const saveAdd = () => {
    if (!form.name.trim()) return;
    if (tab === 'rooms') {
      setRooms((prev) => [
        {
          id: `r${Date.now()}`,
          name: form.name,
          capacity: Number(form.secondary) || 10,
          ageGroup: roomAgeLabel(),
          teacher: 'Unassigned',
          status: 'Active',
        },
        ...prev,
      ]);
    } else if (tab === 'staff') {
      setStaff((prev) => [
        {
          id: `s${Date.now()}`,
          name: form.name,
          role: form.secondary || 'Teacher',
          email: form.tertiary || 'new@panacea.care',
          phone: '—',
          status: 'Active',
        },
        ...prev,
      ]);
    } else {
      setStudents((prev) => [
        {
          id: `st${Date.now()}`,
          name: form.name,
          room: form.secondary || 'Sunshine Room',
          age: form.tertiary || '—',
          parent: '—',
          status: 'Enrolled',
        },
        ...prev,
      ]);
    }
    setModalOpen(false);
    setPage(1);
  };

  const removeRow = (id: string) => {
    if (tab === 'rooms') setRooms((p) => p.filter((r) => r.id !== id));
    if (tab === 'staff') setStaff((p) => p.filter((r) => r.id !== id));
    if (tab === 'students') setStudents((p) => p.filter((r) => r.id !== id));
  };

  return (
    <div className="mod-page">
      <PageHeader
        title="Center Management"
        description="Manage rooms, staff, and students across your childcare center."
        crumbs={['Panacea', 'Center Management']}
        actions={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setDrawerOpen(true)}>
              Quick view
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
              + Add {tab === 'rooms' ? 'room' : tab === 'staff' ? 'staff' : 'student'}
            </button>
          </>
        }
      />

      <StatCards
        stats={[
          { label: 'Rooms', value: rooms.length, icon: '📘', tone: 'lavender' },
          { label: 'Staff', value: staff.length, icon: '👥', tone: 'mint' },
          { label: 'Students', value: students.length, icon: '🧒', tone: 'beige' },
          { label: 'Waitlist', value: students.filter((s) => s.status === 'Waitlist').length, icon: '⏳', tone: 'blush' },
        ]}
      />

      <Tabs
        tabs={[
          { id: 'rooms', label: 'Rooms' },
          { id: 'staff', label: 'Staff' },
          { id: 'students', label: 'Students' },
        ]}
        active={tab}
        onChange={(id) => {
          setTab(id);
          setPage(1);
          setSearch('');
          setStatusFilter('all');
        }}
      />

      <div className="mod-panel">
        <div className="ui-table-toolbar">
          <div className="ui-search">
            <span>⌕</span>
            <input
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="ui-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {tab === 'rooms' && (
              <>
                <option value="Active">Active</option>
                <option value="Full">Full</option>
              </>
            )}
            {tab === 'staff' && (
              <>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
              </>
            )}
            {tab === 'students' && (
              <>
                <option value="Enrolled">Enrolled</option>
                <option value="Waitlist">Waitlist</option>
              </>
            )}
          </select>
        </div>

        {pageRows.length === 0 ? (
          <EmptyState
            title="No records found"
            description="Try adjusting your search or filters."
            action={
              <button type="button" className="ui-btn ui-btn-primary" onClick={openAdd}>
                Add new
              </button>
            }
          />
        ) : (
          <div className="mod-scroll">
            <table className="ui-table">
              <thead>
                {tab === 'rooms' && (
                  <tr>
                    <th>Room</th>
                    <th>Age group</th>
                    <th>Capacity</th>
                    <th>Teacher</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                )}
                {tab === 'staff' && (
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                )}
                {tab === 'students' && (
                  <tr>
                    <th>Student</th>
                    <th>Room</th>
                    <th>Age</th>
                    <th>Parent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {tab === 'rooms' &&
                  (pageRows as typeof rooms).map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.ageGroup}</td>
                      <td>{r.capacity}</td>
                      <td>{r.teacher}</td>
                      <td>
                        <span className={badgeClass(r.status)}>{r.status}</span>
                      </td>
                      <td>
                        <div className="mod-action-btns">
                          <button
                            type="button"
                            className="mod-icon-btn"
                            title="View"
                            onClick={() => {
                              setSelected(r);
                              setDrawerOpen(true);
                            }}
                          >
                            👁
                          </button>
                          <button type="button" className="mod-icon-btn danger" title="Remove" onClick={() => removeRow(r.id)}>
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {tab === 'staff' &&
                  (pageRows as typeof staff).map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.role}</td>
                      <td>{r.email}</td>
                      <td>{r.phone}</td>
                      <td>
                        <span className={badgeClass(r.status)}>{r.status}</span>
                      </td>
                      <td>
                        <div className="mod-action-btns">
                          <button
                            type="button"
                            className="mod-icon-btn"
                            title="View"
                            onClick={() => {
                              setSelected(r);
                              setDrawerOpen(true);
                            }}
                          >
                            👁
                          </button>
                          <button type="button" className="mod-icon-btn danger" title="Remove" onClick={() => removeRow(r.id)}>
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {tab === 'students' &&
                  (pageRows as typeof students).map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.room}</td>
                      <td>{r.age}</td>
                      <td>{r.parent}</td>
                      <td>
                        <span className={badgeClass(r.status)}>{r.status}</span>
                      </td>
                      <td>
                        <div className="mod-action-btns">
                          <button
                            type="button"
                            className="mod-icon-btn"
                            title="View"
                            onClick={() => {
                              setSelected(r);
                              setDrawerOpen(true);
                            }}
                          >
                            👁
                          </button>
                          <button type="button" className="mod-icon-btn danger" title="Remove" onClick={() => removeRow(r.id)}>
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        title={
          tab === 'rooms'
            ? 'Room Information'
            : tab === 'staff'
              ? 'Staff Information'
              : 'Student Information'
        }
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveAdd}>
              Save
            </button>
          </>
        }
      >
        {tab === 'rooms' ? (
          <>
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">
                  Room Name <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter room name"
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">
                  Capacity <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  type="number"
                  min={0}
                  value={form.secondary}
                  onChange={(e) => setForm({ ...form, secondary: e.target.value })}
                  placeholder="Enter room capacity"
                />
              </div>
            </div>
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">Minimum age (yrs)</label>
                <input
                  className="ui-input"
                  type="number"
                  min={0}
                  value={form.minAgeYrs}
                  onChange={(e) => setForm({ ...form, minAgeYrs: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Minimum age (months)</label>
                <input
                  className="ui-input"
                  type="number"
                  min={0}
                  max={11}
                  value={form.minAgeMonths}
                  onChange={(e) => setForm({ ...form, minAgeMonths: e.target.value })}
                />
              </div>
            </div>
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">Maximum age (yrs)</label>
                <input
                  className="ui-input"
                  type="number"
                  min={0}
                  value={form.maxAgeYrs}
                  onChange={(e) => setForm({ ...form, maxAgeYrs: e.target.value })}
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">Maximum age (months)</label>
                <input
                  className="ui-input"
                  type="number"
                  min={0}
                  max={11}
                  value={form.maxAgeMonths}
                  onChange={(e) => setForm({ ...form, maxAgeMonths: e.target.value })}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label">
                  Name <span className="req">*</span>
                </label>
                <input
                  className="ui-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="ui-field">
                <label className="ui-label">{tab === 'staff' ? 'Role' : 'Room'}</label>
                <input
                  className="ui-input"
                  value={form.secondary}
                  onChange={(e) => setForm({ ...form, secondary: e.target.value })}
                  placeholder={tab === 'staff' ? 'Teacher' : 'Sunshine Room'}
                />
              </div>
            </div>
            <div className="ui-field">
              <label className="ui-label">{tab === 'staff' ? 'Email' : 'Age'}</label>
              <input
                className="ui-input"
                value={form.tertiary}
                onChange={(e) => setForm({ ...form, tertiary: e.target.value })}
                placeholder={tab === 'staff' ? 'name@panacea.care' : '3 yrs'}
              />
            </div>
          </>
        )}
      </Modal>

      <Drawer
        open={drawerOpen}
        title={selected ? 'Record details' : 'Center overview'}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
      >
        {selected ? (
          <div className="mod-list">
            {Object.entries(selected)
              .filter(([k]) => k !== 'id')
              .map(([k, v]) => (
                <div key={k} className="mod-toggle-row">
                  <div>
                    <strong style={{ textTransform: 'capitalize' }}>{k}</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{String(v)}</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Your center currently has {rooms.length} rooms, {staff.length} staff members, and {students.length} students.
            Use tabs to manage each directory and keep enrollment ratios healthy.
          </p>
        )}
      </Drawer>
    </div>
  );
}
