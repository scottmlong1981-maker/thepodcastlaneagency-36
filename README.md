# The Podcast Lane

Marketing and episode website for The Podcast Lane: podcast production, coaching, and
visibility services, plus the show's own episode library.

Built as a static React site with Vite and React Router. No backend, no database, no
private server. Forms are handled by Netlify.

---

## Quick start

```bash
npm install
npm run dev      # local dev server
npm run build    # syncs new episodes, then builds to dist/
npm run preview  # serve the production build locally
npm run sync         # pull new episodes from YouTube RSS without building
npm run sync:podcasts # refresh podcast artwork fallbacks
```

Requires Node 18 or newer (Netlify is pinned to Node 20 in `netlify.toml`).

---

## Stack

| Piece | Choice | Why |
|---|---|---|
| Framework | React 18 | Matches the reference project's toolchain |
| Build | Vite 5 | Fast builds, clean static output |
| Routing | React Router 6, `BrowserRouter` | Clean public URLs, not hash routes |
| Styling | Plain CSS with custom properties | Three-color brand system, no framework needed |
| Forms | Netlify Forms | No server required |
| Icons | Hand-written inline SVG | Avoids shipping an icon library for six glyphs |

Total production dependencies: three. There is no CSS framework, no icon package,
and no UI kit.

---

## Routes

| Route | Page |
|---|---|
| `/` | Home: video hero, platform bar, featured episodes, 10 in 10 trailer, founder, closing CTA |
| `/episodes` | (navigation label: "10 in 10 Series") | Full library: 49 episodes, load more, then search and guest filter below the list, platform links |
| `/resources` | "What's Possible": unlinked from navigation, reachable by direct URL, noindex |

| `/featured-podcasts` | Ten podcasts as a stacked list: square artwork, description, platform links |
| `/become-a-guest` | Guest intro, qualifications, guest application, then sponsorship and sponsor inquiry |
| `/work-with-us` | Client services: hero, packages, inquiry form, process, The Velvet Table, final CTA |
| `*` | Branded 404 with links back to Home and Episodes |

---

## Brand implementation

The brand kit is a closed corpus derived from the approved logo file. The site holds to
it strictly.

```css
--red:   #B90002;  /* accent only, never a large fill or background */
--ink:   #241F20;  /* all body text; never pure #000000 */
--white: #FFFFFF;  /* the only background */
```

All three live in `src/styles.css` under `:root`. Nothing outside them appears anywhere.

**Deliberate consequences of that constraint:**

- **No border-radius anywhere.** The logo's arcs are the only curves in the system, so
  every button, input, card, and frame is square-edged.
- **No gradients and no shadows.** Neither appears in the source file.
- **Hairlines and secondary text use Ink at reduced alpha**, never a new grey. The two
  text alphas were chosen to clear WCAG AA on white: `0.78` gives 7.4:1 and `0.72` gives
  6.4:1. Values below roughly `0.6` fail at 4.5:1 and must not be used for text. This is
  noted in a comment at the top of the stylesheet.
- **No dark mode.** No dark-background lockup exists in the corpus. If you want one, get
  an approved dark export first, then add it here.

**Typefaces.** The brand kit is explicit that exact typefaces cannot be identified from a
logo image, so these are stand-ins, not claims:

| Role | Face | Stands in for |
|---|---|---|
| Display | Cormorant Garamond | The tracked serif caps in "PODCAST" / "LANE" |
| Body / UI | Inter | Not specified in the corpus; a neutral choice |
| Script accent | Parisienne | The script "The" |

Swap these in `src/styles.css` (`--display`, `--body`, `--script`) and update the Google
Fonts link in `index.html` if the real brand fonts become available.

**Logo files.** `public/logo.png` is the transparent export used in the header and
footer. `public/logo-full.png` is the full-color file on white, used for social sharing
images. Neither is recolored, stretched, skewed, rotated, or cropped.

---

## Deploying to Netlify

**Code changes reach the site through Git, not through the Netlify UI.** This project
deploys from a connected repository, so "Trigger deploy" rebuilds whatever commit the
branch currently points at. It picks up new environment variables, but it cannot pick up
code you have not pushed. If a change does not appear after a deploy, confirm the commit is
in the repo before debugging anything else.

Connect the repository and Netlify will read `netlify.toml`. Nothing needs to be typed by
hand, but for reference:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20, set in `netlify.toml`

**SPA routing.** `netlify.toml` and `public/_redirects` both send unmatched paths to
`index.html` with a 200. Netlify serves real files first, so `/forms.html`,
`/robots.txt`, `/sitemap.xml`, and the hashed assets are unaffected. This is what makes
`/episodes` work on a hard refresh rather than 404ing.

**Domain.** `SITE_URL` in `src/config.js` is the single place the production domain is
declared. It currently reads `https://www.thepodcastlaneagency.com`, which is the website
listed on the show's Apple Podcasts page. Change it there and canonical tags, Open Graph
URLs, and structured data all follow. `public/robots.txt` and `public/sitemap.xml` carry
the domain literally, so update those two files as well if it changes.

---

## Forms

Three forms, all handled by Netlify:

| Form name | Page |
|---|---|
| `guest-request` | `/guest-requests` |
| `sponsor-opportunity` | `/sponsor-opportunities` |
| `work-with-us-inquiry` | `/work-with-us` |

Submissions land in **Netlify dashboard → Forms**. Add notification emails there under
*Form notifications*; no email address is hardcoded in the site.

**How the wiring works.** Netlify discovers forms by parsing static HTML at deploy time,
which a client-rendered React app does not produce. `public/forms.html` contains a hidden
copy of each form so the parser registers all three field sets. The React components then
POST url-encoded data to `/` with a matching `form-name`. **Do not delete
`public/forms.html`** — submissions will start failing silently if you do.

If you add or rename a field in a form, add it to `public/forms.html` too, or that field
will be dropped from submissions.

**Included on every form:** a honeypot (`bot-field`), semantic labels tied to inputs,
inline validation with an error summary that receives focus, `aria-invalid` and
`aria-describedby` on failed fields, a consent checkbox, and a success state that replaces
the form. No sensitive medical, financial, or identification fields are collected, and
nothing is stored in the browser.

---

## Updating episodes

Episode content lives in **`src/data/episodes.js`**, generated from a spreadsheet export
of the YouTube channel. It exports:

- `episodes` — 49 full episodes, sorted newest first
- `trailer` — the 29-second series trailer, kept out of the main list
- `guests` — unique guest names, alphabetized, used by the filter
- `latestEpisode` and `recentEpisodes` — what the Home page features

Sorting is by `publishedAt`, so the Home page always shows the four newest episodes and
the library always leads with the newest. You never set "latest" by hand.

### Adding an episode by hand

Add an object to the `episodes` array. Order does not matter; sorting is automatic.

```js
{
  "id": "CgVbXTOmgMc",                 // the v= parameter from the watch URL
  "title": "Episode title",
  "guest": "Guest Name",               // or null if there is no guest
  "publishedAt": "2026-05-30T07:00:25Z",
  "duration": "13:09",
  "description": "Full show notes.",
  "url": "https://youtu.be/CgVbXTOmgMc",
  "thumbnail": "https://i.ytimg.com/vi/CgVbXTOmgMc/maxresdefault.jpg"
}
```

To find the video ID, open the episode on YouTube and copy the characters after `v=`
(or after `youtu.be/`). The thumbnail URL is that ID dropped into the pattern above —
there is nothing to upload. If `maxresdefault` is missing for a given upload, the player
falls back to `hqdefault` automatically.

### Regenerating from the spreadsheet

`scripts/build_episodes.py` rebuilds the data file from
`Podcast_Playlist_Detailed.xlsx`:

```bash
npm run episodes
```

It excludes sub-minute clips, separates the trailer, and derives guest names from titles
and show notes. Where a title does not expose the guest cleanly, the name is pinned in the
`OVERRIDES` map at the top of the script, each one verified against that episode's own
description. Add to that map rather than editing `episodes.js` directly, since the
generated file is overwritten on every run.

### Per-episode Apple and Spotify links

`src/data/episode-links.js` holds them, and `EpisodeLinks` renders them wherever an episode
appears, so adding one entry updates every place that episode is shown.

Entries can be keyed two ways. **By video id** is exact and preferred. **By title pattern**
exists because several supplied episodes are newer than the committed snapshot, so their
video ids are not known here yet; the pattern is matched against the YouTube title and
resolves as soon as the episode syncs. If an episode matches both, the id wins. A pattern
that matches nothing yields no buttons rather than a wrong link.

Once an episode has synced, moving its entry from `byTitle` to `byId` makes it exact and is
worth doing.

## Pinned homepage episodes

Three episodes sit permanently between the Featured Show and the dynamic feed. Their ids
live in `src/data/static-episodes.js` and nothing else can move them: the YouTube sync
writes to `episodes`, while this list is read separately and rendered in its own fixed
order. An API refresh can add, reorder, or replace anything in the feed without touching
them.

The dynamic feed below excludes both the featured episode and these three, so no episode is
ever shown twice. If a pinned id is newer than the committed snapshot, the card renders
with its thumbnail and link until the next build syncs the title and show notes; no
metadata is invented in the meantime.

### The featured episode

**It is pinned, not automatic.** YouTube's API exposes only the *channel trailer for
unsubscribed viewers*. The video at the top of the channel Home tab is the separate
*featured video* slot, which the API does not expose at all, so it cannot be tracked. To
change it, paste the new video id into `FEATURED_EPISODE_ID` in `src/config.js`.

Both the Home page ("From the show") and the episode library lead with the same featured
episode, resolved once in `src/data/featured-episode.js` so the two pages cannot disagree.

"From the show" leads with the video pinned at the top of the YouTube channel home, not
necessarily the newest upload. Resolution order:

1. `FEATURED_EPISODE_ID` in `src/config.js`, a manual pin
2. the channel's featured video, resolved at build time into `src/data/featured.js`
3. the newest episode

On the Home page the three episodes below it are the newest, excluding whatever leads. The
episode library deliberately does the opposite and keeps the featured episode in the list
as well, mirroring YouTube, where the featured video also appears in the Videos tab.

When nothing is featured on the channel, the resolver falls back to the newest episode, so
the library's featured row and its first list entry are briefly the same episode. Setting a
featured video on the channel, or pinning `FEATURED_EPISODE_ID`, resolves that.

**The build-time lookup needs `YOUTUBE_API_KEY`,** because the featured video is not in the
RSS feed. It reads `brandingSettings.channel.unsubscribedTrailer`, which is the video an
unsubscribed visitor sees first. Watch the deploy log: `Featured: channel highlight is
<id>` means it resolved; `Featured: none set on the channel` means YouTube returned nothing,
usually because the highlight is set as a returning-subscriber feature rather than a channel
trailer. That case is not exposed by the API, so pin the id in `FEATURED_EPISODE_ID`
instead. An id that is not in the episode data is ignored rather than trusted.

### Automatic updates from YouTube

New episodes are picked up automatically. Two pieces make that work.

**How the library stays complete.** When `YOUTUBE_API_KEY` is set, the build walks the
channel's full uploads playlist, so every episode is present regardless of age. Without a
key it falls back to the RSS feed, which carries only about the 15 most recent videos.

That distinction matters more than it sounds. Build-time additions are written inside the
Netlify build container and are never committed back to the repo, so each deploy starts
again from the committed snapshot. With RSS alone, everything between that snapshot and the
most recent 15 videos would be permanently missing from the site. The API path avoids that
entirely. Watch the deploy log for `channel catalog: N uploads via the Data API`.

**1. A feed sync at build time.** `scripts/sync-episodes.mjs` runs before every build (the
`prebuild` npm script) and merges new videos into `src/data/episodes.js`. There is no API
key, no quota, and no credentials required — the feed is public.

**It tracks one playlist, not the channel.** Only videos in
`PL2PcECQX5jFTTG9wlPd8fPG0Qj2Dtw-7R` are picked up. That is the same playlist as the
YouTube Studio URL, but read through the public feed so no login is involved. Anything
uploaded outside that playlist — Shorts, clips, promos — is ignored entirely. **Do not add
the channel feed back to `FEEDS`**; that is what previously pulled in every upload.

Run it by hand any time with:

```bash
npm run sync
```

**2. A daily rebuild.** `netlify/functions/rebuild.mjs` is a scheduled Netlify function
that fires a build hook once a day at 13:00 UTC. To switch it on:

1. Netlify → Site settings → Build & deploy → Build hooks → **Add build hook**
2. Copy the URL it gives you
3. Netlify → Site settings → Environment variables → add `BUILD_HOOK_URL` with that value

Change the cron expression at the bottom of `rebuild.mjs` if daily is the wrong cadence.
With no `BUILD_HOOK_URL` set, the function logs and exits harmlessly, so nothing breaks if
you skip this.

**How the sync behaves, and why:**

- **It never fails the build.** If YouTube is unreachable or the feed is malformed, it
  logs a warning and exits 0, and the committed episode data is used unchanged. A feed
  problem must never block a deploy.
- **It only adds.** Existing entries are never edited or deleted, so any correction you
  make by hand to `episodes.js` survives every future sync.
- **Durations arrive blank.** RSS carries no duration field, so new episodes come in with
  `duration: null` and the UI simply omits it. Fill it in by hand, or re-run
  `npm run episodes` from an updated spreadsheet, when you want it shown.
- **Guest names are inferred from titles**, using the same rules as the spreadsheet
  importer. When a title does not expose the guest clearly, the field is left empty rather
  than guessed, and the card omits it.
- **The feed only carries the ~15 most recent playlist items**, which is ample for
  catching new publications but means it can never rebuild the full catalog. The committed
  file is the source of truth for everything older.
- **A length gate backs up the playlist filter.** Full episodes run well over two minutes,
  so anything shorter is rejected as a clip. How strictly this is enforced depends on
  whether `YOUTUBE_API_KEY` is set — see below.
- **The trailer and the sub-minute clip stay excluded** via a skip list at the top of the
  script. Add IDs there if other uploads should stay out of the library.

### Optional: exact durations with an API key

The playlist filter alone is enough to keep Shorts out. The length gate is belt and
braces, and it works one of two ways:

**Without an API key (default).** Each new video is probed once: a Shorts URL returns 200
for an actual Short and redirects for anything longer. Reliable in practice and needs no
credentials. Durations still arrive blank, because RSS omits them. If the probe itself
fails, the video is kept — with a curated playlist, wrongly dropping an episode is worse
than wrongly including one.

**With an API key (better).** Set `YOUTUBE_API_KEY` as a Netlify environment variable and
the sync calls the YouTube Data API instead: it enforces a hard two-minute floor on exact
durations, **and fills in the real duration** for every new episode, so nothing needs
filling in by hand. One request per sync, negligible against the free quota. Get a key
from Google Cloud Console with the YouTube Data API v3 enabled. The key is only ever used
at build time and is never shipped to the browser.

Change the floor by editing `MIN_SECONDS` at the top of the script. If the API call fails,
the sync falls back to the probe rather than dropping episodes.

**One caveat worth knowing:** the merge logic is covered by tests (`node test-sync.mjs`,
18 checks, using fixture feeds), but the live network call could not be exercised from the
environment this was built in, where outbound requests to YouTube are blocked. After your
first deploy, check the Netlify deploy log for a line reading `Episodes: up to date (49)`.
If it instead says `feed unavailable`, the feed URLs or IDs at the top of the script need
a look.

---

## Press logos (As Seen On)

`public/press/` holds one file per outlet, cropped from the supplied composite. They were
separated for two reasons: the composite used percentage-positioned click regions that
drifted as the image resized, and the two Arizona Foothills marks could not be linked
individually.

Order follows the artwork, with Women 360 last. Women 360 has no verified destination, so
it renders unlinked rather than pointing somewhere invented. AZF and Foundress deliberately
share the same Foothills URL.

## Social link previews

**The card title is site-wide.** `SOCIAL_TITLE` in `src/config.js` sets `og:title` and
`twitter:title` for every page, so a link shared from anywhere on the site presents the same
headline. Each page keeps its own `<title>` for the browser tab and search results, which
stay page-specific.


The card that appears when the homepage is shared is set in two places, and they must stay
in agreement:

- `index.html` carries static Open Graph and Twitter tags. Facebook, LinkedIn, and iMessage
  do not run JavaScript, so these are what they actually read.
- `src/components/Seo.jsx` sets the same values at runtime for each route.

`public/og-image.jpg` is a purpose-built 1200x630 card cut from the 10 in 10 Series collage.

It is cut from the landscape version of the artwork (`public/artwork/10-in-10-wide.jpg`,
1280x720). At 1.78:1 that is already close to the 1.905:1 a social card wants, so only 48px
of empty collage is trimmed and the whole lockup survives: numerals, script, wordmark and
the Podcast Lane logo. The square version of the same artwork is kept at
`public/artwork/10-in-10.jpg` for the Featured Podcasts card, where square is what is
needed.

JPEG rather than PNG because the source is photographic, which takes the card from roughly
500 KB to 105 KB. Some crawlers skip large images.

To regenerate from new artwork, crop to a 1.905:1 window that keeps the type intact, then
resize to exactly 1200x630.

After changing any of this, re-scrape the URL in Facebook's Sharing Debugger and LinkedIn's
Post Inspector. Both cache aggressively and will keep showing the old card otherwise.

## As Seen On

`public/as-seen-on.png` is a composite. The logo row was recomposed so Women 360 sits last,
each mark copied from the original at full size and repositioned, never rescaled or redrawn.
Link regions in `src/components/AsSeenOn.jsx` are percentages measured from that image, so
they track their logos at any width.

Five marks are linked; Women 360 is deliberately not, because no URL has been supplied for
it. The two Arizona Foothills marks (azf and the orange Foundress F) share one destination
on purpose.

If the artwork is ever replaced, the hotspot percentages must be re-measured against the new
file or they will point at the wrong logos.

## Deployment

See `DEPLOYMENT-CHECKLIST.md` for the manual Netlify upload, form notification routing,
domain, HTTPS, redirect testing, and rollback. See `MISSING-ITEMS.md` for genuine
unresolved dependencies.

## Work With Us

`/work-with-us` replaces the former `/contact` page. Old route 301s at the server
(`netlify.toml` and `_redirects`) with a client-side `<Navigate replace>` as well.

**Five sections are gated behind config values in `src/config.js` and do not render until a
verified value exists.** This is deliberate: each was requested, but nothing in the project
supports it, and a fabricated Calendly link or invented deposit would be worse than an
absent section.

| Constant | Section | Status |
|---|---|---|
| `CALENDLY_URL` | Booking, plus the hero and final secondary CTA | No verified URL supplied |
| `LEARN_MORE_ROUTE` | Learn More cross-link | No such page exists |
| `AS_SEEN_ON_IMAGE` | As Seen On | Supplied, live at `/as-seen-on.png` |
| `VELVET_TABLE_IMAGE` | Velvet Table artwork | Supplied, live at `/velvet-table.jpg` |
| `PAYMENT_ENABLED` | Payment/deposit | No approved amount, purpose, or destination |

Set a value and the section appears, correctly ordered, with no other edit. Nothing renders
an empty wrapper or a disabled button in the meantime.

**Both supplied graphics are in place.** The As Seen On artwork already contains its own
"As Seen On" heading, so the page renders that heading visually hidden for assistive
technology rather than printing a duplicate. Its logos carry no links and no endorsement
claims, since none were verified. The Velvet Table artwork is portrait (972x1280) and is
capped at 23rem so it never stretches into a banner; both images declare intrinsic
dimensions to prevent layout shift.

The Velvet Table copy and phone number are confirmed from the artwork itself: "Because the
right room changes everything", a private gathering for 8 to 10 women, three-course meal
and cocktail included, `tel:+16022283316`. The name is "The Velvet Table" everywhere,
never "Velvet Rope", despite the source filename.

**The process section is deliberately minimal.** No confirmed sales process exists in the
project, so it states only what is true: inquiry, conversation, work. It promises no
response time, no call length, no proposal timeline, and no deliverables.

## Become a Guest (consolidated page)

`/become-a-guest` replaces the former `/guest-requests` and `/sponsor-opportunities` pages.
It runs guest intro, qualifications, guest application (`#application`), sponsorship
benefits (`#sponsorship`), then sponsor inquiry (`#sponsor-inquiry`).

**Old routes redirect two ways.** `netlify.toml` and `public/_redirects` issue a server-side
301 for both, so external links and search engines follow properly. React Router also
registers each old path with a client-side `<Navigate replace>`, which covers in-app
navigation and any request that reaches the SPA before the redirect applies. Neither old
path renders a page any more, and neither target redirects back, so there is no loop.

**The introduction is text-led by design.** No guest or interview photography exists in the
project, and the spec permits a typographic introduction in that case rather than stock or
generated imagery. If real interview photography is supplied later, it belongs here.

**Anchors clear the sticky header** through `scroll-margin-top: 6.5rem` on
`.anchor-target`, rather than a JavaScript offset calculation. Section headings land in
view rather than underneath the header.

**Sponsorship is deliberately quieter:** a light `--ink-06` ground, the smaller
`.sponsorship__heading` instead of `.h2`, a plain rather than red submit button, and a
compact benefit list. It stays reachable without competing with the guest application.

**Guest application fields:** name, email, phone, business or organization, topic or area of
expertise, relevant links, background, why you want to be a guest, three discussion topics,
a 75 to 150 word bio for show notes, contact information to publish (optional), and consent.

Any new field must also be added to `public/forms.html`, or Netlify will not detect it and
the value will be dropped from submissions.

**Both forms remain separate Netlify forms** with distinct names (`guest-request`,
`sponsor-opportunity`), so submissions stay distinguishable in the dashboard. Any new field
must also be added to `public/forms.html` or it will be dropped from submissions.

## Updating the homepage

All homepage copy and every CTA destination live in **`src/data/home.js`**, not in the JSX.
That file exports `homeHero`, `homeEpisodes`, `homeNewHere`, `homeFounder`, and
`homeFinalCta`.

**Replacing the temporary hero video.** The hero currently reuses the 29-second 10 in 10
trailer already present in the episode data. When the permanent sizzle reel exists, change
the two marked lines in `homeHero.video` to the new YouTube ID and poster URL. Nothing else
changes, and the "New Here" section keeps its own reference, so the two never fall out of
step. The duplication is intentional for now: the same video appears in the hero and again
lower down, and the two players are independent, since each `VideoEmbed` holds its own
state.

**Routes are declared once.** `APPLY_ROUTE`, `CONTACT_ROUTE`, and `EPISODES_ROUTE` at the
top of `home.js` feed every homepage CTA, so the guest-application destination is one edit
rather than four.

**Episode presentation is shared.** The homepage rows and the Episodes library both use
`ShowNotes`, so full show notes with the "Read the full show notes" control behave
identically in both places. Changing the clamp threshold in one component changes both.

**Packages and the six-step process were removed from the homepage** in this phase.
`src/data/services.js` is intentionally kept, unused, so that content can return on a
services page without being retyped.

**The founder section is text-only by design.** No image, no placeholder, no reserved
column. Hierarchy comes from spacing, the highlights rule set, and the aside label.

## Updating featured podcasts

Route `/featured-podcasts`, data in **`src/data/podcasts.js`**, one record per show in
display order. `/featured-clients` 301s to the new route.

Each record supports `id`, `name`, `label`, `description`, `artwork`, `apple`, `spotify`,
`spotifyScope`, `youtube`, and `instagram`. Anything `null` or omitted simply does not
render, so a show with no Instagram account shows no Instagram action rather than a dead
link.

**Artwork:** setting `artwork` to a path or URL pins that image and the build-time sync will not
overwrite it. Leaving it unset falls back to the YouTube channel avatar resolved by
`scripts/sync-podcasts.mjs`. Only 10 in 10 currently has pinned artwork. See
`MISSING-ITEMS.md`.

**Layout is a deliberate stacked list, not a grid.** One podcast per row, square artwork
left, details right. An earlier revision used a three-column card grid; it was changed back
by request, because each row is a route to a whole show rather than an episode, and the
wider text column suits the descriptions. Do not "correct" this back to a grid.

**Spotify scope:** `spotifyScope: 'episode'` labels the link "Spotify episode" rather than
implying it opens the whole show. Only The Soul Friend Podcast uses it, because that is the
URL supplied.


The roster lives in **`src/data/clients.js`**, an ordered array — top of the array is top
of the page. Each entry takes a `name`, a `youtube` channel URL, and optional `description`,
`apple`, and `spotify` values. Anything set to `null` is simply omitted: no description
means no paragraph, no Spotify URL means no Spotify link, no channel URL means the name
renders as plain text rather than a link.

**Photos and latest episodes are not stored there.** `scripts/sync-clients.mjs` resolves
both at build time: it reads each channel page for the profile photo and canonical channel
ID, then reads that channel's public RSS feed for recent uploads. Results are written to
`src/data/clients-live.js`, keyed by `id`.

**Shorts are filtered out.** A channel feed lists Shorts alongside full episodes, and the
newest entry is frequently a Short. Unlike our own show, a client has no curated playlist
to read from, so the script walks their recent uploads newest-first and takes the first one
that clears the same two-minute floor used for our episodes (`MIN_SECONDS` in
`sync-episodes.mjs`). Three filters apply in order: titles tagged `#shorts` are dropped
outright, then exact durations if `YOUTUBE_API_KEY` is set, otherwise a per-video Shorts
probe.

**Stale entries are cleared, not inherited.** The script distinguishes "could not reach
the feed" from "read the feed and nothing qualified." An unreachable feed keeps the
previous episode; a readable feed with no qualifying upload clears the embed. Without that
distinction, a Short committed by an earlier build would survive every future sync, because
the fallback would keep resurrecting it. Avatars are exempt — they are stable, so a stale
one always beats none.

This gate **fails closed**, which is the opposite of the episode sync. If nothing in a
client's recent feed can be confirmed as long-form — every probe errored, or they have
genuinely only posted Shorts lately — the script returns nothing and the previously
committed episode is kept. Showing a slightly stale real episode is better than promoting
a Short as someone's latest work. The build log names any client this happens to.

That file is committed on purpose. If a channel is unreachable during a build, the last
known good photo and episode are kept rather than vanishing. If a client has never
resolved, the card falls back to a lettered monogram and omits the embed — the page still
reads as complete.

Run it on its own with `npm run sync:podcasts`.

**Every Spotify URL must be show-scoped** (`open.spotify.com/show/...`), never an
`/episode/` link, or the button drops visitors into a single episode instead of the show.
A test enforces this. Behind the Thread and The Soul Friend Podcast have no Spotify button
because no link was supplied for them.

**Spotify links carry a scope.** Most are show-level. The Soul Friend Podcast's supplied URL
is episode-level, so its record sets `spotifyScope: 'episode'` and the card labels the link
"Spotify episode" with a matching aria-label, rather than implying it opens the whole show.
No show-level URL has been confirmed for that podcast; if one is found, report it before
substituting. A test enforces that any `/episode/` URL is flagged this way.

**A note on the client avatars:** they are square, not circular. YouTube renders them as
circles, but the brand kit is explicit that the logo's arcs are the only curves in this
system, so every other element stays square-edged.

## Updating resources

`/resources` runs a book section, then a webinars section, then guides. It is built to
receive real products without a rebuild.

**Book section modules:** hero with status chip, who it is for, inside the book, about the
author, excerpt status, availability status, and three related episodes. The lists are
arrays at the top of `src/pages/Resources.jsx` (`readerGroups`, `insideTopics`). The
related episodes are referenced by video ID in `RELATED_IDS`, so their titles and
thumbnails always match the episode data rather than being duplicated.

**Webinars section modules:** intro, next-session state, program preview, and recording
archive. Proposed topics live in the `sessionTopics` array.

**What is deliberately absent, and must stay absent until it is real:** a book title,
author byline beyond Elisa, publisher, ISBN, price, publication date, retailer link,
preorder, sample chapter, session dates, presenters, registration, recordings,
downloadable worksheets, and any membership or paywall. The page states plainly that each
of these does not exist yet. When one becomes real, replace the placeholder and change its
status chip.

Every unreleased item carries a visible status label: "Coming soon", "In development",
"Working title to be confirmed", "Details coming soon", "Proposed topic", "Future
resource". There is no checkout code anywhere in the codebase.

---

## Analytics

Analytics is prepared but inert. No measurement ID is hardcoded, and no tracking script
loads without one.

To activate, set an environment variable in **Netlify → Site settings → Environment
variables**:

```
VITE_GA4_ID=G-XXXXXXXXXX
```

Redeploy. `src/analytics.js` then loads gtag and sends a `page_view` on every route
change. With no ID set, `initAnalytics()` and `trackEvent()` are no-ops, so a missing
credential can never break the site.

`trackEvent(name, params)` is exported and ready for outbound episode clicks, platform
clicks, and form submissions. These are not yet attached to elements — wire them up once
you have confirmed which events you actually want to measure, so the numbers mean
something.

Note that GA4 sets cookies. Depending on where your visitors are, you may need a consent
banner before enabling it. `anonymize_ip` is on by default.

---

## Layout notes

The episode search and guest filter sit **below** the library rather than above it, by
request. Because the controls are under the results they change, filtering scrolls the
page back up to the top of the list once typing pauses (450ms debounce, so it does not
yank on every keystroke, and it honors `prefers-reduced-motion`). A short line under the
controls says "Results appear in the library above," and a match count appears above the
list only while a filter is active.

Section padding runs about 25% tighter than a default rhythm: `--section-y` in
`src/styles.css` is the single value controlling it, so the whole page can be loosened or
tightened from one place.

## Accessibility

Targets WCAG 2.2 AA. In place: a skip-to-content link, semantic landmarks, exactly one
`h1` per route in correct heading order, keyboard-operable navigation, visible focus rings
in Signature Red, a mobile drawer that traps focus and closes on Escape and restores focus
to its trigger, body-scroll locking while it is open, labeled form fields with
programmatic error messaging, descriptive iframe titles, alt text on informative images
and empty alt on decorative ones, touch targets at or above 44px, and
`prefers-reduced-motion` support.

Contrast was checked numerically rather than eyeballed: Ink on white is 16.3:1, Signature
Red on white is 6.9:1, white on Signature Red is 6.9:1, and both muted text tints clear
6.4:1.

No information is conveyed by color alone, and there is no autoplaying audio or video.

---

## Performance

The episode library never loads 49 YouTube players. Each episode renders the official
thumbnail behind a play button, and the iframe mounts only after a click
(`src/components/VideoEmbed.jsx`), using `youtube-nocookie.com`. Below-the-fold
thumbnails are lazy-loaded; the Home page's featured thumbnail is eager.

The library also paginates at nine episodes with a Load more control, so a first visit
renders nine cards rather than the full catalog.

Production bundle: roughly 103 KB gzipped JavaScript and 3.4 KB gzipped CSS.

---

## Single-file preview

`npm run preview:single` compiles the whole site into one self-contained
`dist-preview/index.html`, with the JavaScript, CSS, and logo all inlined. Useful for
review without deploying.

It uses `MemoryRouter` rather than `BrowserRouter`, selected by the `VITE_PREVIEW` flag
that only `vite.config.preview.js` sets. The reason is specific: when the file is opened
from disk or inside a sandboxed `about:srcdoc` iframe, `window.location.href` is not a
parseable URL, and the history-based routers call `new URL(window.location.href)` and throw.
MemoryRouter keeps navigation entirely in memory and never reads the location.

Preview limitations, all expected: navigation works by clicking but the address bar does not
change, client photos and latest episodes fall back to monograms with no embed (they resolve
at build time against YouTube), and the forms validate but cannot submit. Production is
unaffected.

## Verifying the build

Two test scripts run the compiled bundle in a headless DOM. They require `jsdom`, which is
intentionally not a project dependency:

```bash
npm install --no-save jsdom
node smoke.mjs      # all 7 routes render, correct titles, one h1, no missing alt text
node interact.mjs   # section order, nav, search, filter, reset, load more, video facade, mobile menu, form validation
```

A third script needs no extra packages and covers the episode sync against fixture feeds:

```bash
node test-sync.mjs  # merge, dedupe, playlist scope, Shorts + duration gates, dead-feed safety
```

A fourth covers the client sync:

```bash
node test-podcasts.mjs # channel/avatar parsing, Shorts filtering, outage recovery, roster integrity
```

All four pass as committed: 7/7 routes, 210/210 interaction checks, 31/31 episode-sync checks,
41/41 podcast-sync checks.

---

## Content integrity

Everything factual on this site traces to a supplied source.

- **Episode data** is verified YouTube data: real video IDs, titles, publication dates,
  durations, official thumbnails, and complete show notes. Nothing is invented.
- **Packages and features** come verbatim in substance from the Website Source document.
  No pricing appears in that source, so no pricing appears on the site; every package card
  ends in a conversation instead.
- **Elisa Lane's biography and highlights** come from the Elisa Lane source document, with
  no added credentials or awards.
- **The positioning copy** on the Home page is a client-facing rendering of the Business
  Model document.
- **No fabricated content anywhere:** no testimonials, no audience numbers, no download
  totals, no demographics, no sponsors, no case studies, no staff, no certifications, no
  partnerships, no product availability, and no lorem ipsum.
- **Guest filtering** uses only real guest names from the actual catalog. No topic
  categories were invented to make the filter look populated.
- **The Resources page mirrors the structure of two reference pages only.** The module
  order and page shape were modeled on an external reference; every word, list, label,
  episode, and person on the page is Podcast Lane material or a clearly marked placeholder.
- **Walks With Mom appears on the Featured Clients page as a client**, at the client's
  request, using the description they supplied. That is the one intentional exception to
  the original separation rule, which was about not reskinning their site. Everywhere else
  on this site, none of their brand, copy, people, episodes, imagery, colors, fonts,
  metadata, or contact details appear. (One genuine Podcast Lane episode happens to feature a guest who also
  appears in that other project — that is this show's own verified episode data, not
  borrowed content.)

---

## Launch checklist

- [ ] Confirm `SITE_URL` in `src/config.js`, plus `robots.txt` and `sitemap.xml`
- [ ] Supply the verified Calendly URL and a Learn More route
- [ ] Decide whether to publish a contact email or phone number (currently none, by design)
- [ ] Add form notification recipients in the Netlify dashboard
- [ ] Submit a test entry through all three forms after the first deploy
- [ ] Set `VITE_GA4_ID` if you want analytics, and decide on consent handling
- [ ] Add real photography of Elisa and the studio when available
- [ ] Replace the Resources placeholders once a real product exists
- [ ] Swap in official brand fonts if they are ever supplied
- [ ] Write and link a real privacy policy (the footer currently says one is coming)
- [ ] Add a build hook and set `BUILD_HOOK_URL` to enable the daily episode sync
- [ ] Optionally set `YOUTUBE_API_KEY` for exact durations and strict length filtering
- [ ] After the first deploy, confirm client photos and episodes resolved in the build log
- [ ] Confirm the first deploy log shows the feed syncing rather than `feed unavailable`
- [ ] Verify the episode list is current
- [ ] Test the mobile menu and check every external link
- [ ] Run `npm run build` and confirm a clean production build

---

## Still needs real client information

These are the only places the site is waiting on you:

1. **Contact details.** No email, phone number, or address is published anywhere, because
   none appeared in an approved source. Forms work regardless.
2. **Photography.** The only imagery is the logo and the official YouTube thumbnails. A
   portrait of Elisa and any studio photography would strengthen the Home page most.
3. **Privacy policy.** Referenced in the footer, not yet written.
4. **Analytics ID.** Configured, inactive.
5. **Resource products.** Structure built, no real titles, authors, dates, or prices.
6. **Spotify links for Behind the Thread and The Soul Friend Podcast**, plus Apple for
   Soul Friend, if those shows are on those platforms.
