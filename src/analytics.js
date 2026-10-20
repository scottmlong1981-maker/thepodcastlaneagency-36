import { GA4_ID } from './config';

/**
 * Loads GA4 only when a measurement ID is configured. With no ID the site
 * behaves normally and no tracking script is requested.
 */
export function initAnalytics() {
  if (!GA4_ID || typeof window === 'undefined') return;
  if (document.querySelector('script[data-ga4]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.dataset.ga4 = 'true';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA4_ID, { anonymize_ip: true });
}

/** No-op when analytics is not configured, so callers never need to guard. */
export function trackEvent(name, params = {}) {
  if (!GA4_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export function trackPageView(path) {
  if (!GA4_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: path });
}
