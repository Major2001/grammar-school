import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { getUser, logout } from '../utils/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // If profile fetch fails, use cached user data
        const cachedUser = getUser();
        if (cachedUser) {
          setUser(cachedUser);
        } else {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Grammar School</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Grammar School!</h2>
          <p>Your online testing platform is ready. More features coming soon!</p>
        </div>

        <div className="user-details">
          <h3>Your Profile</h3>
          <div className="profile-info">
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Member since:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
            {user?.is_admin && (
              <p><strong>Role:</strong> <span className="admin-badge">Administrator</span></p>
            )}
          </div>
        </div>

        {user?.is_admin && (
          <div className="admin-section">
            <h3>Admin Tools</h3>
            <p>Manage tests and system settings</p>
            <button 
              onClick={() => navigate('/admin')} 
              className="admin-btn"
            >
              Go to Admin Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
