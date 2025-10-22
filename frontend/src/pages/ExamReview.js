import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { getUser, logout } from '../utils/auth';
import QuestionCard from '../components/QuestionCard';
import './ExamReview.css';

const ExamReview = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamReviewData();
  }, [attemptId]);

  const fetchExamReviewData = async () => {
    try {
      const response = await userAPI.getExamAttemptDetails(attemptId);
      const { attempt: attemptData, exam: examData, questions: questionsData } = response.data;
      
      setAttempt(attemptData);
      setExam(examData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch exam review data:', error);
      if (error.response?.status === 404) {
        setError('Exam attempt not found');
      } else if (error.response?.status === 403) {
        setError('Access denied');
      } else {
        setError('Failed to load exam review');
      }
    } finally {
      setLoading(false);
    }
  };

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
      <div className="exam-review-container">
        <div className="loading">Loading exam review...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-review-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-review-container">
      <header className="exam-review-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Exam Review</h1>
          </div>
          <div className="header-right">
            <span>Welcome, {getUser()?.username}!</span>
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="exam-review-main">
        {/* Exam Summary */}
        <div className="exam-summary">
          <h2>{exam?.title}</h2>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Score:</span>
              <span className="stat-value">{attempt?.score || 0} / {attempt?.total_marks || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Percentage:</span>
              <span className={`stat-value percentage-${getPercentageClass(attempt?.score_percentage)}`}>
                {attempt?.score_percentage?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="stat">
            </div>
            <div className="stat">
              <span className="stat-label">Status:</span>
              <span className={`stat-value status-${attempt?.status}`}>
                {attempt?.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="questions-review">
          <h3>Questions & Answers</h3>
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              showAnswers={true}
              userAnswer={question.user_answer}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExamReview;
