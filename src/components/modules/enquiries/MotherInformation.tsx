'use client';

import { memo } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { EnquiryFormValues } from './schema';

type Props = {
  control: Control<EnquiryFormValues>;
  errors: FieldErrors<EnquiryFormValues>;
};

export const MotherInformation = memo(function MotherInformation({ control, errors }: Props) {
  return (
    <div className="ui-grid-2">
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-mother-name">
          Mother Name
        </label>
        <Controller
          name="motherName"
          control={control}
          render={({ field }) => (
            <input {...field} id="enq-mother-name" className="ui-input" placeholder="Full name" />
          )}
        />
      </div>
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-mother-phone">
          Phone Number
        </label>
        <Controller
          name="motherPhone"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-mother-phone"
              className="ui-input"
              type="tel"
              placeholder="+91 …"
            />
          )}
        />
        {errors.motherPhone ? <p className="enq-error">{errors.motherPhone.message}</p> : null}
      </div>
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-mother-email">
          Email Address
        </label>
        <Controller
          name="motherEmail"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-mother-email"
              className="ui-input"
              type="email"
              placeholder="name@email.com"
            />
          )}
        />
        {errors.motherEmail ? <p className="enq-error">{errors.motherEmail.message}</p> : null}
      </div>
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-mother-company">
          Company Name
        </label>
        <Controller
          name="motherCompany"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-mother-company"
              className="ui-input"
              placeholder="Organization"
            />
          )}
        />
      </div>
    </div>
  );
});
