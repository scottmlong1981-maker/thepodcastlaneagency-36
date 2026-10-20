import { LINKS } from '../config';

const AppleMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 1.5a8.4 8.4 0 0 0-8.4 8.4c0 3.3 1.9 6.2 4.7 7.6l-.6 2.4a.9.9 0 0 0 .9 1.1h6.8a.9.9 0 0 0 .9-1.1l-.6-2.4a8.4 8.4 0 0 0 4.7-7.6A8.4 8.4 0 0 0 12 1.5Zm0 4.7a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4Z" />
  </svg>
);

const SpotifyMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.4 14.5a.8.8 0 0 1-1.1.3c-3-1.8-6.7-2.2-11.1-1.2a.8.8 0 1 1-.3-1.5c4.8-1.1 8.9-.6 12.2 1.4a.8.8 0 0 1 .3 1Zm1.2-2.9a1 1 0 0 1-1.3.3c-3.4-2.1-8.6-2.7-12.6-1.5a1 1 0 1 1-.6-1.9c4.6-1.4 10.3-.7 14.2 1.7a1 1 0 0 1 .3 1.4Zm.1-3a12 12 0 0 0-6.2-1.5c-2.7 0-5 .4-7 1a1.2 1.2 0 1 1-.7-2.3A25 25 0 0 1 11.5 7c2.8 0 5.4.5 7.5 1.7a1.2 1.2 0 0 1-1.3 2Z" />
  </svg>
);

const InstagramMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.42.46.66.26 1.22.6 1.77 1.16.56.55.9 1.11 1.16 1.77.24.63.41 1.36.46 2.42.05 1.06.06 1.42.06 4.13s-.01 3.07-.06 4.13c-.05 1.06-.22 1.79-.46 2.42a4.9 4.9 0 0 1-1.16 1.77c-.55.56-1.11.9-1.77 1.16-.63.24-1.36.41-2.42.46-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.42-.46a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.24-.63-.41-1.36-.46-2.42C2.01 15.07 2 14.71 2 12s.01-3.07.06-4.13c.05-1.06.22-1.79.46-2.42.26-.66.6-1.22 1.16-1.77.55-.56 1.11-.9 1.77-1.16.63-.24 1.36-.41 2.42-.46C8.94 2.01 9.3 2 12 2Zm0 1.8c-2.66 0-2.98.01-4.03.06-.97.04-1.5.21-1.85.34-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.13.35-.3.88-.34 1.85-.05 1.05-.06 1.37-.06 4.05s.01 3 .06 4.05c.04.97.21 1.5.34 1.85.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.13.88.3 1.85.34 1.05.05 1.37.06 4.03.06s2.98-.01 4.03-.06c.97-.04 1.5-.21 1.85-.34.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.13-.35.3-.88.34-1.85.05-1.05.06-1.37.06-4.05s-.01-3-.06-4.05c-.04-.97-.21-1.5-.34-1.85a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.35-.13-.88-.3-1.85-.34-1.05-.05-1.37-.06-4.03-.06Zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28Zm0 1.8a3.34 3.34 0 1 0 0 6.68 3.34 3.34 0 0 0 0-6.68Zm5.34-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
  </svg>
);

/**
 * The single platform-link component for the whole site.
 * `variant="bar"` renders the compact row used directly under the homepage hero.
 */
export default function PlatformButtons({ variant = 'default', action = false }) {
  // `action` switches the kicker to Subscribe/Follow verbs for the
  // "Listen and Follow" section; elsewhere the neutral wording is kept.
  const verb = {
    apple: action ? 'Subscribe on' : 'Listen on',
    spotify: action ? 'Subscribe on' : 'Listen on',
    youtube: action ? 'Subscribe on' : 'Watch on',
    instagram: action ? 'Follow on' : 'Follow on',
  };

  return (
    <div className={`platforms${variant === 'bar' ? ' platforms--bar' : ''}`}>
      <a
        className="platform"
        href={LINKS.apple}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${action ? 'Subscribe to' : 'Listen to'} The Podcast Lane on Apple Podcasts, opens in a new tab`}
      >
        <AppleMark />
        <span className="platform__label">
          <span>{verb.apple}</span>
          <span>Apple Podcasts</span>
        </span>
      </a>
      <a
        className="platform"
        href={LINKS.spotify}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${action ? 'Subscribe to' : 'Listen to'} The Podcast Lane on Spotify, opens in a new tab`}
      >
        <SpotifyMark />
        <span className="platform__label">
          <span>{verb.spotify}</span>
          <span>Spotify</span>
        </span>
      </a>
      <a
        className="platform"
        href={LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow The Podcast Lane on Instagram, opens in a new tab"
      >
        <InstagramMark />
        <span className="platform__label">
          <span>{verb.instagram}</span>
          <span>Instagram</span>
        </span>
      </a>
      <a
        className="platform"
        href={LINKS.youtube}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${action ? 'Subscribe to' : 'Watch'} The Podcast Lane on YouTube, opens in a new tab`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
        </svg>
        <span className="platform__label">
          <span>{verb.youtube}</span>
          <span>YouTube</span>
        </span>
      </a>
    </div>
  );
}
