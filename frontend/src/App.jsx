import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Theme and Layout
import theme from './theme';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Protected Pages
import Dashboard from './pages/Dashboard';
import UserApproval from './pages/admin/UserApproval';

const PrivateRoute = ({ children, allowedRoles }) => {
  const auth = JSON.parse(localStorage.getItem('auth')) || {};

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [auth, setAuth] = useState(JSON.parse(localStorage.getItem('auth')) || {});

  const updateAuth = (newAuth) => {
    setAuth(newAuth);
    localStorage.setItem('auth', JSON.stringify(newAuth));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirect root to /signup */}
          <Route path="/" element={<Navigate to="/signup" replace />} />

          {/* Auth routes without layout */}
          <Route path="/login" element={<Login updateAuth={updateAuth} />} />
          <Route path="/signup" element={<Signup />} />

          {/* Routes inside Layout */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout auth={auth} updateAuth={updateAuth}>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/approve-users" element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout auth={auth} updateAuth={updateAuth}>
                <UserApproval />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={5000} />
    </ThemeProvider>
  );
}

export default App;
