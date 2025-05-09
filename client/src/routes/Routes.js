import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Login from "../pages/login/Login.js";
import UsersPage from "../pages/admin/users/UsersPage.js"; 

const AppRoutes = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
    navigate('/users');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/users" /> : <Navigate to="/login" />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/users" />}
      />
      <Route
        path="/users"
        element={isAuthenticated ? <UsersPage setAuthenticated={handleLogout} /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default AppRoutes;
