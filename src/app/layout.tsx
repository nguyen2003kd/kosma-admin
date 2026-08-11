import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import baseConfig from "@configs/base";
import thumbnail from "@/assets/images/kosmo-thumb.png"
import favicon from "@/assets/images/logo-favicon.ico"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  icons: {
    icon: `${favicon.src}`,
    shortcut: `${favicon.src}`,
  },

  title: {
    default:
      'Kosmo DNC - Admin',
    template:
      '%s | Kosmo DNC - Admin',
  },

  description:
    'Kosmo DNC - Admin',

  robots: {
    index: false,
    follow: false,
    nocache: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },

  openGraph: {
    title:
      'Kosmo DNC - Admin',
    description:
      'Kosmo DNC - Admin',
    url: baseConfig.frontendDomain,
    siteName:
      'Kosmo DNC - Admin',
    images: [
      {
        url: `${baseConfig.frontendDomain}/${thumbnail.src}`,
        width: 1200,
        height: 630,
        alt:
          'Kosmo - Admin',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title:
      'Kosmo DNC - Admin',
    description:
      'Kosmo DNC - Admin',
    images: [`${baseConfig.frontendDomain}/${thumbnail.src}`],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
