import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import NetlifyForm from '../components/NetlifyForm';
import Carousel from '../components/Carousel';
import { carouselSlides } from '../data/carousel';
import { FORM_NAMES } from '../config';

const qualifications = [
  {
    title: 'Real Expertise',
    body: 'You know a subject well enough to teach it, not just describe it.',
  },
  {
    title: 'A Story Worth Telling',
    body: 'Something you have lived through that changed how you work.',
  },
  {
    title: 'Practical Insight',
    body: 'Advice an audience can act on rather than admire.',
  },
  {
    title: 'A Useful Perspective',
    body: 'A view of your industry that others in it would find worth hearing.',
  },
  {
    title: 'Genuine Conversation',
    body: 'You are here to talk with someone, not to deliver a pitch.',
  },
  {
    title: 'Connection Through Experience',
    body: 'What you have done gives other people a way in.',
  },
];

const guestFields = [
  { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', label: 'Phone number', type: 'tel', required: true, autoComplete: 'tel' },
  {
    name: 'podcast',
    label: 'Which podcast are you applying to be a guest on?',
    required: false,
    hideRequirement: true,
  },
  {
    name: 'business',
    label: 'Business or organization',
    required: false,
    autoComplete: 'organization',
    hint: 'If you work independently, tell us what you do instead.',
  },
  {
    name: 'topics',
    label: 'Topic or area of expertise',
    type: 'textarea',
    required: true,
    hint: 'What could you talk about that an audience would actually learn from?',
  },
  {
    name: 'links',
    label: 'Relevant links',
    type: 'textarea',
    required: false,
    hint: 'Website, LinkedIn, published work, or past interviews. One per line.',
  },
  {
    name: 'background',
    label: 'Tell us about your background',
    type: 'textarea',
    required: true,
    hint: 'Your experience, your work, and how you got here.',
  },
  {
    name: 'motivation',
    label: 'Why do you want to become a guest?',
    type: 'textarea',
    required: true,
    hint: 'What you are hoping to share, and who you want to reach.',
  },
  {
    name: 'discussionTopics',
    label: 'What are 3 topics or questions you would like to discuss during your podcast episode?',
    type: 'textarea',
    required: true,
    placeholder: '1. \n2. \n3. ',
  },
  {
    name: 'bio',
    label: 'Please provide a 1 to 2 paragraph bio to be used in your podcast show notes and promotional materials',
    type: 'textarea',
    required: true,
    hint: 'Please keep your bio between 75 and 150 words and include the information you would most like listeners to know about you, your business, expertise, or story.',
  },
  {
    name: 'publicContact',
    label: 'What contact information would you like us to include publicly in the podcast show notes?',
    type: 'textarea',
    required: false,
    hint: 'Leave this blank if you would rather nothing was published.',
  },
];

const sponsorFields = [
  { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', label: 'Phone number', type: 'tel', required: true, autoComplete: 'tel' },
  {
    name: 'sponsorPodcast',
    label: 'Which podcast are you interested in sponsoring?',
    required: false,
    hideRequirement: true,
  },
  { name: 'business', label: 'Business', required: true, autoComplete: 'organization' },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    hint: 'What are you hoping to reach, support, or promote?',
  },
];

export default function BecomeAGuest() {
  const location = useLocation();

  // Anchor handling. ScrollToTop runs on every route change, so this has to
  // happen after it. CSS scroll-margin-top keeps headings clear of the sticky
  // header; this only needs to trigger the scroll itself.
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id) return undefined;
    const timer = setTimeout(() => {
      const target = document.getElementById(id);
      if (!target) return;
      const reduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(timer);
  }, [location.hash, location.key]);

  return (
    <main id="main">
      <Seo
        title="Guest or Sponsor"
        description="Apply to appear on The Podcast Lane. We look for entrepreneurs, business owners, professionals, experts, creators, and changemakers with useful experience to share. Sponsorship inquiries welcome."
        path="/become-a-guest"
      />

      {/* 1. Guest introduction */}
      <section className="shell hero guest-intro">
        <div className="guest-intro__copy">
          <span className="eyebrow eyebrow--red">Share your story</span>
          <h1 className="display hero__title">Conversations Worth Having</h1>
          <p className="lede hero__lede">
            The Podcast Lane looks for people with useful experience, a perspective worth hearing,
            and expertise they can actually teach. If that sounds like you, we would like to hear
            from you.
          </p>
          <div className="btn-row">
            <a className="btn btn--primary" href="#application">Apply to Be a Guest</a>
          </div>
        </div>


      </section>

      <section className="section section--flush">
        <div className="shell">
          <Carousel slides={carouselSlides} />
        </div>
      </section>

      {/* 2. Guest qualifications */}
      <section className="section">
        <div className="shell">
          <span className="eyebrow">What makes a strong guest</span>
          <h2 className="h2" style={{ marginBottom: '0.75rem' }}>
            Are you a fit for 10 in 10?
          </h2>
          <p className="lede" style={{ marginBottom: '2rem' }}>
            There is no follower count or revenue threshold. These are the qualities that make a
            conversation work.
          </p>

          <div className="grid grid--3">
            {qualifications.map((item) => (
              <article className="card" key={item.title}>
                <div className="card__body">
                  <h3 className="card__title" style={{ fontSize: '1.1rem' }}>{item.title}</h3>
                  <p className="muted" style={{ fontSize: '0.95rem', marginBottom: 0 }}>
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="privacy" style={{ marginTop: '1.5rem' }}>
            Submitting an application does not guarantee selection. We read every one, and we
            follow up when there is a fit for an upcoming season.
          </p>
        </div>
      </section>

      {/* 3. Guest application */}
      <section className="section anchor-target" id="application">
        <div className="shell">
          <span className="eyebrow eyebrow--red">Guest application</span>
          <h2 className="h2" style={{ marginBottom: '2rem' }}>Apply to be a guest</h2>
          <NetlifyForm
            name={FORM_NAMES.guest}
            fields={guestFields}
            legend="Your details and what you would bring to the show"
            consentLabel="I understand that submitting this application does not guarantee an appearance on the show, and I agree to be contacted about it."
            submitLabel="Submit Guest Application"
            successTitle="Your application is in"
            successBody="Thanks for reaching out. We read every guest application and will follow up if it looks like a fit for an upcoming season."
            privacyNote="We use what you send here only to review and respond to your application. Please do not include sensitive personal, medical, or financial information."
          />
        </div>
      </section>

      {/* 4. Sponsorship benefits, deliberately quieter */}
      <section className="section sponsorship anchor-target" id="sponsorship">
        <div className="shell">
          <div className="lane">
            <div className="lane__aside">
              <span className="eyebrow">Sponsorship</span>
              <hr className="rule-red" />
            </div>
            <div>
              <h2 className="sponsorship__heading">Sponsor the Show</h2>
              <p className="muted" style={{ fontSize: '0.95rem' }}>
                For businesses and organizations that want to reach an audience interested in
                entrepreneurship, leadership, expertise, and professional growth.
              </p>
              <ul className="ticks" style={{ fontSize: '0.95rem' }}>
                <li>Supporting conversations that help people build and grow</li>
                <li>Associating your brand with useful conversations and real community</li>
                <li>Exploring a custom partnership rather than a fixed package</li>
                <li>Helping fund production and distribution of the show</li>
              </ul>
              <p className="privacy">
                We do not publish audience numbers, download totals, demographics, or rate cards.
                Start a conversation and we will share what is relevant to what you are
                considering.
              </p>
              <p style={{ marginBottom: 0 }}>
                <a className="textlink" href="#sponsor-inquiry">Send a sponsor inquiry</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sponsor inquiry */}
      <section className="section sponsorship anchor-target" id="sponsor-inquiry">
        <div className="shell">
          <h2 className="sponsorship__heading" style={{ marginBottom: '1.5rem' }}>
            Sponsor inquiry
          </h2>
          <NetlifyForm
            name={FORM_NAMES.sponsor}
            fields={sponsorFields}
            legend="Your details and what you are looking for"
            consentLabel="I agree to be contacted about sponsorship and partnership opportunities with The Podcast Lane."
            submitLabel="Submit Sponsor Inquiry"
            successTitle="Thanks for reaching out"
            successBody="Your inquiry has been sent. Someone from The Podcast Lane will follow up to talk through what a partnership could look like."
            privacyNote="We use what you send here only to respond to your sponsorship inquiry. Please do not include sensitive personal or financial information."
          />
          <p className="privacy" style={{ marginTop: '1.5rem' }}>
            Have a different question? <Link className="textlink" to="/work-with-us">Work With Us</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
