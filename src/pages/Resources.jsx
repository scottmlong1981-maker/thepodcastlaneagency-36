import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import EpisodeCard from '../components/EpisodeCard';
import { episodes } from '../data/episodes';

// Real episodes, selected because they sit closest to the themes the book and
// sessions will cover. Referenced by ID so titles and thumbnails stay accurate.
const RELATED_IDS = ['Fs4KAheCRK0', 'nURuopazFO8', '8R2bWWInvm8'];
const related = RELATED_IDS.map((id) => episodes.find((e) => e.id === id)).filter(Boolean);

const readerGroups = [
  'Entrepreneurs and business owners who know they should be saying more publicly.',
  'Professionals sitting on expertise they have never packaged for an audience.',
  'Creators who want their conversations to keep working after they publish.',
  'Anyone weighing whether a podcast is worth the time it takes.',
];

const insideTopics = [
  'How to communicate what you know without sounding rehearsed.',
  'Developing podcast content people actually finish.',
  'Strengthening the way you tell a story.',
  'What visibility takes beyond publishing consistently.',
  'Building a real connection with an audience rather than an audience number.',
  'Turning a run of conversations into something that keeps earning.',
];

const sessionTopics = [
  { title: 'Finding your voice before your first episode', body: 'What you are actually trying to say, who needs to hear it, and the format that fits both.' },
  { title: 'Recording without sounding like you are reading', body: 'Preparation, pacing, and the difference between a script and a plan.' },
  { title: 'Getting booked as a guest', body: 'One-sheets, outreach, and what makes a host say yes.' },
  { title: 'Show notes, clips, and everything after the record button', body: 'The production work that decides whether an episode travels.' },
  { title: 'Turning conversations into assets', body: 'Treating a back catalog as documented expertise rather than a content archive.' },
];

export default function Resources() {
  return (
    <main id="main">
      <Seo
        title="What’s Possible"
        description="What is possible with The Podcast Lane: books, live sessions, and learning resources in development."
        path="/resources"
        noindex
      />

      <PageHero
        eyebrow="In development"
        title="What’s Possible"
        lede="Where Podcast Lane books, live sessions, and guides will live. Nothing here is finished yet and nothing is for sale, so this page tells you honestly what is coming rather than pretending otherwise."
      />

      {/* ================= THE BOOK ================= */}

      <section className="section">
        <div className="shell">
          <span className="chip chip--red">Coming soon</span>
          <h2 className="display" style={{ maxWidth: '18ch', marginBottom: '1rem' }}>
            The Book
          </h2>
          <p className="meta" style={{ marginBottom: '1.25rem' }}>
            Working title to be confirmed
          </p>
          <p className="lede" style={{ maxWidth: '58ch' }}>
            A book about the thing most people get wrong before they ever buy a microphone:
            knowing what they actually have to say. It is in development, drawn from the same
            conversations that shape the show and the work we do with clients.
          </p>
          <p className="privacy">
            Title, author credit, format, publisher, price, and publication date are all still
            being decided. Nothing on this page should be read as a release announcement.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow">Who it is for</span>
            <hr className="rule-red" />
          </div>
          <div>
            <ul className="ticks">
              {readerGroups.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow">Inside the book</span>
            <hr className="rule-red" />
          </div>
          <div>
            <ul className="ticks">
              {insideTopics.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow eyebrow--red">About the author</span>
            <hr className="rule-red" />
          </div>
          <div>
            <h3 className="h3" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Elisa Lane</h3>
            <p>
              This developing book grows from the work behind The Podcast Lane. Elisa Lane is a
              seasoned podcast professional and marketing strategist with over 20 years of
              experience helping entrepreneurs and brands tell their stories, and since 2016 she
              has interviewed over 300 business leaders and changemakers.
            </p>
            <p style={{ marginBottom: 0 }}>
              A former karate school and boutique owner, she knows what it takes to build something
              from the ground up, and brings that to the question the book is built around: how do
              you say what you know in a way people remember?
            </p>
            <div className="btn-row">
              <Link className="btn" to="/work-with-us">Ask about the book</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="grid grid--2">
            <article className="card">
              <div className="card__body">
                <span className="chip">Excerpt</span>
                <h3 className="card__title">No sample chapter yet</h3>
                <p className="muted" style={{ fontSize: '0.95rem', marginBottom: 0 }}>
                  Sample material will be added here as the manuscript develops.
                </p>
              </div>
            </article>
            <article className="card">
              <div className="card__body">
                <span className="chip">Availability</span>
                <h3 className="card__title">Not available to buy or preorder</h3>
                <p className="muted" style={{ fontSize: '0.95rem', marginBottom: 0 }}>
                  There is no retailer link, price, or release date to share. When there is, it will
                  appear here first.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="shell">
            <span className="eyebrow">Start with these</span>
            <h2 className="h2" style={{ marginBottom: '0.75rem' }}>
              Episodes closest to the book
            </h2>
            <p className="lede" style={{ marginBottom: '2rem' }}>
              Real conversations from the show covering the same ground: authority, storytelling,
              and turning what you know into something people can hear.
            </p>
            <div className="grid grid--3">
              {related.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= LIVE SESSIONS ================= */}

      <section className="section">
        <div className="shell">
          <span className="eyebrow eyebrow--red">Live sessions for people with something to say</span>
          <h2 className="display" style={{ maxWidth: '20ch', marginBottom: '1rem' }}>
            Webinars
          </h2>
          <p className="lede" style={{ maxWidth: '58ch' }}>
            Practical sessions on planning a show, recording it well, getting booked as a guest,
            and making the work count once an episode is published. Bring a real problem and leave
            with a next step.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow">Next session</span>
            <hr className="rule-red" />
          </div>
          <div>
            <div className="notice">
              <span className="chip chip--red">Details coming soon</span>
              <h3 className="h3" style={{ marginBottom: '0.5rem' }}>No session scheduled yet</h3>
              <p>
                Dates, times, and registration are not open. Rather than list a session we cannot
                yet deliver, this stays empty until there is a real one to announce.
              </p>
              <Link className="btn btn--primary" to="/work-with-us">Tell us you are interested</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <span className="eyebrow">Program preview</span>
          <h2 className="h2" style={{ marginBottom: '0.75rem' }}>Topics we plan to cover</h2>
          <p className="lede" style={{ marginBottom: '2rem' }}>
            These are proposed subjects, not scheduled events. No presenter, date, or recording is
            attached to any of them yet.
          </p>
          <div className="grid grid--2">
            {sessionTopics.map((topic) => (
              <article className="card" key={topic.title}>
                <div className="card__body">
                  <span className="chip">Proposed topic</span>
                  <h3 className="card__title">{topic.title}</h3>
                  <p className="muted" style={{ fontSize: '0.95rem', marginBottom: 0 }}>{topic.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell lane">
          <div className="lane__aside">
            <span className="eyebrow">Recordings</span>
            <hr className="rule-red" />
          </div>
          <div>
            <div className="empty" style={{ textAlign: 'left' }}>
              <h3 className="h3" style={{ marginBottom: '0.75rem' }}>The archive is empty for now</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                Once sessions have been recorded, they will be collected here. There are no
                recordings, worksheets, or downloads to access yet, and nothing is behind a
                paywall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GUIDES ================= */}

      <section className="section">
        <div className="shell">
          <div className="notice" style={{ maxWidth: '46rem' }}>
            <span className="chip">Future resource</span>
            <h2 className="h3" style={{ marginBottom: '0.5rem' }}>Guides and learning resources</h2>
            <p>
              Worksheets and walkthroughs for planning episodes, preparing guests, and getting more
              out of each conversation. Nothing is downloadable yet.
            </p>
            <p>
              There is no mailing list set up, so rather than collect addresses with nowhere to send
              them, get in touch and we will let you know when the first resource is ready.
            </p>
            <Link className="btn btn--primary" to="/work-with-us">Contact The Podcast Lane</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
