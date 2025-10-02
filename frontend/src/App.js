import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuestionManager from './pages/QuestionManager';
import { isAuthenticated } from './utils/auth';

function App() {
  console.log('App component rendering...');
  console.log('isAuthenticated():', isAuthenticated());
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={<LoginPage />}
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated() ? <Dashboard /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated() ? <AdminDashboard /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/admin/exams/:examId/questions" 
            element={
              isAuthenticated() ? <QuestionManager /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/exam-review/:attemptId" 
            element={
              isAuthenticated() ? <div>Exam Review Coming Soon</div> : <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
