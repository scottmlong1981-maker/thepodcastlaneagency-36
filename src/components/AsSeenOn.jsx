// Individual logo files rather than one composite with overlaid hotspots.
// The composite made link regions drift as the image resized, and the two
// Arizona Foothills marks could not be linked separately.
//
// Order matches the supplied artwork, left to right, with Women 360 last.
// Women 360 has no verified destination, so it renders unlinked rather than
// pointing somewhere invented.
const FOOTHILLS =
  'https://www.arizonafoothillsmagazine.com/people/foundress-fridays/foundress-friday-meet-elisa-lane-vp-of-business-relations-at-podworks-studios';

const SIZES = {"azcentral": [201, 46], "scottsdale": [144, 144], "citysuntimes": [229, 114], "azf": [167, 167], "women360": [128, 152], "foundress": [167, 167]};

const OUTLETS = [
  { name: 'Arizona Foothills Magazine', file: 'azf', href: FOOTHILLS,
    label: 'Read the Arizona Foothills Magazine feature' },
  { name: 'Foundress', file: 'foundress', href: FOOTHILLS,
    label: 'Read the Foundress Friday feature in Arizona Foothills Magazine' },
  { name: 'azcentral', file: 'azcentral',
    href: 'https://www.azcentral.com/things-to-do/events/?_evDiscoveryPath=/event%2F3272044-podcasting-workshop-for-women',
    label: 'azcentral events' },
  { name: 'Scottsdale Independent', file: 'scottsdale',
    href: 'https://www.yourvalley.net/scottsdale-independent/stories/scottsdale-entrepreneur-amplifies-voices-through-podcasting,597989?',
    label: 'Read the Scottsdale Independent article' },
  { name: 'City Sun Times', file: 'citysuntimes',
    href: 'https://www.citysuntimes.com/news/podcasting-consultant-small-business/article_d255688f-00de-4979-9dd8-7610a5b502d8.html',
    label: 'Read the City Sun Times article' },
  { name: 'The Women 360', file: 'women360', href: null, label: null },
];

export default function AsSeenOn() {
  return (
    <section className="section as-seen-on" aria-labelledby="as-seen-on">
      <div className="shell">
        <h2 className="eyebrow" id="as-seen-on" style={{ marginBottom: '1.75rem' }}>
          As Seen On
        </h2>
        <ul className="press-row">
          {OUTLETS.map((outlet) => {
            const logo = (
              <img
                src={`/press/${outlet.file}.png`}
                alt={outlet.name}
                width={SIZES[outlet.file][0]}
                height={SIZES[outlet.file][1]}
                loading="lazy"
              />
            );
            return (
              <li key={outlet.file}>
                {outlet.href ? (
                  <a
                    href={outlet.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={outlet.label}
                  >
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
