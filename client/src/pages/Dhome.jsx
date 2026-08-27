import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dnav from '../components/Dnav';

const Dhome = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Audio & notification tracking
  const lastPendingCountRef = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const driverObj = JSON.parse(userData);
    if (driverObj.role !== 'driver') {
      navigate('/login');
      return;
    }

    setDriver(driverObj);
    setIsOnline(driverObj.isAvailable || false);
    fetchDriverDashboard(token);

    // Setup polling every 3 seconds for active/pending updates
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        pollPendingRides();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (driver && isOnline) {
      pollPendingRides();
    } else {
      setPendingRides([]);
    }
  }, [isOnline, driver]);

  // Audio Synthesizer for high-fidelity notifications
  const playDispatchSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch notification chime
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio playback blocked by browser permissions until user interaction.');
    }
  };

  const fetchDriverDashboard = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch driver history
      const historyRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/driver/history', { headers });
      if (historyRes.data.success) {
        const rides = historyRes.data.rides;
        setHistory(rides);
        
        const active = rides.find(r => ['accepted', 'started'].includes(r.status));
        setActiveRide(active || null);
      }
    } catch (err) {
      console.error(err);
      setError('Error pulling driver console data');
    } finally {
      setLoading(false);
    }
  };

  const pollPendingRides = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Re-fetch history to sync active ride state in case rider completed payment/feedback
      const historyRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/driver/history', { headers });
      if (historyRes.data.success) {
        const rides = historyRes.data.rides;
        setHistory(rides);
        const active = rides.find(r => ['accepted', 'started'].includes(r.status));
        setActiveRide(active || null);
      }

      if (isOnline && !activeRide) {
        const pendingRes = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/pending', { headers });
        if (pendingRes.data.success) {
          const pending = pendingRes.data.rides;
          setPendingRides(pending);

          // Play alert chime sound if new ride dispatch appears
          if (pending.length > lastPendingCountRef.current) {
            playDispatchSound();
          }
          lastPendingCountRef.current = pending.length;
        }
      } else {
        setPendingRides([]);
        lastPendingCountRef.current = 0;
      }
    } catch (err) {
      console.error('Polling error:', err.message);
    }
  };

  const handleToggleOnline = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.put(
        'https://cab-booking-g8dt.onrender.com/api/users/availability',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setIsOnline(response.data.isAvailable);
        const updatedUser = { ...driver, isAvailable: response.data.isAvailable };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setDriver(updatedUser);
        setSuccess(`Console is now ${response.data.isAvailable ? 'Online' : 'Offline'}`);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update online presence');
    }
  };

  const handleAcceptRide = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `https://cab-booking-g8dt.onrender.com/api/rides/accept/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Ride accepted successfully! Driving to pickup.');
        fetchDriverDashboard(token);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to accept ride request');
    }
  };

  const handleStartTrip = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `https://cab-booking-g8dt.onrender.com/api/rides/start/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Trip started!');
        fetchDriverDashboard(token);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to start trip');
    }
  };

  const handleCompleteTrip = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `https://cab-booking-g8dt.onrender.com/api/rides/complete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Trip concluded. Driver released.');
        fetchDriverDashboard(token);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to complete trip');
    }
  };

  // Helper function to calculate driver coordinates on active trip map
  const getDriverMapCoords = () => {
    if (!activeRide) return { x: 80, y: 160, label: 'Offline' };
    if (activeRide.status === 'accepted') {
      return { x: 50, y: 70, label: 'Arriving at Pickup...' };
    }
    return { x: 200, y: 100, label: 'Driving on Route...' };
  };

  const driverPos = getDriverMapCoords();

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Dnav isAvailable={isOnline} onToggleAvailability={handleToggleOnline} />

      <div className="container py-4">
        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success bg-success bg-opacity-10 border-success text-success mb-4">
            {success}
          </div>
        )}

        {/* Earning stats header */}
        <div className="row g-4 mb-4 animate-fade-in-up">
          <div className="col-md-6 col-lg-8">
            <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-center">
              <h2 className="fw-bold text-white mb-2">Driver Console</h2>
              <p className="text-secondary mb-0">Toggle availability to receive sound-alert dispatches in real-time.</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-4">
            <div className="glass-card p-4">
              <span className="text-secondary small d-block">TOTAL EARNINGS</span>
              <h2 className="fw-bold text-success mb-1">
                &#8377;{history.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare, 0)}
              </h2>
              <p className="text-secondary small mb-0"><i className="bi bi-wallet2 me-1"></i>From completed cashless rides</p>
            </div>
          </div>
        </div>

        {/* Active Dispatch Action Card & Map */}
        {activeRide && (
          <div className="row g-4 mb-4 animate-fade-in-up">
            <div className="col-lg-7">
              <div className="glass-panel p-4 h-100">
                <h4 className="fw-bold text-info mb-4"><i className="bi bi-compass-fill me-2"></i>Active Trip Details</h4>
                
                <div className="row mb-3">
                  <div className="col-6">
                    <span className="text-secondary small d-block">PASSENGER RIDER</span>
                    <span className="text-white fw-bold">{activeRide.riderId?.name}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary small d-block">CONTACT PHONE</span>
                    <span className="text-white fw-bold">{activeRide.riderId?.phone}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-secondary small d-block">PICKUP ADDRESS</span>
                  <span className="text-white small fw-semibold">{activeRide.pickupLocation}</span>
                </div>
                
                <div className="mb-4">
                  <span className="text-secondary small d-block">DROP ADDRESS</span>
                  <span className="text-white small fw-semibold">{activeRide.dropLocation}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center border-top border-secondary border-opacity-10 pt-3">
                  <span className="text-secondary small">ESTIMATED REVENUE: <strong className="text-warning">&#8377;{activeRide.fare}</strong></span>
                  {activeRide.status === 'accepted' ? (
                    <button onClick={() => handleStartTrip(activeRide._id)} className="btn btn-info text-dark fw-bold px-4 py-2">
                      Start Trip <i className="bi bi-play-fill"></i>
                    </button>
                  ) : (
                    <button onClick={() => handleCompleteTrip(activeRide._id)} className="btn btn-success text-white fw-bold px-4 py-2">
                      Complete Trip <i className="bi bi-check-circle-fill"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Driver Navigation Map */}
            <div className="col-lg-5">
              <div className="glass-panel p-4 h-100">
                <span className="text-secondary small fw-bold mb-3 d-block"><i className="bi bi-pin-map me-1 text-info animate-pulse-radar"></i>ACTIVE NAVIGATION</span>
                
                <div className="w-100" style={{ height: '220px' }}>
                  <svg className="w-100 h-100" viewBox="0 0 300 200" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }}>
                    <defs>
                      <pattern id="driverGrid" width="15" height="15" patternUnits="userSpaceOnUse">
                        <path d="M 15 0 L 0 0 0 15" fill="none" stroke="var(--glass-border)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#driverGrid)" />

                    {/* Route */}
                    <path d="M 80 140 Q 150 40 220 100" fill="none" stroke="var(--glass-border)" strokeWidth="3" />
                    {activeRide.status === 'started' && (
                      <path d="M 80 140 Q 150 40 220 100" fill="none" stroke="var(--accent-color)" strokeWidth="3" className="route-path-line" />
                    )}

                    {/* Pickup */}
                    <circle cx="80" cy="140" r="4" fill="#3498db" />
                    {/* Dropoff */}
                    <circle cx="220" cy="100" r="4" fill="var(--accent-color)" />

                    {/* Driver indicator */}
                    <g transform={`translate(${driverPos.x}, ${driverPos.y})`} className="animate-float-car">
                      <circle cx="0" cy="0" r="8" fill="var(--accent-color)" />
                      <circle cx="0" cy="0" r="4" fill="#fff" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ride Requests Lists */}
        {!activeRide && (
          <div className="glass-panel p-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="fw-bold text-white mb-4"><i className="bi bi-broadcast text-warning me-2 animate-pulse-radar"></i>Available Dispatch Requests</h4>
            
            {!isOnline ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-moon-stars fs-1 text-muted d-block mb-3"></i>
                <p>You are currently <strong>OFFLINE</strong>.</p>
                <button onClick={handleToggleOnline} className="btn btn-success btn-sm mt-2">Go Online to Receive Rides</button>
              </div>
            ) : pendingRides.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <div className="spinner-grow text-warning mb-3 animate-pulse-radar" role="status" style={{ width: '2rem', height: '2rem' }}></div>
                <p>Waiting for riders to request trips...</p>
              </div>
            ) : (
              <div className="row g-3">
                {pendingRides.map((ride) => (
                  <div key={ride._id} className="col-12 animate-fade-in-up">
                    <div className="glass-card p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-secondary">Rider: {ride.riderId?.name}</span>
                          <span className="text-secondary small">({ride.riderId?.phone})</span>
                        </div>
                        <div className="small text-light"><i className="bi bi-circle-fill text-primary small me-2"></i>Pickup: {ride.pickupLocation}</div>
                        <div className="small text-light mt-1"><i className="bi bi-geo-alt-fill text-warning me-2"></i>Drop: {ride.dropLocation}</div>
                      </div>

                      <div className="text-end">
                        <span className="text-warning fw-bold fs-5 d-block mb-2">&#8377;{ride.fare}</span>
                        <button onClick={() => handleAcceptRide(ride._id)} className="btn btn-success btn-sm px-4">
                          Accept Dispatch <i className="bi bi-check-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Log */}
        <div className="glass-panel p-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h4 className="fw-bold text-white mb-4">My Concluded Trips</h4>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <p>You haven't completed any rides yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>RIDER</th>
                    <th>PICKUP</th>
                    <th>DROP</th>
                    <th>DATE</th>
                    <th>FARE</th>
                    <th>PAYMENT</th>
                    <th className="text-end">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((ride) => (
                    <tr key={ride._id} className="text-white border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="fw-semibold">{ride.riderId?.name || 'Rider Account'}</div>
                        <div className="text-secondary small">{ride.riderId?.phone}</div>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: '150px' }}>{ride.pickupLocation}</td>
                      <td className="small text-truncate" style={{ maxWidth: '150px' }}>{ride.dropLocation}</td>
                      <td className="small">{new Date(ride.bookingDate).toLocaleDateString()}</td>
                      <td className="fw-semibold text-warning">&#8377;{ride.fare}</td>
                      <td>
                        <span className={`badge px-2 py-1 rounded small ${ride.paymentStatus === 'paid' ? 'bg-success bg-opacity-15 text-success' : 'bg-danger bg-opacity-15 text-danger'}`}>
                          {ride.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end">
                        <span className="badge bg-secondary px-2 py-1 text-uppercase">{ride.status}</span>
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

export default Dhome;
