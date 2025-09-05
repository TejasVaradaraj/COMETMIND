import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProgressDashboard from '../components/ProgressDashboard';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">UTD Math Helper</h2>
          <div className="user-info">
            Welcome, {user?.name || 'Student'}!
          </div>
        </div>

        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link 
                to="/home" 
                className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
              >
                🤖 Question Generator
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                📊 Progress Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="main-content">
        <ProgressDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;