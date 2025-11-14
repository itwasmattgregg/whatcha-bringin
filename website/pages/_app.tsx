import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';
import {
  defaultSeo,
  buildCanonicalUrl,
  getAbsoluteSocialImage,
  SITE_NAME,
} from '../lib/seo';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const canonicalUrl = buildCanonicalUrl(router.asPath?.split('?')[0] || '/');

  return (
    <>
      <Head>
        <title>{defaultSeo.title}</title>
        <meta name='description' content={defaultSeo.description} />
        <meta name='keywords' content={defaultSeo.keywords} />
        <meta name='theme-color' content={defaultSeo.themeColor} />
        <meta name='robots' content='index, follow' />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content={SITE_NAME} />
        <meta property='og:title' content={defaultSeo.title} />
        <meta property='og:description' content={defaultSeo.description} />
        <meta property='og:image' content={getAbsoluteSocialImage()} />
        <meta property='og:url' content={canonicalUrl} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={defaultSeo.title} />
        <meta name='twitter:description' content={defaultSeo.description} />
        <meta name='twitter:image' content={getAbsoluteSocialImage()} />
        <link rel='canonical' href={canonicalUrl} />
        <link rel='icon' href='/favicon.png' sizes='32x32' type='image/png' />
        <link rel='apple-touch-icon' href='/favicon.png' />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
