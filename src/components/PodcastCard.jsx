import { useState } from 'react';

const monogram = (name) =>
  name
    .replace(/^(The|A)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Cover art, falling back to initials if the image is missing or blocked. */
function Artwork({ name, src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="podcast-card__art podcast-card__art--fallback" aria-hidden="true">
        {monogram(name)}
      </span>
    );
  }

  return (
    <img
      className="podcast-card__art"
      src={src}
      alt={`${name} cover artwork`}
      width="400"
      height="400"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default function PodcastCard({ podcast, live }) {
  const { name, label, description, youtube, apple, spotify, instagram, spotifyScope } =
    podcast;
  const artwork = podcast.artwork || live?.avatar || null;

  // Fixed order so the buttons line up across every card.
  // Apple, Spotify, YouTube in that order on every card, then Instagram only
  // where The Podcast Lane actually supports that account.
  const links = [
    apple && { label: 'Apple Podcasts', href: apple, aria: `${name} on Apple Podcasts` },
    spotify && {
      label: spotifyScope === 'episode' ? 'Spotify episode' : 'Spotify',
      href: spotify,
      aria:
        spotifyScope === 'episode'
          ? `Listen to an episode of ${name} on Spotify`
          : `${name} on Spotify`,
    },
    youtube && { label: 'YouTube', href: youtube, aria: `${name} on YouTube` },
    instagram && { label: 'Instagram', href: instagram, aria: `${name} on Instagram` },
  ].filter(Boolean);

  return (
    <article className="podcast-card">
      <Artwork name={name} src={artwork} />
      <div className="podcast-card__body">
        <h2 className="podcast-card__name">
          {youtube ? (
            <a
              href={youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on YouTube, opens in a new tab`}
            >
              {name}
            </a>
          ) : (
            name
          )}
        </h2>
        {label && <p className="podcast-card__label">{label}</p>}
        {description && <p className="podcast-card__description">{description}</p>}
        {links.length > 0 && (
          <ul className="podcast-card__links">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  className="textlink"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.aria}, opens in a new tab`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
