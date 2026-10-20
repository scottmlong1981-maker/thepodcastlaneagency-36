import VideoEmbed from './VideoEmbed';
import { formatDate, excerpt } from '../utils';

export default function EpisodeCard({ episode, headingLevel: H = 'h3', compact = false }) {
  return (
    <article className="card episode-card">
      <VideoEmbed
        id={episode.id}
        title={episode.title}
        thumbnail={episode.thumbnail}
      />
      <div className="episode-card__body">
        <p className="meta">
          {formatDate(episode.publishedAt)}
          {episode.duration ? ` \u00b7 ${episode.duration}` : ''}
        </p>
        <H className="episode-card__title">{episode.title}</H>
        {episode.guest && (
          <p className="meta" style={{ marginBottom: '0.75rem' }}>
            Guest: {episode.guest}
          </p>
        )}
        <p className={`episode-card__excerpt${compact ? ' episode-card__excerpt--one-line' : ''}`}>
          {excerpt(episode.description, compact ? 95 : 180)}
        </p>
        <a
          className="textlink"
          href={episode.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch on YouTube
        </a>
      </div>
    </article>
  );
}
