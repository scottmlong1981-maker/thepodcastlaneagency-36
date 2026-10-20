#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Merges any new videos from YouTube's public RSS feeds into src/data/episodes.js.
//
// Runs automatically before every build (see the "prebuild" script in package.json).
//
// Design notes:
//  - No API key, no quota, no credentials. These feeds are public.
//  - NEVER fails the build. If YouTube is unreachable, the feed is malformed, or
//    anything else goes wrong, this logs a warning and exits 0, leaving the
//    committed episode data untouched. A broken feed must not break a deploy.
//  - Only ADDS episodes it has not seen. It never edits or deletes existing
//    entries, so any manual correction you make to episodes.js survives.
//  - RSS carries no duration field, so new entries arrive with duration: null.
//    The UI omits the duration when it is null. Fill it in by hand, or re-run
//    the spreadsheet importer, when you want it displayed.
// ---------------------------------------------------------------------------

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'src/data/episodes.js');
const FEATURED_FILE = path.join(ROOT, 'src/data/featured.js');

// The library tracks the channel's Videos tab, so every new upload appears
// automatically, newest first.
//
// Shorts are kept out by the length gate below rather than by restricting the
// feed: with YOUTUBE_API_KEY set, every candidate is checked against its exact
// duration, and anything under MIN_SECONDS is rejected. Without a key, a
// per-video Shorts probe does the same job less precisely.
const CHANNEL_ID = 'UCRsTfV9FElPpALM4fpY8JrQ';
const PLAYLIST_ID = 'PL2PcECQX5jFTTG9wlPd8fPG0Qj2Dtw-7R';

const FEEDS = [
  `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
  `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`,
];

// Second line of defence: anything under this length is not a full episode.
// RSS does not carry duration, so how strictly this is enforced depends on
// whether YOUTUBE_API_KEY is set - see resolveDurations() below.
export const MIN_SECONDS = 120;

// Videos deliberately kept out of the episode library.
// wYO6uKxuQkM = the 29s series trailer (shown separately on the Home page)
// sfany3yasBo = a sub-minute clip with no description
const SKIP_IDS = new Set(['wYO6uKxuQkM', 'sfany3yasBo']);

const TIMEOUT_MS = 10000;

// --- Guest extraction (mirrors scripts/build_episodes.py) -------------------

const PATTERNS = [
  /[Ff]eaturing\s+(.+?)\s*(?:[—\-|]|$)/,
  /\bwith\s+(.+?)\s*(?:[—\-|]|$)/,
];

const ROLE = new Set([
  'founder', 'co-owner', 'coowner', 'owner', 'ceo', 'creator', 'chiropractic',
  'physician', 'brand', 'senior', 'president', 'director', 'helping', 'drip',
  'real', 'modern', 'turning', 'lead', 'the', 'how', 'understanding', 'from',
  'discipline', 'more', 'clean', 'designing',
]);

const STOP = new Set(['passion', 'purpose', 'us', 'you', 'your', 'me', 'confidence', 'clarity']);

function cleanTitle(title) {
  return title.replace(/\u{1F399}\u{FE0F}?/gu, '').replace(/\s+/g, ' ').trim().replace(/^[|—\-\s]+|[|—\-\s]+$/g, '');
}

function trimRole(name) {
  const cut = name.split(/["\u201c\u201d(,&]/)[0].trim();
  const out = [];
  for (const word of cut.split(/\s+/)) {
    if (ROLE.has(word.toLowerCase().replace(/[.:]/g, '')) && out.length) break;
    out.push(word);
  }
  return out.join(' ').replace(/^[.:|—\-\s]+|[.:|—\-\s]+$/g, '');
}

function extractGuest(title) {
  const t = cleanTitle(title);
  for (const pattern of PATTERNS) {
    const match = t.match(pattern);
    if (!match) continue;
    let name = match[1].split('|')[0].trim();
    if (!name || STOP.has(name.toLowerCase())) continue;
    name = trimRole(name);
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length > 1 && words.length <= 4 && words.every((w) => /^[A-Z"\u201c']/.test(w))) {
      return name;
    }
  }
  return null; // Better an empty guest field than a wrong one.
}

// --- Duration / shorts filtering -------------------------------------------

function isoToSeconds(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return null;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

function secondsToClock(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Exact durations via the YouTube Data API. Only used when YOUTUBE_API_KEY is
 * set. Returns a Map of id -> seconds, or null if unavailable, in which case
 * the caller falls back to the shorts probe.
 */
export async function resolveDurations(ids, key = process.env.YOUTUBE_API_KEY) {
  if (!key || ids.length === 0) return null;

  const map = new Map();
  // videos.list accepts at most 50 ids per request.
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url =
      'https://www.googleapis.com/youtube/v3/videos' +
      `?part=contentDetails&id=${batch.join(',')}&key=${key}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`YouTube API returned ${response.status}`);
    const body = await response.json();
    for (const item of body.items || []) {
      const seconds = isoToSeconds(item.contentDetails?.duration);
      if (seconds !== null) map.set(item.id, seconds);
    }
  }
  return map;
}

/**
 * No-API-key fallback. A Shorts URL serves a 200 for an actual short and
 * redirects to /watch for anything longer. One request per new video.
 * Fails open: if the probe itself errors, the video is kept, since the
 * playlist is curated and a false exclusion is worse than a false include.
 */
export async function isShort(id, fetcher = fetch) {
  try {
    const response = await fetcher(`https://www.youtube.com/shorts/${id}`, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

// --- Feed parsing -----------------------------------------------------------

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&'); // last, so it cannot double-decode
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? decodeEntities(match[1]).trim() : '';
}

function parseFeed(xml) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entries
    .map((entry) => {
      const id = tag(entry, 'yt:videoId');
      if (!id) return null;
      const thumb = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/);
      return {
        id,
        title: cleanTitle(tag(entry, 'title')),
        guest: null,
        publishedAt: tag(entry, 'published'),
        duration: null,
        description: tag(entry, 'media:description'),
        url: `https://youtu.be/${id}`,
        thumbnail: thumb ? thumb[1] : `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      };
    })
    .filter(Boolean);
}

async function fetchFeed(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'the-podcast-lane-build/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseFeed(await response.text());
  } finally {
    clearTimeout(timer);
  }
}

// --- Full catalog via the Data API ------------------------------------------

/**
 * Every upload on the channel, not just the RSS window.
 *
 * The RSS feed only carries roughly the 15 most recent videos, and build-time
 * additions are never committed back to the repo, so an RSS-only sync silently
 * loses everything between the committed snapshot and that window. With a key,
 * this walks the channel's uploads playlist in full instead.
 *
 * Cost is about one quota unit per 50 videos, negligible against the free tier.
 * Returns null without a key so the caller falls back to RSS.
 */
export async function fetchAllUploads(key = process.env.YOUTUBE_API_KEY) {
  if (!key) return null;

  const channel = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${key}`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (!channel.ok) throw new Error(`channels.list returned ${channel.status}`);
  const uploads = (await channel.json()).items?.[0]?.contentDetails
    ?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error('no uploads playlist on the channel');

  const videos = [];
  let pageToken = '';
  // Bounded so a malformed nextPageToken cannot loop forever.
  for (let page = 0; page < 40; page += 1) {
    const url =
      'https://www.googleapis.com/youtube/v3/playlistItems' +
      `?part=snippet,contentDetails&maxResults=50&playlistId=${uploads}&key=${key}` +
      (pageToken ? `&pageToken=${pageToken}` : '');
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`playlistItems.list returned ${response.status}`);
    const body = await response.json();

    for (const item of body.items || []) {
      const id = item.contentDetails?.videoId;
      if (!id) continue;
      const snippet = item.snippet || {};
      const thumbs = snippet.thumbnails || {};
      videos.push({
        id,
        title: cleanTitle(snippet.title || ''),
        guest: null,
        publishedAt: item.contentDetails.videoPublishedAt || snippet.publishedAt || '',
        duration: null,
        description: (snippet.description || '').trim(),
        url: `https://youtu.be/${id}`,
        thumbnail:
          thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url ||
          `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      });
    }

    pageToken = body.nextPageToken || '';
    if (!pageToken) break;
  }

  return videos;
}

// --- Featured video ---------------------------------------------------------

/**
 * The video pinned at the top of the channel's Home tab.
 *
 * YouTube exposes this as brandingSettings.channel.unsubscribedTrailer, which is
 * what an unsubscribed visitor sees first. It is NOT in the RSS feed, so this
 * needs the Data API. Without a key, or on any failure, this returns null and
 * the site falls back to the newest episode.
 */
export async function resolveFeatured(key = process.env.YOUTUBE_API_KEY) {
  if (!key) return null;
  const url =
    'https://www.googleapis.com/youtube/v3/channels' +
    `?part=brandingSettings&id=${CHANNEL_ID}&key=${key}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`YouTube API returned ${response.status}`);
  const body = await response.json();
  const id = body.items?.[0]?.brandingSettings?.channel?.unsubscribedTrailer;
  return id || null;
}

export function serializeFeatured(id) {
  return (
    '// AUTO-GENERATED by scripts/sync-episodes.mjs at build time. Do not edit by hand.\n' +
    "// The video The Podcast Lane features at the top of its YouTube channel home.\n" +
    '// Empty means none could be resolved, in which case the newest episode leads.\n\n' +
    `export const featuredEpisodeId = '${id || ''}';\n`
  );
}

// --- Writing ----------------------------------------------------------------

const BANNER = `// AUTO-GENERATED. Regenerated by scripts/sync-episodes.mjs at build time and by
// scripts/build_episodes.py from the spreadsheet export.
// Existing entries are preserved verbatim; only genuinely new videos are appended.
// New entries pulled from RSS have duration: null, because the feed omits it.

`;

function serialize(trailer, episodes) {
  return (
    BANNER +
    `export const trailer = ${JSON.stringify(trailer, null, 2)};\n\n` +
    `export const episodes = ${JSON.stringify(episodes, null, 2)};\n\n` +
    'export const guests = [...new Set(episodes.map(e => e.guest).filter(Boolean))].sort(\n' +
    '  (a, b) => a.localeCompare(b)\n);\n\n' +
    'export const latestEpisode = episodes[0];\nexport const recentEpisodes = episodes.slice(1, 4);\n'
  );
}

export async function sync({
  write = true,
  feeds = FEEDS,
  fetcher = fetchFeed,
  catalogFetcher = fetchAllUploads,
  durationLookup = resolveDurations,
  shortCheck = isShort,
} = {}) {
  const current = await import(`${DATA_FILE}?t=${Date.now()}`);
  const existing = current.episodes;
  const known = new Set(existing.map((e) => e.id));

  const incoming = [];
  let usedApi = false;
  try {
    const all = await catalogFetcher();
    if (all && all.length) {
      incoming.push(...all);
      usedApi = true;
      console.log(`  channel catalog: ${all.length} uploads via the Data API`);
    }
  } catch (error) {
    console.warn(`  catalog unavailable (${error.message}); falling back to RSS`);
  }

  if (!usedApi) {
    for (const url of feeds) {
      try {
        incoming.push(...(await fetcher(url)));
      } catch (error) {
        console.warn(`  feed unavailable (${url.split('?')[1]}): ${error.message}`);
      }
    }
  }

  const candidates = [];
  const seen = new Set();
  for (const video of incoming) {
    if (known.has(video.id) || SKIP_IDS.has(video.id) || seen.has(video.id)) continue;
    seen.add(video.id);
    candidates.push({ ...video, guest: extractGuest(video.title) });
  }

  // Length gate. Exact when an API key is available, probe-based otherwise.
  const fresh = [];
  const rejected = [];
  let durations = null;
  try {
    durations = await durationLookup(candidates.map((v) => v.id));
  } catch (error) {
    console.warn(`  duration lookup unavailable (${error.message}); falling back to the shorts probe`);
  }

  for (const video of candidates) {
    if (durations) {
      const seconds = durations.get(video.id);
      if (seconds !== undefined && seconds < MIN_SECONDS) {
        rejected.push({ ...video, reason: `${secondsToClock(seconds)} is under the minimum` });
        continue;
      }
      if (seconds !== undefined) video.duration = secondsToClock(seconds);
    } else if (await shortCheck(video.id)) {
      rejected.push({ ...video, reason: 'detected as a Short' });
      continue;
    }
    fresh.push(video);
  }

  const merged = [...existing, ...fresh].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
  );

  if (write && fresh.length > 0) {
    await fs.writeFile(DATA_FILE, serialize(current.trailer, merged), 'utf8');
  }

  return { fresh, rejected, total: merged.length };
}

// --- CLI --------------------------------------------------------------------

const invokedDirectly = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  try {
    const { fresh, rejected, total } = await sync();
    rejected.forEach((e) => console.log(`  - skipped: ${e.title.slice(0, 60)} (${e.reason})`));
    if (fresh.length === 0) {
      console.log(`Episodes: up to date (${total}).`);
    } else {
      console.log(`Episodes: added ${fresh.length}, now ${total}.`);
      fresh.forEach((e) =>
        console.log(`  + ${e.title}${e.guest ? ` (${e.guest})` : ''}${e.duration ? ` [${e.duration}]` : ''}`));
      if (fresh.some((e) => !e.duration)) {
        console.log('  Some durations are blank. Set YOUTUBE_API_KEY to fill them automatically.');
      }
    }
  } catch (error) {
    // Never break the build over a feed problem.
    console.warn(`Episodes: sync skipped (${error.message}). Using committed data.`);
  }

  try {
    const featured = await resolveFeatured();
    if (featured) {
      await fs.writeFile(FEATURED_FILE, serializeFeatured(featured), 'utf8');
      console.log(`Featured: channel highlight is ${featured}.`);
    } else {
      console.log('Featured: none set on the channel; newest episode will lead.');
    }
  } catch (error) {
    console.warn(`Featured: lookup unavailable (${error.message}). Keeping committed value.`);
  }

  process.exit(0);
}
