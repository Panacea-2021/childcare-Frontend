import { redirect } from 'next/navigation';
import { PARENT_PORTAL_HOME } from '@/lib/parent-modules';

export default function ParentIndexPage() {
  redirect(PARENT_PORTAL_HOME);
}
