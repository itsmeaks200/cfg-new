import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { eventApi, coordinatorApi, meApi, registrationApi } from '../api/endpoints';
import { getErrorMessage } from '../api/errorMessage';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState('');
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';
  const isAssignedCoordinator = user?.role === 'COORDINATOR' && event?.coordinator_id === user.id;
  const canManage = isAdmin || isAssignedCoordinator;

  const loadEvent = useCallback(async () => {
    const { data } = await eventApi.get(id);
    setEvent(data);
    return data;
  }, [id]);

  const loadManageData = useCallback(
    async (currentEvent) => {
      if (isAdmin || (user?.role === 'COORDINATOR' && currentEvent.coordinator_id === user.id)) {
        const [regs, stats] = await Promise.all([eventApi.registrations(id), eventApi.analytics(id)]);
        setRegistrations(regs.data);
        setAnalytics(stats.data);
      }
    },
    [id, isAdmin, user]
  );

  useEffect(() => {
    setLoading(true);
    setError('');

    (async () => {
      try {
        const currentEvent = await loadEvent();

        if (user?.role === 'VOLUNTEER') {
          const { data } = await meApi.registrations();
          const active = data.find((r) => r.event_id === Number(id) && r.status === 'REGISTERED');
          setMyRegistration(active || null);
        }

        if (user?.role === 'ADMIN') {
          const { data } = await coordinatorApi.list();
          setCoordinators(data);
          setSelectedCoordinator(currentEvent.coordinator_id ? String(currentEvent.coordinator_id) : '');
        }

        await loadManageData(currentEvent);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function withAction(fn) {
    setActionMessage('');
    setError('');
    try {
      await fn();
      const currentEvent = await loadEvent();
      await loadManageData(currentEvent);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRegister() {
    await withAction(async () => {
      const { data } = await eventApi.register(id);
      setMyRegistration({ registration_id: data.registration_id, status: data.status });
    });
  }

  async function handleUnregister() {
    await withAction(async () => {
      await eventApi.unregister(id);
      setMyRegistration(null);
    });
  }

  async function handleAssignCoordinator() {
    if (!selectedCoordinator) return;
    await withAction(() => eventApi.assignCoordinator(id, Number(selectedCoordinator)));
    setActionMessage('Coordinator assigned');
  }

  async function handleOpenRegistration() {
    await withAction(() => eventApi.openRegistration(id));
    setActionMessage('Registration opened');
  }

  async function handleCloseRegistration() {
    await withAction(() => eventApi.closeRegistration(id));
    setActionMessage('Registration closed');
  }

  async function handleMarkAttendance(registrationId, status) {
    await withAction(() => registrationApi.markAttendance(registrationId, status));
    setActionMessage('Attendance recorded');
  }

  if (loading) return <p className="muted">Loading event...</p>;
  if (error && !event) return <p className="error-text">{error}</p>;
  if (!event) return null;

  return (
    <div>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>{event.title}</h2>
          <StatusBadge status={event.status} />
        </div>
        <p className="muted">{event.description}</p>
        <p>
          <strong>Location:</strong> {event.location}<br />
          <strong>When:</strong> {new Date(event.start_time).toLocaleString()} – {new Date(event.end_time).toLocaleString()}<br />
          <strong>Volunteers:</strong> {event.registered_count} / {event.required_volunteers}
        </p>

        {error && <p className="error-text">{error}</p>}
        {actionMessage && <p className="success-text">{actionMessage}</p>}

        {user?.role === 'VOLUNTEER' && (
          <div className="actions">
            {myRegistration ? (
              <button className="danger" onClick={handleUnregister}>Unregister</button>
            ) : (
              <button onClick={handleRegister} disabled={event.status !== 'OPEN'}>
                Register
              </button>
            )}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Assign coordinator</h3>
          <p className="muted">
            Currently assigned: {event.coordinator_id
              ? coordinators.find((c) => c.id === event.coordinator_id)?.name || `#${event.coordinator_id}`
              : 'None'}
          </p>
          <div className="row">
            <select value={selectedCoordinator} onChange={(e) => setSelectedCoordinator(e.target.value)}>
              <option value="">Select coordinator...</option>
              {coordinators.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            <button onClick={handleAssignCoordinator}>Assign</button>
          </div>
        </div>
      )}

      {canManage && (
        <div className="card">
          <h3>Registration control</h3>
          <div className="actions">
            <button onClick={handleOpenRegistration} disabled={event.status === 'OPEN'}>Open registration</button>
            <button className="secondary" onClick={handleCloseRegistration} disabled={event.status !== 'OPEN'}>Close registration</button>
          </div>
        </div>
      )}

      {analytics && (
        <div className="card">
          <h3>Analytics</h3>
          <div className="row">
            <span>Required: <strong>{analytics.required}</strong></span>
            <span>Registered: <strong>{analytics.registered}</strong></span>
            <span>Remaining: <strong>{analytics.remaining}</strong></span>
            <span>Attended: <strong>{analytics.attendance}</strong></span>
          </div>
        </div>
      )}

      {registrations && (
        <div className="card">
          <h3>Registrations</h3>
          {registrations.length === 0 && <p className="muted">No registrations yet.</p>}
          {registrations.length > 0 && (
            <table>
              <thead>
                <tr><th>Volunteer</th><th>Status</th><th>Attendance</th></tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.registration_id}>
                    <td>{r.volunteer_name}</td>
                    <td>{r.status}</td>
                    <td>
                      <div className="actions" style={{ marginTop: 0 }}>
                        <button className="secondary" onClick={() => handleMarkAttendance(r.registration_id, 'PRESENT')}>Present</button>
                        <button className="secondary" onClick={() => handleMarkAttendance(r.registration_id, 'ABSENT')}>Absent</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
