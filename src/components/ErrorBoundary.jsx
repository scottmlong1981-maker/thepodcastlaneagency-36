import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main id="main" className="shell hero">
          <span className="eyebrow eyebrow--red">Something went wrong</span>
          <h1 className="display">This page stopped loading</h1>
          <p className="lede">
            Reload to try again. If it keeps happening, the episodes and platform
            links are still reachable from the navigation.
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
              Reload the page
            </button>
            <Link className="btn" to="/">Go to the home page</Link>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
