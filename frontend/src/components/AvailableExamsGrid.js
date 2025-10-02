import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getPercentageClass, getLastAttemptForExam } from '../utils/helpers';
import './AvailableExamsGrid.css';

const AvailableExamsGrid = ({ availableExams, examAttempts, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading">Loading available exams...</div>;
  }

  if (availableExams.length === 0) {
    return (
      <div className="no-exams">
        <p>No exams are currently available.</p>
        <p>Check back later for new exams!</p>
      </div>
    );
  }

  return (
    <div className="exams-grid">
      {availableExams.map((exam) => {
        const lastAttempt = getLastAttemptForExam(examAttempts, exam.id);
        return (
          <div key={exam.id} className="exam-card">
            <div className="exam-header">
              <h4>{exam.title}</h4>
              <span className="exam-questions">
                {exam.question_count || 0} questions
              </span>
            </div>
            
            {exam.description && (
              <p className="exam-description">{exam.description}</p>
            )}
            
            {lastAttempt ? (
              <div className="last-attempt">
                <div className="attempt-info">
                  <span className="attempt-label">Last Score:</span>
                  <span className={`attempt-score ${getPercentageClass(lastAttempt.score_percentage)}`}>
                    {lastAttempt.score}/{lastAttempt.total_marks} ({lastAttempt.score_percentage?.toFixed(1)}%)
                  </span>
                </div>
                <div className="attempt-date">
                  Taken on {new Date(lastAttempt.started_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="no-attempt">
                <span className="no-attempt-text">Not attempted yet</span>
              </div>
            )}
            
            <div className="exam-actions">
              <button 
                className="take-exam-btn"
                onClick={() => {
                  // TODO: Implement exam taking functionality
                  alert('Exam taking feature coming soon!');
                }}
              >
                {lastAttempt ? 'Retake Exam' : 'Take Exam'}
              </button>
              {lastAttempt && (
                <button 
                  className="view-result-btn"
                  onClick={() => navigate(`/exam-review/${lastAttempt.id}`)}
                >
                  View Last Result
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailableExamsGrid;
