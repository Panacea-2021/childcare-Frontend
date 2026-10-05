'use client';

import { AsrDropdown } from './AsrDropdown';
import { CLASSROOMS } from './types';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export function RoomMultiSelect({
  value,
  onChange,
  placeholder = 'Leave blank to select all rooms.',
}: Props) {
  return (
    <AsrDropdown
      multiple
      label="Select Room"
      placeholder={placeholder}
      searchPlaceholder="Search classrooms…"
      value={value}
      onChange={onChange}
      options={CLASSROOMS.map((room) => ({ value: room, label: room }))}
    />
  );
}
