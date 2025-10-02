import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/adminAPI';
import { getUser, logout } from '../utils/auth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

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

  const handleFileChange = (e) => {
    setUploadForm({
      ...uploadForm,
      file: e.target.files[0]
    });
  };

  const handleInputChange = (e) => {
    setUploadForm({
      ...uploadForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) {
      alert('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);

      await adminAPI.uploadTest(formData);
      setUploadForm({ title: '', description: '', file: null });
      setShowUploadForm(false);
      fetchTests();
      alert('Test uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return;
    }

    try {
      await adminAPI.deleteTest(testId);
      fetchTests();
      alert('Test deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleToggleStatus = async (testId) => {
    try {
      await adminAPI.toggleTestStatus(testId);
      fetchTests();
    } catch (error) {
      console.error('Toggle failed:', error);
      alert('Failed to update test status');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="upload-btn"
            >
              {showUploadForm ? 'Cancel' : 'Upload Test'}
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
        {showUploadForm && (
          <div className="upload-section">
            <h2>Upload New Test</h2>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label htmlFor="title">Test Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={uploadForm.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="file">PDF File *</label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={uploading} className="submit-btn">
                  {uploading ? 'Uploading...' : 'Upload Test'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowUploadForm(false)}
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
              <p>No tests uploaded yet.</p>
              <button onClick={() => setShowUploadForm(true)} className="upload-btn">
                Upload First Test
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
                      <strong>File:</strong> {test.pdf_filename}
                    </div>
                    <div className="detail-item">
                      <strong>Size:</strong> {formatFileSize(test.file_size)}
                    </div>
                    <div className="detail-item">
                      <strong>Uploaded:</strong> {formatDate(test.created_at)}
                    </div>
                    <div className="detail-item">
                      <strong>Parsed:</strong> {test.is_parsed ? 'Yes' : 'No'}
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
                      onClick={() => handleDeleteTest(test.id)}
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
    </div>
  );
};

export default AdminDashboard;
