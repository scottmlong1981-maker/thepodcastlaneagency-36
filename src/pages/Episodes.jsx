import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import ShowNotes from '../components/ShowNotes';
import EpisodeLinks from '../components/EpisodeLinks';
import VideoEmbed from '../components/VideoEmbed';
import PlatformButtons from '../components/PlatformButtons';
import { episodes, guests } from '../data/episodes';
import { SITE_NAME } from '../config';
import { formatDate, toIsoDuration } from '../utils';

const PAGE_SIZE = 9;

function EpisodeEntry({ episode }) {
  return (
    <article className="episode-entry" id={episode.id}>
      <div className="featured">
        <VideoEmbed id={episode.id} title={episode.title} thumbnail={episode.thumbnail} />
        <div>
          <p className="meta">
            {formatDate(episode.publishedAt)}
            {episode.duration ? ` \u00b7 ${episode.duration}` : ''}
          </p>
          <h3 className="h3" style={{ margin: '0.5rem 0 0.6rem', fontSize: '1.4rem' }}>
            {episode.title}
          </h3>
          {episode.guest && (
            <p className="meta" style={{ marginBottom: '1rem' }}>Guest: {episode.guest}</p>
          )}
          <ShowNotes text={episode.description} id={episode.id} />
          <EpisodeLinks episode={episode} />
        </div>
      </div>
    </article>
  );
}

export default function Episodes() {
  const [query, setQuery] = useState('');
  const [guest, setGuest] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const listRef = useRef(null);
  const firstRun = useRef(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return episodes.filter((episode) => {
      const matchesGuest = !guest || episode.guest === guest;
      if (!matchesGuest) return false;
      if (!q) return true;
      return (
        episode.title.toLowerCase().includes(q) ||
        (episode.guest || '').toLowerCase().includes(q) ||
        episode.description.toLowerCase().includes(q)
      );
    });
  }, [query, guest]);

  const shown = filtered.slice(0, visible);
  const hasFilters = Boolean(query.trim() || guest);

  // The controls sit below the library, so bring the results back into view once
  // typing pauses. Debounced, so it doesn't yank the page on every keystroke.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    if (!hasFilters) return undefined;

    const timer = setTimeout(() => {
      const reduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      listRef.current?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [query, guest, hasFilters]);

  const reset = () => {
    setQuery('');
    setGuest('');
    setVisible(PAGE_SIZE);
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_NAME} episodes`,
    numberOfItems: episodes.length,
    itemListElement: episodes.slice(0, 10).map((episode, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoObject',
        name: episode.title,
        description: episode.description.slice(0, 300),
        uploadDate: episode.publishedAt,
        duration: toIsoDuration(episode.duration),
        thumbnailUrl: episode.thumbnail,
        contentUrl: episode.url,
        embedUrl: `https://www.youtube.com/embed/${episode.id}`,
      },
    })),
  };

  return (
    <main id="main">
      <Seo
        title="10 in 10 Series"
        description="Every episode of The Podcast Lane. Conversations with entrepreneurs, business owners, and experts, with full show notes and video."
        path="/episodes"
        jsonLd={schema}
      />

      <section className="shell hero">
        <span className="eyebrow eyebrow--red">The Podcast Lane: 10 in 10</span>
        <h1 className="display hero__title">Ten Stories. Ten Voices. Ten Episodes.</h1>
        <p className="lede hero__lede">
          Meet the people and ideas shaping the latest season of 10 in 10. Episodes of real
          stories from the people behind the industries that make a difference.
        </p>
      </section>

      <div className="shell">
        <p className="episodes__searchcue">
          All episodes are searchable.{' '}
          <a className="textlink" href="#find-an-episode">Search or filter by guest</a>
        </p>
      </div>

      <div className="shell" ref={listRef}>
        {hasFilters && (
          <p className="results-count" role="status">
            {filtered.length === 0
              ? 'No episodes match'
              : `${filtered.length} of ${episodes.length} episodes match`}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="empty">
            <h2 className="h3" style={{ marginBottom: '0.75rem' }}>No episodes match that search</h2>
            <p className="muted" style={{ margin: '0 auto 1.5rem' }}>
              Try a different keyword, or clear the filters to see every episode.
            </p>
            <button type="button" className="btn btn--primary" onClick={reset}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {shown.map((episode) => (
              <EpisodeEntry key={episode.id} episode={episode} />
            ))}

            {visible < filtered.length && (
              <div className="center-row">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  Load more episodes ({filtered.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <section className="section anchor-target" id="find-an-episode">
        <div className="shell">
          <span className="eyebrow eyebrow--red">Find an episode</span>
          <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Search the library</h2>
        <div className="filters">
          <div>
            <label htmlFor="episode-search">Search episodes</label>
            <input
              id="episode-search"
              type="search"
              value={query}
              placeholder="Try a topic, a name, or a keyword"
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
            />
          </div>
          <div>
            <label htmlFor="episode-guest">Filter by guest</label>
            <select
              id="episode-guest"
              value={guest}
              onChange={(e) => {
                setGuest(e.target.value);
                setVisible(PAGE_SIZE);
              }}
            >
              <option value="">All guests</option>
              {guests.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="button"
              className="btn"
              onClick={reset}
              disabled={!hasFilters}
            >
              Reset
            </button>
          </div>
        </div>
          <p className="privacy" style={{ marginTop: '1rem' }}>
            Results appear in the library above.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="listen-follow">
        <div className="shell">
          <span className="eyebrow eyebrow--red">Subscribe or follow</span>
          <h2 className="h2" id="listen-follow" style={{ marginBottom: '0.75rem' }}>
            Listen and Follow
          </h2>
          <p className="lede">
            New episodes land on Apple Podcasts, Spotify and YouTube. Instagram is where the rest
            of it happens.
          </p>
          <PlatformButtons variant="bar" />
        </div>
      </section>

      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow eyebrow--red">Why Do a 10 in 10?</span>
            <hr className="rule-red" />
            <p className="muted" style={{ fontSize: '0.92rem' }}>
              The best way to enter the exciting world of podcasting is with The Podcast
              Lane&rsquo;s 10 in 10 Podcast.
            </p>
          </div>
          <div>
            <h2 className="h3" style={{ marginBottom: '1rem', fontSize: '1.35rem' }}>
              What&rsquo;s Included?
            </h2>
            <ul className="ticks">
              <li>A professional host</li>
              <li>A fully equipped podcast studio in the Phoenix metro area</li>
              <li>A podcast engineer</li>
              <li>A producer</li>
              <li>Professional editing</li>
              <li>Promotion before, during, and after recording</li>
              <li>Clips from the episode uploaded to podcast channels and YouTube</li>
              <li>Social media sharing and promotion</li>
            </ul>
            <p style={{ marginTop: '1.5rem' }}>
              Give us 10 minutes and you can have a professional podcast episode and be part of
              the next 10 in 10 Podcast.
            </p>
            <p className="muted">
              For available dates, pricing, and additional details, contact The Podcast Lane.
            </p>
            <div className="btn-row">
              <Link className="btn btn--primary" to="/work-with-us#inquiry">Get Details</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <span className="eyebrow eyebrow--red">Share your story</span>
          <h2 className="h2 h2--one-line" style={{ marginBottom: '1rem' }}>
            Join Us for the Next 10 in 10
          </h2>
          <p className="lede" style={{ marginBottom: 0 }}>
            Bring your experience, perspective and expertise to an upcoming conversation.
          </p>
          <div className="btn-row">
            <Link className="btn btn--primary" to="/work-with-us#inquiry">
              Get Details
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
