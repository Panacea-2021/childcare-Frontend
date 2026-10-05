import type { Metadata } from 'next';
import { Bodoni_Moda, Poppins, Source_Sans_3 } from 'next/font/google';
import { STRIP_EXTENSION_ATTRS_SCRIPT } from '@/lib/stripExtensionAttrs';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

/** Bodoni Moda — sidebar subsection labels. */
const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bodoni-moda',
  display: 'swap',
});

/** Source Sans 3 — Center Management page headings only. */
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Panacea | Childcare Management Software',
  description: 'AI-powered childcare software that helps your center grow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inline head script + suppressHydrationWarning: Bitdefender / Grammarly / ColorZilla
  // inject attrs (bis_skin_checked, etc.) before React hydrates — including on Next internals.
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: STRIP_EXTENSION_ATTRS_SCRIPT }}
        />
      </head>
      <body
        className={`${poppins.variable} ${bodoniModa.variable} ${sourceSans.variable} ${poppins.className}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
