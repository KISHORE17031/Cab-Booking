import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Anav from '../components/Anav';

const Ahome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  
  // Dynamic stats states
  const [stats, setStats] = useState({
    totalRiders: 0,
    totalDrivers: 0,
    onlineDrivers: 0,
    offlineDrivers: 0,
    busyDrivers: 0,
    availableDrivers: 0,
    cabsCount: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/alogin');
      return;
    }

    fetchStats(adminToken);

    // Setup live operations automatic refresh every 4 seconds
    const interval = setInterval(() => {
      fetchStats(adminToken);
    }, 4000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch users list
      const usersRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/admins/users', { headers });
      let drivers = [];
      let totalRiders = 0;
      if (usersRes.data.success) {
        totalRiders = usersRes.data.users.filter(u => u.role === 'rider').length;
        drivers = usersRes.data.users.filter(u => u.role === 'driver');
      }

      // 2. Fetch cars
      const carsRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/cars', { headers });
      const cabsCount = carsRes.data.success ? carsRes.data.cars.length : 0;

      // 3. Fetch rides
      const ridesRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/admin/all', { headers });
      let totalBookings = 0;
      let activeBookings = 0;
      let completedBookings = 0;
      let totalEarnings = 0;
      let ridesList = [];

      if (ridesRes.data.success) {
        ridesList = ridesRes.data.rides;
        setBookings(ridesList);
        totalBookings = ridesList.length;
        activeBookings = ridesList.filter(b => ['pending', 'accepted', 'started'].includes(b.status)).length;
        completedBookings = ridesList.filter(b => b.status === 'completed').length;
        totalEarnings = ridesList.filter(b => b.status === 'completed').reduce((sum, r) => sum + r.fare, 0);
      }

      // Calculate Driver states from database
      const totalDrivers = drivers.length;
      
      // A driver is busy if they are on an active trip (accepted or started)
      const busyDriverIds = new Set(
        ridesList
          .filter(b => ['accepted', 'started'].includes(b.status) && b.driverId)
          .map(b => (b.driverId._id || b.driverId).toString())
      );

      const busyDrivers = busyDriverIds.size;
      const onlineDrivers = drivers.filter(d => d.isAvailable).length;
      
      // Available drivers: online and not on an active trip
      const availableDrivers = drivers.filter(d => d.isAvailable && !busyDriverIds.has(d._id.toString())).length;
      
      // Offline drivers: not available
      const offlineDrivers = drivers.filter(d => !d.isAvailable).length;

      setStats({
        totalRiders,
        totalDrivers,
        onlineDrivers,
        offlineDrivers,
        busyDrivers,
        availableDrivers,
        cabsCount,
        totalBookings,
        activeBookings,
        completedBookings,
        totalEarnings
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Anav />

      <div className="container py-4 animate-fade-in-up">
        {/* Title Header */}
        <div className="glass-panel p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Live Operations HUD</h2>
            <p className="text-secondary mb-0" style={{ color: 'var(--text-secondary)' }}>Real-time fleet tracking, passenger bookings, and driver allocations.</p>
          </div>
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-30 animate-pulse-radar py-2 px-3">
            <i className="bi bi-broadcast me-1"></i> Live Operations Connected
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : (
          <>
            {/* Level 1: Key Metrics Dashboard */}
            <div className="row g-4 mb-4">
              {/* Total Revenue */}
              <div className="col-md-6 col-lg-3">
                <div className="glass-card p-4 h-100 border-success border-opacity-20" style={{ borderLeft: '4px solid #16a34a' }}>
                  <span className="text-secondary small d-block mb-1" style={{ color: 'var(--text-secondary)' }}>TOTAL REVENUE</span>
                  <h3 className="fw-bold text-success mb-1">&#8377;{stats.totalEarnings.toLocaleString()}</h3>
                  <span className="text-muted small">From completed rides</span>
                </div>
              </div>

              {/* Active Trips in Transit */}
              <div className="col-md-6 col-lg-3">
                <div className="glass-card p-4 h-100 border-info border-opacity-20" style={{ borderLeft: '4px solid #06b6d4' }}>
                  <span className="text-secondary small d-block mb-1" style={{ color: 'var(--text-secondary)' }}>ACTIVE DISPATCHES</span>
                  <h3 className="fw-bold text-info mb-1">{stats.activeBookings}</h3>
                  <span className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>Trips currently on road</span>
                </div>
              </div>

              {/* Registered Fleet */}
              <div className="col-md-6 col-lg-3">
                <div className="glass-card p-4 h-100 border-warning border-opacity-20" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                  <span className="text-secondary small d-block mb-1" style={{ color: 'var(--text-secondary)' }}>FLEET VEHICLES</span>
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.cabsCount}</h3>
                  <span className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>Cars registered in system</span>
                </div>
              </div>

              {/* Total Customers */}
              <div className="col-md-6 col-lg-3">
                <div className="glass-card p-4 h-100 border-secondary border-opacity-20" style={{ borderLeft: '4px solid #64748b' }}>
                  <span className="text-secondary small d-block mb-1" style={{ color: 'var(--text-secondary)' }}>TOTAL RIDERS</span>
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stats.totalRiders}</h3>
                  <span className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>Registered accounts</span>
                </div>
              </div>
            </div>

            {/* Drivers Status Card & Live Map */}
            <div className="row g-4 mb-4">
              {/* Accessible Driver Status Tracker */}
              <div className="col-lg-5">
                <div className="glass-panel p-4 h-100">
                  <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}><i className="bi bi-steering me-2 text-warning animate-pulse-radar"></i>🚕 Drivers Status Registry</h5>
                  
                  <div className="row g-3 text-center mb-4">
                    <div className="col-6">
                      <div className="glass-card p-3">
                        <span className="text-secondary small d-block" style={{ color: 'var(--text-secondary)' }}>TOTAL DRIVERS</span>
                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{stats.totalDrivers}</h2>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="glass-card p-3">
                        <span className="text-success small d-block">🟢 ONLINE</span>
                        <h2 className="fw-bold text-success mb-0">{stats.onlineDrivers}</h2>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-3">
                    <div className="d-flex justify-content-between align-items-center p-2 border-bottom border-secondary border-opacity-10">
                      <span style={{ color: 'var(--text-primary)' }}><span className="spinner-grow spinner-grow-sm text-success me-2" style={{ width: '8px', height: '8px' }}></span>Available Drivers</span>
                      <span className="badge bg-success bg-opacity-15 text-success fw-bold px-3">{stats.availableDrivers}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-2 border-bottom border-secondary border-opacity-10">
                      <span style={{ color: 'var(--text-primary)' }}><span className="spinner-grow spinner-grow-sm text-warning me-2" style={{ width: '8px', height: '8px' }}></span>Busy (In Transit)</span>
                      <span className="badge bg-warning bg-opacity-15 text-warning fw-bold px-3">{stats.busyDrivers}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-2">
                      <span style={{ color: 'var(--text-primary)' }}><span className="spinner-grow spinner-grow-sm text-danger me-2" style={{ width: '8px', height: '8px' }}></span>Offline Drivers</span>
                      <span className="badge bg-danger bg-opacity-15 text-danger fw-bold px-3">{stats.offlineDrivers}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time map view */}
              <div className="col-lg-7">
                <div className="glass-panel p-4 h-100">
                  <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}><i className="bi bi-map me-2 text-info"></i>Live Grid Dispatch map</h5>
                  
                  <div className="w-100" style={{ height: '220px' }}>
                    <svg className="w-100 h-100" viewBox="0 0 350 200" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                      <defs>
                        <pattern id="adminMapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--glass-border)" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#adminMapGrid)" />

                      {/* Map lines */}
                      <path d="M 30 160 Q 150 40 320 120" fill="none" stroke="var(--glass-border)" strokeWidth="3" />
                      <path d="M 60 120 L 280 120" fill="none" stroke="var(--glass-border)" strokeWidth="1.5" />

                      {/* Active dispatches icons */}
                      {bookings.filter(b => ['accepted', 'started'].includes(b.status)).map((b, i) => (
                        <g key={b._id} transform={`translate(${80 + i * 50}, ${100 + Math.sin(i) * 30})`} className="animate-float-car">
                          <circle cx="0" cy="0" r="10" fill="rgba(241, 196, 15, 0.2)" />
                          <circle cx="0" cy="0" r="5" fill="var(--accent-color)" />
                        </g>
                      ))}

                      {/* Info label */}
                      <text x="10" y="190" fill="var(--text-secondary)" fontSize="10">Simulating active platform GPS positions</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 2: Bookings Register & Quick actions */}
            <div className="row g-4">
              <div className="col-12 col-xl-8">
                <div className="glass-panel p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Live Dispatch Queue</h5>
                    <Link to="/bookings" className="text-warning text-decoration-none small">View Registry <i className="bi bi-chevron-right"></i></Link>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-5 text-secondary">
                      <p>No active booking requests currently in queue.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>
                            <th>RIDER</th>
                            <th>DRIVER</th>
                            <th>PICKUP / DROP</th>
                            <th>FARE</th>
                            <th className="text-end">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.slice(0, 5).map((booking) => (
                            <tr key={booking._id} className="border-bottom border-secondary border-opacity-10" style={{ color: 'var(--text-primary)' }}>
                              <td className="small" style={{ color: 'var(--text-primary)' }}>{booking.riderId?.name || 'Rider'}</td>
                              <td className="small" style={{ color: 'var(--text-primary)' }}>{booking.driverId?.name || <span className="text-muted">Awaiting Driver</span>}</td>
                              <td className="small text-truncate" style={{ maxWidth: '180px', color: 'var(--text-primary)' }}>
                                <div><i className="bi bi-circle-fill text-primary me-1 small"></i> {booking.pickupLocation}</div>
                                <div className="mt-1"><i className="bi bi-geo-alt-fill text-warning me-1"></i> {booking.dropLocation}</div>
                              </td>
                              <td className="fw-semibold text-warning" style={{ color: 'var(--accent-color)' }}>&#8377;{booking.fare}</td>
                              <td className="text-end" style={{ color: 'var(--text-primary)' }}>
                                <span className={`badge text-uppercase px-2 py-1 rounded-pill ${
                                  booking.status === 'completed' ? 'bg-success bg-opacity-15 text-success' : 'bg-warning bg-opacity-15 text-warning'
                                }`}>
                                  {booking.status}
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

              {/* Shortcuts */}
              <div className="col-12 col-xl-4">
                <div className="glass-panel p-4 h-100">
                  <h5 className="fw-bold mb-4" style={{ color: 'var(--text-primary)' }}>Management Shortcuts</h5>
                  <div className="d-grid gap-3">
                    <Link to="/users" className="btn btn-premium-outline text-start d-flex justify-content-between align-items-center py-3">
                      <span><i className="bi bi-people me-2"></i> User accounts CRUD</span>
                      <i className="bi bi-chevron-right"></i>
                    </Link>
                    <Link to="/acabs" className="btn btn-premium-outline text-start d-flex justify-content-between align-items-center py-3">
                      <span><i className="bi bi-car-front me-2"></i> Fleet Cabs CRUD</span>
                      <i className="bi bi-chevron-right"></i>
                    </Link>
                    <Link to="/addcar" className="btn btn-premium text-start text-white d-flex justify-content-between align-items-center py-3">
                      <span><i className="bi bi-plus-circle me-2"></i> Register Fleet Cab</span>
                      <i className="bi bi-chevron-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Ahome;
