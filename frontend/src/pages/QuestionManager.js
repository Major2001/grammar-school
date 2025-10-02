import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/adminAPI';
import { getUser, logout } from '../utils/auth';
import './QuestionManager.css';

const QuestionManager = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [questionsInput, setQuestionsInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, questionId: null, questionText: '' });

  useEffect(() => {
    fetchTestAndQuestions();
  }, [testId]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 2500);
  };

  const fetchTestAndQuestions = async () => {
    try {
      const [testResponse, questionsResponse] = await Promise.all([
        adminAPI.getTest(testId),
        adminAPI.getTestQuestions(testId)
      ]);
      setTest(testResponse.data.test);
      const questionsData = questionsResponse.data.questions || [];
      console.log('Questions data:', questionsData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load test data';
      showToast(`Load failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestions = async (e) => {
    e.preventDefault();
    if (!questionsInput.trim()) {
      showToast('Please enter questions data', 'error');
      return;
    }

    setAdding(true);
    try {
      // Parse the JSON input
      const questionsData = JSON.parse(questionsInput);
      
      // Ensure it's an array
      const questionsArray = Array.isArray(questionsData) ? questionsData : [questionsData];
      
      await adminAPI.addQuestionsToTest(testId, { questions: questionsArray });
      setQuestionsInput('');
      setShowAddForm(false);
      fetchTestAndQuestions();
      showToast(`Successfully added ${questionsArray.length} question(s)`, 'success');
    } catch (error) {
      console.error('Failed to add questions:', error);
      if (error.name === 'SyntaxError') {
        showToast('Invalid JSON format. Please check your input.', 'error');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        showToast(`Add failed: ${errorMessage}`, 'error');
      }
    } finally {
      setAdding(false);
    }
  };

  const showDeleteModal = (questionId, questionText) => {
    setDeleteModal({ show: true, questionId, questionText });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ show: false, questionId: null, questionText: '' });
  };

  const handleDeleteQuestion = async () => {
    try {
      await adminAPI.deleteQuestion(testId, deleteModal.questionId);
      fetchTestAndQuestions();
      hideDeleteModal();
      showToast('Question deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete question:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete question';
      showToast(`Delete failed: ${errorMessage}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="question-manager">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="question-manager">
        <div className="error">Test not found</div>
      </div>
    );
  }

  return (
    <div className="question-manager">
      <header className="question-header">
        <div className="header-content">
          <h1>Manage Questions: {test.title}</h1>
          <div className="header-actions">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="add-questions-btn"
            >
              {showAddForm ? 'Cancel' : 'Add Questions'}
            </button>
            <button onClick={() => navigate('/admin')} className="back-btn">
              Back to Admin
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="question-main">
        {showAddForm && (
          <div className="add-questions-section">
            <h2>Add Questions</h2>
            <p className="instructions">
              Enter questions as JSON array. Each question should have the following structure:
            </p>
            <pre className="json-example">
{`{
  "question_text": "What is the area of the triangle shown?",
  "question_type": "multiple_choice",
  "subject": "math",
  "question_context": "Geometry - Area calculation",
  "difficulty": "medium",
  "marks": 2,
  "diagram_path": "https://example.com/diagrams/triangle.png",
  "options": ["12 sq cm", "15 sq cm", "18 sq cm", "20 sq cm"],
  "correct_answer": "15 sq cm"
}`}
            </pre>
            <form onSubmit={handleAddQuestions} className="add-questions-form">
              <div className="form-group">
                <label htmlFor="questionsInput">Questions JSON:</label>
                <textarea
                  id="questionsInput"
                  value={questionsInput}
                  onChange={(e) => setQuestionsInput(e.target.value)}
                  rows="15"
                  placeholder="Enter questions as JSON array..."
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={adding} className="submit-btn">
                  {adding ? 'Adding...' : 'Add Questions'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="questions-section">
          <h2>Questions ({questions.length})</h2>
          {questions.length === 0 ? (
            <div className="no-questions">
              <p>No questions added yet.</p>
              <button onClick={() => setShowAddForm(true)} className="add-questions-btn">
                Add First Question
              </button>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h3>Question {index + 1}</h3>
                    <div className="question-meta">
                      <span className={`question-type ${question.question_type || ''}`}>
                        {String(question.question_type || 'unknown')}
                      </span>
                      <span className={`question-subject ${question.subject || ''}`}>
                        {String(question.subject || 'general')}
                      </span>
                      {question.difficulty && (
                        <span className={`question-difficulty ${question.difficulty}`}>
                          {String(question.difficulty)}
                        </span>
                      )}
                      <span className="question-marks">
                        {question.marks || 1} mark{(question.marks || 1) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {question.question_context && (
                    <div className="question-context">
                      <strong>Context:</strong> {String(question.question_context)}
                    </div>
                  )}
                  
                  <div className="question-text">
                    {String(question.question_text || '')}
                  </div>
                  
                  {question.diagram_path && (
                    <div className="question-diagram">
                      <img 
                        src={question.diagram_path} 
                        alt="Question diagram"
                        className="diagram-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="diagram-error" style={{display: 'none'}}>
                        <span>📷 Diagram not available</span>
                        <small>Path: {question.diagram_path}</small>
                      </div>
                    </div>
                  )}
                  
                  {question.options && Array.isArray(question.options) && (
                    <div className="question-options">
                      <strong>Options:</strong>
                      <ul>
                        {question.options.map((option, idx) => (
                          <li key={idx} className={option === question.correct_answer ? 'correct' : ''}>
                            {String(option)} {option === question.correct_answer && '✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {question.correct_answer && !question.options && (
                    <div className="correct-answer">
                      <strong>Correct Answer:</strong> {String(question.correct_answer)}
                    </div>
                  )}
                  
                  <div className="question-actions">
                    <button 
                      onClick={() => showDeleteModal(question.id, question.question_text)}
                      className="delete-question-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={hideDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Question</h3>
              <button className="modal-close" onClick={hideDeleteModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this question?</p>
              <p className="question-preview">"{deleteModal.questionText}"</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={hideDeleteModal}>
                Cancel
              </button>
              <button className="modal-delete" onClick={handleDeleteQuestion}>
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
