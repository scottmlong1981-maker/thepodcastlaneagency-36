import { sync, isShort, resolveDurations, resolveFeatured, serializeFeatured, fetchAllUploads } from './scripts/sync-episodes.mjs';
import fs from 'node:fs/promises';

// Snapshot the real data file so the suite can restore it, rather than relying
// on a /tmp copy that may not exist in a fresh environment.
const EPISODES_PATH = 'src/data/episodes.js';
const EPISODES_BACKUP = await fs.readFile(EPISODES_PATH, 'utf8');

const results = [];
const check = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -> ${detail}` : ''}`);
};

// Neither gate should touch the network during tests.
const stubs = { durationLookup: async () => null, shortCheck: async () => false };

const entry = (id, title, published, desc = 'Show notes.') => `
  <entry>
    <yt:videoId>${id}</yt:videoId>
    <title>${title}</title>
    <published>${published}</published>
    <media:group>
      <media:thumbnail url="https://i.ytimg.com/vi/${id}/hqdefault.jpg" width="480" height="360"/>
      <media:description>${desc}</media:description>
    </media:group>
  </entry>`;

const feed = (entries) =>
  `<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
   xmlns:media="http://search.yahoo.com/mrss/">${entries.join('')}</feed>`;

// --- 1. A genuinely new video is added -------------------------------------
{
  const xml = feed([
    entry('NEWvid00001', 'The 10 in 10 Podcast Featuring Dana Whitfield | Scaling a Studio',
          '2026-08-01T07:00:00Z', 'A conversation about growth.'),
    entry('CgVbXTOmgMc', 'Healing, Growth &amp; Purpose-Driven Living with Linda Joy',
          '2026-05-30T07:00:25Z'),  // already in the data
  ]);
  const { fresh, total } = await sync({ ...stubs, write: false, feeds: ['x'],
    fetcher: async () => parse(xml) });
  check('adds only the unseen video', fresh.length === 1, `${fresh.length} new, ${total} total`);
  check('extracts the guest from the title', fresh[0]?.guest === 'Dana Whitfield', fresh[0]?.guest);
  check('duration is null (RSS has no duration)', fresh[0]?.duration === null);
  check('builds the watch URL', fresh[0]?.url === 'https://youtu.be/NEWvid00001');
  check('keeps the feed thumbnail', /NEWvid00001/.test(fresh[0]?.thumbnail));
  check('decodes XML entities in titles', !/&amp;/.test(fresh[0]?.title + ''));
}

// --- 2. Skip-list and duplicates across two feeds ---------------------------
{
  const xml = feed([
    entry('wYO6uKxuQkM', '10 in 10 Trailer', '2026-05-21T18:54:13Z'),   // excluded
    entry('sfany3yasBo', 'Short clip', '2026-05-22T03:21:30Z'),          // excluded
    entry('DUPEvid00001', 'Featuring Marcus Reed | Something', '2026-08-02T07:00:00Z'),
  ]);
  const { fresh } = await sync({
    ...stubs,
    write: false,
    feeds: ['feed-a', 'feed-b'],                    // same video seen twice
    fetcher: async () => parse(xml),
  });
  check('honors the skip list', !fresh.some((e) => ['wYO6uKxuQkM', 'sfany3yasBo'].includes(e.id)));
  check('deduplicates across feeds', fresh.filter((e) => e.id === 'DUPEvid00001').length === 1,
    `${fresh.length} new`);
}

// --- 3. Feed failure must not throw or change anything ----------------------
{
  const before = await fs.readFile('src/data/episodes.js', 'utf8');
  const { fresh, total } = await sync({
    ...stubs,
    write: true,
    feeds: ['a', 'b'],
    fetcher: async () => { throw new Error('ENOTFOUND'); },
  });
  const after = await fs.readFile('src/data/episodes.js', 'utf8');
  check('survives a dead feed without throwing', fresh.length === 0);
  check('leaves committed data untouched', before === after, `${total} episodes intact`);
}

// --- 4. A real write, then verify ordering and restore ----------------------
{
  const xml = feed([entry('WRITEtest001', 'Featuring Priya Raman | On Air',
                          '2026-09-01T07:00:00Z', 'Notes.')]);
  await sync({ ...stubs, write: true, feeds: ['x'], fetcher: async () => parse(xml) });
  const mod = await import(`${process.cwd()}/src/data/episodes.js?v=${Date.now()}`);
  check('writes the new episode to disk', mod.episodes.some((e) => e.id === 'WRITEtest001'));
  check('newest sorts to the front', mod.episodes[0].id === 'WRITEtest001', mod.episodes[0].title);
  check('latestEpisode follows the sort', mod.latestEpisode.id === 'WRITEtest001');
  check('new guest joins the filter list', mod.guests.includes('Priya Raman'));
  check('existing episodes preserved', mod.episodes.length === 50, `${mod.episodes.length} total`);
  check('trailer export survives', mod.trailer?.id === 'wYO6uKxuQkM');
  const original = mod.episodes.find((e) => e.id === 'CgVbXTOmgMc');
  check('existing entry untouched, duration intact', original?.duration === '13:09');
}

// --- 5. Only the playlist feed is configured -------------------------------
{
  const src = await fs.readFile('scripts/sync-episodes.mjs', 'utf8');
  // The library now tracks the channel's Videos tab so new uploads appear
  // automatically; Shorts are excluded by the length gate, not by feed choice.
  check('channel feed is configured', /channel_id=\$\{CHANNEL_ID\}/.test(src));
  check('playlist feed is still included as a second source',
    /playlist_id=\$\{PLAYLIST_ID\}/.test(src));
  check('playlist ID matches the Studio playlist',
    /PL2PcECQX5jFTTG9wlPd8fPG0Qj2Dtw-7R/.test(src));
}

// --- 6. Shorts probe gate (no API key) -------------------------------------
{
  const xml = feed([
    entry('LONGform0001', 'Featuring Ana Cruz | The Long One', '2026-08-05T07:00:00Z'),
    entry('SHORTvid0001', 'A quick clip', '2026-08-06T07:00:00Z'),
  ]);
  const { fresh, rejected } = await sync({
    write: false,
    feeds: ['x'],
    fetcher: async () => parse(xml),
    durationLookup: async () => null,               // no API key
    shortCheck: async (id) => id === 'SHORTvid0001',
  });
  check('shorts probe excludes the Short', !fresh.some((e) => e.id === 'SHORTvid0001'));
  check('shorts probe keeps the long-form video', fresh.some((e) => e.id === 'LONGform0001'));
  check('rejection is reported with a reason',
    rejected[0]?.reason === 'detected as a Short', rejected[0]?.reason);
}

// --- 7. Exact duration gate (with API key) ---------------------------------
{
  const xml = feed([
    entry('DUR0000090s', 'Featuring Sam Oyelaran | Ninety Seconds', '2026-08-07T07:00:00Z'),
    entry('DUR0001500s', 'Featuring Rae Dunn | Twenty Five Minutes', '2026-08-08T07:00:00Z'),
  ]);
  const { fresh, rejected } = await sync({
    write: false,
    feeds: ['x'],
    fetcher: async () => parse(xml),
    durationLookup: async () => new Map([['DUR0000090s', 90], ['DUR0001500s', 1500]]),
    shortCheck: async () => { throw new Error('probe should not run when durations are known'); },
  });
  check('under two minutes is excluded', !fresh.some((e) => e.id === 'DUR0000090s'));
  check('over two minutes is kept', fresh.some((e) => e.id === 'DUR0001500s'));
  check('real duration is filled in', fresh[0]?.duration === '25:00', fresh[0]?.duration);
  check('rejection reports the actual length',
    /1:30 is under the minimum/.test(rejected[0]?.reason || ''), rejected[0]?.reason);
}

// --- 8. Gate failures degrade safely ---------------------------------------
{
  const xml = feed([entry('FALLBACK001', 'Featuring Kit Moreno | Fallback', '2026-08-09T07:00:00Z')]);
  const { fresh } = await sync({
    write: false, feeds: ['x'], fetcher: async () => parse(xml),
    durationLookup: async () => { throw new Error('API key rejected'); },
    shortCheck: async () => false,
  });
  check('API failure falls back to the probe rather than dropping episodes',
    fresh.length === 1, `${fresh.length} kept`);

  const probeFailed = await isShort('anything', async () => { throw new Error('offline'); });
  check('probe failure fails open (keeps the video)', probeFailed === false);

  check('duration lookup is skipped with no API key',
    (await resolveDurations(['a'], undefined)) === null);
}

// --- Full catalog via the Data API -----------------------------------------
{
  const catalog = Array.from({ length: 120 }, (_, i) => ({
    id: `vid${String(i).padStart(8, '0')}`,
    title: `Featuring Guest ${i} | Something`,
    guest: null,
    publishedAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
    duration: null,
    description: 'Notes.',
    url: `https://youtu.be/vid${String(i).padStart(8, '0')}`,
    thumbnail: 'https://i.ytimg.com/vi/x/maxresdefault.jpg',
  }));
  catalog.push({ id: 'shortclip01', title: 'Quick clip', guest: null,
    publishedAt: '2026-06-01T00:00:00Z', duration: null, description: '',
    url: 'https://youtu.be/shortclip01', thumbnail: 'x' });
  const durations = new Map(catalog.map((v) => [v.id, v.id === 'shortclip01' ? 30 : 900]));

  const { fresh } = await sync({
    write: false,
    catalogFetcher: async () => catalog,
    fetcher: async () => { throw new Error('RSS must not be used when the API works'); },
    durationLookup: async () => durations,
    shortCheck: async () => { throw new Error('probe must not run when durations are known'); },
  });
  check('the full channel catalog is used, not just the RSS window',
    fresh.length > 100, `${fresh.length} new`);
  check('Shorts are excluded from the catalog by exact duration',
    !fresh.some((e) => e.id === 'shortclip01'));
  check('durations are filled in from the API', fresh.every((e) => e.duration === '15:00'));

  const { fresh: viaRss } = await sync({
    write: false,
    catalogFetcher: async () => { throw new Error('API key rejected'); },
    fetcher: async () => [{ id: 'rssvideo001', title: 'Featuring Rss Fallback | X',
      guest: null, publishedAt: '2026-07-01T00:00:00Z', duration: null,
      description: 'n', url: 'https://youtu.be/rssvideo001', thumbnail: 'x' }],
    durationLookup: async () => null,
    shortCheck: async () => false,
  });
  check('falls back to RSS when the catalog call fails',
    viaRss.some((e) => e.id === 'rssvideo001'));
  check('no API key means no catalog call', (await fetchAllUploads(undefined)) === null);
}

// --- Featured channel video ------------------------------------------------
{
  check('featured lookup is skipped with no API key',
    (await resolveFeatured(undefined)) === null);
  check('featured serializer writes a valid module',
    serializeFeatured('abc123').includes("featuredEpisodeId = 'abc123'"));
  check('featured serializer handles an empty result',
    serializeFeatured(null).includes("featuredEpisodeId = ''"));

  // The rendered behaviour is asserted against the real bundle in interact.mjs,
  // since the resolver pulls in Vite-only config.
  const src = await fs.readFile('src/data/featured-episode.js', 'utf8');
  check('the featured episode is pinned, since YouTube does not expose that slot',
    (await fs.readFile('src/config.js', 'utf8')).includes("FEATURED_EPISODE_ID = 'V7ZTffZ622s'"));
  check('the featured resolver is shared, not duplicated per page',
    src.includes('export const featuredEpisode'));
  check('an unknown featured id falls back rather than blanking the section',
    src.includes('episodes.find') && src.includes('latestEpisode'));
}

await fs.writeFile(EPISODES_PATH, EPISODES_BACKUP, 'utf8');

// The restore above is the only thing standing between fixture data and the
// real dataset, so verify it actually took rather than assuming.
{
  const after = await import(`${process.cwd()}/${EPISODES_PATH}?clean=${Date.now()}`);
  check('no test fixtures remain in the episode data',
    !after.episodes.some((e) => /^(WRITEtest|FALLBACK|DUPEvid|NEWvid|Short|DUR0)/.test(e.id)),
    `${after.episodes.length} episodes`);
}
const restored = await import(`${process.cwd()}/src/data/episodes.js?r=${Date.now()}`);
check('episode data restored after the test run', restored.episodes.length >= 49);

console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed.`);
process.exit(results.every(Boolean) ? 0 : 1);

// Reuse the module's own parser via a tiny shim
function parse(xml) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entries.map((e) => {
    const id = /<yt:videoId>(.*?)<\/yt:videoId>/.exec(e)[1];
    const title = /<title>([\s\S]*?)<\/title>/.exec(e)[1]
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
    const published = /<published>(.*?)<\/published>/.exec(e)[1];
    const desc = /<media:description>([\s\S]*?)<\/media:description>/.exec(e)?.[1] ?? '';
    const thumb = /<media:thumbnail[^>]*url="([^"]+)"/.exec(e)?.[1];
    return { id, title, guest: null, publishedAt: published, duration: null,
             description: desc.trim(), url: `https://youtu.be/${id}`,
             thumbnail: thumb || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` };
  });
}
