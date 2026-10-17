import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard';
import HomePage from './pages/public/HomePage';
import MachineListings from './pages/public/MachineListings';
import MachineDetail from './pages/public/MachineDetail';
import PostMachine from './pages/admin/PostMachine';
import CustomCursor from './components/CustomCursor';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <Router>
      <CustomCursor />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/machines" element={<MachineListings />} />
        <Route path="/machines/:id" element={<MachineDetail />} />
        <Route path="/admin/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />

        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/post-machine"
          element={
            isAuthenticated ? (
              <PostMachine />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* Redirect old login to new admin login */}
        <Route path="/login" element={<Navigate to="/admin/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
