import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CoordinatorSignup from './pages/CoordinatorSignup';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import MyRegistrations from './pages/MyRegistrations';
import MyAttendance from './pages/MyAttendance';
import CreateEvent from './pages/admin/CreateEvent';
import Coordinators from './pages/admin/Coordinators';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/coordinator-signup" element={<CoordinatorSignup />} />
          <Route path="/events/:id" element={<EventDetail />} />

          <Route
            path="/me/registrations"
            element={
              <ProtectedRoute roles={['VOLUNTEER']}>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me/attendance"
            element={
              <ProtectedRoute roles={['VOLUNTEER']}>
                <MyAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coordinators"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Coordinators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
