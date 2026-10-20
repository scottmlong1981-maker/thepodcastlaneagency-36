import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const dist = '/home/claude/podcast-lane/dist';
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const jsFile = fs.readdirSync(path.join(dist, 'assets')).find((f) => f.endsWith('.js'));
const bundle = fs.readFileSync(path.join(dist, 'assets', jsFile), 'utf8');

const routes = ['/', '/episodes', '/resources', '/become-a-guest',
                '/featured-podcasts', '/work-with-us', '/definitely-not-a-page'];

let failures = 0;

for (const route of routes) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  vc.on('error', (m) => errors.push(String(m)));

  const dom = new JSDOM(html.replace(/<script type="module"[^>]*><\/script>/, ''), {
    url: `https://www.thepodcastlane.com${route}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
  });

  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  dom.window.scrollTo = () => {};        // not implemented in jsdom
  dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);

  try {
    const s = dom.window.document.createElement('script');
    s.textContent = bundle;
    dom.window.document.body.appendChild(s);
    await new Promise((r) => setTimeout(r, 250));
  } catch (e) {
    errors.push(e.message);
  }

  const doc = dom.window.document;
  const root = doc.getElementById('root');
  const h1 = doc.querySelector('h1');
  const main = doc.querySelector('main#main');
  const iframes = doc.querySelectorAll('iframe').length;
  const untitledIframes = [...doc.querySelectorAll('iframe')].filter((f) => !f.title).length;
  const imgsNoAlt = [...doc.querySelectorAll('img')].filter((i) => i.getAttribute('alt') === null).length;
  const h1count = doc.querySelectorAll('h1').length;

  const ok = root?.childElementCount > 0 && h1 && main && errors.length === 0
             && h1count === 1 && imgsNoAlt === 0 && untitledIframes === 0;
  if (!ok) failures++;

  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${route.padEnd(26)} title="${doc.title.slice(0, 44)}"`,
    `| h1=${h1count} | imgs-no-alt=${imgsNoAlt} | iframes=${iframes}`,
  );
  if (h1) console.log(`        h1: "${h1.textContent.trim().slice(0, 60)}"`);
  errors.slice(0, 3).forEach((e) => console.log('        ERROR:', e.slice(0, 200)));
  dom.window.close();
}

console.log(failures === 0 ? '\nAll routes rendered cleanly.' : `\n${failures} route(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
