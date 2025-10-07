import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <h1>DoEmart</h1>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link to={getDashboardLink()} className="nav-link">
                Dashboard
              </Link>
              <div className="user-info">
                <span>{profile?.full_name || 'User'}</span>
                <span className="role-badge">{profile?.role}</span>
              </div>
              <button onClick={handleSignOut} className="btn btn-outline">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
