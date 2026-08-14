import { useEffect, useState } from 'react';
import { coordinatorApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/errorMessage';

export default function Coordinators() {
  const [coordinators, setCoordinators] = useState([]);
  const [email, setEmail] = useState('');
  const [inviteResult, setInviteResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function loadCoordinators() {
    coordinatorApi.list().then(({ data }) => setCoordinators(data)).catch(() => {});
  }

  useEffect(loadCoordinators, []);

  async function handleInvite(e) {
    e.preventDefault();
    setError('');
    setInviteResult(null);
    setLoading(true);
    try {
      const { data } = await coordinatorApi.invite(email);
      setInviteResult(data);
      setEmail('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="card" style={{ maxWidth: 480 }}>
        <h2>Invite a coordinator</h2>
        <form onSubmit={handleInvite}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send invite'}</button>
        </form>
        {inviteResult && (
          <div className="card" style={{ marginTop: 12, background: '#f7f9ff' }}>
            <p className="success-text">Invitation created.</p>
            <p>Share this invite code with the coordinator:</p>
            <code>{inviteResult.inviteCode}</code>
            <p className="muted">Expires: {new Date(inviteResult.expiresAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Coordinators</h3>
        {coordinators.length === 0 && <p className="muted">No coordinators yet.</p>}
        {coordinators.map((c) => (
          <div key={c.id} className="row" style={{ justifyContent: 'space-between' }}>
            <span>{c.name}</span>
            <span className="muted">{c.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
