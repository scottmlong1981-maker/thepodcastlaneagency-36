import { parseChannelPage, parseLatest, parseEntries, pickLatestLongForm,
         resolvePodcast, syncPodcasts } from './scripts/sync-podcasts.mjs';
import { podcasts } from './src/data/podcasts.js';
import fs from 'node:fs/promises';

const results = [];
const check = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -> ${detail}` : ''}`);
};

const channelHtml = (id) => `
<!doctype html><html><head><meta name="x" content="y"></head><body>
<script>var ytInitialData = {"channelId":"${id}","avatar":{"thumbnails":[
{"url":"https://yt3.googleusercontent.com/abcDEF123_x/AAAA=s48-c-k-c0x00ffffff-no-rj","width":48},
{"url":"https://yt3.googleusercontent.com/abcDEF123_x/AAAA=s160-c-k-c0x00ffffff-no-rj","width":160}
]}};</script></body></html>`;

// Mirrors a real channel feed: Shorts sit at the top, above the newest episode.
const feedXml = `<?xml version="1.0"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/">
  <entry><yt:videoId>ShortTagged</yt:videoId><title>Quick tip #Shorts</title>
    <published>2026-08-03T15:00:00Z</published></entry>
  <entry><yt:videoId>ShortUntagd</yt:videoId><title>A 40 second clip</title>
    <published>2026-08-02T15:00:00Z</published></entry>
  <entry>
    <yt:videoId>ClientVid01</yt:videoId>
    <title>Season 2 Premiere &amp; What Comes Next</title>
    <published>2026-08-01T15:00:00Z</published>
    <media:group>
      <media:thumbnail url="https://i.ytimg.com/vi/ClientVid01/hqdefault.jpg"/>
    </media:group>
  </entry>
  <entry><yt:videoId>OlderVid002</yt:videoId><title>Older</title>
    <published>2026-07-01T15:00:00Z</published></entry>
</feed>`;

// Gates for the no-API-key path: ShortUntagd is the only true Short by probe.
const probeGates = {
  durationLookup: async () => null,
  shortCheck: async (id) => id === 'ShortUntagd',
};

// --- Parsers ---------------------------------------------------------------
{
  const { channelId, avatar } = parseChannelPage(channelHtml('UCRsTfV9FElPpALM4fpY8JrQ'));
  check('extracts the channel ID', channelId === 'UCRsTfV9FElPpALM4fpY8JrQ', channelId);
  check('picks the largest avatar and upsizes it', /=s240/.test(avatar || ''), avatar);
  check('handles a page with no avatar',
    parseChannelPage('{"channelId":"UCaaaaaaaaaaaaaaaaaaaaaa"}').avatar === null);
  check('returns null when there is no channel ID',
    parseChannelPage('<html>nothing here</html>').channelId === null);

  check('parses every feed entry', parseEntries(feedXml).length === 4);
  const latest = parseEntries(feedXml)[2];
  check('parses the episode entry', latest.id === 'ClientVid01', latest.id);
  check('decodes entities in the episode title',
    latest.title === 'Season 2 Premiere & What Comes Next', latest.title);
  check('keeps the feed thumbnail', /ClientVid01/.test(latest.thumbnail));
  check('builds the watch URL', latest.url === 'https://youtu.be/ClientVid01');
  check('returns null on an empty feed', parseLatest('<feed></feed>') === null);
}

// --- The long-form gate ----------------------------------------------------
{
  const entries = parseEntries(feedXml);

  const picked = await pickLatestLongForm(entries, probeGates);
  check('skips Shorts and picks the newest full episode',
    picked?.id === 'ClientVid01', picked?.id);
  check('skips a #Shorts-tagged title without any network call',
    (await pickLatestLongForm(entries, {
      durationLookup: async () => null,
      shortCheck: async (id) => {
        if (id === 'ShortTagged') throw new Error('should never be probed');
        return id === 'ShortUntagd';
      },
    }))?.id === 'ClientVid01');

  const byDuration = await pickLatestLongForm(entries, {
    durationLookup: async () => new Map([
      ['ShortTagged', 22], ['ShortUntagd', 41], ['ClientVid01', 1820], ['OlderVid002', 900],
    ]),
    shortCheck: async () => { throw new Error('probe must not run when durations are known'); },
  });
  check('duration gate rejects anything under two minutes',
    byDuration?.id === 'ClientVid01', byDuration?.id);
  check('duration gate attaches the real length', byDuration?.duration === 1820);

  check('a feed of only Shorts yields nothing rather than a Short',
    (await pickLatestLongForm(entries.slice(0, 2), probeGates)) === null);
  check('fails closed when every probe errors',
    (await pickLatestLongForm(entries, {
      durationLookup: async () => null,
      shortCheck: async () => { throw new Error('offline'); },
    })) === null);
  check('empty feed yields null', (await pickLatestLongForm([], probeGates)) === null);
}

// --- resolvePodcast ---------------------------------------------------------
{
  const fetcher = async (url) =>
    url.includes('feeds/videos.xml') ? feedXml : channelHtml('UCtesttesttesttesttestA1');
  const data = await resolvePodcast({ name: 'Test', youtube: 'https://youtube.com/@t' },
    fetcher, probeGates);
  check('resolves avatar and a long-form latest together',
    Boolean(data.avatar) && data.latest?.id === 'ClientVid01', data.latest?.id);

  // Channel resolves, feed dies: an avatar with no embed is still usable
  const halfFetcher = async (url) => {
    if (url.includes('feeds/videos.xml')) throw new Error('HTTP 429');
    return channelHtml('UCtesttesttesttesttestA1');
  };
  const partial = await resolvePodcast({ name: 'Test', youtube: 'https://youtube.com/@t' },
    halfFetcher, probeGates);
  check('a dead feed still yields the avatar',
    Boolean(partial.avatar) && partial.latest === null);
}

// --- syncPodcasts over the real roster --------------------------------------
{
  const fetcher = async (url) =>
    url.includes('feeds/videos.xml') ? feedXml : channelHtml('UCtesttesttesttesttestA1');
  const { resolved, failures, count } = await syncPodcasts({
    write: true, fetcher, podcasts, gates: probeGates });
  check('resolves every podcast with a channel', count === 10, `${count} of 10`);
  check('no failures on a healthy fetch', failures.length === 0, failures.join(', '));
  check('roster order is preserved in podcasts.js',
    podcasts[0].id === 'ten-in-ten' && podcasts[9].id === 'the-soul-friend-podcast');
  check('writes a loadable module',
    (await fs.readFile('src/data/podcasts-live.js', 'utf8')).includes('export const podcastsLive'));

  // Total failure must not wipe previously good data
  const dead = async () => { throw new Error('ENOTFOUND'); };
  const second = await syncPodcasts({ write: true, fetcher: dead, podcasts, gates: probeGates });
  check('a total outage keeps the last good data',
    Object.keys(second.resolved).length === 10, `${Object.keys(second.resolved).length} retained`);
  check('failures are reported, not silent', second.failures.length === 10);
  const after = await import(`${process.cwd()}/src/data/podcasts-live.js?v=${Date.now()}`);
  check('committed avatars survive the outage',
    Boolean(after.podcastsLive['walks-with-mom']?.avatar));
  check('an outage retains the previous episode',
    Boolean(after.podcastsLive['walks-with-mom']?.latest));
  check('no Short is ever written to the live data',
    Object.values(after.podcastsLive).every((c) => !c.latest || c.latest.id === 'ClientVid01'));
}

// --- Stale-Short eviction (the bug this suite exists to prevent) -----------
{
  // Simulate what an earlier, ungated build left behind: a Short recorded as
  // someone's latest episode.
  const staleShort = {
    id: 'StaleShort1',
    title: 'Self Driving Cars vs Humans Reaction Time Shock!',
    publishedAt: '2026-08-05T12:00:00Z',
    thumbnail: 'https://i.ytimg.com/vi/StaleShort1/hqdefault.jpg',
    url: 'https://youtu.be/StaleShort1',
  };
  await fs.writeFile('src/data/podcasts-live.js',
    `export const podcastsLive = ${JSON.stringify(
      { 'walks-with-mom': { channelId: 'UCtesttesttesttesttestA1', avatar: 'https://yt3.googleusercontent.com/x=s240', latest: staleShort } },
      null, 2)};\n`);

  // Feed is readable, but every recent upload is a Short.
  const onlyShorts = `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
    xmlns:media="http://search.yahoo.com/mrss/">
    <entry><yt:videoId>ShortUntagd</yt:videoId><title>A 40 second clip</title>
      <published>2026-08-06T15:00:00Z</published></entry></feed>`;
  const fetcher = async (url) =>
    url.includes('feeds/videos.xml') ? onlyShorts : channelHtml('UCtesttesttesttesttestA1');

  const { resolved } = await syncPodcasts({
    write: true, fetcher, clients: [podcasts[0]], gates: probeGates });
  check('a readable feed with no qualifying video clears the stale Short',
    resolved['walks-with-mom'].latest === null,
    JSON.stringify(resolved['walks-with-mom'].latest));
  check('the avatar is still kept when the embed is cleared',
    Boolean(resolved['walks-with-mom'].avatar));

  // But an unreachable feed must still preserve it
  await fs.writeFile('src/data/podcasts-live.js',
    `export const podcastsLive = ${JSON.stringify(
      { 'walks-with-mom': { channelId: 'UCtesttesttesttesttestA1', avatar: 'a', latest: staleShort } },
      null, 2)};\n`);
  const halfFetcher = async (url) => {
    if (url.includes('feeds/videos.xml')) throw new Error('HTTP 503');
    return channelHtml('UCtesttesttesttesttestA1');
  };
  const outage = await syncPodcasts({
    write: false, fetcher: halfFetcher, clients: [podcasts[0]], gates: probeGates });
  check('an unreachable feed still preserves the previous episode',
    outage.resolved['walks-with-mom'].latest?.id === 'StaleShort1');
}

// --- Data integrity --------------------------------------------------------
{
  check('every podcast has a Spotify link',
    podcasts.every((c) => Boolean(c.spotify)),
    `${podcasts.filter((c) => c.spotify).length} of ${podcasts.length}`);
  check('the removed Apple listing is gone from the dataset',
    !podcasts.some((c) => (c.apple || '').includes('1455987614')));
  check('Behind the Thread uses the supplied show URL',
    podcasts.find((c) => c.id === 'behind-the-thread')?.spotify ===
      'https://open.spotify.com/show/2wtJh8W6sCLRkG4wscuX0i?si=9ke8tCynSg6k-O_Dopa6ug&nd=1&dlsi=749363bac792426c');
  check('Soul Friend uses the supplied episode URL, unaltered',
    podcasts.find((c) => c.id === 'the-soul-friend-podcast')?.spotify ===
      'https://open.spotify.com/episode/0PdGLhnmlWaFu4EW5Ftstz?si=iufwaWtAR9-tEct6BftDlA&nd=1&dlsi=1ec25e4eca45484f');
  check('only Soul Friend is marked episode-scoped',
    podcasts.filter((c) => c.spotifyScope === 'episode').map((c) => c.id).join() ===
      'the-soul-friend-podcast');
  check('every non-episode Spotify URL is show-scoped',
    podcasts.filter((c) => c.spotify && c.spotifyScope !== 'episode')
      .every((c) => /open\.spotify\.com\/show\//.test(c.spotify)));
  check('any episode-scoped URL is explicitly flagged',
    podcasts.filter((c) => (c.spotify || '').includes('/episode/'))
      .every((c) => c.spotifyScope === 'episode'));
  check('Dr Micol has links but no description',
    podcasts.find((c) => c.id === 'sassy-and-strong')?.description === null);
  check('Soul Friend has channel and Spotify, no Apple or description',
    (() => { const c = podcasts.find((x) => x.id === 'the-soul-friend-podcast');
             return c.youtube && !c.apple && c.spotify && !c.description; })());
  check('every client has a name', podcasts.every((c) => c.name && c.id));
}

// Restore a clean generated file rather than a stale backup, so the export
// name can never drift back to an older one.
await fs.writeFile('src/data/podcasts-live.js',
  '// AUTO-GENERATED by scripts/sync-podcasts.mjs at build time. Do not edit by hand.\n' +
  '// Keyed by the `id` field in podcasts.js. Missing or stale entries degrade\n' +
  '// gracefully: the card shows a monogram instead of artwork.\n\n' +
  'export const podcastsLive = {};\n');
console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed.`);
process.exit(results.every(Boolean) ? 0 : 1);
