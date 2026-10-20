// ---------------------------------------------------------------------------
// Homepage configuration.
//
// Everything the Home page renders that is copy or a destination lives here, so
// the hero video can be swapped and CTA routes changed without touching JSX.
//
// REPLACING THE HERO VIDEO
// To swap the hero video again later, replace the id below with the new
// video's YouTube id (the part after "v=" in its watch URL) - the poster
// image is derived from it automatically, nothing else needs to change. The
// "New Here" section keeps its own copy of the 10 in 10 trailer regardless.
// ---------------------------------------------------------------------------

import { trailer } from './episodes';

export { featuredEpisode, followingEpisodes } from './featured-episode';

// The Podcast Lane highlight reel (1:27), shown at the top of the homepage.
const TRAILER_ID = 'R0VLTGSOBWQ';

const APPLY_ROUTE = '/become-a-guest#application';
const CONTACT_ROUTE = '/work-with-us';
const EPISODES_ROUTE = '/episodes';
const WORK_ROUTE = '/work-with-us#inquiry';

export const homeHero = {
  video: {
    id: TRAILER_ID,
    poster: `https://i.ytimg.com/vi/${TRAILER_ID}/maxresdefault.jpg`,
    title: 'The Podcast Lane highlight reel',
    temporary: false,
  },
  eyebrow: 'Podcast production and coaching',
  headline: 'We help you launch, produce, and grow your podcast.',
  supporting:
    'We help entrepreneurs, business owners, professionals, and creators launch, produce, and grow podcasts. Tell us what you want to say and who needs to hear it, and we will handle the studio, the production team, editing and the details.',
  business: '',
  primary: { label: 'Watch the Episodes', to: EPISODES_ROUTE },
  secondary: { label: 'Get Details', to: WORK_ROUTE },
};

export const homeEpisodes = {
  eyebrow: 'Featured episodes',
  heading: 'From the show',
  viewAll: { label: 'View All Episodes', to: EPISODES_ROUTE },
};

export const homeNewHere = {
  video: {
    id: trailer.id,
    poster: trailer.thumbnail,
    title: 'The Podcast Lane, 10 in 10 trailer',
  },
  eyebrow: 'New here',
  heading: 'Start with the 10 in 10 Trailer',
  supporting:
    'Ten-minute episodes. Ten experts per season. Twenty-nine seconds explains the format.',
  cta: {
    heading: 'Join Us for the Next 10 in 10',
    label: 'Get Details',
    to: WORK_ROUTE,
  },
};

export const homeFinalCta = {
  eyebrow: 'Every voice has power. Let\u2019s make yours heard!',
  heading: 'Ready to Share Your Voice?',
  supporting: 'Tell us what you want to say and who needs to hear it.',
  primary: { label: 'Get Started', to: WORK_ROUTE },
  secondary: null,
};

export const homeFounder = {
  eyebrow: 'Meet the founder',
  kicker: 'Connecting people one podcast at a time.',
  name: 'Elisa Lane',
  bio: [
    'Recording her first podcast in 2016, Elisa Lane of Scottsdale has gradually become one of the most successful and sought-after podcasting producers and consultants in the Valley. Not only has Elisa interviewed more than 300 business owners and secured sponsors, but she also recently launched her own podcasting coaching, producing, and consulting agency. This new business venture of hers has been proudly and aptly named The Podcast Lane.',
    'After owning and managing a marketing agency for 15 years and working with clients one-on-one as a podcasting coach, Lane has seen first-hand how enormously effective and successful podcasting can be for business owners.',
  ],
  quotes: [
    '\u201cHaving a podcast allows business owners to connect directly with their target audience so that the audience sees exactly who they are, what they\u2019re all about, and why they should do business with them,\u201d said Lane. \u201cI have gotten such joy and satisfaction from teaching people about the incredible power of podcasting and connecting people one podcast at a time.\u201d',
  ],
  bioAfterQuote: [
    'According to podcastatistics.com, more than 584 million people worldwide listened to podcasts in 2025, a figure expected to reach 651.7 million by 2027. In 2025, YouTube was the leading platform for video podcasts, while Spotify and Apple Podcasts were the top choices for audio-only content.',
    'There are many reasons why individuals today enjoy watching and listening to podcasts, explained Lane.',
  ],
  quotesTwo: [
    '\u201cPrimarily they are for entertainment and learning. Many people today find podcasts engaging, informative, and a convenient way to learn new things or stay updated on current events while multitasking. Others use podcasts as a form of escapism or relaxation, finding them a helpful way to unwind and de-stress.\u201d',
  ],
  bioAfterQuoteTwo: [
    'The question she is often asked is, \u201cCan anyone create and host a podcast?\u201d Her simple and enthusiastic answer is \u201cyes!\u201d',
  ],
  quotesThree: [
    '\u201cThere is no specific requirement or limitation based on experience, background, or resources,\u201d said Lane. \u201cYou don\u2019t need to be a celebrity or an expert in a particular field to start a successful podcast. What matters most is having a passion for your topic, a willingness to learn, and a desire to connect with an audience.\u201d',
  ],
  closing:
    'The Podcast Lane is committed to making podcasting easy and approachable. From professional recording and video production to guest coordination, several studios to pick from, coaching, and custom content clips, The Podcast Lane will help clients go from idea to launch with full support.',
  siteLink: { label: 'thepodcastlane.com', href: 'https://www.thepodcastlane.com/' },
  actions: [
    { label: 'Work With Us', to: WORK_ROUTE },
    { label: 'Guest or Sponsor', to: APPLY_ROUTE },
  ],
};
