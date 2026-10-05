'use client';

import './loading.css';

type BoneProps = {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
  circle?: boolean;
};

export function SkeletonBone({
  width = '100%',
  height = 14,
  radius = 10,
  className = '',
  circle,
}: BoneProps) {
  return (
    <span
      className={`pl-bone pl-shimmer${className ? ` ${className}` : ''}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : radius,
      }}
      aria-hidden
    />
  );
}

type TableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function TableSkeleton({ rows = 7, className = '' }: TableSkeletonProps) {
  return (
    <div className={`pl-table-skel${className ? ` ${className}` : ''}`} role="status" aria-label="Loading table">
      <SkeletonBone className="pl-table-skel__head" height={44} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="pl-table-skel__row">
          <SkeletonBone className="pl-table-skel__avatar" width={36} height={36} circle />
          <SkeletonBone height={12} width="78%" />
          <SkeletonBone height={12} width="70%" />
          <SkeletonBone height={12} width="65%" />
          <SkeletonBone height={12} width="55%" />
          <SkeletonBone height={12} width="50%" />
          <SkeletonBone width={28} height={28} radius={8} />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="pl-card-skel" role="status" aria-label="Loading card">
      <SkeletonBone height={16} width="42%" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBone key={i} height={12} width={`${88 - i * 12}%`} />
      ))}
      <SkeletonBone height={36} width={120} radius={12} />
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="pl-kpi-skel" role="status" aria-label="Loading summary cards">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBone key={i} className="pl-kpi-skel__card pl-shimmer" height={110} />
      ))}
    </div>
  );
}
