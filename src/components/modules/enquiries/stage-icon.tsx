'use client';

import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  Heart,
  MapPin,
  Phone,
  Sparkles,
  Star,
  UserX,
  type LucideIcon,
} from 'lucide-react';
import type { StageIconKey } from '@/lib/enquiries/types';

const ICON_MAP: Record<StageIconKey, LucideIcon> = {
  archive: Archive,
  heart: Heart,
  clock: Clock3,
  check: CheckCircle2,
  userx: UserX,
  calendar: CalendarDays,
  file: FileText,
  phone: Phone,
  flag: Flag,
  star: Star,
  sparkles: Sparkles,
  mapPin: MapPin,
};

export function getStageIcon(key: StageIconKey): LucideIcon {
  return ICON_MAP[key] ?? Flag;
}
