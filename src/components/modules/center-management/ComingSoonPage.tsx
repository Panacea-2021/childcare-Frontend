'use client';

import './students.css';

type Props = {
  title: string;
  description?: string;
};

export function ComingSoonPage({ title, description }: Props) {
  return (
    <div className="cm-coming">
      <h1>{title}</h1>
      <p>
        {description ??
          'This section is part of Center Management and will be implemented in a later step. Filters and lists are already wired to be dynamic.'}
      </p>
    </div>
  );
}
