import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { getErrorMessage } from '../api/errorMessage';

export default function CoordinatorSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ inviteCode: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.coordinatorSignup(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Coordinator sign up</h2>
      <p className="muted">Use the invitation code an Admin shared with you.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Invite code</label>
          <input value={form.inviteCode} onChange={update('inviteCode')} required />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={update('name')} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={update('email')} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" minLength={8} value={form.password} onChange={update('password')} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">Account created — redirecting to login...</p>}
        <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}
