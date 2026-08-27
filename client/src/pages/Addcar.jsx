import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Anav from '../components/Anav';

const Addcar = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [model, setModel] = useState('Sedan');
  const [plateNumber, setPlateNumber] = useState('');
  const [seats, setSeats] = useState(4);
  const [pricePerKm, setPricePerKm] = useState(10);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/alogin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('model', model);
    formData.append('plateNumber', plateNumber);
    formData.append('seats', seats);
    formData.append('pricePerKm', pricePerKm);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await axios.post('https://cab-booking-g8dt.onrender.com/api/cars', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        navigate('/acabs');
      } else {
        setError(response.data.message || 'Failed to add cab');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving cab details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Anav />

      <div className="container py-5 animate-fade-in-up">
        <div className="mb-4">
          <Link to="/ahome" className="text-info text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="glass-panel p-5">
              <h3 className="fw-bold text-white mb-4"><i className="bi bi-plus-circle text-info me-2"></i>Register New Cab</h3>

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="text-secondary small mb-1 fw-medium">CAB / VEHICLE NAME</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Toyota Camry"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-secondary small mb-1 fw-medium">CAB TYPE / MODEL</label>
                      <select
                        className="form-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                      >
                        <option value="Mini">Mini</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="text-secondary small mb-1 fw-medium">REGISTRATION PLATE NUMBER</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. MH12AB1234"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="text-secondary small mb-1 fw-medium">PASSENGER SEATS CAPACITY</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="20"
                        value={seats}
                        onChange={(e) => setSeats(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-secondary small mb-1 fw-medium">FARE RATE PER KM (&#8377;)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={pricePerKm}
                        onChange={(e) => setPricePerKm(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-secondary small mb-1 fw-medium">CAB IMAGE</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        accept="image/*"
                      />
                      <span className="text-muted small">JPG, PNG, or WEBP. Max size 5MB.</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 py-3 text-dark fw-bold mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Registering Cab...
                    </>
                  ) : (
                    'Add Cab to Fleet'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addcar;
