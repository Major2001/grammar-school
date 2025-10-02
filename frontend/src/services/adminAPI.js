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
};
