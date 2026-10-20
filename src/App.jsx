import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { trackPageView } from './analytics';
import Home from './pages/Home';
import Episodes from './pages/Episodes';
import Resources from './pages/Resources';
import FeaturedPodcasts from './pages/FeaturedPodcasts';
import BecomeAGuest from './pages/BecomeAGuest';
import WorkWithUs from './pages/WorkWithUs';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollToTop />
      <Header />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/become-a-guest" element={<BecomeAGuest />} />
          {/* Former standalone routes. Kept so existing links and bookmarks
              still land somewhere useful; neither renders a competing page. */}
          <Route path="/guest-requests" element={<Navigate to="/become-a-guest" replace />} />
          <Route
            path="/sponsor-opportunities"
            element={<Navigate to="/become-a-guest#sponsorship" replace />}
          />
          <Route path="/featured-podcasts" element={<FeaturedPodcasts />} />
          <Route path="/featured-clients" element={<Navigate to="/featured-podcasts" replace />} />
          <Route path="/work-with-us" element={<WorkWithUs />} />
          {/* Former Contact route. Redirect preserves inbound links. */}
          <Route path="/contact" element={<Navigate to="/work-with-us" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </>
  );
}
