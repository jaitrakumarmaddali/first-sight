import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/AuthContext';

export const metadata: Metadata = {
  title: 'First Sight — AI that sees what you\'re working on and helps before you ask',
  description: 'First Sight is an autonomous proactive multimodal AI workspace that observes developer activity, detects blockers, reasons with Gemini, and executes verified actions.',
  keywords: ['First Sight', 'Proactive AI', 'Gemini', 'Autonomous Copilot', 'Hackathon'],
  authors: [{ name: 'First Sight Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#080A0F] text-gray-200 antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
