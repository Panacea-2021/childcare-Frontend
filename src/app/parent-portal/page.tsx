import { redirect } from 'next/navigation';
import { PARENT_PORTAL_HOME } from '@/lib/parent-modules';

/** Legacy welcome placeholder route — always enter the Parent Portal shell. */
export default function ParentPortalLegacyPage() {
  redirect(PARENT_PORTAL_HOME);
}
