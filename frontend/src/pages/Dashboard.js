import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { getUser, logout } from '../utils/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [testAttempts, setTestAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
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

    const fetchTestAttempts = async () => {
      try {
        const response = await userAPI.getTestAttempts();
        setTestAttempts(response.data.test_attempts);
      } catch (error) {
        console.error('Failed to fetch test attempts:', error);
        setTestAttempts([]);
      } finally {
        setAttemptsLoading(false);
      }
    };

    fetchUserProfile();
    fetchTestAttempts();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPercentageClass = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
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

        <div className="test-history-section">
          <h3>Test History</h3>
          {attemptsLoading ? (
            <div className="loading">Loading test history...</div>
          ) : testAttempts.length === 0 ? (
            <div className="no-attempts">
              <p>You haven't taken any tests yet.</p>
              <p>Start your learning journey today!</p>
            </div>
          ) : (
            <div className="attempts-table-container">
              <table className="attempts-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Date Taken</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testAttempts.map((attempt) => (
                    <tr key={attempt.id}>
                      <td className="test-name">{attempt.test_title || 'Unknown Test'}</td>
                      <td className="date-taken">
                        {new Date(attempt.started_at).toLocaleDateString()}
                      </td>
                      <td className="score">
                        {attempt.score || 0} / {attempt.total_marks || 0}
                      </td>
                      <td className="percentage">
                        <span className={`percentage-badge ${getPercentageClass(attempt.score_percentage)}`}>
                          {attempt.score_percentage?.toFixed(1) || 0}%
                        </span>
                      </td>
                      <td className="duration">
                        {attempt.duration_minutes ? `${attempt.duration_minutes} min` : 'N/A'}
                      </td>
                      <td className="status">
                        <span className={`status-badge ${attempt.status}`}>
                          {attempt.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          onClick={() => navigate(`/test-review/${attempt.id}`)}
                          className="view-btn"
                          title="View test details"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
