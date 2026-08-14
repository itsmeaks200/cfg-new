import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/errorMessage';

const initialForm = {
  title: '',
  description: '',
  location: '',
  start_time: '',
  end_time: '',
  required_volunteers: 1,
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await eventApi.create({
        ...form,
        required_volunteers: Number(form.required_volunteers),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });
      navigate(`/events/${data.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2>Create event</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={update('title')} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={update('description')} rows={3} />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input value={form.location} onChange={update('location')} required />
        </div>
        <div className="form-group">
          <label>Start time</label>
          <input type="datetime-local" value={form.start_time} onChange={update('start_time')} required />
        </div>
        <div className="form-group">
          <label>End time</label>
          <input type="datetime-local" value={form.end_time} onChange={update('end_time')} required />
        </div>
        <div className="form-group">
          <label>Required volunteers</label>
          <input type="number" min={1} value={form.required_volunteers} onChange={update('required_volunteers')} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create event'}</button>
      </form>
    </div>
  );
}
