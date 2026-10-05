'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { ChatWidget } from '@/components/ChatWidget';
import './product-guide.css';

export function ProductGuideShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="pg-root">
      <header className={`pg-shell-header${scrolled ? ' is-scrolled' : ''}`}>
        <Link href="/resources/product-guide" className="pg-shell-logo" aria-label="Product Guide home">
          <BrandLogo />
        </Link>
        <Link href="/" className="pg-shell-back">
          Back to site
        </Link>
      </header>
      {children}
      <footer className="pg-shell-footer">
        <Link href="/resources/product-guide" className="pg-shell-logo" aria-label="Product Guide">
          <BrandLogo />
        </Link>
        <span>Help Center</span>
      </footer>
      <ChatWidget />
    </div>
  );
}
