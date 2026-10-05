'use client';

import { EnquiriesPageHeader } from '../EnquiriesPageHeader';
import { FacebookGlyph } from './FacebookGlyph';

export function FacebookHeader() {
  return (
    <EnquiriesPageHeader
      title="Facebook Integration"
      description="Capture leads from your Facebook Lead Ads directly into Enquiries automatically."
      icon={<FacebookGlyph size={22} />}
    />
  );
}
