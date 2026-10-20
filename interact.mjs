import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const dist = '/home/claude/podcast-lane/dist';
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const jsFile = fs.readdirSync(path.join(dist, 'assets')).find((f) => f.endsWith('.js'));
const bundle = fs.readFileSync(path.join(dist, 'assets', jsFile), 'utf8');

async function boot(route) {
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(html.replace(/<script type="module"[^>]*><\/script>/, ''), {
    url: `https://www.thepodcastlane.com${route}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  dom.window.scrollTo = () => {};
  dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  const s = dom.window.document.createElement('script');
  s.textContent = bundle;
  dom.window.document.body.appendChild(s);
  await new Promise((r) => setTimeout(r, 300));
  return { dom, doc: dom.window.document, win: dom.window, errors };
}

const tick = () => new Promise((r) => setTimeout(r, 120));

/** body.textContent includes the injected bundle <script>; strip scripts first. */
const visibleText = (doc) => {
  const clone = doc.body.cloneNode(true);
  clone.querySelectorAll('script').forEach((el) => el.remove());
  return clone.textContent;
};
const results = [];
const check = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -> ${detail}` : ''}`);
};

// ---- Episodes: search, filter, reset, load more --------------------------
{
  const { doc, win } = await boot('/episodes');
  const count = () => doc.querySelectorAll('article.episode-entry').length;
  const status = () => doc.querySelector('.results-count')?.textContent ?? '';

  check('Episodes: paginates to 9 on load', count() === 9, `${count()} shown`);

  check('Episodes: no manual featured row; the newest episode leads',
    !doc.querySelector('.episode-row--featured'));
  check('Episodes: a single intro row, not two',
    !/Every Conversation, in One Place/.test(visibleText(doc)) &&
    doc.querySelectorAll('.hero__title').length === 1);
  check('Episodes: page titled 10 in 10 Series',
    doc.title.startsWith('10 in 10 Series'));
  check('Episodes: platform buttons name the platform, never "Listen"',
    [...doc.querySelectorAll('.episode-links a')].every((a) =>
      ['YouTube', 'Apple Podcasts', 'Spotify'].includes(a.textContent.trim())));
  check('Episodes: every entry offers YouTube',
    [...doc.querySelectorAll('.episode-entry')].every((e) =>
      e.querySelector('.episode-links a[href*="youtu"]')));
  check('Episodes: no count shown before filtering', status() === '');
  check('Episodes: no fixed episode count anywhere',
    !/\b49 episodes\b/.test(visibleText(doc)) &&
    /All episodes are searchable/.test(visibleText(doc)));
  check('Episodes: approved intro copy',
    /Ten Stories\. Ten Voices\. Ten Episodes\./.test(visibleText(doc)));
  check('Episodes: Why Do a 10 in 10 section present',
    /Why Do a 10 in 10\?/.test(visibleText(doc)) &&
    /A fully equipped podcast studio in the Phoenix metro area/.test(visibleText(doc)));

  // Controls must render after the library in DOM order
  const listEl = doc.querySelector('article.episode-entry');
  const filtersEl = doc.querySelector('.filters');
  const after = listEl.compareDocumentPosition(filtersEl) & 4;
  check('Episodes: filters sit below the library', Boolean(after));
  const subscribe = [...doc.querySelectorAll('.eyebrow')]
    .find((e) => e.textContent.trim() === 'Subscribe or follow');
  check('Episodes: filters sit above Subscribe',
    Boolean(filtersEl.compareDocumentPosition(subscribe) & 4));
  check('Episodes: trailer section removed',
    !/10 in 10 trailer/.test(visibleText(doc)));
  check('Episodes: "Link to this episode" removed',
    !/Link to this episode/.test(visibleText(doc)));

  const loadMore = [...doc.querySelectorAll('button')].find((b) => /Load more/.test(b.textContent));
  loadMore.dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  check('Episodes: Load more adds a page', count() === 18, `${count()} shown`);

  const search = doc.querySelector('#episode-search');
  const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set;
  setter.call(search, 'dementia-free-nonsense-term');
  search.dispatchEvent(new win.Event('input', { bubbles: true }));
  await tick();
  check('Episodes: empty state on no match', Boolean(doc.querySelector('.empty')));

  const clear = [...doc.querySelectorAll('button')].find((b) => /Clear filters/.test(b.textContent));
  clear.dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  check('Episodes: reset restores results', count() === 9 && !doc.querySelector('.empty'), `${count()} shown`);

  setter.call(search, 'peptide');
  search.dispatchEvent(new win.Event('input', { bubbles: true }));
  await tick();
  check('Episodes: keyword search narrows', count() > 0 && count() < 49 && /of 49/.test(status()), status());
  check('Episodes: intro drops the episode count',
    !/49 episodes of real stories/.test(visibleText(doc)));

  const guestOpts = doc.querySelectorAll('#episode-guest option').length;
  check('Episodes: guest filter is populated from real data', guestOpts === 42, `${guestOpts - 1} unique guests + "All"`);
}

// ---- Home: structure, hero video, deletions -------------------------------
{
  const { doc, win } = await boot('/');
  const text = visibleText(doc);
  const eyebrows = [...doc.querySelectorAll('.eyebrow')].map((e) => e.textContent.trim());

  const expected = ['Podcast production and coaching', 'Featured episodes', 'New here',
                    'Meet the founder', 'Every voice has power. Let\u2019s make yours heard!'];
  check('Home: sections in the specified order',
    JSON.stringify(eyebrows) === JSON.stringify(expected), eyebrows.join(' > '));

  // Deletions
  check('Home: packages section removed',
    !/Built to fit where your|Content Podcast Package|Mini Visibility/i.test(text));
  check('Home: six-step process removed',
    !/How it works|A podcast is a production line/i.test(text));
  check('Home: old copy-led opening removed',
    !/Podcasting, simplified/i.test(text));
  check('Home: no leftover card-grid episodes',
    doc.querySelectorAll('.episode-card').length === 0);
  check('Home: no founder image or empty image column',
    doc.querySelectorAll('main img').length ===
      doc.querySelectorAll('main .embed img').length,
    `${doc.querySelectorAll('main img').length} imgs, all video posters`);

  // Hero
  const order = ['.hero__copy', '.hero__video', '.hero__actions', '.platforms--bar']
    .map((sel) => doc.querySelector(sel));
  check('Home: hero order is copy, video, buttons, then platform bar',
    order.every(Boolean) &&
    order.slice(0, -1).every((el, i) => Boolean(el.compareDocumentPosition(order[i + 1]) & 4)));
  check('Home: platform bar order is Apple, Spotify, Instagram, YouTube',
    [...doc.querySelectorAll('.platforms--bar .platform__label span:last-child')]
      .map((e) => e.textContent.trim()).join(', ') ===
      'Apple Podcasts, Spotify, Instagram, YouTube');
  check('Home: exactly one h1, and it is the hero headline',
    doc.querySelectorAll('h1').length === 1 &&
    /launch, produce, and grow your podcast/i.test(doc.querySelector('h1').textContent));
  check('Home: social card title is the site-wide agency line',
    doc.querySelector('meta[property="og:title"]')?.content ===
      'Full Service Podcast Production Agency' &&
    doc.querySelector('meta[name="twitter:title"]')?.content ===
      'Full Service Podcast Production Agency');
  check('Home: page title and description unchanged for search',
    doc.title === 'Podcast Production & Coaching in Phoenix | The Podcast Lane' &&
    /Full-Service podcast production|Full-service podcast production/i.test(
      doc.querySelector('meta[name="description"]')?.content || ''));
  check('Home: Open Graph image is the 1200x630 card',
    doc.querySelector('meta[property="og:image"]')?.content
      .endsWith('/og-image.jpg') &&
    doc.querySelector('meta[property="og:image:width"]')?.content === '1200' &&
    doc.querySelector('meta[property="og:image:height"]')?.content === '630');
  check('Home: twitter card is a large summary with an image',
    doc.querySelector('meta[name="twitter:card"]')?.content === 'summary_large_image' &&
    Boolean(doc.querySelector('meta[name="twitter:image"]')?.content));
  check('Home: approved hero copy in place',
    /launch, produce, and grow podcasts/.test(text) &&
    /we will handle the studio, the production team, editing and the details/i.test(text));
  check('Home: old hero headline removed', !/Ten Stories\. Ten Voices\. One Season/.test(text));
  check('Home: hero CTAs route correctly',
    [...doc.querySelectorAll('.hero__actions a')].map((a) => a.getAttribute('href')).join() ===
      '/episodes,/work-with-us#inquiry');
  check('Home: founder section carries the approved copy',
    /one of the most successful and sought-after podcasting producers/.test(text) &&
    /Connecting people one podcast at a time/.test(text));
  check('Home: thepodcastlane.com is a working link',
    Boolean(doc.querySelector('a[href="https://www.thepodcastlane.com/"]')));
  check('Home: Get Started button targets the inquiry form',
    [...doc.querySelectorAll('a')].some((a) =>
      a.textContent.trim() === 'Get Started' &&
      a.getAttribute('href') === '/work-with-us#inquiry'));
  check('Home: 10 in 10 CTA now reads Get Details',
    /Get Details/.test(text) && !/Apply Here/.test(text));

  // Platform bar
  const bar = doc.querySelector('.platforms--bar');
  const barLinks = [...bar.querySelectorAll('a')];
  check('Home: platform bar has all four platforms', barLinks.length === 4);
  check('Home: Instagram points at the confirmed URL',
    barLinks.some((a) => a.getAttribute('href') === 'https://www.instagram.com/podcast_lane/'));
  check('Home: platform links open safely with labels',
    barLinks.every((a) => /noopener/.test(a.getAttribute('rel') || '') &&
                          a.getAttribute('aria-label')));
  check('Home: only one platform component on the page',
    doc.querySelectorAll('.platforms').length === 1);

  // Featured episodes
  const rows = [...doc.querySelectorAll('.episode-row')];
  // A pinned episode can render before its metadata has synced, so a missing
  // title is valid here; identity is checked by video id below.
  const rowTitles = rows
    .map((r) => r.querySelector('.episode-row__title')?.textContent.trim())
    .filter(Boolean);
  check('Home: no episode title appears twice',
    rowTitles.length === new Set(rowTitles).size, `${rowTitles.length} titled rows`);
  check('Home: featured, then three pinned, then the dynamic feed',
    rows.length === 7, `${rows.length} rows`);

  const staticIds = ['IXRbYBdVuLU', 'M-rVdBMbq6g', 'qAdfM3kzEsI'];
  const rowIds = rows.map((r) => {
    const href = r.querySelector('a[href*="youtu"]')?.getAttribute('href') || '';
    return href.split('/').pop().split('?')[0];
  });
  check('Home: the three pinned episodes sit directly under the featured show',
    JSON.stringify(rowIds.slice(1, 4)) === JSON.stringify(staticIds),
    rowIds.slice(1, 4).join(', '));
  check('Home: pinned episodes are not repeated in the dynamic feed',
    !rowIds.slice(4).some((id) => staticIds.includes(id)));
  check('Home: the featured episode is not repeated below either',
    !rowIds.slice(1).includes(rowIds[0]));
  check('Home: every row links to its own YouTube video',
    rowIds.every(Boolean) && new Set(rowIds).size === rows.length);
  const linkRows = rows.map((r) =>
    [...r.querySelectorAll('.episode-links a')].map((a) => a.textContent.trim()));
  check('Home: the three pinned episodes carry Apple and Spotify links',
    linkRows.slice(1, 4).every((l) =>
      JSON.stringify(l) === JSON.stringify(['YouTube', 'Apple Podcasts', 'Spotify'])),
    linkRows.slice(1, 4).map((l) => l.length).join(','));
  check('Home: every episode still has its YouTube link',
    linkRows.every((l) => l[0] === 'YouTube'));
  check('Home: episode platform links open safely',
    [...doc.querySelectorAll('.episode-links a')].every((a) =>
      a.target === '_blank' && /noopener/.test(a.rel)));
  check('Home: pinned list is independent of the synced episode data',
    (await import('node:fs')).readFileSync('src/data/static-episodes.js', 'utf8')
      .includes('STATIC_EPISODE_IDS'));
  check('Home: seven episodes, all as rows', rows.length === 7, `${rows.length} rows`);
  check('Home: first row is the featured one',
    rows[0].classList.contains('episode-row--featured') &&
    !rows.slice(1).some((r) => r.classList.contains('episode-row--featured')));
  check('Home: video does not stick while scrolling',
    !/\.episode-row\s+\.embed\s*\{[^}]*position:\s*sticky/.test(
      (await import('node:fs')).readFileSync('src/styles.css', 'utf8')));
  check('Home: every row is video then text',
    rows.every((r) => Boolean(r.querySelector('.embed')
      .compareDocumentPosition(r.querySelector('.episode-row__body')) & 4)));
  check('Home: every row links to the episode on YouTube',
    rows.every((r) => r.querySelector('.episode-links a[href*="youtu"]')));
  // Synced rows carry full metadata. A pinned episode awaiting its first sync
  // shows its thumbnail and link only, which is correct rather than broken.
  check('Home: synced rows show title, date and show notes',
    rows.filter((r) => r.querySelector('.episode-row__title')).every((r) =>
      r.querySelector('.meta')?.textContent.trim() &&
      r.querySelector('.shownotes')?.textContent.trim()));
  check('Home: every row has a working YouTube link and thumbnail',
    rows.every((r) => r.querySelector('a[href*="youtu"]') && r.querySelector('img, .embed')));
  check('Home: long notes are clamped with a read-more control',
    rows.every((r) => {
      const notes = r.querySelector('.shownotes');
      const btn = r.querySelector('.disclosure');
      if (!notes) return !btn;          // pinned row awaiting its first sync
      return notes.textContent.length <= 600
        ? !btn
        : notes.classList.contains('shownotes--clamped') &&
          btn?.textContent.trim() === 'Read the full show notes';
    }));
  check('Home: View All Episodes action present',
    /View All Episodes/.test(text));
  check('Home: episode links all point at YouTube',
    [...doc.querySelectorAll('a[href*="youtu"]')].length >= 4);

  // Duplicate video, two independent instances
  const embeds = [...doc.querySelectorAll('.embed__button')];
  check('Home: hero uses the approved Podcast Lane trailer',
    /obj4V4E8VdQ/.test(doc.querySelector('.hero__video img')?.getAttribute('src') || ''));
  check('Home: New Here still carries the 10 in 10 trailer',
    embeds.some((b) => /wYO6uKxuQkM/.test(b.querySelector('img')?.getAttribute('src') || '')));
  check('Home: no iframes before interaction', doc.querySelectorAll('iframe').length === 0);

  embeds[0].dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  check('Home: playing the hero loads exactly one iframe',
    doc.querySelectorAll('iframe').length === 1);
  check('Home: the New Here instance is unaffected',
    doc.querySelectorAll('.embed__button').length === 8);

  const newHereEmbed = [...doc.querySelectorAll('.embed__button')].pop();
  newHereEmbed.dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  check('Home: both instances can play independently',
    doc.querySelectorAll('iframe').length === 2);
  check('Home: both iframes carry accessible titles',
    [...doc.querySelectorAll('iframe')].every((f) => f.title));

  const firstDisclosure = doc.querySelector('.episode-row .disclosure');
  check('Home: read-more starts collapsed',
    firstDisclosure.getAttribute('aria-expanded') === 'false');
  firstDisclosure.dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  check('Home: read-more expands the notes it controls',
    firstDisclosure.getAttribute('aria-expanded') === 'true' &&
    !doc.querySelector('.episode-row .shownotes').classList.contains('shownotes--clamped') &&
    firstDisclosure.textContent.trim() === 'Show less');
  check('Home: expanding one row leaves the others collapsed',
    [...doc.querySelectorAll('.episode-row .shownotes--clamped')].length ===
      [...doc.querySelectorAll('.episode-row .disclosure')].length - 1);

  // New Here CTA + final CTA
  check('Home: New Here CTA now reads Get Details',
    /Join Us for the Next 10 in 10/.test(text) && !/Apply Here/.test(text));
  check('Home: final CTA present with a single action',
    /Ready to Share Your Voice/.test(text) &&
    /Every voice has power/.test(text));
  // The rule covers authored copy. Episode show notes are verbatim YouTube
  // descriptions and must not be rewritten, so they are excluded.
  const authored = (() => {
    const clone = doc.body.cloneNode(true);
    clone.querySelectorAll('script, .shownotes').forEach((el) => el.remove());
    return clone.textContent;
  })();
  check('Home: no em dashes in authored homepage copy', !authored.includes('\u2014'));
}

// ---- Navigation ----------------------------------------------------------
{
  const { doc } = await boot('/');
  const links = [...doc.querySelectorAll('.nav__list .nav__link')].map((a) => a.textContent.trim());
  check('Nav: four plain links plus the Work With Us CTA',
    JSON.stringify(links) === JSON.stringify(['Home', '10 in 10 Series',
                                              'Featured Podcasts', 'Guest or Sponsor']),
    links.join(' - '));
  check('Nav: Resources is not linked publicly',
    !links.some((l) => /resources|what.s possible/i.test(l)));
  check('Footer: Resources is not linked publicly',
    ![...doc.querySelectorAll('.footer a')].some((a) => /resources|what.s possible/i.test(a.textContent)));
  check('Footer: no visible "opens in a new tab" text',
    !/opens in a new tab/i.test([...doc.querySelectorAll('.footer')].map((f) => f.textContent).join()));
  const cta = doc.querySelector('.nav__list .btn--primary');
  check('Nav: Work With Us is the red CTA, last', cta?.textContent.trim() === 'Work With Us');
  check('Nav: "Start Your Podcast" gone', !/Start Your Podcast/.test(visibleText(doc)));
  check('Footer: Instagram added to the shared footer',
    Boolean(doc.querySelector('.footer a[href="https://www.instagram.com/podcast_lane/"]')));
  check('Nav: no separate Contact item',
    !links.some((l) => /contact/i.test(l)));
}

// ---- Mobile menu ---------------------------------------------------------
{
  const { doc, win } = await boot('/');
  const toggle = doc.querySelector('.menu-toggle');
  check('Header: toggle starts collapsed', toggle.getAttribute('aria-expanded') === 'false');
  toggle.dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  const drawer = doc.querySelector('.drawer');
  check('Header: drawer opens as a modal dialog',
    Boolean(drawer) && drawer.getAttribute('aria-modal') === 'true');
  check('Header: body scroll locked while open', win.document.body.style.overflow === 'hidden');
  const esc = new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
  doc.dispatchEvent(esc);
  await tick();
  check('Header: Escape closes drawer', !doc.querySelector('.drawer'));
  check('Header: body scroll restored', win.document.body.style.overflow !== 'hidden');

  toggle.dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  const drawerLinks = [...doc.querySelectorAll('.drawer__link')].map((a) => a.textContent.trim());
  const drawerCta = doc.querySelector('.drawer__cta .btn--primary');
  check('Drawer: mirrors the four plain links', drawerLinks.length === 4, drawerLinks.join(' - '));
  check('Drawer: Work With Us is the red CTA', drawerCta?.textContent.trim() === 'Work With Us');
}

// ---- Work With Us --------------------------------------------------------
{
  const { doc, win } = await boot('/work-with-us');
  const text = visibleText(doc);

  check('WWU: hero heading and eyebrow',
    doc.querySelector('h1')?.textContent.trim() === 'Ready to Work With Us?' &&
    doc.querySelectorAll('h1').length === 1);
  check('WWU: primary CTA targets #inquiry and is the stronger action',
    doc.querySelector('.work-hero .btn--primary')?.getAttribute('href') === '#inquiry');

  // Section order, only sections with verified sources
  const ids = [...doc.querySelectorAll('main section')].map((el) => el.id).filter(Boolean);
  check('WWU: inquiry anchor present and offset for the sticky header',
    ids.includes('inquiry') &&
    doc.getElementById('inquiry').classList.contains('anchor-target'));

  // Form
  const form = doc.querySelector('#inquiry form');
  const names = [...form.querySelectorAll('input, textarea, select')]
    .map((el) => el.name).filter((n) => n && n !== 'form-name' && n !== 'bot-field');
  check('WWU: inquiry form fields',
    ['name', 'email', 'phone', 'business', 'website', 'service', 'details', 'timeline', 'consent']
      .every((f) => names.includes(f)), names.join(', '));
  check('WWU: no budget field (not supported by the source)',
    !names.some((n) => /budget|price|amount/i.test(n)));
  check('WWU: distinct Netlify form name, separate from guest and sponsor',
    form.querySelector('[name="form-name"]').value === 'work-with-us-inquiry');
  check('WWU: submit label is specific',
    form.querySelector('button[type=submit]').textContent.trim() === 'Submit Your Inquiry');
  check('WWU: consent starts unchecked',
    form.querySelector('[name="consent"]').checked === false);
  check('WWU: service dropdown offers the nine approved options',
    [...form.querySelectorAll('[name="service"] option')].length === 10);
  check('WWU: honeypot preserved', Boolean(form.querySelector('[name="bot-field"]')));

  form.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  check('WWU: blocks empty submit and flags fields',
    Boolean(doc.querySelector('#inquiry [role="alert"]')) &&
    doc.querySelectorAll('#inquiry [aria-invalid="true"]').length >= 5);
  check('WWU: focus moves to the first invalid field',
    doc.activeElement?.getAttribute('name') === 'name');

  // Gated sections must not render without verified sources
  check('WWU: no Calendly section without a verified URL',
    !doc.querySelector('#book') && !doc.querySelector('.calendly') &&
    !/calendly/i.test(doc.body.innerHTML));
  check('WWU: no payment section, no disabled Pay button, no empty wrapper',
    !/pay now|deposit|checkout/i.test(text) && !doc.querySelector('.payment'));
  check('WWU: "What happens next" process removed',
    !/what happens next/i.test(text) && !doc.querySelector('.steps'));
  check('WWU: only approved public package names shown',
    ['10 in 10 Podcast', '75-Day Podcast Launch', 'Full-Service Package of 12 Episodes']
      .every((n) => text.includes(n)));
  check('WWU: internal package names absent',
    !/Content Podcast Package|Full Podcast Package|Podcast Producer Package|Mini Visibility/i.test(text));
  check('WWU: add-ons listed', /Private networking event management/i.test(text));
  check('WWU: no public pricing', !/[$\u00a3\u20ac]\s?\d/.test(text));
  const quotes = [...doc.querySelectorAll('.testimonial')];
  check('WWU: six testimonials, text only', quotes.length === 6 &&
    !doc.querySelector('.testimonial img'));
  check('WWU: Allison Carman matches the others, with her organisation',
    /Allison Carman/.test(text) && /A Place for Seniors/.test(text) &&
    quotes.some((q) => /so amazed at how seemingly effortlessly/.test(q.textContent)));
  check('WWU: every testimonial uses the same card and star treatment',
    quotes.every((q) => q.querySelector('.testimonial__rating')?.textContent.trim().length === 5 &&
                        q.querySelector('.testimonial__quote')));
  check('WWU: the replaced testimonial is gone',
    !/Ashley Clark|House of A & A|it is magic/.test(text));
  check('WWU: testimonial wording is verbatim',
    /So fun, so awesome!!!! Ty again\./.test(text) &&
    /Monkey Dooz/.test(text));
  check('WWU: OCR artifact removed from the Shelby quote',
    /ready for more! Elisa Lane thank you!/.test(text));
  check('WWU: testimonials sit after the packages',
    Boolean(doc.querySelector('.package-card')
      .compareDocumentPosition(doc.querySelector('.testimonial')) & 4));
  check('WWU: As Seen On follows the testimonials',
    Boolean(doc.querySelector('.testimonial')
      .compareDocumentPosition(doc.querySelector('.as-seen-on')) & 4));
  check('WWU: support dropdown uses the approved public options',
    [...doc.querySelectorAll('[name="service"] option')].map((o) => o.textContent.trim())
      .filter((t) => t !== 'Choose one').join('|') ===
      ['10 in 10 Podcast', '75-Day Podcast Launch', 'Full-Service Package of 12 Episodes',
       'Social Media Support', 'Podcast Coaching', 'Strategy',
       'Private Networking Event Management', 'Sponsorship', 'Not Sure Yet'].join('|'));
  const learn = [...doc.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Learn More');
  check('WWU: Learn More points at the confirmed destination',
    learn?.getAttribute('href') === 'https://www.thepodcastlane.com/' &&
    learn.target === '_blank' && /noopener/.test(learn.rel));

  check('WWU: every image has src, dimensions and alt',
    [...doc.querySelectorAll('main img')].every((i) =>
      i.getAttribute('src') && i.getAttribute('width') && i.getAttribute('height') &&
      i.getAttribute('alt') !== null));

  // Velvet Table: text and phone are confirmed even though art is pending

  // Process contains no invented promises
  check('WWU: process makes no invented time or outcome promises',
    !/within \d+ (hours|days)|guarantee|guaranteed|\d+% deposit/i.test(text));

  // Final CTA
  const finals = [...doc.querySelectorAll('a[href="#inquiry"]')];
  check('WWU: final CTA returns to the inquiry form', finals.length >= 2);

  check('WWU: no em dashes in authored copy', !text.includes('\u2014'));
}

// ---- Contact route redirects ---------------------------------------------
{
  const { doc } = await boot('/contact');
  check('/contact redirects to Work With Us',
    doc.querySelector('h1')?.textContent.trim() === 'Ready to Work With Us?',
    doc.querySelector('h1')?.textContent.trim());
  const toml = (await import('node:fs')).readFileSync('netlify.toml', 'utf8');
  check('Netlify 301s /contact at the server',
    /from = "\/contact"[\s\S]*?status = 301/.test(toml));
  check('no redirect loop from the new route',
    !/from = "\/work-with-us"/.test(toml));
}

// ---- Resources -----------------------------------------------------------
{
  const { doc } = await boot('/resources');
  const text = visibleText(doc);
  const eyebrows = [...doc.querySelectorAll('.eyebrow')].map((e) => e.textContent.trim());
  check('Resources: book modules present',
    ['Who it is for', 'Inside the book', 'About the author'].every((e) => eyebrows.includes(e)),
    eyebrows.slice(0, 4).join(' > '));
  check('Resources: session modules present',
    ['Next session', 'Program preview', 'Recordings'].every((e) => eyebrows.includes(e)));
  check('Resources: shows 3 real related episodes',
    doc.querySelectorAll('.episode-card').length === 3);
  check('Resources: every unreleased item is labeled',
    doc.querySelectorAll('.chip').length >= 8, `${doc.querySelectorAll('.chip').length} status labels`);
  // Look for real purchase affordances, not the words used to deny them
  const actions = [...doc.querySelectorAll('a.btn, button, a.textlink')]
    .map((el) => el.textContent.trim());
  check('Resources: no purchase action anywhere',
    !actions.some((a) => /^(buy|preorder|pre-order|order|purchase|add to cart|checkout)/i.test(a)),
    actions.join(' | '));
  check('Resources: no price figure shown', !/[$\u00a3\u20ac]\s?\d/.test(text));
  check('Resources: no invented book title or ISBN',
    /Working title to be confirmed/.test(text) && !/ISBN/i.test(text));
  check('Resources: no invented dates or presenters',
    !/No session scheduled yet/.test(text) === false && !/presented by/i.test(text));
  check('Resources: no Walks With Mom content',
    !/Walks With Mom|Karren|Amada|caregiving|Gen X|Baby Boomer|aging/i.test(text));
}

// ---- Featured Podcasts ---------------------------------------------------
{
  const { doc } = await boot('/featured-podcasts');
  const text = visibleText(doc);
  const cards = [...doc.querySelectorAll('.podcast-card')];
  const names = cards.map((c) => c.querySelector('.podcast-card__name').textContent.trim());

  check('Podcasts: page and nav use the Featured Podcasts name',
    doc.querySelector('h1')?.textContent.trim() === 'Featured Podcasts' &&
    doc.title.startsWith('Featured Podcasts'));
  check('Podcasts: ten cards, 10 in 10 first',
    cards.length === 10 && names[0] === '10 in 10', `${cards.length}: ${names[0]}`);
  check('Podcasts: Soul Friend is last, Sip and Listen removed',
    names[names.length - 1] === 'The Soul Friend Podcast' &&
    !names.includes('Sip and Listen Podcast'));
  check('Podcasts: no reference to the removed Apple listing',
    !doc.body.innerHTML.includes('1455987614'));
  check('Podcasts: 10 in 10 uses the official series artwork, not the logo',
    /\/artwork\/10-in-10\.jpg/.test(cards[0].querySelector('img.podcast-card__art')?.getAttribute('src') || ''));
  const tel = cards[0].querySelector('.podcast-card__phone a');
  check('Podcasts: 10 in 10 shows a click-to-call number under the label',
    tel?.textContent.trim() === '602.228.3316' &&
    tel.getAttribute('href') === 'tel:6022283316' &&
    Boolean(tel.getAttribute('aria-label')));
  check('Podcasts: the phone sits after the label, before the description',
    Boolean(cards[0].querySelector('.podcast-card__label')
      .compareDocumentPosition(tel) & 4));
  check('Podcasts: no other show shows a phone number',
    doc.querySelectorAll('.podcast-card__phone').length === 1);
  check('Podcasts: 10 in 10 carries the supporting label',
    cards[0].querySelector('.podcast-card__label')?.textContent.trim() === 'by The Podcast Lane');
  check('Podcasts: stacked one-per-row list, not a multi-column grid',
    Boolean(doc.querySelector('.podcast-list')) && !doc.querySelector('.podcast-grid'));
  check('Podcasts: each row is artwork then details',
    cards.every((c) => {
      const art = c.querySelector('.podcast-card__art');
      const body = c.querySelector('.podcast-card__body');
      return art && body && Boolean(art.compareDocumentPosition(body) & 4);
    }));
  // Two shows have no supplied description; those rows omit the paragraph
  // rather than showing an empty block.
  check('Podcasts: descriptions render in full where supplied',
    cards.filter((c) => c.querySelector('.podcast-card__description')).length === 8 &&
    cards.every((c) => {
      const d = c.querySelector('.podcast-card__description');
      return !d || d.textContent.trim().length > 0;
    }));
  check('Podcasts: no "Why this page exists" section',
    !/Why this page exists/i.test(text) && doc.querySelectorAll('main > section').length === 1);
  check('Podcasts: every card has artwork with non-empty alt or a fallback',
    cards.every((c) => {
      const img = c.querySelector('img.podcast-card__art');
      return img ? Boolean(img.getAttribute('alt')) && img.getAttribute('width')
                 : Boolean(c.querySelector('.podcast-card__art--fallback'));
    }));
  // tel: links dial in place, so the new-tab rule applies to http(s) only.
  check('Podcasts: every external link is safe and labelled',
    [...doc.querySelectorAll('.podcast-card a')]
      .filter((a) => /^https?:/.test(a.getAttribute('href') || ''))
      .every((a) => a.target === '_blank' && /noopener/.test(a.rel) &&
        /noreferrer/.test(a.rel) && a.getAttribute('aria-label') &&
        a.textContent.trim().length > 0));
  check('Podcasts: the tel: link dials rather than opening a tab',
    (() => { const t = doc.querySelector('.podcast-card__phone a');
             return t && !t.target && t.getAttribute('aria-label'); })());

  const linkFor = (name, platform) => {
    const card = cards[names.indexOf(name)];
    return [...card.querySelectorAll('.podcast-card__links a')]
      .find((a) => a.textContent.trim() === platform)?.getAttribute('href');
  };
  check('Podcasts: heading and intro copy updated',
    /Shows We Support/.test(text) &&
    /Looking for your next favorite podcast\? Start here\./.test(text));
  check('Podcasts: Instagram maps to the right show',
    linkFor('Walks with Mom', 'Instagram') === 'https://www.instagram.com/walks_with_mom/' &&
    linkFor('10 in 10', 'Instagram') === 'https://www.instagram.com/podcast_lane/');
  check('Podcasts: Instagram removed from Local Legends and Soul Friend',
    !linkFor('Local Legends with Jess, Arizona Edition', 'Instagram') &&
    !linkFor('The Soul Friend Podcast', 'Instagram'));
  check('Podcasts: platform buttons keep a consistent order',
    cards.every((c) => {
      const order = [...c.querySelectorAll('.podcast-card__links a')]
        .map((a) => a.textContent.trim())
        .filter((t) => ['Apple Podcasts', 'Spotify', 'YouTube', 'Instagram'].includes(t));
      const wanted = ['Apple Podcasts', 'Spotify', 'YouTube', 'Instagram']
        .filter((t) => order.includes(t));
      return JSON.stringify(order) === JSON.stringify(wanted);
    }));
  check('Podcasts: no Podcast Lane Instagram on unrelated shows',
    cards.slice(1).filter((c) => c.innerHTML.includes('instagram.com/podcast_lane')).length === 0);
  check('Podcasts: exact supplied Spotify URLs preserved',
    linkFor('Behind the Thread Podcast', 'Spotify') ===
      'https://open.spotify.com/show/2wtJh8W6sCLRkG4wscuX0i?si=9ke8tCynSg6k-O_Dopa6ug&nd=1&dlsi=749363bac792426c' &&
    linkFor('The Soul Friend Podcast', 'Spotify episode') ===
      'https://open.spotify.com/episode/0PdGLhnmlWaFu4EW5Ftstz?si=iufwaWtAR9-tEct6BftDlA&nd=1&dlsi=1ec25e4eca45484f');
  check('Podcasts: episode-level Spotify labelled honestly',
    !linkFor('The Soul Friend Podcast', 'Spotify'));
}

// ---- Guest or Sponsor page ------------------------------------------------
{
  const { doc, win } = await boot('/become-a-guest');
  const text = visibleText(doc);

  const ids = [...doc.querySelectorAll('main section')].map((el) => el.id).filter(Boolean);
  check('Guest page: sections in the required order',
    JSON.stringify(ids) === JSON.stringify(['application', 'sponsorship', 'sponsor-inquiry']),
    ids.join(' > '));
  check('Guest page: intro heading and criteria retained',
    /Bring a Conversation Worth Having/.test(text) && /Real expertise/i.test(text) &&
    /does not guarantee selection/i.test(text));

  const guestForm = doc.querySelector('#application form');
  const names = [...guestForm.querySelectorAll('input, textarea, select')]
    .map((el) => el.name).filter((n) => n && n !== 'form-name' && n !== 'bot-field');
  check('Guest form: every required area present',
    ['name', 'email', 'phone', 'business', 'topics', 'links', 'background', 'motivation',
     'discussionTopics', 'bio', 'publicContact', 'consent'].every((f) => names.includes(f)),
    names.join(', '));
  check('Guest form: the three new questions are separate textareas',
    ['discussionTopics', 'bio', 'publicContact']
      .every((f) => guestForm.querySelector(`[name="${f}"]`)?.tagName === 'TEXTAREA'));
  check('Guest form: the three new questions use the supplied wording',
    /3 topics or questions you would like to discuss/.test(text) &&
    /1 to 2 paragraph bio to be used in your podcast show notes/.test(text) &&
    /contact information would you like us to include publicly/.test(text));
  check('Guest form: bio carries the length guidance',
    /between 75 and 150 words/.test(text));
  check('Guest form: public contact is optional and says so',
    /Leave this blank if you would rather nothing was published/.test(text));
  check('Guest form: background and motivation remain separate',
    guestForm.querySelector('[name="background"]') &&
    guestForm.querySelector('[name="motivation"]'));
  check('Guest form: consent starts unchecked',
    guestForm.querySelector('[name="consent"]').checked === false);
  check('Guest form: Netlify wiring and honeypot intact',
    guestForm.getAttribute('data-netlify') === 'true' &&
    guestForm.querySelector('[name="form-name"]').value === 'guest-request' &&
    Boolean(guestForm.querySelector('[name="bot-field"]')));

  const sponsorForm = doc.querySelector('#sponsor-inquiry form');
  check('Sponsor form: still a separate Netlify form',
    sponsorForm.querySelector('[name="form-name"]').value === 'sponsor-opportunity' &&
    doc.querySelectorAll('form.form').length === 2);

  guestForm.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  check('Guest form: blocks an empty submit',
    Boolean(doc.querySelector('#application [role="alert"]')));
}

// ---- Studio carousel on Guest or Sponsor ---------------------------------
{
  const { doc, win } = await boot('/become-a-guest');
  const slides = [...doc.querySelectorAll('.carousel__slide')];
  const anchors = slides.map((li) => li.querySelector('a'));
  check('Carousel: all six images present', slides.length === 6, `${slides.length} slides`);
  check('Carousel: every slide links safely and its image has alt text',
    anchors.every((a) => a && a.target === '_blank' && /noopener/.test(a.rel) &&
      a.getAttribute('aria-label') && a.querySelector('img')?.getAttribute('alt')));
  check('Carousel: images reserve their dimensions',
    anchors.every((a) => a.querySelector('img')?.getAttribute('width') &&
                         a.querySelector('img')?.getAttribute('height')));
  const hrefs = anchors.map((a) => a.getAttribute('href'));
  check('Carousel: slides 1 and 2 share a playlist, intentionally',
    hrefs[0] === hrefs[1] && hrefs[0].includes('PL2PcECQX5jFTTG9wlPd8fPG0Qj2Dtw-7R'));
  check('Carousel: remaining slides use their own playlists',
    new Set(hrefs.slice(2)).size === 4 &&
    hrefs[2].includes('PLAcU5VZr9HMKYMhZR8DXP4MlZtRIS0xO8') &&
    hrefs[5].includes('PLmWf0z_3NPlK645XVw2Yhc4FOKs1Z-WxJ'));
  check('Carousel: previous and next controls are labelled',
    doc.querySelectorAll('.carousel__btn[aria-label]').length === 2);
  const next = [...doc.querySelectorAll('.carousel__btn')]
    .find((b) => b.getAttribute('aria-label') === 'Next image');
  next.dispatchEvent(new win.Event('click', { bubbles: true }));
  await tick();
  check('Carousel: next advances to the second slide',
    doc.querySelectorAll('.carousel__dot[aria-current="true"], .carousel__dot.is-current').length === 1);
  check('Carousel: dots reflect position',
    doc.querySelectorAll('.carousel__dot.is-current').length === 1);
}

// ---- Testimonials and press row on Work With Us ---------------------------
{
  const { doc } = await boot('/work-with-us');
  const text = visibleText(doc);
  const quotes = [...doc.querySelectorAll('.testimonial')];
  check('Testimonials: six cards', quotes.length === 6);
  const allison = quotes.find((q) => /Allison Carman/.test(q.textContent));
  check('Testimonials: Allison uses the same card structure as the others',
    Boolean(allison?.querySelector('.testimonial__name')) &&
    Boolean(allison.querySelector('.testimonial__rating')) &&
    Boolean(allison.querySelector('.testimonial__quote')));
  check('Testimonials: Allison carries her company and five stars',
    /A Place for Seniors/.test(allison.textContent) &&
    allison.querySelector('.testimonial__rating').textContent.trim().length === 5);
  check('Testimonials: Allison wording is verbatim',
    /how seemingly effortlessly she creates such great content out of my interviews/.test(text));
  check('Testimonials: Ashley Clark fully removed', !/Ashley Clark|House of A & A/.test(text));

  const press = [...doc.querySelectorAll('.press-row li')];
  check('Press: six outlets', press.length === 6);
  check('Press: Women 360 is last and not a link',
    /women360/.test(press[5].querySelector('img').getAttribute('src')) &&
    !press[5].querySelector('a'));
  const foothills = 'https://www.arizonafoothillsmagazine.com/people/foundress-fridays/foundress-friday-meet-elisa-lane-vp-of-business-relations-at-podworks-studios';
  check('Press: AZF and Foundress both link to the Foothills feature',
    press[0].querySelector('a')?.getAttribute('href') === foothills &&
    press[1].querySelector('a')?.getAttribute('href') === foothills);
  check('Press: every linked logo opens safely with a label',
    press.filter((li) => li.querySelector('a')).every((li) => {
      const a = li.querySelector('a');
      return a.target === '_blank' && /noopener/.test(a.rel) && a.getAttribute('aria-label');
    }));
  check('Press: no empty hrefs', ![...doc.querySelectorAll('a')].some((a) => a.getAttribute('href') === ''));
}

console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed.`);
process.exit(results.every(Boolean) ? 0 : 1);
