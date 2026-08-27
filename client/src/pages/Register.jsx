import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Primary Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider');

  // Driver Vehicle Info State
  const [carName, setCarName] = useState('');
  const [carModel, setCarModel] = useState('Sedan');
  const [plateNumber, setPlateNumber] = useState('');
  const [seats, setSeats] = useState(4);
  const [pricePerKm, setPricePerKm] = useState(12);
  const [imageFile, setImageFile] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default role from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'rider' || roleParam === 'driver') {
      setRole(roleParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('role', role);

    if (role === 'driver') {
      formData.append('carName', carName);
      formData.append('carModel', carModel);
      formData.append('plateNumber', plateNumber);
      formData.append('seats', seats);
      formData.append('pricePerKm', pricePerKm);
      if (imageFile) {
        formData.append('image', imageFile);
      }
    }

    try {
      const response = await axios.post('https://cab-booking-g8dt.onrender.com/api/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (role === 'driver') {
          navigate('/dhome');
        } else {
          navigate('/rhome');
        }
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5" style={{ backgroundColor: '#090d16' }}>
      <div className="glass-panel p-5 w-100 animate-fade-in-up" style={{ maxWidth: role === 'driver' ? '700px' : '480px', transition: 'max-width 0.4s ease' }}>
        <div className="text-center mb-4">
          <Link className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none" to="/">
            <i className="bi bi-taxi-front-fill text-warning fs-1"></i>
            <span className="fw-bold fs-2 text-white tracking-wide">Ride<span className="text-warning">Ready</span></span>
          </Link>
          <h4 className="text-white fw-bold mb-1">Create Account</h4>
          <p className="text-secondary small">Sign up to ride or drive with RideReady</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger py-2 small mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="mb-4">
            <label className="text-secondary small mb-1 fw-medium d-block text-center">I WANT TO REGISTER AS A</label>
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn py-2 fw-semibold ${role === 'rider' ? 'btn-premium' : 'btn-outline-secondary text-white'}`}
                onClick={() => setRole('rider')}
              >
                <i className="bi bi-person-circle me-1"></i> Rider
              </button>
              <button
                type="button"
                className={`btn py-2 fw-semibold ${role === 'driver' ? 'btn-premium' : 'btn-outline-secondary text-white'}`}
                onClick={() => setRole('driver')}
              >
                <i className="bi bi-steering me-1"></i> Driver
              </button>
            </div>
          </div>

          <div className="row g-3">
            {/* Primary Details columns */}
            <div className={role === 'driver' ? 'col-md-6' : 'col-12'}>
              <h5 className="text-white small fw-bold mb-3 border-bottom border-secondary pb-2">PERSONAL DETAILS</h5>
              
              <div className="mb-3">
                <label className="text-secondary small mb-1 fw-medium">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1 fw-medium">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1 fw-medium">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small mb-1 fw-medium">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Driver Vehicle Columns */}
            {role === 'driver' && (
              <div className="col-md-6 border-start border-secondary border-opacity-25 ps-md-4">
                <h5 className="text-warning small fw-bold mb-3 border-bottom border-warning pb-2">VEHICLE DETAILS</h5>

                <div className="mb-3">
                  <label className="text-secondary small mb-1 fw-medium">Car Name / Model</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Toyota Prius"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="text-secondary small mb-1 fw-medium">Car Category</label>
                  <select
                    className="form-select"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    required
                  >
                    <option value="Mini">Mini</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="text-secondary small mb-1 fw-medium">Plate Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AP39AB1234"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="text-secondary small mb-1 fw-medium">Seats</label>
                    <input
                      type="number"
                      className="form-control"
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="text-secondary small mb-1 fw-medium">Rate / KM (&#8377;)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pricePerKm}
                      onChange={(e) => setPricePerKm(Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-secondary small mb-1 fw-medium">Vehicle Photo</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    accept="image/*"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-premium w-100 py-3 mt-4 mb-4 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Creating account...
              </>
            ) : (
              <>
                Register Account <i className="bi bi-person-plus-fill"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-secondary small mb-0">
            Already have an account? <Link to="/login" className="text-warning text-decoration-none fw-semibold">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
