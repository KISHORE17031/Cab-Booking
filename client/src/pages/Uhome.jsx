import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Unav from '../components/Unav';

const Uhome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cabsCount, setCabsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch bookings
      const bookingsRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/bookings/mybookings', { headers });
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }

      // Fetch cabs count
      const cabsRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/cars', { headers });
      if (cabsRes.data.success) {
        const availableCabs = cabsRes.data.cars.filter(car => car.status === 'available');
        setCabsCount(availableCabs.length);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-info bg-opacity-10 text-info border border-info';
      case 'completed': return 'bg-success bg-opacity-10 text-success border border-success';
      case 'cancelled': return 'bg-danger bg-opacity-10 text-danger border border-danger';
      default: return 'bg-warning bg-opacity-10 text-warning border border-warning';
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Unav />

      <div className="container py-4">
        {/* Welcome Section */}
        <div className="glass-panel p-4 mb-4 animate-fade-in-up">
          <div className="row align-items-center">
            <div className="col-md-8 text-center text-md-start">
              <h2 className="fw-bold text-white mb-2">Hello, <span className="text-warning">{user?.name}</span>!</h2>
              <p className="text-secondary mb-0">Where are you going today? Ucab is ready to take you safely and comfortably.</p>
            </div>
            <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
              <Link to="/cabs" className="btn btn-premium d-inline-flex align-items-center gap-2">
                <i className="bi bi-taxi-front"></i> Book New Ride
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="row g-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="col-md-6 col-lg-4">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary small fw-medium">Available Cabs Nearby</span>
                <i className="bi bi-geo-alt-fill text-warning fs-4"></i>
              </div>
              <h2 className="fw-bold text-white mb-1">{cabsCount}</h2>
              <p className="text-success small mb-0"><i className="bi bi-arrow-up-right me-1"></i>Ready to book now</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary small fw-medium">Your Bookings</span>
                <i className="bi bi-journal-text text-info fs-4"></i>
              </div>
              <h2 className="fw-bold text-white mb-1">{bookings.length}</h2>
              <p className="text-secondary small mb-0">Total history entries</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary small fw-medium">Active Rides</span>
                <i className="bi bi-arrow-repeat text-success fs-4 spin-slow"></i>
              </div>
              <h2 className="fw-bold text-white mb-1">
                {bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}
              </h2>
              <p className="text-warning small mb-0">Bookings in progress</p>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="glass-panel p-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-white mb-0">Recent Bookings</h4>
            <Link to="/mybookings" className="text-warning text-decoration-none small fw-semibold">View All Bookings <i className="bi bi-chevron-right"></i></Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
              <p className="mb-0">You have no ride bookings yet.</p>
              <Link to="/cabs" className="btn btn-premium btn-sm mt-3">Book Your First Ride</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>CAB NAME</th>
                    <th>PICKUP LOCATION</th>
                    <th>DROP LOCATION</th>
                    <th>BOOKING DATE</th>
                    <th>FARE</th>
                    <th className="text-end">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking._id} className="text-white border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-car-front-fill text-warning fs-5"></i>
                          <div>
                            <div className="fw-semibold">{booking.carId?.name || 'Cab Details'}</div>
                            <div className="text-secondary small">{booking.carId?.model || 'Sedan'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: '150px' }}>{booking.pickupLocation}</td>
                      <td className="small text-truncate" style={{ maxWidth: '150px' }}>{booking.dropLocation}</td>
                      <td className="small">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td className="fw-semibold text-warning">&#8377;{booking.totalFare}</td>
                      <td className="text-end">
                        <span className={`badge px-3 py-2 rounded-pill small ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Uhome;
