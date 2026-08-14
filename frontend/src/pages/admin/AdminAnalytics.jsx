import { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/errorMessage';

const LABELS = {
  total_events: 'Total events',
  open_events: 'Open events',
  completed_events: 'Completed events',
  total_volunteers: 'Total volunteers',
  total_registrations: 'Total registrations',
  attendance_count: 'Attendance count',
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .admin()
      .then(({ data }) => setStats(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h2 className="page-title">Admin Analytics</h2>
      <div className="card">
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          {Object.entries(LABELS).map(([key, label]) => (
            <div key={key}>
              <div className="muted">{label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats[key]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
