'use client';

import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import type { EnquiryRecord, ListColumnKey } from '../types';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { initialsOf, parentContactOf } from '../mockData';
import { EnquiryActions } from './enquiry-actions';
import { rowHoverMotion, softInteractiveBtn } from '../animations';

const PAGE_SIZE = 8;

type SortKey =
  | 'studentName'
  | 'stage'
  | 'source'
  | 'assignedTo'
  | 'program'
  | 'createdOn'
  | 'expectedStartDate';

type Props = {
  items: EnquiryRecord[];
  stages: EnquiryStageConfig[];
  stageColorMap: Map<string, string>;
  visible: Record<ListColumnKey, boolean>;
  onView: (item: EnquiryRecord) => void;
  onEdit: (item: EnquiryRecord) => void;
  onTour: (item: EnquiryRecord) => void;
  onQuickMove: (item: EnquiryRecord, toStage: string) => void;
  onAdd: () => void;
};

export const EnquiryList = memo(function EnquiryList({
  items,
  stageColorMap,
  visible,
  onView,
  onEdit,
  onTour,
  onAdd,
}: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('createdOn');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      const cmp = av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [items, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sortMark = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const show = (key: ListColumnKey) => visible[key];

  if (!items.length) {
    return (
      <EmptyState
        title="No enquiries found"
        description="Adjust filters or add a new enquiry to get started."
        action={
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={onAdd}
            {...softInteractiveBtn}
          >
            + Add Enquiry
          </motion.button>
        }
      />
    );
  }

  return (
    <div className="enq-list-shell">
      <div className="enq-table-wrap mod-scroll enq-table-sticky">
        <table className="ui-table">
          <thead>
            <tr>
              {show('student') ? (
                <th>
                  <button
                    type="button"
                    className="enq-th-sort"
                    onClick={() => toggleSort('studentName')}
                  >
                    Student{sortMark('studentName')}
                  </button>
                </th>
              ) : null}
              {show('stage') ? (
                <th>
                  <button
                    type="button"
                    className="enq-th-sort"
                    onClick={() => toggleSort('stage')}
                  >
                    Stage{sortMark('stage')}
                  </button>
                </th>
              ) : null}
              {show('source') ? (
                <th>
                  <button
                    type="button"
                    className="enq-th-sort"
                    onClick={() => toggleSort('source')}
                  >
                    Source{sortMark('source')}
                  </button>
                </th>
              ) : null}
              {show('assignedTo') ? (
                <th>
                  <button
                    type="button"
                    className="enq-th-sort"
                    onClick={() => toggleSort('assignedTo')}
                  >
                    Assigned To{sortMark('assignedTo')}
                  </button>
                </th>
              ) : null}
              {show('program') ? (
                <th>
                  <button
                    type="button"
                    className="enq-th-sort"
                    onClick={() => toggleSort('program')}
                  >
                    Program{sortMark('program')}
                  </button>
                </th>
              ) : null}
              {show('expectedStart') ? (
                <th>
                  <button
                    type="button"
                    className="enq-th-sort"
                    onClick={() => toggleSort('expectedStartDate')}
                  >
                    Expected Start{sortMark('expectedStartDate')}
                  </button>
                </th>
              ) : null}
              {show('parentContact') ? <th>Parent Contact</th> : null}
              {show('createdOn') ? (
                <th>
                  <button
                    type="button"
                    className="enq-th-sort"
                    onClick={() => toggleSort('createdOn')}
                  >
                    Created Date{sortMark('createdOn')}
                  </button>
                </th>
              ) : null}
              {show('actions') ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const stageColor = stageColorMap.get(item.stage);
              return (
                <motion.tr key={item.id} {...rowHoverMotion}>
                  {show('student') ? (
                    <td>
                      <div className="enq-list-student">
                        <span className="enq-avatar" aria-hidden>
                          {initialsOf(item.studentName)}
                        </span>
                        <div>
                          <strong>{item.studentName}</strong>
                          {item.preferredName ? (
                            <div className="enq-list-preferred">{item.preferredName}</div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  ) : null}
                  {show('stage') ? (
                    <td>
                      <span
                        className="enq-badge"
                        style={
                          stageColor
                            ? {
                                background: `color-mix(in srgb, ${stageColor} 16%, #fff)`,
                                color: stageColor,
                                borderColor: `color-mix(in srgb, ${stageColor} 30%, transparent)`,
                              }
                            : undefined
                        }
                      >
                        {item.stage}
                      </span>
                    </td>
                  ) : null}
                  {show('source') ? <td>{item.source}</td> : null}
                  {show('assignedTo') ? (
                    <td>
                      <span className="enq-assignee">
                        <span className="enq-avatar" aria-hidden>
                          {initialsOf(item.assignedTo)}
                        </span>
                        {item.assignedTo}
                      </span>
                    </td>
                  ) : null}
                  {show('program') ? <td>{item.program}</td> : null}
                  {show('expectedStart') ? <td>{item.expectedStartDate ?? '—'}</td> : null}
                  {show('parentContact') ? <td>{parentContactOf(item)}</td> : null}
                  {show('createdOn') ? <td>{item.createdOn}</td> : null}
                  {show('actions') ? (
                    <td>
                      <EnquiryActions
                        email={item.motherEmail || item.fatherEmail}
                        phone={item.motherPhone || item.fatherPhone}
                        onEmail={() => {
                          const email = item.motherEmail || item.fatherEmail;
                          if (email) window.location.href = `mailto:${email}`;
                        }}
                        onTour={() => onTour(item)}
                        onView={() => onView(item)}
                        onEdit={() => onEdit(item)}
                      />
                    </td>
                  ) : null}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="enq-list-footer">
        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
});
