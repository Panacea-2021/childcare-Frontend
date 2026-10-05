'use client';

import { EnquiriesPageHeader } from '../EnquiriesPageHeader';
import { WhatsAppGlyph } from './WhatsAppGlyph';

export function WhatsAppHeader() {
  return (
    <EnquiriesPageHeader
      title="WhatsApp Campaigns"
      description="Effortlessly manage enquiries, enhance responsiveness, automate communication, and stay connected with parents throughout their admission journey."
      icon={<WhatsAppGlyph size={22} />}
    />
  );
}
