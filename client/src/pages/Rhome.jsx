import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Rnav from '../components/Rnav';

const Rhome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
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

      // 1. Fetch rider history
      const historyRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/rider/history', { headers });
      if (historyRes.data.success) {
        const rides = historyRes.data.rides;
        setHistory(rides);
        
        // Find if there is an active ride in progress
        const active = rides.find(ride => ['pending', 'accepted', 'started'].includes(ride.status));
        setActiveRide(active || null);
      }

      // 2. Fetch available vehicles
      const cabsRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/cars', { headers });
      if (cabsRes.data.success) {
        const available = cabsRes.data.cars.filter(car => car.status === 'available');
        setCabsCount(available.length);
      }
    } catch (err) {
      console.error('Error loading rider dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return 'bg-info bg-opacity-10 text-info border border-info border-opacity-50';
      case 'started': return 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-50';
      case 'completed': return 'bg-success bg-opacity-10 text-success border border-success border-opacity-50';
      case 'cancelled': return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-50';
      default: return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-50'; // pending
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Rnav />

      <div className="container py-4">
        {/* Active Dispatch Notification Card */}
        {activeRide && (
          <div className="glass-panel p-4 mb-4 border-warning border-opacity-50 bg-warning bg-opacity-5 animate-fade-in-up">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-20 text-warning rounded-circle p-3 d-flex align-items-center justify-content-center">
                  <i className="bi bi-clock-history fs-3 animate-spin"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Active Trip In Progress!</h5>
                  <p className="text-secondary small mb-0" style={{ color: 'var(--text-secondary)' }}>Your ride to <strong>{activeRide.dropLocation}</strong> is currently <strong>{activeRide.status.toUpperCase()}</strong>.</p>
                </div>
              </div>
              <Link to={`/ridetracking/${activeRide._id}`} className="btn btn-warning text-dark fw-bold px-4 py-2">
                Track / Pay Ride <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="glass-panel p-4 mb-4 animate-fade-in-up">
          <div className="row align-items-center">
            <div className="col-md-8 text-center text-md-start">
              <h2 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Hello, <span style={{ color: 'var(--accent-color)' }}>{user?.name}</span>!</h2>
              <p className="text-secondary mb-0" style={{ color: 'var(--text-secondary)' }}>Ready for your next trip? RideReady is at your service with reliable cashless rides.</p>
            </div>
            <div className="col-md-4 text-center text-md-end mt-3 mt-md-0">
              <Link to="/request-ride" className="btn btn-premium d-inline-flex align-items-center gap-2">
                <i className="bi bi-plus-circle"></i> Book New Ride
              </Link>
            </div>
          </div>
        </div>

        {/* Info Metrics */}
        <div className="row g-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="col-md-6 col-lg-4">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary small fw-medium" style={{ color: 'var(--text-secondary)' }}>Available Cabs Nearby</span>
                <i className="bi bi-taxi-front-fill text-warning fs-4 animate-float-car"></i>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{cabsCount}</h2>
              <p className="text-success small mb-0"><i className="bi bi-check2-circle"></i> Drivers online and available</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary small fw-medium" style={{ color: 'var(--text-secondary)' }}>Total Rides Completed</span>
                <i className="bi bi-check-all text-success fs-4"></i>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {history.filter(r => r.status === 'completed').length}
              </h2>
              <p className="text-secondary small mb-0" style={{ color: 'var(--text-secondary)' }}>Lifetime history counts</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary small fw-medium" style={{ color: 'var(--text-secondary)' }}>Cashless wallet spent</span>
                <i className="bi bi-wallet2 text-info fs-4"></i>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                &#8377;{history.filter(r => r.status === 'completed' && r.paymentStatus === 'paid').reduce((sum, r) => sum + r.fare, 0)}
              </h2>
              <p className="text-secondary small mb-0" style={{ color: 'var(--text-secondary)' }}>Total mock payments processed</p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-panel p-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Recent Rides</h4>
            <Link to="/rhistory" className="text-warning text-decoration-none small fw-semibold">View History <i className="bi bi-chevron-right"></i></Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-calendar-x fs-1 text-muted mb-3 d-block"></i>
              <p className="mb-0">You have no ride requests recorded.</p>
              <Link to="/request-ride" className="btn btn-premium btn-sm mt-3">Book Your First Ride</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>
                    <th>VEHICLE / TYPE</th>
                    <th>PICKUP ADDRESS</th>
                    <th>DROP ADDRESS</th>
                    <th>DATE</th>
                    <th>FARE</th>
                    <th>PAYMENT</th>
                    <th className="text-end">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((ride) => (
                    <tr key={ride._id} className="border-bottom border-secondary border-opacity-10" style={{ color: 'var(--text-primary)' }}>
                      <td style={{ color: 'var(--text-primary)' }}>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-car-front-fill text-warning fs-5"></i>
                          <div>
                            <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{ride.carId?.name || 'Cab Details'}</div>
                            <div className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>{ride.carId?.model || 'Sedan'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: '150px', color: 'var(--text-primary)' }}>{ride.pickupLocation}</td>
                      <td className="small text-truncate" style={{ maxWidth: '150px', color: 'var(--text-primary)' }}>{ride.dropLocation}</td>
                      <td className="small" style={{ color: 'var(--text-primary)' }}>{new Date(ride.bookingDate).toLocaleDateString()}</td>
                      <td className="fw-semibold text-warning" style={{ color: 'var(--accent-color)' }}>&#8377;{ride.fare}</td>
                      <td style={{ color: 'var(--text-primary)' }}>
                        <span className={`badge px-2 py-1 rounded ${ride.paymentStatus === 'paid' ? 'bg-success bg-opacity-15 text-success' : 'bg-danger bg-opacity-15 text-danger'}`}>
                          {ride.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end" style={{ color: 'var(--text-primary)' }}>
                        <span className={`badge px-3 py-2 rounded-pill small ${getStatusBadge(ride.status)}`}>
                          {ride.status.toUpperCase()}
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

export default Rhome;
