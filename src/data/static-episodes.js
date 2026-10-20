// ---------------------------------------------------------------------------
// Episodes pinned to the homepage, directly beneath the Featured Show, in the
// exact order listed here.
//
// These are deliberately NOT part of the dynamic feed. The YouTube sync can add,
// reorder, or replace anything in `episodes`, and this list is unaffected: the
// ids below are the single source of truth for what appears here and in what
// order. Nothing an API refresh does can move or remove them.
//
// To add one, append its id to the end of the list so it lands after whatever
// is already pinned. To change one, swap its id. It is the part after
// "youtu.be/" or "v=" in the watch URL, without any "?si=" or "?is=" tracking
// suffix.
// ---------------------------------------------------------------------------

import { episodes } from './episodes';

export const STATIC_EPISODE_IDS = [
  'IXRbYBdVuLU',
  'M-rVdBMbq6g',
  'qAdfM3kzEsI',
  '1MhuFL7bXts', // Building a Beauty Business Designed to Grow, Featuring Katy Cotten
  's4sxHqTgfJQ', // The 10 in 10 Featuring Leia Ryan | Wellness & Clean Living Advocate
  'UsgxhAVbM7w', // The 10 in 10 Podcast featuring Dr. Janine Crifasi
  'pQQnO0dK_3g', // Small Businesses Lose Million Dollar Contracts, Featuring Lisa Rehurek
];

/**
 * Full episode records where the sync knows them, and a minimal record where it
 * does not yet, so a pinned episode still renders rather than silently vanishing
 * before its metadata has synced. Titles and notes are never invented: an
 * unsynced entry simply shows its thumbnail and a link.
 */
export const staticEpisodes = STATIC_EPISODE_IDS.map((id) => {
  const known = episodes.find((e) => e.id === id);
  if (known) return known;
  return {
    id,
    title: '',
    guest: null,
    publishedAt: '',
    duration: null,
    description: '',
    url: `https://youtu.be/${id}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  };
});

/** True for anything pinned above, so the dynamic feed can avoid repeating it. */
export function isStaticEpisode(id) {
  return STATIC_EPISODE_IDS.includes(id);
}
