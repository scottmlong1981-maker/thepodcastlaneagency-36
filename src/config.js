// ---------------------------------------------------------------------------
// Single source of truth for site-wide values.
// REPLACE SITE_URL if the production domain differs from the one listed on the
// show's Apple Podcasts page.
// ---------------------------------------------------------------------------

export const SITE_URL = 'https://www.thepodcastlaneagency.com';

export const SITE_NAME = 'The Podcast Lane';
// The headline shown on link-preview cards, site-wide. Kept separate from each
// page's <title> so the browser tab and search results can stay page-specific
// while every shared link presents one consistent card.
export const SOCIAL_TITLE = 'Full Service Podcast Production Agency';

export const SITE_TAGLINE = 'Connecting people one podcast at a time';

export const LINKS = {
  youtube: 'https://www.youtube.com/@Thepodcastlane',
  youtubePlaylist:
    'https://www.youtube.com/playlist?list=PL2PcECQX5jFTTG9wlPd8fPG0Qj2Dtw-7R',
  apple: 'https://podcasts.apple.com/us/podcast/the-podcast-lane/id1846258935',
  spotify:
    'https://open.spotify.com/show/0mt6uitQ0TTVl1q71nHmy4?si=a8fe79b573394bd5',
  instagram: 'https://www.instagram.com/podcast_lane/',
};

// Verified click-to-call number, shown in the site-wide footer. Previously
// shown only on the 10 in 10 card on Featured Podcasts; moved here so it
// appears on every page instead.
export const PHONE = { display: '602.228.3316', href: 'tel:6022283316' };

// Analytics stays inert until a real measurement ID is supplied.
// Set VITE_GA4_ID in the Netlify dashboard (Site settings > Environment variables).
export const GA4_ID = import.meta.env.VITE_GA4_ID || '';

export const FORM_NAMES = {
  guest: 'guest-request',
  sponsor: 'sponsor-opportunity',
  // Work With Us client inquiries. Kept as a distinct Netlify form so agency
  // leads never mix with guest applications or sponsor inquiries.
  inquiry: 'work-with-us-inquiry',
};

// ---------------------------------------------------------------------------
// LAUNCH DEPENDENCIES
// Each of these is intentionally empty. The corresponding page section renders
// only when a verified value is supplied, so nothing broken or invented ships.
// ---------------------------------------------------------------------------

// Verified Calendly scheduling URL for prospective-client calls. The event is
// known to be named "First Call with Elisa", but no URL has been supplied, so
// the booking section and both secondary CTAs stay hidden. See MISSING-ITEMS.md.
// Pin a specific episode to lead the homepage "From the show" section.
// Leave empty to use whatever video is featured on the YouTube channel home
// (resolved at build time), falling back to the newest episode.
// The episode that leads the Home page and the episode library.
//
// PINNED ON PURPOSE. YouTube's API only exposes the "channel trailer for
// unsubscribed viewers" (brandingSettings.unsubscribedTrailer). The video shown
// at the top of the channel Home tab is the separate "featured video" slot,
// which the API does not expose, so it cannot be tracked automatically.
//
// To change the featured episode, paste the new video id here. It is the part
// after "v=" in the watch URL. If the id is not in the episode data yet, the
// newest episode leads instead until the next build syncs it.
export const FEATURED_EPISODE_ID = 'V7ZTffZ622s'; // Make Your Bold Brave Move Featuring Denise Mehr

export const CALENDLY_URL = '';
export const CALENDLY_EVENT_NAME = 'First Call with Elisa';

// Learn More points at the show's own site, which is a different property from
// this agency site. Confirmed destination; not the canonical domain here.
export const LEARN_MORE_ROUTE = 'https://www.thepodcastlane.com/';

// Supplied "As Seen On" graphic. The artwork already contains its own heading,
// so the page must not print a second visible one. 1440x492.
export const AS_SEEN_ON_IMAGE = '/as-seen-on.png';

// Payment/deposit is NOT implemented. No approved amount, purpose, or
// production payment destination exists. Do not wire this up without written
// approval and a verified live destination.
export const PAYMENT_ENABLED = false;
