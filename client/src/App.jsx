import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Alogin from './pages/Alogin';
import Aregister from './pages/Aregister';

// Rider Pages
import Rhome from './pages/Rhome';
import RequestRide from './pages/RequestRide';
import RideTracking from './pages/RideTracking';
import Rhistory from './pages/Rhistory';

// Driver Pages
import Dhome from './pages/Dhome';

// Admin Pages
import Ahome from './pages/Ahome';
import Users from './pages/Users';
import UserEdit from './pages/UserEdit';
import Bookings from './pages/Bookings';
import Acabs from './pages/Acabs';
import Acabedit from './pages/Acabedit';
import Addcar from './pages/Addcar';

// Route Guards
const RiderProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  return token && user && user.role === 'rider' ? children : <Navigate to="/login" replace />;
};

const DriverProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  return token && user && user.role === 'driver' ? children : <Navigate to="/login" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/alogin" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/alogin" element={<Alogin />} />
        <Route path="/aregister" element={<Aregister />} />

        {/* Rider Protected Routes */}
        <Route path="/rhome" element={<RiderProtectedRoute><Rhome /></RiderProtectedRoute>} />
        <Route path="/request-ride" element={<RiderProtectedRoute><RequestRide /></RiderProtectedRoute>} />
        <Route path="/ridetracking/:id" element={<RiderProtectedRoute><RideTracking /></RiderProtectedRoute>} />
        <Route path="/rhistory" element={<RiderProtectedRoute><Rhistory /></RiderProtectedRoute>} />

        {/* Driver Protected Routes */}
        <Route path="/dhome" element={<DriverProtectedRoute><Dhome /></DriverProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="/ahome" element={<AdminProtectedRoute><Ahome /></AdminProtectedRoute>} />
        <Route path="/users" element={<AdminProtectedRoute><Users /></AdminProtectedRoute>} />
        <Route path="/useredit/:id" element={<AdminProtectedRoute><UserEdit /></AdminProtectedRoute>} />
        <Route path="/bookings" element={<AdminProtectedRoute><Bookings /></AdminProtectedRoute>} />
        <Route path="/acabs" element={<AdminProtectedRoute><Acabs /></AdminProtectedRoute>} />
        <Route path="/acabedit/:id" element={<AdminProtectedRoute><Acabedit /></AdminProtectedRoute>} />
        <Route path="/addcar" element={<AdminProtectedRoute><Addcar /></AdminProtectedRoute>} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
