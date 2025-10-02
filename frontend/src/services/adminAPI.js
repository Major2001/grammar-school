import api from './api';

export const adminAPI = {
  // Get all tests
  getTests: () => api.get('/admin/tests'),
  
  // Get specific test
  getTest: (testId) => api.get(`/admin/tests/${testId}`),
  
  // Create new test
  createTest: (testData) => api.post('/admin/tests', testData),
  
  // Delete test
  deleteTest: (testId) => api.delete(`/admin/tests/${testId}`),
  
  // Toggle test status
  toggleTestStatus: (testId) => api.patch(`/admin/tests/${testId}/toggle`),

  // Question management
  getTestQuestions: (testId) => api.get(`/admin/tests/${testId}/questions`),
  addQuestionsToTest: (testId, questionsData) => api.post(`/admin/tests/${testId}/questions`, questionsData),
  updateQuestion: (testId, questionId, questionData) => api.put(`/admin/tests/${testId}/questions/${questionId}`, questionData),
  deleteQuestion: (testId, questionId) => api.delete(`/admin/tests/${testId}/questions/${questionId}`),

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
