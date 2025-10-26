import api from './api';

export const adminAPI = {
  // Get all exams
  getExams: () => api.get('/exams'),
  
  // Get specific exam
  getExam: (examId) => api.get(`/exams/${examId}`),
  
  // Create new exam
  createExam: (examData) => api.post('/exams', examData),
  
  // Delete exam
  deleteExam: (examId) => api.delete(`/exams/${examId}`),
  
  // Update exam (e.g., toggle status, update title/description)
  updateExam: (examId, updateData) => api.patch(`/exams/${examId}`, updateData),
  
  // Helper: Toggle exam status (convenience method)
  toggleExamStatus: (examId, currentStatus) => api.patch(`/exams/${examId}`, { is_active: !currentStatus }),

  // Question management
  getQuestions: (examId) => api.get(`/questions?exam_id=${examId}`),
  addQuestions: (examId, questionsData) => api.post(`/questions`, { exam_id: examId, questions: questionsData }),
  updateQuestion: (questionId, questionData) => api.patch(`/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/questions/${questionId}`),

};
