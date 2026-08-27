import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Rnav from '../components/Rnav';

const Rhistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHistory(token);
  }, [navigate]);

  const fetchHistory = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/rider/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setHistory(response.data.rides);
      } else {
        setError('Failed to load ride history');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return 'bg-info bg-opacity-20 text-info border border-info border-opacity-50';
      case 'started': return 'bg-primary bg-opacity-20 text-primary border border-primary border-opacity-50';
      case 'completed': return 'bg-success bg-opacity-20 text-success border border-success border-opacity-50';
      case 'cancelled': return 'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-50';
      default: return 'bg-warning bg-opacity-20 text-warning border border-warning border-opacity-50'; // pending
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Rnav />

      <div className="container py-5 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold text-white mb-2">My Ride History</h1>
            <p className="text-secondary mb-0">List of all requested cab rides and digital receipts</p>
          </div>
          <Link to="/request-ride" className="btn btn-premium d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle"></i> Request New Ride
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-5 glass-panel">
            <i className="bi bi-clock-history text-muted fs-1 mb-3 d-block"></i>
            <p className="text-secondary">No ride history found.</p>
          </div>
        ) : (
          <div className="glass-panel p-4">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>CAB VEHICLE</th>
                    <th>DRIVER</th>
                    <th>PICKUP ADDRESS</th>
                    <th>DROP ADDRESS</th>
                    <th>DATE</th>
                    <th>FARE</th>
                    <th>PAYMENT</th>
                    <th>STATUS</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((ride) => (
                    <tr key={ride._id} className="text-white border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="fw-semibold">{ride.carId?.name || 'Cab Details'}</div>
                        <div className="text-secondary small">{ride.carId?.model} &bull; <code className="text-warning">{ride.carId?.plateNumber}</code></div>
                      </td>
                      <td>
                        {ride.driverId ? (
                          <div className="small">
                            <div className="fw-medium">{ride.driverId?.name}</div>
                            <div className="text-muted">{ride.driverId?.phone}</div>
                          </div>
                        ) : (
                          <span className="text-muted small">Not Assigned</span>
                        )}
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: '120px' }}>{ride.pickupLocation}</td>
                      <td className="small text-truncate" style={{ maxWidth: '120px' }}>{ride.dropLocation}</td>
                      <td className="small">{new Date(ride.bookingDate).toLocaleDateString()}</td>
                      <td className="fw-semibold text-warning">&#8377;{ride.fare}</td>
                      <td>
                        <span className={`badge px-2 py-1 rounded small ${ride.paymentStatus === 'paid' ? 'bg-success bg-opacity-15 text-success' : 'bg-danger bg-opacity-15 text-danger'}`}>
                          {ride.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge px-3 py-2 rounded-pill small ${getStatusBadge(ride.status)}`}>
                          {ride.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end">
                        {['pending', 'accepted', 'started'].includes(ride.status) ? (
                          <Link to={`/ridetracking/${ride._id}`} className="btn btn-warning text-dark btn-sm fw-bold">
                            Track <i className="bi bi-arrow-right"></i>
                          </Link>
                        ) : ride.status === 'completed' && ride.paymentStatus === 'unpaid' ? (
                          <Link to={`/ridetracking/${ride._id}`} className="btn btn-premium btn-sm">
                            Pay Fare
                          </Link>
                        ) : (
                          <span className="text-muted small">Ride Concluded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rhistory;
