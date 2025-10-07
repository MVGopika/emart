import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { user, profile } = useAuth();

  const getDashboardLink = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'shopkeeper':
        return '/shopkeeper';
      case 'user':
        return '/user';
      default:
        return '/';
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to DoEmart</h1>
            <p className="hero-subtitle">
              Connect with local businesses and discover products directly from shopkeepers
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to={getDashboardLink()} className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose DoEmart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏪</div>
              <h3>For Shopkeepers</h3>
              <p>List your business, manage products, and reach customers directly without intermediaries.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛍️</div>
              <h3>For Customers</h3>
              <p>Discover local shops, browse products, and place orders with transparent pricing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Admin-verified businesses ensure trust and safety for all transactions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Reliable</h3>
              <p>Same-day pickup and delivery options for quick and efficient service.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of shopkeepers and customers on DoEmart today</p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Your Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
