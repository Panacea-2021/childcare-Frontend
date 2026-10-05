export type ResourceType = 'PDF' | 'DOC' | 'Link' | 'Video';

export type ResourceAudience = 'All' | 'Toddler' | 'Primary' | 'Elementary';

export type ResourceStatus = 'published' | 'draft';

export type ResourceItem = {
  id: string;
  title: string;
  category: string;
  type: ResourceType;
  audience: ResourceAudience;
  description: string;
  url?: string;
  size?: string;
  updated: string; // YYYY-MM-DD
  status: ResourceStatus;
};

export type ResourceFilterState = {
  search: string;
  category: string;
  type: ResourceType | 'All';
  status: ResourceStatus | 'All';
};
