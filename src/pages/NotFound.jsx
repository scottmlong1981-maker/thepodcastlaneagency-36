import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <main id="main" className="shell hero">
      <Seo
        title="Page not found"
        description="That page does not exist on The Podcast Lane. Head back to the home page or browse every episode."
        path="/404"
      />
      <span className="eyebrow eyebrow--red">404</span>
      <h1 className="display" style={{ maxWidth: '16ch' }}>
        This lane doesn&rsquo;t go anywhere
      </h1>
      <p className="lede hero__lede">
        The page you were after has moved or never existed. The episodes are all still here.
      </p>
      <div className="btn-row">
        <Link className="btn btn--primary" to="/">Go to the home page</Link>
        <Link className="btn" to="/episodes">Browse every episode</Link>
      </div>
    </main>
  );
}
