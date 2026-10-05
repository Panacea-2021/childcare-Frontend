'use client';

import React from 'react';

interface StudentAvatarProps {
  name: string;
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 40,
  md: 52,
  lg: 80,
};

export function StudentAvatar({
  name,
  initials,
  color,
  size = 'md',
  className = '',
}: StudentAvatarProps) {
  const px = sizeMap[size];

  return (
    <div
      className={`pc-avatar pc-avatar-${size} ${className}`.trim()}
      style={{
        width: px,
        height: px,
        background: `linear-gradient(145deg, ${color} 0%, ${color}cc 100%)`,
      }}
      role="img"
      aria-label={`${name} avatar`}
    >
      <span aria-hidden>{initials}</span>
    </div>
  );
}
