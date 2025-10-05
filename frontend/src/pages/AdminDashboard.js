import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/adminAPI';
import { getUser, logout } from '../utils/auth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, examId: null, examTitle: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 2500);
  };

  const fetchExams = async () => {
    try {
      const response = await adminAPI.getExams();
      setExams(response.data.exams);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      if (error.response?.status === 403) {
        alert('Admin access required');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!createForm.title) {
      showToast('Please enter a exam title', 'error');
      return;
    }

    setCreating(true);
    try {
      await adminAPI.createExam({
        title: createForm.title,
        description: createForm.description
      });
      setCreateForm({ title: '', description: '' });
      setShowCreateForm(false);
      fetchExams();
      showToast('Exam created successfully!', 'success');
    } catch (error) {
      console.error('Create failed:', error);
      showToast('Create failed: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const showDeleteModal = (examId, examTitle) => {
    setDeleteModal({ show: true, examId, examTitle });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ show: false, examId: null, examTitle: '' });
  };

  const handleDeleteExam = async () => {
    try {
      await adminAPI.deleteExam(deleteModal.examId);
      fetchExams();
      hideDeleteModal();
      showToast('Exam deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Delete failed: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    }
  };

  const handleToggleStatus = async (examId, currentStatus) => {
    try {
      await adminAPI.toggleExamStatus(examId, currentStatus);
      fetchExams();
      showToast('Exam status updated successfully!', 'success');
    } catch (error) {
      console.error('Toggle failed:', error);
      showToast('Failed to update exam status', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading exams...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="create-btn"
            >
              {showCreateForm ? 'Cancel' : 'Create Exam'}
            </button>
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              Back to Dashboard
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {showCreateForm && (
          <div className="create-section">
            <h2>Create New Exam</h2>
            <form onSubmit={handleCreateExam} className="create-form">
              <div className="form-group">
                <label htmlFor="title">Exam Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={createForm.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter exam title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={createForm.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter exam description (optional)"
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={creating} className="submit-btn">
                  {creating ? 'Creating...' : 'Create Exam'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="exams-section">
          <h2>Exam Management</h2>
          {exams.length === 0 ? (
            <div className="no-exams">
              <p>No exams created yet.</p>
              <button onClick={() => setShowCreateForm(true)} className="create-btn">
                Create First Exam
              </button>
            </div>
          ) : (
            <div className="exams-grid">
              {exams.map(exam => (
                <div key={exam.id} className={`exam-card ${!exam.is_active ? 'inactive' : ''}`}>
                  <div className="exam-header">
                    <h3>{exam.title}</h3>
                    <div className="exam-status">
                      <span className={`status-badge ${exam.is_active ? 'active' : 'inactive'}`}>
                        {exam.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {exam.description && (
                    <p className="exam-description">{exam.description}</p>
                  )}
                  
                  <div className="exam-details">
                    <div className="detail-item">
                      <strong>Created:</strong> {formatDate(exam.created_at)}
                    </div>
                    <div className="detail-item">
                      <strong>Updated:</strong> {formatDate(exam.updated_at)}
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong> {exam.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="exam-actions">
                    <button 
                      onClick={() => navigate(`/admin/exams/${exam.id}/questions`)}
                      className="manage-questions-btn"
                    >
                      Manage Questions
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(exam.id, exam.is_active)}
                      className={`toggle-btn ${exam.is_active ? 'deactivate' : 'activate'}`}
                    >
                      {exam.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => showDeleteModal(exam.id, exam.title)}
                      className="delete-btn"
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

      {/* Custom Delete Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={hideDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Exam</h3>
              <button className="modal-close" onClick={hideDeleteModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the exam:</p>
              <p className="exam-title-highlight">"{deleteModal.examTitle}"</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={hideDeleteModal}>
                Cancel
              </button>
              <button className="modal-delete" onClick={handleDeleteExam}>
                Delete Exam
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

export default AdminDashboard;
