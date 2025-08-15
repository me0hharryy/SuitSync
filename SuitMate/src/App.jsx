import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import Login from './components/Auth/Login';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './components/Dashboard/Dashboard';
import Orders from './components/Orders/Orders';
import Customers from './components/Customers/Customers';
import Workers from './components/Workers/Workers';
import Inventory from './components/Inventory/Inventory';
import Settings from './components/Settings/Settings';
import theme from './theme';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create dynamic theme based on dark mode
  const currentTheme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    setDarkMode(savedDarkMode);
    
    if (token && role === 'admin') {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, role, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userEmail', user.email);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  if (loading) {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100vh"
          bgcolor="background.default"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Box
              width={40}
              height={40}
              borderRadius="50%"
              border="4px solid"
              borderColor="primary.main"
              borderTopColor="transparent"
            />
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <AnimatePresence>
          <Login onLogin={handleLogin} />
        </AnimatePresence>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <DashboardLayout 
          onLogout={handleLogout} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        >
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </DashboardLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
