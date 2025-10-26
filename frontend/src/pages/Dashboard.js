import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { getUser, logout } from '../utils/auth';
import ExamHistoryTable from '../components/ExamHistoryTable';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // First, try to get cached user data
    const cachedUser = getUser();
    
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
    }
    
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // If profile fetch fails and we don't have cached user, show error
        if (!cachedUser) {
          setUser(null);
        }
        // If we have cached user, keep using it
      } finally {
        setLoading(false);
      }
    };

    const fetchExamAttempts = async () => {
      try {
        const response = await userAPI.getExamAttempts();
        setExamAttempts(response.data.exam_attempts);
      } catch (error) {
        console.error('Failed to fetch exam attempts:', error);
        setExamAttempts([]);
      } finally {
        setAttemptsLoading(false);
      }
    };

    // Only fetch profile if we don't have cached user
    if (!cachedUser) {
      fetchUserProfile();
    }
    fetchExamAttempts();
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

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Authentication Error</h2>
          <p>Unable to load user profile. Please try logging in again.</p>
          <button onClick={() => navigate('/login')} className="login-btn">
            Go to Login
          </button>
        </div>
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
          <p>View your previous exam results and grade new exams.</p>
          <button 
            onClick={() => navigate('/grade-exam')} 
            className="grade-exam-btn"
          >
            Grade New Exam
          </button>
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

        {/* Exam Results Section */}
        <div className="exams-section">
          <h3>Your Exam Results</h3>
          <div className="exam-results-content">
            <ExamHistoryTable 
              examAttempts={examAttempts}
              loading={attemptsLoading}
            />
          </div>
        </div>

        {user?.is_admin && (
          <div className="admin-section">
            <h3>Admin Tools</h3>
            <p>Manage exams and system settings</p>
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
