import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoastLine — Personal Financial Lifecycle Planner',
  description: 'See when you retire. See what\'s stopping you. Fix it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
