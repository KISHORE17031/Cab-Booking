import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Unav from '../components/Unav';

const Cabs = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCabs(token);
  }, [navigate]);

  const fetchCabs = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/cars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCars(response.data.cars);
      } else {
        setError('Failed to fetch available cabs');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching cabs data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Unav />

      <div className="container py-5 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold text-white mb-2">Available Cabs</h1>
            <p className="text-secondary mb-0">Choose the best option for your comfort and style</p>
          </div>
          <Link to="/mybookings" className="btn btn-premium-outline btn-sm">
            <i className="bi bi-list-check me-1"></i> My Bookings
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
              <span className="visually-hidden">Loading cabs...</span>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-5 glass-panel">
            <i className="bi bi-car-front-fill text-muted fs-1 mb-3 d-block"></i>
            <p className="text-secondary">No cabs registered in the system yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {cars.map((car) => (
              <div key={car._id} className="col-md-6 col-lg-4">
                <div className="glass-card h-100 overflow-hidden d-flex flex-column justify-content-between position-relative">
                  {/* Cab Image / Placeholder */}
                  <div className="position-relative" style={{ height: '180px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
                    {car.image ? (
                      <img
                        src={`https://cab-booking-g8dt.onrender.com/uploads/${car.image}`}
                        alt={car.name}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 w-100 text-warning opacity-75">
                        <i className="bi bi-taxi-front-fill" style={{ fontSize: '4.5rem' }}></i>
                      </div>
                    )}
                    <span className={`position-absolute top-3 end-3 badge px-3 py-2 rounded-pill small ${
                      car.status === 'available' ? 'bg-success bg-opacity-25 text-success border border-success' :
                      car.status === 'booked' ? 'bg-warning bg-opacity-25 text-warning border border-warning' :
                      'bg-danger bg-opacity-25 text-danger border border-danger'
                    }`} style={{ top: '15px', right: '15px' }}>
                      {car.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Cab Info */}
                  <div className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h4 className="fw-bold text-white mb-0">{car.name}</h4>
                        <span className="badge bg-secondary">{car.model}</span>
                      </div>
                      <p className="text-secondary small mb-3">Plate: <code className="text-warning">{car.plateNumber}</code></p>
                      
                      <div className="row g-2 border-top border-secondary border-opacity-25 pt-3 mb-4">
                        <div className="col-6">
                          <span className="text-secondary small d-block">SEATS</span>
                          <span className="fw-semibold text-white"><i className="bi bi-people-fill text-warning me-1"></i>{car.seats} People</span>
                        </div>
                        <div className="col-6">
                          <span className="text-secondary small d-block">FARE RATE</span>
                          <span className="fw-semibold text-white"><i className="bi bi-currency-rupee text-warning"></i>{car.pricePerKm}/km</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {car.status === 'available' ? (
                        <Link to={`/bookcab/${car._id}`} className="btn btn-premium w-100 d-flex align-items-center justify-content-center gap-2">
                          <i className="bi bi-calendar-check-fill"></i> Book Now
                        </Link>
                      ) : (
                        <button className="btn btn-secondary w-100 py-2" disabled>
                          <i className="bi bi-lock-fill"></i> Cab Not Available
                        </button>
                      )}
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

export default Cabs;
