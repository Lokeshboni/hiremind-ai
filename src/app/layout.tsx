import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HireMind AI | Smart Resume Screening & AI Recruiter',
  description: 'HireMind AI is an enterprise-grade resume parsing, screening, and applicant tracking platform powered by Google Gemini. Streamline your hiring workflow instantly.',
  keywords: ['AI hiring', 'ATS screener', 'resume parsing', 'recruiter dashboard', 'Gemini AI', 'applicant tracking'],
  authors: [{ name: 'HireMind AI Team' }],
  openGraph: {
    title: 'HireMind AI | Next-Gen AI Screening',
    description: 'Transform your recruitment process with AI resume screening, skill gap analysis, and automated ATS matching.',
    type: 'website',
    url: 'https://hiremind-ai.vercel.app',
    siteName: 'HireMind AI',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-neutral-950 text-neutral-100 antialiased flex flex-col`}>
        <SessionProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Toaster position="top-right" theme="dark" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
