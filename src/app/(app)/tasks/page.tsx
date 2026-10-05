'use client';

import dynamic from 'next/dynamic';

const TasksPage = dynamic(
  () => import('@/components/modules/tasks/TasksPage').then((m) => m.TasksPage),
  {
    ssr: false,
    loading: () => <div className="shell-loading">Loading tasks…</div>,
  },
);

export default function Page() {
  return <TasksPage />;
}
