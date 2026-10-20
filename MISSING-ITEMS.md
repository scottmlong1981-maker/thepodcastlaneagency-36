# Unresolved dependencies

Only genuine blockers are listed. Everything else in the build is complete and verified.

## 1. Calendly booking URL

**Status:** blocking the booking section.

The event name is known to be **First Call with Elisa**, but no URL was supplied and none
exists anywhere in the project. `CALENDLY_URL` in `src/config.js` is an empty string, so:

- the `#book` section does not render
- the hero's secondary "Book a Conversation" button does not render
- the final CTA's secondary button does not render

Paste the verified URL into `CALENDLY_URL` and all three appear. No other edit is needed.
Nothing broken or disabled ships in the meantime.

## 2. Per-episode Apple Podcasts and Spotify links

Episode listings show a YouTube button for every episode, and Apple Podcasts and Spotify
buttons only where a verified per-episode URL exists. **None are recorded yet**, so only
YouTube renders today.

These cannot be derived from YouTube data. An episode's Apple and Spotify URLs contain
their own identifiers, and guessing would send visitors to the wrong episode or to the
show's front page, which the brief specifically rules out.

To add them, open the episode on each platform, use Share then Copy Link, and add an entry
to `src/data/episode-links.js` keyed by the YouTube video id. The file has a worked example
at the top. Episodes with no entry simply show fewer buttons; nothing breaks.

## 3. Apple Podcasts link for The Soul Friend Podcast

Requested, but no Apple URL for that show exists anywhere in the project and none was
supplied, so nothing was added rather than guessing. Its card currently shows YouTube and
Spotify. Paste the URL into the `apple` field of the `the-soul-friend-podcast` record in
`src/data/podcasts.js`.

## 4. Women 360 position in the As Seen On graphic

The brief asks for Women 360 to move to the end of the logo sequence. `as-seen-on.png` is a
single flat image with the logos baked in at fixed positions, so their order cannot be
changed in code, only by producing new artwork. Women 360 is correctly left **unlinked**,
which was the other requirement. Supply a revised graphic with Women 360 last and the link
regions will be re-measured against it.

## 5. Official podcast cover artwork

**Status:** degraded, not blocking.

The Featured Podcasts grid is designed for square cover art. Nine of the ten shows
currently fall back to the YouTube **channel avatar** resolved at build time, which is
lower resolution than real cover artwork and in some cases is a personal photo rather than
the show's cover.

Cover images live on the YouTube, Apple, and Spotify CDNs, which were not reachable from
the environment this build was produced in, and fabricating artwork was not acceptable.

To fix: drop square images into `public/artwork/` and set the `artwork` field on the
matching record in `src/data/podcasts.js`. A record with `artwork` set is never overwritten
by the build-time sync. **10 in 10** already uses the official Podcast Lane logo this way.

**10 in 10** now uses its official series collage (`public/artwork/10-in-10.jpg`).

Shows currently awaiting official artwork: Walks with Mom, Mastering Aging Gracefully,
A Place for Seniors, Conversations with Women Who Lead, The Making Love Podcast,
Behind the Thread Podcast, Local Legends with Jess, Sassy and Strong with Dr Micol,
The Soul Friend Podcast.

## 6. Instagram accounts not yet verified

Three shows have no Instagram action because no official account was supplied:
Conversations with Women Who Lead, Behind the Thread Podcast, Sassy and Strong with Dr
Micol. Add an `instagram` value to the record once an account is confirmed. Accounts were
not guessed.

## 7. Apple Podcasts, other shows

No Apple Podcasts listing was supplied, so no Apple action renders on that card.

## 8. Form notification recipient

Netlify form notifications **cannot be configured from source files**. Routing submissions
to `hello@thepodcastlaneagency.com` must be done in the Netlify dashboard after deploying.
See `DEPLOYMENT-CHECKLIST.md` step 4. This has not been verified as configured.

## 9. Payment / deposit step

Intentionally deferred and not implemented. No approved amount, no confirmed purpose, and
no verified production payment destination exist. `PAYMENT_ENABLED` is `false` in
`src/config.js`. No empty section, disabled button, or placeholder checkout ships.

## 10. Privacy policy

The footer states a privacy policy is coming. No policy route exists, so consent text
links to nothing rather than to a fabricated page.

## 11. Testimonial photographs

Testimonials are text only. The only available images are small crops inside a single
screenshot, and enlarging them would look worse than no photo. Supply clear headshots if
you want them added.

## 12. Contact details

No public email, phone number, or address is published anywhere on the site, because none
appeared in an approved source. The three forms work regardless. No phone number appears on the site.
