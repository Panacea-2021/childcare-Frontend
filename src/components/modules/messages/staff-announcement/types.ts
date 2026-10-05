export type AnnouncementMode = 'staff' | 'room';

export type DeliveryMethod = 'email' | 'whatsapp' | 'sms';

export type AnnouncementStatus = 'delivered' | 'scheduled' | 'pending';

export type StaffOption = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
};

export type RoomOption = {
  id: string;
  name: string;
  department: string;
  floor: string;
  staffCount: number;
  staffAvatars: string[];
};

export type AnnouncementAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
};

export type Announcement = {
  id: string;
  title: string;
  note: string;
  date: string;
  time: string;
  mode: AnnouncementMode;
  staffIds: string[];
  roomId: string | null;
  methods: DeliveryMethod[];
  attachments: AnnouncementAttachment[];
  referenceLink: string;
  createdBy: string;
  status: AnnouncementStatus;
  createdAt: string;
};

export type AnnouncementFormValues = {
  date: string;
  time: string;
  title: string;
  note: string;
  mode: AnnouncementMode;
  staffIds: string[];
  roomId: string;
  methods: DeliveryMethod[];
  attachments: AnnouncementAttachment[];
  referenceLink: string;
};

export type FormErrors = Partial<Record<keyof AnnouncementFormValues | 'methods', string>>;

export type ToastItem = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
};

export type SummaryStats = {
  total: number;
  today: number;
  scheduled: number;
  delivered: number;
  pending: number;
};
