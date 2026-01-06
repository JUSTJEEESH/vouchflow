import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VouchFlow - Video Testimonials Made Simple',
  description: 'Collect authentic video testimonials with magic links. No logins. No friction. Just results.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
