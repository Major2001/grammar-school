import api from './api';

export const adminAPI = {
  // Get all tests
  getTests: () => api.get('/admin/tests'),
  
  // Get specific test
  getTest: (testId) => api.get(`/admin/tests/${testId}`),
  
  // Upload new test
  uploadTest: (formData) => api.post('/admin/tests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Delete test
  deleteTest: (testId) => api.delete(`/admin/tests/${testId}`),
  
  // Toggle test status
  toggleTestStatus: (testId) => api.patch(`/admin/tests/${testId}/toggle`),
};
