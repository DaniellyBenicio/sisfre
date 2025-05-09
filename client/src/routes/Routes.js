import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/login/Login.js";
import MainScreen from "../pages/MainScreen.js";
import { useNavigate } from 'react-router-dom';

const AppRoutes = ({ isAuthenticated, setAuthenticated }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated]);
  
  
  const handleLogin = () => {
    setAuthenticated(true);
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Navigate to="/MainScreen" />
          )
        }
      />
      
      <Route
        path="/MainScreen"
        element={
          isAuthenticated ? <MainScreen /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
