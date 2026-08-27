import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Alogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://cab-booking-g8dt.onrender.com/api/admins/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        navigate('/ahome');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3" style={{ backgroundColor: '#090d16' }}>
      <div className="glass-panel p-5 w-100 animate-fade-in-up" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-5">
          <Link className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none" to="/">
            <i className="bi bi-shield-lock-fill text-info fs-1"></i>
            <span className="fw-bold fs-2 text-white tracking-wide">Ucab <span className="text-info fs-5">Admin</span></span>
          </Link>
          <h4 className="text-white fw-bold mb-1">Admin Portal</h4>
          <p className="text-secondary small">Sign in to manage system and bookings</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger py-2 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-secondary small mb-1 fw-medium">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-envelope-fill"></i></span>
              <input
                type="email"
                className="form-control"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-secondary small mb-1 fw-medium">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-lock-fill"></i></span>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 py-3 mb-4 d-flex align-items-center justify-content-center gap-2 text-dark fw-bold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              <>
                Admin Login <i className="bi bi-box-arrow-in-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-secondary small mb-0">
            Need an admin account? <Link to="/aregister" className="text-info text-decoration-none fw-semibold">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Alogin;
