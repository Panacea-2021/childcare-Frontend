'use client';

import { ReactNode } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { ChatWidget } from '@/components/ChatWidget';
import { AnimatedBackground } from '@/components/login/AnimatedBackground';
import { SchoolDecorations } from '@/components/login/SchoolDecorations';
import '@/components/login/login.css';
import './auth-flow.css';

type AuthShellProps = {
  children: ReactNode;
  brandMessage?: string;
  wide?: boolean;
  showChat?: boolean;
  className?: string;
};

export function AuthShell({
  children,
  brandMessage,
  wide = false,
  showChat = true,
  className = '',
}: AuthShellProps) {
  return (
    <div className={`login-page auth-flow-page ${className}`.trim()}>
      <AnimatedBackground />
      <SchoolDecorations />

      <div className={`login-shell ${wide ? 'auth-shell-wide' : ''}`.trim()}>
        <header className="login-brand login-anim login-anim-brand">
          <BrandLogo size="lg" />
          {brandMessage ? (
            <p className="login-brand-message" aria-live="polite">
              {brandMessage}
            </p>
          ) : null}
        </header>

        <div className={`login-card login-anim login-anim-card ${wide ? 'auth-card-wide' : ''}`.trim()}>
          {children}
        </div>
      </div>

      {showChat ? <ChatWidget /> : null}
    </div>
  );
}
