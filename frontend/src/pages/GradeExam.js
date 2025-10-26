import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import './GradeExam.css';

const GradeExam = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAvailableExams();
      setExams(response.data.exams);
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = async (examId) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      // Get exam details with questions
      const response = await userAPI.getExamDetails(examId);
      const exam = response.data.exam;
      
      // Get questions for this exam
      const questionsResponse = await userAPI.getExamQuestions(examId);
      const examQuestions = questionsResponse.data.questions;
      
      setSelectedExam(exam);
      setQuestions(examQuestions);
      setAnswers({});
    } catch (err) {
      console.error('Failed to load exam questions:', err);
      setError('Failed to load exam questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!selectedExam) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await userAPI.submitGradedExam(selectedExam.id, answers);
      setResult(response.data);
    } catch (err) {
      console.error('Failed to submit exam:', err);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleGradeNew = () => {
    setSelectedExam(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <div className="grade-exam-container">
        <div className="result-container">
          <h1>Exam Results</h1>
          <div className="result-card">
            <h2>{selectedExam?.title}</h2>
            <div className="score-display">
              <div className="score-main">
                <span className="score-number">{result.score}</span>
                <span className="score-total">/ {result.total_marks}</span>
              </div>
              <div className="score-percentage">
                {result.score_percentage}%
              </div>
            </div>
            <div className="result-details">
              <p><strong>Questions Answered:</strong> {Object.keys(answers).length} / {questions.length}</p>
              <p><strong>Correct Answers:</strong> {result.score}</p>
              <p><strong>Total Questions:</strong> {questions.length}</p>
            </div>
            <div className="result-actions">
              <button onClick={handleGradeNew} className="grade-new-btn">
                Grade Another Exam
              </button>
              <button onClick={handleGoBack} className="back-btn">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grade-exam-container">
      <header className="grade-exam-header">
        <button onClick={handleGoBack} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Grade Exam</h1>
      </header>

      <main className="grade-exam-content">
        {!selectedExam ? (
          <div className="exam-selection">
            <h2>Select an Exam to Grade</h2>
            {loading ? (
              <div className="loading">Loading exams...</div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={fetchExams} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="exams-grid">
                {exams.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.title}</h3>
                    <p className="exam-description">{exam.description}</p>
                    <div className="exam-stats">
                      <span>{exam.question_count} questions</span>
                      <span>{exam.total_marks} marks</span>
                    </div>
                    <button 
                      onClick={() => handleExamSelect(exam.id)}
                      className="select-exam-btn"
                    >
                      Grade This Exam
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grading-interface">
            <div className="exam-header">
              <h2>{selectedExam.title}</h2>
              <div className="exam-info">
                <span>Question {Object.keys(answers).length + 1} of {questions.length}</span>
                <span>{Object.keys(answers).length} answered</span>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading questions...</div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => handleExamSelect(selectedExam.id)} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="questions-container">
                {questions.map((question, index) => (
                  <div key={question.id} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <span className="question-marks">{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
                    </div>
                    <div className="question-text">
                      {question.question_text}
                    </div>
                    <div className="answer-options">
                      {question.options && question.options.map((option, optionIndex) => {
                        const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                        const isSelected = answers[question.id] === optionLetter;
                        return (
                          <label key={optionIndex} className={`option-label ${isSelected ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={optionLetter}
                              checked={isSelected}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="option-radio"
                            />
                            <span className="option-letter">{optionLetter}</span>
                            <span className="option-text">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="submit-section">
              <div className="progress-info">
                <span>Progress: {Object.keys(answers).length} / {questions.length} questions answered</span>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="submit-btn"
              >
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GradeExam;
