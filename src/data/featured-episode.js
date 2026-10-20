// ---------------------------------------------------------------------------
// Which episode leads the page, shared by the Home page and the episode library
// so the two can never disagree.
//
// Resolution order:
//   1. FEATURED_EPISODE_ID in config, a manual pin
//   2. the video featured on the YouTube channel home, synced at build time
//   3. the newest episode
//
// An id that is not in the episode data is ignored rather than trusted, so a
// stale or mistyped value can never blank the section.
// ---------------------------------------------------------------------------

import { episodes, latestEpisode } from './episodes';
import { isStaticEpisode } from './static-episodes';
import { featuredEpisodeId } from './featured';
import { FEATURED_EPISODE_ID } from '../config';

function resolve() {
  for (const id of [FEATURED_EPISODE_ID, featuredEpisodeId]) {
    if (!id) continue;
    const match = episodes.find((e) => e.id === id);
    if (match) return { episode: match, explicit: true };
  }
  return { episode: latestEpisode, explicit: false };
}

const resolved = resolve();

export const featuredEpisode = resolved.episode;

/** True when the channel or config chose this episode, rather than it simply
 *  being the newest. Lets a page decide whether the section is worth showing. */
export const featuredIsExplicit = resolved.explicit;

/**
 * The newest episodes for the homepage feed, in YouTube order. Excludes the
 * featured episode and the three pinned ones, which already appear above, so
 * the same episode is never shown twice.
 */
export const followingEpisodes = episodes
  .filter((e) => e.id !== featuredEpisode.id && !isStaticEpisode(e.id))
  .slice(0, 3);
