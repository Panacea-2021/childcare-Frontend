'use client';

import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { CONTACT_INFO } from '../blogs/data';
import { fadeUp } from '../blogs/motion';

type Office = (typeof CONTACT_INFO.offices)[number];
type Call = (typeof CONTACT_INFO.phones)[number];

export function OfficeCard({ office, index }: { office: Office; index: number }) {
  return (
    <motion.div
      className="ct-miniCard"
      variants={fadeUp}
      transition={{ delay: index * 0.07 }}
    >
      <span className="ct-miniBadge" aria-hidden>
        {office.iso}
      </span>
      <span className="ct-miniText">
        <strong>{office.region}</strong>
        <em>{office.detail}</em>
      </span>
    </motion.div>
  );
}

export function OfficeGrid() {
  return (
    <motion.div
      className="ct-miniGrid"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {CONTACT_INFO.offices.map((office, i) => (
        <OfficeCard key={office.region} office={office} index={i} />
      ))}
    </motion.div>
  );
}

export function CallCard({ contact, index }: { contact: Call; index: number }) {
  return (
    <motion.a
      href={`tel:${contact.value.replace(/[^\d+]/g, '')}`}
      className="ct-miniCard ct-miniCard--call"
      variants={fadeUp}
      transition={{ delay: index * 0.07 }}
    >
      <span className="ct-miniBadge" aria-hidden>
        {contact.iso}
      </span>
      <span className="ct-miniText">
        <strong>
          <Phone size={11} aria-hidden /> {contact.region}
        </strong>
        <em>{contact.value}</em>
      </span>
    </motion.a>
  );
}

export function CallGrid() {
  return (
    <motion.div
      className="ct-miniGrid"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07 } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {CONTACT_INFO.phones.map((contact, i) => (
        <CallCard key={contact.region} contact={contact} index={i} />
      ))}
    </motion.div>
  );
}
