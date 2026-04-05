
import './globals.css';
import Script from 'next/script';
import { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
// import { Geist, Geist_Mono } from '@next/font/google'; // Uncomment if using next/font
// const geist = Geist({ subsets: ["latin"] });
// const geistMono = Geist_Mono({ subsets: ["latin"] });
// If using local font, ensure it's loaded in globals.css and use className="font-sans" as below.

const bodyFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const headingFont = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'groupride - group travel, handled.',
  description: 'Book group transportation for 6-100+ passengers. Airports, events, teams. No charge until confirmed.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} font-sans antialiased`}>
        {googleMapsApiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&language=en`}
            strategy="beforeInteractive"
          />
        )}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
