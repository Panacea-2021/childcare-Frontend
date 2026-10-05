'use client';

import { BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clearAllParentAuth } from '@/lib/parent-auth';
import { AuthShell } from './AuthShell';

export function NoStudentsFound() {
  const router = useRouter();

  function contactSchool() {
    window.location.href = 'mailto:admin@panacea.care?subject=Parent%20portal%20-%20no%20students';
  }

  function backToLogin() {
    clearAllParentAuth();
    router.push('/login');
  }

  return (
    <AuthShell brandMessage="We're here to help you get connected.">
      <div className="empty-students login-anim login-anim-d1">
        <span className="empty-students-icon" aria-hidden>
          <BookOpen size={36} strokeWidth={1.75} />
        </span>
        <h1 className="login-form-title">No Students Found</h1>
        <p className="login-form-subtitle empty-students-copy">
          We couldn&apos;t find any students associated with this account. Please contact your
          school administrator if you think this is a mistake.
        </p>
        <div className="empty-students-actions">
          <button type="button" className="login-submit-btn" onClick={contactSchool}>
            Contact School
          </button>
          <button type="button" className="otp-change-email" onClick={backToLogin}>
            Use a different email
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
