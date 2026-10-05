'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES: { id: string; label: string; icon: string; emojis: string[] }[] = [
  {
    id: 'recent',
    label: 'Recent',
    icon: '🕓',
    emojis: ['👍', '❤️', '😊', '🎉', '🙏', '👏', '⭐', '📚'],
  },
  {
    id: 'smileys',
    label: 'Smileys',
    icon: '😊',
    emojis: ['😀', '😁', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😜', '🤗', '🤔', '😴', '😢', '😭', '😡', '🥳', '😎', '🤩', '😌', '😅'],
  },
  {
    id: 'animals',
    label: 'Animals',
    icon: '🐾',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐝', '🦋', '🐢', '🐙'],
  },
  {
    id: 'food',
    label: 'Food',
    icon: '🍎',
    emojis: ['🍎', '🍌', '🍓', '🍉', '🍇', '🍊', '🥕', '🌽', '🍕', '🍔', '🍟', '🍪', '🎂', '🍩', '🍦', '🧃', '🥛', '☕', '🥪', '🥗'],
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: '✈️',
    emojis: ['🚗', '🚌', '🚲', '✈️', '🚀', '🏠', '🏫', '🏞️', '⛺', '⛱️', '🗺️', '🧭', '⏰', '🌙', '☀️', '🌈'],
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: '📎',
    emojis: ['📱', '💻', '⌚', '📷', '🎧', '📚', '✏️', '📎', '📁', '🎁', '🧸', '🔔', '🔑', '💡', '🔒', '📌'],
  },
  {
    id: 'flags',
    label: 'Flags',
    icon: '🏳️',
    emojis: ['🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇯🇵', '🇩🇪', '🇫🇷', '🇦🇪', '🇸🇬', '🏳️', '🏁', '🚩'],
  },
  {
    id: 'school',
    label: 'School',
    icon: '🏫',
    emojis: ['🏫', '🎒', '📚', '📖', '✏️', '📝', '📐', '📏', '🔬', '🧪', '🎨', '🎭', '🏀', '⚽', '🏆', '🥇'],
  },
  {
    id: 'education',
    label: 'Education',
    icon: '🎓',
    emojis: ['🎓', '🧑‍🏫', '👨‍🎓', '👩‍🎓', '🧠', '💡', '📊', '📈', '🗂️', '🗓️', '✅', '⭐', '🌟', '💯'],
  },
  {
    id: 'frequent',
    label: 'Frequent',
    icon: '⭐',
    emojis: ['👍', '❤️', '😊', '🎉', '🙏', '👏', '✅', '🔥', '💪', '🌈', '📌', '✨'],
  },
];

type Props = {
  onPick: (emoji: string) => void;
  onClose: () => void;
};

export function EmojiPicker({ onPick, onClose }: Props) {
  const [cat, setCat] = useState('smileys');
  const emojis = useMemo(() => CATEGORIES.find((c) => c.id === cat)?.emojis ?? [], [cat]);

  return (
    <motion.div
      className="pm-popover"
      role="dialog"
      aria-label="Emoji picker"
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="pm-emoji-cats" role="tablist">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-label={c.label}
            aria-selected={cat === c.id}
            className={cat === c.id ? 'is-active' : ''}
            onClick={() => setCat(c.id)}
            title={c.label}
          >
            {c.icon}
          </button>
        ))}
      </div>
      <div className="pm-emoji-grid">
        {emojis.map((e) => (
          <button key={e} type="button" onClick={() => onPick(e)} aria-label={`Insert ${e}`}>
            {e}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
