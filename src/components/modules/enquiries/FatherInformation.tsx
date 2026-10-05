'use client';

import { memo } from 'react';
import type { Control, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { EnquiryFormValues } from './schema';

type Props = {
  control: Control<EnquiryFormValues>;
  errors: FieldErrors<EnquiryFormValues>;
};

export const FatherInformation = memo(function FatherInformation({ control, errors }: Props) {
  return (
    <div className="ui-grid-2">
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-father-name">
          Father Name
        </label>
        <Controller
          name="fatherName"
          control={control}
          render={({ field }) => (
            <input {...field} id="enq-father-name" className="ui-input" placeholder="Full name" />
          )}
        />
      </div>
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-father-phone">
          Phone Number
        </label>
        <Controller
          name="fatherPhone"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-father-phone"
              className="ui-input"
              type="tel"
              placeholder="+91 …"
            />
          )}
        />
        {errors.fatherPhone ? <p className="enq-error">{errors.fatherPhone.message}</p> : null}
      </div>
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-father-email">
          Email Address
        </label>
        <Controller
          name="fatherEmail"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-father-email"
              className="ui-input"
              type="email"
              placeholder="name@email.com"
            />
          )}
        />
        {errors.fatherEmail ? <p className="enq-error">{errors.fatherEmail.message}</p> : null}
      </div>
      <div className="ui-field">
        <label className="ui-label" htmlFor="enq-father-company">
          Company Name
        </label>
        <Controller
          name="fatherCompany"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="enq-father-company"
              className="ui-input"
              placeholder="Organization"
            />
          )}
        />
      </div>
    </div>
  );
});
