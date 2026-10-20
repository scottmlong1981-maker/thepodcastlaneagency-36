import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

// The five public navigation items. "What's Possible" (/resources) is
// deliberately absent: it stays reachable by direct URL for sharing with
// selected clients, but is not linked from the header or footer.
export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/episodes', label: '10 in 10 Series' },
  { to: '/featured-podcasts', label: 'Featured Podcasts' },
  { to: '/become-a-guest', label: 'Guest or Sponsor' },
];

// Rendered as the emphasized button at the end of both menus, not as a plain link.
export const CTA = { to: '/work-with-us', label: 'Work With Us' };

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef(null);
  const closeRef = useRef(null);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll, trap Escape, restore focus
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      toggleRef.current?.focus();
    };
  }, [open]);

  return (
    <header className="header">
      <div className="shell header__inner">
        <Link to="/" className="header__logo" aria-label="The Podcast Lane, home">
          <img src="/logo.png" alt="The Podcast Lane" width="220" height="200" />
        </Link>

        <nav className="nav" aria-label="Primary">
          <ul className="nav__list">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="nav__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to={CTA.to} className="btn btn--primary">
                {CTA.label}
              </NavLink>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          ref={toggleRef}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <span className="menu-toggle__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Menu
        </button>
      </div>

      {open && (
        <div className="drawer" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="shell drawer__top">
            <img src="/logo.png" alt="" height="50" aria-hidden="true" style={{ height: '3.1rem', width: 'auto' }} />
            <button type="button" ref={closeRef} className="drawer__close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <ul className="drawer__list">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="drawer__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="drawer__cta">
            <NavLink to={CTA.to} className="btn btn--primary" style={{ width: '100%' }}>
              {CTA.label}
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
