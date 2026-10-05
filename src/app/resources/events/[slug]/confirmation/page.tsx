import type { Metadata } from 'next';
import {
  WEBINAR_EVENTS,
  getWebinarBySlug,
} from '@/components/landing/event-registration/data';
import { EventConfirmationExperience } from '@/components/landing/event-registration/EventConfirmationExperience';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return WEBINAR_EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getWebinarBySlug(slug);
  if (!event) return { title: 'Confirmation | Panacea' };
  return {
    title: `You're registered · ${event.title} | Panacea`,
    description: event.confirmation.descriptionTemplate.replace('{title}', event.title),
  };
}

export default async function EventConfirmationPage({ params }: Props) {
  const { slug } = await params;
  const event = getWebinarBySlug(slug) ?? null;
  return <EventConfirmationExperience event={event} />;
}
