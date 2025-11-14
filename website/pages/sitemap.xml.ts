import type { GetServerSideProps } from 'next';
import { buildCanonicalUrl } from '../lib/seo';

const STATIC_PATHS = ['/', '/donate'];

const generateSiteMap = () => {
  const urls = STATIC_PATHS.map((path) => {
    const loc = buildCanonicalUrl(path);
    return `
      <url>
        <loc>${loc}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>${path === '/' ? '1.0' : '0.7'}</priority>
      </url>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap.trim());
  res.end();

  return {
    props: {},
  };
};

export default function Sitemap() {
  return null;
}

