'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildEnquiriesDashboardData } from './mockData';
import type { ChartRange, DateRangePreset, EnquiriesDashboardData, SectionState } from './types';

export function useEnquiriesDashboard() {
  const [preset, setPreset] = useState<DateRangePreset>('last30');
  const [chartRange, setChartRange] = useState<ChartRange>(30);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [data, setData] = useState<EnquiriesDashboardData | null>(null);
  const [status, setStatus] = useState<SectionState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [nonce, setNonce] = useState(0);
  const softRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const soft = softRef.current;
    softRef.current = false;

    if (soft) setRefreshing(true);
    else setStatus('loading');

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const next = buildEnquiriesDashboardData(
          preset,
          chartRange,
          `${customFrom}|${customTo}|${nonce}`,
        );
        setData(next);
        setStatus('ready');
      } catch {
        setData(null);
        setStatus('error');
      } finally {
        setRefreshing(false);
      }
    }, soft ? 420 : 680);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [preset, chartRange, customFrom, customTo, nonce]);

  const refresh = useCallback(() => {
    softRef.current = true;
    setNonce((n) => n + 1);
  }, []);

  const retry = useCallback(() => {
    softRef.current = false;
    setNonce((n) => n + 1);
  }, []);

  return {
    data,
    status,
    preset,
    chartRange,
    customFrom,
    customTo,
    refreshing,
    setPreset,
    setChartRange,
    setCustomFrom,
    setCustomTo,
    refresh,
    retry,
  };
}
