import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Unav from '../components/Unav';

const BookCab = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimatedFare, setEstimatedFare] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCarDetails(token);
  }, [id, navigate]);

  // Dynamically estimate fare based on inputs
  useEffect(() => {
    if (car && pickup && drop) {
      const estimatedDistance = Math.max(5, Math.round((pickup.length + drop.length) * 0.8));
      setEstimatedFare(estimatedDistance * car.pricePerKm);
    } else {
      setEstimatedFare(0);
    }
  }, [pickup, drop, car]);

  const fetchCarDetails = async (token) => {
    try {
      const response = await axios.get(`https://cab-booking-g8dt.onrender.com/api/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCar(response.data.car);
      } else {
        setError('Failed to fetch cab details');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setError('');
    setBookingLoading(true);

    try {
      const response = await axios.post(
        'https://cab-booking-g8dt.onrender.com/api/bookings/book',
        {
          carId: id,
          pickupLocation: pickup,
          dropLocation: drop,
          bookingDate: date
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        navigate('/mybookings');
      } else {
        setError(response.data.message || 'Booking failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while booking cab');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Unav />

      <div className="container py-5 animate-fade-in-up">
        <div className="mb-4">
          <Link to="/cabs" className="text-warning text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Cabs
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
              <span className="visually-hidden">Loading details...</span>
            </div>
          </div>
        ) : !car ? (
          <div className="text-center py-5 text-secondary">
            <p>Cab details could not be found.</p>
          </div>
        ) : (
          <div className="row g-5">
            {/* Booking Form Panel */}
            <div className="col-lg-7">
              <div className="glass-panel p-5">
                <h3 className="fw-bold text-white mb-4">Book Your Cab</h3>
                <form onSubmit={handleBooking}>
                  <div className="mb-3">
                    <label className="text-secondary small mb-1 fw-medium">PICKUP LOCATION</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-circle"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter pickup address"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small mb-1 fw-medium">DROP-OFF LOCATION</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-geo-alt-fill text-warning"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter destination address"
                        value={drop}
                        onChange={(e) => setDrop(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-secondary small mb-1 fw-medium">PICKUP DATE & TIME</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-calendar-event"></i></span>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {estimatedFare > 0 && (
                    <div className="glass-card p-3 mb-4 d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-secondary small d-block">ESTIMATED FARE</span>
                        <span className="text-white small">Based on route distance</span>
                      </div>
                      <h3 className="fw-bold text-warning mb-0">&#8377;{estimatedFare}</h3>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-premium w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Processing Booking...
                      </>
                    ) : (
                      <>
                        Confirm Ride booking <i className="bi bi-check-circle-fill"></i>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Cab Details Preview Panel */}
            <div className="col-lg-5">
              <div className="glass-card overflow-hidden">
                <div style={{ height: '220px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', position: 'relative' }}>
                  {car.image ? (
                    <img
                      src={`https://cab-booking-g8dt.onrender.com/uploads/${car.image}`}
                      alt={car.name}
                      className="w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 w-100 text-warning opacity-75">
                      <i className="bi bi-taxi-front-fill" style={{ fontSize: '5rem' }}></i>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="badge bg-secondary mb-2">{car.model}</span>
                  <h4 className="fw-bold text-white mb-1">{car.name}</h4>
                  <p className="text-secondary small mb-4">Plate: <code className="text-warning">{car.plateNumber}</code></p>

                  <div className="row g-2 border-top border-secondary border-opacity-25 pt-3">
                    <div className="col-6">
                      <span className="text-secondary small d-block">CAPACITY</span>
                      <span className="fw-semibold text-white">{car.seats} Seats</span>
                    </div>
                    <div className="col-6">
                      <span className="text-secondary small d-block">BASE RATE</span>
                      <span className="fw-semibold text-white">&#8377;{car.pricePerKm}/km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCab;
