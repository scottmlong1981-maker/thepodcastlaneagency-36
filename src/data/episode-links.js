// ---------------------------------------------------------------------------
// Per-episode Apple Podcasts and Spotify links.
//
// These cannot be derived from YouTube data, so each is supplied by hand. An
// episode with no entry simply shows its YouTube button; nothing guessed or
// broken ever renders.
//
// Two ways to key an entry:
//
//   byId    Preferred and exact. The YouTube video id, i.e. the part after
//           "youtu.be/" or "v=", with any "?si=" or "?is=" suffix removed.
//
//   byTitle A fallback for episodes whose video id is not known here yet,
//           matched against the episode title from YouTube. Several of these
//           episodes are newer than the committed snapshot, so their ids are
//           unknown until the next build syncs them; the title patterns are
//           written to be distinctive. A pattern that matches nothing yields
//           no buttons rather than a wrong link.
//
// If an episode matches both, the id wins.
// ---------------------------------------------------------------------------

const byId = {
  // Pinned on the homepage.
  IXRbYBdVuLU: {
    spotify:
      'https://open.spotify.com/episode/4m6AznPoPrjskk9WXFpYKe?si=z0IfaXtITU-Ir5HdV5N1_w',
    apple:
      'https://podcasts.apple.com/us/podcast/the-10-in-10-podcast-featuring-kimberly-akers-csa/id1846258935?i=1000743452444',
  },
  'M-rVdBMbq6g': {
    spotify: 'https://open.spotify.com/episode/1agnCCm3QDDQSdtfXACBpI?si=6b3977fc33494aa6',
    apple:
      'https://podcasts.apple.com/us/podcast/more-than-a-meal-chef-joseph-lerner-on-cooking/id1846258935?i=1000785130178',
  },
  qAdfM3kzEsI: {
    spotify:
      'https://open.spotify.com/episode/6x23bUMKqYDeve7cSny6V5?si=1HwB3z9lSTK8g0yYz6PRug',
    apple:
      'https://podcasts.apple.com/us/podcast/the-10-in-10-with-jessica-benevento-the-mortgage-matchmaker/id1846258935?i=1000741748675',
  },
  '1MhuFL7bXts': {
    spotify:
      'https://open.spotify.com/episode/4eIG6hRbOwQrNIMeoqhtmG?si=338736991cc34d1e&nd=1&dlsi=194550d4a3e34d47',
    apple:
      'https://podcasts.apple.com/us/podcast/building-a-beauty-business-designed-to-grow/id1846258935?i=1000784249354',
  },
  s4sxHqTgfJQ: {
    spotify: 'https://open.spotify.com/episode/4R0y46pGEsNnLKw8xqIP0b',
    apple:
      'https://podcasts.apple.com/us/podcast/the-10-in-10-featuring-leia-ryan-wellness-clean/id1846258935?i=1000744199862',
  },
  UsgxhAVbM7w: {
    spotify: 'https://open.spotify.com/episode/0JLPMvNXFurpNPakWN52Xy',
    apple:
      'https://podcasts.apple.com/us/podcast/the-10-in-10-podcast-featuring-dr-janine-crifasi/id1846258935?i=1000743467729',
  },
  pQQnO0dK_3g: {
    spotify: 'https://open.spotify.com/episode/2ORjResoN5tpkbVh4ChOpC',
    apple:
      'https://podcasts.apple.com/us/podcast/small-businesses-lose-million-dollar-contracts-learn/id1846258935?i=1000769310044',
  },
};

const byTitle = [
  {
    match: /healing body,?\s*mind,?\s*and soul/i,
    spotify: 'https://open.spotify.com/episode/53ZOUA9iMHe6Qb7YsU0qzq?si=a9a51641e36c4b3b',
    apple:
      'https://podcasts.apple.com/us/podcast/healing-body-mind-and-soul-with-christina-ivanhoe/id1846258935?i=1000786481973',
  },
  {
    match: /high performance without alcohol/i,
    spotify: 'https://open.spotify.com/episode/4i7Jn9Apd19WCkfb9IVqet?si=3aed34da03284b6a',
    apple:
      'https://podcasts.apple.com/us/podcast/high-performance-without-alcohol-fred-auzenne-on-breaking/id1846258935?i=1000786215107',
  },
  {
    match: /handle your marketing/i,
    spotify: 'https://open.spotify.com/episode/2CUWzMKgf9UrqHAmKQqpw6?si=8d92e271e0c74e90',
    apple:
      'https://podcasts.apple.com/us/podcast/handle-your-marketing-with-the-marketing/id1846258935?i=1000785960971',
  },
  {
    match: /behind the camera to building a brand/i,
    spotify: 'https://open.spotify.com/episode/2c82xVM6mJdkGFuboM609z?si=d82c2dbcc9ff45f5',
    apple:
      'https://podcasts.apple.com/us/podcast/from-behind-the-camera-to-building-a-brand-how/id1846258935?i=1000785697660',
  },
  {
    match: /do you own the keys/i,
    spotify: 'https://open.spotify.com/episode/1XFrMicdYXY6mv3yAiaXZw?si=5ee2a2d014474465',
    apple:
      'https://podcasts.apple.com/us/podcast/do-you-own-the-keys-to-your-business-jessica-feldman/id1846258935?i=1000785424233',
  },
  {
    match: /more than a meal/i,
    spotify: 'https://open.spotify.com/episode/1agnCCm3QDDQSdtfXACBpI?si=6b3977fc33494aa6',
    apple:
      'https://podcasts.apple.com/us/podcast/more-than-a-meal-chef-joseph-lerner-on-cooking/id1846258935?i=1000785130178',
  },
  {
    match: /building a beauty business/i,
    spotify: 'https://open.spotify.com/episode/4eIG6hRbOwQrNIMeoqhtmG?si=338736991cc34d1e',
    apple:
      'https://podcasts.apple.com/us/podcast/building-a-beauty-business-designed-to-grow/id1846258935?i=1000784249354',
  },
  {
    match: /giving parents a voice/i,
    spotify: 'https://open.spotify.com/episode/1kpYA0FRXJHDPwJKdPafWe?si=039ab9e31b494458',
    apple:
      'https://podcasts.apple.com/us/podcast/giving-parents-a-voice-special-education-advocacy/id1846258935?i=1000784863713',
  },
  {
    match: /you built the career/i,
    spotify: 'https://open.spotify.com/episode/0RJQfGRlA0auHm0Ojz53Mh?si=b1258fc095ab4f16',
    apple:
      'https://podcasts.apple.com/us/podcast/you-built-the-career-now-what-finding-meaning-beyond/id1846258935?i=1000784002961',
  },
];

/**
 * Apple and Spotify links for one episode, or an empty object if none exist.
 * Accepts an episode record, or a bare video id for older call sites.
 */
export function linksFor(episode) {
  if (!episode) return {};
  const id = typeof episode === 'string' ? episode : episode.id;
  if (byId[id]) return byId[id];

  const title = typeof episode === 'string' ? '' : episode.title || '';
  return byTitle.find((entry) => entry.match.test(title)) || {};
}

export const episodeLinks = byId;
