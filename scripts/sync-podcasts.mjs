#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Keeps the Featured Clients page current.
//
// For each client with a YouTube channel, this resolves two things at build time:
//   1. the channel's profile photo
//   2. the channel's most recent video, for the embed
//
// Runs before every build alongside scripts/sync-episodes.mjs.
//
// Design notes, same as the episode sync:
//  - No API key. Both steps use public pages and public RSS feeds.
//  - NEVER fails the build. Any client that cannot be resolved keeps whatever
//    was last written to podcasts-live.js, and if that is empty the page falls
//    back to a monogram and simply omits the embed. One unreachable channel can
//    never take down a deploy or blank the page.
//  - Results are COMMITTED to src/data/podcasts-live.js, so the last good values
//    survive an outage rather than disappearing.
// ---------------------------------------------------------------------------

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveDurations, isShort, MIN_SECONDS } from './sync-episodes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = path.join(ROOT, 'src/data/podcasts-live.js');
const PODCASTS_FILE = path.join(ROOT, 'src/data/podcasts.js');

const TIMEOUT_MS = 12000;
const UA = 'Mozilla/5.0 (compatible; the-podcast-lane-build/1.0)';

/** Pull the canonical channel ID and avatar out of a channel page's HTML. */
export function parseChannelPage(html) {
  const channelId =
    html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] ||
    html.match(/channel\/(UC[\w-]{22})/)?.[1] ||
    null;

  // The avatar appears in several shapes; take the largest offered.
  const avatars = [...html.matchAll(/https:\/\/yt3\.(?:ggpht\.com|googleusercontent\.com)\/[\w\-/=.]+/g)]
    .map((m) => m[0])
    .filter((url) => !url.includes('=s0'));

  const avatar = avatars.length
    ? avatars.sort((a, b) => size(b) - size(a))[0].replace(/=s\d+/, '=s240')
    : null;

  return { channelId, avatar };

  function size(url) {
    return Number(url.match(/=s(\d+)/)?.[1] || 0);
  }
}

/**
 * All entries from a channel's public RSS feed, newest first.
 *
 * A channel feed contains Shorts as well as full episodes, so callers must run
 * the length gate before picking one - see pickLatestLongForm().
 */
export function parseEntries(xml) {
  return (xml.match(/<entry>[\s\S]*?<\/entry>/g) || [])
    .map(parseEntry)
    .filter(Boolean);
}

/** Convenience wrapper: the newest entry, ungated. Used only by tests. */
export function parseLatest(xml) {
  return parseEntries(xml)[0] || null;
}

function parseEntry(entry) {
  const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
  if (!id) return null;

  const decode = (t) =>
    t
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(Number(c)))
      .replace(/&amp;/g, '&');

  return {
    id,
    title: decode(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '').trim(),
    publishedAt: entry.match(/<published>(.*?)<\/published>/)?.[1] || '',
    thumbnail:
      entry.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1] ||
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    url: `https://youtu.be/${id}`,
  };
}

/**
 * Walks a channel's recent uploads newest-first and returns the first one that
 * is a full episode rather than a Short.
 *
 * Two gates, in order of preference:
 *   1. YOUTUBE_API_KEY set  -> exact durations, hard MIN_SECONDS floor
 *   2. no key               -> per-video Shorts probe, plus a #shorts title check
 *
 * Fails CLOSED. If nothing can be confirmed as long-form - every probe errored,
 * say - this returns null so the caller keeps the last known good episode.
 * Showing a stale real episode beats promoting a Short.
 */
export async function pickLatestLongForm(entries, {
  durationLookup = resolveDurations,
  shortCheck = isShort,
  minSeconds = MIN_SECONDS,
} = {}) {
  if (entries.length === 0) return null;

  let durations = null;
  try {
    durations = await durationLookup(entries.map((e) => e.id));
  } catch {
    durations = null; // fall through to the probe
  }

  for (const entry of entries) {
    if (/#shorts?\b/i.test(entry.title)) continue;

    if (durations) {
      const seconds = durations.get(entry.id);
      if (seconds === undefined) continue;      // unknown: do not gamble
      if (seconds < minSeconds) continue;
      return { ...entry, duration: seconds };
    }

    try {
      if (await shortCheck(entry.id)) continue;
      return entry;
    } catch {
      continue; // probe failed for this one; try the next
    }
  }

  return null;
}

async function get(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export async function resolvePodcast(client, fetcher = get, gates = {}) {
  const { channelId, avatar } = parseChannelPage(await fetcher(client.youtube));
  if (!channelId) throw new Error('could not resolve the channel ID');

  let latest = null;
  let feedOk = false;
  try {
    const entries = parseEntries(
      await fetcher(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`),
    );
    feedOk = true;
    latest = await pickLatestLongForm(entries, gates);
    if (!latest && entries.length > 0) {
      console.warn(`  ${client.name}: no full-length upload in the recent feed; clearing the embed`);
    }
  } catch (error) {
    // An avatar with no embed is still a usable card.
    console.warn(`  ${client.name}: feed unavailable (${error.message})`);
  }

  // feedOk distinguishes "could not reach the feed" from "read the feed and
  // nothing qualified". Only the former should inherit the previous episode.
  return { channelId, avatar, latest, feedOk };
}

function serialize(map) {
  return (
    '// AUTO-GENERATED by scripts/sync-clients.mjs at build time. Do not edit by hand.\n' +
    '// Keyed by the `id` field in podcasts.js. Missing or stale entries degrade\n' +
    '// gracefully: the page shows a monogram and omits the episode embed.\n\n' +
    `export const podcastsLive = ${JSON.stringify(map, null, 2)};\n`
  );
}

export async function syncPodcasts({ write = true, fetcher = get, podcasts, gates = {} } = {}) {
  const roster = podcasts || (await import(`${PODCASTS_FILE}?t=${Date.now()}`)).podcasts;

  let previous = {};
  try {
    previous = (await import(`${OUT_FILE}?t=${Date.now()}`)).podcastsLive || {};
  } catch {
    previous = {};
  }

  const resolved = { ...previous };
  const failures = [];

  for (const client of roster) {
    if (!client.youtube) continue;
    try {
      const data = await resolvePodcast(client, fetcher, gates);
      resolved[client.id] = {
        channelId: data.channelId,
        // An avatar is stable, so a stale one is always better than none.
        // A record with its own `artwork` wins; never overwrite a pinned image.
        avatar: client.artwork || data.avatar || previous[client.id]?.avatar || null,
        // An episode is not. If the feed was readable and nothing cleared the
        // length gate, clear the embed rather than inheriting a stale entry -
        // otherwise a Short committed by an earlier run would live forever.
        latest: data.feedOk
          ? data.latest
          : data.latest || previous[client.id]?.latest || null,
      };
    } catch (error) {
      failures.push(`${client.name} (${error.message})`);
      if (previous[client.id]) resolved[client.id] = previous[client.id];
    }
  }

  if (write) await fs.writeFile(OUT_FILE, serialize(resolved), 'utf8');

  return { resolved, failures, count: Object.keys(resolved).length };
}

// --- CLI --------------------------------------------------------------------

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  try {
    const { resolved, failures, count } = await syncPodcasts();
    const withEmbed = Object.values(resolved).filter((c) => c.latest).length;
    const withAvatar = Object.values(resolved).filter((c) => c.avatar).length;
    console.log(`Clients: ${count} resolved, ${withAvatar} with photos, ${withEmbed} with episodes.`);
    failures.forEach((f) => console.warn(`  unresolved: ${f}`));
  } catch (error) {
    console.warn(`Clients: sync skipped (${error.message}). Using committed data.`);
  }
  process.exit(0);
}
