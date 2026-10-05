'use client';

import React, { useState } from 'react';
import { Video, Play, X } from 'lucide-react';
import type { YoutubePreviewData } from '@/types/activity';
import './activities.css';

interface YoutubePreviewProps {
  value: YoutubePreviewData | null;
  onChange: (v: YoutubePreviewData | null) => void;
}

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function parseYoutubeVideoId(url: string): string | null {
  const match = url.trim().match(YOUTUBE_ID_REGEX);
  return match ? match[1] : null;
}

export const YoutubePreview: React.FC<YoutubePreviewProps> = ({ value, onChange }) => {
  const [urlInput, setUrlInput] = useState(value?.url ?? '');

  const handlePreview = () => {
    const videoId = parseYoutubeVideoId(urlInput);
    if (!videoId) return;

    onChange({
      url: urlInput.trim(),
      videoId,
      title: `YouTube Video (${videoId})`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });
  };

  const handleClear = () => {
    setUrlInput('');
    onChange(null);
  };

  return (
    <div className="act-youtube act-step">
      <div className="act-youtube-header">
        <Video size={16} color="var(--color-danger, #e53935)" />
        Step 7: YouTube Video
      </div>

      <div className="act-youtube-input-row">
        <input
          type="text"
          className="act-youtube-input"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste YouTube URL (youtube.com/watch?v= or youtu.be/)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handlePreview();
            }
          }}
        />
        <button type="button" className="act-youtube-preview-btn" onClick={handlePreview}>
          Preview
        </button>
      </div>

      {value && (
        <div className="act-youtube-preview">
          <img src={value.thumbnail} alt={value.title} />
          <div className="act-youtube-preview-overlay">
            <div>
              <div className="act-youtube-play-icon">
                <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700 }}>
                {value.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="act-youtube-clear"
            onClick={handleClear}
            aria-label="Remove YouTube preview"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
