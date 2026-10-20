# Deployment checklist

For `podcast-lane-netlify-upload.zip`, the manual drag-and-drop package.

## 1. Upload the production ZIP

1. Sign in to Netlify and open the site (or **Add new site → Deploy manually** for a new one).
2. Go to **Deploys**.
3. Drag `podcast-lane-netlify-upload.zip` onto the manual deploy area.

The ZIP contains the site at its **root**, not nested inside a `dist/` folder, which is
what Netlify expects. Do not unzip it first.

Deployment takes under a minute. There is no build step, since the archive is already built.

## 2. Verify the deployment

Open each route and confirm it renders rather than showing Not Found:

- `/` home, with the 10 in 10 video hero
- `/episodes` 49 episodes, search and guest filter
- `/resources` coming soon states
- `/featured-podcasts` ten cards including 10 in 10
- `/become-a-guest` guest application and sponsorship
- `/work-with-us` inquiry form, As Seen On, The Velvet Table

Then check, on at least one route: **refresh the page directly** (not by clicking a link).
A working refresh proves the SPA fallback in `_redirects` is being applied. Also open the
browser console and confirm no application errors appear. Browser-extension noise is not a
site error.

## 3. Confirm all three forms were detected

Go to **Forms** in the site sidebar. You should see exactly three:

- `guest-request`
- `sponsor-opportunity`
- `work-with-us-inquiry`

If any is missing, `forms.html` did not make it into the upload. Confirm the file exists at
the root of the ZIP. Netlify discovers forms by parsing static HTML at deploy time, which a
React app does not produce on its own, so that file is what registers them.

## 4. Route form notifications

**This cannot be set from source files and is not yet configured.**

1. **Forms → Form notifications → Add notification → Email notification.**
2. Set the recipient to `hello@thepodcastlaneagency.com`.
3. Repeat for each of the three forms, or add one notification covering all.

Send one test submission per form afterwards and confirm arrival, including the spam
folder. Delete the test entries from the Forms tab when finished.

## 5. Configure the domain

1. **Domain management → Add a domain.**
2. Add `www.thepodcastlaneagency.com` and set it as the primary domain.
3. Follow Netlify's DNS instructions at your registrar (either delegate nameservers to
   Netlify, or add the CNAME/A records it specifies).
4. Set a redirect from the apex domain to `www`, or the reverse, so only one is canonical.

The site's canonical URLs, sitemap, and Open Graph tags all use
`https://www.thepodcastlaneagency.com`. If the final domain differs, change `SITE_URL` in
`src/config.js` plus `public/robots.txt` and `public/sitemap.xml`, then rebuild.

## 6. Confirm HTTPS

Under **Domain management → HTTPS**, Netlify provisions a Let's Encrypt certificate
automatically once DNS resolves. This can take a few minutes to an hour.

Confirm: the padlock appears, `http://` redirects to `https://`, and **Force HTTPS** is
enabled.

## 7. Test the legacy redirects

Visit each old URL directly and confirm where it lands:

| Old URL | Should land on |
|---|---|
| `/guest-requests` | `/become-a-guest` |
| `/sponsor-opportunities` | `/become-a-guest#sponsorship` |
| `/contact` | `/work-with-us` |
| `/featured-clients` | `/featured-podcasts` |

All four are 301s in `_redirects`, so the address bar should change. React Router also
handles these client-side as a fallback.

## 8. Roll back

Netlify keeps every deploy. If something is wrong:

1. **Deploys**, find the last known good deploy in the list.
2. Open it and choose **Publish deploy**.

The previous version goes live immediately. Rolling back does not delete the bad deploy, so
you can compare them afterwards.
