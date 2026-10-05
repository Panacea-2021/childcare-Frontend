'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from '@/components/parent-communication/shared/EmptyState';
import { ConcernHeader } from '@/components/parent-communication/concerns/ConcernHeader';
import { ConcernStats } from '@/components/parent-communication/concerns/ConcernStats';
import { ConcernFilters } from '@/components/parent-communication/concerns/ConcernFilters';
import { ConcernCard } from '@/components/parent-communication/concerns/ConcernCard';
import { ConcernViewModal } from '@/components/parent-communication/concerns/ConcernViewModal';
import {
  ConcernTabs,
  type ConcernsListView,
} from '@/components/parent-communication/concerns/ConcernTabs';
import { LoadingSkeleton } from '@/components/parent-communication/concerns/LoadingSkeleton';
import { applyConcernStatus } from '@/components/parent-communication/concerns/concernTimeline';
import { MOCK_CONCERNS } from '@/lib/mock/mockConcerns';
import type { ConcernFilterState, ConcernStatus, ParentConcern } from '@/types/concern';
import '@/components/parent-communication/shared/shared.css';
import '@/components/parent-communication/parent-communication-page.css';
import '@/components/parent-communication/concerns/concerns.css';

const DEFAULT_FILTERS: ConcernFilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  date: '',
};

export function ConcernsPage() {
  const [concerns, setConcerns] = useState<ParentConcern[]>(() =>
    MOCK_CONCERNS.map((c) => ({ ...c, timeline: c.timeline.map((t) => ({ ...t })) })),
  );
  const [filters, setFilters] = useState<ConcernFilterState>(DEFAULT_FILTERS);
  const [listView, setListView] = useState<ConcernsListView>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusTimeline, setFocusTimeline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const handleResetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleRefresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 500);
  };

  const handleUpdate = useCallback((updated: ParentConcern) => {
    setConcerns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (updated.status === 'Resolved') {
      setListView('resolved');
    } else {
      setListView('active');
    }
  }, []);

  const handleStatusChange = useCallback(
    (id: string, status: ConcernStatus) => {
      setConcerns((prev) => {
        const target = prev.find((c) => c.id === id);
        if (!target) return prev;
        return prev.map((c) => (c.id === id ? applyConcernStatus(c, status) : c));
      });
      if (status === 'Resolved') setListView('resolved');
      else setListView('active');
    },
    [],
  );

  const openDetails = (concern: ParentConcern) => {
    setFocusTimeline(false);
    setSelectedId(concern.id);
  };

  const openTimeline = (concern: ParentConcern) => {
    setFocusTimeline(true);
    setSelectedId(concern.id);
  };

  const activeConcerns = useMemo(
    () => concerns.filter((c) => c.status !== 'Resolved'),
    [concerns],
  );
  const resolvedConcerns = useMemo(
    () => concerns.filter((c) => c.status === 'Resolved'),
    [concerns],
  );

  const selected = useMemo(
    () => concerns.find((c) => c.id === selectedId) ?? null,
    [concerns, selectedId],
  );

  const filtered = useMemo(() => {
    const source = listView === 'resolved' ? resolvedConcerns : activeConcerns;
    const q = filters.search.trim().toLowerCase();

    return source
      .filter((item) => {
        if (listView === 'active' && filters.status !== 'all' && item.status !== filters.status) {
          return false;
        }
        if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
        if (filters.date && item.date !== filters.date) return false;
        if (!q) return true;
        return (
          item.studentName.toLowerCase().includes(q) ||
          item.raisedBy.toLowerCase().includes(q) ||
          item.room.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [activeConcerns, filters, listView, resolvedConcerns]);

  const stats = useMemo(
    () => ({
      total: concerns.length,
      open: concerns.filter((c) => c.status === 'Open').length,
      inProgress: concerns.filter((c) => c.status === 'In Progress').length,
      resolved: resolvedConcerns.length,
    }),
    [concerns, resolvedConcerns.length],
  );

  return (
    <div className="pc-page pc-page--concerns concerns-container">
      <ConcernHeader resolvedCount={resolvedConcerns.length} />
      <ConcernStats
        total={stats.total}
        open={stats.open}
        inProgress={stats.inProgress}
        resolved={stats.resolved}
      />
      <ConcernTabs
        view={listView}
        activeCount={activeConcerns.length}
        resolvedCount={resolvedConcerns.length}
        onChange={(view) => {
          setListView(view);
          if (view === 'resolved') {
            setFilters((f) => ({ ...f, status: 'all' }));
          }
        }}
      />
      <ConcernFilters
        filters={filters}
        onChange={setFilters}
        hideResolvedOption={listView === 'active'}
        hideStatusFilter={listView === 'resolved'}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          theme="concerns"
          title={listView === 'resolved' ? 'No resolved concerns' : 'No concerns available'}
          description={
            listView === 'resolved'
              ? 'Resolved cases will appear here when you mark a concern as Resolved.'
              : 'Try adjusting filters or refresh to reload parent-raised concerns.'
          }
          onRefresh={handleRefresh}
          onClearFilters={handleResetFilters}
        />
      ) : (
        <motion.div className="concerns-stack" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((concern, index) => (
              <ConcernCard
                key={concern.id}
                concern={concern}
                index={index}
                onView={openDetails}
                onTimeline={openTimeline}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <ConcernViewModal
        concern={selected}
        focusTimeline={focusTimeline}
        onClose={() => {
          setSelectedId(null);
          setFocusTimeline(false);
        }}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
