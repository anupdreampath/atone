import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdmin, logout as authLogout, isAuthenticated } from '../utils/auth.js';
import QueryLogs from './QueryLogs.jsx';
import ChangePassword from './ChangePassword.jsx';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    setAdmin(getAdmin());
  }, [navigate]);

  const handleLogout = () => {
    authLogout();
    navigate('/admin/login');
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Atone Admin</h2>
        </div>

        <div className="admin-profile">
          <div className="profile-name">{admin.name}</div>
          <div className="profile-email">{admin.email}</div>
          <div className="profile-role">{admin.role}</div>
          <button
            className="change-password-btn"
            onClick={() => setShowChangePassword(true)}
          >
            🔐 Change Password
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            📋 Query Logs
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <QueryLogs />
      </main>

      {showChangePassword && (
        <ChangePassword
          admin={admin}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
