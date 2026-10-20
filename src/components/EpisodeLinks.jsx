import { linksFor } from '../data/episode-links';

/**
 * Platform buttons for a single episode.
 *
 * YouTube is always available. Apple and Spotify render only when a verified
 * per-episode URL exists, because linking to the show's front page from an
 * episode button would be misleading. Labels name the platform rather than
 * saying "Listen", since these episodes have video too.
 */
export default function EpisodeLinks({ episode }) {
  const { apple, spotify } = linksFor(episode);

  return (
    <div className="btn-row episode-links">
      <a className="btn" href={episode.url} target="_blank" rel="noopener noreferrer">
        YouTube
      </a>
      {apple && (
        <a className="btn" href={apple} target="_blank" rel="noopener noreferrer">
          Apple Podcasts
        </a>
      )}
      {spotify && (
        <a className="btn" href={spotify} target="_blank" rel="noopener noreferrer">
          Spotify
        </a>
      )}
    </div>
  );
}
