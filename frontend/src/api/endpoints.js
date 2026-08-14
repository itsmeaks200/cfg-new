import client from './client';

export const authApi = {
  signup: (data) => client.post('/auth/signup', data),
  coordinatorSignup: (data) => client.post('/auth/coordinator-signup', data),
  login: (data) => client.post('/auth/login', data),
  logout: (refreshToken) => client.post('/auth/logout', { refreshToken }),
  me: () => client.get('/auth/me'),
};

export const coordinatorApi = {
  invite: (email) => client.post('/coordinators/invite', { email }),
  list: () => client.get('/coordinators'),
};

export const eventApi = {
  list: (status) => client.get('/events', { params: status ? { status } : {} }),
  get: (id) => client.get(`/events/${id}`),
  create: (data) => client.post('/events', data),
  update: (id, data) => client.patch(`/events/${id}`, data),
  assignCoordinator: (id, coordinatorId) =>
    client.patch(`/events/${id}/coordinator`, { coordinator_id: coordinatorId }),
  openRegistration: (id) => client.post(`/events/${id}/open-registration`),
  closeRegistration: (id) => client.post(`/events/${id}/close-registration`),
  registrations: (id) => client.get(`/events/${id}/registrations`),
  analytics: (id) => client.get(`/events/${id}/analytics`),
  register: (id) => client.post(`/events/${id}/register`),
  unregister: (id) => client.delete(`/events/${id}/register`),
};

export const meApi = {
  registrations: () => client.get('/me/registrations'),
  attendance: () => client.get('/me/attendance'),
};

export const registrationApi = {
  markAttendance: (id, status) => client.post(`/registrations/${id}/attendance`, { status }),
};

export const analyticsApi = {
  admin: () => client.get('/analytics'),
};
