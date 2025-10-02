import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { getUser, logout } from '../utils/auth';
import { getPercentageClass, getLastAttemptForExam } from '../utils/helpers';
import ExamHistoryTable from '../components/ExamHistoryTable';
import AvailableExamsGrid from '../components/AvailableExamsGrid';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);
  const [availableExams, setAvailableExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
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

    const fetchAvailableExams = async () => {
      try {
        const response = await userAPI.getAvailableExams();
        setAvailableExams(response.data.exams);
      } catch (error) {
        console.error('Failed to fetch available exams:', error);
        setAvailableExams([]);
      } finally {
        setExamsLoading(false);
      }
    };

    fetchUserProfile();
    fetchExamAttempts();
    fetchAvailableExams();
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
          <p>Your online examing platform is ready. More features coming soon!</p>
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

        {/* Tabs Section */}
        <div className="exams-section">
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'available' ? 'active' : ''}`}
                onClick={() => setActiveTab('available')}
              >
                Available Exams
              </button>
              <button 
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Exam History
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === 'available' && (
              <div className="available-exams-tab">
                <AvailableExamsGrid 
                  availableExams={availableExams}
                  examAttempts={examAttempts}
                  loading={examsLoading}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="exam-history-tab">
                <ExamHistoryTable 
                  examAttempts={examAttempts}
                  loading={attemptsLoading}
                />
              </div>
            )}
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
