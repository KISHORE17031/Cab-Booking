import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Aregister = () => {
  const [username, setUsername] = useState('');
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
      const response = await axios.post('https://cab-booking-g8dt.onrender.com/api/admins/register', {
        username,
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        navigate('/ahome');
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
      <div className="glass-panel p-5 w-100 animate-fade-in-up" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <Link className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none" to="/">
            <i className="bi bi-shield-lock-fill text-info fs-1"></i>
            <span className="fw-bold fs-2 text-white tracking-wide">Ucab <span className="text-info fs-5">Admin</span></span>
          </Link>
          <h4 className="text-white fw-bold mb-1">Admin Registration</h4>
          <p className="text-secondary small">Sign up to access administrative panels</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger py-2 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-secondary small mb-1 fw-medium">Admin Username</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-person-badge-fill"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="Create password"
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
                Creating account...
              </>
            ) : (
              <>
                Register Admin <i className="bi bi-shield-plus"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-secondary small mb-0">
            Already have an admin account? <Link to="/alogin" className="text-info text-decoration-none fw-semibold">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Aregister;
