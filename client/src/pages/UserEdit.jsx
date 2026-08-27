import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Anav from '../components/Anav';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('rider');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/alogin');
      return;
    }
    fetchUserDetails(adminToken);
  }, [id, navigate]);

  const fetchUserDetails = async (token) => {
    try {
      const response = await axios.get('https://cab-booking-g8dt.onrender.com/api/admins/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const foundUser = response.data.users.find(u => u._id === id);
        if (foundUser) {
          setName(foundUser.name);
          setEmail(foundUser.email);
          setPhone(foundUser.phone);
          setRole(foundUser.role);
        } else {
          setError('User not found');
        }
      } else {
        setError('Failed to load user list');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching user data from server');
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

    try {
      const response = await axios.put(
        `https://cab-booking-g8dt.onrender.com/api/admins/users/${id}`,
        { name, email, phone, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        navigate('/users');
      } else {
        setError(response.data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating user profile');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#090d16' }}>
      <Anav />

      <div className="container py-5 animate-fade-in-up">
        <div className="mb-4">
          <Link to="/users" className="text-info text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Users List
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="glass-panel p-5">
                <h3 className="fw-bold text-white mb-4"><i className="bi bi-pencil-square text-warning me-2"></i>Edit User Profile</h3>
                
                <form onSubmit={handleUpdate}>
                  <div className="mb-3">
                    <label className="text-secondary small mb-1 fw-medium">FULL NAME</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small mb-1 fw-medium">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small mb-1 fw-medium">PHONE NUMBER</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-secondary small mb-1 fw-medium">USER ROLE</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="rider">Rider</option>
                      <option value="driver">Driver</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-info w-100 py-3 text-dark fw-bold"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving Changes...
                      </>
                    ) : (
                      'Save Profile Changes'
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

export default UserEdit;
