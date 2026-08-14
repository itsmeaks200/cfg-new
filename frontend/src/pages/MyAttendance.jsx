import { useEffect, useState } from 'react';
import { meApi } from '../api/endpoints';
import { getErrorMessage } from '../api/errorMessage';

export default function MyAttendance() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meApi
      .attendance()
      .then(({ data }) => setHistory(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h2 className="page-title">My Attendance</h2>
      {history.length === 0 && <p className="muted">No attendance records yet.</p>}
      {history.length > 0 && (
        <table>
          <thead><tr><th>Event</th><th>Status</th><th>Marked At</th></tr></thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td>{h.event_title}</td>
                <td>{h.status}</td>
                <td>{new Date(h.marked_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
