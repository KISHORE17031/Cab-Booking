import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Anav = () => {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin'));
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
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 py-2 sticky-top border-bottom border-secondary">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/ahome">
          <i className="bi bi-shield-lock-fill text-info fs-3 animate-pulse-radar"></i>
          <span className="fw-bold tracking-wide text-white">Ride<span className="text-info">Ready</span> <span className="text-muted small">Admin</span></span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
          aria-controls="adminNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/ahome">
                <i className="bi bi-graph-up me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/users">
                <i className="bi bi-people-fill me-1"></i> Users
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/bookings">
                <i className="bi bi-journal-check me-1"></i> All Bookings
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/acabs">
                <i className="bi bi-car-front me-1"></i> Manage Cabs
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/addcar">
                <i className="bi bi-plus-circle me-1"></i> Add Cab
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

            {admin && (
              <span className="text-light-50 d-none d-lg-inline-block">
                <i className="bi bi-person-badge me-1 text-info"></i>
                Admin: <strong className="text-white">{admin.username}</strong>
              </span>
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

export default Anav;
