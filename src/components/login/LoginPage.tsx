'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from '../BrandLogo';
import { ChatWidget } from '../ChatWidget';
import { AnimatedBackground } from './AnimatedBackground';
import { SchoolDecorations } from './SchoolDecorations';
import { LoginCard } from './LoginCard';
import './login.css';
import '@/components/auth/auth-flow.css';

const ROTATING_MESSAGES = [
  'Let’s continue your learning journey.',
  'Your child’s world, in one place.',
  'Welcome back to your parent portal!',
];

export function LoginPage() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="login-page">
      <AnimatedBackground />
      <SchoolDecorations />

      <div className="login-shell">
        <header className="login-brand login-anim login-anim-brand">
          <BrandLogo size="lg" />
          <p className="login-brand-message" key={messageIndex} aria-live="polite">
            {ROTATING_MESSAGES[messageIndex]}
          </p>
        </header>

        <LoginCard />
      </div>

      <ChatWidget />
    </div>
  );
}
