import { ParentAppShell } from '@/components/parent/ParentAppShell';
import { ParentStudentProvider } from '@/components/parent/ParentStudentContext';
import { ParentLocaleProvider } from '@/lib/parent-i18n';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentStudentProvider>
      <ParentLocaleProvider>
        <ParentAppShell>{children}</ParentAppShell>
      </ParentLocaleProvider>
    </ParentStudentProvider>
  );
}
