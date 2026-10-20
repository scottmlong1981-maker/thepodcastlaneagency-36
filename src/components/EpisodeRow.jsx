import VideoEmbed from './VideoEmbed';
import ShowNotes from './ShowNotes';
import EpisodeLinks from './EpisodeLinks';
import { formatDate } from '../utils';

/**
 * Video left, text right. Used for every episode in the homepage
 * "From the show" section so the featured and recent entries share one rhythm.
 */
export default function EpisodeRow({ episode, featured = false, eager = false }) {
  return (
    <article className={`episode-row${featured ? ' episode-row--featured' : ''}`}>
      <VideoEmbed
        id={episode.id}
        title={episode.title}
        thumbnail={episode.thumbnail}
        eager={eager}
      />
      <div className="episode-row__body">
        <p className="meta">
          {formatDate(episode.publishedAt)}
          {episode.duration ? ` \u00b7 ${episode.duration}` : ''}
        </p>
        {episode.title && <h3 className="episode-row__title">{episode.title}</h3>}
        {episode.guest && (
          <p className="meta" style={{ marginBottom: '0.9rem' }}>Guest: {episode.guest}</p>
        )}
        <ShowNotes text={episode.description} id={episode.id} />
        <EpisodeLinks episode={episode} />
      </div>
    </article>
  );
}
