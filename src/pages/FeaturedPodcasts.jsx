import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import PodcastCard from '../components/PodcastCard';
import { podcasts } from '../data/podcasts';
import { podcastsLive } from '../data/podcasts-live';
import { SITE_NAME } from '../config';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${SITE_NAME} featured podcasts`,
  numberOfItems: podcasts.length,
  itemListElement: podcasts.map((podcast, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: podcast.name,
    ...(podcast.youtube ? { url: podcast.youtube } : {}),
  })),
};

export default function FeaturedPodcasts() {
  return (
    <main id="main">
      <Seo
        title="Featured Podcasts"
        description="Podcasts produced and supported by The Podcast Lane, covering aging and caregiving, business leadership, faith and marriage, retail strategy, and Arizona community stories."
        path="/featured-podcasts"
        jsonLd={schema}
      />

      <PageHero
        eyebrow="Shows We Support"
        title="Featured Podcasts"
        lede="Looking for your next favorite podcast? Start here."
      />

      <div className="shell">
        <ul className="podcast-list">
          {podcasts.map((podcast) => (
            <li key={podcast.id}>
              <PodcastCard podcast={podcast} live={podcastsLive[podcast.id]} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
