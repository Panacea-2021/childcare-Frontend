'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityHeader } from '@/components/parent-communication/activities/ActivityHeader';
import { ActivityStats } from '@/components/parent-communication/activities/ActivityStats';
import { ActivityTabs } from '@/components/parent-communication/activities/ActivityTabs';
import { ActivityFilters } from '@/components/parent-communication/activities/ActivityFilters';
import { ActivityGrid } from '@/components/parent-communication/activities/ActivityGrid';
import { ActivityTimeline } from '@/components/parent-communication/activities/ActivityTimeline';
import { EmptyState } from '@/components/parent-communication/activities/EmptyState';
import {
  loadActivityPosts,
  saveActivityPosts,
  subscribeActivityPosts,
} from '@/lib/parent-communication/activitiesPostsStore';
import { ActivityPost, ActivityFilterState } from '@/types/activity';
import '@/components/parent-communication/parent-communication-page.css';
import '@/components/parent-communication/activities/activities.css';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekDateKeys() {
  const keys = new Set<string>();
  const d = new Date();
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  for (let i = 0; i < 7; i += 1) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    keys.add(
      `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`,
    );
  }
  return keys;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [activitiesList, setActivitiesList] = useState<ActivityPost[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled'>('all');
  const [toast, setToast] = useState<string | null>(null);

  const [filters, setFilters] = useState<ActivityFilterState>({
    search: '',
    room: 'all',
    activityType: 'all',
    visibility: 'all',
    status: 'all',
    quickChip: null,
  });

  useEffect(() => {
    const refresh = () => setActivitiesList(loadActivityPosts());
    refresh();
    return subscribeActivityPosts(refresh);
  }, []);

  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('panacea.postActivity.toast');
      if (msg) {
        sessionStorage.removeItem('panacea.postActivity.toast');
        setToast(msg);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: ActivityPost[] | ((prev: ActivityPost[]) => ActivityPost[])) => {
    setActivitiesList((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      saveActivityPosts(resolved);
      return resolved;
    });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      room: 'all',
      activityType: 'all',
      visibility: 'all',
      status: 'all',
      quickChip: null,
    });
  };

  const handleDeleteScheduled = (id: string) => {
    persist((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicate = (post: ActivityPost) => {
    persist((prev) => [
      {
        ...post,
        id: `act-dup-${Date.now()}`,
        title: `${post.title} (Copy)`,
        status: 'scheduled',
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        isLikedByMe: false,
        isBookmarkedByMe: false,
        scheduledTimestamp: Date.now() + 2 * 24 * 60 * 60 * 1000,
      },
      ...prev,
    ]);
  };

  const handleToggleLike = (id: string) => {
    persist((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const liked = !p.isLikedByMe;
        return {
          ...p,
          isLikedByMe: liked,
          likesCount: Math.max(0, p.likesCount + (liked ? 1 : -1)),
        };
      }),
    );
  };

  const handleToggleBookmark = (id: string) => {
    persist((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBookmarkedByMe: !p.isBookmarkedByMe } : p)),
    );
  };

  const handleDeletePost = (id: string) => {
    persist((prev) => prev.filter((p) => p.id !== id));
  };

  const handleArchivePost = (id: string) => {
    persist((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p)),
    );
  };

  const handleUpdatePost = (id: string) => {
    router.push(`/parent-communication/activities/post?editId=${encodeURIComponent(id)}`);
  };

  const filteredActivities = useMemo(() => {
    const thisWeekDates = weekDateKeys();
    const today = todayKey();

    return activitiesList.filter((item) => {
      if (item.isArchived) return false;

      if (activeTab === 'scheduled' && item.status !== 'scheduled') {
        return false;
      }

      if (filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchContent = item.content.toLowerCase().includes(query);
        const matchAuthor = item.postedBy.name.toLowerCase().includes(query);
        const matchType = item.activityTypeName.toLowerCase().includes(query);
        if (!matchTitle && !matchContent && !matchAuthor && !matchType) {
          return false;
        }
      }

      if (filters.room !== 'all' && item.room !== filters.room) {
        return false;
      }

      if (filters.activityType !== 'all' && item.activityTypeId !== filters.activityType) {
        return false;
      }

      if (filters.visibility !== 'all' && item.visibility !== filters.visibility) {
        return false;
      }

      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      if (filters.quickChip) {
        switch (filters.quickChip) {
          case 'today':
            if (item.createdDate !== today && item.scheduledDate !== today) return false;
            break;
          case 'this_week':
            if (!thisWeekDates.has(item.createdDate) && !thisWeekDates.has(item.scheduledDate ?? '')) {
              return false;
            }
            break;
          case 'staff_only':
            if (item.visibility !== 'staff_only') return false;
            break;
          case 'parents':
            if (item.visibility !== 'parents') return false;
            break;
          case 'pinned':
            if (!item.isPinned) return false;
            break;
          case 'scheduled':
            if (item.status !== 'scheduled') return false;
            break;
        }
      }

      return true;
    });
  }, [activitiesList, activeTab, filters]);

  const activePosts = activitiesList.filter((a) => !a.isArchived);
  const totalCount = activePosts.length;
  const today = todayKey();
  const todaysPostsCount = activePosts.filter(
    (a) => a.createdDate === today || a.scheduledDate === today,
  ).length;
  const scheduledCount = activePosts.filter((a) => a.status === 'scheduled').length;
  const staffOnlyCount = activePosts.filter((a) => a.visibility === 'staff_only').length;

  return (
    <div className="act-page">
      <div className="act-shell-card">
        <div className="act-shell-ambient" aria-hidden>
          <span className="act-shell-blob act-shell-blob-1" />
          <span className="act-shell-blob act-shell-blob-2" />
        </div>

        <ActivityHeader />

        <ActivityStats
          totalActivities={totalCount}
          todaysPosts={todaysPostsCount}
          scheduledPosts={scheduledCount}
          staffOnlyPosts={staffOnlyCount}
        />

        <div className="act-toolbar-row">
          <ActivityTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            allCount={totalCount}
            scheduledCount={scheduledCount}
          />
        </div>

        <ActivityFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          totalResultsCount={filteredActivities.length}
        />

        <div className="act-feed-area">
          {filteredActivities.length === 0 ? (
            <EmptyState />
          ) : activeTab === 'scheduled' ? (
            <ActivityTimeline
              scheduledPosts={filteredActivities}
              onDeleteScheduled={handleDeleteScheduled}
              onDuplicate={handleDuplicate}
              onUpdate={handleUpdatePost}
            />
          ) : (
            <ActivityGrid
              activities={filteredActivities}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onDelete={handleDeletePost}
              onArchive={handleArchivePost}
              onUpdate={handleUpdatePost}
            />
          )}
        </div>
      </div>

      {toast ? (
        <div className="act-page-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
