import { Link } from 'react-router-dom';
import { LINKS, PHONE, SITE_NAME } from '../config';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__grid">
          <div>
            <div className="footer__logo">
              <img src="/logo.png" alt={SITE_NAME} width="220" height="200" />
            </div>
            <p className="muted" style={{ fontSize: '0.92rem', maxWidth: '38ch' }}>
              Podcast production, coaching, and visibility for entrepreneurs, business owners,
              professionals, and creators. Connecting people one podcast at a time.
            </p>
            <p className="footer__phone">
              <a
                className="call-now"
                href={PHONE.href}
                aria-label={`Call ${SITE_NAME} at ${PHONE.display}`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.56a1 1 0 0 1-.25 1.02l-2.2 2.21Z" />
                </svg>
                <span>Call Now</span>
              </a>
            </p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore">Explore</h2>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/episodes">10 in 10 Series</Link></li>
              <li><Link to="/featured-podcasts">Featured Podcasts</Link></li>
              <li><Link to="/become-a-guest">Guest or Sponsor</Link></li>
              <li><Link to="/work-with-us">Work With Us</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-listen">
            <h2 id="footer-listen">Listen &amp; watch</h2>
            <ul>
              <li>
                <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer">
                  YouTube
                </a>
              </li>
              <li>
                <a href={LINKS.apple} target="_blank" rel="noopener noreferrer">
                  Apple Podcasts
                </a>
              </li>
              <li>
                <a href={LINKS.spotify} target="_blank" rel="noopener noreferrer">
                  Spotify
                </a>
              </li>
              <li>
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer__base">
          <span>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
