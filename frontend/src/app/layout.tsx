import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Artifact Management',
  description: 'Browse, upload, and monitor pipeline artifacts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
