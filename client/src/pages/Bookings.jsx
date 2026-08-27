import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Anav from '../components/Anav';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/alogin');
      return;
    }
    fetchBookings(adminToken);
  }, [navigate]);

  const fetchBookings = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/rides/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBookings(response.data.rides);
      } else {
        setError('Failed to fetch bookings list');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setError('');
    setSuccess('');

    try {
      const response = await axios.put(
        `https://cab-booking-g8dt.onrender.com/api/rides/admin/status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(`Booking status updated to ${newStatus}`);
        setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
      } else {
        setError(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while updating status');
    }
  };

  const getStatusRowClass = (status) => {
    switch (status) {
      case 'completed': return 'border-start border-success border-4';
      case 'accepted': return 'border-start border-info border-4';
      case 'started': return 'border-start border-primary border-4';
      case 'cancelled': return 'border-start border-danger border-4';
      default: return 'border-start border-warning border-4';
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Anav />

      <div className="container py-5 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold text-white mb-2">Bookings Registry</h1>
            <p className="text-secondary mb-0">Monitor and update status of all ride bookings</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success bg-success bg-opacity-10 border-success text-success mb-4" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i> {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 glass-panel">
            <i className="bi bi-journal-x text-muted fs-1 mb-3 d-block"></i>
            <p className="text-secondary">No ride bookings found in database.</p>
          </div>
        ) : (
          <div className="glass-panel p-4">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>RIDER DETAILS</th>
                    <th>DRIVER DETAILS</th>
                    <th>CAB DETAILS</th>
                    <th>PICKUP / DROP</th>
                    <th>DATE</th>
                    <th>FARE</th>
                    <th>STATUS</th>
                    <th className="text-end">MANAGE STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className={`text-white border-bottom border-secondary border-opacity-10 ${getStatusRowClass(booking.status)}`}>
                      <td>
                        <div className="fw-semibold">{booking.riderId?.name || 'Deleted Rider'}</div>
                        <div className="text-secondary small">{booking.riderId?.phone || 'N/A'}</div>
                      </td>
                      <td>
                        {booking.driverId ? (
                          <>
                            <div className="fw-semibold">{booking.driverId?.name}</div>
                            <div className="text-secondary small">{booking.driverId?.phone}</div>
                          </>
                        ) : (
                          <span className="text-muted small">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{booking.carId?.name || 'Deleted Cab'}</div>
                        <div className="text-secondary small">{booking.carId?.model} &bull; <code className="text-warning">{booking.carId?.plateNumber}</code></div>
                      </td>
                      <td>
                        <div className="small"><i className="bi bi-circle-fill text-primary me-1 small"></i> {booking.pickupLocation}</div>
                        <div className="small mt-1"><i className="bi bi-geo-alt-fill text-warning me-1"></i> {booking.dropLocation}</div>
                      </td>
                      <td className="small">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="fw-bold text-warning">&#8377;{booking.fare}</td>
                      <td>
                        <span className={`badge text-uppercase px-2 py-1 rounded-pill ${
                          booking.status === 'accepted' ? 'bg-info bg-opacity-20 text-info border border-info border-opacity-50' :
                          booking.status === 'started' ? 'bg-primary bg-opacity-20 text-primary border border-primary border-opacity-50' :
                          booking.status === 'completed' ? 'bg-success bg-opacity-20 text-success border border-success border-opacity-50' :
                          booking.status === 'cancelled' ? 'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-50' :
                          'bg-warning bg-opacity-20 text-warning border border-warning border-opacity-50'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="started">Started</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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

export default Bookings;
