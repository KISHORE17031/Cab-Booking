import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Anav from '../components/Anav';

const Acabedit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [model, setModel] = useState('Sedan');
  const [plateNumber, setPlateNumber] = useState('');
  const [seats, setSeats] = useState(4);
  const [pricePerKm, setPricePerKm] = useState(10);
  const [status, setStatus] = useState('available');
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/alogin');
      return;
    }
    fetchCabDetails(adminToken);
  }, [id, navigate]);

  const fetchCabDetails = async (token) => {
    try {
      const response = await axios.get(`https://cab-booking-g8dt.onrender.com/api/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const car = response.data.car;
        setName(car.name);
        setModel(car.model);
        setPlateNumber(car.plateNumber);
        setSeats(car.seats);
        setPricePerKm(car.pricePerKm);
        setStatus(car.status);
        setCurrentImage(car.image);
      } else {
        setError('Failed to fetch cab details');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setError('');
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('model', model);
    formData.append('plateNumber', plateNumber);
    formData.append('seats', seats);
    formData.append('pricePerKm', pricePerKm);
    formData.append('status', status);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await axios.put(
        `https://cab-booking-g8dt.onrender.com/api/cars/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        navigate('/acabs');
      } else {
        setError(response.data.message || 'Failed to update cab');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while updating cab');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Anav />

      <div className="container py-5 animate-fade-in-up">
        <div className="mb-4">
          <Link to="/acabs" className="text-info text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Cabs Registry
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading details...</span>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="glass-panel p-5">
                <h3 className="fw-bold text-white mb-4"><i className="bi bi-pencil-square text-info me-2"></i>Edit Cab Details</h3>

                <form onSubmit={handleUpdate}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="text-secondary small mb-1 fw-medium">CAB / VEHICLE NAME</label>
                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Toyota Corolla"
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
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          placeholder="e.g. AP39AB1234"
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
                          value={seats}
                          onChange={(e) => setSeats(Number(e.target.value))}
                          min="1"
                          max="20"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="text-secondary small mb-1 fw-medium">FARE RATE PER KM (&#8377;)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={pricePerKm}
                          onChange={(e) => setPricePerKm(Number(e.target.value))}
                          min="1"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="text-secondary small mb-1 fw-medium">CAB AVAILABILITY STATUS</label>
                        <select
                          className="form-select"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          required
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                          <option value="booked">Booked</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Area */}
                  <div className="border border-secondary border-dashed rounded p-4 text-center my-4">
                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-4">
                      {currentImage && !imageFile && (
                        <div>
                          <span className="text-secondary small d-block mb-1">Current Cab Image</span>
                          <img
                            src={`https://cab-booking-g8dt.onrender.com/uploads/${currentImage}`}
                            alt="Current"
                            className="rounded object-fit-cover"
                            style={{ width: '120px', height: '80px' }}
                          />
                        </div>
                      )}
                      <div className="text-start">
                        <label className="text-secondary small mb-1 fw-medium">UPLOAD NEW IMAGE</label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) => setImageFile(e.target.files[0])}
                          accept="image/*"
                        />
                        <span className="text-muted small">Supported: JPG, PNG, WEBP. Max 5MB.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-info w-100 py-3 text-dark fw-bold mt-2"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating Cab Info...
                      </>
                    ) : (
                      'Update Cab Info'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Acabedit;
