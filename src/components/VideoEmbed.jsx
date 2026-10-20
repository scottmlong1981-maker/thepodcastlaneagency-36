import { useState } from 'react';

/**
 * Facade embed: renders the official YouTube thumbnail and only mounts the
 * iframe after an explicit click. Keeps the episode library from loading
 * dozens of players at once.
 */
export default function VideoEmbed({ id, title, thumbnail, eager = false }) {
  const [active, setActive] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  if (!id) {
    return (
      <div className="embed">
        <div className="embed__button" aria-hidden="true" />
      </div>
    );
  }

  if (active) {
    return (
      <div className="embed">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={`${title} - video player`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // maxresdefault is missing on some uploads; fall back to the always-present size.
  const poster = imgFailed ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : thumbnail;

  return (
    <div className="embed">
      <button type="button" className="embed__button" onClick={() => setActive(true)}>
        <img
          src={poster}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          onError={() => setImgFailed(true)}
        />
        <span className="embed__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="visually-hidden">Play {title}</span>
      </button>
    </div>
  );
}
