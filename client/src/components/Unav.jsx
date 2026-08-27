import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Unav = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3 py-2 sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/uhome">
          <i className="bi bi-taxi-front-fill text-warning fs-3 animate-pulse"></i>
          <span className="fw-bold tracking-wide text-white">U<span className="text-warning">cab</span></span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#userNavbar"
          aria-controls="userNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="userNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/uhome">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/cabs">
                <i className="bi bi-car-front-fill me-1"></i> Available Cabs
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light px-3" to="/mybookings">
                <i className="bi bi-list-task me-1"></i> My Bookings
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user && (
              <span className="text-light-50 d-none d-lg-inline-block">
                <i className="bi bi-person-circle me-1 text-warning"></i>
                Welcome, <strong className="text-white">{user.name}</strong>
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

export default Unav;
