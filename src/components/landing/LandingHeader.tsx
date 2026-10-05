'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../BrandLogo';
import { FeaturesMegaMenu, FeaturesMobileDrawer } from './features/FeaturesMegaMenu';
import { BuiltForYouMegaMenu } from './features/BuiltForYouMegaMenu';
import { ResourcesMegaMenu } from './features/ResourcesMegaMenu';
import './features/features-mega-menu.css';

export function LandingHeader() {
  const pathname = usePathname();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [builtForYouOpen, setBuiltForYouOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const featuresTriggerId = useId();
  const builtForYouTriggerId = useId();
  const resourcesTriggerId = useId();
  const enterpriseActive = pathname === '/enterprise';
  const pricingActive =
    pathname === '/pricing' ||
    pathname.startsWith('/pricing/');
  const resourcesActive =
    pathname === '/about' ||
    pathname.startsWith('/about/') ||
    pathname.startsWith('/resources');

  const closeOthers = useCallback((keep: 'features' | 'built' | 'resources') => {
    if (keep !== 'features') setFeaturesOpen(false);
    if (keep !== 'built') setBuiltForYouOpen(false);
    if (keep !== 'resources') setResourcesOpen(false);
  }, []);

  const toggleFeatures = useCallback(() => {
    closeOthers('features');
    setFeaturesOpen((v) => !v);
  }, [closeOthers]);

  const toggleBuiltForYou = useCallback(() => {
    closeOthers('built');
    setBuiltForYouOpen((v) => !v);
  }, [closeOthers]);

  const toggleResources = useCallback(() => {
    closeOthers('resources');
    setResourcesOpen((v) => !v);
  }, [closeOthers]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 980) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`lp-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="lp-header-left">
        <Link href="/" aria-label="Panacea Childcare Group home" className="lp-brandLink">
          <BrandLogo size="md" />
        </Link>
      </div>

      <nav className="lp-nav" aria-label="Marketing">
        <div className="fmm-shell">
          <button
            id={featuresTriggerId}
            type="button"
            className="fmm-trigger"
            aria-expanded={featuresOpen}
            aria-haspopup="dialog"
            onClick={toggleFeatures}
          >
            Features <span className="fmm-chevron" aria-hidden="true">▾</span>
          </button>
          <FeaturesMegaMenu
            open={featuresOpen}
            onOpenChange={(open) => {
              if (open) closeOthers('features');
              setFeaturesOpen(open);
            }}
            triggerId={featuresTriggerId}
          />
        </div>

        <div className="fmm-shell">
          <button
            id={builtForYouTriggerId}
            type="button"
            className="fmm-trigger"
            aria-expanded={builtForYouOpen}
            aria-haspopup="dialog"
            onClick={toggleBuiltForYou}
          >
            Built for you <span className="fmm-chevron" aria-hidden="true">▾</span>
          </button>
          <BuiltForYouMegaMenu
            open={builtForYouOpen}
            onOpenChange={(open) => {
              if (open) closeOthers('built');
              setBuiltForYouOpen(open);
            }}
            triggerId={builtForYouTriggerId}
          />
        </div>

        <Link
          href="/enterprise"
          className={`lp-navLink${enterpriseActive ? ' lp-navLinkAccent' : ''}`}
          aria-current={enterpriseActive ? 'page' : undefined}
        >
          Enterprise
        </Link>

        <div className="fmm-shell">
          <button
            id={resourcesTriggerId}
            type="button"
            className={`fmm-trigger${resourcesActive ? ' is-routeActive' : ''}`}
            aria-expanded={resourcesOpen}
            aria-haspopup="dialog"
            onClick={toggleResources}
          >
            Resources <span className="fmm-chevron" aria-hidden="true">▾</span>
          </button>
          <ResourcesMegaMenu
            open={resourcesOpen}
            onOpenChange={(open) => {
              if (open) closeOthers('resources');
              setResourcesOpen(open);
            }}
            triggerId={resourcesTriggerId}
          />
        </div>

        <Link
          href="/pricing"
          className={`lp-navLink${pricingActive ? ' lp-navLinkAccent' : ''}`}
          aria-current={pricingActive ? 'page' : undefined}
        >
          Pricing
        </Link>
        <Link href="/features/ai" className="lp-navLink lp-navLinkAccent">
          Panacea AI
        </Link>
      </nav>

      <div className="lp-headerActions">
        <button
          type="button"
          className="lp-mobileFeaturesBtn"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          Menu
        </button>
        <Link href="/login" className="lp-loginBtn ui-btn ui-btn-outline">
          Login
        </Link>
        <Link href="/book-demo" className="lp-demoBtn">
          Book a Demo
        </Link>
      </div>

      <FeaturesMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
