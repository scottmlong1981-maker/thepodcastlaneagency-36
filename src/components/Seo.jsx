import { useEffect } from 'react';
import { SITE_URL, SITE_NAME, SOCIAL_TITLE } from '../config';

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/**
 * Sets per-page title, description, canonical, social metadata and JSON-LD.
 * Deliberately dependency-free - no helmet library for six static routes.
 */
export default function Seo({ title, description, path = '/', image, jsonLd, noindex = false }) {
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`;
  // Purpose-built 1200x630 card. The logo alone is nearly square, which social
  // platforms render as a small or awkwardly cropped preview.
  const ogImage = image || `${SITE_URL}/og-image.jpg`;

  useEffect(() => {
    document.title = fullTitle;

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Pages shared by direct link only should stay out of search results.
    let robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, follow');
    } else if (robots) {
      robots.remove();
    }

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: SOCIAL_TITLE });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: SOCIAL_TITLE });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    upsertMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: 'The Podcast Lane 10 in 10 Series',
    });
  }, [fullTitle, description, url, ogImage, noindex]);

  useEffect(() => {
    if (!jsonLd) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.pageSchema = 'true';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLd]);

  return null;
}
