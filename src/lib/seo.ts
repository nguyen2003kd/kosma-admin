import { Metadata } from 'next';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = "High-performance Next.js admin dashboard for kosmo quality testing management",
  image = "/images/default-og-image.jpg",
  url = "",
  type = 'website',
  noIndex = false,
}: SeoProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kosmo-admin.vercel.app';
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  return {
    title: {
      default: title,
      template: `%s | Kosmo Admin`,
    },
    description,
    keywords: [
      'quality testing',
      'kiểm định chất lượng',
      'thử nghiệm',
      'Kosmo',
      'admin dashboard'
    ],
    authors: [{ name: 'Kosmo Team' }],
    creator: 'Kosmo',
    publisher: 'Kosmo',

    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    openGraph: {
      type,
      title,
      description,
      url: fullUrl,
      siteName: 'Kosmo Admin',
      images: [{
        url: fullImageUrl,
        width: 1200,
        height: 630,
        alt: title,
      }],
      locale: 'vi_VN',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: '@kosmo',
    },

    alternates: {
      canonical: fullUrl,
    },

    metadataBase: new URL(baseUrl),
  };
}