import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { VTSProvider } from '@/contexts/VTSContext';
import { AIProvider } from '@/contexts/AIContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VTS Solution - IT GIS Solutions',
  description: 'Comprehensive Vehicle Tracking System with advanced security controls, real-time monitoring, and AI customer support.',
  keywords: 'vehicle tracking, fleet management, GPS tracking, geofencing, vehicle security, fuel control, immobilizer',
  authors: [{ name: 'IT GIS Solutions' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'VTS Solution - IT GIS Solutions',
    description: 'Advanced Vehicle Tracking System for comprehensive fleet management',
    type: 'website',
    siteName: 'VTS Solution',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Leaflet CSS for maps */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VTS Solution" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <VTSProvider>
              <AIProvider>
                <div className="min-h-screen bg-background">
                  {children}
                </div>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 5000,
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
              </AIProvider>
            </VTSProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}