import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">CFG Volunteers</Link>
      <div className="navbar-links">
        <Link to="/">Events</Link>
        {user?.role === 'VOLUNTEER' && (
          <>
            <Link to="/me/registrations">My Registrations</Link>
            <Link to="/me/attendance">My Attendance</Link>
          </>
        )}
        {user?.role === 'ADMIN' && (
          <>
            <Link to="/admin/events/new">Create Event</Link>
            <Link to="/admin/coordinators">Coordinators</Link>
            <Link to="/admin/analytics">Analytics</Link>
          </>
        )}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Sign up</Link>}
        {user && (
          <>
            <span className="muted">{user.name} · {user.role}</span>
            <button className="secondary" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
