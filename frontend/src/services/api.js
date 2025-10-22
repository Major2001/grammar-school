import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if it's a 401 on a protected route (not login/register)
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/login') && 
        !error.config?.url?.includes('/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
};

export const userAPI = {
  getProfile: () => api.get('/profile'),
  getExamAttempts: () => api.get('/exam-attempts'),
  getExamAttemptDetails: (attemptId) => api.get(`/exam-attempts/${attemptId}`),
  getAvailableExams: () => api.get('/exams?status=active&include_attempts=true'),
  getExamDetails: (examId) => api.get(`/exams/${examId}`),
  getExamQuestions: (examId) => api.get(`/exams/${examId}/questions`),
  submitGradedExam: (examId, answers) => api.post(`/submit-graded-exam/${examId}`, { answers }),
};

export default api;
