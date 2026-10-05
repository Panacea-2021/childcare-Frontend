export type NewsletterStatus = 'draft' | 'sent' | 'scheduled' | 'template';

export type NewsletterAudience = 'all_parents' | 'selected_rooms' | 'selected_students';

export type NewsletterItem = {
  id: string;
  title: string;
  createdBy: string;
  createdById: string;
  sentTo: string;
  audience: NewsletterAudience;
  status: NewsletterStatus;
  updatedOn: string;
  updatedAtIso: string;
  previewColor: string;
  isTemplate?: boolean;
  rooms?: string[];
};

export type NewsletterFilterState = {
  title: string;
  createdBy: string;
  status: 'all' | NewsletterStatus;
};
