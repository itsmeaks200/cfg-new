import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../api/endpoints';
import { getErrorMessage } from '../api/errorMessage';
import StatusBadge from '../components/StatusBadge';

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventApi
      .list()
      .then(({ data }) => setEvents(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading events...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h2 className="page-title">Events</h2>
      {events.length === 0 && <p className="muted">No events yet.</p>}
      {events.map((event) => (
        <div className="card" key={event.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>{event.title}</strong>
              <div className="muted">{event.location} · {new Date(event.start_time).toLocaleString()}</div>
            </div>
            <StatusBadge status={event.status} />
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <span className="muted">{event.registered_count} / {event.required_volunteers} registered</span>
            <Link to={`/events/${event.id}`}>View details</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
