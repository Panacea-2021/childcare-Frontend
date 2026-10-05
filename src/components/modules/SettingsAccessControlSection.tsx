'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SettingsSectionShell } from '@/components/modules/SettingsSectionShell';
import '@/components/ui/module.css';
import styles from './SettingsAccessControlSection.module.css';

import {
  ACCESS_CONTROL_CATEGORIES as CATEGORIES,
  ACCESS_CONTROL_ROLES as ROLES,
  ALL_PERMISSION_IDS as ALL_IDS,
  getRolePermissions,
  setRolePermissions,
} from '@/lib/access-control';
import { authorizeSaveRolePermissions } from '@/lib/access-control/apiAuthorize';
import { usePermissionsOptional } from '@/components/auth/AuthorizationProvider';

function loadCheckedForRole(roleName: string): Set<string> {
  return new Set(getRolePermissions(roleName));
}
function CircleCheck({
  checked,
  onChange,
  label,
  id,
  muted,
  labelFirst,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id: string;
  muted?: boolean;
  /** Video: "Select all" text sits left of the circle */
  labelFirst?: boolean;
}) {
  const circle = (
    <span className={`${styles.circle} ${checked ? styles.circleOn : ''}`} aria-hidden>
      {checked ? (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.4 6.2 4.8 8.6 9.6 3.6"
            stroke="#fff"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );

  return (
    <label
      className={`${styles.check} ${muted ? styles.checkMuted : ''} ${labelFirst ? styles.checkLabelFirst : ''}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        className={styles.checkInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {labelFirst ? (
        <>
          <span className={styles.checkText}>{label}</span>
          {circle}
        </>
      ) : (
        <>
          {circle}
          <span className={styles.checkText}>{label}</span>
        </>
      )}
    </label>
  );
}

export function SettingsAccessControlSection() {
  const auth = usePermissionsOptional();
  const [role, setRole] = useState('Finance Admin');
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleQuery, setRoleQuery] = useState('');
  const [categoryId, setCategoryId] = useState('center-management');
  const [checked, setChecked] = useState(() => loadCheckedForRole('Finance Admin'));
  const [baseline, setBaseline] = useState(() => loadCheckedForRole('Finance Admin'));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [permSearch, setPermSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const roleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next = loadCheckedForRole(role);
    setChecked(new Set(next));
    setBaseline(new Set(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate from store once on mount
  }, []);

  const dirty = useMemo(() => {
    if (checked.size !== baseline.size) return true;
    for (const id of checked) if (!baseline.has(id)) return true;
    return false;
  }, [checked, baseline]);

  const giveAll = ALL_IDS.length > 0 && ALL_IDS.every((id) => checked.has(id));
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];

  const filteredRoles = useMemo(() => {
    const q = roleQuery.trim().toLowerCase();
    return ROLES.filter((r) => !q || r.toLowerCase().includes(q));
  }, [roleQuery]);

  useEffect(() => {
    if (!roleOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!roleRef.current?.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [roleOpen]);

  const loadRole = (nextRole: string) => {
    const next = loadCheckedForRole(nextRole);
    setRole(nextRole);
    setChecked(new Set(next));
    setBaseline(new Set(next));
    setRoleOpen(false);
    setRoleQuery('');
  };

  const toggleId = (id: string, next: boolean) => {
    setChecked((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  };

  const toggleMany = (ids: string[], next: boolean) => {
    setChecked((prev) => {
      const copy = new Set(prev);
      for (const id of ids) {
        if (next) copy.add(id);
        else copy.delete(id);
      }
      return copy;
    });
  };

  const categoryIds = useMemo(() => {
    const ids = [...(category.topLevel?.map((p) => p.id) ?? [])];
    for (const g of category.groups) for (const p of g.permissions) ids.push(p.id);
    return ids;
  }, [category]);

  const matchesSearch = (label: string) => {
    const q = permSearch.trim().toLowerCase();
    return !q || label.toLowerCase().includes(q);
  };

  return (
    <SettingsSectionShell
      title="Access Control"
      description="Manage role permissions across modules and features."
      icon={<ShieldCheck />}
    >
    <div className={styles.root}>
      {toast ? (
        <div className={styles.toast} role="status">
          <span className={styles.toastIcon} aria-hidden>
            ✓
          </span>
          <span>{toast}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}

      <div className={styles.roleRow}>
        <span className={styles.roleLabel}>Select Role</span>
        <div className={styles.roleSelect} ref={roleRef}>
          <button
            type="button"
            className={styles.roleTrigger}
            aria-expanded={roleOpen}
            onClick={() => setRoleOpen((o) => !o)}
          >
            <svg className={styles.roleSearchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className={styles.roleValue}>{role}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M2.5 4.5 6 8l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {roleOpen ? (
            <div className={styles.roleMenu} role="listbox">
              <input
                className={styles.roleFilter}
                placeholder="Search role"
                value={roleQuery}
                onChange={(e) => setRoleQuery(e.target.value)}
                autoFocus
              />
              {filteredRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="option"
                  className={`${styles.roleOption} ${r === role ? styles.roleOptionActive : ''}`}
                  onClick={() => loadRole(r)}
                >
                  {r}
                </button>
              ))}
              {filteredRoles.length === 0 ? <p className={styles.roleEmpty}>No roles found</p> : null}
            </div>
          ) : null}
        </div>

        <CircleCheck
          id="give-all-permissions"
          label="Give all permissions"
          checked={giveAll}
          onChange={(next) => setChecked(next ? new Set(ALL_IDS) : new Set())}
        />
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2>Control Permissions</h2>
          <div className={styles.searchWrap}>
            <input
              placeholder="Search"
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              aria-label="Search permissions"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className={styles.split}>
          <nav className={styles.catList} aria-label="Permission categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.catItem} ${c.id === categoryId ? styles.catActive : ''}`}
                onClick={() => {
                  setCategoryId(c.id);
                  setCollapsed({});
                }}
              >
                <span>{c.label}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path
                    d="M5 3.5 8.5 7 5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ))}
          </nav>

          <div className={styles.permPane}>
            <div className={styles.sectionBar}>
              <h3>{category.label}</h3>
              <CircleCheck
                id={`cat-all-${category.id}`}
                label="Select all"
                muted
                labelFirst
                checked={categoryIds.length > 0 && categoryIds.every((id) => checked.has(id))}
                onChange={(next) => toggleMany(categoryIds, next)}
              />
            </div>

            {(category.topLevel ?? [])
              .filter((p) => matchesSearch(p.label))
              .map((p) => (
                <div key={p.id} className={styles.topPerm}>
                  <CircleCheck
                    id={p.id}
                    label={p.label}
                    checked={checked.has(p.id)}
                    onChange={(next) => toggleId(p.id, next)}
                  />
                </div>
              ))}

            {category.groups.map((g) => {
              const visible = g.permissions.filter((p) => matchesSearch(p.label));
              if (permSearch.trim() && visible.length === 0 && g.permissions.length > 0) return null;
              const isCollapsed = Boolean(collapsed[g.id]);
              const ids = g.permissions.map((p) => p.id);
              const allOn = ids.length > 0 && ids.every((id) => checked.has(id));

              return (
                <div key={g.id} className={styles.group}>
                  <div className={styles.groupBar}>
                    <button
                      type="button"
                      className={styles.groupToggle}
                      aria-expanded={!isCollapsed}
                      onClick={() =>
                        setCollapsed((prev) => ({ ...prev, [g.id]: !prev[g.id] }))
                      }
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                        {isCollapsed ? (
                          <path
                            d="M5 3.5 8.5 7 5 10.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        ) : (
                          <path
                            d="M3.5 5 7 8.5 10.5 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                      {g.label}
                    </button>
                    <CircleCheck
                      id={`group-all-${g.id}`}
                      label="Select all"
                      muted
                      labelFirst
                      checked={allOn}
                      onChange={(next) => toggleMany(ids, next)}
                    />
                  </div>

                  {!isCollapsed ? (
                    g.permissions.length === 0 ? (
                      <p className={styles.noData}>No Data</p>
                    ) : (
                      <div className={styles.permGrid}>
                        {(permSearch.trim() ? visible : g.permissions).map((p) => (
                          <CircleCheck
                            key={p.id}
                            id={p.id}
                            label={p.label}
                            checked={checked.has(p.id)}
                            onChange={(next) => toggleId(p.id, next)}
                          />
                        ))}
                      </div>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footer}>
          {dirty ? <span className={styles.unsaved}>Unsaved changes</span> : <span />}
          <div className={styles.footerActions}>
            <button
              type="button"
              className={`ui-btn ui-btn-outline ${styles.footerBtn}`}
              onClick={() => {
                if (dirty) setChecked(new Set(baseline));
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`ui-btn ui-btn-primary ${styles.footerBtn}`}
              onClick={() => {
                if (!dirty) return;
                const authz = authorizeSaveRolePermissions();
                if (!authz.ok) {
                  setToast(
                    authz.status === 401
                      ? 'Please sign in again'
                      : 'You do not have permission to save Access Control',
                  );
                  window.setTimeout(() => setToast(null), 3000);
                  return;
                }
                setRolePermissions(role, Array.from(checked));
                setBaseline(new Set(checked));
                setToast('Permissions saved successfully');
                window.setTimeout(() => setToast(null), 3000);
                if (auth?.role === role) {
                  void auth.refresh();
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </section>
    </div>
    </SettingsSectionShell>
  );
}
