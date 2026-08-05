import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import baseConfig from "@configs/base";
import Thumnail from "@/assets/images/case-smeg-thumb.png"
import Facion from "@/assets/images/logo-facion.ico"
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
    icon: `${Facion.src}`,
    shortcut: `${Facion.src}`,
  },

  title: {
    default:
      'Kosmo - Admin',
    template:
      '%s | Kosmo - Admin',
  },

  description:
    'Kosmo - Admin',

  keywords: [
    'tiêu chuẩn đo lường chất lượng',
    'kiểm định',
    'hiệu chuẩn',
    'thử nghiệm',
    'chuẩn đo lường',
    'kiểm định thiết bị y tế',
    'đo lường',
    'chất lượng sản phẩm',
    'quy chuẩn kỹ thuật',
    'dịch vụ khoa học công nghệ',
    'Sở Khoa học và Công nghệ TP.HCM',
    'kiểm định an toàn thiết bị y tế',
  ],

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
      'Kosmo - Admin',
    description:
      'Kosmo - Admin',
    url: baseConfig.frontendDomain,
    siteName:
      'Kosmo - Admin',
    images: [
      {
        url: `${baseConfig.frontendDomain}/${Thumnail.src}`,
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
      'Kosmo - Admin',
    description:
      'Kosmo - Admin',
    images: [`${baseConfig.frontendDomain}/${Thumnail.src}`],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
