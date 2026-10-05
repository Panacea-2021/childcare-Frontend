'use client';

import { ReportColumnsSelector } from '@/components/reports/shared/ReportColumnsSelector';
import {
  ABSENTEE_COLUMNS,
  type AbsenteeColumnId,
  type ColumnMode,
} from './absenteesUtils';

type Props = {
  mode: ColumnMode;
  selected: AbsenteeColumnId[];
  onModeChange: (mode: ColumnMode) => void;
  onSelectedChange: (next: AbsenteeColumnId[]) => void;
  error?: string;
};

const DEFAULT_COUNT = ABSENTEE_COLUMNS.filter((c) => c.defaultSelected).length;

export function ColumnsSelector({ mode, selected, onModeChange, onSelectedChange, error }: Props) {
  return (
    <ReportColumnsSelector
      mode={mode}
      modeOptions={[
        { id: 'default', label: 'Default' },
        { id: 'custom', label: 'Custom' },
      ]}
      compactModes={['default']}
      columns={ABSENTEE_COLUMNS}
      selected={selected}
      pageSize={10}
      error={error}
      compactHint={`Using the default column set (${DEFAULT_COUNT} columns).`}
      onModeChange={(next) => {
        const columnMode = next as ColumnMode;
        onModeChange(columnMode);
        if (columnMode === 'default') {
          onSelectedChange(ABSENTEE_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.id));
        }
      }}
      onSelectedChange={onSelectedChange}
    />
  );
}
