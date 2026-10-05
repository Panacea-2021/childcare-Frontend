'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getParentSession,
  type ParentAuthSession,
  type ParentStudentSummary,
} from '@/lib/parent-auth';
import { DEMO_ORGANIZATION, DEFAULT_CENTER_ID } from '@/lib/organization/centers';

type ParentStudentContextValue = {
  ready: boolean;
  session: ParentAuthSession | null;
  email: string;
  students: ParentStudentSummary[];
  selectedStudent: ParentStudentSummary | null;
  studentCount: number;
  schoolName: string;
  displayName: string;
  avatarLabel: string;
  refresh: () => void;
};

const ParentStudentContext = createContext<ParentStudentContextValue | null>(null);

function prettyNameFromEmail(email: string) {
  const local = email.split('@')[0] ?? '';
  const pretty = local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  return pretty || 'Parent';
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function resolveSchoolName() {
  const center =
    DEMO_ORGANIZATION.centers.find((c) => c.id === DEFAULT_CENTER_ID) ??
    DEMO_ORGANIZATION.centers[0];
  return center?.name ?? DEMO_ORGANIZATION.name;
}

export function ParentStudentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<ParentAuthSession | null>(null);

  const refresh = useCallback(() => {
    setSession(getParentSession());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<ParentStudentContextValue>(() => {
    const email = session?.email ?? '';
    const students = session?.students ?? [];
    const selectedStudent =
      students.find((s) => s.id === session?.selectedStudentId) ?? null;
    const displayName = prettyNameFromEmail(email);

    return {
      ready,
      session,
      email,
      students,
      selectedStudent,
      studentCount: students.length,
      schoolName: resolveSchoolName(),
      displayName,
      avatarLabel: initialsFrom(displayName) || 'P',
      refresh,
    };
  }, [ready, session, refresh]);

  return (
    <ParentStudentContext.Provider value={value}>{children}</ParentStudentContext.Provider>
  );
}

export function useParentStudent() {
  const ctx = useContext(ParentStudentContext);
  if (!ctx) {
    throw new Error('useParentStudent must be used within ParentStudentProvider');
  }
  return ctx;
}
