import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Unav from '../components/Unav';

const Mybookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyBookings(token);
  }, [navigate]);

  const fetchMyBookings = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/bookings/mybookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-info bg-opacity-20 text-info border border-info border-opacity-50';
      case 'completed': return 'bg-success bg-opacity-20 text-success border border-success border-opacity-50';
      case 'cancelled': return 'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-50';
      default: return 'bg-warning bg-opacity-20 text-warning border border-warning border-opacity-50';
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Unav />

      <div className="container py-5 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold text-white mb-2">My Bookings</h1>
            <p className="text-secondary mb-0">Track and view history of your booked rides</p>
          </div>
          <Link to="/cabs" className="btn btn-premium d-flex align-items-center gap-2">
            <i className="bi bi-taxi-front-fill"></i> Book New Ride
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading bookings...</span>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 glass-panel">
            <i className="bi bi-calendar-x-fill text-muted fs-1 mb-3 d-block"></i>
            <p className="text-secondary">You haven't booked any cabs yet.</p>
            <Link to="/cabs" className="btn btn-premium-outline mt-2">Browse Available Cabs</Link>
          </div>
        ) : (
          <div className="row g-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="col-lg-6">
                <div className="glass-panel p-4 position-relative overflow-hidden h-100 d-flex flex-column justify-content-between">
                  <div>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start border-bottom border-secondary border-opacity-25 pb-3 mb-3">
                      <div>
                        <h5 className="fw-bold text-white mb-1">
                          {booking.carId?.name || 'Cab Details Unavailable'}
                        </h5>
                        <span className="text-secondary small">{booking.carId?.model || 'Sedan'} &bull; <code className="text-warning">{booking.carId?.plateNumber || 'N/A'}</code></span>
                      </div>
                      <span className={`badge px-3 py-2 rounded-pill small ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Locations */}
                    <div className="mb-4">
                      <div className="d-flex align-items-start gap-3 mb-2">
                        <i className="bi bi-circle-fill text-primary small mt-1"></i>
                        <div>
                          <span className="text-secondary small d-block">PICKUP</span>
                          <span className="text-white small fw-medium">{booking.pickupLocation}</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-start gap-3">
                        <i className="bi bi-geo-alt-fill text-warning mt-1"></i>
                        <div>
                          <span className="text-secondary small d-block">DROP-OFF</span>
                          <span className="text-white small fw-medium">{booking.dropLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="row g-2 pt-3 border-top border-secondary border-opacity-25 align-items-center">
                    <div className="col-6">
                      <span className="text-secondary small d-block">BOOKING DATE</span>
                      <span className="text-light small fw-semibold">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(booking.bookingDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-secondary small d-block">TOTAL FARE</span>
                      <h4 className="fw-bold text-warning mb-0">&#8377;{booking.totalFare}</h4>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mybookings;
