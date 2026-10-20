// ---------------------------------------------------------------------------
// Featured clients, in display order (top to bottom). Edit this file to add,
// remove, or reorder a client.
//
// Fields:
//   name        required
//   youtube     channel URL, or null to show the name as plain text
//   description client-supplied copy, or null to omit the paragraph
//   apple       Apple Podcasts SHOW url, or null
//   spotify     Spotify url, or null
//   instagram   Official Instagram account, or null. Added only where The
//               Podcast Lane actively supports that social presence, not
//               merely because the show has an account.
//   artwork     Static cover art path. When set, the build-time sync leaves it
//               alone; otherwise the channel avatar is used until official
//               cover art is supplied.
//   label       Optional supporting line under the name
//   spotifyScope 'show' (default) or 'episode'. Episode-scoped links open a
//                single episode, so the card labels them accordingly rather
//                than implying they open the full show.
//
// Channel avatars and each client's latest episode are NOT stored here. They
// are fetched at build time by scripts/sync-clients.mjs into clients-live.js,
// so the page keeps itself current. Match them by `id`.
// ---------------------------------------------------------------------------

export const podcasts = [
  {
    id: 'ten-in-ten',
    name: '10 in 10',
    label: 'by The Podcast Lane',
    // Points at the 10 in 10 playlist rather than the channel root.
    youtube:
      'https://youtube.com/playlist?list=PL2PcECQX5jFTTG9wlPd8fPG0Qj2Dtw-7R&si=xEMsRsPU9L4kQ0y_',
    apple: 'https://podcasts.apple.com/us/podcast/the-podcast-lane/id1846258935',
    spotify: 'https://open.spotify.com/show/0mt6uitQ0TTVl1q71nHmy4?si=a8fe79b573394bd5',
    instagram: 'https://www.instagram.com/podcast_lane/',
    artwork: '/artwork/10-in-10.jpg',
    description:
      'Ten-minute episodes. Ten experts per season. Real stories from the people behind the industries that make a difference.',
  },
  {
    id: 'walks-with-mom',
    name: 'Walks with Mom',
    youtube: 'https://www.youtube.com/@walkswithmom',
    apple: 'https://podcasts.apple.com/us/podcast/walks-with-mom/id1872170992',
    spotify: 'https://open.spotify.com/show/2VligEIm3qvjVv8vg5QH5N?si=539cfd9c45f7486f',
    instagram: 'https://www.instagram.com/walks_with_mom/',
    description:
      'Join the conversation with a Gen X and Baby Boomer on this aging adventure! Aging is not for the faint of heart. Together, we tackle the tough—but necessary—conversations, share the hilarious (and sometimes embarrassing) moments, and open up about the stories that truly touch the heart. Come with us as we explore what it means to navigate these years with our aging loved ones. So grab a cup of coffee—or maybe a glass of wine—invite your friends or family, and join us for Walks with Mom.',
  },
  {
    id: 'mastering-aging-gracefully',
    name: 'Mastering Aging Gracefully',
    youtube: 'https://www.youtube.com/@MasteringAgingGracefully',
    apple: 'https://podcasts.apple.com/us/podcast/mastering-aging-gracefully/id1894555196',
    spotify: 'https://open.spotify.com/show/4zc1jTKgA3f1MakNHCGmah?si=d3c55397c3dd424d',
    instagram: 'https://www.instagram.com/mastering_aging_gracefully/',
    description:
      'At Living Gracefully PLLC, we are a resource and conduit to build relationships focused on living well. We are care professionals with a focus on personalized physical therapy care and consultation to encourage aging in place, resource introductions, advocacy and companionship for seniors. We are a team dedicated to helping individuals and their families create memories while supporting our clients to lead the best quality of life for them. We are passionate about maintenance physical therapy, fall prevention and general health and well being. We decided to start Living Gracefully for our family and friends. As our parents are getting older, we are discovering through them, what matters most with age. Reaching the 50 year mark ourselves, we also want to be more in control while aging. Aging in place is not just a buzz phrase but an importance to most that is immeasurable.',
  },
  {
    id: 'a-place-for-seniors',
    name: 'A Place for Seniors',
    youtube: 'https://www.youtube.com/@aplaceforseniorssouthwest',
    apple: 'https://podcasts.apple.com/us/podcast/a-place-for-seniors/id1896478430',
    spotify: 'https://open.spotify.com/show/033d0T8uG4CaUrNPrJzLjL?si=8395cca2d3cb40ea',
    instagram: 'https://www.instagram.com/aplaceforseniors/',
    description:
      'At A Place for Seniors, we believe no family should have to navigate senior care alone. We\u2019re a free service dedicated to helping you find the perfect independent living, assisted living, memory care, or home care option for you or your loved one — across the Southwest: Arizona, New Mexico, Utah, and Colorado. Our mission is built on compassion, trust, and guidance, making sure every family feels supported, cared for, and confident every step of the way.',
  },
  {
    id: 'conversations-with-women-who-lead',
    name: 'Conversations with Women Who Lead',
    youtube: 'https://www.youtube.com/@conversationswithwomenwholead',
    apple:
      'https://podcasts.apple.com/us/podcast/conversations-w-women-who-lead-a-business-podcast/id1878385674',
    spotify: 'https://open.spotify.com/show/06axVJf4sj2RNPCBubZuxA?si=8a4d12ee55964b49',
    description:
      'Welcome to Conversations with Women Who Lead. I\u2019m Ann Marie McHenry, your host and guide to the real conversations that lead the way. Join us from wherever you are, whether you\u2019re growing a business, at home wondering where to start, or navigating the everyday moments where decisions shape your life… you belong here. We\u2019re diving into the nurturing stories of how we got here, what we wish we knew sooner, what\u2019s actually working in our businesses and relationships… and the challenges we face along the way. Come as you are and take notes, as we bring you honest conversations, a little fun, and a lot of growth. We appreciate you for taking a step into your future with us. Now let\u2019s get started.',
  },
  {
    id: 'the-making-love-podcast',
    name: 'The Making Love Podcast',
    youtube: 'https://www.youtube.com/@makinglovepodcast',
    apple: 'https://podcasts.apple.com/us/podcast/making-love-podcast/id1895568439',
    spotify: 'https://open.spotify.com/show/4y5kEX6WyV3xEdNuk2EWmO?si=f0b09dd70ada4e50',
    instagram: null,
    description:
      'Welcome to the Making Love Podcast with Tish and Pastor Roy. This is where love gets real, faith leads the way, and marriage becomes something you actually enjoy. We\u2019re talking laughter, connection, and the kind of conversations that challenge what you thought you knew while giving you practical, faith-filled ways to make something that lasts. Whether you\u2019re married, dating, or just curious, this is your time to grow together, have fun, and create a relationship rooted in friendship, purpose, and connection. Because when love is MADE, it doesn\u2019t just last, it gets better every day.',
  },
  {
    id: 'behind-the-thread',
    name: 'Behind the Thread Podcast',
    youtube: 'https://www.youtube.com/@threadadvisorygroup',
    apple: 'https://podcasts.apple.com/us/podcast/behind-the-thread/id1892221406',
    spotify:
      'https://open.spotify.com/show/2wtJh8W6sCLRkG4wscuX0i?si=9ke8tCynSg6k-O_Dopa6ug&nd=1&dlsi=749363bac792426c',
    description:
      'Thread Advisory Group is a modern retail consulting firm that transforms strategy into measurable results. We partner with growth-minded brands to align people, processes, and priorities for lasting change. Our team works shoulder to shoulder to bring clarity, capability, and a curated network of experts to ensure your retail strategy moves from planning to execution with impact.',
  },
  {
    id: 'local-legends-with-jess',
    name: 'Local Legends with Jess, Arizona Edition',
    youtube: 'https://www.youtube.com/@locallegendsaz',
    apple:
      'https://podcasts.apple.com/us/podcast/local-legends-with-jess-arizona-edition/id1808552108',
    spotify: 'https://open.spotify.com/show/6dtUIOmrml1iylSIeEWauF?si=99d535f277e04ace',
    description:
      'Discover the stories behind Arizona\u2019s most inspiring entrepreneurs, nonprofit leaders, real estate pros, insurance experts, and just the Legends Jess gets to do life with! Hosted by local mortgage expert Jessica, this podcast dives deep into the journeys of Arizona\u2019s movers and shakers, sharing their successes, struggles, and lessons learned along the way. Expect a mix of lighthearted conversations, powerful insights, and engaging storytelling, plus behind-the-scenes B-roll footage that brings each episode to life. Whether you\u2019re a local business owner, community advocate, or just love a good story, this is the podcast for you!',
  },
  {
    id: 'sassy-and-strong',
    name: 'Sassy and Strong with Dr Micol',
    youtube: 'https://www.youtube.com/@DrMicolNeely',
    apple: 'https://podcasts.apple.com/us/podcast/sassy-strong-with-dr-micol/id1859225997',
    spotify: 'https://open.spotify.com/show/1xw5bvTRj2JXrHhwSBsYda?si=f1d58e00689f4d38',
    description: null,
  },
  {
    id: 'rooted-in-money',
    name: 'Rooted in Money',
    youtube: 'https://www.youtube.com/@rootedinmoney',
    apple: 'https://podcasts.apple.com/us/podcast/rooted-in-money/id6824111330',
    spotify: 'https://open.spotify.com/show/4inP53hPuMxAVY24mLw5j4',
    // Official cover art, pinned so the build-time sync never swaps in the
    // YouTube channel photo.
    artwork: '/artwork/rooted-in-money.jpg',
    description:
      'Have you ever had that moment when you realize you’re going to have to make big money decisions on your own? Welcome to Rooted in Money, a podcast for the moment a major life shift asks you to begin again. A change like that does not just close one financial chapter. It asks you to start a new one. Your host is Kristina Heckel, CDFA®, CFEI®, CADP™, with Bloom Divorce Advisory Services. Together, we get to the root of money, life transitions and creating a financial future built with purpose. So take a breath, settle in and stay a while.',
  },
];
