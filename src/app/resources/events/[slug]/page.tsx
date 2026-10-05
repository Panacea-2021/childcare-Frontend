import type { Metadata } from 'next';
import {
  WEBINAR_EVENTS,
  getWebinarBySlug,
} from '@/components/landing/event-registration/data';
import { EventRegistrationExperience } from '@/components/landing/event-registration/EventRegistrationExperience';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return WEBINAR_EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getWebinarBySlug(slug);
  if (!event) return { title: 'Event | Panacea' };
  return {
    title: `${event.title} | Panacea Events`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      type: 'website',
    },
  };
}

export default async function EventRegistrationPage({ params }: Props) {
  const { slug } = await params;
  const event = getWebinarBySlug(slug) ?? null;
  return <EventRegistrationExperience event={event} />;
}
