import type { Metadata } from 'next';
import { ContactExperience } from '@/components/landing/contact/ContactExperience';

export const metadata: Metadata = {
  title: 'Contact Us | Panacea Childcare Software',
  description:
    'Get in touch with Panacea — sales, support, and global offices ready to help your childcare center grow.',
};

export default function ContactPage() {
  return <ContactExperience />;
}
