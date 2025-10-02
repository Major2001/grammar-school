import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getPercentageClass } from '../utils/helpers';
import './ExamHistoryTable.css';

const ExamHistoryTable = ({ examAttempts, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading">Loading exam history...</div>;
  }

  if (examAttempts.length === 0) {
    return (
      <div className="no-attempts">
        <p>You haven't taken any exams yet.</p>
        <p>Start your learning journey today!</p>
      </div>
    );
  }

  return (
    <div className="attempts-table-container">
      <table className="attempts-table">
        <thead>
          <tr>
            <th>Exam Name</th>
            <th>Date Taken</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examAttempts.map((attempt) => (
            <tr key={attempt.id}>
              <td className="exam-name">{attempt.exam_title || 'Unknown Exam'}</td>
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
                  onClick={() => navigate(`/exam-review/${attempt.id}`)}
                  className="view-btn"
                  title="View exam details"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamHistoryTable;
