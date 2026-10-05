import type { Metadata } from 'next';
import { EventsWebinarsExperience } from '@/components/landing/events-webinars/EventsWebinarsExperience';

export const metadata: Metadata = {
  title: 'Events & Webinars | Panacea',
  description:
    'Discover upcoming childcare webinars, early-years events, leadership sessions, podcasts and recorded workshops from Panacea.',
  openGraph: {
    title: 'Events & Webinars | Panacea',
    description:
      'Live webinars, workshops, and podcasts for early-years leaders and educators.',
    type: 'website',
  },
};

export default function EventsWebinarsPage() {
  return <EventsWebinarsExperience />;
}
