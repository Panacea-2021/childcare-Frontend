'use client';

import { useEffect, useState } from 'react';
import type { ArticleReactionKind } from './data';
import { getStoredReaction, submitArticleReaction } from './service';

const OPTIONS: { kind: ArticleReactionKind; emoji: string; label: string }[] = [
  { kind: 'NOT_HELPFUL', emoji: '😞', label: 'Not really' },
  { kind: 'NEUTRAL', emoji: '😐', label: 'Somewhat' },
  { kind: 'HELPFUL', emoji: '😃', label: 'Yes!' },
];

export function ArticleReaction({ articleId }: { articleId: string }) {
  const [selected, setSelected] = useState<ArticleReactionKind | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const stored = getStoredReaction(articleId);
    if (stored) {
      setSelected(stored);
      setSubmitted(true);
    }
  }, [articleId]);

  const onPick = async (kind: ArticleReactionKind) => {
    if (pending) return;
    if (submitted && selected === kind) return;
    setSelected(kind);
    setPending(true);
    try {
      await submitArticleReaction(articleId, kind);
      setSubmitted(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="pg-reaction" aria-labelledby="pg-reaction-title">
      <h3 id="pg-reaction-title">
        {submitted ? 'Thanks for your feedback!' : 'Did this answer your question?'}
      </h3>
      <div className="pg-reaction-row" role="group" aria-label="Article feedback">
        {OPTIONS.map((o) => (
          <button
            key={o.kind}
            type="button"
            className={`pg-reaction-btn${selected === o.kind ? ' is-selected' : ''}${
              submitted && selected !== o.kind ? ' is-dimmed' : ''
            }`}
            title={o.label}
            aria-label={o.label}
            aria-pressed={selected === o.kind}
            disabled={pending}
            onClick={() => onPick(o.kind)}
          >
            {o.emoji}
          </button>
        ))}
      </div>
      {submitted ? <p className="pg-reaction-thanks">We appreciate you helping us improve.</p> : null}
    </section>
  );
}
