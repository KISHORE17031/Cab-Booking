import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Anav from '../components/Anav';

const Acabs = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/alogin');
      return;
    }
    fetchCabs(adminToken);
  }, [navigate]);

  const fetchCabs = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/cars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCars(response.data.cars);
      } else {
        setError('Failed to fetch cabs list');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cab?')) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await axios.delete(`https://cab-booking-g8dt.onrender.com/api/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSuccess('Cab deleted successfully');
        setCars(cars.filter(c => c._id !== id));
      } else {
        setError(response.data.message || 'Failed to delete cab');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while deleting cab');
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Anav />

      <div className="container py-5 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold text-white mb-2">Manage Cabs</h1>
            <p className="text-secondary mb-0">Add, edit, or remove cabs in the fleet</p>
          </div>
          <Link to="/addcar" className="btn btn-premium d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle-fill"></i> Add New Cab
          </Link>
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
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading cabs...</span>
            </div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-5 glass-panel">
            <i className="bi bi-car-front-fill text-muted fs-1 mb-3 d-block"></i>
            <p className="text-secondary">No cabs registered in the system yet.</p>
            <Link to="/addcar" className="btn btn-premium mt-2">Add First Cab</Link>
          </div>
        ) : (
          <div className="glass-panel p-4">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>PREVIEW</th>
                    <th>NAME</th>
                    <th>MODEL / TYPE</th>
                    <th>PLATE NUMBER</th>
                    <th>SEATS</th>
                    <th>FARE / KM</th>
                    <th>STATUS</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car._id} className="text-white border-bottom border-secondary border-opacity-10">
                      <td>
                        <div className="bg-dark rounded d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '60px', height: '40px' }}>
                          {car.image ? (
                            <img
                              src={`https://cab-booking-g8dt.onrender.com/uploads/${car.image}`}
                              alt={car.name}
                              className="w-100 h-100 object-fit-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '';
                                e.target.innerHTML = '<i class="bi bi-car-front text-warning"></i>';
                              }}
                            />
                          ) : (
                            <i className="bi bi-taxi-front text-warning fs-5"></i>
                          )}
                        </div>
                      </td>
                      <td className="fw-semibold">{car.name}</td>
                      <td><span className="badge bg-secondary">{car.model}</span></td>
                      <td><code className="text-warning">{car.plateNumber}</code></td>
                      <td>{car.seats} Seats</td>
                      <td className="fw-medium">&#8377;{car.pricePerKm}</td>
                      <td>
                        <span className={`badge text-uppercase px-2 py-1 rounded-pill ${
                          car.status === 'available' ? 'bg-success bg-opacity-20 text-success border border-success border-opacity-50' :
                          car.status === 'booked' ? 'bg-warning bg-opacity-20 text-warning border border-warning border-opacity-50' :
                          'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-50'
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Link to={`/acabedit/${car._id}`} className="btn btn-outline-info btn-sm">
                            <i className="bi bi-pencil-square"></i> Edit
                          </Link>
                          <button onClick={() => handleDelete(car._id)} className="btn btn-outline-danger btn-sm">
                            <i className="bi bi-trash-fill"></i> Delete
                          </button>
                        </div>
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

export default Acabs;
