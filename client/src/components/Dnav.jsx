import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dnav = ({ isAvailable, onToggleAvailability }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isLight, setIsLight] = useState(document.body.classList.contains('light-theme'));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      setIsLight(true);
    } else {
      document.body.classList.remove('light-theme');
      setIsLight(false);
    }
  }, []);

  const toggleTheme = () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      setIsLight(false);
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      setIsLight(true);
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 py-2 sticky-top border-bottom border-secondary">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/dhome">
          <i className="bi bi-steering text-success fs-3 animate-pulse-radar"></i>
          <span className="fw-bold tracking-wide text-white">Ride<span className="text-success">Ready</span> <span className="text-muted small">Driver</span></span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#driverNavbar"
          aria-controls="driverNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="driverNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/dhome">
                <i className="bi bi-speedometer2 me-1"></i> Driver Console
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '34px', height: '34px', border: '1px solid var(--glass-border)' }}
              title="Toggle Light/Dark Theme"
            >
              <i className={`bi ${isLight ? 'bi-moon-stars-fill text-info' : 'bi-sun-fill text-warning'}`}></i>
            </button>

            {user && (
              <span className="text-light-50 d-none d-lg-inline-block">
                <i className="bi bi-person-badge-fill me-1 text-success"></i>
                Driver: <strong className="text-white">{user.name}</strong>
              </span>
            )}
            
            {onToggleAvailability && (
              <button 
                onClick={onToggleAvailability} 
                className={`btn btn-sm px-3 rounded-pill d-flex align-items-center gap-1 ${
                  isAvailable ? 'btn-success bg-opacity-25 text-success border border-success' : 'btn-secondary bg-opacity-25 text-secondary border border-secondary'
                }`}
              >
                <span className={`spinner-grow spinner-grow-sm me-1 ${isAvailable ? 'text-success' : 'text-secondary'}`} style={{ width: '8px', height: '8px' }}></span>
                {isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            )}

            <button className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Dnav;
