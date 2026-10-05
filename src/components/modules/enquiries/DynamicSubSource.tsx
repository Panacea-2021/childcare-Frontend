'use client';

import { memo, useEffect, useMemo } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import type { EnquiryFormValues } from './schema';
import type { EnquirySource } from '@/lib/enquiries/types';
import { getSubSourcesFor } from '@/lib/enquiries/sourcesStore';
import { SearchableSelect } from './SearchableSelect';

type Props = {
  control: Control<EnquiryFormValues>;
  sources: EnquirySource[];
  errors?: FieldErrors<EnquiryFormValues>;
  onSourceClearsSub?: () => void;
};

export const DynamicSubSource = memo(function DynamicSubSource({
  control,
  sources,
  errors,
  onSourceClearsSub,
}: Props) {
  const source = useWatch({ control, name: 'source' });
  const subSource = useWatch({ control, name: 'subSource' });

  const options = useMemo(() => {
    return getSubSourcesFor(sources, source).map((s) => ({
      value: s.name,
      label: s.name,
    }));
  }, [sources, source]);

  useEffect(() => {
    if (!options.length) {
      onSourceClearsSub?.();
      return;
    }
    if (subSource && !options.some((o) => o.value === subSource)) {
      onSourceClearsSub?.();
    }
  }, [options, subSource, onSourceClearsSub]);

  return (
    <div className="ui-field">
      <label className="ui-label">Sub Source *</label>
      <Controller
        name="subSource"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            key={source}
            value={field.value ?? ''}
            onChange={field.onChange}
            options={options}
            placeholder={source ? 'Select sub source' : 'Select a source first'}
            error={errors?.subSource?.message}
          />
        )}
      />
    </div>
  );
});
