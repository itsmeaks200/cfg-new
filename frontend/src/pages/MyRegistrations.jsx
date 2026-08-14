import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { meApi } from '../api/endpoints';
import { getErrorMessage } from '../api/errorMessage';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meApi
      .registrations()
      .then(({ data }) => setRegistrations(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h2 className="page-title">My Registrations</h2>
      {registrations.length === 0 && <p className="muted">You haven't registered for any events yet.</p>}
      {registrations.map((r) => (
        <div className="card" key={r.registration_id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <Link to={`/events/${r.event_id}`}>{r.event_title}</Link>
            <span className="muted">{r.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
