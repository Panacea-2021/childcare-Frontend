import type { Metadata } from 'next';
import {
  EVENTS,
  getEventBySlug,
} from '@/components/landing/events-webinars/data';
import { EventDetailExperience } from '@/components/landing/events-webinars/EventDetailExperience';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return EVENTS.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: 'Event unavailable | Panacea' };
  return {
    title: `${event.title} | Panacea Events`,
    description: event.excerpt ?? `${event.title} — ${event.date} | ${event.day}`,
    openGraph: {
      title: `${event.title} | Panacea Events`,
      description: event.excerpt ?? event.location,
      images: [{ url: event.imageUrl, alt: event.title }],
      type: 'article',
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug) ?? null;
  return <EventDetailExperience event={event} />;
}
