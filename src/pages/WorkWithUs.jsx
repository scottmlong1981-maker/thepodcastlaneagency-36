import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../components/Seo';
import NetlifyForm from '../components/NetlifyForm';
import AsSeenOn from '../components/AsSeenOn';
import {
  FORM_NAMES,
  CALENDLY_URL,
  CALENDLY_EVENT_NAME,
  LEARN_MORE_ROUTE,
  PAYMENT_ENABLED,
} from '../config';
import { packages, addOns, supportOptions, testimonials } from '../data/work';

// The dropdown uses the approved public option list, so it can never expose an
// internal package name.
const serviceOptions = supportOptions;

const inquiryFields = [
  { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
  { name: 'email', label: 'Email address', type: 'email', required: true, autoComplete: 'email' },
  { name: 'phone', label: 'Phone number', type: 'tel', required: true, autoComplete: 'tel' },
  {
    name: 'business',
    label: 'Business or organization',
    required: false,
    autoComplete: 'organization',
    hint: 'If you work independently, tell us what you do instead.',
  },
  {
    name: 'website',
    label: 'Website or relevant link',
    type: 'url',
    required: false,
    autoComplete: 'url',
  },
  {
    name: 'service',
    label: 'What kind of support are you looking for?',
    type: 'select',
    required: true,
    options: serviceOptions,
  },
  {
    name: 'details',
    label: 'Project goals',
    type: 'textarea',
    required: true,
    hint: 'What you want to say, who needs to hear it, and where you are starting from.',
  },
  {
    name: 'timeline',
    label: 'Timeline',
    required: false,
    hint: 'When you are hoping to start, if you know.',
  },
];

export default function WorkWithUs() {
  const location = useLocation();

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
        title="Work With Us"
        description="Work with The Podcast Lane on podcast production, coaching, and visibility. Tell us what you want to say and who needs to hear it, and we will take it from there."
        path="/work-with-us"
      />

      {/* 1. Conversion hero */}
      <section className="shell hero work-hero">
        <span className="eyebrow eyebrow--red">Work with The Podcast Lane</span>
        <h1 className="display work-hero__title">Ready to Work With Us?</h1>
        <p className="lede work-hero__lede">
          For more details about our services and how The Podcast Lane can support your show,
          contact us or visit{' '}
          <a href="https://www.thepodcastlane.com/" target="_blank" rel="noopener noreferrer">
            thepodcastlane.com
          </a>
          .
        </p>
        <div className="btn-row">
          <a className="btn btn--primary" href="#inquiry">Start Your Inquiry</a>
          {CALENDLY_URL && <a className="btn" href="#book">Book a Conversation</a>}
        </div>
      </section>

      {/* 2. Packages and add-ons */}
      <section className="section">
        <div className="shell">
          <span className="eyebrow">What we do</span>
          <h2 className="h2" style={{ marginBottom: '2rem' }}>Packages</h2>

          <div className="grid grid--3">
            {packages.map((pkg) => (
              <article className="card package-card" key={pkg.id}>
                <div className="card__body">
                  <h3 className="card__title" style={{ marginBottom: 0 }}>{pkg.name}</h3>
                </div>
              </article>
            ))}
          </div>

          <h3 className="h3" style={{ margin: '2.5rem 0 1rem' }}>Add-Ons</h3>
          <ul className="ticks">
            {addOns.map((item) => <li key={item}>{item}</li>)}
          </ul>

          <div className="btn-row">
            <a className="btn btn--primary" href="#inquiry">Start Your Inquiry</a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" aria-labelledby="testimonials">
        <div className="shell">
          <span className="eyebrow eyebrow--red">In their words</span>
          <h2 className="h2" id="testimonials" style={{ marginBottom: '2rem' }}>
            What clients say
          </h2>
          <ul className="testimonials">
            {testimonials.map((item) => (
              <li className="testimonial" key={item.name}>
                <p className="testimonial__name">{item.name}</p>
                {item.company && <p className="testimonial__company">{item.company}</p>}
                {item.org && <p className="testimonial__org">{item.org}</p>}
                <p className="testimonial__rating" aria-label={`${item.rating} out of 5 stars`}>
                  <span aria-hidden="true">{'\u2605'.repeat(item.rating)}</span>
                </p>
                <blockquote className="testimonial__quote">{item.quote}</blockquote>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Inquiry form */}
      <section className="section anchor-target" id="inquiry">
        <div className="shell">
          <span className="eyebrow eyebrow--red">Work With Us inquiry</span>
          <h2 className="h2" style={{ marginBottom: '2rem' }}>Start your inquiry</h2>
          <NetlifyForm
            name={FORM_NAMES.inquiry}
            fields={inquiryFields}
            legend="Your details and what you are trying to build"
            consentLabel="I agree to be contacted by The Podcast Lane about this inquiry."
            submitLabel="Submit Your Inquiry"
            successTitle="Inquiry received"
            successBody="Thanks for getting in touch. Someone from The Podcast Lane will follow up to talk through what you are working on."
            privacyNote="We use what you send here only to respond to your inquiry. Please do not include sensitive personal or financial information."
          />
        </div>
      </section>

      {/* 4. Calendly booking. Renders only with a verified destination. */}
      {CALENDLY_URL && (
        <section className="section anchor-target" id="book">
          <div className="shell">
            <span className="eyebrow">Booking</span>
            <h2 className="h2" style={{ marginBottom: '0.75rem' }}>Book a Conversation</h2>
            <p className="lede">
              Prefer to talk it through? Book {CALENDLY_EVENT_NAME} at a time that suits you.
            </p>
            <div className="calendly">
              <iframe
                src={CALENDLY_URL}
                title="Schedule a conversation with The Podcast Lane"
                loading="lazy"
              />
            </div>
            <div className="btn-row">
              <a className="btn" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                Open the booking page
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 6. Payment is intentionally not implemented. No approved amount,
             purpose, or verified destination exists. See README. */}
      {PAYMENT_ENABLED && null}

      {/* 7. Learn More. Renders only when a real destination exists. */}
      {LEARN_MORE_ROUTE && (
        <section className="section">
          <div className="shell">
            <span className="eyebrow">Not ready yet?</span>
            <h2 className="h2" style={{ marginBottom: '1rem' }}>Learn more about the show</h2>
            <div className="btn-row">
              <a
                className="btn"
                href={LEARN_MORE_ROUTE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Learn more about The Podcast Lane, opens in a new tab"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 8. As Seen On. Renders only once the supplied graphic exists. */}
      <AsSeenOn />

      {/* 10. Final CTA */}
      <section className="section">
        <div className="shell">
          <span className="eyebrow eyebrow--red">Get started</span>
          <h2 className="h2" style={{ maxWidth: '22ch', marginBottom: '1rem' }}>
            Ready to Start the Conversation?
          </h2>
          <p className="lede" style={{ marginBottom: 0 }}>
            Tell us what you want to say and who needs to hear it.
          </p>
          <div className="btn-row">
            <a className="btn btn--primary" href="#inquiry">Start Your Inquiry</a>
            {CALENDLY_URL && <a className="btn" href="#book">Book a Conversation</a>}
          </div>
        </div>
      </section>
    </main>
  );
}
