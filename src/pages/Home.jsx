import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import VideoEmbed from '../components/VideoEmbed';
import EpisodeRow from '../components/EpisodeRow';
import PlatformButtons from '../components/PlatformButtons';
import { staticEpisodes } from '../data/static-episodes';
import {
  featuredEpisode,
  followingEpisodes,
  homeHero,
  homeEpisodes,
  homeNewHere,
  homeFounder,
  homeFinalCta,
} from '../data/home';
import { SITE_URL, SITE_NAME, LINKS } from '../config';

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-full.png`,
      description:
        'Podcast production, coaching, and visibility services for entrepreneurs, business owners, professionals, and creators.',
      sameAs: [LINKS.youtube, LINKS.apple, LINKS.spotify, LINKS.instagram],
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#elisa-lane`,
      name: 'Elisa Lane',
      jobTitle: 'Founder',
      worksFor: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'PodcastSeries',
      '@id': `${SITE_URL}/#podcast`,
      name: SITE_NAME,
      url: `${SITE_URL}/episodes`,
      webFeed: LINKS.apple,
      author: { '@id': `${SITE_URL}/#elisa-lane` },
    },
  ],
};

export default function Home() {
  return (
    <main id="main">
      <Seo
        title="Podcast Production &amp; Coaching in Phoenix | The Podcast Lane"
        description="Full-service podcast production, coaching &amp; studio recording in the Phoenix Valley. Launch in 75 days with Elisa Lane. Book your session."
        path="/"
        jsonLd={schema}
      />

      {/* Hero */}
      <section className="shell hero hero--video">
        <div className="hero__copy">
          <span className="eyebrow eyebrow--red">{homeHero.eyebrow}</span>
          <h1 className="display hero__title">{homeHero.headline}</h1>
          <p className="lede hero__lede">{homeHero.supporting}</p>
          {homeHero.business && <p className="hero__business muted">{homeHero.business}</p>}
        </div>

        <div className="hero__video">
          <VideoEmbed
            id={homeHero.video.id}
            title={homeHero.video.title}
            thumbnail={homeHero.video.poster}
            eager
          />
        </div>

        <div className="btn-row hero__actions">
          <Link className="btn btn--primary" to={homeHero.primary.to}>
            {homeHero.primary.label}
          </Link>
          <Link className="btn" to={homeHero.secondary.to}>
            {homeHero.secondary.label}
          </Link>
        </div>
      </section>

      {/* Platform bar */}
      <section className="section section--tight" aria-label="Listen and follow">
        <div className="shell">
          <PlatformButtons variant="bar" />
        </div>
      </section>

      {/* Featured episodes */}
      <section className="section">
        <div className="shell">
          <span className="eyebrow eyebrow--red">{homeEpisodes.eyebrow}</span>
          <h2 className="h2" style={{ marginBottom: '2rem' }}>{homeEpisodes.heading}</h2>

          <EpisodeRow episode={featuredEpisode} featured />

          {staticEpisodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} />
          ))}

          {followingEpisodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} />
          ))}

          <div className="btn-row">
            <Link className="btn" to={homeEpisodes.viewAll.to}>
              {homeEpisodes.viewAll.label}
            </Link>
          </div>
        </div>
      </section>

      {/* New here / 10 in 10 */}
      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow">{homeNewHere.eyebrow}</span>
            <hr className="rule-red" />
          </div>
          <div>
            <h2 className="h3" style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
              {homeNewHere.heading}
            </h2>
            <p className="muted">{homeNewHere.supporting}</p>
            <div style={{ maxWidth: '34rem', marginTop: '1.25rem' }}>
              <VideoEmbed
                id={homeNewHere.video.id}
                title={homeNewHere.video.title}
                thumbnail={homeNewHere.video.poster}
              />
            </div>
            <div className="newhere__cta">
              <h3 className="h3" style={{ marginBottom: '0.9rem' }}>
                {homeNewHere.cta.heading}
              </h3>
              <Link className="btn btn--primary" to={homeNewHere.cta.to}>
                {homeNewHere.cta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the founder */}
      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow eyebrow--red">{homeFounder.eyebrow}</span>
            <hr className="rule-red" />
            <p className="muted" style={{ fontSize: '0.92rem' }}>{homeFounder.kicker}</p>
          </div>
          <div>
            <h2 className="h2" style={{ marginBottom: '1.25rem' }}>{homeFounder.name}</h2>
            {homeFounder.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {homeFounder.quotes.map((quote) => (
              <blockquote className="pullquote" key={quote.slice(0, 40)}>{quote}</blockquote>
            ))}
            {homeFounder.bioAfterQuote.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {homeFounder.quotesTwo.map((quote) => (
              <blockquote className="pullquote" key={quote.slice(0, 40)}>{quote}</blockquote>
            ))}
            {homeFounder.bioAfterQuoteTwo.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {homeFounder.quotesThree.map((quote) => (
              <blockquote className="pullquote" key={quote.slice(0, 40)}>{quote}</blockquote>
            ))}
            <p>{homeFounder.closing}</p>
            <p>
              For more information about The Podcast Lane, visit{' '}
              <a
                href={homeFounder.siteLink.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {homeFounder.siteLink.label}
              </a>
              .
            </p>

            <div className="btn-row">
              {homeFounder.actions.map((action) => (
                <Link className="btn" key={action.to + action.label} to={action.to}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="shell">
          <span className="eyebrow eyebrow--red">{homeFinalCta.eyebrow}</span>
          <h2 className="h2" style={{ maxWidth: '20ch', marginBottom: '1rem' }}>
            {homeFinalCta.heading}
          </h2>
          <p className="lede" style={{ marginBottom: 0 }}>{homeFinalCta.supporting}</p>
          <div className="btn-row">
            <Link className="btn btn--primary" to={homeFinalCta.primary.to}>
              {homeFinalCta.primary.label}
            </Link>
            {homeFinalCta.secondary && (
              <Link className="btn" to={homeFinalCta.secondary.to}>
                {homeFinalCta.secondary.label}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
