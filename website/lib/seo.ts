const FALLBACK_SITE_URL = 'https://whatcha-bringin.app';

export const SITE_NAME = 'Watcha Bringin';
export const META_DESCRIPTION =
  'Watcha Bringin helps you plan potluck gatherings without duplicate dishes—create invites, coordinate items, and keep everyone in sync.';
export const SOCIAL_IMAGE_PATH = '/social-card.png';

export const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || FALLBACK_SITE_URL;

export const buildCanonicalUrl = (path = '/') => {
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${formattedPath === '/' ? '' : formattedPath}`;
};

export const getAbsoluteSocialImage = () => `${getSiteUrl()}${SOCIAL_IMAGE_PATH}`;

export const defaultSeo = {
  title: 'Watcha Bringin — Plan The Perfect Potluck',
  description: META_DESCRIPTION,
  keywords: [
    'potluck planning app',
    'gathering organizer',
    'party planning',
    'watcha bringin',
    'shared shopping list',
  ].join(', '),
  themeColor: '#16a34a',
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: SITE_NAME,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'iOS, Android',
  description: META_DESCRIPTION,
  url: getSiteUrl(),
  image: getAbsoluteSocialImage(),
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
};

