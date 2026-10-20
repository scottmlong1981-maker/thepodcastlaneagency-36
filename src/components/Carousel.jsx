import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Image carousel where the whole slide is a link.
 *
 * Built on native scroll-snap rather than a JS animation loop: touch swipe and
 * momentum come free and correctly on mobile, and the previous/next buttons
 * simply scroll the track. Nothing moves on its own, so there is no autoplay to
 * interrupt a reader.
 */
export default function Carousel({ slides }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((i) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[i];
    if (!target) return;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft,
                     behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  // Keep the indicator in step with manual swiping.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        setIndex(Math.round(track.scrollLeft / width));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const go = (delta) => {
    const next = Math.min(slides.length - 1, Math.max(0, index + delta));
    setIndex(next);
    scrollTo(next);
  };

  return (
    <div className="carousel">
      <ul className="carousel__track" ref={trackRef}>
        {slides.map((slide) => (
          <li className="carousel__slide" key={slide.id}>
            <a
              href={slide.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open the ${slide.label} on YouTube`}
            >
              <img src={slide.image} alt={slide.alt} width="1200" height="900" loading="lazy" />
            </a>
          </li>
        ))}
      </ul>

      <div className="carousel__controls">
        <button
          type="button"
          className="carousel__btn"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous image"
        >
          <span aria-hidden="true">&#8592;</span>
        </button>

        <ol className="carousel__dots">
          {slides.map((slide, i) => (
            <li key={slide.id}>
              <button
                type="button"
                className={`carousel__dot${i === index ? ' is-current' : ''}`}
                aria-label={`Go to image ${i + 1} of ${slides.length}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => { setIndex(i); scrollTo(i); }}
              />
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="carousel__btn"
          onClick={() => go(1)}
          disabled={index === slides.length - 1}
          aria-label="Next image"
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
    </div>
  );
}
