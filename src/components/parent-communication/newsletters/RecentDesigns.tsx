'use client';

import { BookOpen, Flag, HeartHandshake, Plus, Quote, Sparkles, Star } from 'lucide-react';
import type { NewsletterItem } from '@/types/newsletter';
import { newsletterThemeTone } from '@/components/parent-communication/pcCardTones';

type Props = {
  items: NewsletterItem[];
  onCreate: () => void;
  onOpen: (id: string) => void;
};

type DesignTheme = 'parents' | 'learning' | 'independence' | 'stem' | 'default';

function themeFor(item: NewsletterItem): DesignTheme {
  const t = item.title.toLowerCase();
  if (t.includes('parent') || item.id === 'nl-tpl-1') return 'parents';
  if (t.includes('learning') || t.includes('highlight')) return 'learning';
  if (t.includes('independence') || t.includes('celebration')) return 'independence';
  if (t.includes('stem')) return 'stem';
  return 'default';
}

function DesignArt({ theme }: { theme: DesignTheme }) {
  if (theme === 'parents') {
    return (
      <div className="nl-art nl-art-parents" aria-hidden>
        <span className="nl-art-blob b1" />
        <span className="nl-art-blob b2" />
        <span className="nl-art-float f1">
          <HeartHandshake size={18} />
        </span>
        <span className="nl-art-float f2">
          <Quote size={16} />
        </span>
        <span className="nl-art-float f3">
          <Star size={14} />
        </span>
        <div className="nl-art-scene nl-art-scene-parents">
          <div className="nl-art-avatar a1">S</div>
          <div className="nl-art-avatar a2">P</div>
          <div className="nl-art-bubble">
            “Truly caring teachers…”
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'learning') {
    return (
      <div className="nl-art nl-art-learning" aria-hidden>
        <span className="nl-art-blob b1" />
        <span className="nl-art-blob b2" />
        <span className="nl-art-float f1">
          <BookOpen size={18} />
        </span>
        <span className="nl-art-float f2">
          <Sparkles size={15} />
        </span>
        <div className="nl-art-scene nl-art-scene-learning">
          <div className="nl-art-book book1" />
          <div className="nl-art-book book2" />
          <div className="nl-art-book book3" />
          <div className="nl-art-pencil" />
        </div>
      </div>
    );
  }

  if (theme === 'independence') {
    return (
      <div className="nl-art nl-art-independence" aria-hidden>
        <span className="nl-art-blob b1" />
        <span className="nl-art-blob b2" />
        <span className="nl-art-float f1">
          <Flag size={17} />
        </span>
        <span className="nl-art-spark s1" />
        <span className="nl-art-spark s2" />
        <span className="nl-art-spark s3" />
        <div className="nl-art-scene nl-art-scene-independence">
          <div className="nl-art-flag">
            <span className="band saffron" />
            <span className="band white">
              <span className="chakra" />
            </span>
            <span className="band green" />
          </div>
          <div className="nl-art-burst" />
        </div>
      </div>
    );
  }

  return (
    <div className="nl-art nl-art-default" aria-hidden>
      <span className="nl-art-blob b1" />
      <span className="nl-art-blob b2" />
      <span className="nl-art-float f1">
        <Sparkles size={16} />
      </span>
    </div>
  );
}

export function RecentDesigns({ items, onCreate, onOpen }: Props) {
  const recent = items.slice(0, 3);

  return (
    <section className="nl-designs-section" aria-label="Recent designs">
      <h2 className="nl-section-title">Recent Designs</h2>
      <div className="nl-designs">
        <button type="button" className="nl-design-card is-create pc-tone-purple" onClick={onCreate}>
          <span className="nl-create-plus" aria-hidden>
            <Plus size={22} />
          </span>
          Create a new Newsletter
        </button>

        {recent.map((item) => {
          const theme = themeFor(item);
          return (
            <button
              key={item.id}
              type="button"
              className={`nl-design-card nl-design-card--${theme} pc-tone-${newsletterThemeTone(theme)}`}
              onClick={() => onOpen(item.id)}
              style={{ ['--nl-preview' as string]: item.previewColor }}
            >
              <div className="nl-design-preview">
                <DesignArt theme={theme} />
                {item.isTemplate || item.status === 'template' ? (
                  <span className="nl-design-badge">Template</span>
                ) : null}
              </div>
              <div className="nl-design-meta">
                <strong>{item.title}</strong>
                <span>{item.updatedOn}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
