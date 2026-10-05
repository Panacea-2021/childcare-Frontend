'use client';

import { Mail, Plus } from 'lucide-react';
import { ParentCommunicationPageHeader } from '@/components/parent-communication/ParentCommunicationPageHeader';

type Props = {
  onCreate: () => void;
};

export function NewslettersHeader({ onCreate }: Props) {
  return (
    <ParentCommunicationPageHeader
      title="Newsletters"
      description="Publish family newsletters and learning previews. Design once, send to parents, and reuse templates anytime."
      icon={<Mail />}
      actions={
        <button type="button" className="ui-btn ui-btn-primary" onClick={onCreate}>
          <Plus size={16} aria-hidden />
          Create Newsletter
        </button>
      }
    />
  );
}
