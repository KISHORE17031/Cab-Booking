import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Rnav = () => {
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
    <nav className="navbar navbar-expand-lg navbar-dark px-3 py-2 sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/rhome">
          <i className="bi bi-taxi-front-fill text-warning fs-3 animate-pulse-radar"></i>
          <span className="fw-bold tracking-wide text-white">Ride<span className="text-warning">Ready</span></span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#riderNavbar"
          aria-controls="riderNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="riderNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/rhome">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/request-ride">
                <i className="bi bi-geo-alt-fill me-1"></i> Book a Ride
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/rhistory">
                <i className="bi bi-clock-history me-1"></i> Ride History
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Switch */}
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
                <i className="bi bi-person-circle me-1 text-warning"></i>
                Rider: <strong className="text-white">{user.name}</strong>
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

export default Rnav;
