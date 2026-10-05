'use client';

import { motion } from 'framer-motion';
import { pageMotion, staggerContainer, staggerItem } from '../animations';
import { DashboardHeader } from './DashboardHeader';
import { KpiRow } from './KpiRow';
import {
  CommunicationCard,
  ConversionFunnelCard,
  ConversionPerformanceCard,
  EnquiryOverviewCard,
  EnquirySourcesCard,
  TopSourcesCard,
} from './ChartCards';
import {
  ActivityTimelineCard,
  AutomationsCard,
  CampaignPerformanceCard,
  FacebookOverviewCard,
  FormsOverviewCard,
  RecentEnquiriesCard,
  TaskOverviewCard,
  WhatsAppOverviewCard,
} from './ModuleCards';
import { DashError, DashSkeleton } from './shared';
import { useEnquiriesDashboard } from './useEnquiriesDashboard';
import '@/components/app/dashboard.css';
import '../enquiries.css';
import './enquiries-dashboard.css';

export function EnquiriesOverviewDashboard() {
  const {
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
  } = useEnquiriesDashboard();

  const sectionState = status === 'error' ? 'error' : status === 'loading' ? 'loading' : 'ready';
  const animateKpis = status === 'ready' && !refreshing;

  return (
    <motion.div
      className="enq-page mod-page dash-page edash-page"
      initial={pageMotion.initial}
      animate={pageMotion.animate}
      transition={pageMotion.transition}
    >
      <DashboardHeader
        preset={preset}
        customFrom={customFrom}
        customTo={customTo}
        refreshing={refreshing || status === 'loading'}
        onPresetChange={setPreset}
        onCustomFrom={setCustomFrom}
        onCustomTo={setCustomTo}
        onRefresh={refresh}
      />

      {status === 'error' && !data ? (
        <div className="edash-boot-error">
          <DashError onRetry={retry} />
        </div>
      ) : status === 'loading' && !data ? (
        <div className="edash-boot-loading" aria-busy="true" aria-label="Loading dashboard">
          <div className="edash-kpi-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="edash-kpi edash-kpi-skel">
                <DashSkeleton rows={3} />
              </div>
            ))}
          </div>
          <DashSkeleton rows={6} />
        </div>
      ) : data ? (
        <motion.div
          className="edash-grid"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          key={`${preset}-${chartRange}-${customFrom}-${customTo}`}
        >
          <motion.div variants={staggerItem} className="edash-span-full">
            <KpiRow items={data.kpis} animate={animateKpis} />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-8">
            <EnquiryOverviewCard
              data={data.overview}
              range={chartRange}
              onRangeChange={setChartRange}
              state={sectionState}
              onRetry={retry}
            />
          </motion.div>
          <motion.div variants={staggerItem} className="edash-span-4">
            <EnquirySourcesCard
              sources={data.sources}
              total={data.kpis[0]?.value ?? 0}
              state={sectionState}
              onRetry={retry}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-7">
            <ConversionFunnelCard stages={data.funnel} state={sectionState} onRetry={retry} />
          </motion.div>
          <motion.div variants={staggerItem} className="edash-span-5">
            <TaskOverviewCard
              metrics={data.taskMetrics}
              rows={data.tasksDueToday}
              state={sectionState}
              onRetry={retry}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-6">
            <ActivityTimelineCard items={data.activity} state={sectionState} onRetry={retry} />
          </motion.div>
          <motion.div variants={staggerItem} className="edash-span-6">
            <FormsOverviewCard forms={data.forms} state={sectionState} onRetry={retry} />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-6">
            <AutomationsCard data={data.automations} state={sectionState} onRetry={retry} />
          </motion.div>
          <motion.div variants={staggerItem} className="edash-span-6">
            <CampaignPerformanceCard
              kpis={data.campaignKpis}
              chart={data.campaignChart}
              rows={data.campaigns}
              state={sectionState}
              onRetry={retry}
            />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-6">
            <FacebookOverviewCard data={data.facebook} state={sectionState} onRetry={retry} />
          </motion.div>
          <motion.div variants={staggerItem} className="edash-span-6">
            <WhatsAppOverviewCard data={data.whatsapp} state={sectionState} onRetry={retry} />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-full">
            <CommunicationCard channels={data.channels} state={sectionState} onRetry={retry} />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-5">
            <ConversionPerformanceCard
              overall={data.conversionOverall}
              bySource={data.conversionBySource}
              state={sectionState}
              onRetry={retry}
            />
          </motion.div>
          <motion.div variants={staggerItem} className="edash-span-7">
            <TopSourcesCard rows={data.topSources} state={sectionState} onRetry={retry} />
          </motion.div>

          <motion.div variants={staggerItem} className="edash-span-full">
            <RecentEnquiriesCard rows={data.recentEnquiries} state={sectionState} onRetry={retry} />
          </motion.div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
