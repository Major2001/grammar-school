import api from './api';

export const adminAPI = {
  // Get all exams
  getExams: () => api.get('/admin/exams'),
  
  // Get specific exam
  getExam: (examId) => api.get(`/admin/exams/${examId}`),
  
  // Create new exam
  createExam: (examData) => api.post('/admin/exams', examData),
  
  // Delete exam
  deleteExam: (examId) => api.delete(`/admin/exams/${examId}`),
  
  // Toggle exam status
  toggleExamStatus: (examId) => api.patch(`/admin/exams/${examId}/toggle`),

  // Question management
  getExamQuestions: (examId) => api.get(`/admin/exams/${examId}/questions`),
  addQuestionsToExam: (examId, questionsData) => api.post(`/admin/exams/${examId}/questions`, questionsData),
  updateQuestion: (examId, questionId, questionData) => api.put(`/admin/exams/${examId}/questions/${questionId}`, questionData),
  deleteQuestion: (examId, questionId) => api.delete(`/admin/exams/${examId}/questions/${questionId}`),

  // Diagram upload
  uploadDiagram: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload-diagram', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
