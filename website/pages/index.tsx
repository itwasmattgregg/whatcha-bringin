import Head from 'next/head';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Screenshots from '../components/Screenshots';
import {
  META_DESCRIPTION,
  SITE_NAME,
  buildCanonicalUrl,
  getAbsoluteSocialImage,
  organizationJsonLd,
} from '../lib/seo';

export default function Home() {
  const canonicalUrl = buildCanonicalUrl('/');
  const socialImage = getAbsoluteSocialImage();
  const homeJsonLd = {
    ...organizationJsonLd,
    '@type': 'WebSite',
    name: SITE_NAME,
    url: canonicalUrl,
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${canonicalUrl}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <Head>
        <title>Watcha Bringin — Plan Perfect Potluck Gatherings</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="Watcha Bringin — Plan Perfect Potluck Gatherings" />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content="Watcha Bringin — Plan Perfect Potluck Gatherings" />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:image" content={socialImage} />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Hero />
        <Features />
        <Screenshots />
      </main>
    </>
  );
}

