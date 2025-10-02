import React from 'react';
import './QuestionCard.css';

const QuestionCard = ({ 
  question, 
  index, 
  showAnswers = false, 
  userAnswer = null, 
  onDelete = null,
  showDeleteButton = false 
}) => {
  const formatOptions = (options) => {
    if (!options || !Array.isArray(options)) return [];
    return options;
  };

  const getAnswerStatus = () => {
    if (!showAnswers || !userAnswer) return 'not-answered';
    if (userAnswer === question.correct_answer) return 'correct';
    return 'incorrect';
  };

  const getAnswerStatusText = (status) => {
    switch (status) {
      case 'correct': return 'Correct';
      case 'incorrect': return 'Incorrect';
      case 'not-answered': return 'Not Answered';
      default: return '';
    }
  };

  const getAnswerStatusIcon = (status) => {
    switch (status) {
      case 'correct': return '✓';
      case 'incorrect': return '✗';
      case 'not-answered': return '○';
      default: return '';
    }
  };

  const answerStatus = getAnswerStatus();
  const options = formatOptions(question.options);

  return (
    <div className={`question-card ${showAnswers ? answerStatus : ''}`}>
      <div className="question-header">
        <div className="question-number">Question {index + 1}</div>
        <div className="question-info">
          {showAnswers && (
            <div className={`answer-status ${answerStatus}`}>
              <span className="status-icon">{getAnswerStatusIcon(answerStatus)}</span>
              <span className="status-text">{getAnswerStatusText(answerStatus)}</span>
            </div>
          )}
          <span className="question-marks">
            {question.marks || 1} mark{(question.marks || 1) !== 1 ? 's' : ''}
          </span>
          {showDeleteButton && onDelete && (
            <button 
              onClick={() => onDelete(question)}
              className="delete-question-btn"
              title="Delete question"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="question-content">
        <div className="question-text">
          {question.question_text}
        </div>

        {question.question_context && (
          <div className="question-context">
            <strong>Context:</strong> {question.question_context}
          </div>
        )}

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

        {/* Multiple Choice Options */}
        {question.question_type === 'multiple_choice' && options.length > 0 && (
          <div className="answer-options">
            {options.map((option, optIndex) => {
              const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
              const isUserAnswer = showAnswers && userAnswer === optionLetter;
              const isCorrectAnswer = question.correct_answer === optionLetter;
              
              return (
                <div 
                  key={optIndex} 
                  className={`option ${isUserAnswer ? 'user-answer' : ''} ${isCorrectAnswer ? 'correct-answer' : ''}`}
                >
                  <span className="option-letter">{optionLetter})</span>
                  <span className="option-text">{option}</span>
                  {showAnswers && isUserAnswer && <span className="answer-indicator">Your Answer</span>}
                  {showAnswers && isCorrectAnswer && <span className="correct-indicator">Correct Answer</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Non-Multiple Choice Answers (only show in review mode) */}
        {showAnswers && question.question_type !== 'multiple_choice' && (
          <div className="text-answers">
            <div className="answer-section">
              <strong>Your Answer:</strong>
              <div className="answer-text user-answer-text">
                {userAnswer || 'No answer provided'}
              </div>
            </div>
            <div className="answer-section">
              <strong>Correct Answer:</strong>
              <div className="answer-text correct-answer-text">
                {question.correct_answer || 'Not specified'}
              </div>
            </div>
          </div>
        )}

        {/* Question Metadata */}
        <div className="question-metadata">
          <span className="question-subject">{question.subject}</span>
          {question.difficulty && (
            <span className="question-difficulty">{question.difficulty}</span>
          )}
          <span className="question-type">{question.question_type.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
