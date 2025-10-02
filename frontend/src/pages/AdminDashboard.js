import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/adminAPI';
import { getUser, logout } from '../utils/auth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, testId: null, testTitle: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 2500);
  };

  const fetchTests = async () => {
    try {
      const response = await adminAPI.getTests();
      setTests(response.data.tests);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
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

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!createForm.title) {
      showToast('Please enter a test title', 'error');
      return;
    }

    setCreating(true);
    try {
      await adminAPI.createTest({
        title: createForm.title,
        description: createForm.description
      });
      setCreateForm({ title: '', description: '' });
      setShowCreateForm(false);
      fetchTests();
      showToast('Test created successfully!', 'success');
    } catch (error) {
      console.error('Create failed:', error);
      showToast('Create failed: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const showDeleteModal = (testId, testTitle) => {
    setDeleteModal({ show: true, testId, testTitle });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ show: false, testId: null, testTitle: '' });
  };

  const handleDeleteTest = async () => {
    try {
      await adminAPI.deleteTest(deleteModal.testId);
      fetchTests();
      hideDeleteModal();
      showToast('Test deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Delete failed: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    }
  };

  const handleToggleStatus = async (testId) => {
    try {
      await adminAPI.toggleTestStatus(testId);
      fetchTests();
      showToast('Test status updated successfully!', 'success');
    } catch (error) {
      console.error('Toggle failed:', error);
      showToast('Failed to update test status', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading tests...</div>
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
              {showCreateForm ? 'Cancel' : 'Create Test'}
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
            <h2>Create New Test</h2>
            <form onSubmit={handleCreateTest} className="create-form">
              <div className="form-group">
                <label htmlFor="title">Test Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={createForm.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter test title"
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
                  placeholder="Enter test description (optional)"
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={creating} className="submit-btn">
                  {creating ? 'Creating...' : 'Create Test'}
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

        <div className="tests-section">
          <h2>Test Management</h2>
          {tests.length === 0 ? (
            <div className="no-tests">
              <p>No tests created yet.</p>
              <button onClick={() => setShowCreateForm(true)} className="create-btn">
                Create First Test
              </button>
            </div>
          ) : (
            <div className="tests-grid">
              {tests.map(test => (
                <div key={test.id} className={`test-card ${!test.is_active ? 'inactive' : ''}`}>
                  <div className="test-header">
                    <h3>{test.title}</h3>
                    <div className="test-status">
                      <span className={`status-badge ${test.is_active ? 'active' : 'inactive'}`}>
                        {test.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {test.description && (
                    <p className="test-description">{test.description}</p>
                  )}
                  
                  <div className="test-details">
                    <div className="detail-item">
                      <strong>Created:</strong> {formatDate(test.created_at)}
                    </div>
                    <div className="detail-item">
                      <strong>Updated:</strong> {formatDate(test.updated_at)}
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong> {test.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="test-actions">
                    <button 
                      onClick={() => handleToggleStatus(test.id)}
                      className={`toggle-btn ${test.is_active ? 'deactivate' : 'activate'}`}
                    >
                      {test.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => showDeleteModal(test.id, test.title)}
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
              <h3>Delete Test</h3>
              <button className="modal-close" onClick={hideDeleteModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the test:</p>
              <p className="test-title-highlight">"{deleteModal.testTitle}"</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={hideDeleteModal}>
                Cancel
              </button>
              <button className="modal-delete" onClick={handleDeleteTest}>
                Delete Test
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
