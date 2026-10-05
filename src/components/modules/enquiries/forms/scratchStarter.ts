import { createField } from './fieldCatalog';
import type { FormField } from './types';

/** Starter fields so Create From Scratch opens a real editable official form. */
export function createScratchStarterFields(): FormField[] {
  const section = createField('heading', '1. Information');
  const name = createField('text', 'Full Name');
  name.width = 'half';
  name.required = true;

  const phone = createField('phone', 'Phone Number');
  phone.width = 'half';
  phone.required = true;

  const email = createField('email', 'Email Address');
  email.width = 'half';

  const date = createField('date', 'Date');
  date.width = 'half';

  const notes = createField('textarea', 'Notes / Details');
  notes.required = false;

  const section2 = createField('heading', '2. Declaration');
  const terms = createField('terms', 'I confirm the information provided is true and complete.');
  terms.required = true;

  const sign = createField('signature', 'Parent / Guardian Signature');
  sign.width = 'half';

  const signDate = createField('date', 'Date');
  signDate.width = 'half';

  // Stable unique ids for this batch
  return [section, name, phone, email, date, notes, section2, terms, sign, signDate].map((f, i) => ({
    ...f,
    id: `scratch-${Date.now()}-${i}`,
  }));
}
