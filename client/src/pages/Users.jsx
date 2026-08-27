import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Anav from '../components/Anav';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/alogin');
      return;
    }
    fetchUsers(adminToken);
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/admins/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError('Failed to fetch users list');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await axios.delete(`https://cab-booking-g8dt.onrender.com/api/admins/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSuccess('User deleted successfully');
        setUsers(users.filter(u => u._id !== id));
      } else {
        setError(response.data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while deleting user');
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Anav />

      <div className="container py-5 animate-fade-in-up">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold text-white mb-2">Platform Users</h1>
            <p className="text-secondary mb-0">Manage registered Riders and Drivers accounts</p>
          </div>
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
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 glass-panel">
            <i className="bi bi-people-fill text-muted fs-1 mb-3 d-block"></i>
            <p className="text-secondary">No users found in database.</p>
          </div>
        ) : (
          <div className="glass-panel p-4">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>NAME</th>
                    <th>EMAIL ADDRESS</th>
                    <th>PHONE NUMBER</th>
                    <th>ROLE</th>
                    <th>CONSOLE PRESENCE</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="text-white border-bottom border-secondary border-opacity-10">
                      <td className="fw-semibold">
                        <i className={`bi ${user.role === 'driver' ? 'bi-steering text-success' : 'bi-person-fill text-warning'} me-2`}></i>
                        {user.name}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`badge px-2 py-1 rounded-pill text-uppercase ${
                          user.role === 'driver' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-30' : 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.role === 'driver' ? (
                          <span className={`badge px-2 py-1 rounded ${user.isAvailable ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-muted'}`}>
                            {user.isAvailable ? 'Online / Available' : 'Offline / Busy'}
                          </span>
                        ) : (
                          <span className="text-muted small">N/A</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Link to={`/useredit/${user._id}`} className="btn btn-outline-warning btn-sm">
                            <i className="bi bi-pencil-square"></i> Edit
                          </Link>
                          <button onClick={() => handleDelete(user._id)} className="btn btn-outline-danger btn-sm">
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

export default Users;
